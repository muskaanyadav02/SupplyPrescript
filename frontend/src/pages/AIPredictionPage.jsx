import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Package,
} from "lucide-react";

import { loadSupplyChainData } from "../data/loadSupplyChainData";

function AIPredictionPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="page-loading">
        Loading AI prediction...
      </div>
    );
  }

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

      {/* MAIN PREDICTION */}

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

      {/* RECOMMENDATION */}

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

export default AIPredictionPage;