import { useNavigate } from "react-router";
import {
  TrendingUp,
  Truck,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Leaf,
  Sprout,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">VRIKSH</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#ecosystem"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Ecosystem
            </a>
            <a
              href="#started"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Get Started
            </a>
          </nav>
          <Button
            onClick={() => navigate("/login")}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
          >
            Enter Ecosystem
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-blue-50 to-white py-20 px-6">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200"
            alt="Agriculture background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-300">
            <Sprout className="w-4 h-4" />
            AI-POWERED PLATFORM
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4 tracking-tight">
            VRIKSH
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-3 font-medium">
            Farm-to-Market Intelligence Ecosystem
          </p>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            Grow Smart. Sell Smart. Earn Smart.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base rounded-lg shadow-lg w-full sm:w-auto"
            >
              Enter the Ecosystem
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-6 text-base w-full sm:w-auto"
            >
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Ecosystem Flow */}
      <section id="ecosystem" className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Complete Farm-to-Market Ecosystem
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            Seamlessly connecting every step from farm to market with AI-powered intelligence
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="relative">
              <div className="p-8 text-center rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Farmer</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Smart crop planning & pricing
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                <ArrowRight className="w-7 h-7 text-gray-400" strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative">
              <div className="p-8 text-center rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">
                  Transport
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Live tracking & ETA
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                <ArrowRight className="w-7 h-7 text-gray-400" strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative">
              <div className="p-8 text-center rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Market</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Real-time price intelligence
                </p>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                <ArrowRight className="w-7 h-7 text-gray-400" strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <div className="p-8 text-center rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">Seller</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Quality assurance & receiving
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Intelligent Features
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Powered by AI to give you competitive advantage in every transaction
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1549248581-cf105cd081f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGVzJTIwZnJlc2glMjBtYXJrZXQlMjBwcm9kdWNlfGVufDF8fHx8MTc3MjAzMDQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Market prices"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Market Price Intelligence
              </h3>
              <p className="text-sm text-gray-600">
                Compare real-time prices across multiple markets and get
                AI-powered recommendations for maximum profit.
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1767696674746-14d4d6a3ec48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB0cnVjayUyMHRyYW5zcG9ydCUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc3MjAzMDQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Transport tracking"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shadow-md">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Live Transport Tracking
              </h3>
              <p className="text-sm text-gray-600">
                Track your shipment in real-time with accurate ETA predictions
                and delay alerts.
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1677126577258-1a82fdf1a976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZ3JpY3VsdHVyZSUyMHRlY2hub2xvZ3klMjBkcm9uZXxlbnwxfHx8fDE3NzIwMzA0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Risk assessment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Risk Score Engine
              </h3>
              <p className="text-sm text-gray-600">
                AI-based risk assessment for weather, transport delays, and
                market volatility.
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1627842822558-c1f15aef9838?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBnb2xkZW4lMjBmaWVsZHxlbnwxfHx8fDE3NzIwMzA0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Profit optimization"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shadow-md">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Profit Optimization
              </h3>
              <p className="text-sm text-gray-600">
                Smart algorithms to maximize your earnings by optimizing timing,
                market selection, and pricing.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="started" className="py-16 px-6 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-lg text-green-50 mb-8">
            Join thousands of farmers and sellers already using VRIKSH to
            increase their profits.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-lg shadow-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">VRIKSH</span>
          </div>
          <p className="text-sm">
            © 2026 VRIKSH - Farm-to-Market Intelligence Ecosystem
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Empowering farmers and sellers with AI-driven insights
          </p>
        </div>
      </footer>
    </div>
  );
}