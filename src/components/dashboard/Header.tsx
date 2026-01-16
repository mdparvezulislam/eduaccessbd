"use client";

import { motion } from "framer-motion";

export default function DashboardHeader({ user }: { user?: { name?: string | null } }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-white">
        Welcome back, {user?.name || "Student"}!
      </h1>
      <p className="text-sm md:text-base text-gray-400">
        Here's your learning journey at a glance
      </p>
    </motion.div>
  );
}