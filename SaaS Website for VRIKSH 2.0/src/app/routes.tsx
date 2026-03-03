import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { SellerDashboard } from "./pages/SellerDashboard";
import { TransportTracking } from "./pages/TransportTracking";
import { LandingPage } from "./pages/LandingPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/farmer",
        element: <FarmerDashboard />,
    },
    {
        path: "/seller",
        element: <SellerDashboard />,
    },
    {
        path: "/tracking",
        element: <TransportTracking />,
    },
]);
