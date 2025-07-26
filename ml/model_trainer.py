# model_trainer.py
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

X = np.load("data/features/X.npy")
y = np.load("data/features/y.npy")

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X, y)

y_pred = clf.predict(X)
print(classification_report(y, y_pred))

import joblib
joblib.dump(clf, "ml/counterfeit_classifier.pkl")
