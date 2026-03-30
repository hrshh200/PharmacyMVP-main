import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { baseURL } from '../main';
import axios from 'axios';
import { Menu, X, LogOut, LayoutDashboard, LogIn, UserPlus, Pill, Clock, ShieldCheck, ShoppingBag, FileText, Sparkles } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('medVisionToken');
    const userType = localStorage.getItem('medVisionUserType');
    const navbarRef = useRef(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [adminData, setAdminData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);


    const scrollToElement = (id) => {
        const element = document.getElementById(id);
        const headerOffset = 70;

        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    const navigateToHomeSection = (sectionId) => {
        if (location.pathname === '/') {
            scrollToElement(sectionId);
            return;
        }

        navigate('/', {
            state: {
                scrollToSection: sectionId,
                requestedAt: Date.now(),
            },
        });
    };

    const fetchDataFromApi = async () => {
        try {
            const response = await axios.get(`${baseURL}/fetchdata`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUserData(response.data.userData);
            localStorage.setItem('userData', JSON.stringify(response.data.userData));
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    };

    const fetchadminDataFromApi = async () => {
        try {
            const response = await axios.get(`${baseURL}/adminfetchdata`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAdminData(response.data.adminData);
            localStorage.setItem('adminData', JSON.stringify(response.data.adminData));
        } catch (error) {
            console.error("Error fetching admin data:", error.message);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (token) {
            fetchDataFromApi();
            fetchadminDataFromApi();
        }

        if (localStorage.getItem('userData') || localStorage.getItem('adminData')) {
            setIsLoggedIn(true);
        }
    }, [token]);

    useEffect(() => {
        const updateNavbarOffset = () => {
            const height = navbarRef.current?.offsetHeight || 88;
            document.documentElement.style.setProperty('--app-navbar-offset', `${height}px`);
        };

        updateNavbarOffset();

        let resizeObserver;
        if (navbarRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => updateNavbarOffset());
            resizeObserver.observe(navbarRef.current);
        }

        window.addEventListener('resize', updateNavbarOffset);

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener('resize', updateNavbarOffset);
        };
    }, [menuOpen, isLoggedIn, adminData, userType]);

    const handleLogout = () => {
        localStorage.removeItem('medVisionToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('adminData');
        setIsLoggedIn(false);
        setMenuOpen(false);
        navigate('/');
    };

    const options = { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' };
    const formattedDate = currentTime.toLocaleDateString(undefined, options);
    const formattedTime = currentTime.toLocaleTimeString();
    const isStoreHeaderMode = userType === 'store' && location.pathname === '/storeDashboard';

    const navigateToDashboard = () => {
        if (adminData) {
            navigate('/admindashboard');
            return;
        }

        if (userType === 'store') {
            navigate('/storeDashboard');
            return;
        }

        navigate('/dashboard');
    };

    return (
        <>
            <div ref={navbarRef} className="fixed top-0 w-full z-50">

                {isStoreHeaderMode ? (
                    <div className="backdrop-blur-xl bg-slate-950/95 shadow-lg border-b border-teal-900/60">
                        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-3 max-w-[1400px] mx-auto gap-4">
                            <div className="flex items-center gap-3">
                                <div
                                    onClick={() => navigate('/storeDashboard')}
                                    className="relative p-2 bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 rounded-2xl shadow-lg shadow-teal-950/40 cursor-pointer"
                                >
                                    <Pill className="w-5 h-5 text-white" />
                                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-slate-950"></span>
                                </div>
                                <div>
                                    <p className="text-lg sm:text-xl font-bold text-white leading-none">Store Dashboard</p>
                                    <p className="hidden sm:block text-[11px] uppercase tracking-[0.2em] text-teal-200 font-semibold mt-1">MedVision Pharmacy</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="rounded-2xl border border-teal-900/70 bg-slate-900 px-3 py-2 sm:px-4">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-teal-200 font-semibold">Current Time</p>
                                    <p className="text-[11px] text-slate-300">{formattedDate}</p>
                                    <p className="text-sm sm:text-base font-bold text-teal-300">{formattedTime}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setShowLogoutModal(true);
                                    }}
                                    className="px-3 py-2 sm:px-4 rounded-xl border border-teal-400/70 text-teal-200 text-sm font-semibold transition-all duration-300 hover:bg-teal-500 hover:text-white hover:border-teal-500 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                <>

                <div className="border-b border-cyan-200/60 bg-gradient-to-r from-slate-950 via-cyan-950 to-emerald-900 text-white">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-1.5 text-[10px] sm:text-[11px]">
                        <div className="flex items-center gap-2 text-cyan-100">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                            <span className="font-semibold tracking-[0.18em] uppercase">Pharmacy First Care</span>
                        </div>

                        <div className="hidden lg:flex items-center gap-4 text-cyan-50/90">
                            <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                                Genuine medicines
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5 text-sky-300" />
                                Fast doorstep delivery
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-violet-300" />
                                Prescription support
                            </span>
                        </div>
                    </div>
                </div>

                <div className="backdrop-blur-xl bg-white/82 shadow-lg border-b border-cyan-100/70">

                <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-3 max-w-[1400px] mx-auto gap-4">

                    {/* Logo */}
                    <div
                        onClick={() => {
                            navigate('/');
                            setMenuOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <div className="relative p-2 bg-gradient-to-br from-cyan-600 via-sky-600 to-emerald-500 rounded-2xl shadow-lg shadow-cyan-200/70">
                            <Pill className="w-5 h-5 text-white" />
                            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-white"></span>
                        </div>
                        <div>
                            <p className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-sky-700 via-cyan-600 to-emerald-500 bg-clip-text text-transparent leading-none">
                                MedVision
                            </p>
                            <p className="hidden sm:block text-[11px] uppercase tracking-[0.24em] text-slate-500 font-semibold mt-1">
                                Online Pharmacy
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden xl:flex items-center gap-8 text-gray-700 font-medium">

                        <button
                            onClick={() => navigateToHomeSection('head')}
                            className="relative group px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                        >
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
                        </button>

                        <button
                            onClick={() => navigateToHomeSection('about')}
                            className="relative group px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                        >
                            Pharmacy Services
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
                        </button>

                        <button
                            onClick={() => navigate('/onlinepharmacy')}
                            className="relative group px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                        >
                            Pharmacy Store
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
                        </button>

                        <button
                            onClick={() => navigateToHomeSection('feedback')}
                            className="relative group px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                        >
                            Reviews
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
                        </button>
                    </div>

                    {/* Desktop Right Section */}
                    <div className="hidden xl:flex items-center gap-6">

                        {!isLoggedIn ? (
                            <div className="flex items-center gap-4">

                                <Link to="/login"
                                    className="px-5 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold
                                transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg active:scale-95
                                flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>

                                <Link to="/signup"
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold
                                shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95">
                                    <UserPlus className="w-4 h-4 inline mr-2" />
                                    SignUp
                                </Link>

                            </div>
                        ) : (
                            <div className="flex items-center gap-4">

                                <button
                                    onClick={navigateToDashboard}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold
                                shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95
                                flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </button>

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setShowLogoutModal(true);
                                    }}

                                    className="px-5 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold
  transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg active:scale-95
  flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>

                            </div>
                        )}

                        {/* Timer - Desktop Only */}
                        <div className="ml-4 pl-4 border-l border-blue-200">
                            <div className="flex items-center gap-3 bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-2 rounded-2xl shadow-sm border border-cyan-100">
                                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-cyan-100 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">Pharmacy Hours Live</p>
                                    <p className="text-xs text-blue-600 font-medium">{formattedDate}</p>
                                    <p className="text-sm font-bold text-blue-700">{formattedTime}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="xl:hidden p-2.5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-100 hover:bg-blue-100 transition-colors duration-300 active:scale-95"
                    >
                        {menuOpen ? (
                            <X className="w-6 h-6 text-blue-600" />
                        ) : (
                            <Menu className="w-6 h-6 text-blue-600" />
                        )}
                    </button>

                </div>
                </div>

                {/* Mobile + Tablet Menu */}
                {menuOpen && (
                    <div className="xl:hidden bg-white border-t border-blue-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col px-4 py-6 space-y-4">

                            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-4">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-700 font-semibold">Pharmacy Quick Access</p>
                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <button
                                        onClick={() => { navigate('/onlinepharmacy'); setMenuOpen(false); }}
                                        className="rounded-xl bg-white border border-cyan-100 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50 transition"
                                    >
                                        Pharmacy Store
                                    </button>
                                    <button
                                        onClick={() => { navigate('/dashboard', { state: { openSection: 'prescriptions' } }); setMenuOpen(false); }}
                                        className="rounded-xl bg-white border border-cyan-100 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50 transition"
                                    >
                                        Prescription Help
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-3 pb-6 border-b border-blue-100">
                                <button
                                    onClick={() => { navigateToHomeSection('head'); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Home
                                </button>

                                <button
                                    onClick={() => { navigateToHomeSection('about'); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Pharmacy Services
                                </button>

                                <button
                                    onClick={() => { navigate('/onlinepharmacy'); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Pharmacy Store
                                </button>

                                <button
                                    onClick={() => { navigateToHomeSection('feedback'); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Reviews
                                </button>
                            </div>

                            {/* Auth Buttons */}
                            {!isLoggedIn ? (
                                <div className="flex flex-col gap-3">

                                    <Link to="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold
                                    transition-all duration-300 hover:bg-blue-600 hover:text-white
                                    flex items-center justify-center gap-2">
                                        <LogIn className="w-4 h-4" />
                                        Login
                                    </Link>

                                    <Link to="/signup"
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold
                                    shadow-md transition-all duration-300 hover:shadow-lg
                                    flex items-center justify-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Sign Up
                                    </Link>

                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">

                                    <button
                                        onClick={() => {
                                            navigateToDashboard();
                                            setMenuOpen(false);
                                        }}
                                        className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold
                                    shadow-md transition-all duration-300 hover:shadow-lg
                                    flex items-center justify-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </button>

                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setShowLogoutModal(true);
                                        }}

                                        className="px-4 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold
                                    transition-all duration-300 hover:bg-blue-600 hover:text-white
                                    flex items-center justify-center gap-2">
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>

                                </div>
                            )}

                            {/* Mobile Timer */}
                            <div className="mt-6 pt-6 border-t border-blue-100 bg-gradient-to-br from-blue-50 to-emerald-50 px-4 py-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Current Time</p>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{formattedDate}</p>
                                <p className="text-2xl font-bold text-blue-700">{formattedTime}</p>
                            </div>

                        </div>
                    </div>
                )}
                </>
                )}
            </div>
            {showLogoutModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md animate-fadeIn">

                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Confirm Logout
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to logout? You will need to log in again to access your account.
                        </p>

                        <div className="flex justify-end gap-3">

                            {/* Cancel */}
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
                                Cancel
                            </button>

                            {/* Confirm */}
                            <button
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    handleLogout();
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">
                                Yes, Logout
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
