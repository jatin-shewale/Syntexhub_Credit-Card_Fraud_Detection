import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle


def train_and_save():
    df = pd.read_csv('creditcard.csv')
    X = df.drop('Class', axis=1)
    y = df['Class']

    # simple train/test split, we only need to save model
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    # save the trained model
    with open('fraud_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print('Model trained and saved to fraud_model.pkl')


if __name__ == '__main__':
    train_and_save()
