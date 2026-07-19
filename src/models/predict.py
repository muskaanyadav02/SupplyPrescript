from pathlib import Path

import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = PROJECT_ROOT / "models"
MODEL_PATH = MODEL_DIR / "xgboost_model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"

_model = None
_feature_columns = None


def _load_artifacts():
    global _model, _feature_columns
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
        if not FEATURE_COLUMNS_PATH.exists():
            raise FileNotFoundError(f"Feature columns not found at {FEATURE_COLUMNS_PATH}. Run train.py first.")
        _model = joblib.load(MODEL_PATH)
        _feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
    return _model, _feature_columns


def predict(data: pd.DataFrame):
    model, feature_columns = _load_artifacts()

    data = data.reindex(columns=feature_columns, fill_value=0)

    prediction = model.predict(data)
    probability = model.predict_proba(data)[:, 1]

    return prediction, probability