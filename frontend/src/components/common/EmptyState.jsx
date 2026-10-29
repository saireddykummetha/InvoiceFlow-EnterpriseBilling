import {
  FileSearch,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

import Button from "./Button";

export default function EmptyState({
  title = "Nothing here yet",
  description =
    "There is no data to display.",
  action,
  actionLabel,
  icon: Icon = FileSearch,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon size={24} />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}

      {!action &&
        actionLabel && (
          <div className="mt-6">
            <Button
              icon={<Plus size={16} />}
              onClick={action}
            >
              {actionLabel}
            </Button>
          </div>
        )}
    </motion.div>
  );
}