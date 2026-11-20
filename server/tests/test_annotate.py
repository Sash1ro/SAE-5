import cv2
import numpy as np
import pytest

from pipeline.annotate import BOX_COLOR, MAX_DIMENSION, annotate_detection


def _decode_bgr(image_bytes: bytes) -> np.ndarray:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    assert img is not None
    return img


def _has_annotation_green(img: np.ndarray) -> bool:
    target = np.array(BOX_COLOR, dtype=np.int16)
    diff = np.abs(img.astype(np.int16) - target).max(axis=2)
    return bool(np.any(diff < 25))


def test_annotate_with_explicit_yolo_box(make_jpeg_bytes):
    raw = make_jpeg_bytes(width=800, height=1000)
    annotated = annotate_detection(raw, 120.0, 150.0, 680.0, 850.0, "One Piece T.1", 0.93)
    img = _decode_bgr(annotated)

    assert img.shape[1] == 800
    assert img.shape[0] == 1000
    assert _has_annotation_green(img)


def test_annotate_fallback_full_frame_when_box_is_none(make_jpeg_bytes):
    raw = make_jpeg_bytes(width=600, height=840)
    annotated = annotate_detection(raw, None, None, None, None, "Bleach T.1", 0.84)
    img = _decode_bgr(annotated)

    assert img.shape[1] == 600
    assert img.shape[0] == 840
    assert _has_annotation_green(img)

    margin_x = max(8, int(round(600 * 0.025)))
    margin_y = max(8, int(round(840 * 0.025)))
    top_border_patch = img[margin_y - 2 : margin_y + 3, 250:350]
    assert _has_annotation_green(top_border_patch)


@pytest.mark.parametrize(
    "width,height",
    [
        (3840, 2160),
        (2160, 3840),
        (2560, 2560),
    ],
)
def test_annotate_downscales_oversized_images_to_max_dimension(make_jpeg_bytes, width, height):
    raw = make_jpeg_bytes(width=width, height=height)
    annotated = annotate_detection(raw, 200.0, 200.0, 1500.0, 1800.0, "Naruto T.1", 0.88)
    img = _decode_bgr(annotated)

    assert max(img.shape[:2]) == MAX_DIMENSION
    assert _has_annotation_green(img)


def test_annotate_clamps_out_of_bounds_coordinates(make_jpeg_bytes):
    raw = make_jpeg_bytes(width=500, height=700)
    annotated = annotate_detection(raw, -50.0, -30.0, 9999.0, 9999.0, "Akira T.1", 0.75)
    img = _decode_bgr(annotated)

    assert img.shape[:2] == (700, 500)
    assert _has_annotation_green(img)


def test_annotate_returns_original_bytes_on_corrupted_input():
    corrupted = b"not-a-valid-jpeg-stream"
    result = annotate_detection(corrupted, 10.0, 10.0, 100.0, 100.0, "Test T.1", 0.9)
    assert result == corrupted