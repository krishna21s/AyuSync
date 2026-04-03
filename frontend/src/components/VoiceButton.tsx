import { Mic } from "lucide-react";
import { motion } from "framer-motion";

export function VoiceButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center"
      style={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.15)",
      }}
      aria-label="Voice assistant"
    >
      <Mic className="h-6 w-6" />
      <span className="absolute w-full h-full rounded-full animate-ping bg-gray-900/15 pointer-events-none" />
    </motion.button>
  );
}
