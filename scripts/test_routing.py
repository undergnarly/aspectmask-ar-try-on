import sys
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8799"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        page = browser.new_page()
        errors = []

        # 1) direct load of a product URL should auto-open that product's modal
        page.goto(f"{BASE}/products/ruby-dune")
        page.wait_for_timeout(300)
        is_open = page.eval_on_selector("#product-modal", "el => el.classList.contains('open')")
        name = page.text_content("#modal-name")
        title = page.title()
        print("direct load /products/ruby-dune -> modal open:", is_open, "| modal-name:", name, "| tab title:", title)
        if not is_open or "Ruby Dune" not in (name or ""):
            errors.append("direct product load did not open the right modal")

        # 2) closing the modal should push URL back to "/" and reset the title
        page.click("#modal-close")
        page.wait_for_timeout(200)
        url_after_close = page.url
        title_after_close = page.title()
        print("after close -> url:", url_after_close, "| tab title:", title_after_close)
        if url_after_close.rstrip("/") != BASE.rstrip("/"):
            errors.append(f"closing did not navigate back to '/': {url_after_close}")

        # 3) clicking a catalog card should push the product URL without a full reload
        page.goto(f"{BASE}/")
        page.wait_for_timeout(300)
        page.click('.card[data-id="black-fire"]')
        page.wait_for_timeout(300)
        url_after_click = page.url
        modal_name = page.text_content("#modal-name")
        print("after clicking Black Fire card -> url:", url_after_click, "| modal-name:", modal_name)
        if "/products/black-fire" not in url_after_click:
            errors.append(f"card click did not update the URL to /products/black-fire: {url_after_click}")

        # 4) browser back button should close the modal and return to catalog
        page.go_back()
        page.wait_for_timeout(300)
        is_open_after_back = page.eval_on_selector("#product-modal", "el => el.classList.contains('open')")
        print("after back button -> modal open:", is_open_after_back, "| url:", page.url)
        if is_open_after_back:
            errors.append("back button did not close the modal")

        # 5) legacy hash link should redirect to the new path (back-compat)
        page.goto(f"{BASE}/#p-wine-heart")
        page.wait_for_timeout(300)
        url_legacy = page.url
        modal_name_legacy = page.text_content("#modal-name")
        print("legacy '#p-wine-heart' -> url:", url_legacy, "| modal-name:", modal_name_legacy)
        if "/products/wine-heart" not in url_legacy or "Wine Heart" not in (modal_name_legacy or ""):
            errors.append(f"legacy hash link did not upgrade correctly: {url_legacy} / {modal_name_legacy}")

        # 6) view-source (raw HTML, no JS) of a product page has the right static meta
        raw = page.request.get(f"{BASE}/products/deep-ocean").text()
        print("raw <title> present:", "<title>Deep Ocean Mask" in raw)
        print("raw og:image present:", 'og:image" content="https://aspectmask.com/assets/products/deep-ocean/' in raw)
        print("raw canonical present:", 'canonical" href="https://aspectmask.com/products/deep-ocean"' in raw)
        if "<title>Deep Ocean Mask" not in raw:
            errors.append("raw HTML for /products/deep-ocean missing its own <title> (would break OG/link previews)")

        browser.close()

        if errors:
            print("\nFAILURES:")
            for e in errors:
                print(" -", e)
            sys.exit(1)
        print("\nALL CHECKS PASSED")


if __name__ == "__main__":
    main()
