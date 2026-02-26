import { useEffect } from "react";
import { Activity } from "lucide-react";

export function PreProduction() {
    useEffect(() => {
        // Redirect to the standalone platform on port 3000
        // We use window.location to ensure we hit the other dev server
        const port3000Url = window.location.protocol + "//" + window.location.hostname + ":3000";
        window.location.href = port3000Url;
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-['Outfit'] overflow-x-hidden flex items-center justify-center">
            <div className="text-center">
                <Activity className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tighter">
                    VRIKSH AI: DECODING SOIL INTELLIGENCE...
                </h2>
                <p className="mt-4 text-emerald-500/60 font-medium tracking-widest uppercase text-xs"> Bridging real-time agricultural telemetry </p>
            </div>
        </div>
    );
}
