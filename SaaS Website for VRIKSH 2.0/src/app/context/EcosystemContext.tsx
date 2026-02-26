import { createContext, useContext, useState, ReactNode } from "react";

export interface CropOrder {
  id: string;
  farmerName: string;
  crop: string;
  quantity: number;
  farmLocation: string;
  market: string;
  price: number;
  transportStatus: string;
  eta: string;
  delay: number;
  qualityGrade: string;
  riskScore: number;
  isReceived: boolean;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  type: "success" | "warning" | "info";
}

interface EcosystemContextType {
  orders: CropOrder[];
  farmerNotifications: Notification[];
  addOrder: (order: CropOrder) => void;
  markAsReceived: (orderId: string) => void;
}

const EcosystemContext = createContext<EcosystemContextType | undefined>(
  undefined
);

export function EcosystemProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<CropOrder[]>([
    {
      id: "ORD001",
      farmerName: "Rajesh Kumar",
      crop: "Wheat",
      quantity: 500,
      farmLocation: "Ludhiana, Punjab",
      market: "Delhi Azadpur Mandi",
      price: 2150,
      transportStatus: "In Transit",
      eta: "2 hours",
      delay: 0,
      qualityGrade: "A",
      riskScore: 15,
      isReceived: false,
    },
    {
      id: "ORD002",
      farmerName: "Suresh Patil",
      crop: "Rice",
      quantity: 800,
      farmLocation: "Nashik, Maharashtra",
      market: "Mumbai APMC",
      price: 1850,
      transportStatus: "Delayed",
      eta: "4 hours",
      delay: 45,
      qualityGrade: "B+",
      riskScore: 42,
      isReceived: false,
    },
  ]);

  const [farmerNotifications, setFarmerNotifications] = useState<
    Notification[]
  >([
    {
      id: "N001",
      message: "Your crop shipment is in transit. ETA: 2 hours",
      timestamp: new Date(),
      type: "info",
    },
  ]);

  const addOrder = (order: CropOrder) => {
    setOrders((prev) => [...prev, order]);
  };

  const markAsReceived = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, isReceived: true } : order
      )
    );

    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const notification: Notification = {
        id: `N${Date.now()}`,
        message: `✓ Your ${order.crop} shipment to ${order.market} has been received successfully by the seller`,
        timestamp: new Date(),
        type: "success",
      };
      setFarmerNotifications((prev) => [notification, ...prev]);
    }
  };

  return (
    <EcosystemContext.Provider
      value={{ orders, farmerNotifications, addOrder, markAsReceived }}
    >
      {children}
    </EcosystemContext.Provider>
  );
}

export function useEcosystem() {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error("useEcosystem must be used within EcosystemProvider");
  }
  return context;
}
