import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Store, Leaf, ArrowLeft, Sprout, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

type Role = "farmer" | "seller" | null;

export function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [farmerMode, setFarmerMode] = useState<"selection" | "registration" | null>(null);

  const handleContinue = () => {
    if (selectedRole === "farmer") {
      navigate("/farmer");
    } else if (selectedRole === "seller") {
      navigate("/seller");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-['Outfit'] overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 transition-transform hover:scale-110 duration-300">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-r from-green-700 to-emerald-500 tracking-tight">
                VRIKSH
              </span>
              <p className="text-[10px] text-emerald-600 font-bold tracking-[0.2em] -mt-1 uppercase">SaaS 2.0</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 relative">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="w-full max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Welcome to <span className="text-green-600">VRIKSH</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
              Empowering agriculture with real-time Pathway intelligence and AI-driven precision.
            </p>
          </div>

          {/* Role Selection */}
          {selectedRole === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card
                className="p-10 cursor-pointer border-2 border-transparent bg-white/40 backdrop-blur-xl shadow-2xl hover:shadow-green-100 transition-all duration-500 rounded-[2.5rem] group relative overflow-hidden"
                onClick={() => {
                  setSelectedRole("farmer");
                  setFarmerMode("selection");
                }}
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform duration-500">
                  <Badge className="bg-green-100 text-green-700 border-none font-bold py-1 px-3">AI POWERED</Badge>
                </div>
                <div className="text-center relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 transition-transform duration-500 shadow-xl shadow-green-200">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3 group-hover:text-green-600 transition-colors uppercase tracking-tight">
                    Farmer
                  </h2>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">
                    Access smart farming tools, optimize harvests, and track real-time market data.
                  </p>
                  <div className="mt-6 flex items-center justify-center text-green-600 font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                    <span>Explore Solutions</span>
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </Card>

              <Card
                className="p-10 cursor-pointer border-2 border-transparent bg-white/40 backdrop-blur-xl shadow-2xl hover:shadow-blue-100 transition-all duration-500 rounded-[2.5rem] group relative overflow-hidden"
                onClick={() => setSelectedRole("seller")}
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform duration-500">
                  <Badge className="bg-blue-100 text-blue-700 border-none font-bold py-1 px-3">STREAMING DATA</Badge>
                </div>
                <div className="text-center relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:-rotate-6 transition-transform duration-500 shadow-xl shadow-blue-200">
                    <Store className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    Seller
                  </h2>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">
                    Connect with premium suppliers, verify quality, and manage logistics at scale.
                  </p>
                  <div className="mt-6 flex items-center justify-center text-blue-600 font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                    <span>Access Dashboard</span>
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Farmer Selection Step */}
          {selectedRole === "farmer" && farmerMode === "selection" && (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-10">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white mb-6 px-6 py-2 text-sm font-black uppercase tracking-[0.15em] border-none shadow-lg shadow-green-100 animate-pulse">VRIKSH AI POWERED SMART AGRICULTURE</Badge>
                <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">SELECT PRODUCTION PHASE</h2>
                <p className="text-gray-500 text-lg font-medium">Choose your current agricultural workflow stage</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card
                  className="p-12 cursor-pointer bg-white/60 backdrop-blur-md border border-white/50 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 rounded-[3rem] group"
                  onClick={() => {
                    const baseUrl = window.location.protocol + "//" + window.location.hostname;
                    // Proactively trigger the backend to start Pre-Prod services and open folder
                    fetch(`${baseUrl}:8000/start-pre-production`, { method: 'POST' }).catch(() => { });

                    // Small delay to let the command fire before redirecting
                    setTimeout(() => {
                      window.location.href = `${baseUrl}:3000`;
                    }, 300);
                  }}
                >
                  <div className="text-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-500">
                      <Leaf className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Pre Production</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      Soil analysis, crop selection, sowing schedules, and AI-driven weather forecasting.
                    </p>
                    <Button variant="outline" className="mt-8 border-emerald-200 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-50 px-8 h-12 transition-all">
                      Access Pre-Harvest Tools
                    </Button>
                  </div>
                </Card>

                <Card
                  className="p-12 cursor-pointer bg-white/60 backdrop-blur-md border border-white/50 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[3rem] group"
                  onClick={() => setFarmerMode("registration")}
                >
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-500">
                      <TrendingUp className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Post Production</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      Market price analysis, buyer matching, logistics tracking, and profit maximization.
                    </p>
                    <Button variant="outline" className="mt-8 border-blue-200 text-blue-700 rounded-2xl font-bold hover:bg-blue-50 px-8 h-12 transition-all">
                      Access Marketplace
                    </Button>
                  </div>
                </Card>
              </div>
              <div className="mt-12 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedRole(null);
                    setFarmerMode(null);
                  }}
                  className="text-gray-400 font-bold hover:text-gray-600 hover:bg-transparent"
                >
                  ← Back to Role Selection
                </Button>
              </div>
            </div>
          )}

          {/* Farmer Registration Form */}
          {selectedRole === "farmer" && farmerMode === "registration" && (
            <Card className="p-10 border-none bg-white/60 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3.5rem] relative overflow-hidden animate-in slide-in-from-right duration-500">
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-50/50 rounded-full -mr-40 -mt-40 blur-3xl z-0"></div>
              <div className="relative z-10">
                <div className="mb-10 flex items-center justify-between px-2">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <Sprout className="w-8 h-8 text-green-600" />
                      Farmer Registration
                    </h2>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Post Production Dashboard Access</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFarmerMode("selection")}
                    className="text-gray-400 font-bold hover:text-green-600"
                  >
                    ← Change Phase
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="farmerName" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</Label>
                    <Input id="farmerName" placeholder="Rajesh Kumar" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="farmerContact" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mobile / Email</Label>
                    <Input id="farmerContact" placeholder="+91 98XXX XXX00" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="farmLocation" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Farm Location</Label>
                    <Input id="farmLocation" placeholder="Indore, Madhya Pradesh" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="farmSize" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Farm Size (acres)</Label>
                    <Input id="farmSize" type="number" placeholder="15" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="primaryCrop" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Primary Crop</Label>
                    <Input id="primaryCrop" placeholder="Mustard / Wheat" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="irrigationType" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Irrigation Type</Label>
                    <Input id="irrigationType" placeholder="Drip Irrigation" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                </div>
                <Button
                  onClick={handleContinue}
                  className="w-full mt-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-green-100 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>ENTER POST-PRODUCTION HUB</span>
                  <ChevronRight className="w-7 h-7" />
                </Button>
              </div>
            </Card>
          )}

          {/* Seller Registration Form */}
          {selectedRole === "seller" && (
            <Card className="p-10 border-none bg-white/60 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3.5rem] relative overflow-hidden animate-in slide-in-from-left duration-500">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full -mr-40 -mt-40 blur-3xl z-0"></div>
              <div className="relative z-10">
                <div className="mb-10 flex items-center justify-between px-2">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      <Store className="w-8 h-8 text-blue-600" />
                      Seller Registration
                    </h2>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Access Pathway Demand Analytics</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRole(null)}
                    className="text-gray-400 font-bold hover:text-blue-600"
                  >
                    ← Change Role
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="orgName" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</Label>
                    <Input id="orgName" placeholder="Global Agri Trades" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="sellerContact" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contact Info</Label>
                    <Input id="sellerContact" placeholder="procurement@globalagri.com" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="marketName" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Active Market</Label>
                    <Input id="marketName" placeholder="Delhi Azadpur Mandi" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="cityState" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Operation Hub</Label>
                    <Input id="cityState" placeholder="New Delhi, India" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="preferredCrops" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Primary Commodities</Label>
                    <Input id="preferredCrops" placeholder="Mustard, Wheat, Soy" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="purchaseCapacity" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Daily Capacity (kg)</Label>
                    <Input id="purchaseCapacity" type="number" placeholder="10000" className="h-16 bg-white border-gray-100 rounded-[1.25rem] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-lg pl-6 font-semibold" />
                  </div>
                </div>
                <Button
                  onClick={handleContinue}
                  className="w-full mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-blue-100 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                >
                  <span>ENTER SELLER DASHBOARD</span>
                  <ChevronRight className="w-7 h-7" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}