function ShipmentTable({ shipmentData = [] }) {
  console.log("Shipment Data:");
  console.log(shipmentData);

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: "30px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Shipment History
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#2563eb",
              color: "white",
            }}
          >
            <th style={{ padding: "12px" }}>Order ID</th>
            <th>Product</th>
            <th>Customer</th>
            <th>Delivery Status</th>
            <th>Shipping Mode</th>
            <th>Sales ($)</th>
          </tr>
        </thead>

        <tbody>
          {shipmentData.length > 0 ? (
            shipmentData.map((shipment, index) => (
              <tr
                key={index}
                style={{
                  textAlign: "center",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <td style={{ padding: "12px" }}>
                  {shipment.order_id || "N/A"}
                </td>

                <td>{shipment.product_name || "N/A"}</td>

                <td>
                  {(shipment.customer_fname || "") +
                    " " +
                    (shipment.customer_lname || "")}
                </td>

                <td>
                  <span
                    style={{
                      background:
                        shipment.delivery_status === "Late delivery"
                          ? "#ef4444"
                          : "#22c55e",
                      color: "white",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                    }}
                  >
                    {shipment.delivery_status || "N/A"}
                  </span>
                </td>

                <td>{shipment.shipping_mode || "N/A"}</td>

                <td>${shipment.sales || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                Loading shipment data...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentTable;