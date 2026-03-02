"""Backend test suite for PathWise core flows."""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone, timedelta
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))


# ============================================================
# Security Tests
# ============================================================

class TestPasswordValidation:
    """Test password strength validation."""

    def test_weak_password_too_short(self):
        """Password under 8 chars should be rejected."""
        from app.core.security import validate_password_strength
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("Ab1")
        assert "8 characters" in exc_info.value.detail

    def test_weak_password_no_uppercase(self):
        """Password without uppercase should be rejected."""
        from app.core.security import validate_password_strength
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("abcdefg1")
        assert "uppercase" in exc_info.value.detail

    def test_weak_password_no_lowercase(self):
        """Password without lowercase should be rejected."""
        from app.core.security import validate_password_strength
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("ABCDEFG1")
        assert "lowercase" in exc_info.value.detail

    def test_weak_password_no_digit(self):
        """Password without digit should be rejected."""
        from app.core.security import validate_password_strength
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_password_strength("Abcdefgh")
        assert "number" in exc_info.value.detail

    def test_strong_password_passes(self):
        """Strong password should pass validation."""
        from app.core.security import validate_password_strength

        # Should not raise
        validate_password_strength("Str0ngPass!")

    def test_password_hashing(self):
        """Password hash should verify correctly."""
        from app.core.security import get_password_hash, verify_password

        password = "TestP@ss123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed)
        assert not verify_password("wrong", hashed)

    def test_password_hash_is_unique(self):
        """Same password should produce different hashes (salt)."""
        from app.core.security import get_password_hash

        hash1 = get_password_hash("SamePass1!")
        hash2 = get_password_hash("SamePass1!")
        assert hash1 != hash2


class TestJWTTokens:
    """Test JWT token creation and verification."""

    def test_create_access_token(self):
        """Access token should be created successfully."""
        from app.core.security import create_access_token

        token = create_access_token(data={"sub": "user-123"})
        assert isinstance(token, str)
        assert len(token) > 20

    def test_decode_valid_token(self):
        """Valid token should decode correctly."""
        from app.core.security import create_access_token, decode_token

        token = create_access_token(data={"sub": "user-456"})
        payload = decode_token(token)

        assert payload["sub"] == "user-456"
        assert payload["type"] == "access"

    def test_expired_token_raises(self):
        """Expired token should raise HTTP 401."""
        from app.core.security import create_access_token, decode_token
        from fastapi import HTTPException

        token = create_access_token(
            data={"sub": "user-789"},
            expires_delta=timedelta(seconds=-1)
        )

        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)
        assert exc_info.value.status_code == 401

    def test_create_refresh_token(self):
        """Refresh token should have 'refresh' type."""
        from app.core.security import create_refresh_token, decode_token

        token = create_refresh_token(data={"sub": "user-abc"})
        payload = decode_token(token)

        assert payload["type"] == "refresh"

    def test_token_uses_timezone_aware_expiry(self):
        """Token expiry should use timezone-aware datetime."""
        from app.core.security import create_access_token, decode_token

        token = create_access_token(data={"sub": "user-tz"})
        payload = decode_token(token)

        # 'exp' should be a future timestamp
        assert payload["exp"] > datetime.now(timezone.utc).timestamp() - 60


class TestProductionGuards:
    """Test production environment validation."""

    def test_dev_environment_allows_defaults(self):
        """Development environment should not crash with defaults."""
        from app.core.config import Settings

        settings = Settings()
        # Should not raise in development
        settings.validate_production()

    def test_production_rejects_default_secret(self):
        """Production should crash if SECRET_KEY is default."""
        from app.core.config import Settings

        settings = Settings()
        settings.ENVIRONMENT = "production"

        with pytest.raises(RuntimeError, match="SECRET_KEY"):
            settings.validate_production()


# ============================================================
# Skill Decay Tests
# ============================================================

class TestSkillDecay:
    """Test skill decay calculation logic."""

    def test_no_decay_for_zero_days(self):
        """Skills practiced today should have no decay."""
        from app.api.v1.endpoints.skill_decay import calculate_decay

        assert calculate_decay(0) == 0.0

    def test_decay_increases_over_time(self):
        """Older skills should decay more."""
        from app.api.v1.endpoints.skill_decay import calculate_decay

        day3 = calculate_decay(3)
        day7 = calculate_decay(7)
        day14 = calculate_decay(14)

        assert day3 < day7 < day14

    def test_decay_status_classification(self):
        """Status should classify correctly based on days idle."""
        from app.api.v1.endpoints.skill_decay import get_decay_status

        assert get_decay_status(0) == "fresh"
        assert get_decay_status(3) == "fresh"
        assert get_decay_status(5) == "fading"
        assert get_decay_status(10) == "stale"
        assert get_decay_status(20) == "critical"

    def test_decay_capped_at_base(self):
        """Decay should never exceed the original readiness."""
        from app.api.v1.endpoints.skill_decay import calculate_decay

        # Even after 365 days, decay shouldn't exceed 100
        assert calculate_decay(365, 100.0) <= 100.0


# ============================================================
# Company Paths Tests
# ============================================================

class TestCompanyPaths:
    """Test company-specific preparation data."""

    def test_all_companies_have_required_fields(self):
        """Each company profile should have all required fields."""
        from app.api.v1.endpoints.company_paths import COMPANY_PROFILES

        for key, profile in COMPANY_PROFILES.items():
            assert "name" in profile, f"{key} missing name"
            assert "focus_areas" in profile, f"{key} missing focus_areas"
            assert "interview_style" in profile, f"{key} missing interview_style"
            assert "tech_stack" in profile, f"{key} missing tech_stack"
            assert "difficulty" in profile, f"{key} missing difficulty"
            assert "rounds" in profile, f"{key} missing rounds"
            assert "tips" in profile, f"{key} missing tips"
            assert len(profile["tips"]) >= 2, f"{key} needs at least 2 tips"

    def test_mena_companies_included(self):
        """MENA region companies should be in the profiles."""
        from app.api.v1.endpoints.company_paths import COMPANY_PROFILES

        assert "careem" in COMPANY_PROFILES
        assert "mursalat" in COMPANY_PROFILES


# ============================================================
# Sharing Tests
# ============================================================

class TestReferralCodes:
    """Test referral code generation."""

    def test_referral_code_format(self):
        """Referral codes should follow PW-XXXXXXXX format."""
        from app.api.v1.endpoints.sharing import generate_referral_code

        code = generate_referral_code("test-user-id")
        assert code.startswith("PW-")
        assert len(code) == 11  # PW- + 8 hex chars

    def test_referral_code_deterministic(self):
        """Same user ID should produce same referral code."""
        from app.api.v1.endpoints.sharing import generate_referral_code

        code1 = generate_referral_code("user-abc")
        code2 = generate_referral_code("user-abc")
        assert code1 == code2

    def test_different_users_different_codes(self):
        """Different users should get different codes."""
        from app.api.v1.endpoints.sharing import generate_referral_code

        code1 = generate_referral_code("user-1")
        code2 = generate_referral_code("user-2")
        assert code1 != code2
