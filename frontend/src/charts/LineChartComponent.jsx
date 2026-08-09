import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function LineChartComponent({ data = [] }) {
  const shippingModes = [
    "Standard Class",
    "Second Class",
    "First Class",
    "Same Day",
  ];

  // Make sure data is always an array.
  // This prevents the dashboard from crashing when
  // API data has not loaded yet.
  const safeData = Array.isArray(data) ? data : [];

  const chartData = shippingModes.map((mode) => {
    const rows = safeData.filter(
      (item) => item?.shipping_mode === mode
    );

    const average =
      rows.length > 0
        ? rows.reduce(
            (sum, item) =>
              sum + Number(item?.days_for_shipping_real || 0),
            0
          ) / rows.length
        : 0;

    return {
      shippingMode: mode,
      averageDays: Number(average.toFixed(2)),
    };
  });

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        padding: "24px",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
        marginTop: "24px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            Average Shipping Days
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Shipping performance by delivery mode
          </p>
        </div>

        <div
          style={{
            background: "#eff6ff",
            color: "#2563eb",
            padding: "8px 14px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Shipping Performance
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: "320px" }}>
        {safeData.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#64748b",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "10px",
              }}
            >
              📊
            </div>

            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Loading shipment data...
            </p>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "12px",
                color: "#94a3b8",
              }}
            >
              Chart will update when shipment data is available.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="shippingMode"
                tick={{
                  fontSize: 12,
                  fill: "#475569",
                }}
                axisLine={{
                  stroke: "#cbd5e1",
                }}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "#475569",
                }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Days",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748b",
                  fontSize: 12,
                }}
              />

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow:
                    "0 8px 20px rgba(15, 23, 42, 0.12)",
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontWeight: "600",
                }}
                formatter={(value) => [
                  `${value} days`,
                  "Average Shipping",
                ]}
              />

              <Line
                type="monotone"
                dataKey="averageDays"
                stroke="#2563eb"
                strokeWidth={4}
                dot={{
                  r: 5,
                  fill: "#2563eb",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "#1d4ed8",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom information */}
      {safeData.length > 0 && (
        <div
          style={{
            marginTop: "14px",
            paddingTop: "14px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            Based on {safeData.length} shipment records
          </span>

          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#16a34a",
            }}
          >
            ● Live shipment data
          </span>
        </div>
      )}
    </div>
  );
}

export default LineChartComponent;