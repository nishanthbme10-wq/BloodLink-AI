import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { AboutPlatform } from "./components/AboutPlatform";
import { DonorRegistration } from "./components/DonorRegistration";
import { HospitalPortal } from "./components/HospitalPortal";
import { BloodBankPortal } from "./components/BloodBankPortal";
import { AdminPortal } from "./components/AdminPortal";
import { LoginPortal } from "./components/LoginPortal";

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState("landing");
  const { user, loginAsDemo } = useApp();

  const handleLoginClick = async (role: "admin" | "hospital" | "blood_bank", targetId?: string) => {
    await loginAsDemo(role, targetId);
    if (role === "admin") setCurrentTab("admin_dashboard");
    else if (role === "hospital") setCurrentTab("hospital_dashboard");
    else setCurrentTab("bank_dashboard");
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-900 flex flex-col justify-between">
      <div>
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
        
        <main className="transition-all duration-300">
          {currentTab === "landing" && (
            <LandingPage 
              setCurrentTab={setCurrentTab} 
              onLoginClick={handleLoginClick} 
            />
          )}
          {currentTab === "about" && <AboutPlatform />}
          {currentTab === "donor_registration" && <DonorRegistration />}
          {currentTab === "login" && (
            <LoginPortal onLoginSuccess={(tabToSet) => setCurrentTab(tabToSet)} />
          )}

          {/* Role Protected Channels */}
          {currentTab === "admin_dashboard" && (
            user?.role === "admin" ? <AdminPortal /> : <LoginPortal onLoginSuccess={(tabToSet) => setCurrentTab(tabToSet)} />
          )}
          {currentTab === "hospital_dashboard" && (
            user?.role === "hospital" ? <HospitalPortal /> : <LoginPortal onLoginSuccess={(tabToSet) => setCurrentTab(tabToSet)} />
          )}
          {currentTab === "bank_dashboard" && (
            user?.role === "blood_bank" ? <BloodBankPortal /> : <LoginPortal onLoginSuccess={(tabToSet) => setCurrentTab(tabToSet)} />
          )}
        </main>
      </div>

      {/* Clean high-contrast typography footer representation as per systems guidelines */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 font-mono mt-16 select-none">
        <p>© 2026 BloodLink AI Supply Orchestration Network. All logs audited. ISO 13485 Compliant.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
