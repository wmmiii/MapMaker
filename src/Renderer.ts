import Edge from 'Edge';
import Fill from 'Fill';
import GameMap from 'GameMap';
import {
  TileIndex,
  TileRegion,
  TileRegionIndex
} from 'Tile';
import Vec from 'Vec';
import { WallEdge, WallFill } from 'Wall';

export default class Renderer {
  private bgColor: string = "#efece8";
  private gridColor: string = "#d8d5d2";
  private hoverColor: string = "rgba(37, 188, 219, 0.4)";
  private barrierColor: string = "#1c1711"
  private tileSize: number = 40;
  private lineWidth: number = 2;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offset: Vec;

  constructor(canvas: HTMLCanvasElement, tileSize: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.tileSize = tileSize;
  }

  public render(map: GameMap, offset: Vec, hovered: TileRegionIndex[]) {
    this.offset = offset;
    this.clear();
    this.drawGrid();
    this.drawMap(map);
    if (hovered !== null && hovered.length !== 0) {
      this.drawHovered(hovered);
    }
  }

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
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.lineWidth = this.lineWidth;

    map.getTiles().forEach((tile) => {
      tile.getWallEdges().forEach((edge: WallEdge, region: TileRegion) => {
        if (edge === WallEdge.BARRIER) {
          ctx.strokeStyle = this.barrierColor;
          ctx.fillStyle = this.barrierColor;
          this.drawRegion(new TileRegionIndex(tile.index, region), true);
        }
      });
      tile.getWallFills().forEach((fill: WallFill, region: TileRegion) => {
        if (fill === WallFill.BARRIER) {
          ctx.strokeStyle = this.barrierColor;
          ctx.fillStyle = this.barrierColor;
          this.drawRegion(new TileRegionIndex(tile.index, region), true);
        }
      });
    });

    ctx.restore();
  }

  private drawHovered(hovered: TileRegionIndex[]) {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.fillStyle = this.hoverColor;
    ctx.strokeStyle = this.hoverColor;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    hovered.forEach(tileRegion => this.drawRegion(tileRegion));

    ctx.restore();
  }

  private drawRegion(regionIndex: TileRegionIndex, includeEdges: boolean = false) {
    const tileSize = this.tileSize;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(regionIndex.tileIndex.x * tileSize, regionIndex.tileIndex.y * tileSize);

    switch (regionIndex.tileRegion) {
      case TileRegion.TOP_EDGE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.stroke();
        break;

      case TileRegion.LEFT_EDGE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, tileSize);
        ctx.stroke();
        break;

      case TileRegion.NW_CROSS:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.stroke();
        break;

      case TileRegion.NE_CROSS:
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(0, tileSize);
        ctx.stroke();
        break;

      case TileRegion.SQUARE:
        ctx.fillRect(0, 0, tileSize, tileSize);
        if (includeEdges) {
          ctx.strokeRect(0, 0, tileSize, tileSize);
        }
        break;

      case TileRegion.UPPER_LEFT:
        ctx.beginPath();
        ctx.moveTo(0, tileSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;

      case TileRegion.UPPER_RIGHT:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;

      case TileRegion.LOWER_RIGHT:
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;

      case TileRegion.LOWER_LEFT:
        ctx.beginPath();
        ctx.moveTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.lineTo(0, 0);
        ctx.fill();
        if (includeEdges) {
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  }
};
