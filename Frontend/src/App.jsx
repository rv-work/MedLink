// App.jsx - Updated with consultation routes
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import BeautifulReportsDashboard from "./pages/Reports";
import BeautifulAddReport from "./pages/AddReportWeb3";
import Web2AddReport from "./pages/AddReportWeb2";
import ReportInDeatil from "./pages/ReportInDeatil";
import Emergency from "./pages/Emergency";
import ChatWithReport from "./pages/ChatWithReport";
import EnableEmergency from "./pages/EnableEmergency";
import MedicalChatPage from "./pages/MedChat";
import CriticalData from "./pages/CriticalData";
import TreatmentDashboard from "./pages/Current";
import RegisterDoctor from "./pages/RegisterDoctor";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAllTreatments from "./pages/DoctorAllTreatments";
import DoctorTreatmentDetail from "./pages/DoctorTreatmentDeatial";

// Consultation Components
import CreateConsultation from "./pages/CreateConsultation";
import ConsultantRequests from "./pages/ConsultantRequests";
import WaitingForDoctor from "./pages/WaitingForDoctor";
import PatientConsultation from "./pages/PatientConsultation";
import DoctorConsultation from "./pages/DoctorConsultation";

// Clinic Components
import SellerRegister from "./pages/RegisterClinic";
import ManageMedicines from "./pages/ManageMedicines";
import AddMedicine from "./pages/AddMedicine";
import SearchMedicines from "./pages/SearchMedicines";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reports" element={<BeautifulReportsDashboard />} />
        <Route path="/reports/:id" element={<ReportInDeatil />} />
        <Route path="/reports/:id/ask" element={<ChatWithReport />} />
        <Route path="/add-report-web3" element={<BeautifulAddReport />} />
        <Route path="/add-report-web2" element={<Web2AddReport />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/enable-emergency" element={<EnableEmergency />} />
        <Route path="/chat" element={<MedicalChatPage />} />
        <Route
          path="/critical-data/:userId/:emergencyId"
          element={<CriticalData />}
        />
        <Route path="/current" element={<TreatmentDashboard />} />
        <Route path="/register-doctor" element={<RegisterDoctor />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route
          path="/doctor-all-treatments"
          element={<DoctorAllTreatments />}
        />
        <Route
          path="/doctor-treatment/:treatmentId"
          element={<DoctorTreatmentDetail />}
        />

        {/* Patient Consultation Routes */}
        <Route path="/request-consultant" element={<CreateConsultation />} />
        <Route
          path="/waiting-for-doctor/:consultationId"
          element={<WaitingForDoctor />}
        />
        <Route
          path="/patient/consultation/:consultationId"
          element={<PatientConsultation />}
        />

        {/* Doctor Consultation Routes */}
        <Route path="/doctor/consultants" element={<ConsultantRequests />} />
        <Route
          path="/doctor/consultation/:consultationId"
          element={<DoctorConsultation />}
        />

        {/* Clinic Routes */}
        <Route path="/clinic/register" element={<SellerRegister />} />
        <Route path="/clinic/my-medicines" element={<ManageMedicines />} />
        <Route path="/clinic/add-medicine" element={<AddMedicine />} />
        <Route path="/clinic/medicine/search" element={<SearchMedicines />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
