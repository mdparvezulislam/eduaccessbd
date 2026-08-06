import type { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldAlert, Calendar, User, Clock, AlertTriangle, 
  Sparkles, ChevronRight, FileText, Flag, Bookmark
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";

const SITE_NAME = "Pro Access";
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/Agent_47VIP";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eduaccessbd.store";

export const metadata: Metadata = {
  title: "Disclaimer | Pro Access",
  description: "Read the official disclaimer, transparency statement, and content reporting policy for Pro Access.",
  keywords: ["Disclaimer", "Pro Access Disclaimer", "Transparency Policy", "Edu Access BD Notice", "Report Content"],
  alternates: {
    canonical: `${SITE_URL}/disclaimer`,
  },
  openGraph: {
    title: "Disclaimer & Transparency | Pro Access",
    description: "Read the official disclaimer, transparency statement, and reporting guidelines for Pro Access.",
    url: `${SITE_URL}/disclaimer`,
    siteName: SITE_NAME,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer | Pro Access",
    description: "Official disclaimer and content transparency policy.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/disclaimer`,
      "url": `${SITE_URL}/disclaimer`,
      "name": "Disclaimer & Transparency Policy | Pro Access",
      "description": "Read the official disclaimer, transparency statement, and content reporting guidelines for Pro Access."
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Disclaimer",
          "item": `${SITE_URL}/disclaimer`
        }
      ]
    }
  ]
};

