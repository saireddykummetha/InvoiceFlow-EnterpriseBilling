import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  description =
    "We couldn't load this information. Please try again.",
  onRetry,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/40 px-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle size={25} />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {onRetry && (
        <Button
          className="mt-6"
          variant="secondary"
          icon={
            <RefreshCw
              size={16}
            />
          }
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </motion.div>
  );
}