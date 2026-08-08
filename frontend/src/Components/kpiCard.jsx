import { TrendingUp } from "lucide-react";
import "./KpiCard.css";

function KpiCard({
  title,
  value,
  icon: Icon,
  color = "kpi-blue",
}) {
  return (
    <div className={`kpi-card ${color}`}>

      <div className="kpi-content">

        <p className="kpi-title">
          {title}
        </p>

        <h2 className="kpi-value">
          {value}
        </h2>

        <div className="kpi-live">

          <TrendingUp size={15} />

          <span>
            Updated Live
          </span>

        </div>

      </div>

      <div className="kpi-icon">

        {Icon && (
          <Icon size={28} />
        )}

      </div>

    </div>
  );
}

export default KpiCard;