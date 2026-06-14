import React from "react";
import { Info, HelpCircle, Activity, Heart, ShieldCheck, QrCode } from "lucide-react";

export const AboutPlatform: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="bg-red-50 p-3 rounded-2xl text-red-600">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">About BloodLink AI</h1>
            <p className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-0.5">Platform Philosophy & Operational Guidelines</p>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-8">
          <strong>BloodLink AI</strong> is a centralized ecosystem connecting hospitals, commercial and humanitarian blood banks, and the general public. Modern blood banking faces massive supply volatility: short shelf lives, high emergency response timelines, and wastage because of uncoordinated stock allocation. BloodLink AI solves this by introducing AI demand forecasting, low stock automation alerts, QR tag tracking, and smart distance-free donor compatibility recomendations.
        </p>

        {/* Informative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3.5 text-sm">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              Donor Eligibility Requirements
            </h3>
            <ul className="text-xs text-slate-650 space-y-2 list-disc list-inside">
              <li><strong>Minimum Age</strong>: Must be at least 18 years of age.</li>
              <li><strong>Minimum Interval</strong>: Must have at least 90 days of recovery gap between donations.</li>
              <li><strong>Geographic Match</strong>: Matched locally based on Pincode and Area filtering.</li>
              <li><strong>Availability Status</strong>: Volunteer donors can toggle their status from their profiles.</li>
            </ul>
          </div>

          <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3.5 text-sm">
              <QrCode className="w-4 h-4 text-slate-800" />
              QR-Based Blood Unit Tracking
            </h3>
            <p className="text-xs text-slate-650 leading-relaxed">
              Every blood container unit is allocated a unique security hash at collection. Scanning this displays itemized biochemical details: collection dates, exact refrigerator shelf numbers, bank identity stamps, and live countdowns until structural expiration to ensure safe transmissible transfusion.
            </p>
          </div>
        </div>

        {/* Operational Workflow Card */}
        <div className="border border-slate-200 rounded-[24px] p-6 bg-white shadow-sm mb-8">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-5 text-sm uppercase font-mono tracking-wider">
            <Activity className="w-4 h-4 text-red-600" />
            Standard Emergency Matching Protocol
          </h3>
          <div className="relative border-l border-slate-200 ml-3 pl-5 space-y-6 text-xs">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 w-3 h-3 bg-red-600 rounded-full ring-4 ring-slate-100" />
              <h4 className="font-bold text-slate-850">Hospital Initiated Demand</h4>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Emergency trauma desks register specific whole blood volumes or concentrates with urgency weight indicators.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 w-3 h-3 bg-red-600 rounded-full ring-4 ring-slate-100" />
              <h4 className="font-bold text-slate-850">AI Compatibility Analysis</h4>
              <p className="text-slate-500 mt-1 leading-relaxed">
                The platform recommendation engine scans nearby repositories, flags compatible O- or match groups, and ranks responding banks within the exact District/City grids.
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0 w-3 h-3 bg-slate-800 rounded-full ring-4 ring-slate-100" />
              <h4 className="font-bold text-slate-850">Donor Alert Broadcasts</h4>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Platform broadcasts emergency requests, notifying local volunteer donors matching the blood profile safely via the public bulletin dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="text-center bg-red-50/50 p-6 rounded-2xl border border-red-100">
          <p className="text-red-950 font-semibold text-xs leading-relaxed">
            By avoiding high-risk GPS telemetry, distance queries, or map elements, BloodLink AI complies fully with regulatory compliance standards while preserving donor confidentiality.
          </p>
        </div>

      </div>
    </div>
  );
};
