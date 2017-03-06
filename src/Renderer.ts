import BattleMat from 'styles/BattleMat';
import { Edge, Fill } from 'RegionTypes';
import GameMap from 'GameMap';
import { Hover } from 'Hover';
import { Style } from 'styles/Style';
import {
  Index,
  Region,
  RegionIndex
} from 'Tile';
import Vec from 'Vec';

export default class Renderer {
  private tileSize: number = 40;
  private diffPatt: any;
  private mapCanvas: HTMLCanvasElement;
  private mapCtx: CanvasRenderingContext2D;
  private hoverCanvas: HTMLCanvasElement;
  private hoverCtx: CanvasRenderingContext2D;
  private offset: Vec;
  private style: Style;

  constructor(mainCanvas: HTMLCanvasElement, hoverCanvas: HTMLCanvasElement, tileSize: number) {
    this.mapCanvas = mainCanvas;
    this.mapCtx = mainCanvas.getContext("2d");

    this.hoverCanvas = hoverCanvas;
    this.hoverCtx = hoverCanvas.getContext("2d");

    this.tileSize = tileSize;

    this.style = BattleMat.getInstatnce();
  }

  public render(map: GameMap, offset: Vec, hovered: [RegionIndex, Hover][]) {
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
    this.mapCtx.fillStyle = this.style.bgFill();
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
    ctx.strokeStyle = this.style.grid();
    ctx.lineWidth = this.style.lineWidth();
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
    const tileSize = this.tileSize;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.lineWidth = this.style.lineWidth();

    const diffDist = 12;

    map.forEachTile((tile) => {
      tile.getEdges().forEach((edge: Edge, region: Region) => {
        if (edge === Edge.BARRIER) {
          ctx.strokeStyle = this.style.barrierLine();
          ctx.fillStyle = this.style.barrierFill();
          this.drawRegion(ctx, new RegionIndex(tile.index, region), true);
        }
      });
      tile.getFills().forEach((fill: Fill, region: Region) => {
        if (fill === Fill.BARRIER) {
          ctx.strokeStyle = this.style.barrierLine();
          ctx.fillStyle = this.style.barrierFill();
          this.drawRegion(ctx, new RegionIndex(tile.index, region), true);
        } else if (fill === Fill.TERRAIN_DIFFICULT) {
          ctx.fillStyle = this.style.terrainDifficult();
          this.drawRegion(ctx, new RegionIndex(tile.index, region));
        } else if (fill === Fill.TERRAIN_WATER) {
          ctx.fillStyle = this.style.terrainWater();
          this.drawRegion(ctx, new RegionIndex(tile.index, region));
        }
      });
    });

    ctx.restore();
  }

  private drawHovered(hovered: [RegionIndex, Hover][]) {
    const ctx = this.hoverCtx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    hovered.forEach(([regionIndex, hover]) => {
      if (hover === Hover.ADD) {
        ctx.fillStyle = this.style.hoverAdd();
        ctx.strokeStyle = this.style.hoverAdd();
      } else if (hover === Hover.REMOVE) {
        ctx.fillStyle = this.style.hoverRemove();
        ctx.strokeStyle = this.style.hoverRemove();
      } else {
        throw new Error();
      }

      this.drawRegion(ctx, regionIndex);
    });

    ctx.restore();
  }

  /**
   * Draws a region in map-space using whatever styles were set on ctx before.
   * 
   * @param ctx The rendering context to draw the region to. 
   * @param regionIndex The index describing the region to draw.
   * @param includeEdges If lines should be stroked for fill regions.
   */
  private drawRegion(ctx: CanvasRenderingContext2D, regionIndex: RegionIndex, includeEdges: boolean = false) {
    const tileSize = this.tileSize;
    ctx.save();
    ctx.translate(regionIndex.tileIndex.x * tileSize, regionIndex.tileIndex.y * tileSize);
    this.traceRegion(ctx, regionIndex.tileRegion);

    ctx.restore();
    if (regionIndex.tileRegion.isEdge() || includeEdges) {
      ctx.stroke();
    }
    if (regionIndex.tileRegion.isFill()) {
      ctx.fill();
    }
  }

  private traceRegion(ctx: CanvasRenderingContext2D, region: Region) {
    const tileSize = this.tileSize;
    switch (region) {
      case Region.TOP_EDGE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        break;

      case Region.LEFT_EDGE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, tileSize);
        break;

      case Region.NW_CROSS:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, tileSize);
        break;

      case Region.NE_CROSS:
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(0, tileSize);
        break;

      case Region.SQUARE:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.closePath();
        break;

      case Region.UPPER_LEFT:
        ctx.beginPath();
        ctx.moveTo(0, tileSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.closePath();
        break;

      case Region.UPPER_RIGHT:
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.closePath();
        break;

      case Region.LOWER_RIGHT:
        ctx.beginPath();
        ctx.moveTo(tileSize, 0);
        ctx.lineTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.closePath();
        break;

      case Region.LOWER_LEFT:
        ctx.beginPath();
        ctx.moveTo(tileSize, tileSize);
        ctx.lineTo(0, tileSize);
        ctx.lineTo(0, 0);
        ctx.closePath();
        break;
    }
  }
};
