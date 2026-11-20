import base64

import cv2
import numpy as np
from fastapi.testclient import TestClient

from pipeline.annotate import BOX_COLOR


def _decoded_contains_green_box(image_b64: str) -> bool:
    raw = base64.b64decode(image_b64)
    img = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    assert img is not None
    diff = np.abs(img.astype(np.int16) - np.array(BOX_COLOR, dtype=np.int16)).max(axis=2)
    return bool(np.any(diff < 25))


def test_add_history_with_yolo_box_annotates_stored_image(
    client: TestClient,
    auth_headers: dict,
    make_jpeg_bytes,
):
    img_bytes = make_jpeg_bytes(width=700, height=950)
    res = client.post(
        "/api/user/history",
        data={
            "universe_name": "One Piece",
            "universe_volume": "1",
            "ia_confidence": "0.91",
            "ia_similarity": "0.85",
            "history_result": "success",
            "history_type": "detection",
            "box_x1": "100",
            "box_y1": "120",
            "box_x2": "580",
            "box_y2": "820",
        },
        files={"image": ("one_piece.jpg", img_bytes, "image/jpeg")},
        headers=auth_headers,
    )

    assert res.status_code == 201
    body = res.json()
    assert body["universe_name"] == "One Piece"
    assert body["box"] == {"x1": 100.0, "y1": 120.0, "x2": 580.0, "y2": 820.0}
    assert _decoded_contains_green_box(body["image_64"])


def test_add_history_without_box_triggers_fallback_annotation(
    client: TestClient,
    auth_headers: dict,
    make_jpeg_bytes,
):
    img_bytes = make_jpeg_bytes(width=640, height=900)
    res = client.post(
        "/api/user/history",
        data={
            "universe_name": "Chainsaw Man",
            "universe_volume": "4",
            "ia_confidence": "0.0",
            "ia_similarity": "0.87",
            "history_result": "success",
            "history_type": "detection",
        },
        files={"image": ("csm.jpg", img_bytes, "image/jpeg")},
        headers=auth_headers,
    )

    assert res.status_code == 201
    body = res.json()
    assert body["box"] is None
    assert _decoded_contains_green_box(body["image_64"])


def test_history_crud_and_user_isolation(
    client: TestClient,
    auth_headers: dict,
    second_auth_headers: dict,
    make_jpeg_bytes,
):
    img_bytes = make_jpeg_bytes()
    created_ids = []

    for volume in ("1", "2"):
        res = client.post(
            "/api/user/history",
            data={
                "universe_name": "Berserk",
                "universe_volume": volume,
                "ia_confidence": "0.80",
                "ia_similarity": "0.90",
                "history_result": "success",
                "history_type": "detection",
            },
            files={"image": (f"berserk_{volume}.jpg", img_bytes, "image/jpeg")},
            headers=auth_headers,
        )
        assert res.status_code == 201
        created_ids.append(res.json()["id"])

    list_res = client.get("/api/user/history", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 2

    forbidden_get = client.get(f"/api/user/history/{created_ids[0]}", headers=second_auth_headers)
    forbidden_del = client.delete(f"/api/user/history/{created_ids[0]}", headers=second_auth_headers)
    assert forbidden_get.status_code == 404
    assert forbidden_del.status_code == 404

    del_one = client.delete(f"/api/user/history/{created_ids[0]}", headers=auth_headers)
    assert del_one.status_code == 200

    clear_all = client.delete("/api/user/history", headers=auth_headers)
    assert clear_all.status_code == 204
    assert client.get("/api/user/history", headers=auth_headers).json() == []