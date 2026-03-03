import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { Truck, MapPin } from "lucide-react";

// Fix for default marker icons in React Leaflet
const customIcon = L.divIcon({
    html: `<div class="bg-blue-600 p-2 rounded-xl shadow-lg border-2 border-white text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
         </div>`,
    className: "custom-div-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const destinationIcon = L.divIcon({
    html: `<div class="bg-green-600 p-2 rounded-full shadow-lg border-2 border-white text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
         </div>`,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Component to handle map centering when position changes
function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, map.getZoom(), {
            duration: 1.5
        });
    }, [position, map]);
    return null;
}

export default function LiveTransportMap() {
    const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
    const [destPosition] = useState<[number, number]>([19.0760, 72.8777]); // Mumbai for demo
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosition = async () => {
            try {
                const res = await fetch("http://localhost:8000/transport-status/1");
                if (!res.ok) throw new Error("Tracking unavailable");
                const data = await res.json();
                setPosition([data.current_lat, data.current_lng]);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error("Map fetch failed", err);
                setError("Connecting to satellite...");
            }
        };

        fetchPosition();
        const interval = setInterval(fetchPosition, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-inner bg-gray-100 border border-gray-100">
            {isLoading && (
                <div className="absolute inset-0 z-[1000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Gps Synchronizing</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-orange-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-orange-700 uppercase">{error}</span>
                </div>
            )}

            <MapContainer
                center={position}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterMap position={position} />

                <Marker position={position} icon={customIcon}>
                    <Popup className="custom-popup">
                        <div className="p-2">
                            <p className="font-bold text-blue-900">Vriksh Carrier-01</p>
                            <p className="text-[10px] text-gray-500">Speed: 52 km/h</p>
                        </div>
                    </Popup>
                </Marker>

                <Marker position={destPosition} icon={destinationIcon}>
                    <Popup>
                        <div className="p-2">
                            <p className="font-bold text-green-900">Mandi Destination</p>
                            <p className="text-[10px] text-gray-500">Delhi Azadpur</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Live Truck</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full" />
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Destination</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
