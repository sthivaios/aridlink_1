import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export function PasswordRequirement(props: { message: string; fulfilled: boolean }) {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <div className="relative h-6 w-6">
        <AnimatePresence mode="wait">
          {props.fulfilled ? (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check color="#0069A8FF" />
            </motion.div>
          ) : (
            <motion.div
              key="x"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <X color="red" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p>{props.message}</p>
    </div>
  );
}
