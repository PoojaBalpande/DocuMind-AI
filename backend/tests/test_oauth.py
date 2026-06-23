import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.user import User

client = TestClient(app)


def test_first_time_google_signup():
    """Test that a first-time Google sign-in automatically registers a new user."""
    test_email = "newuser@example.com"
    test_sub = "googlesubnewuser123"
    test_name = "OAuth New User"

    # Step 1: Clean up any existing test user
    with SessionLocal() as db:
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()

    mock_token = f"mock_google_token:{test_email}:{test_sub}:{test_name}"

    try:
        # Step 2: Make the API call
        response = client.post("/api/auth/google", json={"id_token": mock_token})
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # Step 3: Verify the record in a fresh session
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == test_email).first()
            assert user is not None
            assert user.name == test_name
            assert user.oauth_provider == "google"
            assert user.google_sub == test_sub
            assert user.hashed_password is None
            assert user.is_active is True
    finally:
        # Step 4: Clean up
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == test_email).first()
            if user:
                db.delete(user)
                db.commit()


def test_existing_user_google_signin():
    """Test that an existing email user logging in with Google automatically links the account."""
    test_email = "existinguser@example.com"
    test_sub = "googlesubexistinguser456"

    # Step 1: Setup the existing native user
    with SessionLocal() as db:
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()

        user = User(
            name="Existing User",
            email=test_email,
            hashed_password="placeholder_hash_value"
        )
        db.add(user)
        db.commit()

    mock_token = f"mock_google_token:{test_email}:{test_sub}:Existing User"

    try:
        # Step 2: Make the API call
        response = client.post("/api/auth/google", json={"id_token": mock_token})
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

        # Step 3: Verify linking in a fresh session
        with SessionLocal() as db:
            updated_user = db.query(User).filter(User.email == test_email).first()
            assert updated_user is not None
            assert updated_user.google_sub == test_sub
            assert updated_user.oauth_provider == "google"
            assert updated_user.hashed_password == "placeholder_hash_value"  # Hash is preserved
    finally:
        # Step 4: Clean up
        with SessionLocal() as db:
            user = db.query(User).filter(User.email == test_email).first()
            if user:
                db.delete(user)
                db.commit()


def test_invalid_google_token():
    """Test that an invalid token or verification failure returns a 401 response."""
    response = client.post("/api/auth/google", json={"id_token": "invalid_mock_token_abc"})
    assert response.status_code == 401
    assert "detail" in response.json()
    assert "Google authentication failed" in response.json()["detail"]
