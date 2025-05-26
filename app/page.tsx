'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { useAuth } from '@/context/auth-context';
import WalletConnector from '@/components/auth/wallet-connector';
import Hero from '@/components/layout/hero';
import FeatureCard from '@/components/feature-card';

export default function Home() {
  const { user, isCreator } = useAuth();

  const features = [
    {
      title: "Keep 100% of your tips",
      description: "Create your profile, share your work, and receive cryptocurrency tips directly from your supporters. No middlemen, no platform fees.",
       tag: "FEATURE",
       link: "#"
    },
    {
      title: "Create Your Profile",
      description: "Discover creators you love and support them directly with Flow tokens Simple, transparent, and meaningful.",
      link: "#"
    },
    {
      title: "Instant Withdrawals",
      description: "Connect with fans who value your work and guranteed Instant withdrawals to your Flow wallet",
      link: "#"
    }
  ]

  const large = "Link your Flow blockchain wallet (Blocto or Dapper) to get started"

  return (
    <main className="flex-grow">
        <Hero />
        
        <section className="section text-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black/80">Key Features</h2>
              <p className="text-xl text-blockchain-gray max-w-3xl mx-auto">
                Our enterprise platform provides the tools you need to build and scale
                your audience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  tag={feature.tag}
                  link={feature.link}
                />
              ))}
            </div>
          </div>
        </section>
        
        <section className="section bg-blockchain-blue">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-blockchain-light-blue/20 to-blockchain-blue rounded-2xl p-8 border border-blockchain-light-blue/30">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-2xl font-bold text-black/60 mb-2">Ready to get started?</h3>
                  <p className="text-blockchain-gray">
                    Connect your wallet and start exploring the future of decentralized applications.
                  </p>
                </div>
                <div>
                  <Link href="/sign-in" className="button-accent whitespace-nowrap">
                    Connect Wallet
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}