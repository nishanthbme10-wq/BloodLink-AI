import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  BloodRequest,
  DemandPrediction,
  DonorProfile,
  ExpiryPrediction,
  InventoryItem,
  NearExpiryItem,
  NotificationItem,
  RecommendedDonor,
  ShortagePrediction,
  UserProfile
} from "../types";
import {
  INITIAL_MOCK_DONORS,
  INITIAL_MOCK_INVENTORY,
  INITIAL_MOCK_NOTIFICATIONS,
  INITIAL_MOCK_REQUESTS,
  SEED_BLOOD_BANKS,
  SEED_HOSPITALS
} from "../utils/mockData";

interface AppContextType {
  user: UserProfile | null;
  donors: DonorProfile[];
  inventory: InventoryItem[];
  requests: BloodRequest[];
  notifications: NotificationItem[];
  
  // AI State
  demandForecast: DemandPrediction[];
  shortageRisks: ShortagePrediction[];
  expiryReport: ExpiryPrediction | null;
  loadingAI: boolean;
  aiErrorMessage: string | null;

  // Actions
  loginUser: (email: string, password: string) => Promise<void>;
  registerDonor: (donorData: Omit<DonorProfile, "donor_id" | "createdAt">) => Promise<void>;
  addInventoryItem: (itemData: Omit<InventoryItem, "inventory_id">) => Promise<void>;
  updateInventoryStatus: (inventoryId: string, status: "available" | "transfered" | "expired" | "wasted") => Promise<void>;
  removeInventoryItem: (inventoryId: string) => Promise<void>;
  createBloodRequest: (requestData: Omit<BloodRequest, "request_id" | "status" | "createdAt">) => Promise<void>;
  updateRequestStatus: (requestId: string, status: "Pending" | "Accepted" | "Processing" | "Completed", bankId?: string, bankName?: string) => Promise<void>;
  triggerAiDemandPrediction: () => Promise<void>;
  triggerAiShortagePrediction: () => Promise<void>;
  triggerAiExpiryPrediction: () => Promise<void>;
  fetchSmartDonorRecommendations: (requestId: string) => Promise<RecommendedDonor[]>;
  addNotification: (type: "emergency" | "low_stock" | "expiry" | "shortage", message: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Reset and Seed helpers
  resetDatabaseToSeed: () => Promise<void>;
  isFirebaseActive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);const
   [donors, setDonors] = useState<DonorProfile[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // AI & Analytics State
  const [demandForecast, setDemandForecast] = useState<DemandPrediction[]>([]);
  const [shortageRisks, setShortageRisks] = useState<ShortagePrediction[]>([]);
  const [expiryReport, setExpiryReport] = useState<ExpiryPrediction | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);

  // Try to bind to Firebase collections, fallback to state memory if fails/offline
  useEffect(() => {
    let unsubUsers: any = null;
    let unsubDonors: any = null;
    let unsubInventory: any = null;
    let unsubRequests: any = null;
    let unsubNotifications: any = null;

    const setupFirebaseListeners = async () => {
      try {
        setIsFirebaseActive(true);

        // Realtime Donors
        unsubDonors = onSnapshot(collection(db, "donors"), (snapshot) => {
          if (!snapshot.empty) {
            const list: DonorProfile[] = [];
            snapshot.forEach((doc) => {
              list.push({ donor_id: doc.id, ...doc.data() } as DonorProfile);
            });
            setDonors(list);
          }
        }, () => {});

        // Realtime Inventory
        unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
          if (!snapshot.empty) {
            const list: InventoryItem[] = [];
            snapshot.forEach((doc) => {
              list.push({ inventory_id: doc.id, ...doc.data() } as InventoryItem);
            });
            setInventory(list);
          }
        }, () => {});

        // Realtime Blood Requests
        unsubRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
          if (!snapshot.empty) {
            const list: BloodRequest[] = [];
            snapshot.forEach((doc) => {
              list.push({ request_id: doc.id, ...doc.data() } as BloodRequest);
            });
            setRequests(list);
          }
        }, () => {});

