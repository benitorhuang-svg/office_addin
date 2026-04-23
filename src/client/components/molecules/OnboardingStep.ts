/**
 * Molecule: OnboardingStep
 * Standardized card for onboarding steps.
 */
import { createTypography } from "@atoms/Typography";
import { createNexusCard } from "@atoms/NexusCard";

export interface OnboardingStepProps {
    id_label: string;
    title: string;
    description: string;
}

export function createOnboardingStep({ id_label, title, description }: OnboardingStepProps): HTMLElement {
    const caption = createTypography({ 
        variant: "caption", 
        text: id_label, 
        className: "nexus-mb-2" 
    });
    
    const h = createTypography({ 
        variant: "h3", 
        text: title, 
        className: "nexus-mb-1 nexus-text-sm-bold nexus-tracking-tight" 
    });
    
    const body = createTypography({ 
        variant: "body", 
        text: description 
    });

    return createNexusCard({
        children: [caption, h, body],
        padding: "md",
        className: "hover:border-blue-500/30"
    });
}
