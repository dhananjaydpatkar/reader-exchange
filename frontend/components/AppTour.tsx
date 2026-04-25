'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    TourStep,
    getStepsForRole,
    shouldShowTour,
    markTourCompleted,
    markTourSkipped,
    TOUR_VERSION,
} from '@/lib/tourConfig';
import { X, ChevronLeft, ChevronRight, SkipForward, BookOpen, Info } from 'lucide-react';

interface AppTourProps {
    userRole: string;
    onTabChange?: (tabId: string) => void;
}

export default function AppTour({ userRole, onTabChange }: AppTourProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [showOnEveryLogin, setShowOnEveryLogin] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const resizeObserver = useRef<ResizeObserver | null>(null);

    // Initialize tour
    useEffect(() => {
        if (shouldShowTour()) {
            const roleSteps = getStepsForRole(userRole);
            setSteps(roleSteps);
            // Small delay so dashboard content has time to render
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [userRole]);

    // Position tooltip relative to target element
    const positionTooltip = useCallback(() => {
        if (!isActive || steps.length === 0) return;

        const step = steps[currentStep];
        if (!step) return;

        if (!step.target || step.placement === 'center') {
            // Center modal — no target
            setTooltipPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                width: 0,
                height: 0,
            });
            return;
        }

        const el = document.querySelector(step.target);
        if (!el) {
            // Element not found — show as centered
            setTooltipPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                width: 0,
                height: 0,
            });
            return;
        }

        const rect = el.getBoundingClientRect();
        setTooltipPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
        });

        // Scroll element into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [isActive, currentStep, steps]);

    useEffect(() => {
        if (!isActive) return;
        
        // Re-position on scroll or resize
        const handleReposition = () => positionTooltip();
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);

        // Initial positioning
        const timer = setTimeout(positionTooltip, 100);

        return () => {
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
            clearTimeout(timer);
        };
    }, [isActive, positionTooltip]);

    // Handle step changes — switch tabs if needed
    useEffect(() => {
        if (!isActive || steps.length === 0) return;
        
        const step = steps[currentStep];
        if (step?.tab && onTabChange) {
            onTabChange(step.tab);
            // Give time for tab content to render before positioning
            const timer = setTimeout(positionTooltip, 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isActive, steps, onTabChange, positionTooltip]);

    const goToStep = useCallback((stepIndex: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentStep(stepIndex);
            setIsAnimating(false);
        }, 150);
    }, []);

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            goToStep(currentStep + 1);
        }
    }, [currentStep, steps.length, goToStep]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            goToStep(currentStep - 1);
        }
    }, [currentStep, goToStep]);

    const handleComplete = useCallback(() => {
        markTourCompleted(showOnEveryLogin);
        setIsActive(false);
        // Reset tab to available
        if (onTabChange) onTabChange('available');
    }, [showOnEveryLogin, onTabChange]);

    const handleSkip = useCallback(() => {
        markTourSkipped();
        setIsActive(false);
        // Reset tab to available
        if (onTabChange) onTabChange('available');
    }, [onTabChange]);

    // Keyboard navigation
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleSkip();
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (currentStep === steps.length - 1) handleComplete();
                else handleNext();
            }
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, handleNext, handlePrev, handleSkip, handleComplete, currentStep, steps.length]);

    if (!isActive || steps.length === 0) return null;

    const step = steps[currentStep];
    const isCentered = !step.target || step.placement === 'center';
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;
    const progress = ((currentStep + 1) / steps.length) * 100;

    // Calculate highlight position for the target element
    const highlightStyle = !isCentered ? {
        top: tooltipPosition.top - 8,
        left: tooltipPosition.left - 8,
        width: tooltipPosition.width + 16,
        height: tooltipPosition.height + 16,
    } : null;

    // Calculate tooltip card position
    const getTooltipStyle = (): React.CSSProperties => {
        if (isCentered) {
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10002,
            };
        }

        const padding = 16;
        const tooltipWidth = 400;
        const tooltipHeight = 280;

        let top = 0;
        let left = 0;

        switch (step.placement) {
            case 'bottom':
                top = tooltipPosition.top + tooltipPosition.height + padding + 8;
                left = tooltipPosition.left + tooltipPosition.width / 2 - tooltipWidth / 2;
                break;
            case 'top':
                top = tooltipPosition.top - tooltipHeight - padding;
                left = tooltipPosition.left + tooltipPosition.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = tooltipPosition.top + tooltipPosition.height / 2 - tooltipHeight / 2;
                left = tooltipPosition.left - tooltipWidth - padding;
                break;
            case 'right':
                top = tooltipPosition.top + tooltipPosition.height / 2 - tooltipHeight / 2;
                left = tooltipPosition.left + tooltipPosition.width + padding;
                break;
            default:
                top = tooltipPosition.top + tooltipPosition.height + padding + 8;
                left = tooltipPosition.left + tooltipPosition.width / 2 - tooltipWidth / 2;
        }

        // Clamp to viewport
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        
        if (left < 16) left = 16;
        if (left + tooltipWidth > viewportWidth - 16) left = viewportWidth - tooltipWidth - 16;
        if (top < 16) top = 16;

        return {
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 10002,
        };
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[10000] transition-opacity duration-300"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                onClick={(e) => {
                    // Only skip if clicking the overlay itself
                    if (e.target === e.currentTarget) {
                        // Don't auto-skip on overlay click — require explicit skip
                    }
                }}
            >
                {/* Cutout highlight around target element */}
                {highlightStyle && (
                    <div
                        className="absolute rounded-xl transition-all duration-500 ease-out"
                        style={{
                            ...highlightStyle,
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55), 0 0 30px rgba(234,88,12,0.3)',
                            border: '2px solid rgba(234,88,12,0.6)',
                            backgroundColor: 'transparent',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </div>

            {/* Tooltip Card */}
            <div
                ref={tooltipRef}
                className={`w-[400px] max-w-[calc(100vw-32px)] transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                style={getTooltipStyle()}
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-gray-100">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500 ease-out rounded-r-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Header */}
                    <div className="px-6 pt-5 pb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                            title="Skip tour"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4">
                        <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

                        {/* ISBN illustration */}
                        {step.image === 'isbn' && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg border border-orange-200 shadow-sm">
                                        <Info className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">How to find ISBN</p>
                                        <div className="space-y-1.5">
                                            <p className="text-xs text-orange-700">
                                                <span className="font-semibold">📖 Back Cover:</span> Look above or below the barcode
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                <span className="font-semibold">📄 Title Page:</span> Check the copyright page (page after title)
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                <span className="font-semibold">🔢 Format:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-orange-200">978-0-14-032872-1</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Show on every login checkbox — only on last step */}
                    {isLastStep && (
                        <div className="px-6 pb-3">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={showOnEveryLogin}
                                    onChange={(e) => setShowOnEveryLogin(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                                />
                                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                                    Show this guide on every login
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Footer / Navigation */}
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
                        >
                            <SkipForward className="h-3 w-3" />
                            Skip Tour
                        </button>

                        <div className="flex items-center gap-2">
                            {!isFirstStep && (
                                <button
                                    onClick={handlePrev}
                                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Back
                                </button>
                            )}
                            {isLastStep ? (
                                <button
                                    onClick={handleComplete}
                                    className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-200"
                                >
                                    Get Started! 🚀
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-orange-600 transition-all shadow-sm"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step dots */}
                    <div className="px-6 pb-4 flex justify-center gap-1.5">
                        {steps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToStep(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === currentStep
                                        ? 'w-6 bg-orange-500'
                                        : i < currentStep
                                        ? 'w-1.5 bg-orange-300'
                                        : 'w-1.5 bg-gray-200'
                                }`}
                                title={`Step ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