        // Realtime Notifications
        unsubNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
          if (!snapshot.empty) {
            const list: NotificationItem[] = [];
            snapshot.forEach((doc) => {
              list.push({ notification_id: doc.id, ...doc.data() } as NotificationItem);
            });
            // Sort by latest timestamp
            list.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
            setNotifications(list);
          }
        }, () => {});

        // Auth listener
        onAuthStateChanged(auth, async (u) => {
          if (u) {
            // Retrieve role profile
            try {
              const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", u.uid)));
              if (!userSnap.empty) {
                const data = userSnap.docs[0].data();
                setUser({
                  id: u.uid,
                  email: u.email || "",
                  role: data.role,
                  name: data.name,
                  state: data.state,
                  district: data.district,
                  city: data.city,
                  pincode: data.pincode,
                  contact: data.contact,
                });
              } else {
                // If auth exists but database profile doesn't (could happen if cleared), fallback
                setUser({
                  id: u.uid,
                  email: u.email || "",
                  role: "admin",
                  name: "Administrator"
                });
              }
            } catch (authDbError) {
              // Db read access restricted or not matching, default role admin
              setUser({
                id: u.uid,
                email: u.email || "",
                role: "admin",
                name: "Administrator"
              });
            }
          } else {
            // Keep demo session if active, else null
            setUser((prev) => (prev && prev.id.startsWith("demo_") ? prev : null));
          }
        });

      } catch (err) {
        console.warn("Using offline memory state. Firestore is resolving or permissions restricted.");
        setIsFirebaseActive(false);
      }
    };

    setupFirebaseListeners();

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubDonors) unsubDonors();
      if (unsubInventory) unsubInventory();
      if (unsubRequests) unsubRequests();
      if (unsubNotifications) unsubNotifications();
    };
  }, []);

  // Run initial calculations on local dataset right after loading
  useEffect(() => {
    if (donors.length > 0) {
      calculateOfflinePredictions();
    }
  }, [donors, inventory, requests]);

  // Seeding support
  const resetDatabaseToSeed = async () => {
    if (!isFirebaseActive) {
      // Offline mode seeding
      setDonors(INITIAL_MOCK_DONORS);
      setInventory(INITIAL_MOCK_INVENTORY);
      setRequests(INITIAL_MOCK_REQUESTS);
      setNotifications(INITIAL_MOCK_NOTIFICATIONS as any);
      return;
    }

    try {
      // Add all to Firestore
      for (const donor of INITIAL_MOCK_DONORS) {
        await setDoc(doc(db, "donors", donor.donor_id), {
          name: donor.name,
          age: donor.age,
          gender: donor.gender,
          blood_group: donor.blood_group,
          phone: donor.phone,
          email: donor.email,
          state: donor.state,
          district: donor.district,
          city: donor.city,
          area: donor.area,
          pincode: donor.pincode,
          last_donation_date: donor.last_donation_date,
          availability: donor.availability,
          eligibility_status: donor.eligibility_status,
          createdAt: donor.createdAt
        });
      }

      for (const item of INITIAL_MOCK_INVENTORY) {
        await setDoc(doc(db, "inventory", item.inventory_id), {
          blood_group: item.blood_group,
          quantity: item.quantity,
          bank_id: item.bank_id,
          bank_name: item.bank_name,
          donor_id: item.donor_id || "",
          collection_date: item.collection_date,
          expiry_date: item.expiry_date,
          storage_location: item.storage_location,
          status: item.status
        });
      }

      for (const r of INITIAL_MOCK_REQUESTS) {
        await setDoc(doc(db, "requests", r.request_id), {
          hospital_id: r.hospital_id,
          hospital_name: r.hospital_name,
          blood_group: r.blood_group,
          units_required: r.units_required,
          urgency: r.urgency,
          state: r.state,
          district: r.district,
          city: r.city,
          contact: r.contact,
          status: r.status,
          bank_id: r.bank_id || "",
          bank_name: r.bank_name || "",
          createdAt: r.createdAt,
          fulfilledAt: r.fulfilledAt || ""
        });
      }

      for (const n of INITIAL_MOCK_NOTIFICATIONS) {
        await setDoc(doc(db, "notifications", n.notification_id), {
          type: n.type,
          message: n.message,
          read: n.read,
          timestamp: n.timestamp
        });
      }

      // Add seed user directories to login
      await setDoc(doc(db, "users", "usr_admin"), { id: "usr_admin", email: "admin@bloodlink.ai", role: "admin", name: "Platform Admin Team" });
      await setDoc(doc(db, "users", "usr_apollo"), { id: "usr_apollo", email: "emergency@apollo.hospital", role: "hospital", name: "Apollo Specialty Hospital", city: "Chennai", state: "Tamil Nadu", district: "Chennai", pincode: "600006", contact: "+91 44 2829 0200" });
      await setDoc(doc(db, "users", "usr_metro"), { id: "usr_metro", email: "metro.central@bloodlink.org", role: "blood_bank", name: "Metro Central Blood Authority", city: "Chennai", state: "Tamil Nadu", district: "Chennai", pincode: "600008", contact: "+91 44 2855 0101" });

    } catch (e) {
      console.error("Failed seeding database: ", e);
    }
  };

  // Demo direct login for reviews
  const loginAsDemo = async (role: "admin" | "hospital" | "blood_bank", targetId?: string) => {
    if (role === "admin") {
      setUser({
        id: "demo_admin",
        email: "admin@bloodlink.ai",
        role: "admin",
        name: "BloodLink System Admin"
      });
    } else if (role === "hospital") {
      const match = SEED_HOSPITALS.find(h => h.id === targetId) || SEED_HOSPITALS[0];
      setUser({
        id: "demo_" + match.id,
        email: match.email,
        role: "hospital",
        name: match.name,
        state: match.state,
        district: match.district,
        city: match.city,
        pincode: match.pincode,
        contact: match.contact
      });
    } else if (role === "blood_bank") {
      const match = SEED_BLOOD_BANKS.find(bb => bb.id === targetId) || SEED_BLOOD_BANKS[0];
      setUser({
        id: "demo_" + match.id,
        email: match.email,
        role: "blood_bank",
        name: match.name,
        state: match.state,
        district: match.district,
        city: match.city,
        pincode: match.pincode,
        contact: match.contact
      });
    }
  };
  const loginUser = async (email: string, password: string) => {
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
  
      const uid = userCredential.user.uid;
  
      const q = query(
        collection(db, "users"),
        where("uid", "==", uid)
      );
  
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
  
        setUser({
          id: uid,
          email: userData.email,
          role: userData.role,
          name: userData.name
        } as any);
      }
    } catch (error) {
      console.error("Login Failed", error);
      throw error;
    }
  };

  // 1. Donor Registration
  const registerDonor = async (donorData: Omit<DonorProfile, "donor_id" | "createdAt" | "eligibility_status">) => {
    // Determine Eligibility Status based on 90-day donation interval
    let eligibility: "Eligible" | "Ineligible" = "Eligible";
    if (donorData.last_donation_date) {
      const lastDon = new Date(donorData.last_donation_date);
      const diffTime = Math.abs(new Date().getTime() - lastDon.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        eligibility = "Ineligible";
      }
    }
    if (donorData.age < 18) {
      eligibility = "Ineligible";
    }

    const dataToSave = {
      ...donorData,
      eligibility_status: eligibility,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseActive) {
      try {
        await addDoc(collection(db, "donors"), dataToSave);
      } catch (err) {
        console.error("Firestore Save Error for Donor, saving offline.", err);
        const newDonor: DonorProfile = { donor_id: "dn_" + Date.now(), ...dataToSave } as DonorProfile;
        setDonors(prev => [...prev, newDonor]);
      }
    } else {
      const newDonor: DonorProfile = { donor_id: "dn_" + Date.now(), ...dataToSave } as DonorProfile;
      setDonors(prev => [...prev, newDonor]);
    }

    // Trigger an in-app alert for newly registered donor
    await addNotification("emergency", `New donor registant: ${donorData.name} has joined the ${donorData.blood_group} network at pincode ${donorData.pincode}.`);
  };

  // 2. Add blood bag to inventory
  const addInventoryItem = async (itemData: Omit<InventoryItem, "inventory_id">) => {
    if (isFirebaseActive) {
      try {
        await addDoc(collection(db, "inventory"), itemData);
      } catch (err) {
        console.error("Firestore Save Error", err);
        const newItem = { inventory_id: "unit_" + Date.now(), ...itemData };
        setInventory(prev => [...prev, newItem]);
      }
    } else {
      const newItem = { inventory_id: "unit_" + Date.now(), ...itemData };
      setInventory(prev => [...prev, newItem]);
    }

    // Dynamic stock depletion alert
    const stockUnitsOfGroup = inventory.filter(i => i.blood_group === itemData.blood_group && i.status === "available").length + 1;
    if (stockUnitsOfGroup > 10) {
      // safe
    } else if (stockUnitsOfGroup < 3) {
      await addNotification("low_stock", `CRITICAL LOW STOCK: Only ${stockUnitsOfGroup} units of ${itemData.blood_group} remain in the active blood banks.`);
    }
  };

  // Update blood bag status
  const updateInventoryStatus = async (inventoryId: string, status: "available" | "transfered" | "expired" | "wasted") => {
    if (isFirebaseActive) {
      try {
        const docRef = doc(db, "inventory", inventoryId);
        await updateDoc(docRef, { status });
      } catch (err) {
        setInventory(prev => prev.map(item => item.inventory_id === inventoryId ? { ...item, status } : item));
      }
    } else {
      setInventory(prev => prev.map(item => item.inventory_id === inventoryId ? { ...item, status } : item));
    }
  };

  // Delete inventory item
  const removeInventoryItem = async (inventoryId: string) => {
    if (isFirebaseActive) {
      try {
        await deleteDoc(doc(db, "inventory", inventoryId));
      } catch (err) {
        setInventory(prev => prev.filter(item => item.inventory_id !== inventoryId));
      }
    } else {
      setInventory(prev => prev.filter(item => item.inventory_id !== inventoryId));
    }
  };

  // 3. Create Blood Requests
  const createBloodRequest = async (requestData: Omit<BloodRequest, "request_id" | "status" | "createdAt">) => {
    const freshRequest = {
      ...requestData,
      status: "Pending" as const,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseActive) {
      try {
        await addDoc(collection(db, "requests"), freshRequest);
      } catch (err) {
        const offlineReq = { request_id: "req_" + Date.now(), ...freshRequest } as BloodRequest;
        setRequests(prev => [...prev, offlineReq]);
      }
    } else {
      const offlineReq = { request_id: "req_" + Date.now(), ...freshRequest } as BloodRequest;
      setRequests(prev => [...prev, offlineReq]);
    }

    // Add Broadcast Notification
    await addNotification(
      "emergency", 
      `CRITICAL ALERT: Emergency blood request raised for (${requestData.units_required} Units) of ${requestData.blood_group} by ${requestData.hospital_name} located in ${requestData.city}.`
    );
  };

  // Update blood request status
  const updateRequestStatus = async (
    requestId: string, 
    status: "Pending" | "Accepted" | "Processing" | "Completed",
    bankId?: string,
    bankName?: string
  ) => {
    const updatePayload: any = { status };
    if (status === "Completed") {
      updatePayload.fulfilledAt = new Date().toISOString();
    }
    if (bankId) {
      updatePayload.bank_id = bankId;
      updatePayload.bank_name = bankName || "";
    }

    if (isFirebaseActive) {
      try {
        const docRef = doc(db, "requests", requestId);
        await updateDoc(docRef, updatePayload);
      } catch (err) {
        setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, ...updatePayload } : r));
      }
    } else {
      setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, ...updatePayload } : r));
    }

    // Trigger update alert
    const rMatch = requests.find(r => r.request_id === requestId);
    if (rMatch) {
      await addNotification(
        "emergency",
        `Emergency Request Update: ${rMatch.hospital_name}'s request for ${rMatch.blood_group} is now [${status}].`
      );
    }
  };

  // 4. Create Notification
  const addNotification = async (type: "emergency" | "low_stock" | "expiry" | "shortage", message: string) => {
    const payload = {
      type,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseActive) {
      try {
        await addDoc(collection(db, "notifications"), payload);
      } catch (err) {
        setNotifications(prev => [{ notification_id: "nt_" + Date.now(), ...payload }, ...prev]);
      }
    } else {
      setNotifications(prev => [{ notification_id: "nt_" + Date.now(), ...payload }, ...prev]);
    }
  };

  // ===================================
  // AI PREDICTIVE MODELS & INTEGRATIONS
  // ===================================

  const calculateOfflinePredictions = () => {
    // Generate intelligent default calculations for offline backup or fast rendering
    const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    
    // 1. Demand Forecast Backup
    const mockForecast: DemandPrediction[] = groups.map(g => {
      const activeReqsCount = requests.filter(r => r.blood_group === g).length;
      const baseDemand = g.includes("+") ? 8 : 2; // Positive groups have higher base demand
      const derivedUnits = Math.max(1, baseDemand + activeReqsCount * 2 + Math.floor(Math.random() * 3));
      const trend = activeReqsCount > 1 ? "Upward" : Math.random() > 0.5 ? "Steady" : "Downward";
      return { blood_group: g, units: derivedUnits, trend };
    });
    setDemandForecast(mockForecast);

    // 2. Shortage risk forecast backup
    const mockRisks: ShortagePrediction[] = groups.map(g => {
      const stockCount = inventory.filter(i => i.blood_group === g && i.status === "available").length;
      const reqUnits = requests.filter(r => r.blood_group === g && r.status !== "Completed")
                               .reduce((sum, current) => sum + current.units_required, 0);
      
      let probability = 0.1;
      if (stockCount === 0 && reqUnits > 0) probability = 0.95;
      else if (stockCount === 0) probability = 0.4;
      else if (stockCount < reqUnits) probability = 0.75;
      else if (stockCount < reqUnits + 2) probability = 0.5;

      let risk_level: "Low" | "Medium" | "High" = "Low";
      if (probability > 0.7) risk_level = "High";
      else if (probability > 0.35) risk_level = "Medium";

      return {
        blood_group: g,
        risk_level,
        probability,
        reasoning: `Active pending demand is ${reqUnits} units, with only ${stockCount} units on-shelf in warehouses.`
      };
    });
    setShortageRisks(mockRisks);

    // 3. Expiry Report backup
    const today = new Date();
    const neariList: NearExpiryItem[] = [];
    let expectedWastage = 0;

    inventory.forEach(item => {
      if (item.status === "available") {
        const exp = new Date(item.expiry_date);
        const timeDiff = exp.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff <= 0) {
          expectedWastage++;
          neariList.push({
            inventory_id: item.inventory_id,
            blood_group: item.blood_group,
            days_remaining: daysDiff,
            recommendation: "Critical: Unit is expired. Quarantine and mark as wasted."
          });
        } else if (daysDiff <= 7) {
          neariList.push({
            inventory_id: item.inventory_id,
            blood_group: item.blood_group,
            days_remaining: daysDiff,
            recommendation: "Prioritize for local therapeutic clinic transfusions immediately."
          });
        }
      }
    });

    const mockReport: ExpiryPrediction = {
      expectedWastageUnits: expectedWastage,
      nearExpiryList: neariList,
      priorityUsageList: ["AB-", "A-", "O-", "O+"] // list of priority groups
    };
    setExpiryReport(mockReport);
  };

  // Full-stack server API call for Gemini AI Blood Demand Prediction
  const triggerAiDemandPrediction = async () => {
    setLoadingAI(true);
    setAiErrorMessage(null);
    try {
      const response = await fetch("/api/ai/predict-demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: requests,
          currentStock: inventory
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.predictedMonthlyDemand) {
        setDemandForecast(data.predictedMonthlyDemand);
      }
    } catch (err: any) {
      console.warn("Gemini Server Prediction is offline or failed. Applying state-based clinical mathematical formula.");
      setAiErrorMessage(err.message || "Gemini prediction offline");
      calculateOfflinePredictions();
    } finally {
      setLoadingAI(false);
    }
  };

  // Full-stack server API call for Gemini AI Shortage Prediction
  const triggerAiShortagePrediction = async () => {
    setLoadingAI(true);
    setAiErrorMessage(null);

    const stockCounts: { [key: string]: number } = {};
    const activeRequestCounts: { [key: string]: number } = {};

    inventory.filter(i => i.status === "available").forEach(i => {
      stockCounts[i.blood_group] = (stockCounts[i.blood_group] || 0) + 1;
    });

    requests.filter(r => r.status !== "Completed").forEach(r => {
      activeRequestCounts[r.blood_group] = (activeRequestCounts[r.blood_group] || 0) + r.units_required;
    });

    try {
      const response = await fetch("/api/ai/predict-shortage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCounts, activeRequestCounts })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.shortageRisk) {
        setShortageRisks(data.shortageRisk);
      }
    } catch (err: any) {
      setAiErrorMessage(err.message || "Gemini prediction offline");
      calculateOfflinePredictions();
    } finally {
      setLoadingAI(false);
    }
  };

  // Full-stack server API call for Gemini AI Expiry Prediction
  const triggerAiExpiryPrediction = async () => {
    setLoadingAI(true);
    setAiErrorMessage(null);
    try {
      const response = await fetch("/api/ai/predict-expiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryItems: inventory })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.nearExpiryList) {
        setExpiryReport(data);
      }
    } catch (err: any) {
      setAiErrorMessage(err.message || "Gemini prediction offline");
      calculateOfflinePredictions();
    } finally {
      setLoadingAI(false);
    }
  };

  // Full-stack server API call for Smart Donor Recommendations
  const fetchSmartDonorRecommendations = async (requestId: string): Promise<RecommendedDonor[]> => {
    const request = requests.find(r => r.request_id === requestId);
    if (!request) return [];

    try {
      const response = await fetch("/api/ai/recommend-donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestGroup: request.blood_group,
          requestCity: request.city,
          candidateDonors: donors
        })
      });

      if (!response.ok) {
        throw new Error("Smart donor recommend API failed");
      }

      return await response.json();
    } catch (err) {
      console.warn("Donor Recommendation Engine: resolving with fallback static mathematical matches.");
      
      // Standalone clinical recommendation algorithm:
      // Filter donors matching requested blood group, area/city compatibility and calculate scores
      const result: RecommendedDonor[] = donors
        .filter(d => d.availability)
        .map((d, index) => {
          let compatibility = "Incompatible";
          
          // Basic compatibility rules (O- is universal donor, O+ can donate to positive, O+ can receive O+, etc.)
          if (d.blood_group === request.blood_group) {
            compatibility = "Perfect Match";
          } else if (d.blood_group === "O-") {
            compatibility = "Compatible Match (Universal)";
          } else if (d.blood_group === "O+" && request.blood_group.endsWith("+")) {
            compatibility = "Compatible Match (Universal Positive)";
          }

          // Reliability Calculation
          let reliability = 70;
          if (d.eligibility_status === "Eligible") reliability += 15;
          if (d.city.toLowerCase() === request.city.toLowerCase()) reliability += 10;
          if (d.pincode === request.pincode) reliability += 5;

          // Availability Calculation
          let availability = 50;
          if (d.eligibility_status === "Eligible") availability += 40;
          if (d.city.toLowerCase() === request.city.toLowerCase()) availability += 10;

          return {
            donor_id: d.donor_id,
            name: d.name,
            suitability_rank: index + 1,
            compatibility_status: compatibility,
            reliability_score: Math.min(100, reliability),
            availability_score: Math.min(100, availability),
            commentary: compatibility === "Perfect Match" 
              ? `${d.name} resides locally in ${d.city} (${d.area}) and matches exact group O+ with complete eligibility.`
              : `${d.name} is a compatible alternative group O- donor ready in the district.`
          };
        })
        .filter(d => d.compatibility_status !== "Incompatible")
        .sort((a, b) => b.reliability_score - a.reliability_score);

      return result;
    }
  };

  const logout = async () => {
    if (isFirebaseActive) {
      await signOut(auth);
    }
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      user,
      donors,
      inventory,
      requests,
      notifications,
      
      demandForecast,
      shortageRisks,
      expiryReport,
      loadingAI,
      aiErrorMessage,

      loginAsDemo,
      loginUser,
      registerDonor,
      addInventoryItem,
      updateInventoryStatus,
      removeInventoryItem,
      createBloodRequest,
      updateRequestStatus,
      triggerAiDemandPrediction,
      triggerAiShortagePrediction,
      triggerAiExpiryPrediction,
      fetchSmartDonorRecommendations,
      addNotification,
      logout,
      
      resetDatabaseToSeed,
      isFirebaseActive
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
