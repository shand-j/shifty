"""Playwright Page wrapper with auto-healing capabilities."""

import logging
from typing import Optional, Any

try:
    from playwright.sync_api import Page, Locator
    from playwright.async_api import Page as AsyncPage, Locator as AsyncLocator
except ImportError:
    Page = AsyncPage = Locator = AsyncLocator = None  # type: ignore

from .config import HealingConfig, get_config
from .engine import HealingEngine
from .types import HealingStats


logger = logging.getLogger(__name__)


class HealingPage:
    """Wrapper around Playwright Page with auto-healing capabilities."""
    
    def __init__(self, page: Page, config: Optional[HealingConfig] = None):
        """Initialize healing page wrapper.
        
        Args:
            page: Playwright page object
            config: Healing configuration (uses global config if not provided)
        """
        self._page = page
        self._config = config or get_config()
        self._engine = HealingEngine(self._config)
    
    def goto(self, url: str, **kwargs: Any) -> Any:
        """Navigate to URL.
        
        Args:
            url: URL to navigate to
            **kwargs: Additional arguments to pass to page.goto
        
        Returns:
            Navigation response
        """
        logger.info(f"Navigating to: {url}")
        return self._page.goto(url, **kwargs)
    
    def click(self, selector: str, **kwargs: Any) -> None:
        """Click element with auto-healing.
        
        Args:
            selector: Element selector
            **kwargs: Additional arguments to pass to click
        """
        healed_selector = self._heal_selector(selector, "button")
        logger.info(f"Clicking: {healed_selector}")
        self._page.click(healed_selector, **kwargs)
    
    def fill(self, selector: str, value: str, **kwargs: Any) -> None:
        """Fill input with auto-healing.
        
        Args:
            selector: Element selector
            value: Value to fill
            **kwargs: Additional arguments to pass to fill
        """
        healed_selector = self._heal_selector(selector, "input")
        logger.info(f"Filling {healed_selector} with: {value}")
        self._page.fill(healed_selector, value, **kwargs)
    
    def locator(self, selector: str) -> Locator:
        """Get locator with auto-healing.
        
        Args:
            selector: Element selector
        
        Returns:
            Playwright Locator
        """
        healed_selector = self._heal_selector(selector)
        return self._page.locator(healed_selector)
    
    def get_healing_stats(self) -> HealingStats:
        """Get healing statistics.
        
        Returns:
            HealingStats object
        """
        return self._engine.get_stats()
    
    def clear_healing_cache(self) -> None:
        """Clear the healing cache."""
        self._engine.clear_cache()
    
    def get_page(self) -> Page:
        """Get the underlying Playwright page.
        
        Returns:
            Playwright Page object
        """
        return self._page
    
    def _heal_selector(self, selector: str, expected_type: Optional[str] = None) -> str:
        """Heal a selector if needed.
        
        Args:
            selector: Original selector
            expected_type: Expected element type
        
        Returns:
            Healed selector or original if healing failed
        """
        try:
            result = self._engine.heal(self._page, selector, expected_type)
            if result.success:
                if result.strategy != "no-healing-needed":
                    logger.info(f"Healed '{selector}' to '{result.selector}' using {result.strategy}")
                return result.selector
            else:
                logger.warning(f"Failed to heal '{selector}': {result.error}")
                return selector
        except Exception as e:
            logger.error(f"Error during healing: {e}")
            return selector


class AsyncHealingPage:
    """Async wrapper around Playwright Page with auto-healing capabilities."""
    
    def __init__(self, page: AsyncPage, config: Optional[HealingConfig] = None):
        """Initialize async healing page wrapper.
        
        Args:
            page: Playwright async page object
            config: Healing configuration (uses global config if not provided)
        """
        self._page = page
        self._config = config or get_config()
        self._engine = HealingEngine(self._config)
    
    async def goto(self, url: str, **kwargs: Any) -> Any:
        """Navigate to URL (async).
        
        Args:
            url: URL to navigate to
            **kwargs: Additional arguments to pass to page.goto
        
        Returns:
            Navigation response
        """
        logger.info(f"Navigating to: {url}")
        return await self._page.goto(url, **kwargs)
    
    async def click(self, selector: str, **kwargs: Any) -> None:
        """Click element with auto-healing (async).
        
        Args:
            selector: Element selector
            **kwargs: Additional arguments to pass to click
        """
        healed_selector = self._heal_selector(selector, "button")
        logger.info(f"Clicking: {healed_selector}")
        await self._page.click(healed_selector, **kwargs)
    
    async def fill(self, selector: str, value: str, **kwargs: Any) -> None:
        """Fill input with auto-healing (async).
        
        Args:
            selector: Element selector
            value: Value to fill
            **kwargs: Additional arguments to pass to fill
        """
        healed_selector = self._heal_selector(selector, "input")
        logger.info(f"Filling {healed_selector} with: {value}")
        await self._page.fill(healed_selector, value, **kwargs)
    
    async def locator(self, selector: str) -> AsyncLocator:
        """Get locator with auto-healing (async).
        
        Args:
            selector: Element selector
        
        Returns:
            Playwright Locator
        """
        healed_selector = self._heal_selector(selector)
        return self._page.locator(healed_selector)
    
    def get_healing_stats(self) -> HealingStats:
        """Get healing statistics.
        
        Returns:
            HealingStats object
        """
        return self._engine.get_stats()
    
    def clear_healing_cache(self) -> None:
        """Clear the healing cache."""
        self._engine.clear_cache()
    
    def get_page(self) -> AsyncPage:
        """Get the underlying Playwright page.
        
        Returns:
            Playwright Page object
        """
        return self._page
    
    def _heal_selector(self, selector: str, expected_type: Optional[str] = None) -> str:
        """Heal a selector if needed.
        
        Args:
            selector: Original selector
            expected_type: Expected element type
        
        Returns:
            Healed selector or original if healing failed
        """
        try:
            result = self._engine.heal(self._page, selector, expected_type)
            if result.success:
                if result.strategy != "no-healing-needed":
                    logger.info(f"Healed '{selector}' to '{result.selector}' using {result.strategy}")
                return result.selector
            else:
                logger.warning(f"Failed to heal '{selector}': {result.error}")
                return selector
        except Exception as e:
            logger.error(f"Error during healing: {e}")
            return selector
