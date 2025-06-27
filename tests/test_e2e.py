from playwright.sync_api import Page, expect

BASE_URL = "http://localhost:8000"  # Assuming default port for the app


def test_homepage_loads_and_has_correct_title(page: Page):
    """Test that the homepage loads and has the expected title."""
    page.goto(BASE_URL + "/")
    expect(page).to_have_title("Butter")
    # Optional: Check for a key element.
    # e.g. expect(page.locator("h2")).to_contain_text("Butter")


def test_docs_page_loads_and_has_correct_title(page: Page):
    """Test that the documentation page loads and has the expected title."""
    page.goto(BASE_URL + "/")

    # Click the "Docs" link.
    # It's good practice to use a specific locator (e.g., by role or test id).
    docs_link = page.locator("a#docs")  # Using the ID from the HTML
    expect(docs_link).to_be_visible()
    expect(docs_link).to_have_attribute("href", "docs")

    # MkDocs usually opens documentation in a new tab if target="_blank".
    # So we need to handle the new page that opens.
    with page.context.expect_page() as new_page_info:
        docs_link.click()

    docs_page = new_page_info.value
    docs_page.wait_for_load_state()  # Ensure the new page is fully loaded

    expect(docs_page).to_have_title("Butter App Documentation")
    expect(docs_page.locator("h1")).to_contain_text("Butter App Documentation")


def test_docs_navigation_directly(page: Page):
    """Test navigating directly to the docs URL."""
    page.goto(BASE_URL + "/docs/")
    expect(page).to_have_title("Butter App Documentation")
    expect(page.locator("h1")).to_contain_text("Butter App Documentation")
    # Check for a known piece of content from docs/index.md.
    welcome_text = "Welcome to the documentation for the Butter App"
    expect(page.get_by_text(welcome_text)).to_be_visible()


# To run these tests, you'll typically use the command:
# playwright test tests/test_e2e.py
# or if integrated into Makefile: make test-e2e (or make test)

# Note: The application server (e.g., uvicorn src.main:app --reload)
# must be running for these tests to pass. Playwright doesn't start the server itself.
# The Makefile's `dev` or `run` target might be used to start the server.
# For CI, you'd start the server in the background before running tests.
