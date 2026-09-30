import random
import cv2
import numpy as np

def apply_glare(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    overlay = image.copy()
    center_x = random.randint(int(w * 0.2), int(w * 0.8))
    center_y = random.randint(int(h * 0.1), int(h * 0.5))
    axes = (random.randint(int(w * 0.3), int(w * 0.6)), random.randint(int(h * 0.1), int(h * 0.3)))
    angle = random.randint(-30, 30)

    cv2.ellipse(overlay, (center_x, center_y), axes, angle, 0, 360, (255, 255, 255), -1)
    overlay = cv2.GaussianBlur(overlay, (101, 101), 0)
    alpha = random.uniform(0.10, 0.25)
    return cv2.addWeighted(overlay, alpha, image, 1 - alpha, 0)

def generate_augmented_views(cv_image: np.ndarray, num_views: int = 3) -> list[np.ndarray]:
    h, w = cv_image.shape[:2]
    views = [cv_image]

    pts1 = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    max_jitter = int(min(w, h) * 0.07)

    for _ in range(num_views):
        cover = cv_image.copy()
        if random.random() > 0.3:
            cover = apply_glare(cover)

        if random.random() > 0.4:
            alpha = random.uniform(0.85, 1.15)
            beta = random.randint(-15, 15)
            cover = cv2.convertScaleAbs(cover, alpha=alpha, beta=beta)

        pts2 = np.float32([
            [random.randint(-max_jitter, max_jitter), random.randint(-max_jitter, max_jitter)],
            [w + random.randint(-max_jitter, max_jitter), random.randint(-max_jitter, max_jitter)],
            [w + random.randint(-max_jitter, max_jitter), h + random.randint(-max_jitter, max_jitter)],
            [random.randint(-max_jitter, max_jitter), h + random.randint(-max_jitter, max_jitter)]
        ])

        min_x = min(pts2[:, 0])
        min_y = min(pts2[:, 1])
        pts2[:, 0] -= min_x
        pts2[:, 1] -= min_y
        warped_w = int(max(pts2[:, 0]))
        warped_h = int(max(pts2[:, 1]))

        matrix = cv2.getPerspectiveTransform(pts1, pts2)
        warped = cv2.warpPerspective(cover, matrix, (warped_w, warped_h), borderMode=cv2.BORDER_REPLICATE)
        views.append(warped)

    return views