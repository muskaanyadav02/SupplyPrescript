import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Package,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { loadSupplyChainData } from "../data/loadSupplyChainData";

function AnalyticsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadData();
  }, []);

  const analytics = useMemo(() => {
    const total = data.length;

    const late = data.filter(
      (item) =>
        String(item?.late_delivery_risk ?? "") === "1"
    ).length;

    const onTime = Math.max(total - late, 0);

    const onTimeRate =
      total > 0
        ? (onTime / total) * 100
        : 0;

    const lateRate =
      total > 0
        ? (late / total) * 100
        : 0;

    const shippingTotal = data.reduce(
      (sum, item) =>
        sum +
        Number(item?.days_for_shipping_real ?? 0),
      0
    );

    const averageShipping =
      total > 0
        ? shippingTotal / total
        : 0;

    const revenue = data.reduce(
      (sum, item) =>
        sum + Number(item?.sales ?? 0),
      0
    );

    /*
      Shipping mode analysis
    */

    const shippingModes = {};

    data.forEach((item) => {
      const mode =
        item?.shipping_mode ||
        item?.ShippingMode ||
        item?.shippingMode ||
        "Unknown";

      const days = Number(
        item?.days_for_shipping_real ?? 0
      );

      if (!shippingModes[mode]) {
        shippingModes[mode] = {
          totalDays: 0,
          count: 0,
        };
      }

      shippingModes[mode].totalDays +=
        Number.isFinite(days) ? days : 0;

      shippingModes[mode].count += 1;
    });

    const shippingPerformance = Object.entries(
      shippingModes
    )
      .map(([mode, values]) => ({
        mode,
        averageDays:
          values.count > 0
            ? Number(
                (
                  values.totalDays /
                  values.count
                ).toFixed(1)
              )
            : 0,
      }))
      .sort(
        (a, b) =>
          b.averageDays - a.averageDays
      )
      .slice(0, 6);

    /*
      Risk distribution
    */

    const riskData = [
      {
        name: "High Risk",
        value: late,
      },
      {
        name: "Low Risk",
        value: onTime,
      },
    ];

    /*
      Revenue by shipping mode
    */

    const revenueModes = {};

    data.forEach((item) => {
      const mode =
        item?.shipping_mode ||
        item?.ShippingMode ||
        item?.shippingMode ||
        "Unknown";

      const sales = Number(
        item?.sales ?? 0
      );

      revenueModes[mode] =
        (revenueModes[mode] || 0) +
        (Number.isFinite(sales) ? sales : 0);
    });

    const revenueData = Object.entries(
      revenueModes
    )
      .map(([mode, revenue]) => ({
        mode,
        revenue: Number(
          revenue.toFixed(0)
        ),
      }))
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 6);

    return {
      total,
      late,
      onTime,
      onTimeRate,
      lateRate,
      averageShipping,
      revenue,
      riskData,
      shippingPerformance,
      revenueData,
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
          fontSize: "18px",
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
        background: "#f8fafc",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <BarChart3
              size={32}
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
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Supply chain performance and
            operational insights.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            borderRadius: "9px",
            background: "#2563eb",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={17} />
          Refresh Analysis
        </button>
      </div>

      {/* LIVE BADGE */}

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          background: "#dcfce7",
          color: "#15803d",
          padding: "7px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "700",
          marginBottom: "22px",
        }}
      >
        ● LIVE ANALYTICS
      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        <KpiCard
          icon={<Package size={24} />}
          title="Total Shipments"
          value={analytics.total.toLocaleString()}
          color="#2563eb"
        />

        <KpiCard
          icon={<AlertTriangle size={24} />}
          title="Late Deliveries"
          value={analytics.late.toLocaleString()}
          color="#dc2626"
        />

        <KpiCard
          icon={<Clock3 size={24} />}
          title="Average Shipping"
          value={`${analytics.averageShipping.toFixed(
            1
          )} days`}
          color="#7c3aed"
        />

        <KpiCard
          icon={<CheckCircle2 size={24} />}
          title="On-Time Rate"
          value={`${analytics.onTimeRate.toFixed(
            1
          )}%`}
          color="#16a34a"
        />

        <KpiCard
          icon={<IndianRupee size={24} />}
          title="Total Revenue"
          value={`₹${Math.round(
            analytics.revenue
          ).toLocaleString()}`}
          color="#ea580c"
        />
      </div>

      {/* =====================================================
          CHART ROW 1
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >

        {/* DELIVERY PERFORMANCE */}

        <ChartCard
          title="Delivery Performance"
          description="On-time versus late shipment distribution."
        >
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <PieChart>
              <Pie
                data={analytics.riskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
              >
                {analytics.riskData.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#dc2626"
                          : "#16a34a"
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "25px",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <span>
              On-Time:{" "}
              <strong>
                {analytics.onTimeRate.toFixed(
                  1
                )}
                %
              </strong>
            </span>

            <span>
              Late:{" "}
              <strong>
                {analytics.lateRate.toFixed(
                  1
                )}
                %
              </strong>
            </span>
          </div>
        </ChartCard>

        {/* RISK ANALYSIS */}

        <ChartCard
          title="Delivery Risk Summary"
          description="Current late-delivery risk across available shipments."
        >
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart
              data={analytics.riskData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Shipments"
                radius={[6, 6, 0, 0]}
              >
                {analytics.riskData.map(
                  (entry, index) => (
                    <Cell
                      key={`risk-${index}`}
                      fill={
                        index === 0
                          ? "#dc2626"
                          : "#16a34a"
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* =====================================================
          CHART ROW 2
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >

        {/* SHIPPING PERFORMANCE */}

        <ChartCard
          title="Shipping Performance"
          description="Average shipping time by shipping mode."
        >
          {analytics.shippingPerformance.length >
          0 ? (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={
                  analytics.shippingPerformance
                }
                margin={{
                  top: 15,
                  right: 20,
                  left: 0,
                  bottom: 45,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="mode"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="averageDays"
                  name="Average Days"
                  fill="#7c3aed"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>

        {/* REVENUE */}

        <ChartCard
          title="Revenue Overview"
          description="Revenue generated by shipping mode."
        >
          {analytics.revenueData.length >
          0 ? (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={
                  analytics.revenueData
                }
                margin={{
                  top: 15,
                  right: 20,
                  left: 10,
                  bottom: 45,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="mode"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(
                      value
                    ).toLocaleString()}`
                  }
                />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#ea580c"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>
      </div>

      {/* =====================================================
          AI DECISION INTELLIGENCE
      ====================================================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #eff6ff, #f5f3ff)",
          border:
            "1px solid #dbeafe",
          borderRadius: "16px",
          padding: "25px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <BarChart3
            size={24}
            color="#2563eb"
          />

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            AI Decision Intelligence
          </h2>
        </div>

        <p
          style={{
            color: "#475569",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          {analytics.lateRate.toFixed(1)}% of
          shipments are currently identified
          with late-delivery risk. Use the{" "}
          <strong>
            AI Prediction
          </strong>{" "}
          page to analyze individual
          shipments and generate optimized
          operational actions.
        </p>
      </div>

      {/* OPERATIONAL INSIGHT */}

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "22px",
          border:
            "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            color: "#0f172a",
          }}
        >
          💡 Operational Insight
        </h3>

        <p
          style={{
            margin: 0,
            color: "#475569",
            lineHeight: "1.6",
          }}
        >
          {analytics.late > 0
            ? `${analytics.late.toLocaleString()} shipments require attention based on the current delivery-risk data. Managers can investigate these shipments through AI Prediction and use Recommendations for operational decision support.`
            : "Current shipment performance is stable. Continue monitoring delivery risk, shipping time and revenue trends."}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.06)",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          background: `${color}15`,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <span
          style={{
            display: "block",
            color: "#64748b",
            fontSize: "13px",
            marginBottom: "5px",
          }}
        >
          {title}
        </span>

        <strong
          style={{
            display: "block",
            fontSize: "22px",
            color: "#0f172a",
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

/* ============================================================
   CHART CARD
============================================================ */

function ChartCard({
  title,
  description,
  children,
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.05)",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "19px",
          color: "#0f172a",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "6px 0 0",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {description}
      </p>

      <div
        style={{
          marginTop: "15px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY CHART
============================================================ */

function EmptyChartMessage() {
  return (
    <div
      style={{
        height: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
      }}
    >
      No chart data available.
    </div>
  );
}

export default AnalyticsPage;