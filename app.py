from pathlib import Path
import json
import pickle

import pandas as pd
from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / 'fraud_model.pkl'
META_PATH = BASE_DIR / 'fraud_model_meta.pkl'

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / 'templates'),
    static_folder=str(BASE_DIR / 'static'),
)

# Load the trained model relative to this file so startup works from any cwd.
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)
if hasattr(model, 'n_jobs'):
    model.n_jobs = 1

FEATURES = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']
EXAMPLE_PATH = BASE_DIR / 'static' / 'example.json'
DEFAULT_THRESHOLD = 0.5

metadata = {}
if META_PATH.exists():
    with open(META_PATH, 'rb') as f:
        metadata = pickle.load(f)
DECISION_THRESHOLD = float(metadata.get('threshold', DEFAULT_THRESHOLD))


def _load_example_values():
    if 'legitimate_example' in metadata and 'fraud_example' in metadata:
        return {
            'legitimate': {
                feature: float(metadata['legitimate_example'].get(feature, 0.0))
                for feature in FEATURES
            },
            'fraud': {
                feature: float(metadata['fraud_example'].get(feature, 0.0))
                for feature in FEATURES
            },
        }
    if not EXAMPLE_PATH.exists():
        zero_values = {feature: 0.0 for feature in FEATURES}
        return {'legitimate': zero_values, 'fraud': zero_values}
    with open(EXAMPLE_PATH, 'r', encoding='utf-8') as file:
        data = json.load(file)
    sample = {feature: float(data.get(feature, 0.0)) for feature in FEATURES}
    return {'legitimate': sample, 'fraud': sample}


def _predict_from_values(values):
    df = pd.DataFrame([values], columns=FEATURES)
    prob = model.predict_proba(df)[0][1]
    result = 'Fraudulent' if prob >= DECISION_THRESHOLD else 'Legitimate'
    return result, float(prob)


def _coerce_feature_values(payload):
    values = []
    for feature in FEATURES:
        val = payload.get(feature, 0)
        values.append(float(val))
    return values

@app.route('/')
def index():
    # render form
    return render_template('index.html', features=FEATURES)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        values = _coerce_feature_values(request.form)
        result, prob = _predict_from_values(values)
        return render_template('index.html', features=FEATURES, result=result, probability=prob)
    except Exception as e:
        return render_template('index.html', features=FEATURES, error=str(e))


@app.route('/api/features')
def api_features():
    return jsonify({
        'features': FEATURES,
        'examples': _load_example_values(),
        'threshold': DECISION_THRESHOLD,
    })


@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        payload = request.get_json(silent=True) or {}
        values = _coerce_feature_values(payload)
        result, prob = _predict_from_values(values)
        return jsonify({
            'result': result,
            'probability': prob,
            'isFraud': result == 'Fraudulent',
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5002)
