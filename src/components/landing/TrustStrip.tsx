"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IconLock, IconLockSquare, IconBrandSlack } from "@tabler/icons-react";

const items = [
  { text: "Slack-Native", icon: IconBrandSlack },
  { text: "Privacy-first", icon: IconLockSquare },
  { text: "Your conversations stay inside your workspace", icon: IconLock },
];

export function TrustStrip() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 1.2 }}
      className="bg-bg-primary py-12"
    >
      <div className="section-divider mx-auto mb-8 max-w-[600px]" />
      <div className="mx-auto flex max-w-[900px] flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:gap-0">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div className="mx-6 hidden h-4 w-px bg-border-default/40 sm:block" />
              )}
              <span className="flex items-center gap-2 font-mono text-xs text-text-tertiary sm:text-sm">
                <Icon size={14} className="text-text-tertiary" />
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
