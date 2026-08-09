import {
  Settings,
  Database,
  Bell,
} from "lucide-react";

function SettingsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f8fafc,#f1f5f9)",
        padding: "40px",
      }}
    >

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "32px",
            boxShadow:
              "0 15px 40px rgba(15,23,42,0.08)",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >

            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg,#475569,#1e293b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Settings size={30} />
            </div>

            <div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                Settings
              </h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                }}
              >
                Configure your SupplyPrescript platform
              </p>

            </div>

          </div>

          <div
            style={{
              marginTop: "35px",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
            }}
          >

            <div
              style={{
                padding: "25px",
                background: "#f8fafc",
                borderRadius: "18px",
              }}
            >
              <Database color="#475569" />

              <h3>
                Data Connection
              </h3>

              <p>
                Supply chain database and API settings.
              </p>
            </div>

            <div
              style={{
                padding: "25px",
                background: "#f8fafc",
                borderRadius: "18px",
              }}
            >
              <Bell color="#475569" />

              <h3>
                Notifications
              </h3>

              <p>
                Configure alerts and shipment notifications.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SettingsPage;