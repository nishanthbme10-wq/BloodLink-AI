import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { InventoryItem, BloodRequest } from "../types";
import QRCode from "qrcode";
import { 
  PlusSquare, 
  Activity, 
  Grid, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  QrCode, 
  HeartHandshake,
  TrendingDown, 
  Database,
  Printer
} from "lucide-react";

export const BloodBankPortal: React.FC = () => {
  const { 
    user, 
    inventory, 
    requests, 
    addInventoryItem, 
    updateInventoryStatus, 
    removeInventoryItem, 
    updateRequestStatus 
  } = useApp();

  // Control tabs in bank
  const [activeTab, setActiveTab] = useState<"on_shelf" | "add_unit" | "hospital_requests">("on_shelf");

  // QR display control
  const [selectedUnitForQR, setSelectedUnitForQR] = useState<InventoryItem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form for registering a blood parcel
  const [unitForm, setUnitForm] = useState({
    blood_group: "O+",
    quantity: 450,
    collection_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Standard 42 days storage
    storage_location: "Refrigerator A, Shelf 1"
  });

  const [formSuccess, setFormSuccess] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Re-draw QR on unit selection
  useEffect(() => {
    if (canvasRef.current && selectedUnitForQR) {
      const qrPayload = JSON.stringify({
        unit_id: selectedUnitForQR.inventory_id,
        blood_group: selectedUnitForQR.blood_group,
        collection_date: selectedUnitForQR.collection_date,
        expiry_date: selectedUnitForQR.expiry_date,
        bank_id: selectedUnitForQR.bank_id,
        bank_name: selectedUnitForQR.bank_name
      });

      QRCode.toCanvas(canvasRef.current, qrPayload, {
        width: 160,
        margin: 1.5,
        color: {
          dark: "#1e1b4b", // Deep indigo-950
          light: "#fff1f2" // Rose-50 ambient light tint
        }
      }, (err) => {
        if (err) console.error("QR Code Drawer encountered error: ", err);
      });
    }
  }, [selectedUnitForQR]);

  // Handle inventory addition
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);

    try {
      await addInventoryItem({
        blood_group: unitForm.blood_group,
        quantity: unitForm.quantity,
        bank_id: user?.id || "bb_alpha",
        bank_name: user?.name || "Metro Central Blood Authority",
        collection_date: unitForm.collection_date,
        expiry_date: unitForm.expiry_date,
        storage_location: unitForm.storage_location,
        status: "available"
      });

      setFormSuccess(true);
      setUnitForm({
        blood_group: "O+",
        quantity: 450,
        collection_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        storage_location: "Refrigerator A, Shelf 1"
      });
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter inventory units owned by this specific blood bank
  const myInventory = inventory.filter(i => i.bank_id === user?.id || i.bank_name.toLowerCase().includes((user?.name || "").toLowerCase()));

  // Filter incoming pending requests belonging to this geographic state/city
  const regionalRequests = requests.filter(r => r.status === "Pending" || r.status === "Processing" || r.bank_id === user?.id);

  // Compute stats
  const countAvailable = myInventory.filter(i => i.status === "available").length;
  const countExpired = myInventory.filter(i => {
    const today = new Date().toISOString().split('T')[0];
    return i.expiry_date < today && i.status === "available";
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Platform title */}
      <div className="border-b border-gray-150 pb-5 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-gray-900">Blood Bank Inventory Hub</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">{user?.name || "Metro Central Blood Authority"}</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => {
              setActiveTab("on_shelf");
              setSelectedUnitForQR(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "on_shelf" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            On-Shelf Stocks ({countAvailable})
          </button>
          <button
            onClick={() => setActiveTab("add_unit")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "add_unit" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Register Blood Bag
          </button>
          <button
            onClick={() => setActiveTab("hospital_requests")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "hospital_requests" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Hospital Transfer Pools ({regionalRequests.length})
          </button>
        </div>
      </div>

      {/* Grid of workspace controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Major list layouts */}
        <div className="col-span-1 lg:col-span-3">
          
          {/* View A: Available stocks / bags */}
          {activeTab === "on_shelf" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-sm uppercase font-mono tracking-wider">
                  Active Stocks Manifest
                </h3>
                {countExpired > 0 && (
                  <span className="bg-amber-50 border border-amber-100 text-amber-800 text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-650" />
                    {countExpired} Expired Bags Flagged
                  </span>
                )}
              </div>

              {myInventory.length === 0 ? (
                <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  <Database className="w-12 h-12 text-gray-250 mx-auto mb-3" />
                  <p className="text-xs">No blood packages registered on your platform.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Tap "Register Blood Bag" option to record a new collection.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-mono text-[10px]">
                        <th className="p-3">Unit ID</th>
                        <th className="p-3 text-center">Group</th>
                        <th className="p-3">Collected Date</th>
                        <th className="p-3 font-medium">Expiry Deadline</th>
                        <th className="p-3">Storage Row</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {myInventory.map((item) => {
                        const today = new Date().toISOString().split('T')[0];
                        const isExp = item.expiry_date < today && item.status === "available";

                        return (
                          <tr 
                            key={item.inventory_id}
                            className={`hover:bg-rose-50/10 cursor-pointer transition ${
                              selectedUnitForQR?.inventory_id === item.inventory_id ? "bg-rose-50/30" : ""
                            }`}
                            onClick={() => setSelectedUnitForQR(item)}
                          >
                            <td className="p-3 font-mono font-medium text-gray-800">{item.inventory_id}</td>
                            <td className="p-3 text-center">
                              <span className="bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded">
                                {item.blood_group}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">{item.collection_date}</td>
                            <td className={`p-3 font-bold ${isExp ? "text-red-650" : "text-gray-700"}`}>
                              {item.expiry_date}
                              {isExp && <span className="block text-[9px] text-red-500 font-mono uppercase tracking-wider">Expired</span>}
                            </td>
                            <td className="p-3 text-gray-505 font-mono">{item.storage_location}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[9px] font-bold ${
                                item.status === "available" ? "bg-emerald-50 text-emerald-700" :
                                item.status === "transfered" ? "bg-blue-50 text-blue-700" :
                                "bg-gray-150 text-gray-600"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {item.status === "available" && (
                                  <button
                                    onClick={() => updateInventoryStatus(item.inventory_id, "wasted")}
                                    className="p-1 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-gray-150 rounded"
                                    title="Quarantine & Trash Container"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* View B: Form for registering blood unit */}
          {activeTab === "add_unit" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase font-mono tracking-wider">
                Register Collected Blood Container Bag
              </h3>

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-850 p-4 rounded-xl text-xs mb-6 font-medium">
                  Success: New whole blood bag successfully registered. Barcodes configured.
                </div>
              )}

              <form onSubmit={handleAddInventory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
                    <select
                      value={unitForm.blood_group}
                      onChange={(e) => {
                        const gr = e.target.value;
                        setUnitForm(prev => ({ ...prev, blood_group: gr }));
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-rose-600 outline-none"
                    >
                      {bloodGroups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Volume (ML)</label>
                    <input
                      type="number"
                      required
                      value={unitForm.quantity}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 450 }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                      placeholder="e.g. 450"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Storage Location Label</label>
                    <input
                      type="text"
                      required
                      value={unitForm.storage_location}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, storage_location: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Collection Date</label>
                    <input
                      type="date"
                      required
                      value={unitForm.collection_date}
                      onChange={(e) => {
                        const colDate = e.target.value;
                        // auto offset expiry by 42 days
                        const d = new Date(colDate);
                        d.setDate(d.getDate() + 42);
                        setUnitForm(prev => ({ 
                          ...prev, 
                          collection_date: colDate,
                          expiry_date: d.toISOString().split("T")[0] 
                        }));
                      }}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date Guidelines (Auto-calculated 42 Days)</label>
                    <input
                      type="date"
                      required
                      value={unitForm.expiry_date}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Confirm Registration & Create QR Barcode
                </button>
              </form>
            </div>
          )}

          {/* View C: Hospital Transfer requests */}
          {activeTab === "hospital_requests" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase font-mono tracking-wider">
                Emergency Hospital Requests Pools
              </h3>

              {regionalRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <HeartHandshake className="w-12 h-12 text-gray-250 mx-auto mb-3" />
                  <p className="text-xs">No pending emergency transfers requested in your region.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {regionalRequests.map((req) => (
                    <div 
                      key={req.request_id}
                      className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 rounded font-mono uppercase">
                            {req.blood_group}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                            req.status === "Pending" ? "bg-amber-100 text-amber-800" :
                            req.status === "Processing" ? "bg-purple-100 text-purple-800" :
                            "bg-emerald-100 text-emerald-800"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900">{req.hospital_name}</h4>
                        <div className="text-[10px] text-gray-505 space-y-0.5 mt-1">
                          <p>Required Quantity: {req.units_required} Bag units</p>
                          <p>Location: {req.city}, {req.district}</p>
                          <p>Contact Desk: {req.contact}</p>
                        </div>
                      </div>

                      {/* Matching Action */}
                      <div className="flex gap-2">
                        {req.status === "Pending" && (
                          <button
                            onClick={() => updateRequestStatus(req.request_id, "Processing", user?.id, user?.name)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                          >
                            Accept Request
                          </button>
                        )}
                        {req.status === "Processing" && req.bank_id === user?.id && (
                          <button
                            onClick={() => updateRequestStatus(req.request_id, "Completed", user?.id, user?.name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: QR Code Generator Card */}
        <div className="col-span-1">
          <div className="bg-indigo-950 text-indigo-50 border border-indigo-900 rounded-3xl p-6 shadow-xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
            <div className="absolute right-0 top-0 opacity-10">
              <QrCode className="w-64 h-64 text-indigo-505" />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center">
              <span className="bg-indigo-850/60 text-rose-400 text-[10px] font-mono tracking-wider font-bold mb-3 px-3 py-1 rounded-full uppercase">
                Unique Tracking QR
              </span>

              {selectedUnitForQR ? (
                <div className="flex flex-col items-center">
                  {/* Canvas Container */}
                  <div className="bg-rose-50 p-2.5 rounded-2xl shadow-inner border-2 border-indigo-900/50 mb-4 flex items-center justify-center">
                    <canvas ref={canvasRef} className="rounded-xl w-40 h-40" />
                  </div>

                  <h4 className="font-bold text-sm text-white mb-1">
                    Bag ID: <span className="font-mono">{selectedUnitForQR.inventory_id}</span>
                  </h4>
                  <p className="text-[11px] text-gray-300 font-medium">
                    Blood Group Match: <span className="text-rose-400 font-bold font-sans text-xs">{selectedUnitForQR.blood_group}</span>
                  </p>
                  
                  <div className="mt-4 text-[10px] text-gray-400 font-mono space-y-1 text-center border-t border-white/5 pt-3 w-full">
                    <p>Expiry: {selectedUnitForQR.expiry_date}</p>
                    <p>Cell: {selectedUnitForQR.storage_location}</p>
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="mt-6 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Sticker Tag
                  </button>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
                  <QrCode className="w-16 h-16 text-indigo-800 mb-4 animate-pulse" />
                  <p className="max-w-[170px] leading-relaxed">
                    Select any blood bag line from the <strong>"Active Stocks Manifest"</strong> to configure and render its tracking barcode sticker.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[9px] text-indigo-400/80 font-mono leading-normal mt-4 text-center">
              ISO/IEC 18004 Standard QR Compliant. Intended for local refrigerator tag scanners.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
