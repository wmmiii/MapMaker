import BattleMat from 'styles/BattleMat';
import { Edge, Fill } from 'RegionTypes';
import GameMap from 'GameMap';
import { Hover } from 'Hover';
import { Style } from 'styles/Style';
import {
  Region,
  RegionIndex
} from 'Tile';
import Vec from 'Vec';

/**
 * The Renderer renders the GameMap and other states described by App to the 
 * provided HTML5 canvases.
 */
export default class Renderer {
  private tileSize: number = 40;
  private mapCanvas: HTMLCanvasElement;
  private mapCtx: CanvasRenderingContext2D;
  private hoverCanvas: HTMLCanvasElement;
  private hoverCtx: CanvasRenderingContext2D;
  private offset: Vec;
  private style: Style;

  /**
   * Creates a new Renderer object.
   * 
   * @param mainCanvas The canvas to draw the map to.
   * @param hoverCanvas The canvas to draw hover states to.
   * @param tileSize The initial size of the map tiles in pixels.
   */
  constructor(mainCanvas: HTMLCanvasElement, hoverCanvas: HTMLCanvasElement, tileSize: number) {
    this.mapCanvas = mainCanvas;
    this.mapCtx = mainCanvas.getContext("2d");

    this.hoverCanvas = hoverCanvas;
    this.hoverCtx = hoverCanvas.getContext("2d");

    this.tileSize = tileSize;

    this.style = BattleMat.getInstatnce();
  }

  /**
   * Renders the current state of the application to the canvases.
   * 
   * @param map The GameMap to render.
   * @param offset The offset in pixels of the viewport in canvas-space.
   * @param hovered The RegionIndexes which are being considered for
   *                modification and how they will be modified.
   */
  render(map: GameMap, offset: Vec, hovered: [RegionIndex, Hover][]) {
    this.offset = offset;
    this.clear();
    this.drawMap(map);
    this.drawGrid();
    if (hovered !== null && hovered.length !== 0) {
      this.drawHovered(hovered);
    }
  }

  /**
   * Sets the width and height of the tiles in pixels to draw in canvas-space.
   * 
   * @param pixels The width and height of the tiles.
   */
  setTileSize(pixels: number) {
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
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.lineWidth = this.style.lineWidth();

    map.forEachTile((tile) => {
      tile.getFills().forEach((fill: Fill, region: Region) => {
        const regionIndex = new RegionIndex(tile.index, region);
        if (fill === Fill.BARRIER) {
          ctx.strokeStyle = this.style.barrierEdge();
          ctx.fillStyle = this.style.barrierFill();
          this.drawRegion(ctx, regionIndex, true);
        } else if (fill === Fill.TERRAIN_DIFFICULT) {
          ctx.fillStyle = this.style.terrainDifficult();
          this.drawRegion(ctx, regionIndex);
        } else if (fill === Fill.TERRAIN_WATER) {
          ctx.fillStyle = this.style.terrainWater();
          this.drawRegion(ctx, regionIndex);
        }
      });
    });

    map.forEachTile((tile) => {
      tile.getEdges().forEach((edge: Edge, region: Region) => {
        const regionIndex = new RegionIndex(tile.index, region);
        if (edge === Edge.BARRIER) {
          ctx.strokeStyle = this.style.barrierEdge();
          ctx.fillStyle = this.style.barrierFill();
          this.drawRegion(ctx, regionIndex, true);
        } else if (edge === Edge.DOOR) {
          this.drawDoor(ctx, regionIndex, false);
        } else if (edge === Edge.DOOR_LOCKED) {
          this.drawDoor(ctx, regionIndex, true);
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
        ctx.fillStyle = this.style.highlightAdd();
        ctx.strokeStyle = this.style.highlightAdd();
      } else if (hover === Hover.REMOVE) {
        ctx.fillStyle = this.style.highlightRemove();
        ctx.strokeStyle = this.style.highlightRemove();
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

  private drawDoor(ctx: CanvasRenderingContext2D, regionIndex: RegionIndex, locked: boolean) {
    const tileSize = this.tileSize;
    const lineWidth = this.style.lineWidth();

    ctx.save();
    ctx.translate(regionIndex.tileIndex.x * tileSize, regionIndex.tileIndex.y * tileSize);
    ctx.fillStyle = this.style.bgFill();
    ctx.strokeStyle = this.style.barrierEdge();
    ctx.lineWidth = lineWidth / 2;

    switch (regionIndex.tileRegion) {
      case Region.TOP_EDGE:
        ctx.fillRect(0, -lineWidth * 2, tileSize, lineWidth * 4);
        ctx.strokeRect(0, -lineWidth * 2, tileSize, lineWidth * 4);
        if (locked) {
          ctx.translate(tileSize / 2, 0);
          this.drawLock(ctx);
        }
        break;
      case Region.LEFT_EDGE:
        ctx.fillRect(-lineWidth * 2, 0, lineWidth * 4, tileSize);
        ctx.strokeRect(-lineWidth * 2, 0, lineWidth * 4, tileSize);
        if (locked) {
          ctx.translate(0, tileSize / 2);
          this.drawLock(ctx);
        }
        break;
      case Region.NW_CROSS:
        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(0, -lineWidth * 2, tileSize * Math.SQRT2, lineWidth * 4);
        ctx.strokeRect(0, -lineWidth * 2, tileSize * Math.SQRT2, lineWidth * 4);
        ctx.restore();
        if (locked) {
          ctx.translate(tileSize / 2, tileSize / 2);
          this.drawLock(ctx);
        }
        break;
      case Region.NE_CROSS:
        ctx.save();
        ctx.translate(tileSize, 0);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-lineWidth * 2, 0, lineWidth * 4, tileSize * Math.SQRT2);
        ctx.strokeRect(-lineWidth * 2, 0, lineWidth * 4, tileSize * Math.SQRT2);
        ctx.restore();
        if (locked) {
          ctx.translate(tileSize / 2, tileSize / 2);
          this.drawLock(ctx);
        }
        break;
    }

    ctx.restore();
  }

  private drawLock(ctx: CanvasRenderingContext2D) {
    const lineWidth = this.style.lineWidth();

    ctx.fillStyle = this.style.bgFill();
    ctx.strokeStyle = this.style.barrierEdge();
    ctx.lineWidth = lineWidth / 2;

    ctx.beginPath();
    ctx.arc(0, 0, lineWidth * 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.style.barrierEdge();

    ctx.beginPath();
    ctx.arc(0, -lineWidth, lineWidth * 1.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -lineWidth);
    ctx.lineTo(-lineWidth * 1, lineWidth * 3);
    ctx.lineTo(lineWidth * 1, lineWidth * 3);
    ctx.closePath();
    ctx.fill();
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
