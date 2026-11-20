from fastapi.testclient import TestClient


def test_register_login_and_me_lifecycle(client: TestClient):
    register_res = client.post(
        "/api/user/register",
        json={"email": "  Nino.Kircher@Example.COM ", "password": "MySecretPassword1!"},
    )
    assert register_res.status_code == 201
    reg_body = register_res.json()
    assert reg_body["user"]["email"] == "nino.kircher@example.com"
    assert isinstance(reg_body["token"], str) and len(reg_body["token"]) > 20

    login_res = client.post(
        "/api/user/login",
        json={"email": "nino.kircher@example.com", "password": "MySecretPassword1!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    me_res = client.get("/api/user/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "nino.kircher@example.com"


def test_register_duplicate_email_returns_409(client: TestClient):
    payload = {"email": "duplicate@manganitor.test", "password": "Password123!"}
    first = client.post("/api/user/register", json=payload)
    second = client.post("/api/user/register", json=payload)

    assert first.status_code == 201
    assert second.status_code == 409


def test_login_wrong_password_returns_401(client: TestClient):
    client.post(
        "/api/user/register",
        json={"email": "user@manganitor.test", "password": "CorrectPassword1!"},
    )
    res = client.post(
        "/api/user/login",
        json={"email": "user@manganitor.test", "password": "WrongPassword!"},
    )
    assert res.status_code == 401


def test_me_rejects_invalid_or_missing_token(client: TestClient):
    no_header = client.get("/api/user/me")
    bad_token = client.get("/api/user/me", headers={"Authorization": "Bearer invalid.jwt.token"})

    assert no_header.status_code in (401, 403)
    assert bad_token.status_code == 401