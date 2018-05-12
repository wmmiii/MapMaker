import Vec from 'Vec';

/**
 * Tools alter the state of the map or application. The must interact with the
 * App and only the App.
 */
export interface Tool {
  /**
   * Called when the current action has been canceled. This method will be
   * called both when the user explicitly cancels the current action and when
   * there is a context-switch such as a mouse-out event or this tool is
   * deselected. This method should call App.setHovered([]) if applicable.
   */
  cancel(): void;

  /**
   * Called when the user is preparing to perform an action but has not yet
   * commited the action. This method should describe the action which will be
   * completed by updating App.setHovered( ... ) if applicable.
   * 
   * @param startCoords The starting coordinates in canvas-space of the
   *                    considered action.
   * @param endCoords The ending coordinates in canvas-space of the
   *                  considered action.
   */
  hover(startCoords: Vec, endCoords: Vec): void;

  /**
   * Called when the user has commited an action. This method should modify
   * the App and should call App.setHovered([]) if applicable.
   * 
   * @param startCoords The starting coordinates in canvas-space of the action.
   * @param endCoords The ending coordinates in canvas-space of the
   *                  action.
   */
  select(startCoords: Vec, endCoords: Vec): void;
}

/**
 * Identifiers for various implementations of tools.
 */
export enum ToolId {
  NONE,

  BOX_WALL,
  CIRCLE_WALL,
  DIAG_WALL,
  DOOR,
  TERRAIN_DIFFICULT,
  TERRAIN_WATER,
  ERASER,
  MOVE,
  SHITTY_CIRCLE
}