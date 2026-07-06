export type Accent = "neutral" | "primary" | "success" | "warning" | "error";

interface AccentColorPair {
    color1: string;
    color2: string;
}

const accentColors: Record<Accent, AccentColorPair> = {
    neutral: { color1: "var(--color-secondary-400)", color2: "var(--color-warning-300)" },
    primary: { color1: "var(--color-primary-400)", color2: "var(--color-primary-600)" },
    success: { color1: "var(--color-success-400)", color2: "var(--color-success-600)" },
    warning: { color1: "var(--color-warning-400)", color2: "var(--color-warning-600)" },
    error: { color1: "var(--color-error-400)", color2: "var(--color-error-600)" },
};

export const getAccentColors = (accent: Accent): AccentColorPair => accentColors[accent];

const accentDotClasses: Record<Accent, string> = {
    neutral: "bg-surface-50/15",
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
};

const accentBadgeClasses: Record<Accent, { border: string; bg: string; text: string }> = {
    neutral: { border: "border-surface-700/40", bg: "bg-surface-700", text: "text-surface-50" },
    primary: { border: "border-primary-500/45", bg: "bg-primary-500/16", text: "text-primary-500" },
    success: { border: "border-success-500/45", bg: "bg-success-500/16", text: "text-success-500" },
    warning: { border: "border-warning-500/45", bg: "bg-warning-500/16", text: "text-warning-500" },
    error: { border: "border-error-500/45", bg: "bg-error-500/16", text: "text-error-500" },
};

export const getAccentDotClass = (accent: Accent): string => accentDotClasses[accent];

export const getAccentBadgeClasses = (accent: Accent) => accentBadgeClasses[accent];
