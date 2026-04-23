import pickle
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, precision_recall_curve
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / 'fraud_model.pkl'
META_PATH = BASE_DIR / 'fraud_model_meta.pkl'


def train_and_save():
    df = pd.read_csv(BASE_DIR / 'creditcard.csv')
    X = df.drop('Class', axis=1)
    y = df['Class']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        random_state=42,
        n_jobs=1,
        n_estimators=60,
        max_depth=12,
        class_weight='balanced_subsample',
    )
    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    precision, recall, thresholds = precision_recall_curve(y_test, probabilities)
    f1_scores = 2 * precision[:-1] * recall[:-1] / (precision[:-1] + recall[:-1] + 1e-9)
    best_index = int(f1_scores.argmax())
    decision_threshold = float(thresholds[best_index])

    predictions = (probabilities >= decision_threshold).astype(int)
    print(classification_report(y_test, predictions, digits=4))
    print(f'Selected threshold: {decision_threshold:.6f}')

    fraud_example = df[df['Class'] == 1].iloc[0].drop(labels=['Class']).to_dict()
    legitimate_example = df[df['Class'] == 0].iloc[0].drop(labels=['Class']).to_dict()

    metadata = {
        'threshold': decision_threshold,
        'legitimate_example': legitimate_example,
        'fraud_example': fraud_example,
    }

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(META_PATH, 'wb') as f:
        pickle.dump(metadata, f)

    print(f'Model trained and saved to {MODEL_PATH.name}')
    print(f'Metadata saved to {META_PATH.name}')


if __name__ == '__main__':
    train_and_save()
