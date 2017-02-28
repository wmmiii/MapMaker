import Vec from 'Vec';

export interface Tool {
    cancel(): void;
    hover(startCoords: Vec, endCoords: Vec): void;
    select(startCoords: Vec, endCoords: Vec): void;
}

export enum ToolId {
    MOVE,

    BOX_WALL,
    DIAG_WALL
}