import React, { useState, useEffect } from 'react';
import { Pill, HeartPulse, Activity, Brain, ShieldPlus, Thermometer } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import MedicineCard from '../components/MedicineCard';
import CartButton from '../components/CartButton';
import axios from 'axios';
import { baseURL } from '../main';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CheckoutFooter from '../components/CheckoutFooter';

function OnlinePharmacy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [userData, setUserData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [medicinename, setMedicineName] = useState(location.state?.medicinename || null);
  const [openCartOnLoad, setOpenCartOnLoad] = useState(Boolean(location.state?.openCart));
  const [selectedCondition, setSelectedCondition] = useState('all');

  const healthConditions = [
    { key: 'all', label: 'All Medicines', icon: ShieldPlus, keywords: [] },
    { key: 'diabetes-care', label: 'Diabetes Care', icon: Activity, keywords: ['diabetes', 'diabetic', 'metformin', 'insulin', 'glucose', 'sugar'] },
    { key: 'cardiac-care', label: 'Cardiac Care', icon: HeartPulse, keywords: ['heart', 'cardiac', 'bp', 'blood pressure', 'hypertension', 'cholesterol', 'aspirin'] },
    { key: 'stomach-care', label: 'Stomach Care', icon: Pill, keywords: ['stomach', 'acidity', 'gastric', 'ulcer', 'antacid', 'digestion'] },
    { key: 'pain-relief', label: 'Pain Relief', icon: Pill, keywords: ['pain', 'fever', 'paracetamol', 'ibuprofen', 'analgesic', 'inflammation'] },
    { key: 'liver-care', label: 'Liver Care', icon: ShieldPlus, keywords: ['liver', 'hepatitis', 'hepatic', 'enzymes'] },
    { key: 'oral-care', label: 'Oral Care', icon: Thermometer, keywords: ['oral', 'tooth', 'dental', 'mouth', 'gum'] },
    { key: 'respiratory', label: 'Respiratory', icon: Thermometer, keywords: ['asthma', 'cough', 'cold', 'respiratory', 'lung', 'inhaler', 'allergy'] },
    { key: 'sexual-health', label: 'Sexual Health', icon: HeartPulse, keywords: ['sexual', 'hormonal', 'intimate', 'reproductive'] },
    { key: 'elderly-care', label: 'Elderly Care', icon: Brain, keywords: ['elderly', 'senior', 'arthritis', 'bone', 'joint', 'vitamin'] },
    { key: 'kidney-care', label: 'Kidney Care', icon: ShieldPlus, keywords: ['kidney', 'renal', 'nephro', 'urinary', 'uti'] },
    { key: 'cold-immunity', label: 'Cold & Immunity', icon: Thermometer, keywords: ['cold', 'flu', 'immunity', 'immune', 'vitamin c', 'zinc'] },
  ];

  const matchesCondition = (medicine, keywords) => {
    if (!keywords.length) return true;
    const searchableText = [
      medicine?.name,
      medicine?.manufacturer,
      medicine?.type,
      medicine?.dosage,
      medicine?.medicaluse,
      medicine?.uses,
      medicine?.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return keywords.some((keyword) => searchableText.includes(keyword));
  };

  const fetchmedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/allmedicines`);
      console.log(response.data); // Debug API response
      setMedicines(response.data.pharmacy || []); // Store all medicines in state
    } catch (err) {
      console.error('Error loading medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataFromApi = async () => {
    try {
      const token = localStorage.getItem('medVisionToken');
      const response = await axios.get(`${baseURL}/fetchdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedData = response.data.userData;
      setUserData(fetchedData);

      localStorage.setItem('userData', JSON.stringify(fetchedData));
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, []);

  useEffect(() => {
    fetchmedicines();
  }, []);

  useEffect(() => {
    if (location.state?.medicinename) {
      // Save the value locally and clear the state
      setMedicineName(location.state.medicinename);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (location.state?.openCart) {
      setOpenCartOnLoad(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (medicinename) {
      // Find a medicine that includes the medicinename (case insensitive)
      const matchedMedicine = medicines.find(med =>
        med.name.toLowerCase().includes(medicinename.toLowerCase())
      );

      if (matchedMedicine) {
        setSearchTerm(matchedMedicine.name); // Set full official name
      } else {
        setSearchTerm(medicinename); // Fallback to provided name
      }
    }
  }, [medicinename, medicines]);


  const activeCondition = healthConditions.find((condition) => condition.key === selectedCondition) || healthConditions[0];
  const conditionFilteredMedicines = medicines.filter((medicine) => matchesCondition(medicine, activeCondition.keywords));

  const filteredMedicines = conditionFilteredMedicines.filter((medicine) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const firstWord = normalizedSearch.split(' ')[0];
    const combinedFields = `${medicine.name} ${medicine.manufacturer} ${medicine.type} ${medicine.dosage || ''}`.toLowerCase();
    return combinedFields.includes(firstWord);
  });



  // Limit the display to the first 6 medicines if no search term is entered
  const hasActiveFilter = Boolean(searchTerm.trim()) || selectedCondition !== 'all';
  const displayedMedicines = hasActiveFilter ? filteredMedicines : medicines;
  const shouldUseScroller = !hasActiveFilter && medicines.length > 9;

  return (
    <div className="relative z-[100]">
      <Navbar />
      <div className="min-h-screen bg-[#f7fbff] relative" style={{ paddingTop: 'calc(var(--app-navbar-offset, 88px) + 0.5rem)' }}>
      {/* Pharmacy header banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-emerald-900 mb-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Pill className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">MedVision</p>
              <h1 className="text-2xl font-black text-white leading-tight">Online Pharmacy</h1>
              <p className="text-sm text-cyan-100 mt-0.5">Browse medicines &amp; order with ease</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center text-white/80 text-sm">
            <div><p className="text-2xl font-black text-white">100+</p><p>Medicines</p></div>
            <div className="w-px h-8 bg-white/20" />
            <div><p className="text-2xl font-black text-white">24h</p><p>Delivery</p></div>
            <div className="w-px h-8 bg-white/20" />
            <div><p className="text-2xl font-black text-white">Rx</p><p>Accepted</p></div>
          </div>
        </div>
      </div>

      <CartButton openOnMount={openCartOnLoad} />

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <SearchBar onSearchChange={setSearchTerm} />

        <div className="mt-6 rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-black text-slate-900">Browse by Health Conditions</h2>
            {selectedCondition !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCondition('all')}
                className="rounded-xl border border-cyan-200 bg-white px-3 py-1.5 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-800"
              >
                Clear Condition Filter
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {healthConditions.map((condition) => {
              const isActive = selectedCondition === condition.key;
              const Icon = condition.icon;
              const conditionCount = medicines.filter((medicine) => matchesCondition(medicine, condition.keywords)).length;

              return (
                <button
                  key={condition.key}
                  type="button"
                  onClick={() => setSelectedCondition(condition.key)}
                  className={`group min-h-[110px] rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-600 to-emerald-500 border-cyan-600 text-white shadow-lg shadow-cyan-200/70'
                      : 'bg-white border-slate-200 text-slate-700 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive ? 'bg-white/20' : 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isActive ? 'bg-white/20 text-cyan-50' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {conditionCount}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-tight line-clamp-2">{condition.label}</p>
                  <p className={`mt-1 text-xs ${isActive ? 'text-cyan-100' : 'text-slate-500'}`}>
                    {conditionCount} medicines available
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          {displayedMedicines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No medicines found for this condition and search criteria.</p>
            </div>
          ) : (
            <div>
              <div className={shouldUseScroller ? 'max-h-[68vh] overflow-y-auto pr-1' : ''}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedMedicines.map((medicine, index) => (
                    <MedicineCard
                      key={medicine.id}
                      {...medicine}
                      requiresPrescription={index === 0 ? true : (medicine.requiresPrescription || false)}
                      onAddToCart={() => setCartCount((prev) => prev + 1)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
      <CheckoutFooter />
    </div>
    </div>
  );
}

export default OnlinePharmacy;
