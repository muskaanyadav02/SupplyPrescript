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
| GET | `/predict/{shipment_id}` | Predict delay probability using real XGBoost model (`models/xgboost_model.pkl`); delay duration is currently a placeholder estimate pending confirmation from ML team |
| POST | `/prescribe/{prediction_id}` | Generate 3 constraint-filtered decision options |
| POST | `/decisions/{prescription_id}/execute` | Write back a chosen decision (idempotent) |
| GET | `/analytics/decision-roi` | Aggregated variance/ROI stats on past decisions |

### Closed-loop evaluation job
Simulates real-world outcomes for executed decisions, computes prediction variance, and logs a retraining flag if variance exceeds threshold:
python jobs/evaluate_outcomes.py

### Model files required
Place `xgboost_model.pkl` and `feature_columns.pkl` in the `models/` folder before running `/predict`. Install additional dependencies: