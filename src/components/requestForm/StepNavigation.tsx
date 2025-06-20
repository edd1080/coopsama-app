
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface StepNavigationProps {
  steps: Step[];
  activeStep: number;
  sectionStatus: Record<string, 'pending' | 'complete'>;
  onChangeStep: (index: number) => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ 
  steps, 
  activeStep, 
  sectionStatus, 
  onChangeStep 
}) => {
  // CSS styles for hide-scrollbar
  const hideScrollbarStyle = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none'
    }
  } as React.CSSProperties;
  
  return (
    <div className="relative">
      <div className="flex overflow-x-auto gap-1 pb-1" style={hideScrollbarStyle}>
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isCompleted = sectionStatus[step.id] === 'complete';
          const isPast = index < activeStep;
          const isClickable = true; // Make all sections clickable for non-linear access
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onChangeStep(index)}
              disabled={!isClickable}
              className={`
                flex items-center gap-2 py-2 px-3 min-w-fit rounded-lg transition-all duration-200
                ${isActive ? 'bg-primary/10 text-primary shadow-sm' : ''}
                ${isCompleted && !isActive ? 'text-green-600 dark:text-green-400' : ''}
                ${isPast && !isActive && !isCompleted ? 'text-primary/70' : ''}
                ${!isClickable ? 'opacity-40' : 'hover:bg-accent'}
              `}
            >
              <div className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                ${isActive ? 'bg-primary text-primary-foreground' : ''} 
                ${isCompleted && !isActive ? 'bg-green-600 text-white dark:bg-green-500' : ''}
                ${!isActive && !isCompleted ? 'bg-muted border' : ''}
              `}>
                {isCompleted ? <CheckCircle size={14} /> : index + 1}
              </div>
              <span className="whitespace-nowrap font-medium text-sm">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepNavigation;
