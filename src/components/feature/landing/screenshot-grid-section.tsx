"use client";

import { motion } from "motion/react";
import Image from "next/image";

const ScreenshotGridSection = () => {
  const screenshots = [
    {
      title: "Custom Dashboard",
      description: "Comprehensive overview for instant information",
      image: "/placeholder.jpg",
    },
    {
      title: "LISA Chatbot",
      description: "Interactive AI assistant for instant help",
      image: "/placeholder.jpg",
    },
    {
      title: "Assignment Feedback",
      description: "Detailed AI-powered feedback on your work",
      image: "/placeholder.jpg",
    },
    {
      title: "Performance Analytics",
      description: "Insights into your learning patterns",
      image: "/placeholder.jpg",
    },
    {
      title: "Course Integration",
      description: "Unified view of all your course materials",
      image: "/placeholder.jpg",
    },
    {
      title: "Lighthouse",
      description: "Track achievements and unlock badges",
      image: "/placeholder.jpg",
    },
  ];

  return (
    <section id="screenshots" className="py-24 bg-gradient-to-br from-white via-primary-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See Lucera in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the intuitive interface and powerful features that make university life easier
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative mb-6 overflow-hidden rounded-xl bg-white shadow-inner">
                  <div className="aspect-video relative">
                    <Image
                      src={screenshot.image}
                      alt={screenshot.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Browser chrome effect */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gray-100 border-b flex items-center px-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {screenshot.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {screenshot.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional decorative elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-6 py-3 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            More features coming soon
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScreenshotGridSection;
