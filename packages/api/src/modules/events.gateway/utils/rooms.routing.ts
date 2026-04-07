import ROOMS from "../constants/rooms";

type RoomValue = typeof ROOMS[keyof typeof ROOMS];
type RouteSegment = [RoomValue, string | number];

export const createRoute = (...segments: RouteSegment[]): string => {
    return segments.map(([room, value]) => `${room}:${value}`).join(":");
};
