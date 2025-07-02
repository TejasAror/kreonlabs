import asyncio
import random
import os
import requests
import warnings
import time
import json
from datetime import datetime

warnings.filterwarnings("ignore", category=ResourceWarning)

class TwitterImageScraper:
    def __init__(self):
        self.session = requests.Session()
        self.downloaded_images = set()

    def convert_to_original_url(self, url):
        """Convert any Twitter image URL to original quality"""
        
        # Remove ':thumb' if present
        if ':thumb' in url:
            url = url.replace(':thumb', '')
        
        # Remove any existing quality/format parameters
        base_url = url.split('?')[0]
        
        # Add original quality parameter
        original_url = base_url + '?name=orig'
        
        return original_url

    def filter_original_images_improved(self, image_urls):
        """Improved filtering to capture all original quality images"""
        
        original_urls = set()
        
        print("🔍 Processing all found URLs...")
        
        for url in image_urls:
            # Skip profile images and banners
            if any(skip in url for skip in ['profile_images', 'profile_banners']):
                print(f"⌐ Skipping profile image: {url}")
                continue
            
            # Only process Twitter media URLs
            if 'pbs.twimg.com/media/' in url:
                original_url = self.convert_to_original_url(url)
                original_urls.add(original_url)
                print(f"✅ Converted to original: {original_url}")
            else:
                print(f"⌐ Not a media URL: {url}")
        
        return list(original_urls)

    def save_image_with_metadata(self, image_url, tweet_url, filename, filepath):
        """Save image metadata for later use"""
        metadata = {
            'image_file': filename,
            'source_url': tweet_url,
            'image_url': image_url,
            'timestamp': datetime.now().isoformat(),
            'platform': 'twitter'
        }
        
        # Save metadata file alongside image
        metadata_file = filepath.replace(os.path.splitext(filepath)[1], '_metadata.json')
        try:
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
        except Exception as e:
            print(f"⚠️ Could not save metadata: {e}")

    async def download_original_images(self, image_urls, username, page=None):
        """Download original quality images with proper session and metadata"""
        
        download_dir = "twitter_images"
        if not os.path.exists(download_dir):
            os.makedirs(download_dir)
        
        user_dir = os.path.join(download_dir, username)
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
        
        # Headers for original image download
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://xcancel.com/',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site'
        }
        
        downloaded_count = 0
        
        print(f"\n🔥 Starting download of {len(image_urls)} original images...")
        
        for i, url in enumerate(image_urls):
            try:
                print(f"\nDownloading image {i+1}/{len(image_urls)}")
                print(f"URL: {url}")
                
                response = self.session.get(url, headers=headers, timeout=30, stream=True)
                
                if response.status_code == 200:
                    # Determine file extension
                    file_extension = 'jpg'
                    if '.' in url:
                        ext = url.split('.')[-1].split('?')[0]
                        if ext.lower() in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                            file_extension = ext.lower()
                    
                    timestamp = int(time.time())
                    filename = f"{username}_original_{i+1}_{timestamp}.{file_extension}"
                    filepath = os.path.join(user_dir, filename)
                    
                    with open(filepath, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                    
                    file_size = os.path.getsize(filepath)
                    print(f"✅ Downloaded: {filename} ({file_size:,} bytes)")
                    
                    # Try to find the tweet URL for this image
                    tweet_url = f"https://x.com/{username}"  # Default fallback
                    if page:
                        try:
                            # Try to find tweet links on the page
                            tweet_links = await page.locator('a[href*="/status/"]').all()
                            if tweet_links and i < len(tweet_links):
                                tweet_href = await tweet_links[i].get_attribute('href')
                                if tweet_href:
                                    if tweet_href.startswith('/'):
                                        tweet_url = f"https://x.com{tweet_href}"
                                    else:
                                        tweet_url = tweet_href
                        except:
                            pass  # Use fallback URL
                    
                    # Save metadata
                    self.save_image_with_metadata(url, tweet_url, filename, filepath)
                    
                    downloaded_count += 1
                    self.downloaded_images.add(url)
                else:
                    print(f"⌐ Failed to download: HTTP {response.status_code}")
                
                # Respectful delay between downloads
                await asyncio.sleep(random.uniform(2, 4))
                
            except Exception as e:
                print(f"⌐ Error downloading {url}: {e}")
        
        print(f"\n{'='*60}")
        print(f"TWITTER DOWNLOAD COMPLETE")
        print(f"Downloaded: {downloaded_count}/{len(image_urls)} original images")
        print(f"Location: {user_dir}")
        print(f"{'='*60}")
        
        return downloaded_count

    async def safe_get_text(self, page, method_name):
        """Safely get text content with empty string protection"""
        try:
            if method_name == 'title':
                result = await page.title()
            elif method_name == 'content':
                result = await page.content()
            else:
                result = ""
            
            return str(result) if result else ""
            
        except Exception as e:
            print(f"⚠️ Error getting {method_name}: {e}")
            return ""

    async def detect_xcancel_verification(self, page):
        """Detect X Cancelled verification with safe string handling"""
        try:
            verification_indicators = [
                'text="X Cancelled | Verifying your request"',
                'text="Sorry this pages exist in order to keep the service usable"',
                'text="This process is automatic"',
                'div[id="status"]',
                'span[id="countdowntimer"]'
            ]
            
            for indicator in verification_indicators:
                try:
                    if await page.locator(indicator).count() > 0:
                        print(f"🚨 X Cancelled verification detected: {indicator}")
                        return True
                except Exception:
                    continue
            
            title = await self.safe_get_text(page, 'title')
            if title and "verifying your request" in title.lower():
                print(f"🚨 X Cancelled verification detected in title")
                return True
            
            content = await self.safe_get_text(page, 'content')
            if content and len(content) > 0:
                verification_texts = [
                    "verify you are human", 
                    "complete the security check",
                    "automation tools", 
                    "countdowntimer"
                ]
                
                content_lower = content.lower()
                for text in verification_texts:
                    if text in content_lower:
                        print(f"🚨 X Cancelled verification detected in content")
                        return True
                        
            return False
            
        except Exception as e:
            print(f"⚠️ Error detecting verification: {e}")
            return False

    async def wait_for_verification_completion(self, page):
        """Wait for verification with improved error handling"""
        print("🔄 X Cancelled verification page detected!")
        print("📋 Waiting for automatic verification to complete...")
        
        max_wait_time = 60
        check_interval = 3
        elapsed_time = 0
        
        while elapsed_time < max_wait_time:
            try:
                if not await self.detect_xcancel_verification(page):
                    print("✅ Verification completed automatically!")
                    await asyncio.sleep(3)
                    return True
                
                try:
                    countdown_elements = await page.locator('#countdowntimer').all()
                    if countdown_elements:
                        countdown_text = await countdown_elements[0].text_content()
                        if countdown_text:
                            print(f"⏳ Countdown: {countdown_text}")
                except Exception:
                    pass
                
                print(f"⏳ Waiting... {elapsed_time}/{max_wait_time} seconds")
                await asyncio.sleep(check_interval)
                elapsed_time += check_interval
                
            except Exception as e:
                print(f"⚠️ Error during verification wait: {e}")
                break
        
        if elapsed_time >= max_wait_time:
            print("⚠️ Automatic verification taking longer than expected")
            print("🔴 Please check the browser window and complete verification manually")
            input("⏳ Press Enter after verification is complete: ")
        
        return True

    async def scrape_with_camoufox(self, username, max_images=15):
        """Enhanced scraping with improved image extraction and URL validation"""
        try:
            from camoufox.async_api import AsyncCamoufox
            
            # **FIX: Validate username parameter**
            if not username or len(username.strip()) == 0:
                print("❌ Invalid username provided")
                return 0
            
            username = username.strip()  # Clean the username
            print(f"🔍 Processing username: '{username}'")
            
            async with AsyncCamoufox(
                headless=True,
                os='windows',
                i_know_what_im_doing=True,
                args=[]
            ) as browser:
                page = await browser.new_page()
                
                # Set realistic viewport
                await page.set_viewport_size({"width": 1366, "height": 768})
                
                # Basic stealth
                await page.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                    delete window.webdriver;
                    delete window._selenium;
                    delete window.domAutomation;
                    
                    window.chrome = {
                        runtime: {},
                        loadTimes: function() { return {}; }
                    };
                """)
                
                # **FIX: Proper URL construction with validation**
                url = f"https://xcancel.com/{username}/media"
                print(f"🚀 Navigating to: {url}")
                
                # **FIX: Validate URL before navigation**
                if not url.startswith('http'):
                    print(f"❌ Invalid URL format: {url}")
                    return 0
                
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Check for verification
                if await self.detect_xcancel_verification(page):
                    if not await self.wait_for_verification_completion(page):
                        print("❌ Failed to complete verification")
                        return 0
                
                # Wait for page to stabilize
                await asyncio.sleep(5)
                
                # Safe page status check
                try:
                    title = await self.safe_get_text(page, 'title')
                    print(f"📄 Page title: {title[:100] if title else 'No title'}")
                except Exception as e:
                    print(f"⚠️ Could not get page title: {e}")
                
                # Progressive scrolling to load all content
                print("🔄 Starting image loading...")
                for i in range(8):
                    if page.is_closed():
                        break
                    
                    try:
                        await page.evaluate("window.scrollBy(0, 400)")
                        await asyncio.sleep(2)
                        print(f"   Scroll {i+1}/8")
                    except Exception as e:
                        print(f"⚠️ Scroll error: {e}")
                        break
                
                # Extract all image URLs using multiple methods
                all_image_urls = []
                
                # Method 1: Find img tags with Twitter URLs
                try:
                    images = await page.locator('img[src*="pbs.twimg.com"]').all()
                    print(f"Found {len(images)} img elements")
                    
                    for img in images:
                        try:
                            src = await img.get_attribute('src')
                            if src:
                                all_image_urls.append(src)
                                print(f"IMG: {src}")
                        except:
                            continue
                except Exception as e:
                    print(f"⚠️ Error finding img elements: {e}")
                
                # Method 2: Find links to images
                try:
                    links = await page.locator('a[href*="pbs.twimg.com"]').all()
                    print(f"Found {len(links)} image links")
                    
                    for link in links:
                        try:
                            href = await link.get_attribute('href')
                            if href:
                                all_image_urls.append(href)
                                print(f"LINK: {href}")
                        except:
                            continue
                except Exception as e:
                    print(f"⚠️ Error finding image links: {e}")
                
                print(f"\nTotal URLs found: {len(all_image_urls)}")
                
                # Apply improved filtering
                print("\n🔍 Applying improved filtering...")
                original_urls = self.filter_original_images_improved(all_image_urls)
                
                print(f"\n📊 Filtering Results:")
                print(f"   Total URLs found: {len(all_image_urls)}")
                print(f"   Original quality images: {len(original_urls)}")
                print(f"   Will download: {min(len(original_urls), max_images)}")
                
                if original_urls:
                    downloaded = await self.download_original_images(
                        original_urls[:max_images], 
                        username, 
                        page
                    )
                    return downloaded
                else:
                    print("No original quality images found")
                    return 0
                
        except Exception as e:
            print(f"❌ Camoufox failed: {e}")
            return 0

async def main():
    scraper = TwitterImageScraper()
    
    # **FIX: Ensure username is properly defined**
    username = "Abhinav_kodes"  # Explicitly set username
    
    print(f"\n🎯 Starting scrape for @{username}")
    print("🔍 Enhanced verification detection enabled")
    print("📸 Original quality image extraction enabled")
    
    try:
        images_downloaded = await scraper.scrape_with_camoufox(username, max_images=15)
        
        if images_downloaded > 0:
            print(f"\n🎉 Successfully downloaded {images_downloaded} original quality images!")
            print(f"📁 Check folder: twitter_images/{username}")
        else:
            print("\n⌐ No original quality images were downloaded")
        
    except Exception as e:
        print(f"❌ Script failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        scraper.session.close()
        print("✓ Session closed")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    asyncio.run(main())
