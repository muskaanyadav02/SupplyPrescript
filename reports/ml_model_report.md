# Machine Learning Model Report

## Project

**SupplyPrescript – Supply Chain Delay Prediction System**

---

# Objective

The objective of this module is to develop a machine learning model capable of predicting whether an order is at risk of late delivery (`late_delivery_risk`).

This prediction enables businesses to identify potential delivery delays in advance and take preventive actions.

---

# Dataset

- Dataset Name: `clean_supply_chain.csv`
- Total Records: **180,519**
- Target Variable:
  - `late_delivery_risk`

---

# Data Preprocessing

The following preprocessing steps were performed before training the model:

### 1. Removed unnecessary columns

Removed identifier and leakage columns such as:

- Customer IDs
- Order IDs
- Personal information
- Delivery status
- Order status
- City and zipcode columns

These columns either contained sensitive information or caused data leakage.

---

### 2. Date Feature Engineering

Converted date columns into datetime format.

Extracted useful features including:

- Order Year
- Order Month
- Order Day
- Order Weekday

Removed original date columns after feature extraction.

Shipping date features were excluded from the final model to avoid data leakage.

---

### 3. Categorical Encoding

Applied One-Hot Encoding using `pd.get_dummies()` on categorical features.

Final feature matrix:

- **443 features**

---

# Train-Test Split

The dataset was divided into:

- Training Set: **80%**
- Testing Set: **20%**

Parameters:

- `random_state = 42`
- `stratify = target`

---

# Machine Learning Model

Algorithm used:

- **XGBoost Classifier**

Reason for selection:

- Handles structured/tabular data efficiently
- Robust to feature interactions
- High predictive performance
- Works well with mixed numerical and categorical data

---

# Hyperparameter Tuning

RandomizedSearchCV was used to optimize model performance.

Cross Validation:

- 3-Fold Cross Validation

Parameters tuned:

- n_estimators
- max_depth
- learning_rate
- subsample
- colsample_bytree
- min_child_weight

Best Parameters:

```python
{
    "subsample": 0.9,
    "n_estimators": 300,
    "min_child_weight": 5,
    "max_depth": 9,
    "learning_rate": 0.2,
    "colsample_bytree": 1.0
}
```

---

# Model Evaluation

Evaluation metrics used:

- Accuracy
- Precision
- Recall
- F1 Score
- ROC-AUC Score
- Confusion Matrix

Final Model Performance

| Metric | Score |
|---------|-------|
| Accuracy | 78.66% |
| Precision | 84.41% |
| Recall | 74.93% |
| F1 Score | 79.39% |
| ROC-AUC | 79.06% |

---

# Feature Importance

The trained XGBoost model identified the following features as the most influential:

- Shipping Mode
- Order Status
- Transaction Type
- Order Region
- Customer State
- Order Country

Feature importance analysis helps explain which variables contribute the most to predicting delivery delays.

---

# Files Developed

Machine Learning module consists of:

```
src/models/
│
├── train.py
├── model.py
├── predict.py
└── evaluate.py
```

Notebook:

```
notebooks/
└── 02_Model_Development.ipynb
```

Saved Model Artifacts:

```
models/
├── xgboost_model.pkl
└── feature_columns.pkl
```

---

# Future Improvements

Possible enhancements include:

- Additional feature selection
- Model explainability using SHAP
- Threshold optimization
- Cross-validation with larger search space
- Model monitoring after deployment

---

# Conclusion

A complete machine learning pipeline was successfully developed for predicting late delivery risk.

The workflow includes:

- Data preprocessing
- Feature engineering
- Model training
- Hyperparameter tuning
- Model evaluation
- Model serialization

The trained XGBoost model achieved a balanced predictive performance with an **F1 Score of 79.39%**, making it suitable for integration into the SupplyPrescript backend for real-time prediction.