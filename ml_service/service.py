import os
import sys
import json
import pickle
import shutil
import h5py
import numpy as np
import pandas as pd
import faiss
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

import tensorflow as tf
import keras
from keras import layers, Model
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences
from keras.applications.resnet50 import ResNet50, preprocess_input
from keras.preprocessing.image import load_img, img_to_array

# Ensure pickle compatibility for older keras.preprocessing.text
import tensorflow.keras.preprocessing.text
sys.modules['keras.preprocessing'] = tf.keras.preprocessing
sys.modules['keras.preprocessing.text'] = tf.keras.preprocessing.text

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Custom layers
@keras.saving.register_keras_serializable(package="custom", name="CompatibleLSTM")
class CompatibleLSTM(layers.LSTM):
    def __init__(self, *args, **kwargs):
        kwargs.pop("time_major", None)
        super().__init__(*args, **kwargs)
    @classmethod
    def from_config(cls, config):
        config.pop("time_major", None)
        return super().from_config(config)

@keras.saving.register_keras_serializable(package="custom", name="L2Normalize")
class L2Normalize(layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    def call(self, inputs):
        return tf.math.l2_normalize(inputs, axis=1)

custom_layer_dict = {
    "LSTM": CompatibleLSTM,
    "CompatibleLSTM": CompatibleLSTM,
    "Bidirectional": layers.Bidirectional,
    "Embedding": layers.Embedding,
    "Dense": layers.Dense,
    "Dropout": layers.Dropout,
    "L2Normalize": L2Normalize
}

def load_any_model(filepath, custom_objects=None):
    norm_path = os.path.normpath(filepath)
    merged_custom = {**custom_layer_dict, **(custom_objects or {})}
    if h5py.is_hdf5(norm_path) and not norm_path.endswith('.h5'):
        temp_h5 = norm_path + ".temp_ml.h5"
        if not os.path.exists(temp_h5):
            shutil.copyfile(norm_path, temp_h5)
        try:
            return load_model(temp_h5, custom_objects=merged_custom, compile=False)
        finally:
            if os.path.exists(temp_h5):
                os.remove(temp_h5)
    return load_model(norm_path, custom_objects=merged_custom, compile=False)

def build_finetuned_resnet_embedding(weights_path):
    base_model = ResNet50(weights=None, include_top=False, input_shape=(224, 224, 3))
    inputs = layers.Input(shape=(224, 224, 3))
    x = base_model(inputs)
    x = layers.GlobalAveragePooling2D()(x)
    dense_layer = layers.Dense(256, activation="relu", name="dense")
    x = dense_layer(x)
    outputs = L2Normalize()(x)
    model = Model(inputs, outputs, name="embedding_model")
    
    with h5py.File(weights_path, "r") as f:
        resnet_group = f["model_weights"]["resnet50"]
        for layer in base_model.layers:
            if layer.name in resnet_group:
                sub_g = resnet_group[layer.name]
                sub_weights = []
                for w in layer.weights:
                    var_name = w.name.split('/')[-1]
                    var_key = var_name if ':0' in var_name else var_name + ':0'
                    if var_key in sub_g:
                        sub_weights.append(np.array(sub_g[var_key]))
                if len(sub_weights) == len(layer.weights):
                    layer.set_weights(sub_weights)
        
        dense_group = f["model_weights"]["dense"]["dense"]
        dense_layer.set_weights([np.array(dense_group["kernel:0"]), np.array(dense_group["bias:0"])])
    return model

print("Initializing TrustNet-AI Machine Learning Service...")

# 1. Review model
print("Loading Fake Review BiLSTM Model...")
review_model_path = os.path.join(BASE_DIR, "ml/fake_review_detection/models/fake_review_bilstm_v2.keras")
review_tok_path = os.path.join(BASE_DIR, "ml/fake_review_detection/tokenizers/review_tokenizer_v2.pkl")
review_model = load_any_model(review_model_path)
with open(review_tok_path, "rb") as f:
    review_tokenizer = pickle.load(f)

# 2. Metadata counterfeit model
print("Loading Metadata Counterfeit Classifier...")
meta_model_path = os.path.join(BASE_DIR, "ml/counterfeit_metadata_detection/models/metadata_counterfeit_classifier_v1.keras")
meta_tok_path = os.path.join(BASE_DIR, "ml/counterfeit_metadata_detection/tokenizers/metadata_classifier_tokenizer_v1.pkl")
meta_model = load_any_model(meta_model_path)
with open(meta_tok_path, "rb") as f:
    meta_tokenizer = pickle.load(f)

# 3. Image embedding model & FAISS
print("Loading ResNet-50 Penultimate Feature Extractor...")
embed_model_path = os.path.join(BASE_DIR, "ml/counterfeit_image_detection/models/embedding_model_finetuned.keras")
embedding_model = build_finetuned_resnet_embedding(embed_model_path)

print("Loading FAISS Index and Image Metadata...")
faiss_path = os.path.join(BASE_DIR, "ml/counterfeit_image_detection/embeddings/shoe_faiss_index_v1.index")
filenames_path = os.path.join(BASE_DIR, "ml/counterfeit_image_detection/embeddings/shoe_image_filenames_v1.npy")
faiss_index = faiss.read_index(os.path.normpath(faiss_path))
catalog_filenames = np.load(os.path.normpath(filenames_path), allow_pickle=True)

# 4. Authentic Metadata Map
metadata_map_path = os.path.join(BASE_DIR, "ml/counterfeit_metadata_detection/datasets/authentic_metadata_output.csv")
metadata_df = pd.read_csv(metadata_map_path)
metadata_map = dict(zip(metadata_df["filename"], metadata_df["metadata"]))

print("All ML Models and Indexes Ready!")

def extract_brand(text):
    text = str(text).lower()
    if "new balance" in text or "newbalance" in text:
        return "newbalance"
    if "under armour" in text or "underarmour" in text:
        return "underarmour"
    brands = ["nike", "puma", "vans", "reebok"]
    for brand in brands:
        if brand in text:
            return brand
    return "unknown"

def predict_metadata(metadata_text):
    seq = meta_tokenizer.texts_to_sequences([metadata_text])
    padded = pad_sequences(seq, maxlen=110, padding="post")
    prob_fake = float(meta_model.predict(padded, verbose=0)[0][0])
    prob_genuine = 1.0 - prob_fake
    return float(prob_genuine)

def predict_image_retrieval(image_path, top_k=5):
    img = load_img(image_path, target_size=(224, 224))
    arr = preprocess_input(img_to_array(img))
    arr = np.expand_dims(arr, axis=0)
    
    emb = embedding_model.predict(arr, verbose=0).astype("float32")
    faiss.normalize_L2(emb)
    similarities, indices = faiss_index.search(emb, top_k)
    
    results = []
    for sim, idx in zip(similarities[0], indices[0]):
        fn = str(catalog_filenames[idx])
        meta = metadata_map.get(fn, "")
        b = extract_brand(meta if meta else fn)
        results.append({
            "filename": fn,
            "similarity": round(float(sim), 4),
            "brand": b,
            "metadata": meta
        })
    return results

def compute_trust_fusion(query_metadata, image_path):
    s_meta = predict_metadata(query_metadata)
    retrieval_results = predict_image_retrieval(image_path, top_k=5)
    query_brand = extract_brand(query_metadata)
    
    retrieved_brands = [r["brand"] for r in retrieval_results]
    similarities = [r["similarity"] for r in retrieval_results]
    
    if len(retrieved_brands) > 0 and query_brand != "unknown":
        r_brand = retrieved_brands.count(query_brand) / len(retrieved_brands)
    else:
        # If query brand not detected directly, use majority retrieved brand match
        r_brand = 0.5
    
    c_ret = float(np.mean(similarities)) if len(similarities) > 0 else 0.0
    
    trust_score = 0.50 * s_meta + 0.35 * r_brand + 0.15 * max(0.0, c_ret)
    trust_score = round(float(trust_score), 4)
    s_meta = round(float(s_meta), 4)
    r_brand = round(float(r_brand), 4)
    c_ret = round(float(c_ret), 4)
    
    # Decision Logic as defined in Multimodal Trust Fusion Architecture
    if r_brand < 0.40 and query_brand != "unknown":
        verdict = "SUSPICIOUS"
        diagnostic = f"Brand Mismatch: Claimed '{query_brand}', but catalog visual retrieval matched {retrieved_brands}"
    elif c_ret < 0.50:
        verdict = "SUSPICIOUS"
        diagnostic = "Visual Anomaly: Catalog similarity confidence is below standard threshold"
    elif trust_score >= 0.75 and r_brand >= 0.60 and s_meta >= 0.70:
        verdict = "GENUINE"
        diagnostic = "High Confidence Authentic: Validated across metadata and visual metric retrieval"
    elif trust_score < 0.50 or s_meta < 0.40:
        verdict = "COUNTERFEIT"
        diagnostic = "Counterfeit Detected: Deceptive listing style or low composite trust score"
    else:
        verdict = "SUSPICIOUS"
        diagnostic = "Suspicious Listing: Inconclusive multimodal signals require verification"
        
    return {
        "verdict": verdict,
        "diagnostic": diagnostic,
        "trust_score": trust_score,
        "metadata_score": s_meta,
        "brand_match_ratio": r_brand,
        "retrieval_confidence": c_ret,
        "query_brand": query_brand,
        "retrieved_items": retrieval_results
    }

def predict_review_authenticity(review_text, rating):
    seq = review_tokenizer.texts_to_sequences([review_text])
    padded = pad_sequences(seq, maxlen=120, padding="post", truncating="post")
    rating_arr = np.array([[float(rating)]])
    
    prob_fake = float(review_model.predict([padded, rating_arr], verbose=0)[0][0])
    prob_fake = round(prob_fake, 4)
    prob_genuine = round(1.0 - prob_fake, 4)
    is_fake = bool(prob_fake >= 0.50)
    verdict = "Fake" if is_fake else "Genuine"
    
    return {
        "is_fake": is_fake,
        "verdict": verdict,
        "prob_fake": prob_fake,
        "prob_genuine": prob_genuine,
        "rating": int(rating)
    }

class MLRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "service": "TrustNet-AI ML Engine"})
        else:
            self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")
        try:
            payload = json.loads(body) if body else {}
        except Exception as e:
            self._send_json(400, {"error": f"Invalid JSON: {str(e)}"})
            return

        if self.path == "/predict_product":
            image_path = payload.get("image_path")
            metadata = payload.get("metadata", "")
            if not image_path or not os.path.exists(image_path):
                self._send_json(400, {"error": f"Valid image_path required. Given: {image_path}"})
                return
            try:
                res = compute_trust_fusion(metadata, image_path)
                self._send_json(200, res)
            except Exception as e:
                import traceback
                traceback.print_exc()
                self._send_json(500, {"error": f"Inference failed: {str(e)}"})

        elif self.path == "/predict_review":
            review_text = payload.get("review_text", "")
            rating = payload.get("rating", 5)
            if not review_text:
                self._send_json(400, {"error": "review_text is required"})
                return
            try:
                res = predict_review_authenticity(review_text, rating)
                self._send_json(200, res)
            except Exception as e:
                import traceback
                traceback.print_exc()
                self._send_json(500, {"error": f"Review classification failed: {str(e)}"})
        else:
            self._send_json(404, {"error": "Unknown POST route"})

def run_server(port=5001):
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, MLRequestHandler)
    print(f"TrustNet-AI ML Inference Server running on http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Stopping ML service...")
        httpd.server_close()

if __name__ == "__main__":
    port = 5001
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run_server(port)
