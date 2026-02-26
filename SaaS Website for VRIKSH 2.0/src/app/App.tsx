import { RouterProvider } from "react-router";
import { router } from "./routes";
import { EcosystemProvider } from "./context/EcosystemContext";

export default function App() {
  return (
    <EcosystemProvider>
      <RouterProvider router={router} />
    </EcosystemProvider>
  );
}