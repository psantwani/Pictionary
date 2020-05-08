import { Schema } from "@colyseus/schema";
import { Path } from "./State";
export declare class Player extends Schema {
    name: string;
    lastPath: Path;
}
