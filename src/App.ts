import Edge from 'Edge';
import ElementResolver from 'ElementResolver';
import Fill from 'Fill';
import Map from 'Map';
import Renderer from 'Renderer';
import {
  Tile,
  TileIndex,
  TileElementIndex,
  TileElement
} from 'Tile';
import { Ui, Mode } from 'Ui';
import Vec from 'Vec';

export const init = (): App => {
  const container = document.getElementById("canvas-container");
  const toolbar = document.getElementById("toolbar");
  return new App(container, toolbar);
}

export class App {
  private map: Map;
  private mode: Mode;

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: Ui;
  private resolver: ElementResolver;

  private hovered: TileElementIndex;
  private offset: Vec;

  private tileSize: number = 40;
  private edgeDist: number = 0.2;

  constructor(container: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.canvas = container.querySelector("canvas");
    this.resolver = new ElementResolver(this.tileSize, this.edgeDist);
    this.ui = new Ui(container, toolbar);
    this.renderer = new Renderer(this.canvas, this.tileSize);

    this.map = new Map();

    this.hovered = null;
    this.offset = new Vec(0, 0);

    const resizeCanvas = () => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;

      this.renderer.render(this.map, this.offset, this.hovered);
    }; 

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  
    this.ui.onModeChange((mode: Mode) => {
      this.mode = mode;
      this.hovered = null;
    });

    this.ui.onHover((cords: Vec) => {
      this.hovered = this.resolver.resolve(cords.sub(this.offset), this.mode);
      this.renderer.render(this.map, this.offset, this.hovered);
    });

    this.ui.onMove((dist: Vec) => {
      this.renderer.render(this.map, this.offset.add(dist), this.hovered); 
    });

    this.ui.onMoveEnd((dist: Vec) => {
      this.offset = this.offset.add(dist);
      this.renderer.render(this.map, this.offset, this.hovered);
    });

    this.ui.onSelect((cords: Vec) => {
      const elementIndex = 
          this.resolver.resolve(cords.sub(this.offset), this.mode);
      let tile = this.map.getTile(elementIndex.tileIndex);
      if (tile == null) {
        tile = new Tile(elementIndex.tileIndex);
        this.map.addTile(tile);
      }

      switch (elementIndex.elementType) {
       case TileElement.SQUARE:
          if (tile.getSquare() === Fill.NONE) {
            tile.setSquare(Fill.BARRIER);
          } else {
            tile.setSquare(Fill.NONE);
          }
          break;
       case TileElement.TOP_EDGE:
          if (tile.getTopEdge() === Edge.NONE) {
            tile.setTopEdge(Edge.BARRIER);
          } else {
            tile.setTopEdge(Edge.NONE);
          }
          break;
        case TileElement.LEFT_EDGE:
          if (tile.getLeftEdge() === Edge.NONE) {
            tile.setLeftEdge(Edge.BARRIER);
          } else {
            tile.setLeftEdge(Edge.NONE);
          }
          break;
        case TileElement.UPPER_LEFT:
          if (tile.getUlFill() === Fill.NONE) {
            tile.setUlFill(Fill.BARRIER);
          } else {
            tile.setUlFill(Fill.NONE);
          }
          break;
        case TileElement.UPPER_RIGHT:
          if (tile.getUrFill() === Fill.NONE) {
            tile.setUrFill(Fill.BARRIER);
          } else {
            tile.setUrFill(Fill.NONE);
          }
          break;
        case TileElement.LOWER_RIGHT:
          if (tile.getLrFill() === Fill.NONE) {
            tile.setLrFill(Fill.BARRIER);
          } else {
            tile.setLrFill(Fill.NONE);
          }
          break;
        case TileElement.LOWER_LEFT:
          if (tile.getLlFill() === Fill.NONE) {
            tile.setLlFill(Fill.BARRIER);
          } else {
            tile.setLlFill(Fill.NONE);
          }
          break;
      }
      
      if (tile.noState()) {
        this.map.removeTile(tile.getIndex());
      }
    });
  }
}
