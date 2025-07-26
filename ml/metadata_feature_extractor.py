# ml/metadata_feature_extractor.py

from sentence_transformers import SentenceTransformer
import numpy as np

# Load pre-trained MiniLM model
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_metadata_features(title, brand, description):
    combined_text = f"{title} {brand} {description}"
    embedding = model.encode(combined_text)
    return embedding
