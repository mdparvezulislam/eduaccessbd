"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaDiscord, FaTelegramPlane, FaWhatsapp, FaArrowRight, FaUsers } from "react-icons/fa";
import { Check, Zap, Globe } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------
// 1. UPDATED DATA
// ---------------------------------------------------------
const communities = [
  {
    id: "discord",
    name: "Discord Server",
    description: "The heart of our developer community. Live voice chats, screen sharing, and code debugging.",
    icon: <FaDiscord className="w-10 h-10" />,
    url: "https://discord.gg/nuTnXSjEG3",
    // Gradients for specific branding
    gradient: "from-[#5865F2] to-[#4752C4]",
    shadow: "shadow-[#5865F2]/20",
    features: ["Live Mentorship", "Voice Hangouts", "24/7 Support"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Channel",
    description: "Get critical updates directly to your phone. The fastest way to know about offers.",
    icon: <FaWhatsapp className="w-10 h-10" />,
    url: "https://whatsapp.com/channel/0029Vb7WwsoDDmFZtSUqp42a",
    gradient: "from-[#25D366] to-[#128C7E]",
    shadow: "shadow-[#25D366]/20",
    features: ["Instant Alerts", "Exclusive Deals", "No Spam"],
  },
  {
    id: "telegram",
    name: "Telegram Group",
    description: "A vault of premium resources, PDFs, and quick polls. Join the discussion.",
    icon: <FaTelegramPlane className="w-10 h-10" />,
    url: "https://t.me/ProAccessBD",
    gradient: "from-[#24A1DE] to-[#0088cc]",
    shadow: "shadow-[#24A1DE]/20",
    features: ["Daily Resources", "Polls & Quizzes", "File Sharing"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants:any = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } },
};

// ---------------------------------------------------------
// 2. MAIN COMPONENT
// ---------------------------------------------------------
function CommunityPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        {/* Grid Texture */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }} 
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24">
        
        {/* =====================
            HERO SECTION
        ===================== */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-gray-400"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            5,000+ Active Members
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-7xl font-black tracking-tight"
          >
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Revolution</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed"
          >
            Don't learn alone. Connect with experts, get instant help, and access premium resources across your favorite platforms.
          </motion.p>
        </div>

        {/* =====================
            CARDS GRID
        ===================== */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {communities.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="relative group h-full"
            >
              {/* Glow Effect behind card */}
              <div className={`absolute -inset-0.5 bg-gradient-to-b ${item.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition duration-500`} />
              
              {/* Card Body */}
              <div className="relative h-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col overflow-hidden hover:border-white/20 transition-colors">
                
                {/* Top Icon & Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg ${item.shadow}`}>
                    {item.icon}
                  </div>
                  <div className="bg-white/5 p-2 rounded-full text-gray-500 group-hover:text-white transition-colors">
                    <FaUsers />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                  {item.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8 bg-white/5 rounded-xl p-4 border border-white/5">
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Link 
                  href={item.url}
                  target="_blank"
                  className={`
                    w-full py-3.5 rounded-lg font-bold text-sm text-white
                    bg-gradient-to-r ${item.gradient} 
                    hover:brightness-110 active:scale-[0.98] transition-all
                    flex items-center justify-center gap-2 shadow-lg ${item.shadow}
                  `}
                >
                  Join Community <FaArrowRight className="w-3 h-3" />
                </Link>

              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* =====================
            BOTTOM SECTION
        ===================== */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 border-t border-white/10 pt-10 text-center"
        >
          <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Not sure where to start?</h2>
          <p className="text-gray-500 mb-6">Our Discord server is the most active place for live help.</p>
          <Link href="https://discord.gg/nuTnXSjEG3" className="text-sm font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4">
            Start with Discord &rarr;
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

export default CommunityPage;