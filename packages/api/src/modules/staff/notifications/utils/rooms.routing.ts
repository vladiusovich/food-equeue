export const createRoute = (segments: (string | number)[]): string =>
    segments.join(":");

export const ROOMS = {
    BRANCH: "branch",
} as const;
