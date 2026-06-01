import { cn } from "@/lib/utils/cn";

interface Props {
    currentStep: number;
    totalSteps: number;
}

export default function StepperTab({ currentStep, totalSteps }: Props) {
    return (
        <div className="w-full flex gap-1 h-2">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        "flex-1 rounded-full",
                        i === currentStep ? "bg-brand-secondary" : "bg-bg-tertiary"
                    )}
                />
            ))}
        </div>
    );
}