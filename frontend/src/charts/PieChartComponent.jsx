import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function PieChartComponent({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  /*
   * ------------------------------------------------------------
   * DELIVERY STATUS CALCULATION
   * ------------------------------------------------------------
   *
   * We are using the existing CSV field:
   *
   * late_delivery_risk
   *
   * 1 = Late / At Risk
   * 0 = On Time
   */

  let onTime = 0;
  let late = 0;
  let atRisk = 0;

  safeData.forEach((item) => {
    if (!item) return;

    const risk = String(
      item?.late_delivery_risk ?? ""
    ).trim();

    if (risk === "1") {
      late++;
    } else if (risk === "0") {
      onTime++;
    } else {
      atRisk++;
    }
  });

  /*
   * ------------------------------------------------------------
   * CHART DATA
   * ------------------------------------------------------------
   */

  const chartData = [
    {
      name: "On Time",
      value: onTime,
    },
    {
      name: "Late",
      value: late,
    },
    {
      name: "At Risk",
      value: atRisk,
    },
  ].filter((item) => item.value > 0);

  /*
   * ------------------------------------------------------------
   * COLORS
   * ------------------------------------------------------------
   */

  const COLORS = [
    "#16a34a",
    "#ef4444",
    "#f59e0b",
  ];

  /*
   * ------------------------------------------------------------
   * TOTAL
   * ------------------------------------------------------------
   */

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  /*
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <div
      style={{
        width: "100%",
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "20px",
        padding: "24px",
        boxSizing: "border-box",
        border: "1px solid #e2e8f0",
        boxShadow:
          "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            Delivery Status
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Current shipment delivery distribution
          </p>

        </div>

        <div
          style={{
            background:
              "linear-gradient(135deg, #eff6ff, #dbeafe)",
            color: "#2563eb",
            padding: "8px 14px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          AI ANALYTICS
        </div>

      </div>


      {/* =====================================================
          NO DATA
      ===================================================== */}

      {safeData.length === 0 || chartData.length === 0 ? (

        <div
          style={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
          }}
        >

          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              marginBottom: "15px",
            }}
          >
            📊
          </div>

          <h3
            style={{
              margin: 0,
              color: "#334155",
              fontSize: "16px",
            }}
          >
            No delivery data available
          </h3>

          <p
            style={{
              marginTop: "6px",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Load the supply chain dataset to view
            delivery distribution.
          </p>

        </div>

      ) : (

        /* =====================================================
           CHART
        ===================================================== */

        <div
          style={{
            width: "100%",
            height: "330px",
          }}
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                stroke="#ffffff"
                strokeWidth={3}
              >

                {chartData.map(
                  (entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>


              {/* TOOLTIP */}

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow:
                    "0 8px 20px rgba(15, 23, 42, 0.12)",
                }}
                formatter={(value, name) => [
                  value,
                  name,
                ]}
              />


              {/* LEGEND */}

              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
              />

            </PieChart>

          </ResponsiveContainer>

        </div>

      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {chartData.length > 0 && (

        <div
          style={{
            marginTop: "12px",
            paddingTop: "15px",
            borderTop:
              "1px solid #e2e8f0",
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "12px",
          }}
        >

          {/* ON TIME */}

          <div
            style={{
              background: "#f0fdf4",
              padding: "12px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >

            <div
              style={{
                color: "#16a34a",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              ON TIME
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "20px",
                color: "#15803d",
              }}
            >
              {onTime}
            </strong>

          </div>


          {/* LATE */}

          <div
            style={{
              background: "#fef2f2",
              padding: "12px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >

            <div
              style={{
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              LATE
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "20px",
                color: "#b91c1c",
              }}
            >
              {late}
            </strong>

          </div>


          {/* TOTAL */}

          <div
            style={{
              background: "#eff6ff",
              padding: "12px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >

            <div
              style={{
                color: "#2563eb",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              TOTAL
            </div>

            <strong
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "20px",
                color: "#1d4ed8",
              }}
            >
              {total}
            </strong>

          </div>

        </div>

      )}

    </div>
  );
}

export default PieChartComponent;