export interface Style {
  bgFill(): string | CanvasPattern;
  grid(): string;
  lineWidth(): number;

  hoverAdd(): string;
  hoverRemove(): string;

  barrierLine(): string;
  
  barrierFill(): string | CanvasPattern;
  terrainDifficult(): string | CanvasPattern;
  terrainWater(): string | CanvasPattern;
}