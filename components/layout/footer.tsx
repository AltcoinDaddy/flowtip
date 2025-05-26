import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const footerLinks = {
    product: [
      "Flowtip  Explorer",
      "Token Management",
      "Smart Contracts",
      "NFT Marketplace",
    ],
    developers: ["Documentation", "API Reference", "SDKs", "Github"],
    company: ["About Us", "Careers", "Blog", "Contact"],
    legal: ["Privacy Policy", "Terms of Service", "Cookies", "Disclaimer"],
  };

  return (
    <footer className="bg-blockchain-blue border-t border-blockchain-light-blue/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              <Image
                src="/icons/flowtip.png"
                alt="flotwip"
                width={30}
                height={30}
              />
              FlowTip
            </Link>
            <p className="mt-4 text-blockchain-gray">
              Providing enterprise-grade blockchain tipping infrastructure for
              the Flow blockchain
            </p>
            <div className="mt-6 flex space-x-4">
              {["Twitter", "Discord", "Github", "Telegram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-8 w-8 rounded-full bg-blockchain-light-blue/20 flex items-center justify-center text-white hover:bg-blockchain-accent transition-colors"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link}>
                  <a href="#" className="text-blockchain-gray hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Developers</h3>
            <ul className="space-y-2">
              {footerLinks.developers.map((link) => (
                <li key={link}>
                  <a href="#" className="text-blockchain-gray hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link}>
                  <a href="#" className="text-blockchain-gray hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold mt-6 mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link}>
                  <a href="#" className="text-blockchain-gray hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blockchain-light-blue/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blockchain-gray">
            © {new Date().getFullYear()} BlockchainX. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-blockchain-gray hover:text-white">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
