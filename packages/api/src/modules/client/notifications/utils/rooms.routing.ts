export const createRoute = (segments: (string | number)[]): string =>
    segments.join(":");
