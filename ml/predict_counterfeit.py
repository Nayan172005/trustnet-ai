import os
import sys
import json
import numpy as np
import torch
from image_feature_extractor import extract_image_features
from metadata_feature_extractor import extract_metadata_features
import joblib

# Load your trained classifier model
model_path = os.path.join(os.path.dirname(__file__), "../ml/counterfeit_classifier.pkl")
model = joblib.load(model_path)

def explain_prediction(pred_prob, threshold=0.5):
    confidence = max(pred_prob)
    if confidence < 0.6:
        return "Model is uncertain due to low confidence score."
    return (
        "Image and metadata consistency suggests legitimacy."
        if pred_prob[0] > threshold
        else "Mismatch or anomalies in metadata and image features suggest counterfeit."
    )

def main():
    try:
        # Read the entire input from stdin
        raw_input = sys.stdin.read()
        data = json.loads(raw_input)

        title = data.get("title", "")
        brand = data.get("brand", "")
        description = data.get("description", "")
        image_url = data.get("image_url", "")

        if not all([title, brand, description, image_url]):
            raise ValueError("Missing required input fields.")

        # Extract features
        img_feat = extract_image_features(image_url)
        meta_feat = extract_metadata_features(title, brand, description)

        if img_feat is None or meta_feat is None:
            raise ValueError("Feature extraction failed.")

        combined = np.concatenate([img_feat, meta_feat]).reshape(1, -1)

        pred = model.predict(combined)[0]
        prob = model.predict_proba(combined)[0].tolist()
        explanation = explain_prediction(prob)

        result = {
            "prediction": int(pred),
            "confidence": round(prob[int(pred)], 3),
            "explanation": explanation
        }

        print(json.dumps(result))
        sys.stdout.flush()

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.stdout.flush()

if __name__ == "__main__":
    main()
