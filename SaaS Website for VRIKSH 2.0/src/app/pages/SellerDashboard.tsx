import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Store,
  Truck,
  AlertCircle,
  Clock,
  CheckCircle,
  Package,
  LogOut,
  Leaf,
  Sprout,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { useEcosystem } from "../context/EcosystemContext";
import { api } from "../services/api";

export function SellerDashboard() {
  const navigate = useNavigate();
  const { orders, markAsReceived } = useEcosystem();
  const [riskData, setRiskData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRisk() {
      try {
        const data = await api.getRisk(1); // Demo for harvest 1
        setRiskData(data);
      } catch (e) {
        console.error("Risk fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRisk();
    const interval = setInterval(fetchRisk, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-600 bg-green-100";
    if (score < 60) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low";
    if (score < 60) return "Medium";
    return "High";
  };

  const getQualityColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-100 text-green-700";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  VRIKSH
                </h1>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected to Pathway Engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">
                  Delhi Azadpur Mandi
                </p>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100">
                  Verified Buyer
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
            </div>
          )}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Incoming Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {orders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Received Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {orders.filter((o) => o.isReceived).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">In Transit</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {orders.filter((o) => !o.isReceived).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Volume</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {(orders.reduce((sum, o) => sum + o.quantity, 0) / 100).toFixed(1)}
                  <span className="text-sm text-gray-600 ml-1">quintals</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Incoming Crop Orders */}
        <Card className="p-6 mb-8 relative border-gray-200 shadow-sm">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 rounded-lg flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Live Incoming Crop Orders
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Risk Assessment
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-100 transition-colors ${order.isReceived ? "bg-green-50/50" : "hover:bg-gray-50/80"
                      }`}
                  >
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                          {order.farmerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.farmerName}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {order.farmLocation}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="font-semibold text-gray-700 bg-white">
                        {order.crop}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                      {order.quantity} kg
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getQualityColor(order.qualityGrade)} border-none shadow-sm`}>
                        Grade {order.qualityGrade}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getRiskColor(riskData?.total_risk || order.riskScore)} border-none shadow-sm`}>
                          {getRiskLabel(riskData?.total_risk || order.riskScore)} Risk
                        </Badge>
                        <span className="text-xs font-medium text-gray-500">
                          {Math.round(riskData?.total_risk || order.riskScore)}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {order.isReceived ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
                            <Truck className={`w-4 h-4 ${order.delay > 0 ? '' : 'animate-bounce'}`} />
                            {order.transportStatus}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Checkbox
                        checked={order.isReceived}
                        onCheckedChange={() => markAsReceived(order.id)}
                        id={`received-${order.id}`}
                        className="w-5 h-5 border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Transport & Quality Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transport Details */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Live Transport Tracking
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                onClick={() => navigate("/tracking")}
              >
                Open Live Dashboard
              </Button>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border ${order.isReceived
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        {order.id} - {order.crop}
                        {order.isReceived && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        From: {order.farmLocation}
                      </p>
                    </div>
                    <Badge
                      className={
                        order.delay > 0
                          ? "bg-orange-100 text-orange-700"
                          : order.isReceived
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }
                    >
                      {order.isReceived ? "Delivered" : order.transportStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {order.isReceived ? "Arrived" : order.eta}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.isReceived ? "Delivered" : order.transportStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delay</p>
                      <p
                        className={`text-sm font-medium ${order.delay > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                      >
                        {order.delay > 0 ? `+${order.delay} min` : "On Time"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quality & Risk Analysis */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Quality & Risk Analysis
            </h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border ${order.isReceived
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {order.id} - {order.crop}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.quantity} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getQualityColor(order.qualityGrade)}>
                        Grade {order.qualityGrade}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${order.riskScore < 30
                              ? "bg-green-500"
                              : order.riskScore < 60
                                ? "bg-orange-500"
                                : "bg-red-500"
                              }`}
                            style={{ width: `${order.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {order.riskScore}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price/kg</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{(order.price / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {order.isReceived && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Crop received and verified
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to Use
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
            <li>
              Monitor incoming crop orders in real-time with transport tracking
            </li>
            <li>
              Check quality grades and risk indicators before receiving crops
            </li>
            <li>
              Mark crops as "Received" by checking the box in the orders table
            </li>
            <li>
              When you mark an order as received, the farmer will automatically
              get a confirmation notification
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}