"""Core healing engine."""

import logging
from typing import Dict, List, Optional
from collections import defaultdict

try:
    from playwright.sync_api import Page
except ImportError:
    Page = None  # type: ignore

from .config import HealingConfig, get_config
from .types import HealingResult, HealingStats, FlakinessItem
from .strategies import (
    HealingStrategy,
    DataTestIdRecoveryStrategy,
    TextContentMatchingStrategy,
    CSSHierarchyAnalysisStrategy,
    AIPoweredAnalysisStrategy,
)


logger = logging.getLogger(__name__)


class HealingEngine:
    """Core healing engine that orchestrates healing strategies."""
    
    def __init__(self, config: Optional[HealingConfig] = None):
        """Initialize the healing engine.
        
        Args:
            config: Healing configuration (uses global config if not provided)
        """
        self.config = config or get_config()
        self._cache: Dict[str, str] = {}
        self._cache_uses: Dict[str, int] = defaultdict(int)
        self._flakiness_tracker: Dict[str, Dict[str, int]] = defaultdict(
            lambda: {"successes": 0, "failures": 0}
        )
        self._stats = HealingStats()
        self._strategies = self._initialize_strategies()
        
        # Configure logging
        logging.basicConfig(level=self.config.log_level)
    
    def _initialize_strategies(self) -> Dict[str, HealingStrategy]:
        """Initialize healing strategies based on configuration."""
        strategies = {}
        
        for strategy_name in self.config.strategies:
            if strategy_name == "data-testid-recovery":
                strategies[strategy_name] = DataTestIdRecoveryStrategy()
            elif strategy_name == "text-content-matching":
                strategies[strategy_name] = TextContentMatchingStrategy()
            elif strategy_name == "css-hierarchy-analysis":
                strategies[strategy_name] = CSSHierarchyAnalysisStrategy()
            elif strategy_name == "ai-powered-analysis":
                strategies[strategy_name] = AIPoweredAnalysisStrategy(
                    ollama_url=self.config.ollama_url,
                    model=self.config.ollama_model,
                )
        
        return strategies
    
    def heal(
        self,
        page: Page,
        broken_selector: str,
        expected_type: Optional[str] = None,
    ) -> HealingResult:
        """Attempt to heal a broken selector.
        
        Args:
            page: Playwright page object
            broken_selector: The broken selector to heal
            expected_type: Expected element type (e.g., 'button', 'input')
        
        Returns:
            HealingResult with success status and healed selector
        """
        if not self.config.enabled:
            return HealingResult(
                success=False,
                selector=broken_selector,
                confidence=0.0,
                strategy="disabled",
                error="Healing is disabled",
            )
        
        # Check cache first
        if self.config.cache_healing and broken_selector in self._cache:
            self._stats.cache_hits += 1
            self._cache_uses[broken_selector] += 1
            logger.info(f"Cache hit for selector: {broken_selector}")
            return HealingResult(
                success=True,
                selector=self._cache[broken_selector],
                confidence=1.0,
                strategy="cache",
            )
        
        # Check if selector exists (no healing needed)
        try:
            if page.query_selector(broken_selector):
                logger.info(f"Selector exists, no healing needed: {broken_selector}")
                self._track_success(broken_selector)
                return HealingResult(
                    success=True,
                    selector=broken_selector,
                    confidence=1.0,
                    strategy="no-healing-needed",
                )
        except Exception as e:
            logger.debug(f"Error checking selector existence: {e}")
        
        # Try each strategy
        self._stats.attempts += 1
        
        for strategy_name, strategy in self._strategies.items():
            try:
                logger.info(f"Trying strategy: {strategy_name}")
                result = strategy.heal(page, broken_selector, expected_type)
                
                if result.success:
                    logger.info(f"Healed successfully using {strategy_name}")
                    self._stats.successes += 1
                    self._track_success(broken_selector)
                    
                    # Cache the result
                    if self.config.cache_healing:
                        self._cache[broken_selector] = result.selector
                    
                    return result
            
            except Exception as e:
                logger.error(f"Strategy {strategy_name} failed: {e}")
        
        # All strategies failed
        logger.warning(f"All healing strategies failed for: {broken_selector}")
        self._stats.failures += 1
        self._track_failure(broken_selector)
        
        return HealingResult(
            success=False,
            selector=broken_selector,
            confidence=0.0,
            strategy="all-strategies-failed",
            error="Unable to heal selector with any strategy",
        )
    
    def register_strategy(self, strategy: HealingStrategy) -> None:
        """Register a custom healing strategy.
        
        Args:
            strategy: Custom healing strategy to register
        """
        self._strategies[strategy.name] = strategy
        logger.info(f"Registered custom strategy: {strategy.name}")
    
    def get_flakiness_stats(self) -> List[FlakinessItem]:
        """Get flakiness statistics for all selectors.
        
        Returns:
            List of flakiness items
        """
        items = []
        for selector, data in self._flakiness_tracker.items():
            total = data["successes"] + data["failures"]
            if total > 0:
                flakiness_score = data["failures"] / total
                items.append(
                    FlakinessItem(
                        selector=selector,
                        successes=data["successes"],
                        failures=data["failures"],
                        flakiness_score=flakiness_score,
                    )
                )
        return sorted(items, key=lambda x: x.flakiness_score, reverse=True)
    
    def health_check(self, page: Optional[Page] = None) -> dict:
        """Perform a health check of the healing engine.
        
        Args:
            page: Optional page to check strategies against
        
        Returns:
            Health check results
        """
        return {
            "status": "healthy" if self.config.enabled else "disabled",
            "strategies": {
                name: "available" for name in self._strategies.keys()
            },
            "cache": {
                "size": len(self._cache),
                "most_used": sorted(
                    self._cache_uses.items(),
                    key=lambda x: x[1],
                    reverse=True,
                )[:5],
            },
        }
    
    def clear_cache(self) -> None:
        """Clear the healing cache."""
        self._cache.clear()
        self._cache_uses.clear()
        logger.info("Healing cache cleared")
    
    def get_stats(self) -> HealingStats:
        """Get healing statistics.
        
        Returns:
            HealingStats object
        """
        self._stats.flaky_selectors = self.get_flakiness_stats()
        return self._stats
    
    def _track_success(self, selector: str) -> None:
        """Track a successful selector use."""
        self._flakiness_tracker[selector]["successes"] += 1
    
    def _track_failure(self, selector: str) -> None:
        """Track a failed selector use."""
        self._flakiness_tracker[selector]["failures"] += 1
