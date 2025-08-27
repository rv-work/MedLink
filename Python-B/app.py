# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from deepface import DeepFace
# from qdrant_client import QdrantClient
# from qdrant_client.http.models import PointStruct, Distance, VectorParams
# import numpy as np
# from PIL import Image
# import base64
# import io

# app = Flask(__name__)
# CORS(app)

# # Replace this with your Qdrant cloud info
# client = QdrantClient(
#     url="https://your-qdrant-endpoint.cloud", 
#     api_key="your-qdrant-api-key"
# )

# COLLECTION_NAME = "face_vectors"

# # Create or reuse collection
# client.recreate_collection(
#     collection_name=COLLECTION_NAME,
#     vectors_config=VectorParams(size=2622, distance=Distance.COSINE)
# )

# def base64_to_image(b64_string):
#     image_data = base64.b64decode(b64_string)
#     return Image.open(io.BytesIO(image_data)).convert("RGB")

# def get_face_embedding(image: Image.Image):
#     try:
#         embedding = DeepFace.represent(img_path=np.array(image), model_name="VGG-Face", enforce_detection=True)
#         return embedding[0]["embedding"]
#     except Exception as e:
#         print("Face detection error:", e)
#         return None

# @app.route("/signup", methods=["POST"])
# def signup():
#     data = request.get_json()
#     image_b64 = data["image"]
#     userid = data["userid"]

#     image = base64_to_image(image_b64)
#     vector = get_face_embedding(image)

#     if vector is None:
#         return jsonify({"status": "error", "message": "No face detected"}), 400

#     point = PointStruct(id=userid, vector=vector, payload={"userid": userid})
#     client.upsert(collection_name=COLLECTION_NAME, points=[point])

#     return jsonify({"status": "success"})

# @app.route("/emergency", methods=["POST"])
# def emergency():
#     data = request.get_json()
#     image_b64 = data["image"]
#     image = base64_to_image(image_b64)
#     vector = get_face_embedding(image)

#     if vector is None:
#         return jsonify({"status": "error", "message": "No face detected"}), 400

#     results = client.search(
#         collection_name=COLLECTION_NAME,
#         query_vector=vector,
#         limit=10
#     )

#     matches = [point.payload["userid"] for point in results]

#     return jsonify({"status": "success", "matches": matches})

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)
