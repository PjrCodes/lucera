"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  FileText,
  MessageSquare,
  Bot,
  Layers,
  Award,
  BarChart3,
  ChevronRight,
  Brain
} from "lucide-react";

const KeyFeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      icon: FileText,
      title: "AI Form Auto-Fill",
      description: "Intelligent form completion that understands PDFs and Documents to automatically fill out course details, assignment details and course material information, saving hours of administrative time.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: MessageSquare,
      title: "Instant Assignment Feedback",
      description: "Get immediate, detailed feedback on assignments with AI-powered analysis that helps improve your work before submission.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Bot,
      title: "Personalised Chatbot (LISA)",
      description: "Your personal AI study companion that answers questions, helps with research, and provides 24/7 academic support. It can also help teachers understand grade analytics!",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Brain,
      title: "Instant Quiz Generation",
      description: "Instantly generate revision quizzes for courses. Revise anywhere, anytime.",
      color: "text-lime-600",
      bgColor: "bg-lime-50"
    },
    {
      icon: Layers,
      title: "LMS Integration Support",
      description: "Seamlessly connects with existing Learning Management Systems to unify your educational experience across platforms.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Award,
      title: "Badges",
      description: "Earn achievements and unlock badges as you progress through your studies, making learning more engaging and rewarding.",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: BarChart3,
      title: "Analytics & Performance Insights",
      description: "Track your academic progress with detailed analytics and personalized AI-powered insights to optimize your learning strategy.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful tools that make Lucera the ultimate university optimization platform
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Mobile Accordion View */}
          <div className="md:hidden space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop Tab View */}
          <div className="hidden md:block">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((feature, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTab === index
                      ? "bg-primary-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <feature.icon size={20} />
                  <span>{feature.title}</span>
                  {activeTab === index && (
                    <ChevronRight
                      size={16}
                      className="transform rotate-90 transition-transform"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-start gap-8">
                <div className={`w-20 h-20 rounded-xl ${features[activeTab].bgColor} flex items-center justify-center flex-shrink-0`}>
                  {(() => {
                    const IconComponent = features[activeTab].icon;
                    return <IconComponent className={`w-10 h-10 ${features[activeTab].color}`} />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {features[activeTab].title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {features[activeTab].description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;
