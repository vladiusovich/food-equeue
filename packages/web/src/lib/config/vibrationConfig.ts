export type VibrationLoopConfig = {
    pattern: number[];
    intervalMs: number;
};

const vibrationConfig: {
    inApp: VibrationLoopConfig;
} = {
    inApp: {
        pattern: [
            100, 100, 300, 100, 100, 300, // R (. - .)
            100, 300,                     // E (.)
            100, 100, 300, 300,           // A (. -)
            300, 100, 100, 100, 100, 300, // D (- . .)
            300, 100, 100, 100, 300, 100, 300, // Y (- . - -)
        ],
        intervalMs: 2000,
    },
};

export default vibrationConfig;
