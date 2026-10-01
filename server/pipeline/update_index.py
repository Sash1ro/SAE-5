import json
import shutil
from pathlib import Path
import cv2

from config import PENDING_DIR, PROCESSED_DIR, INDEX_FILE, VERSION_FILE
from pipeline.augment import generate_augmented_views
from pipeline.extract import extract_embedding_from_cv2

def run_batch_update() -> int:
    PENDING_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)

    if not INDEX_FILE.exists():
        index_data = {"labels": [], "embeddings": []}
    else:
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            index_data = json.load(f)

    if not VERSION_FILE.exists():
        version_data = {"version": 1}
    else:
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            version_data = json.load(f)

    metadata_files = list(PENDING_DIR.glob("*.json"))
    if not metadata_files:
        return 0

    added_count = 0

    for meta_path in metadata_files:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        img_name = meta.get("image_name")
        img_path = PENDING_DIR / img_name
        if not img_path.exists():
            continue

        cv_img = cv2.imread(str(img_path))
        if cv_img is None:
            continue

        universe_clean = meta["universe"].lower().strip().replace(" ", "_")
        tome_num = str(meta["tome"]).strip()
        label = f"{universe_clean}_tome_{tome_num}"

        views = generate_augmented_views(cv_img, num_views=3)

        for view in views:
            emb = extract_embedding_from_cv2(view)
            index_data["labels"].append(label)
            index_data["embeddings"].append(emb)

        added_count += 1

        shutil.move(str(img_path), str(PROCESSED_DIR / img_name))
        shutil.move(str(meta_path), str(PROCESSED_DIR / meta_path.name))

    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index_data, f)

    version_data["version"] = version_data.get("version", 1) + 1
    with open(VERSION_FILE, "w", encoding="utf-8") as f:
        json.dump(version_data, f)

    return added_count

if __name__ == "__main__":
    processed = run_batch_update()
    print(f"Index mis a jour. Entrees traitees : {processed}")