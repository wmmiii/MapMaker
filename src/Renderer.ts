export default class Renderer {
  private bgColor: string = "#EEE";
  private gridColor: string = "#222";
  private gridSize: number = 40;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private xOffset: number = 0;
  private yOffset: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  //PROTIP (will): Move everything into a single render method.
  public clear() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawGrid() {
    const gridSize = this.gridSize;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(this.xOffset, this.yOffset);
    ctx.strokeStyle = this.gridColor;
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }
    ctx.restore();
  }

  public setOffset(x: number, y: number) {
    this.xOffset = x;
    this.yOffset = y;
  }
};
