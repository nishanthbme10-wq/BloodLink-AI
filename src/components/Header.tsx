import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Droplet, Heart, ShieldAlert, LogOut, Bell, Info } from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { user, notifications, logout } = useApp();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo and Branding */}
          <div 
            onClick={() => setCurrentTab("landing")}
            className="flex items-center gap-2.5 cursor-pointer transition hover:opacity-90"
          >
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-center">
              B+
            </div>
            <div>
              <span className="font-bold text-lg md:text-xl text-slate-900 font-sans tracking-tight">
                BloodLink<span className="text-red-600">AI</span>
              </span>
              <span className="hidden xs:block text-[10px] font-mono text-slate-400 -mt-1 tracking-wider uppercase">
                Intelligent Medical Supply
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex gap-1.5 items-center">
            <button
              onClick={() => setCurrentTab("landing")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "landing" 
                  ? "bg-red-50 text-red-600" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab("about")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "about" 
                  ? "bg-red-50 text-red-600" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setCurrentTab("donor_registration")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === "donor_registration" 
                  ? "bg-red-50 text-red-600" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Public Donation
            </button>

            {user?.role === "admin" && (
              <button
                onClick={() => setCurrentTab("admin_dashboard")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === "admin_dashboard" 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200/60"
                }`}
              >
                Admin Control
              </button>
            )}

            {user?.role === "hospital" && (
              <button
                onClick={() => setCurrentTab("hospital_dashboard")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === "hospital_dashboard" 
                    ? "bg-red-600 text-white" 
                    : "text-red-600 bg-red-50 hover:bg-red-100/50"
                }`}
              >
                Hospital Portal
              </button>
            )}

            {user?.role === "blood_bank" && (
              <button
                onClick={() => setCurrentTab("bank_dashboard")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === "bank_dashboard" 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200/60"
                }`}
              >
                Blood Bank Portal
              </button>
            )}
          </nav>

          {/* Right Area: Notifications, Login State */}
          <div className="flex items-center gap-3">
            
            {/* System Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl relative transition-colors"
                title="System Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" />
                )}
              </button>

              {/* Dropdown Alerts Panel */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-slate-200 py-2.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                      Live Emergency Broadcasts
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-red-50 text-red-650 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} Alert(s)
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-slate-400">
                        No active medical broadcast notifications.
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div 
                          key={notif.notification_id || index}
                          className="px-4 py-3 border-b border-slate-50 hover:bg-red-50/20 transition-colors last:border-0"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-red-500 mt-1 font-bold text-xs">●</span>
                            <div className="flex-1">
                              <p className="text-xs text-slate-700 leading-relaxed font-sans">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Session Profile Badge */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden lg:block text-right">
                  <span className="block text-xs font-semibold text-slate-800 truncate max-w-[120px]">{user.name}</span>
                  <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentTab("login")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  Portal Login
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
