"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, 
  MessageSquare, Clock, HelpCircle, CheckCircle2, Loader2 
} from "lucide-react";
import { FaFacebook, FaDiscord, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

// ---------------------------------------------------------
// 1. DATA & CONFIG
// ---------------------------------------------------------
const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email Us",
    value: "support@eduaccessbd.com",
    action: "mailto:support@eduaccessbd.com",
    color: "text-blue-400 bg-blue-400/10",
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Call Us",
    value: "01858957312", // Replace with real number
    action: "tel:+8801XXXXXXXX",
    color: "text-green-400 bg-green-400/10",
  },
  {
    icon: <FaDiscord className="w-5 h-5" />,
    title: "Live Support",
    value: "Join Discord Server",
    action: "https://discord.gg/nuTnXSjEG3",
    color: "text-purple-400 bg-purple-400/10",
  },
];

const faqs = [
  { q: "How do I access my course?", a: "After payment, go to 'My Orders' in your dashboard. Click 'Details' to find your access link and credentials." },
  { q: "What payment methods do you accept?", a: "We accept Bkash and Nagad (Personal). More options coming soon." },
  { q: "Can I get a refund?", a: "Refunds are processed within 24 hours if the course content is technically inaccessible." },
];

// ---------------------------------------------------------
// 2. COMPONENT
// ---------------------------------------------------------
export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "30px 30px" }} 
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        
        {/* === HERO === */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-gray-400 uppercase tracking-widest">
            <MessageSquare className="w-3 h-3 text-purple-400" /> 24/7 Support
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Touch</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Have questions about a course or need technical help? The <span className="text-white font-bold">Edu Access BD</span> team is here for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* === LEFT: CONTACT INFO & SOCIALS === */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            {/* Info Cards */}
            <div className="grid gap-4">
              {contactInfo.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.action}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[#111] border border-white/5 hover:border-white/20 hover:bg-[#161616] transition-all duration-300"
                >
                  <div className={`p-3 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{item.title}</p>
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Hours */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5">
              <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                <Clock className="w-4 h-4 text-orange-400" /> Support Hours
              </h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Saturday - Thursday</span>
                  <span className="text-white">10:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span className="text-red-400">Limited Support</span>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Connect Socially</p>
              <div className="flex gap-3">
                {[
                  { icon: FaFacebook, url: "#", color: "hover:text-blue-500" },
                  { icon: FaTelegramPlane, url: "https://t.me/ProAccessBD", color: "hover:text-sky-400" },
                  { icon: FaWhatsapp, url: "https://whatsapp.com/channel/0029Vb7WwsoDDmFZtSUqp42a", color: "hover:text-green-500" },
                  { icon: FaDiscord, url: "https://discord.gg/nuTnXSjEG3", color: "hover:text-indigo-400" }
                ].map((social, i) => (
                  <a key={i} href={social.url} target="_blank" className={`w-10 h-10 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-gray-400 ${social.color} hover:border-white/30 transition-all`}>
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* === RIGHT: CONTACT FORM === */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Subtle top light */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                Send a Message <span className="text-gray-500 text-sm font-normal hidden sm:inline"> — We usually reply in minutes.</span>
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Name</label>
                    <input 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
                    <input 
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Subject</label>
                  <input 
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Payment Issue, Course Access"
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Message</label>
                  <textarea 
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Send Message <Send className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </motion.div>

        </div>

        {/* === FAQ SECTION === */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="md:w-1/3">
              <h2 className="text-2xl font-bold text-white mb-2">Common Questions</h2>
              <p className="text-gray-400 text-sm">Before contacting us, check if your question is answered here.</p>
            </div>
            <div className="md:w-2/3 grid gap-4 w-full">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <h4 className="flex items-start gap-3 font-bold text-gray-200 text-sm">
                    <HelpCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-gray-500 text-xs mt-2 pl-7 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}