from flask import Flask, render_template, request
import pandas as pd
import pickle

app = Flask(__name__)

# load model
with open('fraud_model.pkl', 'rb') as f:
    model = pickle.load(f)

FEATURES = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']

@app.route('/')
def index():
    # render form
    return render_template('index.html', features=FEATURES)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        values = []
        for feature in FEATURES:
            val = request.form.get(feature)
            # attempt to convert float
            values.append(float(val))
        df = pd.DataFrame([values], columns=FEATURES)
        pred = model.predict(df)[0]
        prob = model.predict_proba(df)[0][1]
        result = 'Fraudulent' if pred == 1 else 'Legitimate'
        return render_template('index.html', features=FEATURES, result=result, probability=prob)
    except Exception as e:
        return render_template('index.html', features=FEATURES, error=str(e))

if __name__ == '__main__':
    app.run(debug=True, port=5002)
