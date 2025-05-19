import React from 'react';
import { SignalStage } from '../components/types';
import { Radio, ArrowRight, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignalFlowProps {
  currentStage: SignalStage;
  mode: 'AUTO' | 'MANUAL';
}

export const SignalFlow: React.FC<SignalFlowProps> = ({ currentStage, mode }) => {
  const stages: SignalStage[] = ['WAITING', 'SENDING', 'RECEIVED', 'RETURNING', 'COMPLETE'];

  const getStageColor = (stage: SignalStage) => {
    if (currentStage === 'ERROR') return 'text-red-500';
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) return 'text-green-500';
    if (stageIndex === currentIndex) return 'text-blue-500';
    return 'text-gray-300';
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full py-4">
        {stages.map((stage, index) => (
          <React.Fragment key={stage}>
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div 
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStageColor(stage)}`}
                animate={{
                  scale: stage === currentStage ? [1, 1.1, 1] : 1,
                  borderColor: getStageColor(stage),
                }}
                transition={{ duration: 0.5, repeat: stage === currentStage ? Infinity : 0 }}
              >
                {currentStage === 'ERROR' ? (
                  <X className="w-4 h-4" />
                ) : stage === currentStage ? (
                  <Radio className="w-4 h-4 animate-pulse" />
                ) : stage === 'COMPLETE' && currentStage === 'COMPLETE' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </motion.div>
              <span className={`text-xs mt-2 ${getStageColor(stage)}`}>
                {stage.charAt(0) + stage.slice(1).toLowerCase()}
              </span>
            </motion.div>
            {index < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ArrowRight className={`w-4 h-4 ${getStageColor(stages[index + 1])}`} />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Mode Display Below Signal Flow */}
      <span className={`mt-4 text-sm font-medium ${mode === 'AUTO' ? 'text-green-500' : 'text-yellow-500'}`}>
        {mode === 'AUTO' ? 'Auto Mode Active' : 'Manual Mode Active'}
      </span>
    </div>
  );
};
