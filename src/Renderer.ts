import Edge from 'Edge';
import Fill from 'Fill';
import Map from 'Map';
import {
  TileIndex,
  TileElementIndex,
  TileElement 
} from 'Tile';
import Vec from 'Vec';

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

  public render(map: Map, offset: Vec, hovered: TileElementIndex) {
    this.offset = offset;
    this.clear();
    this.drawGrid();
    this.drawMap(map);
    this.drawHovered(hovered);
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

  private drawMap(map: Map) {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.offset.x, this.offset.y);
    ctx.lineWidth = this.lineWidth;

    for (var key in map.getTiles()) {
      const tile = map.getTiles()[key];
      console.log(tile);
      if (tile.getFill(TileElement.SQUARE) === Fill.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        ctx.fillStyle = this.barrierColor;
        this.fillSquare(tile.getIndex(), true);
      }
      if (tile.getFill(TileElement.UPPER_LEFT) === Fill.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        ctx.fillStyle = this.barrierColor;
        this.fillUl(tile.getIndex(), true);
      }
      if (tile.getFill(TileElement.UPPER_RIGHT) === Fill.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        ctx.fillStyle = this.barrierColor;
        this.fillUr(tile.getIndex(), true);
      }
      if (tile.getFill(TileElement.LOWER_RIGHT) === Fill.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        ctx.fillStyle = this.barrierColor;
        this.fillLr(tile.getIndex(), true);
      }
      if (tile.getFill(TileElement.LOWER_LEFT) === Fill.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        ctx.fillStyle = this.barrierColor;
        this.fillLl(tile.getIndex(), true);
      }
      if (tile.getEdge(TileElement.TOP_EDGE) === Edge.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        this.drawTopEdge(tile.getIndex());
      }
      if (tile.getEdge(TileElement.LEFT_EDGE) === Edge.BARRIER) {
        ctx.strokeStyle = this.barrierColor;
        this.drawLeftEdge(tile.getIndex());
      }
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

    switch(hovered.elementType) {
      case TileElement.SQUARE:
        this.fillSquare(hovered.tileIndex);
        break;
      case TileElement.TOP_EDGE:
        this.drawTopEdge(hovered.tileIndex);
        break;
      case TileElement.LEFT_EDGE:
        this.drawLeftEdge(hovered.tileIndex);
        break;
      case TileElement.UPPER_LEFT:
        this.fillUl(hovered.tileIndex);
        break;
      case TileElement.UPPER_RIGHT:
        this.fillUr(hovered.tileIndex);
        break;
      case TileElement.LOWER_RIGHT:
        this.fillLr(hovered.tileIndex);
        break;
      case TileElement.LOWER_LEFT:
        this.fillLl(hovered.tileIndex);
        break;
    }

    ctx.restore();
  }

  /**
   * Draws the square of a tile in map-space;
   */
  private fillSquare(index: TileIndex, includeEdges: boolean = false) {
    const tileSize = this.tileSize;
    this.ctx.fillRect(index.x * tileSize, index.y * tileSize,
                      tileSize, tileSize);
    if (includeEdges) {
      this.ctx.strokeRect(index.x * tileSize, index.y * tileSize,
                          tileSize, tileSize);
    }

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

  private fillUl(index: TileIndex, includeEdges: boolean = false) {
    const ctx = this.ctx;
    const tileSize = this.tileSize;
    ctx.beginPath();
    ctx.moveTo(index.x * tileSize, index.y * tileSize + tileSize);
    ctx.lineTo(index.x * tileSize, index.y * tileSize);
    ctx.lineTo(index.x * tileSize + tileSize, index.y * tileSize);
    ctx.fill();
    if (includeEdges) {
      ctx.stroke();
    }
  }

  private fillUr(index: TileIndex, includeEdges: boolean = false) {
    const ctx = this.ctx;
    const tileSize = this.tileSize;
    ctx.beginPath();
    ctx.moveTo(index.x * tileSize, index.y * tileSize);
    ctx.lineTo(index.x * tileSize + tileSize, index.y * tileSize);
    ctx.lineTo(index.x * tileSize + tileSize, index.y * tileSize + tileSize);
    ctx.fill();
    if (includeEdges) {
      ctx.stroke();
    }
  }

  private fillLr(index: TileIndex, includeEdges: boolean = false) {
    const ctx = this.ctx;
    const tileSize = this.tileSize;
    ctx.beginPath();
    ctx.moveTo(index.x * tileSize + tileSize, index.y * tileSize);
    ctx.lineTo(index.x * tileSize + tileSize, index.y * tileSize + tileSize);
    ctx.lineTo(index.x * tileSize, index.y * tileSize + tileSize);
    ctx.fill();
    if (includeEdges) {
      ctx.stroke();
    }
  }

  private fillLl(index: TileIndex, includeEdges: boolean = false) {
    const ctx = this.ctx;
    const tileSize = this.tileSize;
    ctx.beginPath();
    ctx.moveTo(index.x * tileSize + tileSize, index.y * tileSize + tileSize);
    ctx.lineTo(index.x * tileSize, index.y * tileSize + tileSize);
    ctx.lineTo(index.x * tileSize, index.y * tileSize);
    ctx.fill();
    if (includeEdges) {
      ctx.stroke();
    }
  }

};
