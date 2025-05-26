import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>

      {/* Glowing Orb */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blockchain-accent to-yellow-500 opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-16 w-fit rounded-2xl flex items-center justify-center animate-float">
              <div className="h-10 w-fit p-4 rounded-lg bg-blockchain-accent/80 flex items-center justify-center">
                <span className="text-white text-sm">Flowtip</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text "> Support Creators </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 mt-2 font-semibold">Directly with Crypto.</span>
          </h1>

          <p className="text-xl md:text-2xl text-blockchain-gray mb-10 max-w-3xl mx-auto">
            FlowTip lets you discover and support your favorite content creators
            with direct cryptocurrency tips on the Flow blockchain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/creators"
              className="button-accent px-8 py-4 text-lg flex items-center"
            >
              Discover Creators
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="#" className="button-outline px-8 py-4 text-lg">
              How It Works
            </Link>
          </div>
        </div>

        {/* Floating Graphics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-blockchain-blue/50 backdrop-blur rounded-xl p-6 border border-blockchain-light-blue/20 shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="h-32 flex items-center justify-center mb-4">
              <div className="w-full h-20 bg-gradient-to-r from-blockchain-accent/10 to-blue-500/10 rounded-md relative overflow-hidden">
                <div className="absolute inset-0 flex items-center">
                  <svg
                    className="w-full"
                    height="40"
                    viewBox="0 0 200 40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 30 Q40 10, 80 25 T160 15 T200 30"
                      fill="none"
                      stroke="#FF5722"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            {/* Placeholder for center panel */}
          </div>

          <div className="bg-blockchain-blue/50 backdrop-blur rounded-xl p-6 border border-blockchain-light-blue/20 shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="h-32 flex items-center justify-center mb-4">
              <div className="grid grid-cols-5 gap-2 w-full">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 rounded-sm ${
                      i % 3 === 0
                        ? "bg-blockchain-accent/40"
                        : "bg-blockchain-light-blue/20"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
