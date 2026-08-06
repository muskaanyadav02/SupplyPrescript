import { FaSearch } from "react-icons/fa";

function Navbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="h-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-lg flex items-center justify-between px-8">

      {/* Left */}
      <div>
        <h1 className="text-white text-3xl font-bold tracking-wide">
          SupplyPrescript
        </h1>

        <p className="text-blue-100 text-sm">
          AI Powered Supply Chain Management Dashboard
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        <div className="relative">
          <FaSearch className="absolute left-4 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search Shipments..."
            className="w-80 pl-11 pr-4 py-2 rounded-full shadow bg-white outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="text-right">
          <p className="text-white text-sm font-semibold">
            {today}
          </p>

          <p className="text-blue-200 text-xs">
            Supply Chain Intelligence Platform
          </p>
        </div>

      </div>

    </div>
  );
}

export default Navbar;