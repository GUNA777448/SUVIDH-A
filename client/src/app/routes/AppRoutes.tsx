import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../../pages/auth/LoginPage";
import ProfilePage from "../../pages/profile/ProfilePage";
import HomePage from "../../pages/dashboard/HomePage";
import ServicesPage from "../../pages/dashboard/ServicesPage";
import TransactionsPage from "../../pages/dashboard/TransactionsPage";
import OfficersPage from "../../pages/dashboard/OfficersPage";
import GasServicePage from "../../pages/dashboard/GasServicePage";
import PaymentPinPage from "../../pages/payments/PaymentPinPage";

// Gas Service Pages
import GasBookingPage from "../../pages/dashboard/services/GasBookingPage";
import GasNewConnectionPage from "../../pages/dashboard/services/GasNewConnectionPage";
import GasOrderTrackingPage from "../../pages/dashboard/services/GasOrderTrackingPage";
import GasDeliveryInvoicePage from "../../pages/dashboard/services/GasDeliveryInvoicePage";
import GasPNGManagementPage from "../../pages/dashboard/services/GasPNGManagementPage";
import GasDistributorPage from "../../pages/dashboard/services/GasDistributorPage";
import GasRatingPage from "../../pages/dashboard/services/GasRatingPage";
import GasComplaintPage from "../../pages/dashboard/services/GasComplaintPage";

// Electricity Service Pages
import ElectricityOverviewPage from "../../pages/dashboard/services/ElectricityOverviewPage";
import ElectricityBillingPage from "../../pages/dashboard/services/ElectricityBillingPage";
import ElectricityConnectionPage from "../../pages/dashboard/services/ElectricityConnectionPage";
import ElectricityConsumptionPage from "../../pages/dashboard/services/ElectricityConsumptionPage";
import ElectricityComplaintPage from "../../pages/dashboard/services/ElectricityComplaintPage";

// Water Service Pages
import WaterOverviewPage from "../../pages/dashboard/services/WaterOverviewPage";
import WaterBillingPage from "../../pages/dashboard/services/WaterBillingPage";
import WaterConnectionPage from "../../pages/dashboard/services/WaterConnectionPage";
import WaterTankerPage from "../../pages/dashboard/services/WaterTankerPage";
import WaterComplaintPage from "../../pages/dashboard/services/WaterComplaintPage";

// Waste Management Service Pages
import WasteOverviewPage from "../../pages/dashboard/services/WasteOverviewPage";
import WastePickupPage from "../../pages/dashboard/services/WastePickupPage";
import WasteComplaintPage from "../../pages/dashboard/services/WasteComplaintPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/gas" element={<GasServicePage />} />
      <Route path="/services/gas/booking" element={<GasBookingPage />} />
      <Route
        path="/services/gas/connection"
        element={<GasNewConnectionPage />}
      />
      <Route path="/services/gas/tracking" element={<GasOrderTrackingPage />} />
      <Route
        path="/services/gas/delivery"
        element={<GasDeliveryInvoicePage />}
      />
      <Route path="/services/gas/meter" element={<GasPNGManagementPage />} />
      <Route
        path="/services/gas/distributor"
        element={<GasDistributorPage />}
      />
      <Route path="/services/gas/rating" element={<GasRatingPage />} />
      <Route path="/services/gas/complaint" element={<GasComplaintPage />} />

      <Route
        path="/services/electricity"
        element={<ElectricityOverviewPage />}
      />
      <Route
        path="/services/electricity/billing"
        element={<ElectricityBillingPage />}
      />
      <Route
        path="/services/electricity/connection"
        element={<ElectricityConnectionPage />}
      />
      <Route
        path="/services/electricity/consumption"
        element={<ElectricityConsumptionPage />}
      />
      <Route
        path="/services/electricity/complaint"
        element={<ElectricityComplaintPage />}
      />

      <Route path="/services/water" element={<WaterOverviewPage />} />
      <Route path="/services/water/billing" element={<WaterBillingPage />} />
      <Route
        path="/services/water/connection"
        element={<WaterConnectionPage />}
      />
      <Route path="/services/water/tanker" element={<WaterTankerPage />} />
      <Route
        path="/services/water/complaint"
        element={<WaterComplaintPage />}
      />

      <Route path="/services/waste" element={<WasteOverviewPage />} />
      <Route path="/services/waste/pickup" element={<WastePickupPage />} />
      <Route
        path="/services/waste/complaint"
        element={<WasteComplaintPage />}
      />

      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/payments/pin" element={<PaymentPinPage />} />
      <Route path="/officers" element={<OfficersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/userid=:userId" element={<ProfilePage />} />
      <Route path="/profile/userid/:userId" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
