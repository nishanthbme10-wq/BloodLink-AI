import { DonorProfile, InventoryItem, BloodRequest, UserProfile } from "../types";

export const SEED_BLOOD_BANKS = [
  { id: "bb_alpha", name: "Metro Central Blood Authority", city: "Chennai", state: "Tamil Nadu", district: "Chennai", pincode: "600008", contact: "+91 44 2855 0101", email: "metro.central@bloodlink.org" },
  { id: "bb_beta", name: "Apex Lifeline Bank", city: "Chennai", state: "Tamil Nadu", district: "Chennai", pincode: "600034", contact: "+91 44 2622 0202", email: "apex.lifeline@bloodlink.org" },
  { id: "bb_gamma", name: "Red Cross Emergency Center", city: "Bangalore", state: "Karnataka", district: "Bangalore", pincode: "560001", contact: "+91 80 2226 0303", email: "redcross.blr@bloodlink.org" }
];

export const SEED_HOSPITALS = [
  { id: "h_apollo", name: "Apollo Specialty Hospital", city: "Chennai", state: "Tamil Nadu", district: "Chennai", pincode: "600006", contact: "+91 44 2829 0200", email: "emergency@apollo.hospital" },
  { id: "h_fortis", name: "Fortis Healthcare Center", city: "Bangalore", state: "Karnataka", district: "Bangalore", pincode: "560076", contact: "+91 80 6621 4444", email: "bloodbank@fortis.hospital" },
  { id: "h_aims", name: "All India Medical Sciences", city: "Delhi", state: "Delhi", district: "New Delhi", pincode: "110029", contact: "+91 11 2658 8500", email: "trauma.desk@aims.edu" }
];

