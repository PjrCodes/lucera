"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-primary-100"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                Lucera
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/landing#features" 
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium flex items-center h-full"
              >
                Features
              </Link>
              <Link 
                href="/landing#screenshots" 
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium flex items-center h-full"
              >
                Product
              </Link>
              <Link 
                href="/landing#coming-soon" 
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium flex items-center h-full"
              >
                Updates
              </Link>
            </nav>

            {/* Auth Button - Desktop */}
            <div className="hidden md:flex items-center">
              <Link href="/api/auth/signin">
                <Button 
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <LogIn size={16} className="mr-2" />
                  Sign In / Register
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 flex items-center justify-center"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 w-full z-40 bg-white border-b border-primary-100 md:hidden"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/landing#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium py-2 flex items-center"
              >
                Features
              </Link>
              <Link 
                href="/landing#screenshots" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium py-2 flex items-center"
              >
                Product
              </Link>
              <Link 
                href="/landing#coming-soon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium py-2 flex items-center"
              >
                Updates
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-primary-100">
                <Link href="/api/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    size="sm"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <LogIn size={16} className="mr-2" />
                    Sign In / Register
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default LandingHeader;
