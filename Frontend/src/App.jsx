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
import EmergencyMatches from "./pages/EmergencyMatches";
import MedicalChatPage from "./pages/MedChat";
import CriticalData from "./pages/CriticalData";
import TreatmentDashboard from "./pages/Current";

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
      </Routes>
      <Footer />
    </>
  );
}

export default App;

// 689af0f99107bb161d32d974
