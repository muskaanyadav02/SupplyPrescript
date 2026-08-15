import { useEffect, useMemo, useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Truck,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Package,
  Clock,
} from "lucide-react";

import { loadSupplyChainData } from "../data/loadSupplyChainData";

function RecommendationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD SHIPMENT DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await loadSupplyChainData();

      const shipmentData = Array.isArray(result)
        ? result
        : [];

      setData(shipmentData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "Recommendation data error:",
        error
      );

      setData([]);
      setError(
        "Unable to load shipment data. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // ANALYZE CURRENT SHIPMENT DATA
  // =========================================================

  const analysis = useMemo(() => {
    const total = data.length;

    const lateShipments = data.filter(
      (item) =>
        String(item?.late_delivery_risk ?? "") === "1"
    );

    const lateCount = lateShipments.length;

    const riskPercentage =
      total > 0
        ? ((lateCount / total) * 100).toFixed(1)
        : "0.0";

    const shippingDays = data
      .map((item) =>
        Number(
          item?.days_for_shipping_real ?? 0
        )
      )
      .filter((days) => days > 0);

    const averageShippingDays =
      shippingDays.length > 0
        ? shippingDays.reduce(
            (sum, days) => sum + days,
            0
          ) / shippingDays.length
        : 0;

    let riskLevel = "Low";
    let riskColor = "#16a34a";

    if (Number(riskPercentage) >= 50) {
      riskLevel = "High";
      riskColor = "#dc2626";
    } else if (Number(riskPercentage) >= 25) {
      riskLevel = "Medium";
      riskColor = "#f59e0b";
    }

    // -------------------------------------------------------
    // OPERATIONAL RECOMMENDATIONS
    // -------------------------------------------------------

    const recommendations = [];

    if (lateCount > 0) {
      recommendations.push({
        icon: AlertTriangle,
        title: "Review Late Deliveries",
        description: `${lateCount} shipments are currently identified with late-delivery risk. Prioritize these shipments for operational review.`,
        type:
          Number(riskPercentage) >= 50
            ? "High Priority"
            : "Priority",
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
        )} days. Review shipping modes, routes and supplier performance to reduce delays.`,
        type: "Optimization",
        color: "#f59e0b",
        background: "#fffbeb",
      });
    } else if (averageShippingDays > 0) {
      recommendations.push({
        icon: CheckCircle2,
        title: "Maintain Shipping Performance",
        description: `Average shipping time is ${averageShippingDays.toFixed(
          1
        )} days. Continue monitoring shipping performance and supplier activity.`,
        type: "Positive",
        color: "#16a34a",
        background: "#f0fdf4",
      });
    }

    if (total > 0) {
      recommendations.push({
        icon: TrendingUp,
        title: "Monitor Shipment Trends",
        description:
          "Continue monitoring delivery risk, shipping time and supplier performance through the analytics dashboard.",
        type: "Monitoring",
        color: "#2563eb",
        background: "#eff6ff",
      });
    }

    if (total === 0) {
      recommendations.push({
        icon: Package,
        title: "Awaiting Shipment Data",
        description:
          "No shipment records are currently available. Refresh the analysis after shipment data becomes available.",
        type: "Information",
        color: "#6b7280",
        background: "#f9fafb",
      });
    }

    return {
      total,
      lateCount,
      riskPercentage,
      averageShippingDays,
      riskLevel,
      riskColor,
      recommendations,
    };
  }, [data]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading && data.length === 0) {
    return (
      <div className="page-loading">
        <RefreshCw
          size={30}
          className="spin-icon"
        />

        <p>
          Analyzing current shipment data...
        </p>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="recommendations-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
            Operational insights and recommendations
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
            ? "Analyzing..."
            : "Refresh Analysis"}

        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="recommendation-summary">

        <div className="recommendation-summary-card">

          <span>
            Total Shipments
          </span>

          <strong>
            {analysis.total}
          </strong>

        </div>

        <div className="recommendation-summary-card danger">

          <span>
            Late Risk
          </span>

          <strong>
            {analysis.lateCount}
          </strong>

        </div>

        <div className="recommendation-summary-card warning">

          <span>
            Avg Shipping
          </span>

          <strong>
            {analysis.averageShippingDays > 0
              ? `${analysis.averageShippingDays.toFixed(
                  1
                )} days`
              : "—"}
          </strong>

        </div>

        <div className="recommendation-summary-card success">

          <span>
            Recommendations
          </span>

          <strong>
            {analysis.recommendations.length}
          </strong>

        </div>

      </div>

      {/* =====================================================
          CURRENT RISK OVERVIEW
      ===================================================== */}

      <div
        className="recommendations-panel"
        style={{
          marginBottom: "20px",
        }}
      >

        <div className="recommendations-panel-header">

          <div>

            <h2>
              Current Delivery Risk
            </h2>

            <p>
              Overall late-delivery risk calculated
              from the current shipment dataset.
            </p>

          </div>

          <div
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              background: `${analysis.riskColor}15`,
              color: analysis.riskColor,
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            {analysis.riskLevel} Risk
          </div>

        </div>

        <div
          style={{
            marginTop: "20px",
          }}
        >

          <div
            style={{
              height: "12px",
              width: "100%",
              background: "#e5e7eb",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >

            <div
              style={{
                height: "100%",
                width: `${analysis.riskPercentage}%`,
                background: analysis.riskColor,
                borderRadius: "10px",
                transition: "width 0.4s ease",
              }}
            />

          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >

            <span>
              Low Risk
            </span>

            <strong
              style={{
                color: analysis.riskColor,
              }}
            >
              {analysis.riskPercentage}% at risk
            </strong>

            <span>
              High Risk
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          RECOMMENDATIONS
      ===================================================== */}

      <div className="recommendations-panel">

        <div className="recommendations-panel-header">

          <div>

            <h2>
              Recommended Actions
            </h2>

            <p>
              Operational actions generated from the
              current shipment data.
            </p>

          </div>

          <div className="ai-insight-badge">
            ✨ Operational Insights
          </div>

        </div>

        {loading ? (

          <div className="recommendation-empty">

            <RefreshCw
              size={32}
              className="spin-icon"
            />

            <p>
              Refreshing shipment analysis...
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
                    key={`${recommendation.title}-${index}`}
                    style={{
                      background:
                        recommendation.background,
                      borderLeft:
                        `5px solid ${recommendation.color}`,
                    }}
                  >

                    {/* ICON */}

                    <div
                      className="recommendation-item-icon"
                      style={{
                        color:
                          recommendation.color,
                      }}
                    >
                      <Icon size={25} />
                    </div>

                    {/* CONTENT */}

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

      {/* =====================================================
          DATA STATUS
      ===================================================== */}

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#6b7280",
        }}
      >

        <Clock size={15} />

        {lastUpdated ? (
          <span>
            Analysis updated at{" "}
            {lastUpdated.toLocaleTimeString()}
          </span>
        ) : (
          <span>
            Waiting for data refresh
          </span>
        )}

      </div>

      {/* =====================================================
          EXPLANATION FOR USER
      ===================================================== */}

      <div
        style={{
          marginTop: "20px",
          padding: "16px 18px",
          borderRadius: "10px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
          }}
        >

          <Lightbulb
            size={20}
            color="#f59e0b"
          />

          <div>

            <strong>
              Decision Support
            </strong>

            <p
              style={{
                margin:
                  "5px 0 0 0",
                color: "#6b7280",
                lineHeight: "1.5",
              }}
            >
              These insights help managers identify
              areas that need attention. For
              shipment-level AI prediction and
              optimized action selection, use the
              AI Prediction page.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default RecommendationsPage;