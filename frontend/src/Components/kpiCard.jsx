import {
  FaBoxes,
  FaExclamationTriangle,
  FaDollarSign,
  FaTruck,
} from "react-icons/fa";

function KpiCard({ title, value, icon }) {
  let bgColor = "from-blue-500 to-blue-700";
  let Icon = FaBoxes;

  if (title === "Late Deliveries") {
    bgColor = "from-red-500 to-red-700";
    Icon = FaExclamationTriangle;
  }

  if (title === "Total Sales") {
    bgColor = "from-green-500 to-green-700";
    Icon = FaDollarSign;
  }

  if (title === "Avg Shipping Days") {
    bgColor = "from-orange-500 to-orange-700";
    Icon = FaTruck;
  }

  return (
    <div
      className={`bg-gradient-to-r ${bgColor}
      rounded-2xl
      shadow-lg
      hover:shadow-2xl
      hover:scale-105
      transition-all
      duration-300
      text-white
      p-6`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          <p className="text-xs mt-3 opacity-80">
            Updated Live
          </p>
        </div>

        <Icon
          size={42}
          className="opacity-80"
        />
      </div>
    </div>
  );
}

export default KpiCard;