import {
  Truck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Package,
} from "lucide-react";

function ShipmentTable({ shipmentData = [] }) {

  const getStatus = (shipment) => {
    const risk =
      shipment.late_delivery_risk ??
      shipment.lateDeliveryRisk;

    if (String(risk) === "1") {
      return {
        label: "Delayed",
        className: "bg-red-100 text-red-700",
        icon: AlertTriangle,
      };
    }

    return {
      label: "On Time",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    };
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

      {/* Header */}

      <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">

            <Truck size={22} />

          </div>

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Shipment History
            </h2>

            <p className="text-sm text-gray-500">
              Monitor recent shipment activity
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">

          <Package size={17} />

          {shipmentData.length} Shipments

        </div>

      </div>


      {/* Empty State */}

      {shipmentData.length === 0 ? (

        <div className="py-16 text-center">

          <Package
            size={48}
            className="mx-auto text-gray-300 mb-4"
          />

          <h3 className="text-lg font-semibold text-gray-600">
            No shipment data available
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            Shipment records will appear here.
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-50 text-left">

                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Shipment
                </th>

                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order
                </th>

                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>

                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Price
                </th>

                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {shipmentData.slice(0, 10).map((shipment, index) => {

                const status = getStatus(shipment);

                const StatusIcon = status.icon;

                return (

                  <tr
                    key={shipment.id ?? index}
                    className="
                      border-t
                      border-gray-100
                      hover:bg-blue-50/50
                      transition
                      duration-200
                    "
                  >

                    {/* Shipment ID */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">

                          <Truck size={18} />

                        </div>

                        <div>

                          <p className="font-semibold text-slate-700">

                            SHP-
                            {String(
                              shipment.id ?? index + 1
                            ).padStart(4, "0")}

                          </p>

                          <p className="text-xs text-gray-400">
                            Shipment ID
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* Order */}

                    <td className="px-6 py-4">

                      <span className="font-medium text-gray-700">

                        {shipment.order_id ??
                          shipment.orderId ??
                          "N/A"}

                      </span>

                    </td>


                    {/* Quantity */}

                    <td className="px-6 py-4">

                      <span className="text-gray-600">

                        {shipment.order_item_quantity ??
                          shipment.quantity ??
                          "N/A"}

                      </span>

                    </td>


                    {/* Price */}

                    <td className="px-6 py-4">

                      <span className="font-semibold text-gray-700">

                        ₹
                        {Number(
                          shipment.product_price ?? 0
                        ).toLocaleString("en-IN")}

                      </span>

                    </td>


                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-2
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          font-bold
                          ${status.className}
                        `}
                      >

                        <StatusIcon size={14} />

                        {status.label}

                      </span>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}


      {/* Footer */}

      {shipmentData.length > 10 && (

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">

          <p className="text-sm text-gray-500">

            Showing <strong>10</strong> of{" "}

            <strong>{shipmentData.length}</strong> shipments

          </p>

          <button
            className="
              px-4
              py-2
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-indigo-600
              text-white
              text-sm
              font-semibold
              hover:from-indigo-600
              hover:to-purple-600
              transition
            "
          >
            View All
          </button>

        </div>

      )}

    </div>
  );
}

export default ShipmentTable;