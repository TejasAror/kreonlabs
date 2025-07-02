from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import hashlib
import reedsolo
from math import ceil
import numpy as np
import pywt
from PIL import Image
import io
import requests
from supabase import create_client, Client
import os
from datetime import datetime
import uuid
from typing import Optional
from dotenv import load_dotenv
import imagehash

app = FastAPI(title="Reed-Solomon Watermarking API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class WatermarkRequest(BaseModel):
    image_url: HttpUrl
    text: str
    redundancy_percent: int = 50
    Q: int = 85
    margin_blocks: int = 0

class WatermarkResponse(BaseModel):
    success: bool
    watermarked_url: Optional[str] = None
    message: str
    original_size: Optional[tuple] = None
    watermark_bits: Optional[int] = None
    capacity_info: Optional[dict] = None
    hash: Optional[str] = None 
    w_phash: Optional[str] = None
    w_phash_vector: Optional[list[float]] = None

def generate_perceptual_hash(image: Image.Image) -> str:
    """Generate perceptual hash for an image using pHash algorithm."""
    try:
        phash = imagehash.phash(image)
        return str(phash)
    except Exception as e:
        raise ValueError(f"Failed to generate perceptual hash: {str(e)}")
        
def phash_to_vector(phash_str: str) -> list[float]:
    """Convert pHash string to vector format."""
    # Convert hex string to integer, then to 64-bit binary
    phash_int = int(phash_str, 16)
    binary_str = format(phash_int, '064b')
    # Convert each bit to float for vector storage
    return [float(bit) for bit in binary_str]

load_dotenv() 

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "uploads")  # Default to 'uploads'

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def _text_to_sha224_reed_solomon_bits(text: str, redundancy_percent: int = 50) -> dict:
    """Convert text to SHA-224 hash with Reed-Solomon encoding bits."""
    # 1. Compute SHA-224 hash of the data
    hash_obj = hashlib.sha224()
    hash_obj.update(text.encode('utf-8'))
    hash_bytes = hash_obj.digest()
    sha224_hex = hash_bytes.hex()

    # 2. Apply Reed-Solomon encoding with specified redundancy
    msg_len = len(hash_bytes)
    parity_len = max(1, (msg_len * redundancy_percent) // 100)
    
    # Create RS codec with calculated parity length
    rs_codec = reedsolo.RSCodec(parity_len)
    
    # Encode the hash bytes (adds parity bytes)
    encoded_bytes = rs_codec.encode(hash_bytes)
    
    # Verify encoding works by decoding
    try:
        repaired_message, _, _ = rs_codec.decode(encoded_bytes)
        verification_ok = repaired_message == hash_bytes
        if not verification_ok:
            raise ValueError("Reed-Solomon verification failed")
    except Exception as e:
        raise ValueError(f"Reed-Solomon encoding error: {e}")
    
    # 3. Convert encoded bytes to bit list
    bits = []
    for byte in encoded_bytes:
        for i in range(8):
            bits.append((byte >> (7 - i)) & 1)
    
    return {
        'bits': bits,
        'sha224_hash': sha224_hex,  # Hex string instead of base64
        'required_bits': len(bits)
    }

def _calculate_image_capacity(img_size: tuple, margin_blocks: int = 0) -> dict:
    """Calculate watermarking capacity for any image size."""
    h, w = img_size
    
    # Simulate wavelet transform to get LL subband size
    ll_h = (h + 1) // 2
    ll_w = (w + 1) // 2
    
    # Calculate 4x4 block grid
    total_blocks_r = ll_h // 4
    total_blocks_c = ll_w // 4
    
    # Account for margin blocks
    usable_blocks_r = max(1, total_blocks_r - 2 * margin_blocks)
    usable_blocks_c = max(1, total_blocks_c - 2 * margin_blocks)
    total_capacity = usable_blocks_r * usable_blocks_c
    
    return {
        'image_size': img_size,
        'll_size': (ll_h, ll_w),
        'total_blocks': total_blocks_r * total_blocks_c,
        'usable_blocks': total_capacity,
        'capacity_bits': total_capacity
    }

def _validate_image_size(pil_img: Image.Image, required_bits: int, margin_blocks: int = 0) -> bool:
    """Validate if image is large enough for watermarking."""
    capacity_info = _calculate_image_capacity(pil_img.size, margin_blocks)
    return capacity_info['capacity_bits'] >= required_bits

def _make_wm_matrix(bits: list[int], rows: int, cols: int) -> np.ndarray:
    """Tile (or truncate) bits to exactly rows×cols and reshape to 0/255 matrix."""
    total = rows * cols
    if len(bits) > total:
        used_bits = bits[:total]
    else:
        reps_needed = ceil(total / len(bits))
        used_bits = (bits * reps_needed)[:total]
    
    return np.array([255 if b else 0 for b in used_bits], np.uint8).reshape(rows, cols)

def _embed_LL(LL, wm, Q=85, margin_blocks=0):
    """Embed watermark into LL subband using SVD."""
    br, bc = wm.shape
    for i in range(br):
        for j in range(bc):
            y = (i + margin_blocks) * 4
            x = (j + margin_blocks) * 4
            block = LL[y:y+4, x:x+4]
            u, s, v = np.linalg.svd(block.astype(np.float32))
            smax = int(s[0])
            a = smax % Q
            if wm[i, j] == 0:
                smax = smax - a + (Q//4) if a < 3*Q/4 else smax - a + 5*(Q//4)
            else:
                smax = smax - a - (Q//4) if a < Q/4 else smax - a + 3*(Q//4)
            s[0] = smax
            LL[y:y+4, x:x+4] = u @ np.diag(s) @ v
    return LL

def watermark_image_sha224_rs(pil_img: Image.Image, text: str, 
                             redundancy_percent: int = 50,
                             Q: int = 85, margin_blocks: int = 0) -> tuple[Image.Image, dict]:
    """
    Embed SHA-224 hash with Reed-Solomon encoding into image.
    
    Returns:
        tuple: (watermarked_image, info_dict)
    """
    # Generate SHA-224 + Reed-Solomon encoded bits
    hash_result = _text_to_sha224_reed_solomon_bits(text, redundancy_percent)
    wm_bits = hash_result['bits']
    required_bits = hash_result['required_bits']
    sha224_hash = hash_result['sha224_hash']
    
    # Check image capacity
    capacity_info = _calculate_image_capacity(pil_img.size, margin_blocks)
    
    # Validate capacity
    if not _validate_image_size(pil_img, required_bits, margin_blocks):
        raise ValueError(f"Image {pil_img.size} too small for watermarking. "
                        f"Need {required_bits} bits, have {capacity_info['capacity_bits']} bits available.")
    
    # Split to YCbCr and get Y channel
    ycbcr = pil_img.convert("YCbCr")
    y, cb, cr = ycbcr.split()
    y_np = np.array(y)

    # Calculate actual embedding dimensions
    LL, _ = pywt.dwt2(y_np, "haar")
    total_blocks_r = LL.shape[0] // 4
    total_blocks_c = LL.shape[1] // 4
    br, bc = total_blocks_r - 2 * margin_blocks, total_blocks_c - 2 * margin_blocks
    
    # Create watermark matrix
    wm = _make_wm_matrix(wm_bits, br, bc)

    # Perform DWT and embed watermark
    LL, (LH, HL, HH) = pywt.dwt2(y_np, "haar")
    LL_marked = _embed_LL(LL.copy(), wm, Q, margin_blocks)
    
    # Reconstruct image
    y_marked = pywt.idwt2((LL_marked, (LH, HL, HH)), "haar")
    h, w = y_np.shape
    y_marked = np.clip(y_marked[:h, :w], 0, 255).astype(np.uint8)
    
    # Convert back to RGB
    marked_img = Image.merge("YCbCr", (Image.fromarray(y_marked, "L"), cb, cr)).convert("RGB")
    
    # Prepare info
    info = {
        'required_bits': required_bits,
        'capacity_info': capacity_info,
        'redundancy': (br * bc) / required_bits if required_bits > 0 else 0,
        'watermark_matrix_size': (br, bc),
        'sha224_hash': sha224_hash  # Include the base64 hash
    }
    
    return marked_img, info


def download_image_from_url(url: str) -> Image.Image:
    """Download image from URL and return PIL Image."""
    try:
        response = requests.get(str(url), timeout=30)
        response.raise_for_status()
        
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        return image
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

def extract_filename_from_url(url: str) -> str:
    """Extract filename with UUID and extension from URL."""
    try:
        # Parse the URL to get the path
        from urllib.parse import urlparse, unquote
        parsed_url = urlparse(str(url))
        path = unquote(parsed_url.path)
        
        # Extract filename from path (last part after /)
        filename = path.split('/')[-1]
        
        # Validate it looks like uuid.extension
        if '.' in filename:
            name_part, ext_part = filename.rsplit('.', 1)
            # Basic UUID format check (36 chars with hyphens)
            if len(name_part) >= 32:  # UUID without hyphens is 32 chars
                return filename
        
        # If extraction fails, generate a fallback filename
        import uuid
        return f"{uuid.uuid4()}.jpg"
        
    except Exception:
        # Fallback if URL parsing fails
        import uuid
        return f"{uuid.uuid4()}.jpg"

def upload_image_to_supabase(image: Image.Image, filename: str) -> str:
    """Upload image to Supabase storage in watermarked folder and return public URL."""
    try:
        # Convert PIL image to bytes
        img_byte_arr = io.BytesIO()
        
        # Determine format based on file extension
        file_ext = filename.lower().split('.')[-1]
        if file_ext in ['jpg', 'jpeg']:
            image.save(img_byte_arr, format='JPEG', quality=100)
            content_type = "image/jpeg"
        elif file_ext == 'png':
            image.save(img_byte_arr, format='PNG')
            content_type = "image/png"
        elif file_ext == 'webp':
            image.save(img_byte_arr, format='WEBP', quality=100)
            content_type = "image/webp"
        else:
            # Default to JPEG for unknown extensions
            image.save(img_byte_arr, format='JPEG', quality=100)
            content_type = "image/jpeg"
            
        img_byte_arr.seek(0)
        
        # Create path: watermarked/filename
        file_path = f"watermarked/{filename}"
        
        # Upload to Supabase uploads bucket
        try:
            response = supabase.storage.from_(SUPABASE_BUCKET).upload(
                file_path, 
                img_byte_arr.getvalue(),
                file_options={"content-type": content_type, "upsert": "true"}
            )
    # If we get here, upload was successful
        except Exception as upload_error:
            raise Exception(f"Upload failed: {str(upload_error)}")
        
        # Get public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
        
        return public_url
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@app.post("/watermark", response_model=WatermarkResponse)
async def watermark_image(request: WatermarkRequest):
    """
    Watermark an image from a URL and save to Supabase storage.
    
    The image URL should point to an image in: uploads/uploads/uuid.extension
    The watermarked image will be saved to: uploads/watermarked/uuid.extension
    
    Parameters:
    - image_url: URL of the source image (should contain UUID filename)
    - text: Text to watermark
    - redundancy_percent: Reed-Solomon redundancy percentage (default 50%)
    - Q: Quantization parameter for SVD embedding (default 85)
    - margin_blocks: Margin blocks to avoid edge effects (default 0)
    """
    try:
        # Extract filename from URL
        original_filename = extract_filename_from_url(request.image_url)
        
        # Download the image
        original_image = download_image_from_url(request.image_url)

        # Apply watermarking
        watermarked_image, info = watermark_image_sha224_rs(
            original_image, 
            request.text,
            request.redundancy_percent,
            request.Q,
            request.margin_blocks
        )
        # Generate perceptual hash for watermarked image
        watermark_phash = generate_perceptual_hash(watermarked_image)

        # Convert pHashes to vectors
        watermarked_vector = phash_to_vector(watermark_phash)

        # Upload to Supabase with same filename in watermarked folder
        watermarked_url = upload_image_to_supabase(
            watermarked_image, 
            original_filename
        )
        
        return WatermarkResponse(
            success=True,
            watermarked_url=watermarked_url,
            message=f"Image successfully watermarked and saved to watermarked/{original_filename}",
            original_size=original_image.size,
            watermark_bits=info['required_bits'],
            capacity_info=info['capacity_info'],
            hash=info['sha224_hash'],
            w_phash=watermark_phash,
            w_phash_vector=watermarked_vector
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Reed-Solomon Watermarking API"}

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Reed-Solomon Watermarking API",
        "version": "1.0.0",
        "description": "API for watermarking images with SHA-224 hash and Reed-Solomon error correction",
        "endpoints": {
            "POST /watermark": "Watermark an image from URL",
            "GET /health": "Health check",
            "GET /docs": "API documentation"
        }
    }

# Example usage and environment setup info
"""
Environment Variables Required:
- SUPABASE_URL: Your Supabase project URL
- SUPABASE_KEY: Your Supabase service key
- SUPABASE_BUCKET: Storage bucket name (optional, defaults to 'uploads')

Bucket Structure:
- Bucket: uploads
  - Folder: uploads (original images)
    - Images: uuid.extension
  - Folder: watermarked (watermarked images)
    - Images: uuid.extension (same names as originals)

Example request:
POST /watermark
{
    "image_url": "https://your-supabase-url.com/storage/v1/object/public/uploads/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
    "text": "Owner: Abhinav Singh\\nClaim: Saksham Saxena 20%\\nClaim: Tejas Arora 30%",
    "redundancy_percent": 50,
    "Q": 85,
    "margin_blocks": 0
}

Response:
{
    "success": true,
    "watermarked_url": "https://your-supabase-url.com/storage/v1/object/public/uploads/watermarked/550e8400-e29b-41d4-a716-446655440000.jpg",
    "message": "Image successfully watermarked and saved to watermarked/550e8400-e29b-41d4-a716-446655440000.jpg",
    "original_size": [1920, 1080],
    "watermark_bits": 336,
    "capacity_info": {...}
}

To run:
pip install fastapi uvicorn supabase pillow numpy pywavelets reedsolo requests
uvicorn main:app --reload
"""