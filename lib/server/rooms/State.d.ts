import { Schema, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player } from "./Player";
export declare enum BRUSH {
    SKETCH = "s",
    MARKER = "m",
    PEN = "p",
    ERASER = "e"
}
export declare const DEFAULT_BRUSH = BRUSH.PEN;
export declare class Path extends Schema {
    brush: any;
    color: number;
    points: ArraySchema<number>;
}
export declare class State extends Schema {
    countdown: number;
    players: MapSchema<Player>;
    paths: ArraySchema<Path>;
    createPlayer(sessionId: string): any;
    removePlayer(sessionId: string): void;
}
