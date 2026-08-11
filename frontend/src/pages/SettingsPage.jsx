import { useState } from "react";
import {
  Settings,
  User,
  Database,
  Bell,
  RefreshCw,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Save,
  Sparkles,
} from "lucide-react";

function SettingsPage() {
  const [deliveryAlerts, setDeliveryAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("30 seconds");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 px-4 py-6 md:px-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
            <Settings size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              Settings
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage dashboard preferences and data configuration
            </p>
          </div>
        </div>

        {/* Top status */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            System Operational
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Database size={16} />
            Supply Chain Dataset Connected
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Profile */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Profile
                </h2>

                <p className="text-xs text-slate-500">
                  Account and project information
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-md">
                R
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Rahul Idiga
                </h3>

                <p className="text-sm text-blue-600 font-medium">
                  Dashboard & Documentation
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  SupplyPrescript Project
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Role
                </p>

                <p className="mt-2 font-semibold text-slate-700">
                  Dashboard Developer
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Project
                </p>

                <p className="mt-2 font-semibold text-slate-700">
                  SupplyPrescript
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Data Configuration */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-blue-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
                <Database size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Data Configuration
                </h2>

                <p className="text-xs text-slate-500">
                  Manage dashboard data sources
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center justify-between">
                
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Current Data Source
                  </p>

                  <p className="mt-2 font-semibold text-slate-800">
                    Supply Chain CSV Dataset
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Parsed using Papa Parse
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Database className="text-blue-600" size={23} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={21} />

                <div>
                  <p className="font-semibold text-slate-800">
                    Dataset Status
                  </p>

                  <p className="text-xs text-slate-500">
                    Data source is available
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Connected
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-600" size={19} />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Data Ready
                  </p>

                  <p className="text-xs text-slate-500">
                    Dashboard components can access the configured dataset.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Notifications */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Notifications
                </h2>

                <p className="text-xs text-slate-500">
                  Control operational alerts
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-5">
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Bell className="text-orange-600" size={18} />
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Delivery Alerts
                  </p>

                  <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    Receive alerts when shipments are delayed or require attention.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDeliveryAlerts(!deliveryAlerts)}
                className={`relative h-7 w-12 rounded-full transition ${
                  deliveryAlerts ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    deliveryAlerts ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs text-orange-700">
                <span className="font-bold">Alert status:</span>{" "}
                {deliveryAlerts
                  ? "Delivery alerts are enabled."
                  : "Delivery alerts are currently disabled."}
              </p>
            </div>
          </div>
        </section>


        {/* Dashboard Preferences */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          <div className="border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md">
                <RefreshCw size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Dashboard Preferences
                </h2>

                <p className="text-xs text-slate-500">
                  Configure dashboard refresh behavior
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            
            {/* Auto Refresh */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-5">
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-cyan-100 p-2">
                  <RefreshCw className="text-cyan-600" size={18} />
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    Auto Refresh
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Automatically refresh dashboard data.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative h-7 w-12 rounded-full transition ${
                  autoRefresh ? "bg-cyan-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    autoRefresh ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Refresh Interval */}
            <div className="mt-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock3 size={16} className="text-cyan-600" />
                Refresh Interval
              </label>

              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                disabled={!autoRefresh}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option>15 seconds</option>
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>5 minutes</option>
              </select>
            </div>

            {/* Info */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <Sparkles className="text-blue-600" size={18} />

              <p className="text-xs text-blue-700">
                Enable auto-refresh when monitoring live shipment operations.
              </p>
            </div>
          </div>
        </section>
      </div>


      {/* Save Section */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg shadow-blue-100">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="text-white">
            <h2 className="font-bold text-lg">
              Save Dashboard Configuration
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              Apply your notification and dashboard preference changes.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} />
                Settings Saved
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          SupplyPrescript • Supply Chain Analytics Dashboard
        </p>
      </div>

    </div>
  );
}

export default SettingsPage;