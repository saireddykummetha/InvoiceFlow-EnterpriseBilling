import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Loading({
  text = "Loading...",
  fullScreen = false,
  size = "md",
}) {
  const sizes = {
    sm: 18,
    md: 28,
    lg: 38,
  };

  const content = (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <Loader2
        size={sizes[size]}
        className="animate-spin text-slate-700"
      />

      {text && (
        <p className="text-sm text-slate-500">
          {text}
        </p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[260px] items-center justify-center">
      {content}
    </div>
  );
}