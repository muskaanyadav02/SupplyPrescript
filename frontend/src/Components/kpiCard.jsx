import "./KpiCard.css";

function KpiCard({ title, value, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>

      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <h2 className="kpi-value">{value}</h2>
      </div>
    </div>
  );
}

export default KpiCard;