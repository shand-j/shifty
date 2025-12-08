"""
Playwright Healing - Autonomous selector healing engine for Playwright Python

This package provides automatic healing for broken selectors in Playwright tests
using multiple strategies including AI-powered analysis with Ollama.
"""

__version__ = "1.0.0"
__author__ = "Shifty AI"
__license__ = "MIT"

from .config import HealingConfig, configure_healing
from .engine import HealingEngine
from .page import HealingPage, AsyncHealingPage
from .types import HealingResult, HealingStats, FlakinessItem
from .strategies import (
    HealingStrategy,
    DataTestIdRecoveryStrategy,
    TextContentMatchingStrategy,
    CSSHierarchyAnalysisStrategy,
    AIPoweredAnalysisStrategy,
)

__all__ = [
    "__version__",
    "HealingConfig",
    "configure_healing",
    "HealingEngine",
    "HealingPage",
    "AsyncHealingPage",
    "HealingResult",
    "HealingStats",
    "FlakinessItem",
    "HealingStrategy",
    "DataTestIdRecoveryStrategy",
    "TextContentMatchingStrategy",
    "CSSHierarchyAnalysisStrategy",
    "AIPoweredAnalysisStrategy",
]
