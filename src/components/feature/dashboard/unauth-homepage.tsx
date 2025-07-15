"use client";

import LandingHeader from "@/components/feature/landing/landing-header";
import HeroSection from "@/components/feature/landing/hero-section";
import WhyLuceraSection from "@/components/feature/landing/why-lucera-section";
import KeyFeaturesSection from "@/components/feature/landing/key-features-section";
import ScreenshotGridSection from "@/components/feature/landing/screenshot-grid-section";
import ComingSoonSection from "@/components/feature/landing/coming-soon-section";
import Footer from "@/components/feature/footer";
import { motion } from "motion/react";
import { NextPage } from "next";

const UnauthHomepage: NextPage = () => {
  return (
    <>
      <LandingHeader />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50"
      >
        <HeroSection />
        <WhyLuceraSection />
        <KeyFeaturesSection />
        <ScreenshotGridSection />
        <ComingSoonSection />
        <Footer variant="landing" />
      </motion.div>
    </>
  );
};

export default UnauthHomepage;
