## Backend — Predictive-Prescriptive Closed-Loop API

### Setup
1. Install dependencies: `pip install fastapi uvicorn`
2. Create the database schema: `python src/backend/setup_db.py`
3. Load sample shipment data: `python src/backend/populate_shipments.py`

### Running the API
python -m uvicorn src.backend.main:app --reload

API docs available at: `http://127.0.0.1:8000/docs`

### Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/shipments` | List sample shipments |
| GET | `/predict/{shipment_id}` | Predict delay probability using real XGBoost model (`models/xgboost_model.pkl`); delay duration is currently a placeholder estimate (7-14 days scaled by risk) pending confirmation from ML team |
| POST | `/prescribe/{prediction_id}` | Generate 3 constraint-filtered decision options |
| POST | `/decisions/{prescription_id}/execute` | Write back a chosen decision (idempotent) |
| GET | `/analytics/decision-roi` | Aggregated variance/ROI stats on past decisions |

### Closed-loop evaluation job
Simulates real-world outcomes for executed decisions, computes prediction variance, and logs a retraining flag if variance exceeds threshold:
python jobs/evaluate_outcomes.py

### End-to-end test
Run a full automated pass through predict → prescribe → execute → analytics, including an idempotency check:
 python test_full_flow.py
 Requires the server to be running (`python -m uvicorn src.backend.main:app --reload`) and `pip install requests`.

### Model files required
Place these two files in the `models/` folder before running `/predict`:
- `xgboost_model.pkl` — trained XGBoost classifier predicting `late_delivery_risk`
- `feature_columns.pkl` — the exact one-hot encoded column list the model expects

Install additional dependencies:
 pip install xgboost pandas
 Prediction logic pulls the shipment's original raw order data from the `supply_chain` table (joined via `order_id`), re-applies the same `pd.get_dummies(..., drop_first=True)` encoding used during training, and aligns columns to `feature_columns.pkl` before calling the model.