"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaDiscord, FaTelegramPlane, FaWhatsapp, FaUsers, FaArrowRight } from "react-icons/fa";
import { CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------
// 1. COMMUNITY DATA
// ---------------------------------------------------------
const communities = [
  {
    name: "Discord Server",
    description: "Live voice chats, screen sharing, and code debugging sessions with experts.",
    icon: <FaDiscord className="w-8 h-8" />,
    url: "https://discord.gg/JDWzSEhY",
    color: "bg-[#5865F2]", // Discord Brand Color
    hoverColor: "hover:bg-[#4752C4]",
    textColor: "text-[#5865F2]",
    features: ["Live Mentorship", "Dev Hangouts", "Instant Help"],
  },
  {
    name: "Telegram Group",
    description: "Get instant announcements, premium resources, and quick discussions.",
    icon: <FaTelegramPlane className="w-8 h-8" />,
    url: "https://t.me/+b43-RFdvWTEwMmE1",
    color: "bg-[#0088cc]", // Telegram Brand Color
    hoverColor: "hover:bg-[#0077b5]",
    textColor: "text-[#0088cc]",
    features: ["Daily Updates", "PDF Resources", "Polls & Quizzes"],
  },
  {
    name: "WhatsApp Channel",
    description: "Connect directly on your phone. Never miss a critical update or offer.",
    icon: <FaWhatsapp className="w-8 h-8" />,
    url: "https://wa.me/qr/TUANFAJEBKJDE1",
    color: "bg-[#25D366]", // WhatsApp Brand Color
    hoverColor: "hover:bg-[#128C7E]",
    textColor: "text-[#25D366]",
    features: ["Direct Alerts", "Exclusive Deals", "Community News"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// ---------------------------------------------------------
// 2. MAIN COMPONENT
// ---------------------------------------------------------
function CommunityPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* =====================
          HERO SECTION
      ===================== */}
      <section className="relative py-20 px-4 text-center overflow-hidden bg-white">
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Join 5,000+ Learners</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Edu Access</span> Family
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            Connect, learn, and grow with like-minded individuals. Choose your preferred platform and start your journey today.
          </motion.p>
        </div>
      </section>

      {/* =====================
          CARDS GRID
      ===================== */}
      <section className="max-w-6xl mx-auto px-4 pb-24 -mt-8 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {communities.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full relative overflow-hidden group"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${item.color}`} />

              {/* Icon Header */}
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-slate-50 ${item.textColor} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <FaUsers className="text-slate-300 w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-slate-500 mb-6 flex-grow leading-relaxed">
                {item.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                {item.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className={`w-4 h-4 ${item.textColor}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Link 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`
                  mt-auto w-full py-3.5 px-6 rounded-xl text-white font-semibold text-center flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg
                  ${item.color} ${item.hoverColor}
                `}
              >
                Join Now <FaArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* =====================
          BOTTOM BANNER
      ===================== */}
      <section className="bg-slate-900 py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
           <h2 className="text-2xl md:text-3xl font-bold text-white">
             Still have questions?
           </h2>
           <p className="text-slate-400">
             Our support team is active on all platforms. Drop a message anywhere!
           </p>
           <div className="flex justify-center gap-4">
              <Link href="/contact" className="text-white border border-slate-700 px-6 py-2 rounded-full hover:bg-slate-800 transition">
                Contact Support
              </Link>
           </div>
        </div>
      </section>

    </div>
  );
}

export default CommunityPage;