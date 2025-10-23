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

load_dotenv()



QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)

COLLECTION_NAME = "face_vectors"

# ✅ Only create collection if it doesn't exist
if not client.collection_exists(collection_name=COLLECTION_NAME):
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=512, distance=Distance.COSINE)
    )

# Payload models
class SignupPayload(BaseModel):
    image: str
    userId: str

class EmergencyPayload(BaseModel):
    image: str

# Utils
def base64_to_image(b64_string: str) -> Image.Image:
    image_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(image_data)).convert("RGB")

def get_face_embedding(image: Image.Image):
    try:
        embedding = DeepFace.represent(
            img_path=np.array(image),
            model_name="ArcFace",
            enforce_detection=True
        )
        vector = embedding[0]["embedding"]
        print(f"Generated embedding size: {len(vector)}")
        return vector
    except Exception as e:
        print("Face detection error:", e)
        return None

# Routes
@app.post("/signup")
def signup(payload: SignupPayload):
    print("Signup called for userId:", payload.userId)
    image = base64_to_image(payload.image)
    vector = get_face_embedding(image)

    if vector is None:
        return {"status": "error", "message": "No face detected"}

    point = PointStruct(
        id=str(uuid.uuid4()),
        vector=vector,
        payload={"userId": payload.userId}
    )
    client.upsert(collection_name=COLLECTION_NAME, points=[point])

    return {"status": "success"}

@app.post("/emergency")
def emergency(payload: EmergencyPayload):
    image = base64_to_image(payload.image)
    vector = get_face_embedding(image)

    if vector is None:
        return {"status": "error", "message": "No face detected"}

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=vector,
        limit=10
    )

    matches = [
        {"userId": point.payload.get("userId"), "score": point.score}
        for point in results
    ]

    print("matches:", matches)
    return {"status": "success", "matches": matches}



@app.get("/all-data")
def get_all_data():
    all_points = []
    scroll_offset = None

    while True:
        response = client.scroll(
            collection_name=COLLECTION_NAME,
            offset=scroll_offset,
            limit=100,
            with_payload=True,
            with_vectors=False
        )

        all_points.extend(response[0])

        if response[1] is None:
            break

        scroll_offset = response[1]

    formatted_data = [
        {
            "id": point.id,
            "userId": point.payload.get("userId"),
        }
        for point in all_points
    ]

    return {"status": "success", "data": formatted_data}


@app.get("/health")
def health_check():
    try:
 
        client.get_collections()
        qdrant_status = "connected"
    except Exception as e:
        qdrant_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "qdrant": qdrant_status,
        "message": "Face recognition API is running 🚀"
    }
