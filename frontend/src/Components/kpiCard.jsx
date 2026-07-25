import "./KpiCard.css";

function KpiCard({ title, value, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>

      <div className="kpi-content">
        <h3>{title}</h3>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default KpiCard;

