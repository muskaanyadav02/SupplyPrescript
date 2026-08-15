import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Package,
  Sparkles,
  Play,
} from "lucide-react";

import { loadSupplyChainData } from "../data/loadSupplyChainData";

const API_URL = "http://127.0.0.1:8000";

function AIPredictionPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Individual shipment prediction
  const [shipmentId, setShipmentId] = useState("");
  const [shipmentPrediction, setShipmentPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  // Prescriptive recommendations
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationLoading, setRecommendationLoading] =
    useState(false);
  const [recommendationError, setRecommendationError] =
    useState("");

  // Decision execution
  const [executing, setExecuting] = useState(false);
  const [executedDecision, setExecutedDecision] = useState(null);
  const [executionError, setExecutionError] = useState("");

  // ---------------------------------------------------------
  // LOAD EXISTING SUPPLY CHAIN DATA
  // ---------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await loadSupplyChainData();
        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Prediction data error:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ---------------------------------------------------------
  // OVERALL RISK CALCULATION
  // ---------------------------------------------------------

  const prediction = useMemo(() => {
    const total = data.length;

    const risky = data.filter(
      (item) =>
        String(item?.late_delivery_risk ?? "") === "1"
    ).length;

    const riskPercentage =
      total > 0
        ? ((risky / total) * 100).toFixed(1)
        : "0.0";

    let level = "Low";
    let color = "#16a34a";

    if (Number(riskPercentage) >= 50) {
      level = "High";
      color = "#dc2626";
    } else if (Number(riskPercentage) >= 25) {
      level = "Medium";
      color = "#f59e0b";
    }

    return {
      total,
      risky,
      riskPercentage,
      level,
      color,
    };
  }, [data]);

  // ---------------------------------------------------------
  // PREDICT INDIVIDUAL SHIPMENT
  // GET /predict/{shipment_id}
  // ---------------------------------------------------------

  const predictShipment = async () => {
    if (!shipmentId) {
      setPredictionError("Please enter a shipment ID.");
      return;
    }

    try {
      setPredictionLoading(true);
      setPredictionError("");
      setShipmentPrediction(null);

      // Clear previous recommendation/decision
      setRecommendations(null);
      setRecommendationError("");
      setExecutedDecision(null);
      setExecutionError("");

      const response = await fetch(
        `${API_URL}/predict/${shipmentId}`
      );

      if (!response.ok) {
        throw new Error(
          `Prediction request failed: ${response.status}`
        );
      }

      const result = await response.json();

      setShipmentPrediction(result);
    } catch (error) {
      console.error("Prediction error:", error);

      setPredictionError(
        "Unable to get prediction. Please check the shipment ID and make sure the backend is running."
      );
    } finally {
      setPredictionLoading(false);
    }
  };

  // ---------------------------------------------------------
  // GENERATE PRESCRIPTIVE RECOMMENDATIONS
  // POST /prescribe/{prediction_id}
  // ---------------------------------------------------------

  const generateRecommendations = async () => {
    if (!shipmentPrediction?.prediction_id) {
      setRecommendationError(
        "Please generate a shipment prediction first."
      );
      return;
    }

    try {
      setRecommendationLoading(true);
      setRecommendationError("");
      setRecommendations(null);
      setExecutedDecision(null);
      setExecutionError("");

      const response = await fetch(
        `${API_URL}/prescribe/${shipmentPrediction.prediction_id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Recommendation request failed: ${response.status}`
        );
      }

      const result = await response.json();

      setRecommendations(result);
    } catch (error) {
      console.error("Recommendation error:", error);

      setRecommendationError(
        "Unable to generate recommendations. Please try again."
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  // ---------------------------------------------------------
  // EXECUTE RECOMMENDED DECISION
  // POST /decisions/{prescription_id}/execute
  // ---------------------------------------------------------

  const executeRecommendedDecision = async () => {
    const recommendedOption =
      recommendations?.options?.find(
        (option) => option.recommended === true
      );

    if (!recommendedOption) {
      setExecutionError(
        "No recommended option is available to execute."
      );
      return;
    }

    try {
      setExecuting(true);
      setExecutionError("");
      setExecutedDecision(null);

      const response = await fetch(
        `${API_URL}/decisions/${recommendedOption.prescription_id}/execute?user_id=manager_01`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Decision execution failed: ${response.status}`
        );
      }

      const result = await response.json();

      setExecutedDecision(result);
    } catch (error) {
      console.error("Decision execution error:", error);

      setExecutionError(
        "Unable to execute the decision. Please try again."
      );
    } finally {
      setExecuting(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="page-loading">
        Loading AI prediction...
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------

  return (
    <div className="ai-page">

      {/* HEADER */}

      <div className="ai-header">
        <div>
          <div className="ai-title-row">
            <BrainCircuit
              size={32}
              color="#7c3aed"
            />

            <h1>AI Prediction</h1>
          </div>

          <p>
            Predictive supply chain risk analysis
            using shipment data.
          </p>
        </div>

        <div className="ai-badge">
          AI POWERED
        </div>
      </div>

      {/* OVERALL CURRENT RISK */}

      <div className="prediction-card">

        <div className="prediction-icon">
          <BrainCircuit size={42} />
        </div>

        <div className="prediction-content">

          <span className="prediction-label">
            CURRENT DELIVERY RISK
          </span>

          <strong
            style={{
              color: prediction.color,
            }}
          >
            {prediction.level}
          </strong>

          <p>
            {prediction.riskPercentage}% of available
            shipments are currently identified as
            having late-delivery risk.
          </p>

        </div>
      </div>

      {/* METRICS */}

      <div className="prediction-grid">

        <PredictionMetric
          icon={<Package size={24} />}
          title="Total Shipments"
          value={prediction.total}
          color="#2563eb"
        />

        <PredictionMetric
          icon={<AlertTriangle size={24} />}
          title="Risky Shipments"
          value={prediction.risky}
          color="#dc2626"
        />

        <PredictionMetric
          icon={<TrendingUp size={24} />}
          title="Risk Percentage"
          value={`${prediction.riskPercentage}%`}
          color="#7c3aed"
        />

        <PredictionMetric
          icon={<CheckCircle2 size={24} />}
          title="Prediction Status"
          value="Active"
          color="#16a34a"
        />

      </div>

      {/* RISK BAR */}

      <div className="prediction-panel">

        <h2>Delivery Risk Analysis</h2>

        <p>
          Risk distribution calculated from the
          current shipment dataset.
        </p>

        <div className="risk-bar-container">

          <div
            className="risk-bar"
            style={{
              width: `${prediction.riskPercentage}%`,
              background: prediction.color,
            }}
          />

        </div>

        <div className="risk-labels">

          <span>
            Low Risk
          </span>

          <strong>
            {prediction.riskPercentage}% Risk
          </strong>

          <span>
            High Risk
          </span>

        </div>
      </div>

      {/* GENERAL AI RECOMMENDATION */}

      <div className="prediction-panel recommendation-panel">

        <div className="recommendation-icon">
          💡
        </div>

        <div>

          <h2>AI Recommendation</h2>

          <p>
            {prediction.level === "High"
              ? "Immediate attention is recommended for high-risk shipments. Review delayed orders, shipping routes, and supplier performance."
              : prediction.level === "Medium"
              ? "Monitor shipments closely and review suppliers or shipping modes contributing to delivery delays."
              : "Current delivery risk is relatively low. Continue monitoring shipment performance and supplier activity."
            }
          </p>

        </div>

      </div>

      {/* =====================================================
          INDIVIDUAL SHIPMENT PREDICTION
      ===================================================== */}

      <div className="prediction-panel">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <BrainCircuit
            size={24}
            color="#7c3aed"
          />

          <h2 style={{ margin: 0 }}>
            Predict Individual Shipment
          </h2>
        </div>

        <p>
          Enter a shipment ID to get an AI-powered
          delivery risk prediction.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          <input
            type="number"
            placeholder="Enter Shipment ID"
            value={shipmentId}
            onChange={(e) =>
              setShipmentId(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                predictShipment();
              }
            }}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              width: "220px",
              fontSize: "14px",
            }}
          />

          <button
            onClick={predictShipment}
            disabled={predictionLoading}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "none",
              background: predictionLoading
                ? "#a78bfa"
                : "#7c3aed",
              color: "white",
              cursor: predictionLoading
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
            }}
          >
            {predictionLoading
              ? "Predicting..."
              : "Predict Risk"}
          </button>

        </div>

        {/* PREDICTION ERROR */}

        {predictionError && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#dc2626",
            }}
          >
            {predictionError}
          </div>
        )}

        {/* PREDICTION RESULT */}

        {shipmentPrediction && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "15px",
              }}
            >
              <CheckCircle2
                size={22}
                color="#16a34a"
              />

              <h3 style={{ margin: 0 }}>
                Prediction Result
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
              }}
            >

              <PredictionResult
                label="Shipment ID"
                value={
                  shipmentPrediction.shipment_id
                }
              />

              <PredictionResult
                label="Risk Level"
                value={
                  shipmentPrediction.risk_level
                }
                highlight={
                  shipmentPrediction.risk_level ===
                  "High"
                }
              />

              <PredictionResult
                label="Probability"
                value={`${shipmentPrediction.probability}%`}
              />

              <PredictionResult
                label="Predicted Delay"
                value={`${shipmentPrediction.predicted_delay_days} days`}
              />

              <PredictionResult
                label="Model Version"
                value={
                  shipmentPrediction.model_version
                }
              />

              <PredictionResult
                label="Prediction ID"
                value={
                  shipmentPrediction.prediction_id
                }
              />

            </div>

            {/* GENERATE RECOMMENDATIONS */}

            <button
              onClick={generateRecommendations}
              disabled={recommendationLoading}
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                background: recommendationLoading
                  ? "#a78bfa"
                  : "#7c3aed",
                color: "white",
                cursor: recommendationLoading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={18} />

              {recommendationLoading
                ? "Generating..."
                : "Generate Recommendations"}
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          PRESCRIPTIVE RECOMMENDATIONS
      ===================================================== */}

      {recommendationError && (
        <div
          className="prediction-panel"
          style={{
            color: "#dc2626",
            background: "#fef2f2",
          }}
        >
          {recommendationError}
        </div>
      )}

      {recommendations && (
        <div className="prediction-panel">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >

            <Sparkles
              size={24}
              color="#7c3aed"
            />

            <h2 style={{ margin: 0 }}>
              Optimized Recommendations
            </h2>

          </div>

          <p>
            The optimization engine evaluates
            possible actions under the available
            constraints.
          </p>

          {/* SOLVER INFORMATION */}

          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "10px",
              background: "#f5f3ff",
              display: "flex",
              gap: "25px",
              flexWrap: "wrap",
            }}
          >

            <div>
              <small>Solver Status</small>
              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#16a34a",
                }}
              >
                {recommendations.solver_status}
              </strong>
            </div>

            <div>
              <small>Budget</small>
              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                }}
              >
                ₹{recommendations.budget}
              </strong>
            </div>

            <div>
              <small>Maximum Time</small>
              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {recommendations.max_time_days} days
              </strong>
            </div>

            <div>
              <small>Optimal Option</small>
              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#7c3aed",
                }}
              >
                {recommendations.optimal_option}
              </strong>
            </div>

          </div>

          {/* OPTIONS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "18px",
              marginTop: "22px",
            }}
          >

            {recommendations.options?.map(
              (option) => (
                <div
                  key={option.prescription_id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    border: option.recommended
                      ? "2px solid #7c3aed"
                      : "1px solid #e5e7eb",
                    background: option.recommended
                      ? "#faf5ff"
                      : "white",
                    position: "relative",
                  }}
                >

                  {option.recommended && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        padding: "4px 8px",
                        borderRadius: "20px",
                        background: "#7c3aed",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      RECOMMENDED
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    Option {option.option_label}
                  </div>

                  <h3
                    style={{
                      margin: "0 0 15px 0",
                    }}
                  >
                    {option.action_type}
                  </h3>

                  <p>
                    <strong>Cost:</strong>{" "}
                    ₹{option.predicted_cost}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {option.predicted_time_days} days
                  </p>

                </div>
              )
            )}

          </div>

          {/* EXECUTE RECOMMENDED ACTION */}

          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb",
            }}
          >

            <button
              onClick={executeRecommendedDecision}
              disabled={executing}
              style={{
                padding: "13px 22px",
                borderRadius: "8px",
                border: "none",
                background: executing
                  ? "#9ca3af"
                  : "#16a34a",
                color: "white",
                cursor: executing
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >

              <Play size={18} />

              {executing
                ? "Executing..."
                : "Execute Recommended Action"}

            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          EXECUTED DECISION
      ===================================================== */}

      {executionError && (
        <div
          className="prediction-panel"
          style={{
            color: "#dc2626",
            background: "#fef2f2",
          }}
        >
          {executionError}
        </div>
      )}

      {executedDecision && (
        <div
          className="prediction-panel"
          style={{
            border: "2px solid #16a34a",
            background: "#f0fdf4",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "15px",
            }}
          >

            <CheckCircle2
              size={28}
              color="#16a34a"
            />

            <h2
              style={{
                margin: 0,
                color: "#166534",
              }}
            >
              Decision Executed Successfully
            </h2>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >

            <PredictionResult
              label="Decision ID"
              value={
                executedDecision.decision_id
              }
            />

            <PredictionResult
              label="Action"
              value={
                executedDecision.action_type
              }
            />

            <PredictionResult
              label="Predicted Cost"
              value={`₹${executedDecision.predicted_cost}`}
            />

            <PredictionResult
              label="Expected Time"
              value={`${executedDecision.predicted_time_days} days`}
            />

            <PredictionResult
              label="User"
              value={
                executedDecision.user_id
              }
            />

            <PredictionResult
              label="Status"
              value={
                executedDecision.status
              }
            />

          </div>

        </div>
      )}

    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function PredictionMetric({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div className="prediction-metric">

      <div
        className="prediction-metric-icon"
        style={{
          color,
          background: `${color}15`,
        }}
      >
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

/* ============================================================
   PREDICTION RESULT
============================================================ */

function PredictionResult({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        background: "white",
        border: "1px solid #e5e7eb",
      }}
    >
      <small
        style={{
          display: "block",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </small>

      <strong
        style={{
          color: highlight
            ? "#dc2626"
            : "#111827",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

export default AIPredictionPage;