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
  Calendar,
  MapPin,
  User,
  ChevronRight,
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
  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  // Transport Booking State
  const [bookingDetails, setBookingDetails] = useState({
    cropType: "",
    weight: "",
    from: "",
    to: "",
    date: "",
    time: ""
  });
  const [showDrivers, setShowDrivers] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const mockDrivers = [
    { id: 1, name: "Amarjeet Singh", model: "Tata Prima 4028.S", vehicle: "PB 01 AC 1234", rating: 4.8, experience: "12 years" },
    { id: 2, name: "Ramesh Yadav", model: "BharatBenz 3523R", vehicle: "HR 55 XY 5678", rating: 4.6, experience: "8 years" },
    { id: 3, name: "Suresh Kumar", model: "Mahindra Blazo X 35", vehicle: "DH 02 B 9012", rating: 4.9, experience: "15 years" },
    { id: 4, name: "Baljit Singh", model: "Ashok Leyland Ecomet", vehicle: "UP 14 TR 3456", rating: 4.5, experience: "5 years" },
  ];

  const handleBookTransport = () => {
    setShowDrivers(true);
  };

  const handleSelectDriver = (driver: any) => {
    setSelectedDriver(driver);
    // You could also add the order to the ecosystem context here if needed
  };

  const [riskAlert, setRiskAlert] = useState<string | null>(null);

  const fetchData = async (currentCrop: string) => {
    setIsLoading(true);
    setRiskAlert(null);
    try {
      // Find harvest ID from the crop name
      let harvestId = 1;
      const lowerCrop = currentCrop.toLowerCase();
      if (lowerCrop.includes("mustard")) harvestId = 1;
      else if (lowerCrop.includes("wheat")) harvestId = 2;
      else if (lowerCrop.includes("rice")) harvestId = 3;
      else if (lowerCrop.includes("cotton")) harvestId = 4;
      else if (lowerCrop.includes("cabbage")) harvestId = 5;
      else harvestId = 1;

      const fbMarket = await api.getBestMarket(harvestId);
      const fbRisk = await api.getRisk(harvestId);
      setBestMarket(fbMarket);
      setRiskData(fbRisk);

      if (fbRisk.total_risk > 40) {
        setRiskAlert(`⚠️ Warning: High volatility detected for ${currentCrop}. Consider insuring this shipment.`);
      }

      // Fetch live market data from the Hub with specific crop filter
      const mResponse = await fetch(`http://localhost:5005/market-prices?crop=${currentCrop.trim()}`);
      const mPrices = await mResponse.json();
      setMarketPrices(mPrices);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(crop);

    // Poll for updates every 10 seconds (SaaS style live updates)
    const interval = setInterval(() => {
      fetchData(crop);
    }, 10000);
    return () => clearInterval(interval);
  }, [crop]); // Reload and re-poll when crop selection changes

  const myOrders = orders.filter((order) => order.farmerName === "Rajesh Kumar");

  // Filter top 3 mandis for current crop selection
  const filteredMarkets = marketPrices
    .filter((m: any) => m.crop.toLowerCase().includes(crop.toLowerCase()))
    .sort((a: any, b: any) => b.price - a.price)
    .slice(0, 3)
    .map((m: any, i: number) => ({
      name: m.market,
      price: m.price,
      recommended: i === 0 && (bestMarket?.best_market === m.market)
    }));

  const displayMarkets = filteredMarkets.length > 0 ? filteredMarkets : [
    { name: `No live Mandi price yet for "${crop}"`, price: 0, recommended: false },
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
                  <Button onClick={() => {
                    fetchData(crop);
                  }} className="w-full bg-green-600 hover:bg-green-700">
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
                    {displayMarkets.map((market, index) => (
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

            {/* Book Transportation Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Book Transportation
              </h2>
              {!showDrivers ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="book-crop">Crop Type</Label>
                      <Input
                        id="book-crop"
                        placeholder="e.g. Wheat, Rice"
                        value={bookingDetails.cropType}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, cropType: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="book-weight">Weight (Tons)</Label>
                      <Input
                        id="book-weight"
                        type="number"
                        placeholder="e.g. 5"
                        value={bookingDetails.weight}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, weight: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="book-from">From (Location)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="book-from"
                          className="pl-9"
                          placeholder="Pickup Location"
                          value={bookingDetails.from}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, from: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="book-to">To (Destination)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="book-to"
                          className="pl-9"
                          placeholder="Drop-off Location"
                          value={bookingDetails.to}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, to: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="book-date">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="book-date"
                          type="date"
                          className="pl-9"
                          value={bookingDetails.date}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="book-time">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="book-time"
                          type="time"
                          className="pl-9"
                          value={bookingDetails.time}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 h-11 text-base font-semibold"
                    onClick={handleBookTransport}
                  >
                    Find Available Trucks
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Available Truck Drivers for {bookingDetails.cropType || "your crops"}</p>
                    <Button
                      variant="link"
                      className="text-green-600 p-0 h-auto font-bold"
                      onClick={() => { setShowDrivers(false); setSelectedDriver(null); }}
                    >
                      Change Search
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {mockDrivers.map((driver) => (
                      <div
                        key={driver.id}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedDriver?.id === driver.id
                          ? "border-green-600 bg-green-50 shadow-md"
                          : "border-gray-100 bg-white hover:border-green-200"
                          }`}
                        onClick={() => handleSelectDriver(driver)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{driver.name}</h3>
                              <Badge className="bg-yellow-100 text-yellow-800 border-none text-[10px] h-4">★ {driver.rating}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              {driver.model} • <span className="text-blue-600 uppercase font-bold">{driver.vehicle}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{driver.experience} experience</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedDriver?.id === driver.id ? "default" : "outline"}
                          className={selectedDriver?.id === driver.id ? "bg-green-600" : "text-green-600 border-green-200"}
                        >
                          {selectedDriver?.id === driver.id ? "Selected" : "Select Truck"}
                        </Button>
                      </div>
                    ))}
                  </div>
                  {selectedDriver && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg">
                        Confirm Booking with {selectedDriver.name.split(' ')[0]}
                      </Button>
                    </div>
                  )}
                </div>
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
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge className={`${getRiskColor(riskData?.total_risk || 0)} text-sm px-4 py-1 border-none`}>
                      {getRiskLabel(riskData?.total_risk || 0)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600 bg-blue-50">
                      AI Confidence: {Math.round((riskData?.confidence_score || 0.95) * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    {riskData?.total_risk > 70
                      ? "High caution advised for immediate sale"
                      : riskData?.total_risk > 40
                        ? "Moderate volatility detected in market"
                        : "Favorable conditions for maximizing profit"}
                  </p>
                  {bestMarket && (
                    <p className="text-xs font-bold text-green-600 mt-2 uppercase tracking-tight">
                      Est. Profit: ₹{Math.round(bestMarket.max_profit)}
                    </p>
                  )}
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
                {riskAlert && (
                  <div className="p-3 rounded-lg border bg-red-50 border-red-200 animate-pulse">
                    <p className="text-sm text-red-900 font-bold">{riskAlert}</p>
                    <p className="text-[10px] text-red-600 mt-1 uppercase tracking-wider font-black">Pathway Engine Alert</p>
                  </div>
                )}
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