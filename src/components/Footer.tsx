"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FaFacebook, FaDiscord, FaTelegramPlane, FaWhatsapp, 
  FaYoutube, FaLinkedin, FaCode 
} from "react-icons/fa";
import { Mail, MapPin, Phone, ArrowRight, Send } from "lucide-react";

export default function Footer() {
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black text-white border-t border-white/10 overflow-hidden font-sans">
      
      {/* === BACKGROUND AMBIENCE === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-16 pb-8">
        
   
        {/* === MAIN GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 mb-16">
          
          {/* Col 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="block">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Edu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Access</span> BD
              </h2>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering developers and learners with premium resources, courses, and tools at an affordable price.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebook, url: "#" },
                { icon: FaDiscord, url: "https://discord.gg/nuTnXSjEG3" },
                { icon: FaTelegramPlane, url: "https://t.me/ProAccessBD" },
                { icon: FaYoutube, url: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 className="font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "All Products", link: "/products" },
                { name: "My Dashboard", link: "/dashboard" },
                { name: "Community", link: "/community" },
                { name: "Contact", link: "/contact" },
              ].map((item, i) => (
                <li key={i}>
                  <Link href={item.link} className="text-sm text-gray-400 hover:text-white hover:pl-1 transition-all flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="font-bold text-white mb-6">Support & Legal</h4>
            <ul className="space-y-3">
              {[
                { name: "Contact Support", link: "/contact" },
                { name: "Dashboard", link: "/dashboard" },
                { name: "Community", link: "/community" },
                { name: "Courses", link: "/products" },
              ].map((item, i) => (
                <li key={i}>
                  <Link href={item.link} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-purple-500 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:support@eduaccessbd.com" className="hover:text-white transition-colors">support@eduaccessbd.store</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-5 h-5 text-green-500 shrink-0" />
                <span className="hover:text-white transition-colors">01858957312</span>
              </li>
            </ul>
          </div>

        </div>

        {/* === BOTTOM BAR === */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Copyright & Developer Credit */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {currentYear} Edu Access BD. All rights reserved.
            </p>
            
            {/* ⚡ Developer Credit */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/5 transition-colors hover:border-white/10 hover:bg-white/10">
              <FaCode className="w-3 h-3 text-blue-500" />
              <span>Developed by</span>
              <Link 
                href="http://projuktilabs.site/" // Update this link to the correct URL
                target="_blank" 
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors tracking-wide"
              >
                Projukti Labs
              </Link>
            </div>
          </div>
          
          {/* Right: Payment Icons */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">We Accept:</span>
            <div className="flex gap-2 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
               <div className="bg-pink-600/20 border border-pink-600/50 px-2 py-1 rounded text-[10px] font-bold text-pink-500">bKash</div>
               <div className="bg-orange-600/20 border border-orange-600/50 px-2 py-1 rounded text-[10px] font-bold text-orange-500">Nagad</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}