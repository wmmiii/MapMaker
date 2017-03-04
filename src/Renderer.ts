import Edge from 'Edge';
import Fill from 'Fill';
import GameMap from 'GameMap';
import {
  Index,
  Region,
  RegionIndex
} from 'Tile';
import Vec from 'Vec';
import { WallEdge, WallFill } from 'Wall';

export default class Renderer {
  private bgColor: string = "#efece8";
  private gridColor: string = "rgba(0, 0, 0, 0.1)";
  private hoverColor: string = "#25BCDB";
  private barrierColor: string = "#3a332a";
  private tileSize: number = 40;
  private lineWidth: number = 2;
  private mapCanvas: HTMLCanvasElement;
  private mapCtx: CanvasRenderingContext2D;
  private hoverCanvas: HTMLCanvasElement;
  private hoverCtx: CanvasRenderingContext2D;
  private offset: Vec;

  constructor(mainCanvas: HTMLCanvasElement, hoverCanvas: HTMLCanvasElement, tileSize: number) {
    this.mapCanvas = mainCanvas;
    this.mapCtx = mainCanvas.getContext("2d");

    this.hoverCanvas = hoverCanvas;
    this.hoverCtx = hoverCanvas.getContext("2d");
    
    this.tileSize = tileSize;
  }

  public render(map: GameMap, offset: Vec, hovered: RegionIndex[]) {
    this.offset = offset;
    this.clear();
    this.drawMap(map);
    this.drawGrid();
    if (hovered !== null && hovered.length !== 0) {
      this.drawHovered(hovered);
    }
  }

  public setTileSize(pixels: number) {
    this.tileSize = pixels;
  }

  private clear() {
    this.mapCtx.fillStyle = this.bgColor;
    this.mapCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
    this.mapCtx.fillRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
    this.hoverCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
  }

  private drawGrid() {
    const tileSize = this.tileSize;
    const canvasWidth = this.mapCanvas.width;
    const canvasHeight = this.mapCanvas.height;
    const ctx = this.mapCtx;

    const xShift = this.offset.x % tileSize;
    const yShift = this.offset.y % tileSize;

    ctx.save();
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = this.lineWidth;
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

  private drawMap(map: GameMap) {
    const ctx = this.mapCtx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.lineWidth = this.lineWidth;

    map.forEachTile((tile) => {
      tile.getWallEdges().forEach((edge: WallEdge, region: Region) => {
        if (edge === WallEdge.BARRIER) {
          ctx.strokeStyle = this.barrierColor;
          ctx.fillStyle = this.barrierColor;
          this.drawRegion(ctx, new RegionIndex(tile.index, region), true);
        }
      });
      tile.getWallFills().forEach((fill: WallFill, region: Region) => {
        if (fill === WallFill.BARRIER) {
          ctx.strokeStyle = this.barrierColor;
          ctx.fillStyle = this.barrierColor;
          this.drawRegion(ctx, new RegionIndex(tile.index, region), true);
        }
      });
    });

    ctx.restore();
  }

  private drawHovered(hovered: RegionIndex[]) {
    const ctx = this.hoverCtx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.fillStyle = this.hoverColor;
    ctx.strokeStyle = this.hoverColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    hovered.forEach(tileRegion => this.drawRegion(ctx, tileRegion));

    ctx.restore();
  }

  private drawRegion(ctx: CanvasRenderingContext2D, regionIndex: RegionIndex, includeEdges: boolean = false) {
    const tileSize = this.tileSize;
    ctx.save();
    ctx.translate(regionIndex.tileIndex.x * tileSize, regionIndex.tileIndex.y * tileSize);

    switch (regionIndex.tileRegion) {
      case Region.TOP_EDGE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.stroke();
        break;

      case Region.LEFT_EDGE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, tileSize);
        ctx.stroke();
        break;

      case Region.NW_CROSS:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.stroke();
        break;

      case Region.NE_CROSS:
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(0, tileSize);
        ctx.stroke();
        break;

      case Region.SQUARE:
        ctx.fillRect(0, 0, tileSize, tileSize);
        if (includeEdges) {
          ctx.strokeRect(0, 0, tileSize, tileSize);
        }
        break;

      case Region.UPPER_LEFT:
        ctx.beginPath();
        ctx.moveTo(0, tileSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.closePath();
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;

      case Region.UPPER_RIGHT:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.closePath();
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;

      case Region.LOWER_RIGHT:
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.closePath();
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;

      case Region.LOWER_LEFT:
        ctx.beginPath();
        ctx.moveTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  }
};
