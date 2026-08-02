from xgboost import XGBClassifier

BEST_PARAMS = {
    "objective": "binary:logistic",
    "random_state": 42,
    "learning_rate": 0.2,
    "max_depth": 9,
    "min_child_weight": 5,
    "n_estimators": 300,
    "subsample": 0.9,
    "colsample_bytree": 1.0,
    "eval_metric": "logloss",
}


def build_model(**overrides) -> XGBClassifier:
    params = {**BEST_PARAMS, **overrides}
    return XGBClassifier(**params)