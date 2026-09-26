import React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Play } from "lucide-react";

const Loader = ({ text = "Loading...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center gap-10">
      {/* Icon Animation Container */}
      <div className="relative w-32 h-32 flex items-center justify-center mt-8">
        {/* Left Icon: Photo/Image */}
        <motion.div
          className="absolute w-16 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg flex items-center justify-center z-10"
          initial={{ x: 0, y: 0, rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ x: -45, y: 15, rotate: -15, scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
            // Float animation after popping out
            y: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.5,
            },
          }}
        >
          <ImageIcon className="text-white w-7 h-7" />
        </motion.div>

        {/* Right Icon: Video */}
        <motion.div
          className="absolute w-16 h-20 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl shadow-lg flex items-center justify-center z-10"
          initial={{ x: 0, y: 0, rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ x: 45, y: 15, rotate: 15, scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
            // Float animation after popping out
            y: {
              duration: 2.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.6,
            },
          }}
        >
          <Play className="text-white w-7 h-7 ml-1" fill="currentColor" />
        </motion.div>

        {/* Center Icon: Document */}
        <motion.div
          className="absolute w-20 h-24 bg-gradient-to-b from-white to-slate-50 rounded-xl shadow-xl flex flex-col items-center justify-center z-20 border border-slate-100 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            y: {
              duration: 1.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          }}
        >
          {/* Folded corner effect (visual only) */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-slate-200/50 rounded-bl-lg"></div>

          {/* Document Lines */}
          <div className="w-10 h-2 bg-slate-300 rounded-full mb-2"></div>
          <div className="w-12 h-2 bg-slate-300 rounded-full mb-2"></div>
          <div className="w-8 h-2 bg-slate-300 rounded-full"></div>
        </motion.div>

        {/* Circular Ring Loader wrapping the bottom part */}
        <div className="absolute -bottom-8">
          <svg
            className="w-14 h-14 animate-spin text-primary-500"
            viewBox="0 0 50 50"
          >
            <circle
              className="text-slate-200"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="25"
              cy="25"
            />
            <circle
              className="text-primary-500"
              strokeWidth="4"
              strokeDasharray="90 150"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="25"
              cy="25"
            />
          </svg>
        </div>
      </div>

      {text && (
        <motion.p
          className="text-sm font-medium text-slate-500 mt-4 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[100]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20 w-full h-full">
      {content}
    </div>
  );
};

export default Loader;
