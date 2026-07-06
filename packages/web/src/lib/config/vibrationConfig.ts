export type VibrationLoopConfig = {
    pattern: number[];
    intervalMs: number;
};

export type InAppVibrationConfig = { enabled: false } | ({ enabled: true } & VibrationLoopConfig);

const vibrationConfig: {
    readyModal: VibrationLoopConfig;
    inApp: InAppVibrationConfig;
} = {
    readyModal: {
        pattern: [2000],
        intervalMs: 1500,
    },
    inApp: {
        enabled: true,
        pattern: [500],
        intervalMs: 2000,
    },
};

export default vibrationConfig;
