import torch
import torchvision.transforms as T
from PIL import Image
import numpy as np

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

_model = None
_transform = T.Compose([
    T.Resize((518, 518)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def get_model():
    global _model
    if _model is None:
        _model = torch.hub.load("facebookresearch/dinov2", "dinov2_vits14").to(DEVICE)
        _model.eval()
    return _model

def extract_embedding_from_cv2(cv_image: np.ndarray) -> list[float]:
    rgb_image = cv_image[:, :, ::-1]
    pil_img = Image.fromarray(rgb_image).convert("RGB")
    model = get_model()
    tensor = _transform(pil_img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        emb = model(tensor)
        emb = torch.nn.functional.normalize(emb, dim=-1)
    return emb[0].cpu().tolist()