const SECTIONS = [
  {
    id: "course-owner",
    number: "01",
    title: "Course Owner",
    titleBn: "কোর্স অনারদের উদ্দেশ্যে",
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    content: "কোর্স সেল করা আমাদের মূল উদ্দেশ্য নই। আমরা যাদের সামর্থ নাই কিন্তু কোর্স করতে খুব বেশি আগ্রহী তাদের সাথে অল্প কিছু টাকার বিনিময়ে শেয়ার করি , যেটা এখন কয়েক বছরে ও ১০০জন পাইনা। আমরা চাইলে ফ্রিতে লক্ষ জনের জন্য এসব কোর্স ফ্রিতে দিতে পারতাম। কিন্তু আমাদের উদ্দেশ্য কোনো প্লাটফর্মের ক্ষতি করা না। তারপরও, আপনার কোর্স সেল বা শেয়ার করার ফলে যদি কোনো প্রকার ক্ষতি হয় বা মনে করেন আমাদের কাজের ফলে সমস্যা হচ্ছে কষ্ট করে আমাদের জানাবেন আমরা আপনার কোর্স সেল বা শেয়ার করা টোটালি অফ করবো।",
  },
  {
    id: "who-buys",
    number: "02",
    title: "যারা আমাদের থেকে কোর্স নেন",
    titleBn: "শিক্ষার্থীদের উদ্দেশ্যে",
    badgeColor: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    content: "আমরা জাস্ট আপনার শেখার জন্য এ কোর্স শেয়ার করি। যদি আপনার ইচ্ছা হয় এসব আমাদের থেকে নিয়ে সেল করা তাহলে রিকুয়েষ্ট আমাদের থেকে কিছু নেওয়া থেকে বিরত থাকুন। আর সামর্থ আছে ওরা অফিশিয়াল কোর্স যাদের কোর্স তাদের ওয়েবসাইট থেকে কিনবেন।",
  },
  {
    id: "summary",
    number: "03",
    title: "সংক্ষিপ্ত",
    titleBn: "সংক্ষেপে আমাদের বার্তা",
    badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    content: "আমরা জাস্ট সামর্থ নাই ওদের জন্য কিছু শেয়ার করি। অন্যথায় সবার সামর্থ আর সব কোর্স সেলার মানে মেন্টর সব ভালো হলে এটা কোনোদিন ও করতাম না, করা লাগতো ও না। ধন্যবাদ।",
  },
  {
    id: "why-started",
    number: "04",
    title: "কেন আমরা এটা শুরু করেছি",
    titleBn: "আমাদের পেছনের গল্প",
    badgeColor: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    content: "আমরা চাইলে প্রতিটি কোর্স সবার জন্য উন্মুক্ত করে দিতে পারতাম। তাই দয়া করে বোঝার চেষ্টা করবেন কেন কিছু মানুষের জন্য সেল করা শুরু করলাম লিক না করে (সেল বলতে জাস্ট ১-২শ টাকার বিনিময়ে)। আমরা চাইনা কোর্স প্লাটফর্ম আমাদের দ্বারা বড় ক্ষতিগ্রস্ত হোক, যেটা লিক বা ফ্রিতে দিলে হতো। অনেক কোর্স আছে যা বাইরে বা প্রমোশন পোস্টে বলে এটা ওটা থাকবে কিন্তু জয়েন করলে কাজের কিছু পাবেন না। তো এ পরিস্থিতি টা যেহেতু আমি নিজে সম্মুখীন হয়ছি তাই বাধ্য হলাম কয়েকজন সামর্থহীন কে হেল্প করতে। সবার ওতো কোর্স কিনে ভালো খারাপ দেখার টাকা থাকে না। তাদের জন্য আমরা।",
  },
  {
    id: "all-users",
    number: "05",
    title: "সকলের উদ্দেশ্যে",
    titleBn: "বিশেষ সতর্কতা ও ঘোষণা",
    badgeColor: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    content: "আমরা যা করি তা লিগ্যাল না। তারপরও আপনাদের সামর্থের কথা চিন্তা করে কম টাকা তে শেয়ার করি। আমরা সব কোর্স কিনে দিই এমন না, অনেকজন আমাদের সাথে কোর্স শেয়ার করে। তো আমাদের দেখে কেউ এসব কাজে আসবেন না। আমরা খুব শিগ্রই এসব পাইরেসি অফ করবো।",
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/10 via-purple-500/5 to-transparent blur-[100px] opacity-60" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-14 max-w-4xl">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3 h-3 text-gray-600" /></li>
            <li className="text-amber-400 font-semibold">Disclaimer</li>
          </ol>
        </nav>

        {/* HERO SECTION */}
        <header className="mb-10 text-center space-y-4 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Official Transparency Notice
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Disclaimer & Transparency Statement
          </h1>

          {/* Quick Meta Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-mono text-gray-400 pt-1">
            <span className="flex items-center gap-1.5 bg-[#111] border border-white/10 px-3 py-1.5 rounded-lg">
              <User className="w-3.5 h-3.5 text-amber-400" /> Pro Access Team
            </span>
            <span className="flex items-center gap-1.5 bg-[#111] border border-white/10 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> July 02, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-[#111] border border-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Updated Notice
            </span>
          </div>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed pt-2">
            This notice outlines our operational philosophy, policies, and reporting procedures. Please read carefully before purchasing or downloading any resources.
          </p>
        </header>

        {/* QUICK JUMP CAPSULES */}
        <div className="mb-10 p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Quick Jump to Section:
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-xs font-medium text-gray-300 border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-1.5"
              >
                <span className="font-mono text-[10px] text-amber-400 font-bold">{sec.number}</span>
                <span>{sec.title}</span>
              </a>
            ))}
            <a
              href="#important-notice"
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" /> Important Notice
            </a>
            <a
              href="#report-content"
              className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-bold border border-sky-500/30 transition-all flex items-center gap-1"
            >
              <Flag className="w-3 h-3" /> Report Content
            </a>
          </div>
        </div>

        {/* CONTENT SECTIONS LIST */}
        <main className="space-y-6">
          
          {SECTIONS.map((sec) => (
            <article
              id={sec.id}
              key={sec.id}
              className="bg-[#0f0f0f] border border-white/10 hover:border-white/20 rounded-2xl p-6 sm:p-8 space-y-4 transition-all shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${sec.badgeColor}`}>
                    SECTION {sec.number}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {sec.title}
                  </h2>
                </div>
                <span className="text-xs text-gray-500 font-mono">{sec.titleBn}</span>
              </div>

              {/* Enhanced Bengali Paragraph Typography */}
              <p className="text-base sm:text-lg text-gray-200 leading-loose sm:leading-[2.2rem] font-sans font-normal tracking-wide text-justify sm:text-left pt-1">
                {sec.content}
              </p>
            </article>
          ))}

          {/* SECTION 06 — ADMIN SIGNATURE CARD */}
          <div
            id="admin"
            className="bg-gradient-to-r from-purple-950/40 via-black to-amber-950/40 border border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
          >
            <div>
              <p className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest">
                Administrator Signature
              </p>
              <h3 className="text-xl sm:text-2xl font-mono font-black text-white tracking-wide mt-1">
                AGENT 47 — <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300">Born from Darkness.</span>
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
              Verified Sign-off
            </span>
          </div>

          {/* IMPORTANT NOTICE BOX */}
          <section
            id="important-notice"
            className="bg-amber-950/25 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-3 shadow-2xl relative"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-amber-300">
                  Important Notice
                </h3>
                <p className="text-xs text-amber-200/70 font-mono">Official Takedown Statement</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-sans pt-1">
              If you are a course creator, official instructor, or copyright holder and believe that any content shared on this platform infringes upon your rights or causes inconvenience to your official platform, please contact us immediately. We strictly respect creator requests and will immediately halt the distribution of your content upon notice.
            </p>
          </section>

          {/* REPORT CONTENT SECTION */}
          <section
            id="report-content"
            className="bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#020617] border border-sky-500/30 rounded-2xl p-6 sm:p-10 space-y-5 shadow-2xl text-center sm:text-left relative overflow-hidden"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold">
                <Flag className="w-3.5 h-3.5" /> Content Takedown & Support
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Report Content
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                If you are the original copyright owner or believe any content on this platform violates your rights, please contact us. We review every report seriously and remove eligible content as quickly as possible.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-sky-900/40 transition-all duration-300 active:scale-95 border border-sky-400/30"
              >
                <FaTelegramPlane className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Report via Telegram (@Agent_47VIP)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
