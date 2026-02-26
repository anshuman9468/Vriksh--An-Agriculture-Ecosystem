import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { SellerDashboard } from "./pages/SellerDashboard";
import { PreProduction } from "./pages/PreProduction";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/pre-production",
    Component: PreProduction,
  },
  {
    path: "/farmer",
    Component: FarmerDashboard,
  },
  {
    path: "/seller",
    Component: SellerDashboard,
  },
]);