"use client"

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Menu, X, ChevronDown, LogOut, User, Settings, Copy } from 'lucide-react';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { user, logIn, logOut, isCreator, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnect = async () => {
    try {
      await logIn();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setShowDropdown(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const copyAddress = () => {
    if (user.addr) {
      navigator.clipboard.writeText(user.addr);
      toast.success('Address copied to clipboard');
      setShowDropdown(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 text-black">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="text-2xl font-bold text-blockchain-light-green flex items-center gap-2">
          <Image src="/icons/flowtip.png" alt='flowtip' width={30} height={30}/>
          FlowTip
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-black hover:text-blockchain-light-green transition-colors">
            Home
          </Link>
          <Link href="/creators" className="text-black hover:text-blockchain-light-green transition-colors">
            Discover Creators
          </Link>
          {user?.loggedIn && isCreator && (
            <Link href="/dashboard" className="text-black hover:text-blockchain-light-green transition-colors">
              Dashboard
            </Link>
          )}
        </nav>
        
        {/* Desktop Auth Section */}
        <div className="hidden md:block">
          {isLoading ? (
            <div className="flex items-center">
              <div className="h-4 w-4 rounded-full border-2 border-t-blockchain-light-green border-gray-300 animate-spin"></div>
            </div>
          ) : user?.loggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="button-accent flex items-center gap-2 hover:bg-opacity-90 transition-all"
              >
                <span>{formatAddress(user.addr!)}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {/* User Info Section */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blockchain-light-green rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {isCreator ? 'Creator Account' : 'Supporter Account'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.addr}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={copyAddress}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </button>

                    {user.loggedIn && !isCreator && (
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <User className="h-4 w-4" />
                        Become a Creator
                      </Link>
                    )}

                    {user.loggedIn && isCreator && (
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Settings className="h-4 w-4" />
                        Creator Dashboard
                      </Link>
                    )}

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleConnect} className="button-accent">
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-black"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <Link 
              href="/" 
              className="block py-2 text-black hover:text-blockchain-light-green transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/creators" 
              className="block py-2 text-black hover:text-blockchain-light-green transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Discover Creators
            </Link>
            {user?.loggedIn && isCreator && (
              <Link 
                href="/dashboard" 
                className="block py-2 text-black hover:text-blockchain-light-green transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-gray-200">
              {isLoading ? (
                <div className="flex items-center py-2">
                  <div className="h-4 w-4 rounded-full border-2 border-t-blockchain-light-green border-gray-300 animate-spin mr-2"></div>
                  <span className="text-sm text-gray-600">Connecting...</span>
                </div>
              ) : user?.loggedIn ? (
                <div className="space-y-2">
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-blockchain-light-green rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isCreator ? 'Creator' : 'Supporter'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatAddress(user.addr!)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={copyAddress}
                    className="w-full text-left py-2 text-sm text-gray-700 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Address
                  </button>

                  {!isCreator && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className=" py-2 text-sm text-gray-700 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Become a Creator
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm text-red-600 flex items-center gap-2"
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
                  className="button-accent w-full"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;