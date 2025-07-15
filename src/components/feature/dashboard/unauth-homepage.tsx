"use client";

import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import HeroSection from "@/components/feature/landing/hero-section";
import WhyLuceraSection from "@/components/feature/landing/why-lucera-section";
import KeyFeaturesSection from "@/components/feature/landing/key-features-section";
import ScreenshotGridSection from "@/components/feature/landing/screenshot-grid-section";
import ComingSoonSection from "@/components/feature/landing/coming-soon-section";
import FooterSection from "@/components/feature/landing/footer-section";
import { motion } from "motion/react";
import { NextPage } from "next";

const UnauthHomepage: NextPage = () => {
  return (
    <>
      <SetHeaderClientComponent title="Lucera - AI University Operations" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white"
      >
        <HeroSection />
        <WhyLuceraSection />
        <KeyFeaturesSection />
        <ScreenshotGridSection />
        <ComingSoonSection />
        <FooterSection />
      </motion.div>
    </>
  );
};

export default UnauthHomepage;
