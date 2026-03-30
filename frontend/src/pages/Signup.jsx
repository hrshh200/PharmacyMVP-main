import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { baseURL } from "../main";

import {
  Mail,
  Lock,
  User,
  Store,
  Pill,
  ShieldCheck,
  Clock3,
  PackageCheck,
  Sparkles,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";

const Signup = () => {
  const [type, setType] = useState("password");
  const [type2, setType2] = useState("password");
  const [selectedRole, setSelectedRole] = useState("");
  const [showStoreRequestModal, setShowStoreRequestModal] = useState(false);
  const [storeLicenceFile, setStoreLicenceFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    ownerName: "",
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    countryCode: "+91",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    licenceNumber: "",
    gstNumber: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (selectedRole === "store") {
      try {
        if (!storeLicenceFile) {
          toast.error("Please upload your store licence document");
          setLoading(false);
          return;
        }
        else if (!formData.licenceNumber || !formData.gstNumber) {
          toast.error("Please provide both licence number and GST number for store registration");
          setLoading(false);
          return;
        }
        
        const requestPayload = new FormData();
        requestPayload.append("storeName", formData.storeName);
        requestPayload.append("ownerName", formData.ownerName);
        requestPayload.append("countryCode", formData.countryCode);
        requestPayload.append("mobile", formData.mobile);
        requestPayload.append("email", formData.email);
        requestPayload.append("licenceNumber", formData.licenceNumber);
        requestPayload.append("gstNumber", formData.gstNumber);
        requestPayload.append("city", formData.city);
        requestPayload.append("address", formData.address);
        requestPayload.append("state", formData.state);
        requestPayload.append("pincode", formData.pincode);
        requestPayload.append("storeLicenceFile", storeLicenceFile);

        await axios.post(`${baseURL}/store-requests`, requestPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setShowStoreRequestModal(true);
      } catch (error) {
        console.error("Store request submission failed:", error);
        toast.error(error?.response?.data?.message || "Failed to submit store request. Please try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (formData?.password !== formData?.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const roleFlagKey = 'is' + 'Patient';
      const fullName = [formData.firstName, formData.middleName, formData.lastName]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(' ');
      const payload = {
        ...formData,
        name: selectedRole === "patient" ? fullName : formData.storeName,
        [roleFlagKey]: false,
      };
      const response = await axios.post(`${baseURL}/signup`, payload);
      if (response.status === 201) {
        toast.success("Signup successful!");
        navigate("/login");
      }
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({
      ...formData,
      name: "",
      storeName: "",
      ownerName: "",
      salutation: "",
      firstName: "",
      middleName: "",
      lastName: "",
      countryCode: "+91",
      mobile: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      licenceNumber: "",
      gstNumber: "",
      password: "",
      confirmPassword: "",
      role,
    });
    setStoreLicenceFile(null);
  };

  const handleBackToRole = () => {
    setSelectedRole("");
    setFormData({
      name: "",
      storeName: "",
      ownerName: "",
      salutation: "",
      firstName: "",
      middleName: "",
      lastName: "",
      countryCode: "+91",
      mobile: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      licenceNumber: "",
      gstNumber: "",
      password: "",
      confirmPassword: "",
      role: "patient",
    });
    setStoreLicenceFile(null);
  };

  return (
    <>
      {showStoreRequestModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Store Request Submitted</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              You will be contacted by the Support Team. We will review the store information and you will get a reply shortly.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowStoreRequestModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStoreRequestModal(false);
                  navigate("/");
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-orange-600"
              >
                Go To Home
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Loader />
      ) : selectedRole === "" ? (
        <>
          <Navbar />
          <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#f4fbff_0%,#eef8f7_42%,#f8fafc_100%)] px-4 pb-12" style={{ paddingTop: 'calc(var(--app-navbar-offset, 88px) + 2.5rem)' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_34%)]" />
            <div className="absolute left-[-80px] top-28 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute right-[-70px] top-20 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute bottom-[-110px] left-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pharmacy Account Setup
                </span>
                <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 md:text-6xl">
                  Choose how you want to join the MedVision pharmacy network.
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  Create a patient account to manage medicines and prescriptions, or open a store account to run pharmacy operations and fulfill orders.
                </p>
              </div>

              <div className="mt-12 grid gap-8 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("patient")}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-8 text-left shadow-[0_24px_70px_rgba(14,116,144,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_90px_rgba(14,116,144,0.18)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-500 shadow-lg shadow-cyan-200">
                        <UserRound className="h-10 w-10 text-white" />
                      </div>
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                        Patient Access
                      </span>
                    </div>

                    <h2 className="mt-8 text-3xl font-black text-slate-900">Patient Sign Up</h2>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                      Build your pharmacy profile to upload prescriptions, order medicines, track deliveries, and manage repeat purchases faster.
                    </p>

                    <div className="mt-8 grid gap-3 text-sm text-slate-600">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Medicine ordering and cart history</div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Prescription upload and review flow</div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">Delivery tracking and refill convenience</div>
                    </div>

                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
                      Continue as Patient
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("store")}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-900 p-8 text-left text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_90px_rgba(15,23,42,0.24)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.14),transparent_30%)]" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-cyan-400 shadow-lg shadow-cyan-950/30">
                        <Store className="h-10 w-10 text-slate-950" />
                      </div>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                        Store Access
                      </span>
                    </div>

                    <h2 className="mt-8 text-3xl font-black">Store Sign Up</h2>
                    <p className="mt-4 text-base leading-8 text-slate-300">
                      Set up your pharmacy store account to manage inventory, process prescription-backed orders, and keep fulfillment moving smoothly.
                    </p>

                    <div className="mt-8 grid gap-3 text-sm text-slate-200">
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Inventory and medicine availability workflow</div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Order fulfillment and dispatch visibility</div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Store-side pharmacy operations dashboard</div>
                    </div>

                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                      Continue as Store
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </div>

              <p className="mt-12 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="cursor-pointer font-semibold text-cyan-700 transition hover:text-cyan-800 hover:underline"
                >
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <Navbar />
          <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#f4fbff_0%,#eef8f7_42%,#f8fafc_100%)] px-4 pb-12" style={{ paddingTop: 'calc(var(--app-navbar-offset, 88px) + 2.5rem)' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_34%)]" />
            <div className="absolute left-[-80px] top-28 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute right-[-70px] top-20 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute bottom-[-110px] left-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />

            <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="hidden lg:flex flex-col justify-between rounded-[2rem] border border-slate-200/70 bg-slate-900 px-10 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    {selectedRole === "store" ? "Store Registration" : "Patient Registration"}
                  </span>

                  <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-900/30">
                    <Pill className="h-10 w-10 text-slate-950" strokeWidth={2} />
                  </div>

                  <h1 className="mt-8 max-w-lg text-5xl font-black leading-tight">
                    {selectedRole === "store"
                      ? "Set up your pharmacy store workspace."
                      : "Create your pharmacy care account."}
                  </h1>

                  <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                    {selectedRole === "store"
                      ? "Register your store to manage medicines, accept prescription-backed requests, and keep fulfillment visible from one dashboard."
                      : "Create your account to order medicines, save your delivery history, and move through prescriptions with less friction."}
                  </p>
                </div>

                <div className="mt-10 grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <ShieldCheck className="h-6 w-6 text-emerald-300" />
                      <p className="mt-3 text-sm font-semibold">Protected access</p>
                      <p className="mt-1 text-xs leading-6 text-slate-400">Safe entry for pharmacy workflows.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <Clock3 className="h-6 w-6 text-cyan-300" />
                      <p className="mt-3 text-sm font-semibold">Fast setup</p>
                      <p className="mt-1 text-xs leading-6 text-slate-400">Get registered and active quickly.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <PackageCheck className="h-6 w-6 text-sky-300" />
                      <p className="mt-3 text-sm font-semibold">Order ready</p>
                      <p className="mt-1 text-xs leading-6 text-slate-400">Built for medicine delivery flows.</p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Included from day one</p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-200">
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>{selectedRole === "store" ? "Store-side medicine management" : "Prescription and medicine access"}</span>
                        <ArrowRight className="h-4 w-4 text-cyan-200" />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>{selectedRole === "store" ? "Order processing and dispatch workflow" : "Order history and live delivery tracking"}</span>
                        <ArrowRight className="h-4 w-4 text-cyan-200" />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                        <span>{selectedRole === "store" ? "Pharmacy operations dashboard access" : "Repeat order convenience and profile setup"}</span>
                        <ArrowRight className="h-4 w-4 text-cyan-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(14,116,144,0.14)] backdrop-blur-xl sm:p-8 lg:p-10">
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${selectedRole === "store" ? "border border-teal-200 bg-teal-50 text-teal-700" : "border border-cyan-200 bg-cyan-50 text-cyan-700"}`}>
                      {selectedRole === "store" ? "Store Sign Up" : "Patient Sign Up"}
                    </span>
                    <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
                      Create your Pharmacy Profile
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                      {selectedRole === "store"
                        ? "Share your store information to request pharmacy onboarding."
                        : "Create your patient profile to order medicines and manage prescriptions with confidence."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBackToRole}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    Back to role selection
                  </button>
                </div>

                <form onSubmit={submitHandler} className="space-y-5">
                  {selectedRole === "patient" ? (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Salutation
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <select
                              name="salutation"
                              value={formData.salutation}
                              onChange={handleChange}
                              className="w-full bg-transparent text-slate-800 outline-none"
                            >
                              <option value="">Select salutation</option>
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                              <option value="Dr">Dr</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Contact Number
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <select
                              name="countryCode"
                              value={formData.countryCode}
                              onChange={handleChange}
                              className="mr-3 bg-transparent text-slate-800 outline-none"
                            >
                              <option value="+91">+91</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
                              <option value="+61">+61</option>
                            </select>
                            <input
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              placeholder="Enter contact number"
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            First Name
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <User className="mr-3 h-5 w-5 text-cyan-600" />
                            <input
                              type="text"
                              placeholder="Enter first name"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Middle Name
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <User className="mr-3 h-5 w-5 text-cyan-600" />
                            <input
                              type="text"
                              placeholder="Enter middle name"
                              name="middleName"
                              value={formData.middleName}
                              onChange={handleChange}
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Last Name
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <User className="mr-3 h-5 w-5 text-cyan-600" />
                            <input
                              type="text"
                              placeholder="Enter last name"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Store Name
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <Store className="mr-3 h-5 w-5 text-teal-600" />
                            <input
                              type="text"
                              placeholder="Enter pharmacy store name"
                              name="storeName"
                              value={formData.storeName}
                              onChange={handleChange}
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Owner Name
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <User className="mr-3 h-5 w-5 text-teal-600" />
                            <input
                              type="text"
                              placeholder="Enter owner or manager name"
                              name="ownerName"
                              value={formData.ownerName}
                              onChange={handleChange}
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Upload Store Licence
                        </label>
                        <input
                          type="file"
                          // accept="image/*,.pdf"
                          onChange={(e) => setStoreLicenceFile(e.target.files?.[0] || null)}
                          required
                          className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-xl file:border-0 file:bg-teal-100 file:px-3 file:py-2 file:text-teal-700"
                        />
                        {storeLicenceFile && (
                          <p className="mt-2 text-xs text-slate-500">Selected: {storeLicenceFile.name}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                      <Mail className="mr-3 h-5 w-5 text-cyan-600" />
                      <input
                        type="email"
                        placeholder={selectedRole === "store" ? "Enter your store email" : "Enter your email"}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {selectedRole === "patient" && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Address
                        </label>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Enter full address"
                            required
                            className="w-full resize-none bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            State
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <select
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full bg-transparent text-slate-800 outline-none"
                            >
                              <option value="">Select state</option>
                              <option value="Maharashtra">Maharashtra</option>
                              <option value="Karnataka">Karnataka</option>
                              <option value="Delhi">Delhi</option>
                              <option value="Gujarat">Gujarat</option>
                              <option value="Tamil Nadu">Tamil Nadu</option>
                              <option value="Uttar Pradesh">Uttar Pradesh</option>
                              <option value="Rajasthan">Rajasthan</option>
                              <option value="West Bengal">West Bengal</option>
                              <option value="Andhra Pradesh">Andhra Pradesh</option>
                              <option value="Punjab">Punjab</option>
                              <option value="Haryana">Haryana</option>
                              <option value="Bihar">Bihar</option>
                              <option value="Chhattisgarh">Chhattisgarh</option>
                              <option value="Odisha">Odisha</option>
                              <option value="Kerala">Kerala</option>
                              <option value="Jharkhand">Jharkhand</option>
                              <option value="Assam">Assam</option>
                              <option value="Himachal Pradesh">Himachal Pradesh</option>
                              <option value="Uttarakhand">Uttarakhand</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Pincode
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleChange}
                              placeholder="Enter pincode"
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === "store" && (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Contact Number
                          </label>
                          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <select
                              name="countryCode"
                              value={formData.countryCode}
                              onChange={handleChange}
                              className="mr-3 bg-transparent text-slate-800 outline-none"
                            >
                              <option value="+91">+91</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
                              <option value="+61">+61</option>
                            </select>
                            <input
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleChange}
                              placeholder="Enter store contact number"
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Licence Number
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <input
                              type="text"
                              name="licenceNumber"
                              value={formData.licenceNumber}
                              onChange={handleChange}
                              placeholder="Enter pharmacy licence number"
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            GST Number
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <input
                              type="text"
                              name="gstNumber"
                              value={formData.gstNumber}
                              onChange={handleChange}
                              placeholder="Enter GST number"
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            City
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="Enter city"
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Store Address
                        </label>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Enter complete store address"
                            required
                            className="w-full resize-none bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            State
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <select
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full bg-transparent text-slate-800 outline-none"
                            >
                              <option value="">Select state</option>
                              <option value="Maharashtra">Maharashtra</option>
                              <option value="Karnataka">Karnataka</option>
                              <option value="Delhi">Delhi</option>
                              <option value="Gujarat">Gujarat</option>
                              <option value="Tamil Nadu">Tamil Nadu</option>
                              <option value="Uttar Pradesh">Uttar Pradesh</option>
                              <option value="Rajasthan">Rajasthan</option>
                              <option value="West Bengal">West Bengal</option>
                              <option value="Andhra Pradesh">Andhra Pradesh</option>
                              <option value="Punjab">Punjab</option>
                              <option value="Haryana">Haryana</option>
                              <option value="Bihar">Bihar</option>
                              <option value="Chhattisgarh">Chhattisgarh</option>
                              <option value="Odisha">Odisha</option>
                              <option value="Kerala">Kerala</option>
                              <option value="Jharkhand">Jharkhand</option>
                              <option value="Assam">Assam</option>
                              <option value="Himachal Pradesh">Himachal Pradesh</option>
                              <option value="Uttarakhand">Uttarakhand</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Pincode
                          </label>
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-100">
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleChange}
                              placeholder="Enter pincode"
                              required
                              className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === "patient" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Password
                        </label>
                        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                          <Lock className="mr-3 h-5 w-5 text-cyan-600" />
                          <input
                            type={type}
                            placeholder="Create a strong password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                          />

                          {type === "password" ? (
                            <FaRegEyeSlash
                              onClick={() => setType("text")}
                              className="cursor-pointer text-cyan-600"
                            />
                          ) : (
                            <FaRegEye
                              onClick={() => setType("password")}
                              className="cursor-pointer text-cyan-600"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Confirm Password
                        </label>
                        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                          <Lock className="mr-3 h-5 w-5 text-cyan-600" />
                          <input
                            type={type2}
                            placeholder="Confirm your password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                          />

                          {type2 === "password" ? (
                            <FaRegEyeSlash
                              onClick={() => setType2("text")}
                              className="cursor-pointer text-cyan-600"
                            />
                          ) : (
                            <FaRegEye
                              onClick={() => setType2("password")}
                              className="cursor-pointer text-cyan-600"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="font-semibold text-slate-900">Pharmacy Ready</p>
                      <p className="mt-1 text-xs leading-6">Built around medicine ordering and care workflows.</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="font-semibold text-slate-900">Secure Access</p>
                      <p className="mt-1 text-xs leading-6">Protected profile access for daily activity.</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="font-semibold text-slate-900">Fast Start</p>
                      <p className="mt-1 text-xs leading-6">Create your account and begin immediately.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 ${
                      selectedRole === "store"
                        ? "bg-gradient-to-r from-slate-900 to-teal-700 shadow-lg shadow-slate-200 hover:from-slate-800 hover:to-teal-600"
                        : "bg-gradient-to-r from-cyan-600 to-sky-600 shadow-lg shadow-cyan-200 hover:from-cyan-700 hover:to-sky-700"
                    }`}
                  >
                    {selectedRole === "store" ? "Request Store Access" : "Create Patient Account"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {selectedRole === "patient" && (
                  <>
                    <div className="my-7 flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Or continue with
                      </span>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-lg text-red-500 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50"
                      >
                        <FaGoogle />
                      </button>

                      <button
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-lg text-blue-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                      >
                        <FaFacebook />
                      </button>

                      <button
                        type="button"
                        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-lg text-sky-500 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50"
                      >
                        <FaTwitter />
                      </button>
                    </div>
                  </>
                )}

                <p className="mt-7 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="cursor-pointer font-semibold text-cyan-700 transition hover:text-cyan-800 hover:underline"
                  >
                    Login
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Signup;
