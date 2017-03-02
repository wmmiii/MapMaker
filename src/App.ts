import BoxResolver from 'resolvers/BoxResolver';
import CircleResolver from 'resolvers/CircleResolver';
import DiagResolver from 'resolvers/DiagResolver';
import GameMap from 'GameMap';
import MoveTool from 'tools/MoveTool';
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
  private map: GameMap;
  private currentTool: Tool;
  private tools: Map<ToolId, Tool>;

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: Ui;

  private hovered: RegionIndex[];
  private offset: Vec;

  private tileSize: number = 40;
  private edgeDist: number = 0.2;

  constructor(container: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.canvas = container.querySelector("canvas");
    this.ui = new Ui(this, container, toolbar);
    this.renderer = new Renderer(this.canvas, this.tileSize);

    this.map = new GameMap();
    this.tools = new Map();
    this.tools.set(ToolId.BOX_WALL, new WallTool(this, BoxResolver.getInstance()));
    this.tools.set(ToolId.CIRCLE_TOOL, new WallTool(this, CircleResolver.getInstance()));
    this.tools.set(ToolId.DIAG_WALL, new WallTool(this, DiagResolver.getInstance()));
    this.tools.set(ToolId.MOVE, new MoveTool(this));
    this.setCurrentTool(ToolId.BOX_WALL);

    this.hovered = null;
    this.offset = Vec.of(0, 0);

    const resizeCanvas = () => {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;

      this.render();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  /* Member actions */
  getMap(): GameMap {
    return this.map;
  }

  setMap(map: GameMap): void {
    this.map = map;
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
    this.renderer.render(this.map, this.offset, this.hovered);
  }
}
