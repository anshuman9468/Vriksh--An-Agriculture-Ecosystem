const BASE_URL = "http://localhost:8000";

export const api = {
    getHealth: async () => {
        const response = await fetch(`${BASE_URL}/health`);
        return response.json();
    },
    getProfit: async () => {
        const response = await fetch(`${BASE_URL}/profit`);
        if (!response.ok) throw new Error("Profit data unavailable");
        return response.json();
    },
    getBestMarket: async (harvestId: number) => {
        const response = await fetch(`${BASE_URL}/best-market/${harvestId}`);
        if (!response.ok) throw new Error("Best market data unavailable");
        return response.json();
    },
    getRisk: async (harvestId: number) => {
        const response = await fetch(`${BASE_URL}/risk/${harvestId}`);
        if (!response.ok) throw new Error("Risk data unavailable");
        return response.json();
    },
};
