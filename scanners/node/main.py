# main.py
import re
import sys
import asyncio
from urllib.parse import urlparse
from reddit import scrape_reddit_submitted_tab
from twitter import TwitterImageScraper
from watermark_verify import process_extracted_images
import os
import requests
import json
from typing import List, Dict, Optional
import glob
import shutil

def cleanup_downloaded_images(verbose: bool = True) -> bool:
    """Clean up all downloaded images from reddit_images and twitter_images folders after successful submission"""
    
    try:
        reddit_folder = 'reddit_images'
        twitter_folder = 'twitter_images'
        
        cleanup_success = True
        total_files_deleted = 0
        
        # Clean reddit_images folder (using same logic as Twitter)
        if os.path.exists(reddit_folder):
            reddit_files = glob.glob(os.path.join(reddit_folder, '**', '*'), recursive=True)
            # Filter out directories, only keep files
            reddit_files = [f for f in reddit_files if os.path.isfile(f)]
            
            if reddit_files:
                if verbose:
                    print(f"🧹 Cleaning reddit_images folder ({len(reddit_files)} files)...")
                
                for file_path in reddit_files:
                    try:
                        os.remove(file_path)
                        total_files_deleted += 1
                        if verbose:
                            print(f"   ✅ Deleted: {os.path.relpath(file_path, reddit_folder)}")
                    except Exception as e:
                        if verbose:
                            print(f"   ❌ Failed to delete {os.path.relpath(file_path, reddit_folder)}: {e}")
                        cleanup_success = False
                
                # Remove empty subdirectories for Reddit too
                for root, dirs, files in os.walk(reddit_folder, topdown=False):
                    for dir_name in dirs:
                        dir_path = os.path.join(root, dir_name)
                        try:
                            if not os.listdir(dir_path):  # Check if directory is empty
                                os.rmdir(dir_path)
                                if verbose:
                                    print(f"   🗂️  Removed empty directory: {os.path.relpath(dir_path, reddit_folder)}")
                        except Exception as e:
                            if verbose:
                                print(f"   ⚠️  Could not remove directory {os.path.relpath(dir_path, reddit_folder)}: {e}")
            else:
                if verbose:
                    print("📁 reddit_images folder is already empty")
        
        # Clean twitter_images folder (including subfolders)
        if os.path.exists(twitter_folder):
            twitter_files = glob.glob(os.path.join(twitter_folder, '**', '*'), recursive=True)
            # Filter out directories, only keep files
            twitter_files = [f for f in twitter_files if os.path.isfile(f)]
            
            if twitter_files:
                if verbose:
                    print(f"🧹 Cleaning twitter_images folder ({len(twitter_files)} files)...")
                
                for file_path in twitter_files:
                    try:
                        os.remove(file_path)
                        total_files_deleted += 1
                        if verbose:
                            print(f"   ✅ Deleted: {os.path.relpath(file_path, twitter_folder)}")
                    except Exception as e:
                        if verbose:
                            print(f"   ❌ Failed to delete {os.path.relpath(file_path, twitter_folder)}: {e}")
                        cleanup_success = False
                
                # Remove empty subdirectories
                for root, dirs, files in os.walk(twitter_folder, topdown=False):
                    for dir_name in dirs:
                        dir_path = os.path.join(root, dir_name)
                        try:
                            if not os.listdir(dir_path):  # Check if directory is empty
                                os.rmdir(dir_path)
                                if verbose:
                                    print(f"   🗂️  Removed empty directory: {os.path.relpath(dir_path, twitter_folder)}")
                        except Exception as e:
                            if verbose:
                                print(f"   ⚠️  Could not remove directory {os.path.relpath(dir_path, twitter_folder)}: {e}")
            else:
                if verbose:
                    print("📁 twitter_images folder is already empty")
        
        if verbose:
            if cleanup_success:
                print(f"✅ Cleanup completed successfully! Total files deleted: {total_files_deleted}")
            else:
                print(f"⚠️  Cleanup completed with some errors. Files deleted: {total_files_deleted}")
        
        return cleanup_success
        
    except Exception as e:
        if verbose:
            print(f"❌ Cleanup failed with exception: {e}")
        return False

        

def extract_username_from_url(url):
    """Extract username from Twitter or Reddit URL"""
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.strip('/')
    
    # Twitter patterns
    twitter_domains = ['twitter.com', 'x.com', 'xcancel.com']
    if any(domain.endswith(td) for td in twitter_domains):
        username = path.split('/')[0] if path else None
        return 'twitter', username
    
    # Reddit patterns
    reddit_domains = ['reddit.com', 'old.reddit.com', 'new.reddit.com', 'www.reddit.com']
    if any(domain.endswith(rd) for rd in reddit_domains):
        path_parts = path.split('/')
        if len(path_parts) >= 2:
            if path_parts[0] in ['user', 'u']:
                username = path_parts[1]
                return 'reddit', username
            elif len(path_parts) >= 3 and path_parts[1] in ['user', 'u']:
                username = path_parts[2]
                return 'reddit', username
    
    return None, None

