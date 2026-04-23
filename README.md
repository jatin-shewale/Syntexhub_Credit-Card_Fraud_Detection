# Task 3: Credit Card Fraud Detection

## Overview
This project implements a machine learning solution to detect fraudulent credit card transactions. The notebook demonstrates multiple approaches to handle the class imbalance problem commonly found in fraud detection datasets and compares their performance.

## Dataset
- **File**: `creditcard.csv`
- **Description**: Contains credit card transaction data with features representing anonymized transaction attributes and a target variable `Class` indicating whether a transaction is fraudulent (1) or legitimate (0)

## Project Structure
```
Task 3/
├── Credit Card Fraud Detection.ipynb
├── creditcard.csv
├── train_model.py       # script to train and pickle the model
├── fraud_model.pkl      # generated after training
├── app.py               # Flask-based web frontend
├── templates/
│   └── index.html       # form UI
├── static/
│   └── style.css        # colorful styling
└── README.md
```

## Key Features

### 1. **Data Loading & Exploration**
   - Load credit card dataset
   - Examine dataset shape and distribution
   - Analyze class imbalance (fraudulent vs non-fraudulent transactions)
   - Visualize transaction distribution

### 2. **Data Preprocessing**
   - Separate features (X) and target variable (y)
   - Split data into training (80%) and testing (20%) sets with stratification

### 3. **Machine Learning Models**

#### Model 1: Basic Random Forest Classifier
- Standard Random Forest without any balancing techniques
- Baseline model for comparison

#### Model 2: Random Forest with RandomUnderSampler
- Applies undersampling to balance the dataset
- Removes majority class samples to match minority class size
- Helps address class imbalance issues

#### Model 3: Random Forest with SMOTE
- Uses Synthetic Minority Over-sampling Technique
- Generates synthetic samples for the minority class (fraudulent transactions)
- More sophisticated approach to handling class imbalance

#### Model 4: XGBoost Classifier
- Gradient boosting classifier with scale_pos_weight parameter
- Automatically weights the minority class based on class distribution
- Final model with tuned decision threshold (0.3) for optimal performance

## Evaluation Metrics

The models are evaluated using:
- **Classification Report**: Precision, recall, F1-score for each class
- **ROC AUC Score**: Area under the Receiver Operating Characteristic curve
- **Precision, Recall, F1 Score**: Custom metrics with adjusted decision threshold

## Key Insights

1. **Class Imbalance**: The dataset exhibits significant class imbalance with fraudulent transactions being much rarer than legitimate ones
2. **Model Comparison**: Different balancing techniques yield different performance characteristics
3. **Threshold Tuning**: Adjusting the decision threshold (0.3 for XGBoost) can optimize recall for fraud detection
4. **ROC Curve**: Visualizes the trade-off between true positive rate and false positive rate

## Technologies & Libraries Used

- **Data Processing**: Pandas, NumPy
- **Visualization**: Matplotlib, Seaborn
- **Machine Learning**: scikit-learn, XGBoost
- **Imbalance Handling**: imbalanced-learn (SMOTE, RandomUnderSampler)

## Results

Each model's performance is evaluated and reported through:
- Classification metrics (precision, recall, F1-score)
- ROC AUC scores
- ROC curve visualization
- Custom threshold performance metrics

## Conclusion

This project demonstrates that proper handling of class imbalance is crucial for fraud detection. The XGBoost model with scale_pos_weight provides a robust solution with adjustable decision thresholds for balancing false positives and false negatives based on business requirements.

## Interactive Web Frontend

A small Flask application with a colorful input form has been added so you can interact with the trained model through a browser. Follow these steps to use the web UI:


**Start the web server**:
   ```powershell
   python app.py
   ```
   The app will run on `http://127.0.0.1:5002`.

**Open a browser** and navigate to the URL. Enter values for the transaction features and click **Predict**.

The form is styled with a vibrant gradient and responsive grid layout; prediction results appear in‑place with color coding for fraudulent vs legitimate transactions.

Feel free to extend or redeploy the UI as needed.

## FraudShield AI React Frontend

A separate React + Vite frontend is now included in `frontend/` for a more polished landing page experience under the platform name **FraudShield AI**.

### What it includes
- Modern landing page with animated background
- React Icons based UI accents
- Minimal top-level form with hidden advanced feature groups
- API-based prediction flow connected to the Flask backend

### Run the backend
```powershell
python app.py
```

### Run the React frontend
```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://127.0.0.1:5173` and proxies `/api` requests to the Flask backend on `http://127.0.0.1:5002`.
