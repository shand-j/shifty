"""Test configuration for pytest."""

import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture(scope="session")
def browser():
    """Provide a browser instance for tests."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    """Provide a fresh page for each test."""
    page = browser.new_page()
    yield page
    page.close()
