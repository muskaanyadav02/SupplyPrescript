import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { loadSupplyChainData } from "../data/loadSupplyChainData";

function AnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const result = await loadSupplyChainData();

        setData(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Analytics data error:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const analytics = useMemo(() => {
    const total = data.length;

    const late = data.filter(
      (item) =>
        String(item?.late_delivery_risk ?? "") === "1"
    ).length;

    const shippingDays = data.reduce((sum, item) => {
      const days = Number(
        item?.days_for_shipping_real ?? 0
      );

      return sum + (Number.isFinite(days) ? days : 0);
    }, 0);

    const averageDays =
      total > 0
        ? (shippingDays / total).toFixed(1)
        : "0.0";

    const onTime = Math.max(total - late, 0);

    const onTimeRate =
      total > 0
        ? ((onTime / total) * 100).toFixed(1)
        : "0.0";

    const totalSales = data.reduce((sum, item) => {
      const sales = Number(item?.sales ?? 0);

      return sum + (Number.isFinite(sales) ? sales : 0);
    }, 0);

    return {
      total,
      late,
      averageDays,
      onTimeRate,
      totalSales,
    };
  }, [data]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#64748b",
          fontSize: "16px",
        }}
      >
        Loading analytics...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f8fafc",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <BarChart3
              size={30}
              color="#2563eb"
            />

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: "800",
                color: "#0f172a",
              }}
            >
              Analytics
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Supply chain performance and operational insights.
          </p>
        </div>

        <div
          style={{
            background: "#eff6ff",
            color: "#2563eb",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          LIVE ANALYTICS
        </div>
      </div>

      {/* KPI GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "30px",
        }}
      >
        <AnalyticsCard
          icon={<Package size={25} />}
          title="Total Shipments"
          value={analytics.total.toLocaleString()}
          color="#2563eb"
        />

        <AnalyticsCard
          icon={<AlertTriangle size={25} />}
          title="Late Deliveries"
          value={analytics.late.toLocaleString()}
          color="#dc2626"
        />

        <AnalyticsCard
          icon={<Clock3 size={25} />}
          title="Average Shipping"
          value={`${analytics.averageDays} days`}
          color="#7c3aed"
        />

        <AnalyticsCard
          icon={<CheckCircle2 size={25} />}
          title="On-Time Rate"
          value={`${analytics.onTimeRate}%`}
          color="#16a34a"
        />
      </div>

      {/* PERFORMANCE SECTION */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        {/* DELIVERY PERFORMANCE */}

        <div className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Delivery Performance</h2>

              <p>
                Current on-time delivery performance.
              </p>
            </div>

            <CheckCircle2
              size={25}
              color="#16a34a"
            />
          </div>

          <div
            style={{
              marginTop: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                On-Time Deliveries
              </span>

              <strong
                style={{
                  color: "#16a34a",
                }}
              >
                {analytics.onTimeRate}%
              </strong>
            </div>

            <div
              style={{
                height: "12px",
                background: "#e2e8f0",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${analytics.onTimeRate}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg,#16a34a,#22c55e)",
                  borderRadius: "20px",
                }}
              />
            </div>
          </div>
        </div>

        {/* SHIPPING PERFORMANCE */}

        <div className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Shipping Performance</h2>

              <p>
                Average time required to complete shipments.
              </p>
            </div>

            <TrendingUp
              size={25}
              color="#7c3aed"
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "150px",
            }}
          >
            <div
              style={{
                textAlign: "center",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "42px",
                  color: "#0f172a",
                }}
              >
                {analytics.averageDays}
              </strong>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Average shipping days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE */}

      <div
        className="analytics-panel"
        style={{
          marginBottom: "25px",
        }}
      >
        <div className="analytics-panel-header">
          <div>
            <h2>Revenue Overview</h2>

            <p>
              Total sales generated from the available shipment dataset.
            </p>
          </div>

          <BarChart3
            size={25}
            color="#2563eb"
          />
        </div>

        <div
          style={{
            marginTop: "25px",
            fontSize: "36px",
            fontWeight: "800",
            color: "#2563eb",
          }}
        >
          ₹{Math.round(
            analytics.totalSales
          ).toLocaleString()}
        </div>
      </div>

      {/* INSIGHT */}

      <div
        style={{
          padding: "22px",
          borderRadius: "16px",
          background:
            "linear-gradient(135deg,#eff6ff,#f5f3ff)",
          border: "1px solid #dbeafe",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            color: "#0f172a",
          }}
        >
          💡 Analytics Insight
        </h3>

        <p
          style={{
            margin: 0,
            color: "#475569",
            lineHeight: "1.6",
            fontSize: "14px",
          }}
        >
          The analytics section provides a quick view of shipment
          volume, delivery performance, shipping time, and revenue.
          These metrics can be used to identify operational issues
          and improve supply chain decisions.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   ANALYTICS CARD
============================================================ */

function AnalyticsCard({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div className="analytics-kpi-card">
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}15`,
          color,
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

export default AnalyticsPage;