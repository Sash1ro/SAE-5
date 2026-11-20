from typing import Optional
import cv2
import numpy as np

MAX_DIMENSION = 1280
JPEG_QUALITY = 85
BOX_COLOR = (60, 210, 40)
TEXT_COLOR = (15, 15, 15)


def annotate_detection(
    image_bytes: bytes,
    x1: Optional[float],
    y1: Optional[float],
    x2: Optional[float],
    y2: Optional[float],
    label: str,
    confidence: float = 0.0,
) -> bytes:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR | cv2.IMREAD_IGNORE_ORIENTATION)
    if img is None:
        return image_bytes

    orig_h, orig_w = img.shape[:2]
    scale = min(1.0, MAX_DIMENSION / max(orig_w, orig_h))

    if scale < 1.0:
        new_w = int(round(orig_w * scale))
        new_h = int(round(orig_h * scale))
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    else:
        new_w, new_h = orig_w, orig_h

    if x1 is not None and y1 is not None and x2 is not None and y2 is not None:
        px1 = max(0, min(new_w - 1, int(round(x1 * scale))))
        py1 = max(0, min(new_h - 1, int(round(y1 * scale))))
        px2 = max(0, min(new_w - 1, int(round(x2 * scale))))
        py2 = max(0, min(new_h - 1, int(round(y2 * scale))))
    else:
        margin_x = max(8, int(round(new_w * 0.025)))
        margin_y = max(8, int(round(new_h * 0.025)))
        px1 = margin_x
        py1 = margin_y
        px2 = new_w - margin_x
        py2 = new_h - margin_y

    if px2 <= px1 or py2 <= py1:
        return image_bytes

    ref_size = max(new_w, new_h)
    thickness = max(2, int(round(ref_size / 320)))
    font_scale = max(0.55, ref_size / 1150)
    font = cv2.FONT_HERSHEY_SIMPLEX

    cv2.rectangle(img, (px1, py1), (px2, py2), BOX_COLOR, thickness)

    caption = f"{label} ({confidence * 100:.0f}%)" if confidence > 0 else label
    (text_w, text_h), baseline = cv2.getTextSize(caption, font, font_scale, thickness)
    pad = max(6, thickness * 2)

    bg_x1 = px1
    bg_x2 = min(new_w, px1 + text_w + pad * 2)
    box_height = text_h + baseline + pad * 2

    if py1 - box_height >= 0:
        bg_y1 = py1 - box_height
        bg_y2 = py1
    else:
        bg_y1 = py1
        bg_y2 = min(new_h, py1 + box_height)

    cv2.rectangle(img, (bg_x1, bg_y1), (bg_x2, bg_y2), BOX_COLOR, -1)
    cv2.putText(
        img,
        caption,
        (bg_x1 + pad, bg_y2 - pad - baseline // 2),
        font,
        font_scale,
        TEXT_COLOR,
        thickness,
        cv2.LINE_AA,
    )

    ok, encoded = cv2.imencode(
        ".jpg",
        img,
        [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY],
    )
    return encoded.tobytes() if ok else image_bytes