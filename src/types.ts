export type UserRole = "admin" | "hospital" | "blood_bank" | "public";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  contact?: string;
}

export interface DonorProfile {
  donor_id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  blood_group: string;
  phone: string;
  email: string;
  state: string;
  district: string;
  city: string;
  area: string;
  pincode: string;
  last_donation_date: string; // YYYY-MM-DD
  availability: boolean;
  eligibility_status: "Eligible" | "Ineligible";
  createdAt: string;
}

export interface InventoryItem {
  inventory_id: string;
  blood_group: string;
  quantity: number; // in ML or units
  bank_id: string;
  bank_name: string;
  donor_id?: string;
  collection_date: string;
  expiry_date: string;
  storage_location: string;
  status: "available" | "transfered" | "expired" | "wasted";
}

export interface BloodRequest {
  request_id: string;
  hospital_id: string;
  hospital_name: string;
  blood_group: string;
  units_required: number;
  urgency: "Pending" | "Accepted" | "Processing" | "Completed";
  state: string;
  district: string;
  city: string;
  contact: string;
  status: "Pending" | "Accepted" | "Processing" | "Completed";
  bank_id?: string;
  bank_name?: string;
  createdAt: string;
  fulfilledAt?: string;
}

export interface NotificationItem {
  notification_id: string;
  type: "emergency" | "low_stock" | "expiry" | "shortage";
  message: string;
  target_user_id?: string;
  target_blood_group?: string;
  read: boolean;
  timestamp: string;
}

export interface DemandPrediction {
  blood_group: string;
  units: number;
  trend: string;
}

export interface InventoryRecommendation {
  blood_group: string;
  min_units: number;
  target_units: number;
}

export interface ShortagePrediction {
  blood_group: string;
  risk_level: "Low" | "Medium" | "High";
  probability: number;
  reasoning: string;
}

export interface NearExpiryItem {
  inventory_id: string;
  blood_group: string;
  days_remaining: number;
  recommendation: string;
}

export interface ExpiryPrediction {
  expectedWastageUnits: number;
  nearExpiryList: NearExpiryItem[];
  priorityUsageList: string[];
}

export interface RecommendedDonor {
  donor_id: string;
  name: string;
  suitability_rank: number;
  compatibility_status: string;
  reliability_score: number;
  availability_score: number;
  commentary: string;
}
