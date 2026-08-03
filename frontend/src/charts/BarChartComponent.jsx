import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function BarChartComponent({ data = [] }) {
  // Wait until data loads
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <h2>Top 5 Product Categories</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const categoryCount = {};

  data.forEach((item) => {
    const category = item.category_name?.trim();

    if (!category) return;

    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const chartData = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  console.log("Bar Chart Data:", chartData);

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
      <h2>Top 5 Product Categories</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartComponent;