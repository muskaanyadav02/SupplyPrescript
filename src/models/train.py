"""
src/models/train.py

Trains an XGBoost classifier to predict `late_delivery_risk` from the
processed supply chain dataset, tunes it with RandomizedSearchCV, evaluates
it, and saves the final model + feature column list for the backend API.

Usage:
    python -m src.models.train
    python src/models/train.py --data data/processed/clean_supply_chain.csv
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import RandomizedSearchCV, train_test_split
from xgboost import XGBClassifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

TARGET_COL = "late_delivery_risk"

# Columns dropped outright (PII, IDs, leakage, or redundant with target)
DROP_COLUMNS_INITIAL = [
    "customer_email",
    "customer_password",
    "customer_fname",
    "customer_lname",
    "customer_street",
    "product_image",
    "order_id",
    "customer_id",
    "order_customer_id",
    "order_item_id",
    "product_card_id",
]

# High-cardinality / leakage columns dropped after feature engineering
DROP_COLUMNS_HIGH_CARDINALITY = [
    "delivery_status",  # leaks the target
    "order_city",
    "customer_city",
    "order_state",
    "customer_zipcode",
    "order_status",
]

DROP_COLUMNS_SHIPPING_DATE_PARTS = [
    "shipping_year",
    "shipping_month",
    "shipping_day",
]

DATE_COLUMNS = ["order_date_dateorders", "shipping_date_dateorders"]

RANDOM_STATE = 42
TEST_SIZE = 0.2

PARAM_DIST = {
    "n_estimators": [100, 200, 300],
    "max_depth": [3, 5, 7, 9],
    "learning_rate": [0.01, 0.05, 0.1, 0.2],
    "subsample": [0.8, 0.9, 1.0],
    "colsample_bytree": [0.8, 0.9, 1.0],
    "min_child_weight": [1, 3, 5],
}


# --------------------------------------------------------------------------- #
# Steps
# --------------------------------------------------------------------------- #

def load_data(path: Path) -> pd.DataFrame:
    logger.info("Loading data from %s", path)
    df = pd.read_csv(path)
    logger.info("Loaded shape: %s", df.shape)
    return df


def build_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Replicates the notebook's cleaning / feature engineering pipeline."""
    df = df.drop(columns=DROP_COLUMNS_INITIAL, errors="ignore")

    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    # Parse date columns
    X["order_date_dateorders"] = pd.to_datetime(X["order_date_dateorders"])
    X["shipping_date_dateorders"] = pd.to_datetime(X["shipping_date_dateorders"])

    # Derive order-date features (kept)
    X["order_year"] = X["order_date_dateorders"].dt.year
    X["order_month"] = X["order_date_dateorders"].dt.month
    X["order_day"] = X["order_date_dateorders"].dt.day
    X["order_weekday"] = X["order_date_dateorders"].dt.dayofweek

    # Derive shipping-date features (dropped later — they leak information
    # only known after delivery; kept briefly here for parity with the
    # notebook, then removed before modeling)
    X["shipping_year"] = X["shipping_date_dateorders"].dt.year
    X["shipping_month"] = X["shipping_date_dateorders"].dt.month
    X["shipping_day"] = X["shipping_date_dateorders"].dt.day

    # IMPORTANT: drop the raw datetime columns immediately, before any
    # categorical-column selection. If these are still present when
    # select_dtypes(include=["object"/"string"]) runs, pd.get_dummies will
    # try to one-hot-encode ~65,000 unique timestamps each and blow up
    # memory (ArrayMemoryError).
    X = X.drop(columns=DATE_COLUMNS)

    X = X.drop(columns=DROP_COLUMNS_HIGH_CARDINALITY, errors="ignore")
    X = X.drop(columns=DROP_COLUMNS_SHIPPING_DATE_PARTS, errors="ignore")

    # One-hot encode remaining categorical columns only (object/string dtype).
    # Explicitly naming "string" alongside "object" avoids the Pandas4Warning
    # about implicit inclusion of the string dtype.
    cat_cols = X.select_dtypes(include=["object", "string"]).columns
    logger.info("Categorical columns to encode:")
    for col in cat_cols:
        logger.info("  %s: %d unique values", col, X[col].nunique())

    X = pd.get_dummies(X, columns=cat_cols, drop_first=True)

    logger.info("Feature matrix shape after encoding: %s", X.shape)
    return X, y


def split_data(X: pd.DataFrame, y: pd.Series):
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    logger.info("Train shape: %s | Test shape: %s", X_train.shape, X_test.shape)
    return X_train, X_test, y_train, y_test


def train_baseline_model(X_train, y_train) -> XGBClassifier:
    logger.info("Training baseline XGBClassifier...")
    model = XGBClassifier(random_state=RANDOM_STATE, eval_metric="logloss")
    model.fit(X_train, y_train)
    return model


def tune_model(X_train, y_train) -> RandomizedSearchCV:
    logger.info("Running RandomizedSearchCV hyperparameter tuning...")
    xgb = XGBClassifier(random_state=RANDOM_STATE, eval_metric="logloss")
    search = RandomizedSearchCV(
        estimator=xgb,
        param_distributions=PARAM_DIST,
        n_iter=10,
        scoring="f1",
        cv=3,
        verbose=1,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    search.fit(X_train, y_train)
    logger.info("Best params: %s", search.best_params_)
    logger.info("Best CV F1 score: %.4f", search.best_score_)
    return search


def evaluate_model(model, X_test, y_test, label: str = "Model") -> dict:
    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_pred),
    }

    logger.info("--- %s Evaluation ---", label)
    for name, value in metrics.items():
        logger.info("%-10s: %.4f", name, value)
    logger.info("\n%s", classification_report(y_test, y_pred))
    logger.info("Confusion Matrix:\n%s", confusion_matrix(y_test, y_pred))

    return metrics


def save_artifacts(model, feature_columns: list[str], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "xgboost_model.pkl"
    features_path = output_dir / "feature_columns.pkl"

    joblib.dump(model, model_path)
    joblib.dump(feature_columns, features_path)

    logger.info("Saved model to %s", model_path)
    logger.info("Saved feature columns to %s", features_path)


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train late delivery risk model")
    parser.add_argument(
        "--data",
        type=Path,
        default=Path("data/processed/clean_supply_chain.csv"),
        help="Path to the cleaned/processed CSV dataset",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("models"),
        help="Directory to save the trained model and feature list",
    )
    parser.add_argument(
        "--skip-tuning",
        action="store_true",
        help="Skip RandomizedSearchCV and save the baseline model instead",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    df = load_data(args.data)
    X, y = build_features(df)
    X_train, X_test, y_train, y_test = split_data(X, y)

    baseline_model = train_baseline_model(X_train, y_train)
    evaluate_model(baseline_model, X_test, y_test, label="Baseline")

    if args.skip_tuning:
        final_model = baseline_model
    else:
        search = tune_model(X_train, y_train)
        final_model = search.best_estimator_
        evaluate_model(final_model, X_test, y_test, label="Tuned")

    save_artifacts(final_model, list(X.columns), args.output_dir)
    logger.info("Training pipeline complete.")


if __name__ == "__main__":
    main()