export const INITIAL_MOCK_DONORS: DonorProfile[] = [
  {
    donor_id: "dn_001",
    name: "S. Nishanth",
    age: 28,
    gender: "Male",
    blood_group: "O+",
    phone: "9876543210",
    email: "nishanthbme10@gmail.com",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    area: "Nungambakkam",
    pincode: "600034",
    last_donation_date: "2026-02-10",
    availability: true,
    eligibility_status: "Eligible",
    createdAt: new Date().toISOString()
  },
  {
    donor_id: "dn_002",
    name: "Priya Sharma",
    age: 24,
    gender: "Female",
    blood_group: "B+",
    phone: "9988776655",
    email: "priya.sharma@example.com",
    state: "Karnataka",
    district: "Bangalore",
    city: "Bangalore",
    area: "Indiranagar",
    pincode: "560038",
    last_donation_date: "2025-11-20",
    availability: true,
    eligibility_status: "Eligible",
    createdAt: new Date().toISOString()
  },
  {
    donor_id: "dn_003",
    name: "Rahul Kumar",
    age: 32,
    gender: "Male",
    blood_group: "A-",
    phone: "9123456789",
    email: "rahul.kumar@example.com",
    state: "Delhi",
    district: "New Delhi",
    city: "Delhi",
    area: "Saket",
    pincode: "110017",
    last_donation_date: "2026-05-15", // Expired less than 90 days ago
    availability: true,
    eligibility_status: "Ineligible",
    createdAt: new Date().toISOString()
  },
  {
    donor_id: "dn_004",
    name: "Anita Desai",
    age: 29,
    gender: "Female",
    blood_group: "AB+",
    phone: "9345678120",
    email: "anita.desai@example.com",
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    area: "Bandra",
    pincode: "400050",
    last_donation_date: "2026-01-05",
    availability: true,
    eligibility_status: "Eligible",
    createdAt: new Date().toISOString()
  },
  {
    donor_id: "dn_005",
    name: "Amit Singh",
    age: 35,
    gender: "Male",
    blood_group: "O-",
    phone: "9234567890",
    email: "amit.singh@example.com",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    area: "Adyar",
    pincode: "600020",
    last_donation_date: "2026-03-01",
    availability: true,
    eligibility_status: "Eligible",
    createdAt: new Date().toISOString()
  },
  {
    donor_id: "dn_006",
    name: "Karan Johar",
    age: 17, // Underage
    gender: "Male",
    blood_group: "A+",
    phone: "9456712391",
    email: "karan.j@example.com",
    state: "Karnataka",
    district: "Bangalore",
    city: "Bangalore",
    area: "Koramangala",
    pincode: "560034",
    last_donation_date: "",
    availability: true,
    eligibility_status: "Ineligible",
    createdAt: new Date().toISOString()
  },
  {
    donor_id: "dn_007",
    name: "Meera Nair",
    age: 31,
    gender: "Female",
    blood_group: "O+",
    phone: "9488112233",
    email: "meera.nair@example.com",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    area: "Nungambakkam",
    pincode: "600034",
    last_donation_date: "2025-05-10",
    availability: false, // Explicitly unavailable
    eligibility_status: "Eligible",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MOCK_INVENTORY: InventoryItem[] = [
  {
    inventory_id: "unit_A_101",
    blood_group: "A+",
    quantity: 450,
    bank_id: "bb_alpha",
    bank_name: "Metro Central Blood Authority",
    donor_id: "dn_006",
    collection_date: "2026-05-10",
    expiry_date: "2026-06-22", // Expiring soon in our 2026-06 timeline
    storage_location: "Refrigerator A, Row 3",
    status: "available"
  },
  {
    inventory_id: "unit_O_202",
    blood_group: "O+",
    quantity: 450,
    bank_id: "bb_alpha",
    bank_name: "Metro Central Blood Authority",
    donor_id: "dn_001",
    collection_date: "2026-05-25",
    expiry_date: "2026-07-06",
    storage_location: "Refrigerator A, Row 1",
    status: "available"
  },
  {
    inventory_id: "unit_B_303",
    blood_group: "B+",
    quantity: 450,
    bank_id: "bb_beta",
    bank_name: "Apex Lifeline Bank",
    donor_id: "dn_002",
    collection_date: "2026-06-01",
    expiry_date: "2026-07-13",
    storage_location: "Refrigerator B, Row 2",
    status: "available"
  },
  {
    inventory_id: "unit_AB_404",
    blood_group: "AB-",
    quantity: 350,
    bank_id: "bb_alpha",
    bank_name: "Metro Central Blood Authority",
    collection_date: "2026-05-01",
    expiry_date: "2026-06-12", // Expired on our current local time (12th June 2026!)
    storage_location: "Refrigerator C, Shelf 4",
    status: "available"
  },
  {
    inventory_id: "unit_O_505",
    blood_group: "O-",
    quantity: 450,
    bank_id: "bb_beta",
    bank_name: "Apex Lifeline Bank",
    donor_id: "dn_005",
    collection_date: "2026-05-20",
    expiry_date: "2026-07-01",
    storage_location: "Refrigerator A, Row 4",
    status: "available"
  },
  {
    inventory_id: "unit_A_606",
    blood_group: "A-",
    quantity: 400,
    bank_id: "bb_gamma",
    bank_name: "Red Cross Emergency Center",
    donor_id: "dn_003",
    collection_date: "2026-05-05",
    expiry_date: "2026-06-16", // Expiring in 4 days
    storage_location: "Refrigerator C, Shelf 1",
    status: "available"
  }
];

export const INITIAL_MOCK_REQUESTS: BloodRequest[] = [
  {
    request_id: "req_001",
    hospital_id: "h_apollo",
    hospital_name: "Apollo Specialty Hospital",
    blood_group: "O+",
    units_required: 4,
    urgency: "Processing",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    contact: "+91 44 2829 0200",
    status: "Processing",
    bank_id: "bb_alpha",
    bank_name: "Metro Central Blood Authority",
    createdAt: "2026-06-10T10:30:00Z"
  },
  {
    request_id: "req_002",
    hospital_id: "h_fortis",
    hospital_name: "Fortis Healthcare Center",
    blood_group: "B+",
    units_required: 2,
    urgency: "Completed",
    state: "Karnataka",
    district: "Bangalore",
    city: "Bangalore",
    contact: "+91 80 6621 4444",
    status: "Completed",
    bank_id: "bb_gamma",
    bank_name: "Red Cross Emergency Center",
    createdAt: "2026-06-05T14:20:00Z",
    fulfilledAt: "2026-06-05T16:45:00Z"
  },
  {
    request_id: "req_003",
    hospital_id: "h_aims",
    hospital_name: "All India Medical Sciences",
    blood_group: "AB-",
    units_required: 3,
    urgency: "Pending",
    state: "Delhi",
    district: "New Delhi",
    city: "Delhi",
    contact: "+91 11 2658 8500",
    status: "Pending",
    createdAt: "2026-06-11T20:15:00Z"
  }
];

export const INITIAL_MOCK_NOTIFICATIONS = [
  {
    notification_id: "nt_001",
    type: "emergency",
    message: "Urgent O+ blood request raised by Apollo Specialty Hospital (Chennai). Matching donors, please reach out!",
    read: false,
    timestamp: "2026-06-10T10:32:00Z"
  },
  {
    notification_id: "nt_002",
    type: "low_stock",
    message: "Low Inventory Alert: AB- blood stock is near zero at Metro Central Blood Authority. Please donate!",
    read: false,
    timestamp: "2026-06-08T09:00:00Z"
  }
];
