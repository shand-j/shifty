"""Base strategy interface and implementations."""

from abc import ABC, abstractmethod
from typing import Optional
import Levenshtein
import re

try:
    from playwright.sync_api import Page
except ImportError:
    Page = None  # type: ignore

from .types import HealingResult


class HealingStrategy(ABC):
    """Base class for healing strategies."""
    
    name: str = "base-strategy"
    
    @abstractmethod
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
        pass


class DataTestIdRecoveryStrategy(HealingStrategy):
    """Strategy for recovering test IDs using Levenshtein distance."""
    
    name = "data-testid-recovery"
    
    TEST_ID_ATTRIBUTES = [
        "data-testid",
        "data-test-id",
        "data-cy",
        "data-test",
        "testid",
    ]
    
    def heal(
        self,
        page: Page,
        broken_selector: str,
        expected_type: Optional[str] = None,
    ) -> HealingResult:
        """Heal using data-testid attributes with fuzzy matching."""
        try:
            # Extract test ID from broken selector
            test_id = self._extract_test_id(broken_selector)
            if not test_id:
                return HealingResult(
                    success=False,
                    selector=broken_selector,
                    confidence=0.0,
                    strategy=self.name,
                    error="No test ID pattern found in selector",
                )
            
            # Get all elements with test ID attributes
            candidates = []
            for attr in self.TEST_ID_ATTRIBUTES:
                elements = page.query_selector_all(f"[{attr}]")
                for element in elements:
                    element_id = element.get_attribute(attr)
                    if element_id:
                        similarity = self._calculate_similarity(test_id, element_id)
                        if similarity > 0.6:  # 60% threshold
                            candidates.append({
                                "selector": f'[{attr}="{element_id}"]',
                                "similarity": similarity,
                                "test_id": element_id,
                            })
            
            # Sort by similarity
            candidates.sort(key=lambda x: x["similarity"], reverse=True)
            
            if candidates:
                best = candidates[0]
                return HealingResult(
                    success=True,
                    selector=best["selector"],
                    confidence=best["similarity"],
                    strategy=self.name,
                    alternatives=[c["selector"] for c in candidates[1:5]],
                    metadata={
                        "original_test_id": test_id,
                        "found_test_id": best["test_id"],
                    },
                )
            
            return HealingResult(
                success=False,
                selector=broken_selector,
                confidence=0.0,
                strategy=self.name,
                error="No matching test IDs found",
            )
        
        except Exception as e:
            return HealingResult(
                success=False,
                selector=broken_selector,
                confidence=0.0,
                strategy=self.name,
                error=str(e),
            )
    
    def _extract_test_id(self, selector: str) -> Optional[str]:
        """Extract test ID from selector."""
        for attr in self.TEST_ID_ATTRIBUTES:
            pattern = rf'{attr}=["\']([^"\']+)["\']'
            match = re.search(pattern, selector)
            if match:
                return match.group(1)
        return None
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity using Levenshtein distance."""
        distance = Levenshtein.distance(str1.lower(), str2.lower())
        max_len = max(len(str1), len(str2))
        if max_len == 0:
            return 1.0
        return 1.0 - (distance / max_len)


class TextContentMatchingStrategy(HealingStrategy):
    """Strategy for matching based on text content."""
    
    name = "text-content-matching"
    
    def heal(
        self,
        page: Page,
        broken_selector: str,
        expected_type: Optional[str] = None,
    ) -> HealingResult:
        """Heal using text content fuzzy matching."""
        # Implementation placeholder
        # Real implementation would extract text from selector and find similar elements
        return HealingResult(
            success=False,
            selector=broken_selector,
            confidence=0.0,
            strategy=self.name,
            error="Text content matching implementation in progress",
        )


class CSSHierarchyAnalysisStrategy(HealingStrategy):
    """Strategy for analyzing CSS hierarchy and structure."""
    
    name = "css-hierarchy-analysis"
    
    def heal(
        self,
        page: Page,
        broken_selector: str,
        expected_type: Optional[str] = None,
    ) -> HealingResult:
        """Heal using CSS hierarchy analysis."""
        # Implementation placeholder
        # Real implementation would analyze DOM structure and suggest alternatives
        return HealingResult(
            success=False,
            selector=broken_selector,
            confidence=0.0,
            strategy=self.name,
            error="CSS hierarchy analysis implementation in progress",
        )


class AIPoweredAnalysisStrategy(HealingStrategy):
    """Strategy using AI (Ollama) for intelligent healing."""
    
    name = "ai-powered-analysis"
    
    def __init__(self, ollama_url: str = "http://localhost:11434", model: str = "llama3.1:8b"):
        """Initialize with Ollama configuration.
        
        Args:
            ollama_url: URL of Ollama API
            model: Model name to use
        """
        self.ollama_url = ollama_url
        self.model = model
    
    def heal(
        self,
        page: Page,
        broken_selector: str,
        expected_type: Optional[str] = None,
    ) -> HealingResult:
        """Heal using AI-powered analysis with Ollama."""
        # Implementation placeholder
        # Real implementation would:
        # 1. Extract page context and DOM
        # 2. Send to Ollama with prompt
        # 3. Parse AI suggestions
        # 4. Validate suggestions on page
        return HealingResult(
            success=False,
            selector=broken_selector,
            confidence=0.0,
            strategy=self.name,
            error="AI-powered analysis implementation in progress",
        )
