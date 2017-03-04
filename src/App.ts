import BoxResolver from 'resolvers/BoxResolver';
import CircleResolver from 'resolvers/CircleResolver';
import DiagResolver from 'resolvers/DiagResolver';
import EraserTool from 'tools/EraserTool';
import GameMap from 'GameMap';
import MoveTool from 'tools/MoveTool';
import ShittyCircleResolver from 'resolvers/ShittyCircleResolver';
import Renderer from 'Renderer';
import {
  Tile,
  Index,
  Region,
  RegionIndex
} from 'Tile';
import { Tool, ToolId } from 'tools/Tool';
import Ui from 'Ui';
import Vec from 'Vec';
import WallTool from 'tools/WallTool';

export const init = (): App => {
  const container = document.getElementById("canvas-container");
  const toolbar = document.getElementById("toolbar");
  return new App(container, toolbar);
}

export default class App {
  private mapHistory: Array<GameMap>;
  private currentMap: number;
  private lastMap: number;

  private tools: Map<ToolId, Tool>;
  private currentTool: Tool;

  private container: HTMLElement;
  private mapCanvas: HTMLCanvasElement;
  private hoverCanvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: Ui;

  private hovered: RegionIndex[];
  private offset: Vec;

  private tileSize: number = 40;
  private edgeDist: number = 0.2;

  constructor(container: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.mapCanvas = container.querySelector("#map-canvas") as HTMLCanvasElement;
    this.hoverCanvas = container.querySelector("#hover-canvas") as HTMLCanvasElement;
    this.ui = new Ui(this, container, toolbar);
    this.renderer = new Renderer(this.mapCanvas, this.hoverCanvas, this.tileSize);

    this.mapHistory = new Array<GameMap>();
    this.currentMap = 0;
    this.lastMap = 0;
    this.mapHistory[0] = new GameMap();
    
    this.tools = new Map();
    this.tools.set(ToolId.BOX_WALL, new WallTool(this, BoxResolver.getInstance()));
    this.tools.set(ToolId.CIRCLE_WALL, new WallTool(this, CircleResolver.getInstance()));
    this.tools.set(ToolId.DIAG_WALL, new WallTool(this, DiagResolver.getInstance()));
    this.tools.set(ToolId.ERASER, new EraserTool(this));
    this.tools.set(ToolId.SHITTY_CIRCLE, new WallTool(this, ShittyCircleResolver.getInstance()));
    this.tools.set(ToolId.MOVE, new MoveTool(this));
    this.setCurrentTool(ToolId.BOX_WALL);

    this.hovered = null;
    this.offset = Vec.of(0, 0);

    const resizeCanvas = () => {
      this.mapCanvas.width = this.hoverCanvas.width = container.clientWidth;
      this.mapCanvas.height = this.hoverCanvas.height = container.clientHeight;

      this.render();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  /* Member actions */
  getMap(): GameMap {
    return this.mapHistory[this.currentMap];
  }

  setMap(map: GameMap): void {
    this.lastMap = ++this.currentMap;
    this.mapHistory[this.currentMap] = map;
  }

  undo() {
    if (this.currentMap > 0) {
      this.currentMap--;
      this.render();
    }
  }

  redo() {
    if (this.currentMap < this.lastMap) {
      this.currentMap++;
      this.render();
    }
  }

  zoom(amount: number, loc: Vec) {
    const oldSIze = this.tileSize;
    this.setTileSize(this.tileSize + amount);
    if (oldSIze !== this.tileSize) {
      const scale = amount / oldSIze;
      this.setOffset(this.offset.sub(loc.sub(this.offset).mul(scale)));
    }
  }

  getOffset(): Vec {
    return this.offset;
  }

  setOffset(offset: Vec): void {
    this.offset = offset;
  }

  getTileSize(): number {
    return this.tileSize;
  }

  setTileSize(pixels: number) {
    if (pixels > 80) {
      pixels = 80;
    } else if (pixels < 10) {
      pixels = 10;
    }
    this.tileSize = pixels;
    this.renderer.setTileSize(this.tileSize);
    this.render();
  }

  setHovered(hovered: RegionIndex[]): void {
    this.hovered = hovered;
  }

  /* Tool methods */
  setCurrentTool(toolId: ToolId): void {
    this.currentTool = this.tools.get(toolId);
    this.ui.setTool(toolId);
  }

  cancel(): void {
    this.currentTool.cancel();
    this.render();
  }

  hover(startCoords: Vec, endCoords: Vec): void {
    this.currentTool.hover(startCoords, endCoords);
    this.render();
  }

  select(startCoords: Vec, endCoords: Vec): void {
    this.currentTool.select(startCoords, endCoords);
    this.render();
  }

  /* Utility methods */
  toMapSpace(vec: Vec) {
    return vec.sub(this.offset).mul(1 / this.tileSize);
  }

  private render(): void {
    this.renderer.render(this.mapHistory[this.currentMap], this.offset, this.hovered);
  }
}
