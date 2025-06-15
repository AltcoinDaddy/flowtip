"use client";

import FeatureCard from "@/components/feature-card";
import Header from "@/components/layout/header";
import ParticleBackground from "@/components/particle-background";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, Sparkles, Wallet } from "lucide-react";
import { Button } from "../../components/ui/button";
import HeroSection from "@/components/layout/hero-section";
import { features } from "@/constants";

export default function Home() {
  return (
    <>
      <div className="relative z-10">
        <HeroSection />
        {/* Features Section with Asymmetric Layout */}
        <section className="py-32 px-4 relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-24">
              {/* <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/20 to-green-600/20 px-8 py-4 rounded-full border border-emerald-500/30 mb-12 backdrop-blur-xl">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-bold tracking-wider uppercase">
                  Game-Changing Features
                </span>
              </div> */}

              <h2 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
                <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Reimagining
                </span>
                <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent transform skew-x-6">
                  Creator Freedom
                </span>
              </h2>

              <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
                Break free from traditional platforms. Experience the future of
                <span className="text-transparent bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text font-bold">
                  {" "}
                  direct creator support
                </span>
              </p>
            </div>

            {/* Features Grid with Unique Layout */}
            <div className="grid lg:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Unique CTA Section */}
        <section className="py-32 px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-emerald-600/10 via-green-600/10 to-lime-600/10 p-16 rounded-[3rem] border border-emerald-500/20 overflow-hidden shadow-2xl">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-green-600/5 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-lime-500/20 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="relative z-10">
                {/* <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600/30 to-green-600/30 px-6 py-3 rounded-full border border-emerald-400/40 mb-8 backdrop-blur-xl">
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm font-bold tracking-wider uppercase">
                    Join The Revolution
                  </span>
                </div> */}

                <h3 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-white via-emerald-200 to-lime-200 bg-clip-text text-transparent">
                    Ready to break
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent transform -skew-x-3 inline-block">
                    the boundaries?
                  </span>
                </h3>

                <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                  Step into the future of decentralized creator economy. Connect
                  your wallet and start experiencing true creative freedom.
                </p>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 hover:from-emerald-700 hover:via-green-700 hover:to-lime-700 text-white px-16 py-8 text-xl font-black rounded-3xl shadow-2xl shadow-emerald-500/30 border-0 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Wallet className="mr-4 h-7 w-7 relative z-10" />
                  <span className="relative z-10">Launch Experience</span>
                  <ArrowRight className="ml-4 h-7 w-7 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
