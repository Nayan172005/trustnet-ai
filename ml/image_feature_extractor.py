import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image
import requests
from io import BytesIO

# Load a pretrained ResNet (without final classification layer)
weights = ResNet50_Weights.DEFAULT
resnet = resnet50(weights=weights)
resnet.eval()  # Set to eval mode
feature_extractor = torch.nn.Sequential(*list(resnet.children())[:-1])  # Remove last FC layer

# Transformation for input image
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],  # ImageNet stats
                         std=[0.229, 0.224, 0.225])
])

def extract_image_features(image_url):
    try:
        response = requests.get(image_url)
        img = Image.open(BytesIO(response.content)).convert('RGB')
        img_tensor = transform(img).unsqueeze(0)  # Add batch dimension

        with torch.no_grad():
            features = feature_extractor(img_tensor)
            features = features.squeeze().numpy()  # Shape: (2048,)
        
        return features
    except Exception as e:
        print(f"Error extracting image features: {e}")
        return None
