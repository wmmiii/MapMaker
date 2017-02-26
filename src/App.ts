import Map from 'Map';
import Renderer from 'Renderer';
import {
  TileIndex,
  TileElementIndex,
  TileElementType
} from 'Tile';
import { Ui, Mode } from 'Ui';
import Vec from 'Vec';

export const init = (): App => {
  const container = document.getElementById("canvas-container");
  const canvas = <HTMLCanvasElement> document.getElementById("canvas");
  return new App(container, canvas);
}

export class App {
  private map: Map;

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: Ui;

  private hovered: TileElementIndex;
  private offset: Vec;

  private tileSize: number = 40;
  private edgeDist: number = 0.2;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;
    this.ui = new Ui(container, canvas);
    this.renderer = new Renderer(canvas, this.tileSize);
 
    this.hovered = null;
    this.offset = new Vec(0, 0);

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      this.renderer.render(null, this.offset, this.hovered);
    }; 

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  
    this.ui.onModeChange((mode: Mode) => {
      this.hovered = null;
    });

    this.ui.onHover((cords: Vec) => {
      this.hovered = this.getTileElementIndex(cords);
      this.renderer.render(null, this.offset, this.hovered);
    });

    this.ui.onMove((dist: Vec) => {
      this.renderer.render(null, this.offset.add(dist), this.hovered); 
    });

    this.ui.onMoveEnd((dist: Vec) => {
      this.offset = this.offset.add(dist);
      this.renderer.render(null, this.offset, this.hovered);
    });
  }

  private getTileElementIndex(cords: Vec): TileElementIndex {
    const tileSize = this.tileSize;
    const edgeDist = this.edgeDist;

    // Transform from canvas-space to map-space
    cords = cords.sub(this.offset);

    const tileBase = new Vec(
      Math.floor(cords.x / tileSize),
      Math.floor(cords.y / tileSize));

    // Transform from map-space to tile-space
    cords = new Vec(
      (cords.x - tileBase.x * tileSize) / tileSize,
      (cords.y - tileBase.y * tileSize) / tileSize);

    const distLeft = cords.x;
    const distRight = 1 - cords.x
    const distTop = cords.y;
    const distBottom = 1 - cords.y;

    if (distLeft < edgeDist) {
      if (distLeft <= distTop && distLeft <= distBottom) {
        return new TileElementIndex(new TileIndex(tileBase.x, tileBase.y), 
                                   TileElementType.LEFT_EDGE);
      }
    }
    
    if (distTop < edgeDist) {
      if (distTop <= distRight) {
        return new TileElementIndex(new TileIndex(tileBase.x, tileBase.y), 
                                   TileElementType.TOP_EDGE);
      }
    }
    
    if (distRight < edgeDist) {
      if (distRight <= distBottom) {
        return new TileElementIndex(new TileIndex(tileBase.x + 1, tileBase.y), 
                                   TileElementType.LEFT_EDGE);
      }
    }

    if (distBottom < edgeDist) {
      return new TileElementIndex(new TileIndex(tileBase.x, tileBase.y + 1), 
                                 TileElementType.TOP_EDGE);
    }

    return new TileElementIndex(new TileIndex(tileBase.x, tileBase.y),
                               TileElementType.SQUARE);
  }
}
