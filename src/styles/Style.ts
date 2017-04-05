/**
 * Styles describe how various elements should be drawn when rendering a map.
 * They define color-pallets and fill patterns.
 */
export interface Style {
  /**
   * A string or CanvasPattern describing the background of the map.
   */
  bgFill(): string | CanvasPattern;

  /**
   * A string describing the color of the gridlines.
   */
  grid(): string;

  /**
   * The pixel width of the gridlines.
   */
  lineWidth(): number;

  /**
   * A string describing the color used when highlighting regions which will be
   * added on completion of an action.
   */
  highlightAdd(): string;

  /**
   * A string describing the color used when highlighting regions which will be
   * removed or otherwise altered on completion of an action.
   */
  highlightRemove(): string;

  /**
   * A string describing the color of edge regions marked as barriers.
   */
  barrierEdge(): string;
  
  /**
   * A string describing the color of fill regions marked as barriers.
   */
  barrierFill(): string | CanvasPattern;

  /**
   * A string or CanvasPattern describing the fill of regions marked as
   * difficult terrain.
   */
  terrainDifficult(): string | CanvasPattern;

  /**
   * A string or CanvasPattern describing the fill of regions marked as water.
   */
  terrainWater(): string | CanvasPattern;
}