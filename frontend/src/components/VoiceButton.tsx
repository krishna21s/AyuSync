import { Mic } from "lucide-react";
import { motion } from "framer-motion";

export function VoiceButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 md:bottom-8 right-6 z-50 w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center shadow-2xl"
      aria-label="Voice assistant"
    >
      <Mic className="h-7 w-7" />
      <span className="absolute w-full h-full rounded-full animate-ping bg-foreground/20" />
    </motion.button>
  );
}
