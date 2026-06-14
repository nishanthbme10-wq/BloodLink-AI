import { Droplet, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";

interface LoginPortalProps {
  onLoginSuccess: (tabToSet: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const { loginUser, isFirebaseActive } = useApp();
  
  const [activeRole, setActiveRole] = useState<"admin" | "hospital" | "blood_bank">("hospital");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoTrigger = async (role: "admin" | "hospital" | "blood_bank", id?: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginUser(role, id);
      
      // forward to correct view
      if (role === "admin") onLoginSuccess("admin_dashboard");
      else if (role === "hospital") onLoginSuccess("hospital_dashboard");
      else onLoginSuccess("bank_dashboard");
    } catch (e: any) {
      setErrorMsg("Bypass trigger failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
  
    try {
      await loginUser(email, password);
  
      if (activeRole === "admin") {
        onLoginSuccess("admin_dashboard");
      } else if (activeRole === "hospital") {
        onLoginSuccess("hospital_dashboard");
      } else {
        onLoginSuccess("bank_dashboard");
      }
    } catch (err: any) {
      setErrorMsg("Invalid credentials: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-rose-50 rounded-full blur-xl" />

        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2.5xl w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Droplet className="w-8 h-8 fill-rose-500 text-rose-500 animate-pulse" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-rose-950 font-sans tracking-tight">Portal Authentication Desk</h2>
          <p className="text-xs text-rose-450 mt-1 font-mono">Connect clinical assets to the BloodLink AI supply mesh</p>
        </div>

      

        {/* Selector tab for Standard forms */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-5 text-xs font-semibold justify-between">
          <button
            onClick={() => { setActiveRole("hospital"); setErrorMsg(null); }}
            className={`w-full py-1.5 rounded-lg transition ${activeRole === "hospital" ? "bg-white text-rose-600 shadow-sm" : "text-gray-400 hover:text-gray-800"}`}
          >
            Hospital
          </button>
          <button
            onClick={() => { setActiveRole("blood_bank"); setErrorMsg(null); }}
            className={`w-full py-1.5 rounded-lg transition ${activeRole === "blood_bank" ? "bg-white text-rose-600 shadow-sm" : "text-gray-400 hover:text-gray-800"}`}
          >
            Blood Bank
          </button>
          <button
            onClick={() => { setActiveRole("admin"); setErrorMsg(null); }}
            className={`w-full py-1.5 rounded-lg transition ${activeRole === "admin" ? "bg-white text-rose-600 shadow-sm" : "text-gray-400 hover:text-gray-800"}`}
          >
            Admin
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-750 p-3 rounded-xl text-xs mb-4 font-normal">
            Error: {errorMsg}
          </div>
        )}

        {/* Standard Credentials Input */}
        <form onSubmit={handleStandardSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-medium text-gray-600 mb-1">Standard Clinical Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-450" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activeRole === "admin" ? "admin@bloodlink.ai" : 
                  activeRole === "hospital" ? "emergency@apollo.hospital" : "metro.central@bloodlink.org"
                }
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-1">Passphrase Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-450" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 mt-2"
          >
            {loading ? "Verifying Keys..." : "Authorize Clinical Entry"}
          </button>
        </form>

      </div>
    </div>
  );
};
