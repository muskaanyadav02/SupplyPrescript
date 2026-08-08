import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Truck,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import { loadSupplyChainData } from "../data/loadSupplyChainData";

function RecommendationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const result = await loadSupplyChainData();

      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Recommendation data error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const analysis = useMemo(() => {
    const total = data.length;

    const late = data.filter(
      (item) =>
        String(item?.late_delivery_risk ?? "") === "1"
    );

    const averageShippingDays =
      total > 0
        ? data.reduce(
            (sum, item) =>
              sum +
              Number(
                item?.days_for_shipping_real ?? 0
              ),
            0
          ) / total
        : 0;

    const recommendations = [];

    if (late.length > 0) {
      recommendations.push({
        icon: AlertTriangle,
        title: "Review Late Deliveries",
        description: `${late.length} shipments are currently identified with late-delivery risk. Prioritize these shipments for operational review.`,
        type: "High Priority",
        color: "#dc2626",
        background: "#fef2f2",
      });
    }

    if (averageShippingDays > 4) {
      recommendations.push({
        icon: Truck,
        title: "Optimize Shipping Performance",
        description: `Average shipping time is ${averageShippingDays.toFixed(
          1
        )} days. Review shipping modes and supplier performance to reduce delays.`,
        type: "Optimization",
        color: "#f59e0b",
        background: "#fffbeb",
      });
    }

    if (total > 0 && late.length === 0) {
      recommendations.push({
        icon: CheckCircle2,
        title: "Maintain Current Performance",
        description:
          "No late-delivery risk was detected in the current dataset. Continue monitoring shipment performance.",
        type: "Positive",
        color: "#16a34a",
        background: "#f0fdf4",
      });
    }

    recommendations.push({
      icon: TrendingUp,
      title: "Monitor Shipment Trends",
      description:
        "Continue monitoring shipping time, delivery risk and supplier performance through the analytics dashboard.",
      type: "Monitoring",
      color: "#2563eb",
      background: "#eff6ff",
    });

    return {
      total,
      late: late.length,
      averageShippingDays,
      recommendations,
    };
  }, [data]);

  return (
    <div className="recommendations-page">

      {/* HEADER */}

      <div className="recommendations-header">

        <div>
          <div className="recommendations-title">

            <Lightbulb
              size={32}
              color="#f59e0b"
            />

            <h1>
              Recommendations
            </h1>

          </div>

          <p>
            AI-powered supply chain recommendations
            based on current shipment data.
          </p>
        </div>

        <button
          className="recommendation-refresh"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading ? "spin-icon" : ""
            }
          />

          {loading
            ? "Loading..."
            : "Refresh Analysis"}
        </button>

      </div>

      {/* SUMMARY */}

      <div className="recommendation-summary">

        <div className="recommendation-summary-card">
          <span>Total Shipments</span>
          <strong>{analysis.total}</strong>
        </div>

        <div className="recommendation-summary-card danger">
          <span>Late Risk</span>
          <strong>{analysis.late}</strong>
        </div>

        <div className="recommendation-summary-card warning">
          <span>Avg Shipping</span>
          <strong>
            {analysis.averageShippingDays.toFixed(1)} days
          </strong>
        </div>

        <div className="recommendation-summary-card success">
          <span>Recommendations</span>
          <strong>
            {analysis.recommendations.length}
          </strong>
        </div>

      </div>

      {/* CONTENT */}

      <div className="recommendations-panel">

        <div className="recommendations-panel-header">

          <div>
            <h2>
              Recommended Actions
            </h2>

            <p>
              Actions generated from the current
              supply chain dataset.
            </p>
          </div>

          <div className="ai-insight-badge">
            ✨ AI Insights
          </div>

        </div>

        {loading ? (

          <div className="recommendation-empty">
            <RefreshCw
              size={32}
              className="spin-icon"
            />

            <p>
              Analyzing shipment data...
            </p>
          </div>

        ) : analysis.recommendations.length === 0 ? (

          <div className="recommendation-empty">

            <Lightbulb size={38} />

            <h3>
              No recommendations available
            </h3>

            <p>
              More shipment data is required.
            </p>

          </div>

        ) : (

          <div className="recommendation-list">

            {analysis.recommendations.map(
              (recommendation, index) => {

                const Icon =
                  recommendation.icon;

                return (
                  <div
                    className="recommendation-item"
                    key={index}
                    style={{
                      background:
                        recommendation.background,
                      borderLeft:
                        `5px solid ${recommendation.color}`,
                    }}
                  >

                    <div
                      className="recommendation-item-icon"
                      style={{
                        color:
                          recommendation.color,
                      }}
                    >
                      <Icon size={25} />
                    </div>

                    <div className="recommendation-item-content">

                      <div className="recommendation-item-top">

                        <h3>
                          {recommendation.title}
                        </h3>

                        <span
                          style={{
                            color:
                              recommendation.color,
                          }}
                        >
                          {recommendation.type}
                        </span>

                      </div>

                      <p>
                        {recommendation.description}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default RecommendationsPage;