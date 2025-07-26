# ml/combine_features.py

import os
import json
import numpy as np
from image_feature_extractor import extract_image_features
from metadata_feature_extractor import extract_metadata_features

DATA_FILE = "./data/product_samples.json"
FEATURE_DIR = "./data/features"
os.makedirs(FEATURE_DIR, exist_ok=True)

with open(DATA_FILE, "r") as f:
    samples = json.load(f)

X = []
y = []

for sample in samples:
    product_id = sample["product_id"]
    image_url = sample["image_path"]
    
    title = sample["title"]
    brand = sample["brand"]
    description = sample["description"]
    label = sample["label"]

    # Extract features
    image_feat = extract_image_features(image_url)
    metadata_feat = extract_metadata_features(title, brand, description)

    if image_feat is None or metadata_feat is None:
        continue

    # Combine features
    combined = np.concatenate([image_feat, metadata_feat])  # shape: (2048 + 384,)
    np.save(os.path.join(FEATURE_DIR, f"{product_id}_features.npy"), combined)

    X.append(combined)
    y.append(label)

# Save full dataset
np.save(os.path.join(FEATURE_DIR, "X.npy"), np.array(X))
np.save(os.path.join(FEATURE_DIR, "y.npy"), np.array(y))

print(f"✅ Saved {len(X)} samples.")
