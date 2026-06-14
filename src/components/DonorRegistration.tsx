import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DonorProfile } from "../types";
import { Heart, CheckCircle2, ShieldCheck, Mail, Phone, Calendar, User, MapPin } from "lucide-react";

export const DonorRegistration: React.FC = () => {
  const { registerDonor } = useApp();
  
  // Form values
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male" as "Male" | "Female" | "Other",
    blood_group: "O+",
    phone: "",
    email: "",
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    area: "",
    pincode: "",
    last_donation_date: "",
    availability: true
  });

  // Flow State
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const validationErrors: string[] = [];

    // 1. Minimum Age Verification
    const ageVal = parseInt(formData.age);
    if (isNaN(ageVal) || ageVal < 18) {
      validationErrors.push("Safety Regulation: You must be at least 18 years of age to register as a donor.");
    }
    if (ageVal > 65) {
      validationErrors.push("Safety Regulation: Registration maximum age guideline is 65 years.");
    }

    // 2. Phone validation
    if (formData.phone.trim().length < 10) {
      validationErrors.push("Please provide a valid 10-digit mobile contact number.");
    }

    // 3. Pincode check
    if (formData.pincode.trim().length !== 6) {
      validationErrors.push("Pincode must contain exactly 6 digits.");
    }

    // 4. Donation Interval Check
    if (formData.last_donation_date) {
      const lastDon = new Date(formData.last_donation_date);
      const today = new Date();
      if (lastDon > today) {
        validationErrors.push("Donation date cannot be in the future.");
      } else {
        const diffTime = Math.abs(today.getTime() - lastDon.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 90) {
          validationErrors.push(`Clinical Safeguard: Only ${diffDays} days have passed since your last donation. A 90-day interval is required to protect your health. You may still register, but your eligibility status is Ineligible.`);
        }
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      // scroll to top of card
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    try {
      await registerDonor({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        blood_group: formData.blood_group,
        phone: formData.phone,
        email: formData.email,
        state: formData.state,
        district: formData.district,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        last_donation_date: formData.last_donation_date,
        availability: formData.availability
      });

      setIsSuccess(true);
    } catch (e: any) {
      setErrors(["Database registration failed. Please check configurations: " + e.message]);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-rose-100 shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-rose-950 font-sans tracking-tight">Registration Complete</h2>
          <p className="text-xs text-rose-500 uppercase font-mono tracking-wider mt-1">Volunteer Donor Ledger Updated</p>
          
          <div className="mt-8 bg-rose-550/5 p-4 rounded-xl text-xs text-gray-650 max-w-sm mb-8 leading-relaxed text-center">
            Thank you for registering, <strong>{formData.name}</strong>. Your profile has been integrated. Hospitals searching for {formData.blood_group} blood groups in {formData.city} can now securely contact you during medical emergencies.
          </div>

          <button
            onClick={() => setIsSuccess(false)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-6 py-3 rounded-xl transition font-semibold"
          >
            Register Another Donor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-100 shadow-lg">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-rose-50 p-2 rounded-2xl text-rose-600">
            <Heart className="w-6 h-6 fill-rose-550 text-rose-550" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-rose-950 font-sans tracking-tight">Public Donor Registration</h1>
            <p className="text-xs text-rose-450 mt-0.5 font-mono">Connect and help save lives under the AI alert routing grid</p>
          </div>
        </div>

        {/* Warning messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-xs mb-8 space-y-1 select-none">
            <p className="font-semibold uppercase tracking-wider text-[10px] text-red-800 mb-1">Safety Checks Failed:</p>
            {errors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4 border-b pb-1">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="S. Nishanth"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 28"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Group & Contact */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4 border-b pb-1">
              Blood Profile & Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-rose-600 focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                >
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@bloodlink.ai"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4 border-b pb-1">
              Geographic Region
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Tamil Nadu"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="e.g. Chennai"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Chennai"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Area / Locality</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="area"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g. Adyar"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 600020"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Eligibility Criteria */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-4 border-b pb-1">
              Safety Verification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Donation Date (Leave empty if first time)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="last_donation_date"
                    value={formData.last_donation_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleCheckboxChange}
                  className="w-4.5 h-4.5 accent-rose-600 rounded bg-white border-gray-200 cursor-pointer"
                />
                <label htmlFor="availability" className="text-xs text-rose-950 font-medium cursor-pointer">
                  I am currently available to be contacted for emergency local blood drives
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Integrating Profile..." : "Register Profile To Live Supply Mesh"}
          </button>

          {/* Regulatory Notice */}
          <div className="flex items-start gap-2 text-[10px] text-gray-400 bg-gray-50 p-3.5 rounded-xl border border-gray-150">
            <ShieldCheck className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Regulatory Notice</strong>: BloodLink AI donor registries are stored securely in compliance with healthcare data protection principles. Donor contacts are only visible to authorized hospital medical heads for emergency donation routing.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
