import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../../pages/auth/LoginPage";
import ProfilePage from "../../pages/profile/ProfilePage";
import HomePage from "../../pages/dashboard/HomePage";
import ServicesPage from "../../pages/dashboard/ServicesPage";
import TransactionsPage from "../../pages/dashboard/TransactionsPage";
import OfficersPage from "../../pages/dashboard/OfficersPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/officers" element={<OfficersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
