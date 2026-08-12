## Backend — Predictive-Prescriptive Closed-Loop API

### Setup
1. Install dependencies:
   `pip install fastapi uvicorn pandas xgboost pulp`

2. Create the database schema:
   `python src/backend/setup_db.py`

3. Load sample shipment data:
   `python src/backend/populate_shipments.py`

### Running the API
`python -m uvicorn src.backend.main:app --reload`

API docs available at: `http://127.0.0.1:8000/docs`

### Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the SupplyPrescript API is running |
| GET | `/shipments` | List up to 20 shipment records from the database |
| GET | `/predict/{shipment_id}` | Predict shipment delay probability using the real XGBoost model and save the prediction to the database |
| POST | `/prescribe/{prediction_id}` | Generate feasible decision options and select the optimal option using PuLP optimization |
| POST | `/decisions/{prescription_id}/execute` | Execute a selected prescription and record the decision; repeated execution is handled idempotently |
| GET | `/analytics/decision-roi` | Return aggregated decision outcome, cost variance, and action-type analytics |

### Closed-loop evaluation job
Simulates real-world outcomes for executed decisions, computes prediction variance, and logs a retraining flag if variance exceeds the defined threshold:

`python jobs/evaluate_outcomes.py`

### End-to-end test
Run a full automated pass through predict → prescribe → execute → analytics, including an idempotency check:

`python test_full_flow.py`

Requires the server to be running:

`python -m uvicorn src.backend.main:app --reload`

and install the requests package if required:

`pip install requests`

### Model files required
Place these two files in the `models/` folder before running `/predict`:

- `xgboost_model.pkl` — trained XGBoost classifier predicting `late_delivery_risk`
- `feature_columns.pkl` — the exact one-hot encoded column list the model expects

Install additional dependencies:

`pip install xgboost pandas`

Prediction logic pulls the shipment's original raw order data from the `supply_chain` table using the shipment's `order_id`, re-applies the same `pd.get_dummies(..., drop_first=True)` encoding used during training, and aligns the columns to `feature_columns.pkl` before calling the XGBoost model.

### CORS configuration
The API allows requests from the React/Vite frontend during local development:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

This allows the frontend application to communicate with the FastAPI backend.

### Database
The backend uses the project's SQLite database:

`database/supply_chain.db`

The main backend endpoints use the same database connection for shipment, prediction, prescription, decision, and analytics operations.