from flask import Flask, request, jsonify
from deepface import DeepFace
import tempfile

app = Flask(__name__)

@app.route('/verify-face', methods=['POST'])
def verify_face():
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({'error': 'Please upload both image1 and image2'}), 400

    image1 = request.files['image1']
    image2 = request.files['image2']

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp1, \
             tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp2:
            
            temp1.write(image1.read())
            temp2.write(image2.read())
            temp1_path = temp1.name
            temp2_path = temp2.name

        result = DeepFace.verify(img1_path=temp1_path, img2_path=temp2_path)

        return jsonify({
            'matched': result["verified"],
            'distance': result["distance"],
            'model': result["model"],
            'threshold': result["threshold"]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)








# import os

# @app.route('/verify-face', methods=['POST'])
# def verify_face():
#     if 'image1' not in request.files or 'image2' not in request.files:
#         return jsonify({'error': 'Please upload both image1 and image2'}), 400

#     image1 = request.files['image1']
#     image2 = request.files['image2']

#     try:
#         # Get extensions from original filenames
#         ext1 = os.path.splitext(image1.filename)[1] or '.jpg'
#         ext2 = os.path.splitext(image2.filename)[1] or '.jpg'

#         with tempfile.NamedTemporaryFile(delete=False, suffix=ext1) as temp1, \
#              tempfile.NamedTemporaryFile(delete=False, suffix=ext2) as temp2:
            
#             temp1.write(image1.read())
#             temp2.write(image2.read())
#             temp1_path = temp1.name
#             temp2_path = temp2.name

#         result = DeepFace.verify(img1_path=temp1_path, img2_path=temp2_path)

#         return jsonify({
#             'same_person': result["verified"],
#             'distance': result["distance"],
#             'model': result["model"],
#             'threshold': result["threshold"]
#         })

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
