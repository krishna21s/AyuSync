import { useState, useEffect, useCallback } from "react";
import { aiTipsService } from "@/services/aiTips";

const FALLBACK_TIPS = [
  "Remember to take deep breaths and stay calm today 🧘",
  "A balanced diet supports your health goals 🥗",
  "Small consistent habits lead to big health improvements 🌟",
];

export function useAITips() {
  const [tips, setTips] = useState<string[]>(FALLBACK_TIPS);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await aiTipsService.get();
      if (res.data?.tips?.length) {
        setTips(res.data.tips);
      }
    } catch {
      // Keep fallback tips
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { tips, isLoading, refetch: fetch };
}
