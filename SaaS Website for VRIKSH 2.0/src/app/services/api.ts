const BASE_URL = "http://localhost:8000";

export const api = {
    getBestMarket: async (harvestId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/best-market/${harvestId}`);
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error("api.getBestMarket failed:", error);
            // Fallback for demo
            return {
                best_market: "Delhi Azadpur Mandi",
                max_profit: 15420.50
            };
        }
    },

    getRisk: async (harvestId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/risk-assessment/${harvestId}`);
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error("api.getRisk failed:", error);
            // Fallback for demo
            return {
                total_risk: 18.5,
                margin_risk: 12.0,
                volatility_risk: 25.0,
                transport_risk: 15.0
            };
        }
    },

    getTransportStatus: async (harvestId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/transport-status/${harvestId}`);
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error("api.getTransportStatus failed:", error);
            // Fallback for demo
            return {
                transport_id: "TRK001",
                status: "IN TRANSIT",
                current_lat: 28.99,
                current_lng: 77.02,
                confidence_score: 0.85,
                delay_minutes: 0,
                tracking_mode: "REAL-TIME",
                eta: new Date(Date.now() + 45 * 60000).toISOString()
            };
        }
    }
};
