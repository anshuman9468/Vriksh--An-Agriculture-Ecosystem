import React, { useState, useEffect } from 'react';
import {
    Cloud, Thermometer, Wind, AlertTriangle, FileText,
    MapPin, Search, Loader2, Waves, Sprout,
    Calendar, ArrowRight, Sun, Droplets, Navigation,
    TrendingUp, Info, MousePointer2, RefreshCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Line, ComposedChart, Bar,
    PieChart, Pie, Cell, BarChart
} from 'recharts';

interface FarmAnalysisProps {
    language: 'en' | 'hi';
}

export default function FarmAnalysis({ language }: FarmAnalysisProps) {
    const [region, setRegion] = useState("New Delhi");
    const [searchInput, setSearchInput] = useState("New Delhi");
    const [lat, setLat] = useState(28.6139);
    const [lon, setLon] = useState(77.2090);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [cropSuitability, setCropSuitability] = useState<any[]>([]);
    const [tempDist, setTempDist] = useState<any[]>([]);
    const [summary, setSummary] = useState("");
    const [report, setReport] = useState("");

    // Auto-run analysis when coordinates or region change
    useEffect(() => {
        runAnalysis();
    }, [lat, lon, region]);

    const fetchLocation = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            if (data.latitude && data.longitude) {
                setLat(data.latitude);
                setLon(data.longitude);
                setRegion(data.city || "Detected Farm");
                setSearchInput(data.city || "Detected Farm");
            }
        } catch (error) {
            console.error("Location fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Attempt to geocode when search input changes (debounced)
    useEffect(() => {
        if (!searchInput || searchInput.length < 3) return;

        setIsGeocoding(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const first = data[0];
                    setLat(parseFloat(first.lat));
                    setLon(parseFloat(first.lon));
                    setRegion(first.display_name.split(',')[0]);
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            } finally {
                setIsGeocoding(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const runAnalysis = async () => {
        if (isLoading) return; // Prevent multiple simultaneous requests

        setIsLoading(true);
        setError(null);
        // Clear previous results to avoid showing stale data during loading
        setInsights([]);
        setHistory([]);
        setCropSuitability([]);
        setTempDist([]);
        setSummary("");
        setReport("");

        try {
            // 20s timeout for deep history + satellite telemetry
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const backendUrl = `http://${window.location.hostname}:5001/farm-analytics?lat=${lat}&lon=${lon}&region=${encodeURIComponent(region)}`;

            const response = await fetch(backendUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: "Server disconnected" }));
                throw new Error(errData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            setInsights(data.insights || []);
            setHistory(data.weather_data || []);
            setCropSuitability(data.crop_suitability || []);
            setTempDist(data.temp_distribution || []);
            setSummary(data.summary || "");
            setReport(data.report || "");

            // Update region name if backend (via coordinates) detected one
            if (data.region && (region === "New Delhi" || region === "" || region === "Detected Farm")) {
                setRegion(data.region);
            }

        } catch (error: any) {
            console.error("Analysis failed", error);
            setError(error.name === 'AbortError' ? "Request timed out" : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
            weekday: 'short', day: 'numeric', month: 'short'
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-700">

            {/* Minimal Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-xs">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">Live Agriculture Feed</Badge>
                        <span>• Precise Local Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        {language === 'en' ? 'Farm Outlook' : 'खेत का दृष्टिकोण'}
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl">
                        {summary || (language === 'en' ? "Predictive weather modeling for optimized irrigation and harvest planning." : "अनुकूलित सिंचाई और कटाई योजना के लिए पूर्वानुमानित मौसम मॉडलिंग।")}
                    </p>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <div className="px-4 py-2 border-r border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Region</p>
                        <p className="text-sm font-bold text-gray-800">{region}</p>
                    </div>
                    <div className="px-4 py-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Coordinates</p>
                        <p className="text-sm font-bold text-gray-800">{lat.toFixed(2)}, {lon.toFixed(2)}</p>
                    </div>
                    <Button onClick={fetchLocation} variant="ghost" className="h-full rounded-xl hover:bg-white px-3">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Controls - Refined & Discrete */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">Location Search</Label>
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                                            {isGeocoding ? (
                                                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                            ) : (
                                                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                            )}
                                        </div>
                                        <Input
                                            placeholder="Enter location name..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 h-12 pl-10 text-sm font-semibold transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Satellite Lock</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black border-none text-emerald-600 bg-emerald-50 px-2 py-0.5">
                                            {lat.toFixed(3)}, {lon.toFixed(3)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={runAnalysis}
                            disabled={isLoading}
                            className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold transition-all shadow-lg"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCcw className="mr-2 w-4 h-4" />}
                            {language === 'en' ? 'Recalculate' : 'पुनर्गणना'}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-5 rounded-[1.5rem] bg-rose-50 border border-rose-100 flex gap-4 items-center">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-rose-400 uppercase">Analysis Status</p>
                                <p className="text-sm font-bold text-rose-700 leading-tight">{error}</p>
                            </div>
                        </div>
                    )}

                    {isLoading && !error && (
                        <div className="p-5 rounded-[1.5rem] bg-emerald-50 border border-emerald-100 flex gap-4 items-center animate-pulse">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase">Status</p>
                                <p className="text-sm font-bold text-emerald-700 leading-tight">Computing Satellite Insights...</p>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-emerald-900 rounded-[2rem] text-white space-y-4">
                        <div className="p-2 bg-white/10 rounded-xl w-fit">
                            <Info className="w-5 h-5 text-emerald-200" />
                        </div>
                        <p className="text-sm font-medium text-emerald-100">
                            Analytics are based on global satellite telemetry and local weather models.
                        </p>
                    </div>
                </div>

                {/* Right Content - Clean Visualization */}
                <div className="lg:col-span-9 space-y-12">

                    {insights.length > 0 ? (
                        <>
                            {/* Forecast Chart - High Contrast & Crisp */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <TrendingUp className="text-gray-400 w-5 h-5" />
                                        {language === 'en' ? 'Temperature & Rainfall Trend' : 'तापमान और वर्षा का रुझान'}
                                    </h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Max Temp</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">Rainfall</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[350px] w-full mt-4 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                                    <div className="absolute top-2 right-2 z-10 text-[9px] font-bold text-gray-400">
                                        Data: {insights.length} pts
                                    </div>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart
                                            key={`main-v3-${insights.length}`}
                                            data={insights}
                                            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => {
                                                    try {
                                                        const d = new Date(str);
                                                        return isNaN(d.getTime()) ? str : (d.getMonth() + 1) + "/" + d.getDate();
                                                    } catch { return str; }
                                                }}
                                                fontSize={11}
                                                tick={{ fill: '#64748b' }}
                                            />
                                            <YAxis
                                                fontSize={11}
                                                tick={{ fill: '#64748b' }}
                                            />
                                            <Tooltip />
                                            <Area
                                                type="monotone"
                                                dataKey="tmax"
                                                stroke="#10b981"
                                                fill="#10b981"
                                                fillOpacity={0.2}
                                                isAnimationActive={false}
                                                dot={{ r: 3 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="rain"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.2}
                                                isAnimationActive={false}
                                                dot={{ r: 3 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Historical Trend Chart - New 'Plotting' */}
                            {history.length > 0 && (
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                            <Calendar className="text-gray-400 w-5 h-5" />
                                            {language === 'en' ? 'Historical 1-Year Trend' : 'ऐतिहासिक 1-वर्ष का रुझान'}
                                        </h3>
                                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                            365 Days of Satellite Data
                                        </Badge>
                                    </div>
                                    <div className="h-[300px] w-full mt-4 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                                        <div className="absolute top-2 right-2 z-10 text-[9px] font-bold text-gray-400">
                                            Points: {history.length}
                                        </div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart
                                                key={`hist-v3-${history.length}`}
                                                data={history.filter((_, i) => i % 10 === 0)}
                                                margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(str) => {
                                                        const d = new Date(str);
                                                        return isNaN(d.getTime()) ? str : d.toLocaleDateString(undefined, { month: 'short' });
                                                    }}
                                                    fontSize={10}
                                                />
                                                <YAxis fontSize={10} />
                                                <Tooltip />
                                                <Area
                                                    type="monotone"
                                                    dataKey="tmax"
                                                    stroke="#64748b"
                                                    fill="#64748b"
                                                    fillOpacity={0.1}
                                                    isAnimationActive={false}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="rain"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.1}
                                                    isAnimationActive={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Insights - Plottings */}
                            {(cropSuitability.length > 0 || tempDist.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Crop Suitability */}
                                    {cropSuitability.length > 0 && (
                                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                <Sprout className="w-4 h-4 text-emerald-500" />
                                                Crop Suitability
                                            </h3>
                                            <div className="h-[250px] w-full bg-gray-50 rounded-xl">
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <PieChart key={`pie-${cropSuitability.length}`}>
                                                        <Pie
                                                            data={cropSuitability}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            isAnimationActive={false}
                                                        >
                                                            {cropSuitability.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend verticalAlign="bottom" height={36} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}

                                    {/* Temperature Distribution */}
                                    {tempDist.length > 0 && (
                                        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                <Thermometer className="w-4 h-4 text-rose-500" />
                                                Temperature Dist.
                                            </h3>
                                            <div className="h-[250px] w-full bg-gray-50 rounded-xl">
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <BarChart
                                                        key={`bar-${tempDist.length}`}
                                                        layout="vertical"
                                                        data={tempDist}
                                                        margin={{ left: 10, right: 30 }}
                                                    >
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700 }} width={60} />
                                                        <Tooltip />
                                                        <Bar
                                                            dataKey="value"
                                                            fill="#fb7185"
                                                            radius={[0, 4, 4, 0]}
                                                            barSize={20}
                                                            isAnimationActive={false}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Strategic Intelligence Report Section */}
                            {report && (
                                <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-emerald-50/50 px-8 py-5 border-b border-emerald-100 flex items-center justify-between">
                                        <h3 className="text-emerald-900 font-bold flex items-center gap-3">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-emerald-200">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            Strategic Intelligence Log
                                        </h3>
                                        <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700 uppercase text-[10px] font-black">Verified Satellite Data</Badge>
                                    </div>
                                    <div className="p-10 bg-gray-50/10">
                                        <div className="space-y-6 whitespace-pre-wrap font-medium leading-[1.8] text-[15px]">
                                            {report.split('\n').filter(l => l.trim()).map((line, idx) => {
                                                const isHeader = line.startsWith('🌾') || line.startsWith('📊') || line.startsWith('🔮') || line.startsWith('⚠️') || line.startsWith('🌊') || line.startsWith('✅') || line.startsWith('💡');
                                                return (
                                                    <div key={idx} className={isHeader ? "text-emerald-900 font-bold text-lg mt-4" : "pl-6 text-gray-500"}>
                                                        {line.replace(/\*\*/g, '').replace(/###/g, '')}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Plan Grid */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {language === 'en' ? 'Next 16 Days Tactical Plan' : 'अगले 16 दिनों की सामरिक योजना'}
                                    </h3>
                                    <Badge variant="outline" className="rounded-full px-4 border-gray-200 text-gray-500">
                                        {insights.length} Days Computed
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {insights.map((day) => (
                                        <div key={day.id} className="bg-white rounded-[2rem] border border-gray-100 p-5 group hover:border-emerald-200 transition-all shadow-sm hover:shadow-md cursor-default">
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-xs font-black text-gray-900">{formatDate(day.date)}</p>
                                                <div className={`w-2 h-2 rounded-full ${day.color === 'green' ? 'bg-emerald-500' :
                                                    day.color === 'blue' ? 'bg-blue-500' :
                                                        day.color === 'orange' ? 'bg-orange-400' : 'bg-rose-500'
                                                    }`} />
                                            </div>

                                            <div className="flex items-end justify-between mb-4">
                                                <div className="space-y-1">
                                                    <p className="text-2xl font-black text-gray-900">{day.tmax}°</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Peak Temp</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-blue-600">{day.rain}mm</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Rain</p>
                                                </div>
                                            </div>

                                            <div className={`mt-2 py-2.5 px-3 rounded-xl text-[10px] font-black text-center border uppercase tracking-tight ${day.color === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                day.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    day.color === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {day.action}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-6 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                            <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50">
                                <Sun className="w-16 h-16 text-emerald-500 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">Ready to Compute Outlook</h3>
                                <p className="text-gray-400 max-w-xs mx-auto">Click Recalculate to generate real-time daily insights for your farm coordinates.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
