"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { copyAddress, formatAddress } from "@/utils";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Copy,
  Wallet,
} from "lucide-react"; // Added Wallet
import { toast } from "sonner";

const Header: React.FC = () => {
  const { user, logIn, logOut, isCreator, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleConnect = async () => {
    try {
      await logIn();
      return toast.success("Wallet Connected Successfully");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setShowDropdown(false);
      // toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-20 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/[0.02] rounded-3xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Unique Logo Design */}
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 rounded-2xl flex items-center justify-center transform rotate-12">
                  <div className="w-8 h-8 bg-white rounded-lg transform -rotate-12 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent">
                  Flow
                </span>
                <span className="text-white">Tip</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-12">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-all duration-300 font-semibold relative group"
              >
                Explore
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                href="/creators"
                className="text-gray-300 hover:text-white transition-all duration-300 font-semibold relative group"
              >
                Creators
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              {user?.loggedIn && isCreator && (
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-all duration-300 font-semibold relative group"
                >
                  Dashboard
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-400 group-hover:w-full transition-all duration-300"></div>
                </Link>
              )}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-10 w-28">
                  {" "}
                  {/* Adjusted size for spinner visibility */}
                  <div className="h-6 w-6 rounded-full border-2 border-t-emerald-400 border-gray-600 animate-spin"></div>
                </div>
              ) : user?.loggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 rounded-2xl px-6 py-3 font-semibold flex items-center gap-2 transition-all duration-300"
                  >
                    <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse mr-1"></div>
                    <span>{formatAddress(user.addr!)}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-800/[0.9] backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden">
                      <div className="px-4 py-3 bg-gray-700/50 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {isCreator
                                ? "Creator Account"
                                : "Supporter Account"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.addr}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => copyAddress(user, setShowDropdown)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Address
                        </button>
                        {user.loggedIn && !isCreator && (
                          <Link
                            href="/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3"
                          >
                            <User className="h-4 w-4" />
                            Become a Creator
                          </Link>
                        )}
                        {user.loggedIn && isCreator && (
                          <Link
                            href="/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-3"
                          >
                            <Settings className="h-4 w-4" />
                            Creator Dashboard
                          </Link>
                        )}
                        <div className="border-t border-white/20 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/30 hover:text-red-300 flex items-center gap-3"
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 hover:from-emerald-700 hover:via-green-700 hover:to-lime-700 text-white border-0 rounded-2xl px-8 py-3 font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <Wallet className="mr-1 h-5 w-5" />
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-white"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 mx-6">
          {" "}
          {/* Positioned below the main header card */}
          <div className="backdrop-blur-xl bg-white/[0.02] rounded-3xl border border-white/10 p-6 shadow-2xl">
            <div className="space-y-2">
              <Link
                href="/"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/creators"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Discover Creators
              </Link>
              {user?.loggedIn && isCreator && (
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              <div className="pt-4 mt-2 border-t border-white/20">
                {isLoading ? (
                  <div className="flex items-center py-2">
                    <div className="h-4 w-4 rounded-full border-2 border-t-emerald-400 border-gray-600 animate-spin mr-2"></div>
                    <span className="text-sm text-gray-400">Connecting...</span>
                  </div>
                ) : user?.loggedIn ? (
                  <div className="space-y-3">
                    <div className="py-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {isCreator ? "Creator" : "Supporter"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatAddress(user.addr!)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        copyAddress(user, setShowDropdown);
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 text-sm text-gray-300 hover:text-white flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </button>
                    {user.loggedIn && !isCreator && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="py-2 text-sm text-gray-300 hover:text-white flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Become a Creator
                      </Link>
                    )}
                    {user.loggedIn && isCreator && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="py-2 text-sm text-gray-300 hover:text-white flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Creator Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 text-sm text-red-400 hover:text-red-300 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleConnect();
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-lime-600 hover:from-emerald-700 hover:via-green-700 hover:to-lime-700 text-white border-0 rounded-xl px-6 py-3 font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Wallet className="h-5 w-5" />
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
