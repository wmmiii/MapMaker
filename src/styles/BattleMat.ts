import { Style } from 'Style';

/**
 * A Style reminiscent of a Chessex battle-mat.
 */
export default class BattleMat implements Style {
  private static instance: BattleMat;

  private difficult: CanvasPattern;

  private constructor() {
    let dtCanvas = document.createElement("canvas") as HTMLCanvasElement;
    dtCanvas.width = 20;
    dtCanvas.height = 20;
    let ctx = dtCanvas.getContext("2d");
    ctx.fillStyle = "rgba(77, 68, 57, 0.4)";
    ctx.arc(0, 0, 3, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.arc(20, 0, 3, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.arc(20, 20, 3, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.arc(0, 20, 3, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.arc(10, 10, 3, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    this.difficult = ctx.createPattern(dtCanvas, "repeat");
  }

  static getInstatnce(): BattleMat {
    if (!this.instance) {
      this.instance = new BattleMat();
    }
    return this.instance;
  }

  bgFill(): string | CanvasPattern {
    return "#efece8";
  }

  grid(): string {
    return "rgba(0, 0, 0, 0.1)";
  }

  lineWidth(): number {
    return 2;
  }

  highlightAdd(): string {
    return "#25BCDB";
  }

  highlightRemove(): string {
    return "#DB4425";
  }

  barrierEdge(): string {
    return "#3a332a";
  }

  barrierFill(): string | CanvasPattern {
    return "#3a332a";
  }

  terrainDifficult(): string | CanvasPattern {
    return this.difficult;
  }
  
  terrainWater(): string | CanvasPattern {
    return "#3C5399";
  }
}