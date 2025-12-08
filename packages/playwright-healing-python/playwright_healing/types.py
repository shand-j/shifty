"""Type definitions for the healing engine."""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any


@dataclass
class HealingResult:
    """Result of a healing attempt.
    
    Attributes:
        success: Whether healing was successful
        selector: The healed selector (or original if failed)
        confidence: Confidence score (0.0-1.0)
        strategy: Strategy used for healing
        alternatives: List of alternative selectors
        metadata: Additional metadata about the healing
        error: Error message if healing failed
    """
    
    success: bool
    selector: str
    confidence: float
    strategy: str
    alternatives: List[str] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    def __post_init__(self) -> None:
        """Initialize default values."""
        if self.alternatives is None:
            self.alternatives = []
        if self.metadata is None:
            self.metadata = {}


@dataclass
class FlakinessItem:
    """Information about a flaky selector.
    
    Attributes:
        selector: The selector
        successes: Number of successful attempts
        failures: Number of failed attempts
        flakiness_score: Flakiness score (0.0-1.0, higher is more flaky)
    """
    
    selector: str
    successes: int
    failures: int
    flakiness_score: float


@dataclass
class HealingStats:
    """Statistics about healing operations.
    
    Attributes:
        attempts: Total number of healing attempts
        successes: Number of successful healings
        failures: Number of failed healings
        cache_hits: Number of cache hits
        flaky_selectors: List of flaky selectors
    """
    
    attempts: int = 0
    successes: int = 0
    failures: int = 0
    cache_hits: int = 0
    flaky_selectors: List[FlakinessItem] = None
    
    def __post_init__(self) -> None:
        """Initialize default values."""
        if self.flaky_selectors is None:
            self.flaky_selectors = []
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.attempts == 0:
            return 0.0
        return self.successes / self.attempts
    
    @property
    def flakiness(self) -> float:
        """Calculate overall flakiness score."""
        if not self.flaky_selectors:
            return 0.0
        return sum(item.flakiness_score for item in self.flaky_selectors) / len(self.flaky_selectors)
