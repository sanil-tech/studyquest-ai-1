import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import onboardingRules from '../../data/onboardingRules.json';
import { completeChildOnboarding } from '../../services/familyService';

const StudentWelcome = ({ childProfile, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const steps = onboardingRules.steps;

  useEffect(() => {
    if (currentStepIndex < steps.length - 1) {
      // Simulate the progression through diagnostic and AI generation
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Final step reached, automatically complete onboarding after a brief delay
      const finishTimer = setTimeout(() => {
        handleFinish();
      }, 2000);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStepIndex]);

  const handleFinish = async () => {
    await completeChildOnboarding(childProfile.id);
    onComplete();
  };

  const activeStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Playful background effects */}
      <div className="absolute top-10 left-10 opacity-20 animate-pulse">
        <Sparkles className="w-24 h-24 text-amber-400" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 animate-bounce">
        <Rocket className="w-32 h-32 text-emerald-400" />
      </div>

      <div className="text-center z-10 max-w-md w-full">
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-500 mb-8 drop-shadow-lg">
          Hai {childProfile.name}!
        </h1>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl relative">
          
          <div className="flex flex-col items-center justify-center min-h-[150px]">
            {currentStepIndex === steps.length - 1 ? (
              <CheckCircle2 className="w-20 h-20 text-emerald-400 animate-in zoom-in duration-500 mb-4" />
            ) : (
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mb-6" />
            )}
            
            <h2 className="text-2xl font-black text-white mb-2 animate-in fade-in slide-in-from-bottom-4">
              {activeStep.title}
            </h2>
            <p className="text-indigo-200 font-medium animate-in fade-in slide-in-from-bottom-6">
              {activeStep.description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((step, idx) => (
              <div 
                key={step.id}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === currentStepIndex ? 'w-8 bg-amber-400' : 
                  idx < currentStepIndex ? 'w-2 bg-emerald-400' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentWelcome;
