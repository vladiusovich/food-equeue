export type VibrationLoopConfig = {
    pattern: number[];
    intervalMs: number;
};

export const useVibrationLoop = (config: VibrationLoopConfig) => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
        clearInterval(intervalId);
        intervalId = undefined;
        navigator.vibrate?.(0);
    };

    const start = () => {
        if (intervalId) {
            return;
        }

        navigator.vibrate?.(config.pattern);
        intervalId = setInterval(() => {
            navigator.vibrate?.(config.pattern);
        }, config.intervalMs);
    };

    return { start, stop };
};

export default useVibrationLoop;
