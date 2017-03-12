import BoxResolver from 'resolvers/BoxResolver';
import CircleResolver from 'resolvers/CircleResolver';
import DiagResolver from 'resolvers/DiagResolver';
import DoorTool from 'tools/DoorTool';
import { Fill } from 'RegionTypes';
import EraserTool from 'tools/EraserTool';
import GameMap from 'GameMap';
import { Hover } from 'Hover';
import MoveTool from 'tools/MoveTool';
import * as Porter from 'Porter';
import Renderer from 'Renderer';
import ShittyCircleResolver from 'resolvers/ShittyCircleResolver';
import TerrainTool from 'tools/TerrainTool';
import { RegionIndex } from 'Tile';
import { Tool, ToolId } from 'tools/Tool';
import Ui from 'Ui';
import Vec from 'Vec';
import WallTool from 'tools/WallTool';

export const init = (): App => {
  const container = document.getElementById("canvas-container");
  const metabar = document.getElementById("metabar");
  const toolbar = document.getElementById("toolbar");
  return new App(container, metabar, toolbar);
}

export default class App {
  private mapHistory: Array<[GameMap, string]>;
  private currentMap: number;
  private lastMap: number;

  private tools: Map<ToolId, Tool>;
  private currentTool: Tool;

  private container: HTMLElement;
  private mapCanvas: HTMLCanvasElement;
  private hoverCanvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: Ui;

  private hovered: [RegionIndex, Hover][];
  private offset: Vec;

  private tileSize: number = 40;

  constructor(container: HTMLElement, metabar: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.mapCanvas = container.querySelector("#map-canvas") as HTMLCanvasElement;
    this.hoverCanvas = container.querySelector("#hover-canvas") as HTMLCanvasElement;
    this.ui = new Ui(this, container, metabar, toolbar);
    this.renderer = new Renderer(this.mapCanvas, this.hoverCanvas, this.tileSize);

    this.mapHistory = new Array<[GameMap, string]>();
    this.currentMap = 0;
    this.lastMap = 0;
    this.mapHistory[0] = [new GameMap(), 'Initialize map.'];
    
    this.tools = new Map();
    this.tools.set(ToolId.BOX_WALL, new WallTool(this, BoxResolver.getInstance()));
    this.tools.set(ToolId.CIRCLE_WALL, new WallTool(this, CircleResolver.getInstance()));
    this.tools.set(ToolId.DIAG_WALL, new WallTool(this, DiagResolver.getInstance()));
    this.tools.set(ToolId.DOOR, new DoorTool(this));
    this.tools.set(ToolId.TERRAIN_DIFFICULT, new TerrainTool(this, Fill.TERRAIN_DIFFICULT));
    this.tools.set(ToolId.TERRAIN_WATER, new TerrainTool(this, Fill.TERRAIN_WATER));
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
    return this.mapHistory[this.currentMap][0];
  }

  setMap(map: GameMap, change: string): void {
    if (this.getMap() !== map) {
      this.lastMap = ++this.currentMap;
      this.mapHistory[this.currentMap] = [map, change];
      this.ui.mapChange();
    }
  }

  undo() {
    if (this.currentMap > 0) {
      this.currentMap--;
      this.render();
      this.ui.mapChange();
    }
  }

  redo() {
    if (this.currentMap < this.lastMap) {
      this.currentMap++;
      this.render();
      this.ui.mapChange();
    }
  }

  export(): string {
    return new Porter.Exporter().export(this.getMap());
  }

  import(string: string) {
    const map = new Porter.Importer().import(string);
    this.setMap(map, 'Open map file.');
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

  setHovered(hovered: [RegionIndex, Hover][]): void {
    this.hovered = hovered;
  }

  /* Tool methods */
  setCurrentTool(toolId: ToolId): void {
    this.currentTool = this.tools.get(toolId);
    this.ui.setTool(toolId);
  }

  cancel(): void {
    this.currentTool.cancel();
  }

  hover(startCoords: Vec, endCoords: Vec): void {
    this.currentTool.hover(startCoords, endCoords);
  }

  select(startCoords: Vec, endCoords: Vec): void {
    this.currentTool.select(startCoords, endCoords);
  }

  /* Utility methods */
  toMapSpace(vec: Vec) {
    return vec.sub(this.offset).mul(1 / this.tileSize);
  }

  render(): void {
    this.renderer.render(this.getMap(), this.offset, this.hovered);
  }
}
