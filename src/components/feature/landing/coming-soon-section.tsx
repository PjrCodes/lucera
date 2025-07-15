"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Mail } from "lucide-react";

const ComingSoonSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Here you would typically send the email to your backend
      console.log("Email submitted:", email);
    }
  };

  return (
    <section id="coming-soon" className="py-24 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-400 rounded-full opacity-15 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Campus silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-900/30 to-transparent" />
        
        {/* Floating academic icons */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 text-primary-200 opacity-30"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 2) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {i % 3 === 0 ? "🎓" : i % 3 === 1 ? "📚" : "🔬"}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Coming Soon to Your Campus
          </h2>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Be the first to experience the future of university operations. 
            Join our early access program and help shape the platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="email"
                  placeholder="Enter your university email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-primary-400 bg-white/90 backdrop-blur-sm rounded-full focus:border-white focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 bg-white text-primary-700 hover:bg-primary-50 rounded-full font-bold text-lg group transition-all duration-300 transform hover:scale-105"
              >
                Request Early Access
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                You&apos;re on the list!
              </h3>
              <p className="text-primary-100">
                We&apos;ll notify you when Lucera launches at your university.
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="flex flex-wrap justify-center gap-8 text-primary-200">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Free Early Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Priority Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Shape the Future</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComingSoonSection;
