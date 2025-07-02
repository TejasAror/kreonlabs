# watermark_verify.py
import hashlib
import reedsolo
import numpy as np
import pywt
from PIL import Image
import os
import glob
from typing import Dict, List, Optional
import json
from datetime import datetime
import requests
import imagehash

def _extract_LL(LL, rows, cols, Q=85, margin_blocks=0):
    """Extract watermark from LL subband using SVD."""
    extracted_wm = np.zeros((rows, cols), dtype=np.uint8)
    
    for i in range(rows):
        for j in range(cols):
            y = (i + margin_blocks) * 4
            x = (j + margin_blocks) * 4
            block = LL[y:y+4, x:x+4]
            u, s, v = np.linalg.svd(block.astype(np.float32))
            smax = int(s[0])
            a = smax % Q
            
            if a >= Q/2:
                extracted_wm[i, j] = 255  # bit 1
            else:
                extracted_wm[i, j] = 0    # bit 0
    
    return extracted_wm

def _wm_matrix_to_bits(wm_matrix: np.ndarray) -> List[int]:
    """Convert watermark matrix back to bit list."""
    bits = []
    for row in wm_matrix:
        for val in row:
            bits.append(1 if val > 127 else 0)
    return bits

def _extract_hash_from_bits(bits: List[int], redundancy_percent: int = 50, verbose: bool = True) -> Optional[str]:
    """Extract SHA-224 hash from Reed-Solomon encoded bits"""
    hash_len = 28  # SHA-224 produces 28 bytes
    parity_len = max(1, (hash_len * redundancy_percent) // 100)
    expected_encoded_len = hash_len + parity_len
    expected_bits = expected_encoded_len * 8
    
    if verbose:
        print(f"🔍 Hash extraction:")
        print(f"   Expected bits: {expected_bits}")
        print(f"   Available bits: {len(bits)}")
    
    if len(bits) < expected_bits:
        if verbose:
            print(f"   ❌ Insufficient bits for hash extraction")
        return None
    
    # Take required bits and convert to bytes
    used_bits = bits[:expected_bits]
    extracted_bytes = bytearray()
    
    for i in range(0, len(used_bits), 8):
        if i + 8 <= len(used_bits):
            byte_bits = used_bits[i:i+8]
            byte_val = 0
            for j, bit in enumerate(byte_bits):
                byte_val |= (bit << (7 - j))
            extracted_bytes.append(byte_val)
    
    # Apply Reed-Solomon decoding
    try:
        rs_codec = reedsolo.RSCodec(parity_len)
        decoded_hash, _, _ = rs_codec.decode(extracted_bytes)
        return decoded_hash.hex()
    except Exception as e:
        if verbose:
            print(f"   ❌ Reed-Solomon decoding failed: {e}")
        return None

def extract_watermark_hash(pil_img: Image.Image, Q: int = 85, margin_blocks: int = 0, 
                          redundancy_percent: int = 50, verbose: bool = True) -> Optional[str]:
    """Extract watermark hash from image"""
    
    if verbose:
        print(f"🔍 Extracting watermark from {pil_img.size} image")
    
    # Convert to YCbCr and extract Y channel
    ycbcr = pil_img.convert("YCbCr")
    y, _, _ = ycbcr.split()
    y_np = np.array(y)
    
    # Perform DWT
    LL, (LH, HL, HH) = pywt.dwt2(y_np, "haar")
    
    # Calculate extraction dimensions
    total_blocks_r = LL.shape[0] // 4
    total_blocks_c = LL.shape[1] // 4
    br, bc = total_blocks_r - 2 * margin_blocks, total_blocks_c - 2 * margin_blocks
    
    if verbose:
        print(f"   Extraction matrix: {br}×{bc}")
    
    # Extract watermark matrix and convert to bits
    extracted_wm = _extract_LL(LL, br, bc, Q, margin_blocks)
    extracted_bits = _wm_matrix_to_bits(extracted_wm)
    
    # Extract hash from bits
    extracted_hash = _extract_hash_from_bits(extracted_bits, redundancy_percent, verbose)
    
    return extracted_hash

def generate_phash(pil_img: Image.Image, verbose: bool = True) -> Optional[str]:
    """Generate perceptual hash (pHash) for an image using imagehash library"""
    
    if verbose:
        print(f"🔍 Generating pHash for {pil_img.size} image")
    
    try:
        # Generate pHash using imagehash library
        phash = imagehash.phash(pil_img)
        phash_str = str(phash)
        
        if verbose:
            print(f"   Generated pHash: {phash_str}")
        
        return phash_str
    except Exception as e:
        if verbose:
            print(f"   ❌ pHash generation failed: {e}")
        return None

def verify_watermark_with_api(extracted_hash: str, job_id: str, verbose: bool = True) -> Dict:
    """Verify extracted watermark hash using the API"""
    
    if verbose:
        print(f"🔍 Verifying hash with API: {extracted_hash}")
    
    try:
        url = "https://scanner-server-ns7h.onrender.com/hash-search"
        payload = {
            "jobID": job_id,
            "hash": extracted_hash
        }
        headers = {"Content-Type": "application/json"}
    
        response = requests.get(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            api_data = response.json()
            
            if api_data and len(api_data) > 0:
                # Asset found
                asset_data = api_data[0]  # Take first match
                if verbose:
                    print(f"✅ Asset watermark verified via API!")
                    print(f"   Asset ID: {asset_data.get('assetid', 'Unknown')}")
                    print(f"   IP Asset ID: {asset_data.get('ipassetid', 'Unknown')}")
                    print(f"   Wallet ID: {asset_data.get('walletid', 'Unknown')}")
                    print(f"   Public URL: {asset_data.get('publicurl', 'N/A')}")
                    print(f"   pHash: {asset_data.get('phash', 'N/A')}")
                
                return {
                    'verified': True,
                    'asset_data': asset_data,
                    'extracted_hash': extracted_hash,
                    'match_type': 'hash',
                    'source': 'api'
                }
            else:
                # No matches found
                if verbose:
                    print(f"❌ Hash not found via API")
                
                return {
                    'verified': False,
                    'asset_data': None,
                    'extracted_hash': extracted_hash,
                    'error': 'Hash not found via API',
                    'match_type': None,
                    'source': 'api'
                }
        else:
            # API error
            if verbose:
                print(f"❌ API request failed with status code: {response.status_code}")
            
            return {
                'verified': False,
                'asset_data': None,
                'extracted_hash': extracted_hash,
                'error': f'API request failed: {response.status_code}',
                'match_type': None,
                'source': 'api'
            }
    
    except Exception as e:
        if verbose:
            print(f"❌ API verification error: {e}")
        
        return {
            'verified': False,
            'asset_data': None,
            'extracted_hash': extracted_hash,
            'error': str(e),
            'match_type': None,
            'source': 'api'
        }

def verify_phash_with_api(phash: str, job_id: str, verbose: bool = True) -> Dict:
    """Verify perceptual hash using the similarity-search API with 85% minimum similarity threshold"""
    
    if verbose:
        print(f"🔍 Verifying pHash with API: {phash}")
    
    try:
        url = "https://scanner-server-ns7h.onrender.com/similarity-search"
        payload = {
            "jobID": job_id,
            "pHash": phash
        }
        headers = {"Content-Type": "application/json"}
    
        response = requests.get(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            api_data = response.json()
            
            if api_data and len(api_data) > 0:
                # Filter results to only include matches with similarity > 85%
                high_similarity_matches = [
                    match for match in api_data 
                    if match.get('similarity_percent', 0) > 85
                ]
                
                if high_similarity_matches:
                    # Take the best match (highest similarity)
                    best_match = max(high_similarity_matches, key=lambda x: x.get('similarity_percent', 0))
                    
                    if verbose:
                        print(f"✅ High similarity asset found via pHash!")
                        print(f"   Asset ID: {best_match.get('assetid', 'Unknown')}")
                        print(f"   IP Asset ID: {best_match.get('ipassetid', 'Unknown')}")
                        print(f"   Wallet ID: {best_match.get('walletid', 'Unknown')}")
                        print(f"   Public URL: {best_match.get('publicurl', 'N/A')}")
                        print(f"   Distance: {best_match.get('distance', 'N/A')}")
                        print(f"   Similarity: {best_match.get('similarity_percent', 'N/A')}%")
                        
                        # Show how many matches were filtered out
                        filtered_count = len(api_data) - len(high_similarity_matches)
                        if filtered_count > 0:
                            print(f"   📊 Filtered out {filtered_count} matches with similarity ≤ 85%")
                    
                    return {
                        'verified': True,
                        'asset_data': best_match,
                        'extracted_hash': phash,
                        'match_type': 'phash',
                        'source': 'api',
                        'similarity_data': {
                            'distance': best_match.get('distance'),
                            'similarity_percent': best_match.get('similarity_percent'),
                            'all_matches': api_data,
                            'high_similarity_matches': high_similarity_matches,
                            'threshold_used': 85
                        }
                    }
                else:
                    # Found matches but none above 85% threshold
                    if verbose:
                        best_available = max(api_data, key=lambda x: x.get('similarity_percent', 0))
                        best_similarity = best_available.get('similarity_percent', 0)
                        print(f"❌ No high similarity matches found via pHash")
                        print(f"   Best available similarity: {best_similarity}% (below 85% threshold)")
                        print(f"   Total matches found: {len(api_data)}")
                    
                    return {
                        'verified': False,
                        'asset_data': None,
                        'extracted_hash': phash,
                        'error': f'No matches above 85% similarity threshold (best: {best_similarity}%)',
                        'match_type': None,
                        'source': 'api',
                        'similarity_data': {
                            'threshold_used': 85,
                            'best_similarity_found': best_similarity,
                            'total_matches_found': len(api_data)
                        }
                    }
            else:
                # No similar assets found at all
                if verbose:
                    print(f"❌ No similar assets found via pHash")
                
                return {
                    'verified': False,
                    'asset_data': None,
                    'extracted_hash': phash,
                    'error': 'No similar assets found via pHash',
                    'match_type': None,
                    'source': 'api'
                }
        else:
            # API error
            if verbose:
                print(f"❌ pHash API request failed with status code: {response.status_code}")
            
            return {
                'verified': False,
                'asset_data': None,
                'extracted_hash': phash,
                'error': f'pHash API request failed: {response.status_code}',
                'match_type': None,
                'source': 'api'
            }
    
    except Exception as e:
        if verbose:
            print(f"❌ pHash API verification error: {e}")
        
        return {
            'verified': False,
            'asset_data': None,
            'extracted_hash': phash,
            'error': str(e),
            'match_type': None,
            'source': 'api'
        }

def process_extracted_images(image_directory: str = "twitter_images", 
                           job_id: str = None, verbose: bool = True) -> List[Dict]:
    """Process all extracted images and verify watermarks via API"""
    
    if not job_id:
        print("❌ Job ID is required for API verification")
        return []
    
    # Find all image files in subdirectories
    image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.tiff', '*.webp']
    found_images = []
    
    print(f"🔍 Searching for images in: {os.path.abspath(image_directory)}")
    
    # Search in all subdirectories
    for root, dirs, files in os.walk(image_directory):
        for ext in image_extensions:
            pattern = os.path.join(root, ext)
            found_images.extend(glob.glob(pattern))
            # Also check uppercase
            pattern_upper = os.path.join(root, ext.upper())
            found_images.extend(glob.glob(pattern_upper))
    
    found_images = list(set(found_images))  # Remove duplicates
    
    if verbose:
        print(f"📁 Found {len(found_images)} images to process")
    
    results = []
    verified_count = 0
    
    for i, image_path in enumerate(found_images):
        if verbose:
            print(f"\n📷 Processing image {i+1}/{len(found_images)}: {os.path.basename(image_path)}")
        
        try:
            # Load image
            img = Image.open(image_path)
            
            # Try to load metadata file to get source URL
            metadata_file = image_path.replace(os.path.splitext(image_path)[1], '_metadata.json')
            metadata = {}
            source_url = None

            if os.path.exists(metadata_file):
                try:
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                        source_url = metadata.get('source_url')
                except Exception as e:
                    if verbose:
                        print(f"⚠️  Could not load metadata for {os.path.basename(image_path)}: {e}")
                    metadata = {}

            
            # First, try watermark hash extraction
            extracted_hash = extract_watermark_hash(img, verbose=verbose)
            verification_result = None
            
            if extracted_hash:
                # Verify with hash API
                verification_result = verify_watermark_with_api(extracted_hash, job_id, verbose)
            
            # If hash verification failed, try pHash verification
            if not verification_result or not verification_result['verified']:
                if verbose:
                    print(f"   🔄 Hash verification failed, trying pHash verification...")
                
                # Generate pHash
                phash = generate_phash(img, verbose=verbose)
                
                if phash:
                    # Verify with pHash API
                    phash_result = verify_phash_with_api(phash, job_id, verbose)
                    
                    # Use pHash result if it's verified, otherwise keep original result
                    if phash_result['verified']:
                        verification_result = phash_result
                    elif not verification_result:
                        verification_result = phash_result
            
            if verification_result:
                result = {
                    'image_path': image_path,
                    'image_name': os.path.basename(image_path),
                    'source_url': source_url,
                    'metadata': metadata,  # Add this line
                    'extracted_hash': extracted_hash,
                    'verification': verification_result,
                    'processed_at': datetime.now().isoformat()
                }
                
                if verification_result['verified']:
                    verified_count += 1
            else:
                result = {
                    'image_path': image_path,
                    'image_name': os.path.basename(image_path),
                    'source_url': source_url,
                    'metadata': metadata,  # Add this line
                    'extracted_hash': None,
                    'verification': {'verified': False, 'error': 'Failed to extract hash or pHash', 'source': 'local'},
                    'processed_at': datetime.now().isoformat()
                }

            
            results.append(result)
            
        except Exception as e:
            if verbose:
                print(f"❌ Error processing {image_path}: {e}")
            
            results.append({
                'image_path': image_path,
                'image_name': os.path.basename(image_path),
                'source_url': None,
                'metadata': {},  # Add this line
                'extracted_hash': None,
                'verification': {'verified': False, 'error': str(e), 'source': 'local'},
                'processed_at': datetime.now().isoformat()
            })
    
    # Summary
    if verbose:
        print(f"\n🎯 ASSET VERIFICATION SUMMARY:")
        print(f"   Total images processed: {len(found_images)}")
        print(f"   Successfully verified assets: {verified_count}")
        print(f"   Failed/Unverified: {len(found_images) - verified_count}")
    
    return results

def save_verification_results(results: List[Dict], output_file: str = "asset_verification_results.json"):
    """Save verification results to JSON file"""
    try:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"📄 Results saved to: {output_file}")
    except Exception as e:
        print(f"❌ Error saving results: {e}")

def generate_detailed_report(results: List[Dict]):
    """Generate detailed verification report"""
    verified_results = [r for r in results if r['verification']['verified']]
    
    print(f"\n📊 DETAILED ASSET VERIFICATION REPORT")
    print(f"=" * 60)
    
    if verified_results:
        print(f"✅ VERIFIED ASSETS ({len(verified_results)}):")
        print(f"-" * 40)
        
        for result in verified_results:
            asset_data = result['verification']['asset_data']
            match_type = result['verification'].get('match_type', 'unknown')
            
            print(f"📷 Image: {result['image_name']}")
            print(f"   🔍 Match Type: {match_type.upper()}")
            print(f"   🆔 Asset ID: {asset_data.get('assetid', 'N/A')}")
            print(f"   🔗 IP Asset ID: {asset_data.get('ipassetid', 'N/A')}")
            print(f"   💰 Wallet ID: {asset_data.get('walletid', 'N/A')}")
            print(f"   🔗 Public URL: {asset_data.get('publicurl', 'N/A')}")
            print(f"   🔗 Source URL: {result.get('source_url', 'N/A')}")
            
            if match_type == 'phash':
                similarity_data = result['verification'].get('similarity_data', {})
                print(f"   📊 Distance: {similarity_data.get('distance', 'N/A')}")
                print(f"   📊 Similarity: {similarity_data.get('similarity_percent', 'N/A')}%")
            
            print(f"   🔐 Hash: {result['extracted_hash'][:16] if result['extracted_hash'] else 'N/A'}...")
            print()
    
    unverified_count = len(results) - len(verified_results)
    if unverified_count > 0:
        print(f"❌ UNVERIFIED IMAGES ({unverified_count}):")
        print(f"-" * 40)
        
        unverified_results = [r for r in results if not r['verification']['verified']]
        for result in unverified_results[:5]:  # Show first 5
            error = result['verification'].get('error', 'Unknown error')
            print(f"📷 {result['image_name']}: {error}")
        
        if unverified_count > 5:
            print(f"   ... and {unverified_count - 5} more")

def main():
    """Main function for asset watermark verification"""
    print("=== ASSET WATERMARK VERIFICATION (API MODE WITH PHASH) ===\n")
    
    # Get job ID from user or environment
    job_id = input("Enter Job ID: ").strip()
    if not job_id:
        print("❌ Job ID is required for API verification")
        return
    
    # Process images from both Twitter and Reddit directories
    all_results = []
    
    for directory in ["twitter_images", "reddit_images"]:
        if os.path.exists(directory):
            print(f"\n🔍 Processing {directory}...")
            results = process_extracted_images(directory, job_id, verbose=True)
            all_results.extend(results)
        else:
            print(f"⚠️  Directory {directory} not found")
    
    if all_results:
        # Save results
        save_verification_results(all_results)
        
        # Generate detailed report
        generate_detailed_report(all_results)
        
        # Print final summary
        verified_images = [r for r in all_results if r['verification']['verified']]
        hash_matches = [r for r in verified_images if r['verification'].get('match_type') == 'hash']
        phash_matches = [r for r in verified_images if r['verification'].get('match_type') == 'phash']
        
        print(f"\n🎉 FINAL ASSET VERIFICATION RESULTS:")
        print(f"   Total images: {len(all_results)}")
        print(f"   Verified assets: {len(verified_images)}")
        print(f"   Hash matches: {len(hash_matches)}")
        print(f"   pHash matches: {len(phash_matches)}")
        print(f"   Unverified: {len(all_results) - len(verified_images)}")
        
        if verified_images:
            print(f"\n🔐 SECURITY STATUS: {len(verified_images)} images contain registered asset watermarks")
        else:
            print(f"\n⚠️  SECURITY WARNING: No registered asset watermarks found")
    else:
        print("❌ No images found to process")

if __name__ == "__main__":
    main()
