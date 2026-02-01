from bs4 import BeautifulSoup, NavigableString
from playwright.sync_api import sync_playwright
import time

BLACKLIST_TAGS = {"script", "style", "code", "pre", "noscript", "head", "meta", "link"}

def fetch_html(url: str) -> str:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a generic user agent to avoid blocking
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = context.new_page()
        
        print(f"Navigating to {url}...")
        page.goto(url, timeout=60000, wait_until="domcontentloaded")

        # Scroll logic
        last_height = page.evaluate("document.body.scrollHeight")
        while True:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.5)
            new_height = page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

        html_content = page.content()
        browser.close()
        return html_content

def clean_html(soup: BeautifulSoup) -> BeautifulSoup:
    """
    Removes scripts, iframes, and injects visibility styles.
    Moved from original main.py to keep logic encapsulated.
    """
    removed_count = 0
    
    # Remove executable tags
    for tag in soup(['script', 'iframe']):
        tag.decompose()
        removed_count += 1
    
    for tag in soup.find_all('link', attrs={'as': 'script'}):
        tag.decompose()
        removed_count += 1
    
    # Fix images
    for img in soup.find_all('img'):
        if 'data-src' in img.attrs:
            img['src'] = img['data-src']
        elif 'data-url' in img.attrs:
            img['src'] = img['data-url']
        
        if 'srcset' in img.attrs:
            del img['srcset']
        
        img['loading'] = 'eager'
        img['style'] = 'opacity: 1 !important; display: block !important; visibility: visible !important;'

    # Inject styles
    style_tag = soup.new_tag("style")
    style_tag.string = """
        body, div, article, main, section {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        [role="dialog"], [role="alert"], .modal, .popup {
            display: none !important;
        }
    """
    if soup.head:
        soup.head.append(style_tag)
    elif soup.body:
        soup.body.insert(0, style_tag)
        
    return soup

def extract_text_nodes(soup: BeautifulSoup):
    text_nodes = []
    for element in soup.find_all(string=True):
        if not isinstance(element, NavigableString):
            continue
        if element.parent.name in BLACKLIST_TAGS:
            continue
        if not element.strip():
            continue
        text_nodes.append(element)
    return text_nodes