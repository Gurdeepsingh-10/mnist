from flask import Flask, render_template, request, jsonify
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64
from waitress import serve

app = Flask(__name__)
model = tf.keras.models.load_model("mnist_cnn.keras")

def preprocess_image(img_data):
    img = Image.open(io.BytesIO(base64.b64decode(img_data.split(",")[1])))
    img = img.convert("L").resize((28, 28))  # grayscale, 28x28
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=(0, -1))  # batch and channel
    return img

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    img_data = data["image"]
    img = preprocess_image(img_data)
    
    preds = model.predict(img)[0]
    top3_indices = preds.argsort()[-3:][::-1]
    top3 = [{"digit": int(i), "confidence": float(preds[i])} for i in top3_indices]
    confidences = [{"digit": i, "confidence": float(preds[i])} for i in range(10)]
    
    return jsonify({"top3": top3, "confidences": confidences})

if __name__ == "__main__":
    
    serve(app, host="0.0.0.0", port=5000)

