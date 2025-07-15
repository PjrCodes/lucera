"use client";

import { motion } from "motion/react";
import {
  Heart,
  Mail,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  GraduationCap
} from "lucide-react";

interface FooterProps {
  variant?: "landing" | "internal";
}

const Footer = ({ variant = "internal" }: FooterProps) => {
  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const landingLinks = {
    product: [
      { name: "Features", href: "/landing#features" },
      { name: "Screenshots", href: "/landing#screenshots" },
      { name: "Early Access", href: "/landing#coming-soon" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Blog", href: "#blog" },
      { name: "Careers", href: "#careers" },
    ],
    support: [
      // { name: "Documentation", href: "#docs" },
      // { name: "Help Center", href: "#help" },
      { name: "Contact", href: "#contact" },
    ],
  };

  const internalLinks = {
    platform: [
      { name: "Dashboard", href: "/" },
      { name: "Lighthouse", href: "/lighthouse" },
      { name: "Progress", href: "/progress" },
    ],
    tools: [
      { name: "AI Assistant", href: "/lisa" },
      { name: "Messages", href: "/messages" },
    ],
    support: [
      // { name: "Help Center", href: "#help" },
      { name: "Settings", href: "/settings" },
      { name: "Profile", href: "/profile" },
    ],
  };

  const links = variant === "landing" ? landingLinks : internalLinks;

  // Landing page footer (full featured)
  if (variant === "landing") {
    const landingFooterLinks = links as typeof landingLinks;
    
    return (
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-16">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Logo and Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Lucera</span>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                AI-Powered University Operations Optimiser that transforms
                the educational experience through intelligent automation.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-2 text-primary-400 font-medium"
              >
                <Heart className="w-5 h-5 text-red-500" />
                Built by Students for Universities
              </motion.div>
            </motion.div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-3">
                {landingFooterLinks.product.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border-t border-gray-700 pt-8 mb-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-primary-400" />
                    <span>hello@lucera.university</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-primary-400" />
                    <span>Global • Remote First</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-gray-600 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="text-gray-400 text-sm">
              © 2025 Lucera. All rights reserved.
            </div>

            {/* <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-primary-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-primary-400 transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-primary-400 transition-colors">
                Cookie Policy
              </a>
            </div> */}
            {/* <div className="pt-4 mt-4 text-center"> */}
            <p className="text-gray-500 text-xs">
              Developed by Pranjal Rastogi for the Adobe Internship 2025.
            </p>
          {/* </div> */}
          </motion.div>

          {/* Developer Credit */}
          
        </div>
      </footer>
    );
  }

  // Internal pages footer (simplified)
  const internalFooterLinks = links as typeof internalLinks;
  return (
    <footer className="bg-gray-800 text-white w-full mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Simplified Internal Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-4 gap-8 mb-6"
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Lucera</span>
          </div>

          {/* Platform Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold mb-3 text-gray-300">Platform</h4>
            <ul className="space-y-2">
              {internalFooterLinks.platform.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tools Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold mb-3 text-gray-300">Tools</h4>
            <ul className="space-y-2">
              {internalFooterLinks.tools.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold mb-3 text-gray-300">Support</h4>
            <ul className="space-y-2">
              {internalFooterLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom bar for internal */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center gap-2"
        >
          <div className="text-gray-400 text-sm">
            © 2025 Lucera. All rights reserved.
          </div>
          <div className="text-gray-500 text-xs">
            Developed by Pranjal Rastogi for the Adobe Internship 2025.
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

// Export both the main component and convenience components
export default Footer;

// Convenience exports for specific use cases
export const MainFooter = () => <Footer variant="internal" />;
export const LandingFooter = () => <Footer variant="landing" />;
