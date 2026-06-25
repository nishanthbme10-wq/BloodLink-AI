import {
  Activity,
  Building2,
  Database,
  RefreshCw,
  ShieldAlert,
  Users
} from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export const AdminPortal: React.FC = () => {
  const { 
    donors, 
    inventory, 
    requests, 
    notifications, 
    demandForecast, 
    shortageRisks, 
    expiryReport, 
    loadingAI, 
    aiErrorMessage,
    triggerAiDemandPrediction, 
    triggerAiShortagePrediction, 
    triggerAiExpiryPrediction,
    resetDatabaseToSeed,
    isFirebaseActive
  } = useApp();

  const [adminTab, setAdminTab] = useState<"database" | "ai_console" | "alert_logs">("ai_console");
  const [dbSubFilter, setDbSubFilter] = useState<"donors" | "inventory" | "requests">("donors");
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Compute stats metrics
  const totalVol = inventory.filter(i => i.status === "available").reduce((sum, current) => sum + current.quantity, 0);
  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const eligibleCount = donors.filter(d => d.eligibility_status === "Eligible").length;

  const handleRunSeeding = async () => {
    setSeedSuccess(false);
    try {
      await resetDatabaseToSeed();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Registered Volunteers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{donors.length} Donors</h3>
              <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">{eligibleCount} currently eligible</span>
            </div>
            <div className="bg-rose-50 text-rose-600 p-2 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Active Inventory</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{inventory.filter(i => i.status === "available").length} Bags</h3>
              <span className="text-[10px] text-indigo-600 font-medium block mt-0.5">{totalVol} ML aggregate</span>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Cumulative Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{requests.length} Demands</h3>
              <span className="text-[10px] text-amber-600 font-medium block mt-0.5">{pendingCount} pending fulfillment</span>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4 - Seeding / Demo Config */}
        <div className="bg-gradient-to-br from-indigo-900 to-rose-950 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-white/25 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase uppercase tracking-wider">
                System Utilities
              </span>
              <p className="text-[11px] text-gray-200 mt-1.5 leading-tight">Database seeding & quick reference setup</p>
            </div>
            <Building2 className="w-4 h-4 text-rose-450" />
          </div>
          <div>
            <button
              onClick={handleRunSeeding}
              className="mt-3 w-full bg-white text-indigo-950 font-bold text-[10px] py-1.5 rounded-lg transition hover:bg-rose-50"
            >
              Seed Sample Dataset
            </button>
            {seedSuccess && (
              <span className="text-[9px] text-emerald-400 font-mono mt-1 block text-center">
                Seeding successful!
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Main workspace navigation tabs */}
      <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center flex-col sm:flex-row gap-4">
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setAdminTab("ai_console")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              adminTab === "ai_console" ? "bg-rose-600 text-white font-bold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            AI Predictive Control Room
          </button>
          <button
            onClick={() => setAdminTab("database")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              adminTab === "database" ? "bg-rose-600 text-white font-bold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Live Directories Registry
          </button>
          <button
            onClick={() => setAdminTab("alert_logs")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              adminTab === "alert_logs" ? "bg-rose-600 text-white font-bold" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            System Broadcasts Logs
          </button>
        </div>

        {/* Database indicator */}
        <span className="text-[10px] font-mono text-gray-400">
          Source: {isFirebaseActive ? "Google Firebase Cloud Firestore" : "Local RAM Sandboxed Repository"}
        </span>
      </div>

      {/* Workspace Display */}
      <div>
      {/* TAB 1: AI PREDICTIVE CONSOLE */}
{adminTab === "ai_console" && (
  <>
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
      <h3 className="text-lg font-bold text-green-700">
        🤖 BloodLink Sentinel WhatsApp Bot
      </h3>

      <p className="text-sm text-gray-600 mt-2">
        Emergency blood requests are automatically broadcasted
        to registered blood banks through WhatsApp groups.
      </p>

      <div className="mt-4 space-y-2">
        <div>✅ Registered Blood Banks: 12</div>
        <div>✅ Active WhatsApp Groups: 3</div>
        <div>✅ Alerts Sent Today: 24</div>
      </div>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* COLUMN 1: Demand Prediction Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900 text-xs font-mono uppercase tracking-wider">
                    Demand Forecast (Monthly)
                  </h4>
                  <button
                    onClick={triggerAiDemandPrediction}
                    disabled={loadingAI}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Run Gemini Demand Projections"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-6">
                  Fuses hospital records and real-time requests to project volume constraints.
                </p>

                {demandForecast.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No predictions run. Tap the refresh icon above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {demandForecast.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-rose-50 text-rose-700 font-bold rounded flex items-center justify-center">
                            {item.blood_group}
                          </span>
                          <span className="font-medium text-gray-700">Projected Demand</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block">{item.units} Units</span>
                          <span className={`text-[9px] font-bold ${
                            item.trend === "Upward" ? "text-red-500" :
                            item.trend === "Steady" ? "text-blue-500" : "text-emerald-500"
                          }`}>
                            {item.trend === "Upward" ? "▲ Upward Trend" :
                             item.trend === "Steady" ? "● Steady" : "▼ Downward"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub descriptor */}
              <p className="text-[9px] text-gray-400 font-mono mt-6 leading-relaxed border-t border-gray-100 pt-3">
                Projections are processed server-side through Gemini LLM parsing statistical distribution matrices.
              </p>
            </div>

            {/* COLUMN 2: Regional Shortage risk prediction */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900 text-xs font-mono uppercase tracking-wider">
                    Regional Shortage Projections
                  </h4>
                  <button
                    onClick={triggerAiShortagePrediction}
                    disabled={loadingAI}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Calculate Regional Shortage Risks"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-505 leading-relaxed mb-6">
                  Evaluates demand volumes versus ready inventory levels to assess local shortages.
                </p>

                {shortageRisks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No shortage analytics performed. Tap refresh.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shortageRisks.slice(0, 5).map((risk, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">
                            Blood Group {risk.blood_group}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                            risk.risk_level === "High" ? "bg-red-50 text-red-700" :
                            risk.risk_level === "Medium" ? "bg-amber-50 text-amber-700" :
                            "bg-emerald-50 text-emerald-700"
                          }`}>
                            {risk.risk_level} Risk
                          </span>
                        </div>
                        {/* Progress Bar representing probability */}
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              risk.risk_level === "High" ? "bg-red-500" :
                              risk.risk_level === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                            }`} 
                            style={{ width: `${risk.probability * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal mt-1 line-clamp-1">{risk.reasoning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-gray-400 font-mono mt-6 leading-relaxed border-t border-gray-100 pt-3">
                Probability thresholds calculated dynamically using cumulative multi-district pending demand scores.
              </p>
            </div>

            {/* COLUMN 3: Safety Expiry Report */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900 text-xs font-mono uppercase tracking-wider">
                    Safety Shelf Expiry Audit
                  </h4>
                  <button
                    onClick={triggerAiExpiryPrediction}
                    disabled={loadingAI}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                    title="Calculate Near Expiry assets"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-505 leading-relaxed mb-6">
                  Reviews container bag collection dates and flags blocks approaching red expiration deadlines.
                </p>

                {!expiryReport ? (
                  <div className="text-center py-12 text-gray-400 text-xs text-center">
                    Audit report not initialized. Run prediction tool.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="block text-rose-950 font-bold">Wastage Probability</span>
                        <span className="block text-[10px] text-rose-700">Expired bags needing disposal</span>
                      </div>
                      <span className="text-2xl font-bold text-rose-700 font-mono">
                        {expiryReport.expectedWastageUnits} Unit(s)
                      </span>
                    </div>

                    {/* Near expiry items table */}
                    <div>
                      <span className="block text-[10px] font-bold text-gray-405 uppercase tracking-wider mb-2 font-mono">
                        Near Expiry Warning Records
                      </span>
                      {expiryReport.nearExpiryList.length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-4">No packages expiring within 7 days!</p>
                      ) : (
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {expiryReport.nearExpiryList.map((unit, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 p-2 rounded-lg text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800">Unit ID: {unit.inventory_id}</span>
                                <span className="font-bold text-rose-600 uppercase bg-rose-50 rounded px-1.5">{unit.blood_group}</span>
                              </div>
                              <p className="text-[9px] text-gray-500 mt-1">Status: {unit.days_remaining <= 0 ? "Expired" : `${unit.days_remaining} days remaining`}</p>
                              <p className="text-[9px] text-indigo-600 italic font-mono mt-0.5">Rec: {unit.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[9px] text-gray-400 font-mono mt-6 leading-relaxed border-t border-gray-100 pt-3">
                System tracks clinical blood lifetimes (42 days limit) and alerts hospital operations before discarding packets.
              </p>
            </div>

          </div>
          </>
        )}

        {/* TAB 2: DATABASE DIRECTORIES REGISTRY */}
        {adminTab === "database" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Sub Filter */}
            <div className="flex gap-2 mb-6 border-b pb-4">
              <button
                onClick={() => setDbSubFilter("donors")}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  dbSubFilter === "donors" ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Volunteer Donors Directory ({donors.length})
              </button>
              <button
                onClick={() => setDbSubFilter("inventory")}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  dbSubFilter === "inventory" ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Comprehensive Stocks Ledger ({inventory.length})
              </button>
              <button
                onClick={() => setDbSubFilter("requests")}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  dbSubFilter === "requests" ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                Medical Demands Queue ({requests.length})
              </button>
            </div>

            {/* subview renderer */}
            {dbSubFilter === "donors" && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 uppercase font-mono text-[9px] tracking-wider">
                      <th className="p-3">Donor Name</th>
                      <th className="p-3">Age/Gender</th>
                      <th className="p-3 text-center">Group</th>
                      <th className="p-3">Locations Pin</th>
                      <th className="p-3">Contact Email</th>
                      <th className="p-3">Last Donation Date</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {donors.map((d, index) => (
                      <tr key={d.donor_id || index} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-900">{d.name}</td>
                        <td className="p-3">{d.age} Yrs / {d.gender}</td>
                        <td className="p-3 text-center">
                          <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">
                            {d.blood_group}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{d.city} (Pin {d.pincode})</td>
                        <td className="p-3">{d.email}</td>
                        <td className="p-3 text-gray-500">{d.last_donation_date || "Never Regularized"}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            d.eligibility_status === "Eligible" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}>
                            {d.eligibility_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {dbSubFilter === "inventory" && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-505 uppercase font-mono text-[9px] tracking-wider">
                      <th className="p-3">Registered Bag ID</th>
                      <th className="p-3 text-center">Group</th>
                      <th className="p-3">Volume Weight</th>
                      <th className="p-3">Repository Hub Name</th>
                      <th className="p-3">Dates (Coll / Exp)</th>
                      <th className="p-3">Storage Row</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {inventory.map((item, index) => (
                      <tr key={item.inventory_id || index} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono font-medium text-gray-800">{item.inventory_id}</td>
                        <td className="p-3 text-center">
                          <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">
                            {item.blood_group}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-rose-600">{item.quantity} ML</td>
                        <td className="p-3 font-medium text-gray-900">{item.bank_name}</td>
                        <td className="p-3">Col: {item.collection_date} <br /> Exp: {item.expiry_date}</td>
                        <td className="p-3 font-mono text-gray-500">{item.storage_location}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.status === "available" ? "bg-emerald-50 text-emerald-750" : "bg-gray-150 text-gray-650"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {dbSubFilter === "requests" && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-550 uppercase font-mono text-[9px] tracking-wider">
                      <th className="p-3">Request Code</th>
                      <th className="p-3">Hospital Target</th>
                      <th className="p-3 text-center">Group Needed</th>
                      <th className="p-3">Units count</th>
                      <th className="p-3">Geographic Region</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Handling Hub</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {requests.map((r, index) => (
                      <tr key={r.request_id || index} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono font-medium text-gray-800">{r.request_id}</td>
                        <td className="p-3 font-medium text-gray-900">{r.hospital_name}</td>
                        <td className="p-3 text-center">
                          <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">
                            {r.blood_group}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-900">{r.units_required} Units</td>
                        <td className="p-3 font-mono">{r.city}, {r.district}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            r.status === "Pending" ? "bg-amber-50 text-amber-700" :
                            r.status === "Processing" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-medium">{r.bank_name || "Awaiting Intake"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: SYSTEM NOTIFICATIONS LOGS */}
        {adminTab === "alert_logs" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-3xl">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase font-mono tracking-wider">
              Emergency Broadcast Alert Stream
            </h3>
            
            <div className="space-y-4">
              {notifications.map((n, idx) => (
                <div 
                  key={n.notification_id || idx}
                  className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-rose-100 transition bg-rose-50/5"
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    n.type === "emergency" ? "bg-red-50 text-red-650" : "bg-indigo-05 text-indigo-650"
                  }`}>
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 flex items-center gap-2">
                      <span className="uppercase font-mono text-[9px] text-rose-500">{n.type} broadcast</span>
                      <span className="text-[9px] text-gray-400 font-normal">{new Date(n.timestamp).toLocaleTimeString()} {new Date(n.timestamp).toLocaleDateString()}</span>
                    </h5>
                    <p className="text-xs text-gray-550 mt-1 leading-relaxed leading-normal">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
