# reddit.py
from camoufox.sync_api import Camoufox
import requests
import os
import time
import random
import json
from datetime import datetime

def extract_reddit_image_urls(all_urls):
    """Extract and process Reddit image URLs"""
    
    processed_urls = set()
    
    for url in all_urls:
        # Skip Reddit UI elements
        if any(skip in url for skip in ['styles/images', 'reddit_icons', 'snoomoji', 'awards', 'sprite']):
            continue
        
        # Process different Reddit image types
        if 'i.redd.it' in url:
            processed_urls.add(url)
            
        elif 'preview.redd.it' in url:
            original_url = url.split('?')[0]
            processed_urls.add(original_url)
            
        elif 'external-preview.redd.it' in url:
            original_url = url.split('?')[0]
            processed_urls.add(original_url)
            
        elif 'i.imgur.com' in url:
            processed_urls.add(url)
            
        elif 'imgur.com/' in url and 'i.imgur.com' not in url:
            img_id = url.split('/')[-1].split('.')[0]
            if img_id and len(img_id) > 3:
                direct_url = f"https://i.imgur.com/{img_id}.jpg"
                processed_urls.add(direct_url)
    
    return list(processed_urls)

def handle_age_gate(page):
    """Handle Reddit's age verification gate"""
    
    title = page.title().lower()
    
    if "over 18" in title or "age" in title:
        print("🔞 Age verification detected! Handling...")
        
        try:
            # Look for "Yes" button or continue button
            yes_buttons = page.query_selector_all('button, input[type="submit"], a')
            
            for button in yes_buttons:
                button_text = button.inner_text().lower() if button.inner_text() else ""
                button_value = button.get_attribute('value') or ""
                
                if any(keyword in button_text for keyword in ['yes', 'continue', 'enter']) or \
                   any(keyword in button_value.lower() for keyword in ['yes', 'continue']):
                    print(f"Clicking: {button_text or button_value}")
                    button.click()
                    page.wait_for_timeout(3000)
                    return True
            
            # Alternative: Try form submission
            forms = page.query_selector_all('form')
            if forms:
                print("Submitting age verification form...")
                forms[0].submit()
                page.wait_for_timeout(3000)
                return True
                
        except Exception as e:
            print(f"Error handling age gate: {e}")
    
    return False

def save_image_with_metadata(image_url, post_url, filename, filepath):
    """Save image metadata for later use in job submission"""
    metadata = {
        'image_file': filename,
        'source_url': post_url,
        'image_url': image_url,
        'timestamp': datetime.now().isoformat(),
        'platform': 'reddit'
    }
    
    # Save metadata file alongside image
    metadata_file = filepath.replace(os.path.splitext(filepath)[1], '_metadata.json')
    try:
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    except Exception as e:
        print(f"⚠️  Could not save metadata: {e}")

def download_reddit_images(image_urls, username, cookies, page=None):
    """Download Reddit images with session cookies and metadata"""
    
    download_dir = "reddit_images"
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)
    
    user_dir = os.path.join(download_dir, username)
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)
    
    # Setup session with cookies
    session = requests.Session()
    for cookie in cookies:
        session.cookies.set(cookie['name'], cookie['value'])
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://old.reddit.com/',
        'Connection': 'keep-alive'
    }
    
    downloaded_count = 0
    
    for i, url in enumerate(image_urls):
        try:
            print(f"\nDownloading image {i+1}/{len(image_urls)}")
            print(f"URL: {url}")
            
            response = session.get(url, headers=headers, timeout=30, stream=True)
            
            if response.status_code == 200:
                # Determine file extension
                file_extension = 'jpg'
                if '.' in url:
                    ext = url.split('.')[-1].split('?')[0]
                    if ext.lower() in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                        file_extension = ext.lower()
                
                timestamp = int(time.time())
                filename = f"{username}_submitted_{i+1}_{timestamp}.{file_extension}"
                filepath = os.path.join(user_dir, filename)
                
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                
                file_size = os.path.getsize(filepath)
                print(f"✅ Downloaded: {filename} ({file_size:,} bytes)")
                
                # Try to find the post URL for this image
                post_url = f"https://reddit.com/user/{username}"  # Default fallback
                if page:
                    try:
                        # Try to find post links on the page
                        post_links = page.query_selector_all('a[href*="/comments/"]')
                        if post_links and i < len(post_links):
                            post_href = post_links[i].get_attribute('href')
                            if post_href:
                                if post_href.startswith('/'):
                                    post_url = f"https://old.reddit.com{post_href}"
                                else:
                                    post_url = post_href
                    except:
                        pass  # Use fallback URL
                
                # Save metadata
                save_image_with_metadata(url, post_url, filename, filepath)
                
                downloaded_count += 1
            else:
                print(f"❌ Failed: HTTP {response.status_code}")
            
            time.sleep(random.uniform(1, 3))
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n{'='*60}")
    print(f"REDDIT DOWNLOAD COMPLETE")
    print(f"Downloaded: {downloaded_count}/{len(image_urls)} images")
    print(f"Location: {user_dir}")
    print(f"{'='*60}")
    
    return downloaded_count