def submit_job_results(job_id: str, job_link: str, verified_results: List[Dict], username: str, verbose: bool = True) -> Dict:
    """Submit all matched images in a single API call - Updated for new API structure"""
    
    if not verified_results:
        if verbose:
            print("❌ No verified results to submit")
        return {}
    
    url = "https://scanner-server-ns7h.onrender.com/submit-job"
    
    if verbose:
        print(f"\n📤 Preparing batch submission of {len(verified_results)} matched images...")
    
    # Prepare response array according to new API structure
    response_list = []
    
    for result in verified_results:
        asset_data = result['verification']['asset_data']
        match_type = result['verification'].get('match_type', 'unknown')
        
        if not asset_data:
            continue
        
        # **UPDATED: Platform-specific URL selection**
        metadata = result.get('metadata', {})
        platform = metadata.get('platform', 'unknown')
        
        if platform == 'reddit':
            # For Reddit, use the direct image URL
            complaint_image_url = metadata.get('image_url', job_link)
        else:
            # For Twitter/X.com, use the post URL
            complaint_image_url = result.get('source_url', job_link)
            if complaint_image_url and '#' in complaint_image_url:
                complaint_image_url = complaint_image_url.split('#')[0]
        
        if not complaint_image_url or not complaint_image_url.startswith('http'):
            complaint_image_url = job_link
        
        # Build response entry matching your API structure
        response_entry = {
            "assetID": asset_data.get('assetid', ''),
            "complaintImage": complaint_image_url,
            "walletID": asset_data.get('walletid', ''),
            "link": job_link
        }
        
        # Set similarityScore based on match type
        if match_type == 'hash':
            response_entry["similarityScore"] = 100
        elif match_type == 'phash':
            similarity_data = result['verification'].get('similarity_data', {})
            similarity_score = similarity_data.get('similarity_percent', 85)
            response_entry["similarityScore"] = float(similarity_score)
        else:
            response_entry["similarityScore"] = 100
        
        response_list.append(response_entry)
        
        if verbose:
            print(f"   📋 Added: {result['image_name']}")
            print(f"      Platform: {platform}")
            print(f"      Asset ID: {asset_data.get('assetid', 'Unknown')}")
            print(f"      Wallet ID: {asset_data.get('walletid', 'Unknown')}")
            print(f"      Similarity Score: {response_entry['similarityScore']}")
            print(f"      Complaint Image: {complaint_image_url}")

    
    payload = {
        "jobID": str(job_id),
        "link": str(job_link),  
        "responses": response_list  
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        if verbose:
            print(f"\n🚀 Submitting batch of {len(response_list)} infringement reports...")
            print(f"   Job ID: {job_id}")
            print(f"   Original Link: {job_link}")
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result_data = response.json()
            if verbose:
                print(f"✅ Batch submission successful!")
                print(f"   Status: {result_data.get('status', 'Unknown')}")
                print(f"   Job ID: {result_data.get('jobID', 'Unknown')}")
                print(f"   Link: {result_data.get('link', 'Unknown')}")
                print(f"   Total complaints filed: {len(response_list)}")
            
            if verbose:
                print(f"\n🧹 CLEANUP PHASE")
                print("=" * 50)
            
            cleanup_success = cleanup_downloaded_images(verbose=verbose)
            
            if cleanup_success and verbose:
                print("=" * 50)
                print("✅ Job completed successfully with cleanup!")
            elif verbose:
                print("=" * 50)
                print("⚠️  Job completed but cleanup had some issues")
            
            return result_data
        else:
            if verbose:
                print(f"❌ Batch submission failed: {response.status_code}")
                print(f"   Response: {response.text}")
                print("⚠️  Skipping cleanup due to submission failure")
            return {}
            
    except Exception as e:
        if verbose:
            print(f"❌ Exception during batch submission: {e}")
            print("⚠️  Skipping cleanup due to submission failure")
        return {}


def run_watermark_verification(job_id, job_link, username):
    """Run watermark verification - Updated for new API structure"""
    print("\n" + "="*70)
    print("🔍 ASSET WATERMARK VERIFICATION PHASE (API MODE + pHash)")
    print("="*70)

    try:
        all_results = []
        
        for directory in ["twitter_images", "reddit_images"]:
            if os.path.exists(directory):
                print(f"\n🔍 Checking asset watermarks in {directory}...")
                results = process_extracted_images(directory, job_id, verbose=True)
                all_results.extend(results)
            else:
                print(f"⚠️  Directory {directory} not found - skipping")

        if all_results:
            verified_results = [r for r in all_results if r['verification']['verified']]
            verified_count = len(verified_results)
            hash_matches = len([r for r in verified_results if r['verification'].get('match_type') == 'hash'])
            phash_matches = len([r for r in verified_results if r['verification'].get('match_type') == 'phash'])
            
            print(f"\n🎯 ASSET WATERMARK VERIFICATION SUMMARY:")
            print(f"   Total images checked: {len(all_results)}")
            print(f"   Verified assets: {verified_count}")
            print(f"   Hash matches (100% similarity): {hash_matches}")
            print(f"   pHash matches (> 85% similarity): {phash_matches}")
            print(f"   Unverified/Failed: {len(all_results) - verified_count}")
            
            if verified_count > 0:
                print(f"\n🔐 SECURITY STATUS: {verified_count} images contain registered asset watermarks")
                
                # Show verified assets
                print(f"\n✅ VERIFIED ASSETS:")
                for result in verified_results:
                    asset_data = result['verification']['asset_data']
                    match_type = result['verification'].get('match_type', 'unknown')
                    
                    print(f"   📷 {result['image_name']} ({match_type.upper()})")
                    print(f"      Asset ID: {asset_data.get('assetid', 'N/A')}")
                    print(f"      IP Asset ID: {asset_data.get('ipassetid', 'N/A')}")
                    print(f"      Owner Wallet: {asset_data.get('walletid', 'N/A')}")
                    print(f"      Public URL: {asset_data.get('publicurl', 'N/A')}")
                    
                    if match_type == 'phash':
                        similarity_data = result['verification'].get('similarity_data', {})
                        print(f"      Similarity: {similarity_data.get('similarity_percent', 'N/A')}%")
                
                # Submit job results to API
                print(f"\n" + "="*70)
                print("📤 JOB SUBMISSION PHASE")
                print("="*70)
                
                submission_result = submit_job_results(job_id, job_link, verified_results, username, verbose=True)
                
                if submission_result and submission_result.get('status'):
                    print(f"\n🎉 JOB COMPLETION SUCCESS!")
                    print(f"   Verified Assets: {verified_count}")
                    print(f"   Submission Status: ✅ {submission_result.get('status')}")
                    print(f"   Job ID: {submission_result.get('jobID')}")
                else:
                    print(f"\n⚠️  JOB SUBMISSION FAILED!")
                    print(f"   Verified Assets: {verified_count}")
                    print(f"   Submission Status: ❌")
                    
            else:
                print(f"\n⚠️  SECURITY WARNING: No registered asset watermarks found")
                print(f"   No assets to submit to API")
        else:
            print("❌ No images found for watermark verification")
    
    except Exception as e:
        print(f"❌ Asset watermark verification failed: {e}")

def get_job(endpoint):
    url = f"https://scanner-server-ns7h.onrender.com/{endpoint}"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        return None

async def run_twitter_scraper(username, limit):
    """Async wrapper for Twitter scraping"""
    scraper = TwitterImageScraper()
    try:
        downloaded = await scraper.scrape_with_camoufox(username, max_images=limit)
        return downloaded
    finally:
        scraper.session.close()


def main():
    
    job = get_job("get-job")
    if job:
        job_id = job["jobID"]
        job_link = job["link"]
        
        print(f"✅ Retrieved job: {job_id}")
        print(f"✅ Target URL: {job_link}")
    else:
        print("❌ Failed to get job from API")
        return

    # Get URL input
    url = job_link.strip()

    if not url:
        print("❌ No URL provided")
        return
    
    # Extract platform and username
    platform, username = extract_username_from_url(url)
    
    if not platform or not username:
        print("❌ Could not detect platform or extract username from URL")
        print("Supported formats:")
        print("  Twitter: https://x.com/username or https://twitter.com/username")
        print("  Reddit: https://reddit.com/user/username or https://reddit.com/u/username")
        return
    
    print(f"✅ Detected: {platform.upper()}")
    print(f"✅ Username: {username}")
    
    # Get number of images
    limit =  15
    
    # Ask about watermark verification+
    verify_watermarks = 'y'
    
    print(f"\n🚀 Starting {platform} scraper for {username}...")
    
    # Route to appropriate scraper
    try:
        if platform == 'twitter':
            # **FIXED: Use async wrapper for Twitter scraping**
            downloaded = asyncio.run(run_twitter_scraper(username, limit))
        elif platform == 'reddit':
            downloaded = scrape_reddit_submitted_tab(username, limit)
        else:
            print(f"❌ Unsupported platform: {platform}")
            return
        
        # Report scraping results
        if downloaded > 0:
            print(f"\n🎉 SCRAPING SUCCESS!")
            print(f"Downloaded: {downloaded} images")
            print(f"Platform: {platform.upper()}")
            print(f"Username: {username}")
            print(f"Location: {platform}_images/{username}/")
            
            # Run watermark verification if requested
            if verify_watermarks:
                run_watermark_verification(job_id, job_link, username)
            else:
                print("\n⏭️  Skipping watermark verification")
        else:
            print(f"\n❌ No images were downloaded")
            print("This could be due to:")
            print("- Private account")
            print("- No images in recent posts")
            print("- Network issues")
            print("- Platform restrictions")
    
    except Exception as e:
        print(f"❌ Error running {platform} scraper: {e}")

if __name__ == "__main__":
    main()