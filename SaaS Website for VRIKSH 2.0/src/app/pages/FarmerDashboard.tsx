import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Leaf,
  TrendingUp,
  Truck,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Sprout,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useEcosystem } from "../context/EcosystemContext";
import { api } from "../services/api";

export function FarmerDashboard() {
  const navigate = useNavigate();
  const { orders, farmerNotifications } = useEcosystem();
  const [crop, setCrop] = useState("Mustard");
  const [quantity, setQuantity] = useState("500");
  const [isLoading, setIsLoading] = useState(true);
  const [bestMarket, setBestMarket] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // We use harvest_id 1 for this demo user
        const market = await api.getBestMarket(1);
        const risk = await api.getRisk(1);
        setBestMarket(market);
        setRiskData(risk);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Poll for updates every 10 seconds (SaaS style live updates)
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const myOrders = orders.filter((order) => order.farmerName === "Rajesh Kumar");

  const markets = bestMarket ? [
    { name: bestMarket.best_market, price: Math.round(bestMarket.max_profit / (parseInt(quantity) / 100 || 1)), recommended: true },
    { name: "Chandigarh Grain Market", price: 2080, recommended: false },
    { name: "Amritsar APMC", price: 2020, recommended: false },
  ] : [
    { name: "Fetching...", price: 0, recommended: false },
  ];

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-600 bg-green-100";
    if (score < 60) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low Risk";
    if (score < 60) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Market Ticker */}
      <div className="bg-gray-900 text-white overflow-hidden py-1.5 border-b border-gray-800">
        <div className="flex gap-12 animate-marquee whitespace-nowrap px-6">
          <span className="text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            LIVE MANDI FEED:
          </span>
          <span className="text-xs font-medium">Wheat (Delhi): ₹2,150 <span className="text-green-400">▲ +1.2%</span></span>
          <span className="text-xs font-medium">Wheat (Mumbai): ₹2,280 <span className="text-green-400">▲ +0.8%</span></span>
          <span className="text-xs font-medium">Wheat (Kolkata): ₹2,210 <span className="text-red-400">▼ -0.3%</span></span>
          <span className="text-xs font-medium opacity-50">|</span>
          <span className="text-xs font-medium text-green-400">● Pathway AI: Optimal market found for harvest #1</span>
          {/* Duplicate for loop */}
          <span className="text-xs font-medium">Wheat (Delhi): ₹2,150 <span className="text-green-400">▲ +1.2%</span></span>
          <span className="text-xs font-medium">Wheat (Mumbai): ₹2,280 <span className="text-green-400">▲ +0.8%</span></span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg shadow-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  VRIKSH <span className="text-green-600 text-xs font-black align-top ml-1">SaaS</span>
                </h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Intelligence Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900">
                  Rajesh Kumar
                </p>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wider text-green-700 bg-green-50 border-green-200">
                  Platinum Seller
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crop Input Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Plan Your Crop Sale
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="crop">Crop Type</Label>
                  <Input
                    id="crop"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Get Price Analysis
                  </Button>
                </div>
              </div>
            </Card>

            {/* Market Price Comparison */}
            <Card className="p-6 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Market Price Intelligence
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Market
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Price (₹/quintal)
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {markets.map((market, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${market.recommended ? "bg-green-50" : ""
                          }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">
                              {market.name}
                            </span>
                            {market.recommended && (
                              <Badge className="bg-green-600 text-white text-xs border-none">
                                Best Price
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{market.price}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {market.recommended ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bestMarket && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    💡 <span className="font-medium">AI Recommendation:</span>{" "}
                    The Pathway engine suggests selling to <span className="font-bold">{bestMarket.best_market}</span> for maximum profit.
                    Estimated Net Profit: <span className="font-bold text-green-700">₹{Math.round(bestMarket.max_profit)}</span>
                  </p>
                </div>
              )}
            </Card>

            {/* Transport Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Active Shipments
              </h2>
              {myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {order.crop} Shipment
                          </h3>
                          <p className="text-sm text-gray-600">
                            To: {order.market}
                          </p>
                        </div>
                        <Badge
                          className={
                            order.delay > 0
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {order.transportStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">ETA</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {order.eta}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vehicle Status</p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.transportStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Delay</p>
                          <p
                            className={`text-sm font-medium ${order.delay > 0
                              ? "text-orange-600"
                              : "text-green-600"
                              }`}
                          >
                            {order.delay > 0 ? `+${order.delay} min` : "On Time"}
                          </p>
                        </div>
                      </div>
                      {order.isReceived && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-900 font-medium">
                            Crop received successfully by seller
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No active shipments
                </p>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Risk Score */}
            <Card className="p-6 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Live Risk Intelligence
              </h2>
              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke={riskData?.total_risk > 70 ? "#ef4444" : riskData?.total_risk > 40 ? "#fb923c" : "#10b981"}
                      strokeWidth="12"
                      strokeDasharray={`${(Math.min(riskData?.total_risk || 0, 100) / 100) * 352} 352`}
                      transform="rotate(-90 64 64)"
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-gray-900">
                      {Math.round(riskData?.total_risk || 0)}
                    </span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Badge className={`${getRiskColor(riskData?.total_risk || 0)} text-sm px-4 py-1 border-none`}>
                    {getRiskLabel(riskData?.total_risk || 0)}
                  </Badge>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    {riskData?.total_risk > 70
                      ? "High caution advised for immediate sale"
                      : riskData?.total_risk > 40
                        ? "Moderate volatility detected in market"
                        : "Favorable conditions for maximizing profit"}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Margin Risk</span>
                    <span className={riskData?.margin_risk > 50 ? "text-red-600" : "text-green-600"}>
                      {Math.round(riskData?.margin_risk || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(riskData?.margin_risk || 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Market Volatility</span>
                    <span className={riskData?.volatility_risk > 30 ? "text-orange-600" : "text-green-600"}>
                      {Math.round(riskData?.volatility_risk || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(riskData?.volatility_risk || 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Transport Risk</span>
                    <span className={riskData?.transport_risk > 20 ? "text-blue-600" : "text-green-600"}>
                      {Math.round(riskData?.transport_risk || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(riskData?.transport_risk || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Live Alerts
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {farmerNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${notification.type === "success"
                      ? "bg-green-50 border-green-200"
                      : notification.type === "warning"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-blue-50 border-blue-200"
                      }`}
                  >
                    <p
                      className={`text-sm ${notification.type === "success"
                        ? "text-green-900"
                        : notification.type === "warning"
                          ? "text-orange-900"
                          : "text-blue-900"
                        }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}