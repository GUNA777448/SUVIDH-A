import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { BottomNav } from "../components/navigation/BottomNav";

export default function App() {
  const location = useLocation();
  const isServiceRoute = location.pathname.startsWith("/services");

  return (
    <div className={isServiceRoute ? "service-scope" : undefined}>
      <AppRoutes />
      <BottomNav />
    </div>
  );
}
