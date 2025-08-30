import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function QuickResponses({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 mb-4"
    >
      {options.map((option, index) => (
        <motion.div
          key={option}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(option)}
            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
          >
            {option}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
