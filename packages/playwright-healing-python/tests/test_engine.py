"""Tests for the healing engine."""

import pytest
from playwright_healing import HealingEngine, HealingConfig
from playwright_healing.types import HealingResult


def test_healing_engine_initialization():
    """Test healing engine initialization."""
    config = HealingConfig(enabled=True, max_attempts=5)
    engine = HealingEngine(config)
    
    assert engine.config.enabled is True
    assert engine.config.max_attempts == 5


def test_healing_config_from_env(monkeypatch):
    """Test configuration loading from environment variables."""
    monkeypatch.setenv("HEALING_ENABLED", "false")
    monkeypatch.setenv("HEALING_MAX_ATTEMPTS", "10")
    
    config = HealingConfig()
    
    assert config.enabled is False
    assert config.max_attempts == 10


def test_healing_result_creation():
    """Test healing result creation."""
    result = HealingResult(
        success=True,
        selector=".new-selector",
        confidence=0.95,
        strategy="data-testid-recovery",
    )
    
    assert result.success is True
    assert result.selector == ".new-selector"
    assert result.confidence == 0.95
    assert result.strategy == "data-testid-recovery"


def test_flakiness_tracking():
    """Test flakiness tracking."""
    engine = HealingEngine()
    
    # Simulate successes and failures
    engine._track_success("selector-1")
    engine._track_success("selector-1")
    engine._track_failure("selector-1")
    
    flakiness = engine.get_flakiness_stats()
    
    assert len(flakiness) == 1
    assert flakiness[0].selector == "selector-1"
    assert flakiness[0].successes == 2
    assert flakiness[0].failures == 1
    assert flakiness[0].flakiness_score == pytest.approx(0.333, abs=0.01)


def test_cache_clearing():
    """Test cache clearing."""
    engine = HealingEngine()
    engine._cache["test"] = "value"
    
    assert len(engine._cache) == 1
    
    engine.clear_cache()
    
    assert len(engine._cache) == 0
