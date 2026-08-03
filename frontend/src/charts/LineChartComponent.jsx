import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function LineChartComponent({ data }) {
  const shippingModes = [
    "Standard Class",
    "Second Class",
    "First Class",
    "Same Day",
  ];

  const chartData = shippingModes.map((mode) => {
    const rows = data.filter(
      (item) => item.shipping_mode === mode
    );

    const average =
      rows.length > 0
        ? (
            rows.reduce(
              (sum, item) =>
                sum + Number(item.days_for_shipping_real || 0),
              0
            ) / rows.length
          ).toFixed(2)
        : 0;

    return {
      shippingMode: mode,
      averageDays: Number(average),
    };
  });

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: "20px",
      }}
    >
      <h2>Average Shipping Days by Shipping Mode</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="shippingMode" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="averageDays"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartComponent;