import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisplayPreviewProps {
  width: number;
  height: number;
  content: string;
  deviceName: string;
}

export const DisplayPreview: React.FC<DisplayPreviewProps> = ({
  width,
  height,
  content,
  deviceName
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    if (content) {
      setIsReceiving(true);
      setShowMessage(true);

      const timeout = setTimeout(() => {
        setShowMessage(false);
        setIsReceiving(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [content]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{deviceName}</span>
      </div>
      <div className="relative flex justify-center items-center">
        <div className="relative" style={{ width, height }}>
          {/* Edge light inside display */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none z-10"
            style={{
              boxSizing: 'border-box',
              border: isReceiving ? '3px solid #0ea5e9' : '3px solid transparent',
            }}
            animate={{
              borderColor: isReceiving
                ? ['#0ea5e9', '#0ea5e9', 'transparent']
                : ['#22c55e', '#ef4444', '#22c55e']
            }}
            transition={{
              duration: isReceiving ? 0.5 : 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Display content */}
          <motion.div
            className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center w-full h-full z-0"
          >
            <AnimatePresence mode="wait">
              {showMessage ? (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <span className="text-sky-500 font-mono">MindScape</span>
                  <p className="text-green-500 font-mono mt-2">{content}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-500 font-mono"
                >
                  Waiting for message...
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
