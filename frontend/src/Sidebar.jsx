import {
  LayoutDashboard,
  Truck,
  BrainCircuit,
  Lightbulb,
  BarChart3,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Shipments",
      path: "/shipments",
      icon: Truck,
    },
    {
      name: "AI Prediction",
      path: "/ai-prediction",
      icon: BrainCircuit,
    },
    {
      name: "Recommendations",
      path: "/recommendations",
      icon: Lightbulb,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        padding: "25px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "5px 10px 30px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "21px",
            fontWeight: "800",
            color: "#38bdf8",
          }}
        >
          SupplyPrescript
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "11px",
            color: "#94a3b8",
          }}
        >
          Supply Chain Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav>
        <p
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
            padding: "0 10px",
            marginBottom: "12px",
          }}
        >
          Main Menu
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "7px",
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive ? "700" : "500",

                  background: isActive
                    ? "#2563eb"
                    : "transparent",

                  color: isActive
                    ? "#ffffff"
                    : "#cbd5e1",

                  transition: "all 0.2s ease",
                })}
              >
                <Icon size={19} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Status */}
      <div
        style={{
          marginTop: "40px",
          padding: "14px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#cbd5e1",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />

          API Connected
        </div>
      </div>
    </div>
  );
}

export default Sidebar;