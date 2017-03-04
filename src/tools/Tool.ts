import Vec from 'Vec';

export interface Tool {
  cancel(): void;
  hover(startCoords: Vec, endCoords: Vec): void;
  select(startCoords: Vec, endCoords: Vec): void;
}

export enum ToolId {
  NONE,

  MOVE,

  BOX_WALL,
  CIRCLE_WALL,
  DIAG_WALL,
  SHITTY_CIRCLE_TOOL
}