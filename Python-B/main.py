from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
from qdrant_client import QdrantClient
from qdrant_client.http.models import PointStruct, Distance, VectorParams
from typing import List
from PIL import Image
import numpy as np
import base64
import io
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = QdrantClient(
    url="https://4a0d9e8d-2682-4c00-a63e-93fc4c2477e6.europe-west3-0.gcp.cloud.qdrant.io:6333",
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.hpmg8p-hGp423-hxr2J33KFTJJ4cx6_0Il99PdUJ3VM"
)

COLLECTION_NAME = "face_vectors"

# ✅ Only create collection if it doesn't exist (prevents deletion of data on restart)
if not client.collection_exists(collection_name=COLLECTION_NAME):
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=512, distance=Distance.COSINE)
    )

class SignupPayload(BaseModel):
    image: str
    userId: str

class EmergencyPayload(BaseModel):
    image: str

def base64_to_image(b64_string: str) -> Image.Image:
    image_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(image_data)).convert("RGB")

def get_face_embedding(image: Image.Image):
    try:
        embedding = DeepFace.represent(img_path=np.array(image), model_name="ArcFace", enforce_detection=True)
        vector = embedding[0]["embedding"]
        print(f"Generated embedding size: {len(vector)}")
        return vector
    except Exception as e:
        print("Face detection error:", e)
        return None

@app.post("/signup")
def signup(payload: SignupPayload):
    print("called")
    print("id Type:", type(payload.userId))
    print("id:", payload.userId)
    image = base64_to_image(payload.image)
    vector = get_face_embedding(image)
    print("called2")

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
