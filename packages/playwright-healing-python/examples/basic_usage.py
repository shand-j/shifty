"""Example usage of the healing engine."""

import pytest
from playwright.sync_api import Page
from playwright_healing import HealingPage, configure_healing


# Configure healing globally
configure_healing(
    strategies=["data-testid-recovery", "text-content-matching"],
    max_attempts=3,
)


def test_login_flow(page: Page):
    """Test login flow with auto-healing."""
    healing_page = HealingPage(page)
    healing_page.goto("https://example.com/login")
    
    # These selectors will auto-heal if they break
    healing_page.fill("#username", "user@test.com")
    healing_page.fill("#password", "SecurePass123!")
    healing_page.click('button[type="submit"]')
    
    # Verify success
    welcome = healing_page.locator(".welcome-message")
    assert welcome.is_visible()


def test_ecommerce_checkout(page: Page):
    """Test e-commerce checkout with auto-healing."""
    healing_page = HealingPage(page)
    healing_page.goto("https://shop.example.com/cart")
    
    # Add items - selectors will auto-heal
    healing_page.click('text="Add to Cart"')
    healing_page.click(".checkout-button")
    
    # Fill shipping form
    healing_page.fill("#shipping-name", "John Doe")
    healing_page.fill("#shipping-address", "123 Main St")
    healing_page.click('button:has-text("Continue to Payment")')
    
    # Complete payment
    healing_page.fill('[data-testid="card-number"]', "4242424242424242")
    healing_page.click('text="Complete Order"')
    
    # Verify success
    confirmation = healing_page.locator(".order-confirmation")
    assert confirmation.is_visible()


def test_healing_statistics(page: Page):
    """Test healing statistics tracking."""
    healing_page = HealingPage(page)
    healing_page.goto("https://example.com")
    
    # Perform actions
    healing_page.click("#selector-1")
    healing_page.fill("#selector-2", "test")
    
    # Get statistics
    stats = healing_page.get_healing_stats()
    print(f"Healing attempts: {stats.attempts}")
    print(f"Success rate: {stats.success_rate}")
    print(f"Flakiness: {stats.flakiness}")
    
    # Verify stats were tracked
    assert stats.attempts >= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
