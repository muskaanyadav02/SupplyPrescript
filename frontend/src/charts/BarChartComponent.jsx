import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { supplierPerformance } from "../data/chartData";

function BarChartComponent() {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Supplier Performance</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={supplierPerformance}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="supplier" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="shipments" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartComponent;