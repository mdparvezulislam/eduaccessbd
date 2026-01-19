"use client";

import Link from "next/link";
import { 
  FaFacebook, FaDiscord, FaTelegramPlane, FaYoutube, FaCode 
} from "react-icons/fa";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";

export default function Footer() {
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black text-white border-t border-white/10 overflow-hidden font-sans">
      
      {/* === BACKGROUND AMBIENCE === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-900/20 rounded-full blur-[80px] opacity-40" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-900/20 rounded-full blur-[80px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-10 pb-6">
        
        {/* === MAIN GRID (Compact Mobile Layout) === */}
        {/* Mobile: 2 Columns. 
           - Brand takes 2 cols (Full width)
           - Links takes 1 col
           - Legal takes 1 col (Sits next to Links)
           - Contact takes 2 cols (Full width)
           
           Desktop: 4 Columns standard.
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 mb-10">
          
          {/* Col 1: Brand (Full width on Mobile) */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="block">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                Edu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Access</span> BD
              </h2>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              Empowering developers with premium resources at an affordable price.
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
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all duration-300"
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Links (Half width on Mobile) */}
          <div className="col-span-1">
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Products", link: "/products" },
                { name: "Dashboard", link: "/dashboard" },
                { name: "Community", link: "/community" },
                { name: "Contact", link: "/contact" },
              ].map((item, i) => (
                <li key={i}>
                  <Link href={item.link} className="text-xs text-gray-400 hover:text-white hover:pl-1 transition-all flex items-center gap-1">
                    <ArrowRight className="w-2.5 h-2.5 opacity-0 hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal (Half width on Mobile) */}
          <div className="col-span-1">
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              {[
                { name: "Get Help", link: "/contact" },
                { name: "My Account", link: "/dashboard" },
                { name: "Discord", link: "/community" },
                { name: "Courses", link: "/products" },
              ].map((item, i) => (
                <li key={i}>
                  <Link href={item.link} className="text-xs text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact (Full width on Mobile) */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-xs text-gray-400">
                <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-gray-400">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="mailto:support@eduaccessbd.com" className="hover:text-white transition-colors">support@eduaccessbd.store</a>
              </li>
              <li className="flex items-center gap-3 text-xs text-gray-400">
                <Phone className="w-4 h-4 text-green-500 shrink-0" />
                <span className="hover:text-white transition-colors">01858957312</span>
              </li>
            </ul>
          </div>

        </div>

        {/* === BOTTOM BAR === */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-[10px] text-gray-500">
              © {currentYear} Edu Access BD.
            </p>
            
            {/* Developer Credit */}
            {/* <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 transition-colors hover:border-white/10 hover:bg-white/10">
              <FaCode className="w-2.5 h-2.5 text-blue-500" />
              <span>Dev by</span>
              <Link 
                href="http://projuktilabs.site/" 
                target="_blank" 
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                Projukti Labs
              </Link>
            </div> */}
          </div>
          
          {/* Payment Icons */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
               <div className="bg-pink-600/10 border border-pink-600/30 px-1.5 py-0.5 rounded text-[9px] font-bold text-pink-500">bKash</div>
               <div className="bg-orange-600/10 border border-orange-600/30 px-1.5 py-0.5 rounded text-[9px] font-bold text-orange-500">Nagad</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}