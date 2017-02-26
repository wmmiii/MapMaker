import Map from 'Map';
import {
  TileIndex,
  TileElementIndex,
  TileElementType 
} from 'Tile';
import Vec from 'Vec';

export default class Renderer {
  private bgColor: string = "#efece8";
  private gridColor: string = "#d8d5d2";
  private hoverColor: string = "rgba(37, 188, 219, 0.4)";
  private tileSize: number = 40;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offset: Vec;

  constructor(canvas: HTMLCanvasElement, tileSize: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.tileSize = tileSize;
  }

  public render(map: Map, offset: Vec, hovered: TileElementIndex) {
    this.offset = offset;
    this.clear();
    this.drawGrid();

    this.drawHovered(hovered);
  }

  //PROTIP (will): Move everything into a single render method.
  private clear() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGrid() {
    const tileSize = this.tileSize;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const ctx = this.ctx;

    const xShift = this.offset.x % tileSize;
    const yShift = this.offset.y % tileSize;

    ctx.save();
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "butt";

    for (let i = xShift; i <= canvasWidth; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }
    for (let i = yShift; i <= canvasHeight; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHovered(hovered: TileElementIndex) {
    if (hovered === null) {
      return;
    }
    
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.fillStyle = this.hoverColor;
    ctx.strokeStyle = this.hoverColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    switch(hovered.element) {
      case TileElementType.SQUARE:
        this.drawSquare(hovered.index);
        break;
      case TileElementType.TOP_EDGE:
        this.drawTopEdge(hovered.index);
        break;
      case TileElementType.LEFT_EDGE:
        this.drawLeftEdge(hovered.index);
        break;
    }

    ctx.restore();
  }

  /**
   * Draws the square of a tile in map-space;
   */
  private drawSquare(index: TileIndex) {
    const tileSize = this.tileSize;
    this.ctx.fillRect(index.x * tileSize, index.y * tileSize, 
                      tileSize, tileSize);

  }

  /**
   * Draws the top edge of a tile in map-space.
   */
  private drawTopEdge(index: TileIndex) {
    const ctx = this.ctx;
    const tileSize = this.tileSize;
    ctx.beginPath();
    ctx.moveTo(index.x * tileSize, index.y * tileSize);
    ctx.lineTo(index.x * tileSize + tileSize, index.y * tileSize);
    ctx.stroke();
  }

  /**
   * Draws the left edge of a tile in map-space.
   */
  private drawLeftEdge(index: TileIndex) {
    const ctx = this.ctx;
    const tileSize = this.tileSize;
    ctx.beginPath();
    ctx.moveTo(index.x * tileSize, index.y * tileSize);
    ctx.lineTo(index.x * tileSize, index.y * tileSize + tileSize);
    ctx.stroke();
  }
};
