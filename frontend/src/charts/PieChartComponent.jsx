import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { recommendationData } from "../data/chartData";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function PieChartComponent() {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Recommendation Distribution</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={recommendationData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {recommendationData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartComponent;