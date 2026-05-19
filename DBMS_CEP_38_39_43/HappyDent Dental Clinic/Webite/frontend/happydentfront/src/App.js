import './App.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import { isAuthenticated } from "./auth";

import Home from './components/Pages/Home_Patient/Home';
import Login from './components/Pages/Login/Login';
import Appointment from './components/Pages/Appointment/Appointment';
import Doctor from './components/Doctor/Doctor';
import HomeDoctor from './components/Pages/Home_Doctor/HomeDoctor';
import HomeManagement from './components/Pages/Home_Management/HomeManagement';
import AppointmentTabs from './components/Pages/AppointmentTabs/AppointmentTabs';
import PatientRecordDoctor from './components/Pages/PatientRecordsDoctor/PatientRecordsDoctor';
import StaffSalary from './components/Pages/Salary/Salary';
import PatientAppointments from './components/Pages/AppointmentStatus/AppointmentStatus';
import MyPatientRecords from './components/Pages/PatientRecordsPatient/PatientRecordsPatient';
import ProfilePage from './components/Pages/Profile/Profile';
import PatientBillingPage from '././components/Pages/Billing/Billing';
import StaffManagement from './components/Pages/StaffManagement/StaffManagement';
import PatientWholeManagement from './components/Pages/PateintManager/PatientManager';
import DepartmentManagement from './components/Pages/DepartmentManagement/DepartmentManagement';
import SupplierManagement from './components/Pages/SupplierManagement/SupplierManagement';
import InventoryManagement from './components/Pages/InventoryManagement/InventoryManagement';
import BillingSalaryManagement from './components/Pages/BillingSalaryManagement/BillingSalaryManagement';
import ReportManagement from './components/Pages/ReportManagement/ReportManagement';
import PatientDoctor from './components/Pages/PatientDoctor/PatientDoctor';


import Dock from './components/Dock/Dock';
import Background from './components/Background/Background';
import Footer from './components/Footer/Footer';

import CardNav from './components/CardNav/CardNav';
import logo from './components/logos/HappyDent_word_logo.png';

import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";
import UseToast from './components/Toast/Toast';
import { useState, useEffect } from 'react';
import AxiosInstance from './components/Axios';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const isLoginPage = location.pathname === "/login";

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [userRole, setUserRole] = useState("patient");

  // ---------------- FETCH USER ROLE ----------------
  useEffect(() => {
    const checkRole = async () => {
      if (!loggedIn || isLoginPage) return;
      try {
        const res = await AxiosInstance.get('/current-staff-info/');
        if (res.data && res.data.staff_role) {
          setUserRole(res.data.staff_role);
        } else {
          setUserRole("patient");
        }
      } catch (err) {
        setUserRole("patient");
      }
    };

    checkRole();
  }, [loggedIn, isLoginPage]);

  // ---------------- CONDITIONAL NAVIGATION FOR HOME ----------------
  const handleHomeNavigation = () => {
    if (userRole === "doctor") {
      navigate('/homedoctor');
    } else if (userRole === "management") {
      navigate('/homemanagement');
    } else {
      navigate('/');
    }
  };

  // ---------------- DOCK ITEMS CONFIGURATION ----------------
  const fullDockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: handleHomeNavigation },
    { icon: <VscArchive size={18} />, label: 'Report Generation', onClick: () => navigate('report-management')},
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => navigate('profile-page/') },
  ];

  const filteredDockItems = fullDockItems.filter(item => {
    if (item.requiresPatient && userRole !== 'patient') {
      return false;
    }
    return true;
  });

  // ---------------- NAVBAR ITEMS CONFIGURATION ----------------
  const baseNavbarItems = [
    {
      label: "Home",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [{ label: "Home", ariaLabel: "Home page", href: "/" },
              { label: "Generate Report", ariaLabel: "Generate Report", href: "/report-management" }
      ]
    },
    {
      label: "Appointments",
      bgColor: "#2F293A",
      textColor: "#fff",
      links: [
        { label: "Book Appointment", ariaLabel: "Appointment Booking", href: "/appointment" },
        { label: "View Appointment Status", ariaLabel: "Status View", href: "/patient-appointments" }
      ]
    },
    {
      label: "Billing And Records",
      bgColor: "#2F293A",
      textColor: "#fff",
      links: [
        { label: "Records", ariaLabel: "View your records", href: "/my-patient-records" },
        { label: "Billings", ariaLabel: "View your billings", href: "/patient-billing" }
      ]
    }
  ];

  // ✅ Specific fallback menu structure for Staff (Doctor/Management) 
  const staffNavbarItems = [
    {
      label: "Navigation",
      bgColor: "#1B1722",
      textColor: "#fff",
      links: [
        { label: "Home", ariaLabel: "Go to Dashboard", href: userRole === "doctor" ? "/homedoctor" : "/homemanagement" },
        { label: "Profile", ariaLabel: "Profile Page", href: "/profile-page" },
        { label: "Generate Report", ariaLabel: "Generate Report", href: "/report-management" }
      ]
    }
  ];

  // ✅ Toggle items dynamically based on the role state
  const filteredNavbarItems = userRole === 'patient' ? baseNavbarItems : staffNavbarItems;

  return (
    <div className="app">
      <UseToast
        show={toast.show} message={toast.message}
        type={toast.type} onClose={() =>
          setToast((prev) => ({ ...prev, show: false }))
        }/>

      <div className="background-wrapper">
        <Background
          color1="#d0fcd2" color2="#b3caff" color3="#d0fcd2"
          timeSpeed={0.25} warpStrength={1} warpFrequency={5} warpSpeed={2}
          warpAmplitude={50} blendSoftness={0.05} rotationAmount={500}
          noiseScale={2} grainAmount={0.1} contrast={1.5} zoom={0.9}
        />
      </div>

      {!isLoginPage && (
        <CardNav
          logo={logo}
          logoAlt="Company Logo"
          items={filteredNavbarItems}
          baseColor="#fff"
          menuColor="#000"
          buttonBgColor="#111"
          buttonTextColor="#fff"
          ease="power3.out"
          setToast={setToast}
        />
      )}

      {loggedIn && !isLoginPage && (
        <Dock
          items={filteredDockItems}
          panelHeight={57}
          baseItemSize={50}
          magnification={70}
        />
      )}

      <div className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setToast={setToast} />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/homedoctor" element={<HomeDoctor/>} />
          <Route path="/homemanagement" element={<HomeManagement/>} />
          <Route path="/appointment-tab" element={<AppointmentTabs/>} />
          <Route path="/patientrecords-doctor" element={<PatientRecordDoctor setToast={setToast}/>} />
          <Route path="/staff-salary" element={<StaffSalary/>} />
          <Route path="/patient-appointments" element={<PatientAppointments/>} />
          <Route path="/my-patient-records" element={<MyPatientRecords setToast={setToast}/>} />
          <Route path="/profile-page" element={<ProfilePage setToast={setToast}/>} />
          <Route path="/patient-billing" element={<PatientBillingPage setToast={setToast}/>} />
          <Route path="/staff-management" element={<StaffManagement setToast={setToast}/>} />
          <Route path="/patient-whole-management" element={<PatientWholeManagement setToast={setToast}/>} />
          <Route path="/department-management" element={<DepartmentManagement setToast={setToast}/>} />
          <Route path="/supplier-management" element={<SupplierManagement setToast={setToast}/>} />
          <Route path="/inventory-management" element={<InventoryManagement setToast={setToast}/>} />
          <Route path="/billing-salary-management" element={<BillingSalaryManagement setToast={setToast}/>} />
          <Route path="/report-management" element={<ReportManagement setToast={setToast}/>} />
          <Route path="/patient-doctor" element={<PatientDoctor setToast={setToast}/>} />

          <Route
            path="/appointment"
            element={
              <ProtectedRoute>
                <Appointment setToast={setToast}/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;