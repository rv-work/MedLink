import os
import base64
import io
import uuid
import numpy as np
from PIL import Image
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, Distance, VectorParams

# ==============================================
# Load environment variables
# ==============================================
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# ==============================================
# FastAPI setup
# ==============================================
app = FastAPI(title="MedLink Face API", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================
# Qdrant setup
# ==============================================
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)

COLLECTION_NAME = "face_vectors"

try:
    if not client.collection_exists(collection_name=COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=512, distance=Distance.COSINE)
        )
except Exception as e:
    print("⚠️ Qdrant init error:", e)

# ==============================================
# Load SFace model once (Render-safe)
# ==============================================
print("🧠 Loading lightweight SFace model...")
try:
    sface_model = DeepFace.build_model("SFace")
    print("✅ SFace model loaded successfully.")
except Exception as e:
    print("❌ Model load failed:", e)
    sface_model = None

# ==============================================
# Payload Schemas
# ==============================================
class SignupPayload(BaseModel):
    image: str
    userId: str

class EmergencyPayload(BaseModel):
    image: str

# ==============================================
# Utility Functions
# ==============================================
def base64_to_image(b64_string: str) -> Image.Image:
    """Convert base64 to Pillow image, resized to reduce memory use."""
    try:
        image_data = base64.b64decode(b64_string)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        image = image.resize((512, 512))
        return image
    except Exception as e:
        print("⚠️ base64_to_image error:", e)
        return None

def get_face_embedding(image: Image.Image):
    """Generate embedding from an image using preloaded SFace model."""
    if sface_model is None:
        return None
    try:
        img_array = np.array(image)
        embedding = DeepFace.represent(
            img_path=img_array,
            model_name="SFace",
            model=sface_model,
            enforce_detection=False
        )
        return embedding[0]["embedding"]
    except Exception as e:
        print("⚠️ get_face_embedding error:", e)
        return None

# ==============================================
# API Routes
# ==============================================
@app.post("/signup")
def signup(payload: SignupPayload):
    print(f"🧾 Signup request for userId: {payload.userId}")

    image = base64_to_image(payload.image)
    if not image:
        return {"status": "error", "message": "Invalid image data"}

    vector = get_face_embedding(image)
    if vector is None:
        return {"status": "error", "message": "No face detected"}

    try:
        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"userId": payload.userId}
        )
        client.upsert(collection_name=COLLECTION_NAME, points=[point])
        return {"status": "success", "message": "User face embedding stored"}
    except Exception as e:
        print("⚠️ signup error:", e)
        return {"status": "error", "message": str(e)}

@app.post("/emergency")
def emergency(payload: EmergencyPayload):
    print("🚨 Emergency match request received")

    image = base64_to_image(payload.image)
    if not image:
        return {"status": "error", "message": "Invalid image data"}

    vector = get_face_embedding(image)
    if vector is None:
        return {"status": "error", "message": "No face detected"}

    try:
        results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=vector,
            limit=5
        )

        matches = [
            {"userId": p.payload.get("userId"), "score": p.score}
            for p in results
        ]
        return {"status": "success", "matches": matches}
    except Exception as e:
        print("⚠️ emergency error:", e)
        return {"status": "error", "message": str(e)}

@app.get("/all-data")
def get_all_data():
    """Fetch all stored embeddings with userIds."""
    try:
        all_points = []
        scroll_offset = None

        while True:
            response = client.scroll(
                collection_name=COLLECTION_NAME,
                offset=scroll_offset,
                limit=50,
                with_payload=True,
                with_vectors=False
            )
            all_points.extend(response[0])
            if response[1] is None:
                break
            scroll_offset = response[1]

        formatted = [
            {"id": p.id, "userId": p.payload.get("userId")}
            for p in all_points
        ]
        return {"status": "success", "count": len(formatted), "data": formatted}
    except Exception as e:
        print("⚠️ all-data error:", e)
        return {"status": "error", "message": str(e)}

@app.get("/health")
def health():
    """Health check for Render monitoring."""
    try:
        client.get_collections()
        qdrant_status = "connected"
    except Exception as e:
        qdrant_status = f"error: {e}"

    return {
        "status": "ok",
        "model_loaded": sface_model is not None,
        "qdrant": qdrant_status,
        "message": "Face recognition API is alive 🚀"
    }

# ==============================================
# Render Entrypoint
# ==============================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