def scrape_reddit_submitted_tab(username, limit=10):
    """Reddit scraper targeting the submitted tab for better image discovery"""
    
    print(f"🦊 Starting Reddit submitted tab scraping for u/{username}...")
    print(f"Target: {limit} images")
    
    with Camoufox(
        headless=True,
        os="windows"
    ) as browser:
        
        try:
            page = browser.new_page()
            page.set_viewport_size({"width": 1920, "height": 1080})
            
            # Start with user's submitted tab
            current_url = f"https://old.reddit.com/user/{username}/submitted/"
            all_image_urls = set()
            page_count = 0
            max_pages = 15
            
            print(f"🎯 Targeting submitted posts for higher image concentration")
            
            while len(all_image_urls) < limit and current_url and page_count < max_pages:
                page_count += 1
                print(f"\n📄 Processing submitted page {page_count}")
                print(f"URL: {current_url}")
                
                # Navigate to current page
                page.goto(current_url)
                page.wait_for_timeout(random.randint(3000, 5000))
                
                # Handle age gate if needed
                title = page.title()
                if "over 18" in title.lower():
                    print("🔞 Age verification required!")
                    if handle_age_gate(page):
                        print("✅ Age verification completed")
                        page.wait_for_timeout(3000)
                    else:
                        print("❌ Could not handle age verification")
                        break
                
                # Check if user exists
                current_title = page.title()
                if "page not found" in current_title.lower() or "404" in current_title.lower():
                    print(f"❌ User u/{username} not found")
                    break
                
                print(f"Page title: {current_title}")
                
                # Scroll to load content
                for i in range(3):
                    page.evaluate(f"window.scrollTo(0, {(i+1) * 1000})")
                    page.wait_for_timeout(1000)
                
                # Extract URLs from current page
                page_urls = []
                
                # Method 1: Look for post thumbnails
                thumbnails = page.query_selector_all('.thumbnail img, .post-thumbnail img')
                print(f"Found {len(thumbnails)} thumbnail images")
                for thumb in thumbnails:
                    try:
                        src = thumb.get_attribute('src')
                        if src and src.startswith('http'):
                            page_urls.append(src)
                    except:
                        continue
                
                # Method 2: Look for post links that lead to images
                post_links = page.query_selector_all('.thing .title a, .post .title a')
                print(f"Found {len(post_links)} post title links")
                for link in post_links:
                    try:
                        href = link.get_attribute('href')
                        if href and any(domain in href for domain in ['i.redd.it', 'imgur.com', 'preview.redd.it']):
                            page_urls.append(href)
                    except:
                        continue
                
                # Method 3: Find all img tags
                images = page.query_selector_all('img[src]')
                for img in images:
                    try:
                        src = img.get_attribute('src')
                        if src and src.startswith('http'):
                            page_urls.append(src)
                    except:
                        continue
                
                # Method 4: Find all image links
                links = page.query_selector_all('a[href]')
                for link in links:
                    try:
                        href = link.get_attribute('href')
                        if href and any(domain in href for domain in ['i.redd.it', 'imgur.com', 'preview.redd.it']):
                            page_urls.append(href)
                    except:
                        continue
                
                # Process URLs from this page
                processed_urls = extract_reddit_image_urls(page_urls)
                new_images = [url for url in processed_urls if url not in all_image_urls]
                
                print(f"Found {len(new_images)} new images on page {page_count}")
                for url in new_images:
                    print(f"  ✅ {url}")
                
                all_image_urls.update(new_images)
                
                print(f"Total images collected: {len(all_image_urls)}/{limit}")
                
                # Check if we have enough images
                if len(all_image_urls) >= limit:
                    print(f"🎯 Target reached! Found {len(all_image_urls)} images")
                    break
                
                # Look for next button
                next_button = page.query_selector('span.next-button > a, .next-button a')
                if next_button:
                    next_href = next_button.get_attribute('href')
                    if next_href:
                        # Handle relative URLs
                        if next_href.startswith('/'):
                            current_url = 'https://old.reddit.com' + next_href
                        else:
                            current_url = next_href
                        
                        print(f"➡️  Found next page: {current_url}")
                        time.sleep(random.uniform(2, 4))
                    else:
                        print("❌ Next button found but no href")
                        current_url = None
                else:
                    print("❌ No next button found - reached end of submitted posts")
                    current_url = None
            
            # Download collected images
            if all_image_urls:
                images_to_download = list(all_image_urls)[:limit]
                print(f"\n📥 Starting download of {len(images_to_download)} images from submitted posts...")
                
                cookies = page.context.cookies()
                downloaded = download_reddit_images(images_to_download, username, cookies, page)
                return downloaded
            else:
                print("No images found in submitted posts")
                return 0
                
        except Exception as e:
            print(f"Error during scraping: {e}")
            return 0

# Keep the standalone functionality
if __name__ == "__main__":
    print("Reddit Image Scraper - Submitted Tab Edition")
    print("Targets user's submitted posts for better image discovery")
    print("=" * 65)
    
    username = input("Enter Reddit username (without u/): ").strip()
    if username:
        limit = input("Number of images (default 10): ").strip()
        limit = int(limit) if limit.isdigit() else 10
        
        downloaded = scrape_reddit_submitted_tab(username, limit)
        
        if downloaded > 0:
            print(f"\n🎉 Successfully downloaded {downloaded} images!")
            print(f"📁 Check folder: reddit_images/{username}")
        else:
            print("\n❌ No images were downloaded")
