import { useState } from "react";
import api from "../api/api";

function ShipmentTable({ shipmentData = [] }) {
  const [prediction, setPrediction] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const handlePredict = async (shipmentId) => {
    try {
      setLoadingId(shipmentId);

      const response = await api.get(`/predict/${shipmentId}`);

      setPrediction(response.data);
    } catch (error) {
      console.error(error);
      alert("Prediction Failed");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-yellow-500";

      case "delivered":
        return "bg-green-600";

      case "shipped":
        return "bg-blue-600";

      case "cancelled":
        return "bg-red-600";

      default:
        return "bg-gray-500";
    }
  };

  const getRisk = (probability) => {
    if (probability >= 0.7)
      return {
        text: "High Risk",
        color: "bg-red-600",
      };

    if (probability >= 0.4)
      return {
        text: "Medium Risk",
        color: "bg-yellow-500",
      };

    return {
      text: "Low Risk",
      color: "bg-green-600",
    };
  };

  return (
    <div className="mt-8">

      <div className="flex justify-between items-center mb-5">

        <div>
          <h2 className="text-2xl font-bold">
            Shipment History
          </h2>

          <p className="text-gray-500">
            Live Shipment Data
          </p>
        </div>

        <div className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold">
          {shipmentData.length} Shipments
        </div>

      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">

        <table className="min-w-full">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">AI Prediction</th>

            </tr>

          </thead>

          <tbody>

            {shipmentData.length > 0 ? (

              shipmentData.map((shipment, index) => (

                <tr
                  key={shipment.id}
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-blue-50"
                      : "bg-gray-50 hover:bg-blue-50"
                  }
                >

                  <td className="px-4 py-3 font-semibold">
                    {shipment.order_id}
                  </td>

                  <td className="px-4 py-3">
                    {shipment.category_name}
                  </td>

                  <td className="px-4 py-3">
                    {shipment.order_region}
                  </td>

                  <td className="px-4 py-3">
                    {shipment.order_item_quantity}
                  </td>

                  <td className="px-4 py-3">
                    ${shipment.product_price}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`${getStatusColor(
                        shipment.status
                      )} text-white px-3 py-1 rounded-full text-xs`}
                    >
                      {shipment.status}
                    </span>

                  </td>

                  <td className="px-4 py-3">

                    <button
                      onClick={() => handlePredict(shipment.id)}
                      disabled={loadingId === shipment.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      {loadingId === shipment.id
                        ? "Predicting..."
                        : "Predict"}
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="7"
                  className="text-center py-10 text-red-600 font-semibold"
                >
                  No shipment data received from backend
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {prediction && (

        <div className="mt-8 bg-blue-50 rounded-xl shadow p-6">

          <h2 className="text-xl font-bold text-blue-700 mb-5">
            AI Prediction Result
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

            <div>
              <p className="text-gray-500">Shipment ID</p>
              <h3 className="font-bold">
                {prediction.shipment_id}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Prediction ID</p>
              <h3 className="font-bold">
                {prediction.prediction_id}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Probability</p>
              <h3 className="text-red-600 font-bold">
                {(prediction.probability * 100).toFixed(2)}%
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Delay</p>
              <h3 className="text-orange-600 font-bold">
                {prediction.predicted_delay_days} Days
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Model</p>
              <h3>{prediction.model_version}</h3>
            </div>

            <div>
              <p className="text-gray-500">Risk</p>

              <span
                className={`${getRisk(prediction.probability).color} text-white px-4 py-2 rounded-full`}
              >
                {getRisk(prediction.probability).text}
              </span>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ShipmentTable;