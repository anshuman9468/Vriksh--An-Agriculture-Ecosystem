import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    Truck,
    MapPin,
    Clock,
    Navigation,
    ArrowLeft,
    ShieldCheck,
    AlertTriangle,
    Zap,
    Gauge,
    Activity,
    ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { api } from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import LiveTransportMap from "../components/LiveTransportMap";

export function TransportTracking() {
    const navigate = useNavigate();
    const [trackingData, setTrackingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTracking = async () => {
        try {
            const data = await api.getTransportStatus(1); // Demo ID
            setTrackingData(data);
            setError(null);
        } catch (err) {
            console.error("Tracking fetch failed", err);
            if (!trackingData) {
                setError("Connecting to Live Stream...");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTracking();
        const interval = setInterval(fetchTracking, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return "text-green-500";
        if (score >= 0.5) return "text-orange-500";
        return "text-red-500";
    };

    const getConfidenceLabel = (score: number) => {
        if (score >= 0.8) return "High Confidence (Real GPS)";
        if (score >= 0.5) return "Medium Confidence (Semi-Predictive)";
        return "Low Confidence (Full Prediction)";
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Premium Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/seller")}
                            className="rounded-full hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-600" />
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Live Transport Intelligence</h1>
                            </div>
                            <p className="text-xs text-gray-500 font-medium ml-7">System ID: V-TR-2026-001</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Pathway Powered Live Stream</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                            Driver: Ravi Kumar (D-99)
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Live Status & Map */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Live Indicator Card */}
                        <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-gray-900 to-slate-800 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Navigation className="w-32 h-32 rotate-45" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4 px-3 py-1">
                                        Current Status: {trackingData?.status || "IN TRANSIT"}
                                    </Badge>
                                    <h2 className="text-3xl font-bold mb-2">Heading to Delhi Mandi</h2>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">Current Lat: {trackingData?.current_lat?.toFixed(4) || "28.6139"}, Lng: {trackingData?.current_lng?.toFixed(4) || "77.2090"}</span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[200px] text-center">
                                    <p className="text-gray-400 text-xs font-medium uppercase mb-1">Estimated Arrival</p>
                                    <p className="text-4xl font-black text-blue-400">
                                        {(() => {
                                            const etaDate = trackingData?.eta ? new Date(trackingData.eta) : null;
                                            return etaDate && !isNaN(etaDate.getTime())
                                                ? etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : "Calculating...";
                                        })()}
                                    </p>
                                    <div className="flex items-center justify-center gap-1 mt-2 text-green-400 text-xs font-bold">
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span>STRICT SCHEDULE</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Live Map Module */}
                        <Card className="p-0 border-0 shadow-lg overflow-hidden bg-white h-[500px] relative rounded-3xl">
                            <LiveTransportMap />

                            {/* Tracking Controls Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 z-[1000] flex gap-4">
                                <div className="flex-1 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Navigation className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Route Progress</span>
                                            <span className="text-sm font-black text-gray-900">142 / 210 km</span>
                                        </div>
                                        <Progress value={67} className="h-2 bg-gray-100" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* Right Column: AI Analytics & Intelligence */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Intelligence Engine Card */}
                        <Card className="p-6 border-0 shadow-sm bg-white overflow-hidden group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:rotate-12 transition-transform">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-gray-900">Intelligence Metrics</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Confidence Score */}
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Input Confidence</span>
                                        <span className={`text-sm font-black ${getConfidenceColor(trackingData?.confidence_score || 0.9)}`}>
                                            {(trackingData?.confidence_score * 100 || 90).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-1.5 mb-3">
                                        <div className={`flex-1 rounded-full ${trackingData?.confidence_score >= 0.3 ? 'bg-red-500' : 'bg-gray-200'}`} />
                                        <div className={`flex-1 rounded-full ${trackingData?.confidence_score >= 0.6 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                        <div className={`flex-1 rounded-full ${trackingData?.confidence_score >= 0.8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-medium">
                                        {getConfidenceLabel(trackingData?.confidence_score || 0.9)}
                                    </p>
                                </div>

                                {/* Delay Prediction */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Delay Prediction</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {trackingData?.delay_minutes > 0 ? `+${trackingData.delay_minutes} Minutes` : "On Time"}
                                            </p>
                                        </div>
                                    </div>
                                    {trackingData?.delay_minutes > 15 ? (
                                        <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                    ) : (
                                        <ShieldCheck className="w-5 h-5 text-green-500" />
                                    )}
                                </div>

                                {/* Pathway Tracking Mode */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-blue-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                            <Gauge className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-blue-400 uppercase leading-none mb-1">Tracking Mode</p>
                                            <p className="text-sm font-bold text-blue-900">
                                                {trackingData?.tracking_mode || "REAL-TIME"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-0.5 bg-blue-600 text-[8px] font-bold text-white rounded">AUTO</div>
                                </div>
                            </div>
                        </Card>

                        {/* Weather & Road Condition Info */}
                        <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                En-route Conditions
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-3 rounded-xl">
                                    <p className="text-[10px] text-blue-100 mb-1">Weather</p>
                                    <p className="text-sm font-bold">Clear Sky</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl">
                                    <p className="text-[10px] text-blue-100 mb-1">Traffic</p>
                                    <p className="text-sm font-bold">Moderate</p>
                                </div>
                            </div>
                            <Button className="w-full mt-6 bg-white text-blue-600 hover:bg-blue-50 border-0 font-bold uppercase text-[10px] tracking-wider">
                                Generate Driver Alert
                            </Button>
                        </Card>

                    </div>
                </div>
            </main>

            {/* Real-time Ticker */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network Status</span>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? 'bg-green-400' : 'bg-gray-200'}`} />)}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-500">Last Synced: {new Date().toLocaleTimeString()}</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
            </footer>
        </div>
    );
}
