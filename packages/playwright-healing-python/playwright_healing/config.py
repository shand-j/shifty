"""Configuration for the healing engine."""

import os
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class HealingConfig:
    """Configuration for the healing engine.
    
    Attributes:
        enabled: Whether healing is enabled
        strategies: List of healing strategy names to use
        max_attempts: Maximum number of healing attempts per selector
        cache_healing: Whether to cache successfully healed selectors
        ollama_url: URL of the Ollama API endpoint
        ollama_model: Ollama model to use for AI-powered healing
        ollama_timeout: Timeout for Ollama API calls in milliseconds
        retry_on_timeout: Whether to retry on timeout errors
        retry_on_flakiness: Whether to retry on flaky selectors
        max_retries: Maximum number of retries
        initial_backoff: Initial backoff delay in milliseconds
        telemetry_enabled: Whether to enable telemetry logging
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
    """
    
    enabled: bool = True
    strategies: Optional[List[str]] = None
    max_attempts: int = 3
    cache_healing: bool = True
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    ollama_timeout: int = 30000
    retry_on_timeout: bool = True
    retry_on_flakiness: bool = True
    max_retries: int = 2
    initial_backoff: int = 1000
    telemetry_enabled: bool = True
    log_level: str = "INFO"
    
    def __post_init__(self) -> None:
        """Initialize default strategies if none provided."""
        if self.strategies is None:
            self.strategies = [
                "data-testid-recovery",
                "text-content-matching",
                "css-hierarchy-analysis",
                "ai-powered-analysis",
            ]
        
        # Override with environment variables if set
        self._load_from_env()
    
    def _load_from_env(self) -> None:
        """Load configuration from environment variables."""
        if os.getenv("HEALING_ENABLED") is not None:
            self.enabled = os.getenv("HEALING_ENABLED", "true").lower() == "true"
        
        if os.getenv("HEALING_STRATEGIES"):
            self.strategies = os.getenv("HEALING_STRATEGIES", "").split(",")
        
        if os.getenv("HEALING_MAX_ATTEMPTS"):
            self.max_attempts = int(os.getenv("HEALING_MAX_ATTEMPTS", "3"))
        
        if os.getenv("HEALING_CACHE"):
            self.cache_healing = os.getenv("HEALING_CACHE", "true").lower() == "true"
        
        if os.getenv("OLLAMA_URL"):
            self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        
        if os.getenv("OLLAMA_MODEL"):
            self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
        
        if os.getenv("OLLAMA_TIMEOUT"):
            self.ollama_timeout = int(os.getenv("OLLAMA_TIMEOUT", "30000"))
        
        if os.getenv("RETRY_ON_TIMEOUT"):
            self.retry_on_timeout = os.getenv("RETRY_ON_TIMEOUT", "true").lower() == "true"
        
        if os.getenv("RETRY_ON_FLAKINESS"):
            self.retry_on_flakiness = os.getenv("RETRY_ON_FLAKINESS", "true").lower() == "true"
        
        if os.getenv("MAX_RETRIES"):
            self.max_retries = int(os.getenv("MAX_RETRIES", "2"))
        
        if os.getenv("INITIAL_BACKOFF"):
            self.initial_backoff = int(os.getenv("INITIAL_BACKOFF", "1000"))


# Global configuration instance
_global_config: Optional[HealingConfig] = None


def configure_healing(**kwargs) -> HealingConfig:
    """Configure global healing settings.
    
    Args:
        **kwargs: Configuration options (see HealingConfig)
    
    Returns:
        The global HealingConfig instance
    """
    global _global_config
    _global_config = HealingConfig(**kwargs)
    return _global_config


def get_config() -> HealingConfig:
    """Get the global healing configuration.
    
    Returns:
        The global HealingConfig instance (creates default if not set)
    """
    global _global_config
    if _global_config is None:
        _global_config = HealingConfig()
    return _global_config
