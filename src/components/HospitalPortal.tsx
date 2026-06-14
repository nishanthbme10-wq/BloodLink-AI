import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BloodRequest, RecommendedDonor } from "../types";
import { SEED_BLOOD_BANKS } from "../utils/mockData";
import { 
  PlusSquare, 
  Search, 
  Activity, 
  Heart, 
  Sparkles, 
  Droplet, 
  MapPin, 
  AlertCircle, 
  Phone,
  FileText,
  UserCheck
} from "lucide-react";

export const HospitalPortal: React.FC = () => {
  const { 
    user, 
    inventory, 
    requests, 
    createBloodRequest, 
    fetchSmartDonorRecommendations,
    loadingAI 
  } = useApp();

  // Navigation within Hospital view
  const [activeTab, setActiveTab] = useState<"raise_request" | "search_stock" | "track_requests">("track_requests");

  // Recommendation engine state
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedDonor[]>([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // Search filter states
  const [searchGroup, setSearchGroup] = useState("O+");
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchPincode, setSearchPincode] = useState("");

  // New request form state
  const [reqForm, setReqForm] = useState({
    blood_group: "O+",
    units_required: 1,
    urgency: "Pending" as "Pending" | "Accepted" | "Processing" | "Completed",
    state: user?.state || "Tamil Nadu",
    district: user?.district || "Chennai",
    city: user?.city || "Chennai",
    contact: user?.contact || "+91 44 2829 0200"
  });

  const [formSuccess, setFormSuccess] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Handle Request Submission
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(false);

    try {
      await createBloodRequest({
        hospital_id: user?.id || "demo_hospital",
        hospital_name: user?.name || "Apollo Specialty Hospital",
        blood_group: reqForm.blood_group,
        units_required: reqForm.units_required,
        urgency: "Pending", // matches request schema status
        state: reqForm.state,
        district: reqForm.district,
        city: reqForm.city,
        contact: reqForm.contact
      });

      setFormSuccess(true);
      setActiveTab("track_requests");
    } catch (e) {
      console.error(e);
    }
  };

  // Run Match recommendations
  const handleFetchRecommendations = async (req: BloodRequest) => {
    setSelectedRequest(req);
    setLoadingRecommend(true);
    setRecommendations([]);

    try {
      const results = await fetchSmartDonorRecommendations(req.request_id);
      setRecommendations(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecommend(false);
    }
  };

  // Filter stock inventories based on district, city, pincode, blood group
  const filteredStock = inventory.filter(item => {
    if (item.status !== "available") return false;
    if (item.blood_group !== searchGroup) return false;
    
    // Find matching blood bank details from seed lists to match location
    const matchedBank = SEED_BLOOD_BANKS.find(bb => bb.id === item.bank_id);
    if (matchedBank) {
      if (searchDistrict && !matchedBank.district.toLowerCase().includes(searchDistrict.toLowerCase())) return false;
      if (searchCity && !matchedBank.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
      if (searchPincode && !matchedBank.pincode.includes(searchPincode)) return false;
    }
    return true;
  });

  // Filter only current hospital requests
  const myRequests = requests.filter(r => r.hospital_id === user?.id || r.hospital_name.toLowerCase().includes((user?.name || "").toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="border-b border-gray-100 pb-5 mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-gray-900">Hospital Emergency Operations</h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">{user?.name || "Apollo Specialty Hospital"}</p>
        </div>

        {/* Tab switches */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("track_requests")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "track_requests" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Track Active Demands
          </button>
          <button
            onClick={() => setActiveTab("search_stock")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "search_stock" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Search Blood Supply
          </button>
          <button
            onClick={() => setActiveTab("raise_request")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === "raise_request" ? "bg-white text-rose-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Raise Emergency Demand
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dynamic Workflow Workspace */}
        <div className="col-span-1 lg:col-span-2">
          
          {/* View A: Track Requests */}
          {activeTab === "track_requests" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase font-mono tracking-wider">
                My Hospital Demands
              </h3>

              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Activity className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-xs">No active or historic blood requests raised.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((req) => (
                    <div 
                      key={req.request_id}
                      className="border border-gray-100 rounded-xl p-4 hover:border-rose-200 transition bg-rose-50/5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center font-bold text-rose-600 text-sm">
                            {req.blood_group}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-gray-900">
                              {req.units_required} Units Requested
                            </h4>
                            <p className="text-[10px] text-gray-400 font-mono">
                              ID: {req.request_id} • {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Status Label */}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "Pending" ? "bg-amber-100 text-amber-800" :
                          req.status === "Accepted" ? "bg-blue-100 text-blue-800" :
                          req.status === "Processing" ? "bg-purple-100 text-purple-800" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <p>Region: <span className="font-medium text-gray-800">{req.city}, {req.district}</span></p>
                        <p>Fulfillment Bank: <span className="font-medium text-gray-800">{req.bank_name || "Awaiting Response"}</span></p>
                      </div>

                      {/* AI Matching Button */}
                      {req.status !== "Completed" && (
                        <button
                          onClick={() => handleFetchRecommendations(req)}
                          className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-4 py-2 rounded-lg text-xs transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Launch Smart Donor Matching
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View B: Search Stock */}
          {activeTab === "search_stock" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase font-mono tracking-wider">
                Browse Live Bank Inventory Stocks
              </h3>

              {/* Geographic Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-150 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Blood Group</label>
                  <select
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                    className="w-full border border-gray-200 bg-white px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 outline-none"
                  >
                    {bloodGroups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">District</label>
                  <input
                    type="text"
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full border border-gray-200 bg-white px-2.5 py-1.5 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full border border-gray-200 bg-white px-2.5 py-1.5 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pincode</label>
                  <input
                    type="text"
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value)}
                    placeholder="e.g. 600020"
                    className="w-full border border-gray-200 bg-white px-2.5 py-1.5 rounded-lg text-xs outline-none"
                  />
                </div>
              </div>

              {/* Search results */}
              {filteredStock.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                  <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No matching on-shelf units found for blood group "{searchGroup}".</p>
                  <p className="text-[10px] text-gray-400 mt-1">Try clearing or broadening the City/District geographic selectors.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStock.map((item) => {
                    const bankInfo = SEED_BLOOD_BANKS.find(bb => bb.id === item.bank_id) || {
                      name: item.bank_name,
                      city: "Regional",
                      district: "Local",
                      contact: "Unavailable"
                    };

                    return (
                      <div 
                        key={item.inventory_id}
                        className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute right-0 top-0 bg-rose-600 text-white text-[10px] font-mono px-3 py-1 rounded-bl-xl font-bold uppercase">
                          {item.blood_group}
                        </div>

                        <h4 className="font-bold text-xs text-gray-800 pr-12 line-clamp-1">{bankInfo.name}</h4>
                        <div className="text-xs text-gray-500 space-y-1.5 mt-3">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{bankInfo.city}, {bankInfo.district}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{bankInfo.contact}</span>
                          </p>
                          <p>Available Weight: <strong className="text-rose-600">{item.quantity} ML</strong></p>
                          <p className="text-[10px] font-mono text-gray-400 mt-2">Expiry Timestamp: {item.expiry_date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* View C: Raise Request form */}
          {activeTab === "raise_request" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase font-mono tracking-wider">
                Create Emergency Blood Request
              </h3>

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group Required</label>
                    <select
                      name="blood_group"
                      value={reqForm.blood_group}
                      onChange={(e) => setReqForm(prev => ({ ...prev, blood_group: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-rose-600 outline-none"
                    >
                      {bloodGroups.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Required Volume (Units / Bags)</label>
                    <input
                      type="number"
                      name="units_required"
                      required
                      min={1}
                      max={15}
                      value={reqForm.units_required}
                      onChange={(e) => setReqForm(prev => ({ ...prev, units_required: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={reqForm.state}
                      onChange={(e) => setReqForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={reqForm.district}
                      onChange={(e) => setReqForm(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={reqForm.city}
                      onChange={(e) => setReqForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={reqForm.contact}
                      onChange={(e) => setReqForm(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Broadcast Emergency Demand
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Side: AI Matchmaker Space & Smart recommendations */}
        <div className="col-span-1">
          <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl border border-gray-800 relative overflow-hidden min-h-[450px] flex flex-col justify-between">
            <div className="absolute right-0 top-0 opacity-10">
              <Sparkles className="w-64 h-64 text-rose-500 animate-spin" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-sm tracking-tight font-sans">
                  Gemini Smart Matchmaker
                </h3>
              </div>

              {selectedRequest ? (
                <div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-5 text-xs text-gray-300">
                    <span className="block font-bold text-white text-xs mb-1">Active Target Request</span>
                    <p>Group: <strong className="text-rose-400">{selectedRequest.blood_group}</strong> ({selectedRequest.units_required} bags)</p>
                    <p>Fulfillment Destination: {selectedRequest.hospital_name} ({selectedRequest.city})</p>
                  </div>

                  {loadingRecommend ? (
                    <div className="text-center py-12 text-xs text-gray-400 space-y-3">
                      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="animate-pulse">Analyzing donor clinical eligibility intervals and local area matching score grids...</p>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <p className="text-xs text-gray-400 leading-relaxed py-6 text-center">
                      No matching registered donors found. Try adding seed donors or matching compatibility records.
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {recommendations.slice(0, 3).map((donor, idx) => (
                        <div 
                          key={donor.donor_id || idx}
                          className="bg-white/5 border border-white/10 p-3 rounded-xl hover:border-rose-450 transition text-xs"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <h4 className="font-bold text-white flex items-center gap-1">
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                              {donor.name}
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              Suited Rank #{donor.suitability_rank}
                            </span>
                          </div>

                          <p className="text-[10px] text-purple-300 bg-purple-950/40 w-fit px-2 py-0.5 rounded font-semibold mb-2">
                            {donor.compatibility_status}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-[10px] mb-2 font-mono text-gray-300">
                            <div>Reliability: <span className="text-yellow-400 font-bold">{donor.reliability_score}%</span></div>
                            <div>Availability: <span className="text-emerald-400 font-bold">{donor.availability_score}%</span></div>
                          </div>

                          <p className="text-[10px] text-gray-400 leading-normal border-t border-white/5 pt-2 mt-1">
                            {donor.commentary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
                  <Activity className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="max-w-[200px] leading-relaxed">
                    Select any active request from your list and tap <strong>"Launch Smart Donor Matching"</strong> to run our machine learning recommendations.
                  </p>
                </div>
              )}
            </div>

            {/* Platform disclaimer */}
            <p className="text-[9px] text-gray-500 font-mono mt-4 leading-normal">
              Note: Donor matchmaking executes a multi-factor analysis checking age bounds, state/city, last response logs, and volunteer declarations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
