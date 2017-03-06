import Vec from 'Vec';

export interface Tool {
  cancel(): void;
  hover(startCoords: Vec, endCoords: Vec): void;
  select(startCoords: Vec, endCoords: Vec): void;
}

export enum ToolId {
  NONE,

  BOX_WALL,
  CIRCLE_WALL,
  DIAG_WALL,
  TERRAIN_DIFFICULT,
  TERRAIN_WATER,
  ERASER,
  MOVE,
  SHITTY_CIRCLE
}