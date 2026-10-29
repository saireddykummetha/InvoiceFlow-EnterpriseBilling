import { motion } from "framer-motion";

import Breadcrumb from "./Breadcrumb";

export default function PageHeader({
  title,
  subtitle,
  action,
  breadcrumbItems,
  children,
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
      transition={{
        duration: 0.25,
      }}
      className="mb-6"
    >
      <div className="mb-4">
        <Breadcrumb
          items={breadcrumbItems}
        />
      </div>

      {(action || children) && (
        <div className="flex justify-end">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {action}
            {children}
          </div>
        </div>
      )}
    </motion.div>
  );
}