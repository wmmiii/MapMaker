import BarrierTool from 'tools/BarrierTool';
import BoxResolver from 'resolvers/BoxResolver';
import CircleResolver from 'resolvers/CircleResolver';
import DiagResolver from 'resolvers/DiagResolver';
import DoorTool from 'tools/DoorTool';
import { Fill } from 'RegionTypes';
import FillTool from 'tools/FillTool';
import EraserTool from 'tools/EraserTool';
import GameMap from 'GameMap';
import { Hover } from 'Hover';
import MoveTool from 'tools/MoveTool';
import * as Porter from 'Porter';
import Renderer from 'Renderer';
import ShittyCircleResolver from 'resolvers/ShittyCircleResolver';
import { RegionIndex } from 'Tile';
import { Tool, ToolId } from 'tools/Tool';
import Ui from 'Ui';
import Vec from 'Vec';

/**
 * The bootstrapper of the Map Maker application which wires up DOM elements
 * and creates the App.
 */
export const init = (): App => {
  const container = document.getElementById("canvas-container");
  const metabar = document.getElementById("metabar");
  const toolbar = document.getElementById("toolbar");
  return new App(container, metabar, toolbar);
}

/**
 * The main class of the Map Maker application. It exposes methods to retrieve
 * internal state and to use tools which may be used to modify internal state.
 */
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
    this.tools.set(ToolId.BOX_WALL, new BarrierTool(this, BoxResolver.getInstance()));
    this.tools.set(ToolId.CIRCLE_WALL, new BarrierTool(this, CircleResolver.getInstance()));
    this.tools.set(ToolId.DIAG_WALL, new BarrierTool(this, DiagResolver.getInstance()));
    this.tools.set(ToolId.DOOR, new DoorTool(this));
    this.tools.set(ToolId.TERRAIN_DIFFICULT, new FillTool(this, Fill.TERRAIN_DIFFICULT));
    this.tools.set(ToolId.TERRAIN_WATER, new FillTool(this, Fill.TERRAIN_WATER));
    this.tools.set(ToolId.ERASER, new EraserTool(this));
    this.tools.set(ToolId.SHITTY_CIRCLE, new BarrierTool(this, ShittyCircleResolver.getInstance()));
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

  /**
   * Returns the current GameMap.
   */
  getMap(): GameMap {
    return this.mapHistory[this.currentMap][0];
  }

  /**
   * Sets the current GameMap. If the map is unchanged the undo/redo stack
   * will not be effected.
   * 
   * @param map The current state of the map to store.
   * @param change A human-readable description of the change which prompted
   *               the update.
   */
  setMap(map: GameMap, change: string): void {
    if (this.getMap() !== map) {
      this.lastMap = ++this.currentMap;
      this.mapHistory[this.currentMap] = [map, change];
      this.ui.onMapChange();
      this.render();
    }
  }

  /**
   * Reverts the current GameMap to a state before the last effective
   * setMap(...) call if such a state exists.
   */
  undo() {
    if (this.currentMap > 0) {
      this.currentMap--;
      this.render();
      this.ui.onMapChange();
    }
  }

  /**
   * Sets the current GameMap the earliest reverted state if such a state
   * exists and no modifications to previous states have occured. If this
   * call is successful the state is no longer considered reverted.
   */
  redo() {
    if (this.currentMap < this.lastMap) {
      this.currentMap++;
      this.render();
      this.ui.onMapChange();
    }
  }

  /**
   * Returns a serialized version of the current GameMap.
   */
  export(): string {
    return new Porter.Exporter().export(this.getMap());
  }

  /**
   * Sets the current GameMap to the state described by the serializedMap
   * string.
   * 
   * @param serializedMap The serialized state of new current GameMap.
   */
  import(serializedMap: string) {
    const map = new Porter.Importer().import(serializedMap);
    this.setMap(map, 'Open map file.');
  }

  /**
   * increases or reduces the size of rendered entities in canvas-space.
   * 
   * @param amount How many pixels to add to the width and height of the tiles.
   * @param loc The center of the zoom action in canvas-space.
   */
  zoom(amount: number, loc: Vec) {
    const oldSIze = this.tileSize;
    this.setTileSize(this.tileSize + amount);
    if (oldSIze !== this.tileSize) {
      const scale = amount / oldSIze;
      this.setOffset(this.offset.sub(loc.sub(this.offset).mul(scale)));
    }
  }

  /**
   * Returns the current offset of the viewport in canvas-space.
   */
  getOffset(): Vec {
    return this.offset;
  }

  /**
   * Sets the current offset of the viewport in canvas-space.
   * 
   * @param offset The offset of the viewport.
   */
  setOffset(offset: Vec): void {
    this.offset = offset;
    this.render();
  }

  /**
   * Returns the current width and height of the tiles in canvas-space.
   */
  getTileSize(): number {
    return this.tileSize;
  }

  /**
   * Sets the current width and height of the tiles in canvas-space.
   * 
   * @param pixels The width and height of the tiles.
   */
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

  /**
   * Sets the RegionIndexes which are marked for modification and how they will
   * be modified.
   * 
   * @param hovered The RegionIndexes to be modified and how they will be
   *                modified.
   */
  setHovered(hovered: [RegionIndex, Hover][]): void {
    this.hovered = hovered;
    this.render();
  }

  /**
   * Deactivates the current tool and activates the tool with the id toolId.
   * 
   * @param toolId The identifier of the tool to activate.
   */
  setCurrentTool(toolId: ToolId): void {
    this.currentTool = this.tools.get(toolId);
    this.ui.setTool(toolId);
  }

  /**
   * Cancels the current action.
   */
  cancel(): void {
    this.currentTool.cancel();
  }

  /**
   * Specifies that the user is considering an action that starts at
   * startCoords and ends at endCoords using the currently active tool.
   * 
   * @param startCoords The starting coordinates in canvas-space of the
   *                    considered action.
   * @param endCoords The ending coordinates in canvas-space of the
   *                  considered action.
   */
  hover(startCoords: Vec, endCoords: Vec): void {
    this.currentTool.hover(startCoords, endCoords);
  }

  /**
   * Specifies that the user wishes to perform an action that starts at
   * startCoords and ends at endCoords using the currently active tool.
   * 
   * @param startCoords The starting coordinates in canvas-space of the
   *                    considered action.
   * @param endCoords The ending coordinates in canvas-space of the
   *                  considered action.
   */
  select(startCoords: Vec, endCoords: Vec): void {
    this.currentTool.select(startCoords, endCoords);
  }

  /**
   * Transforms a coordinate in canvas-space to a coordinate in map-space.
   * 
   * @param vec The coordinate in canvas-space.
   */
  toMapSpace(vec: Vec) {
    return vec.sub(this.offset).mul(1 / this.tileSize);
  }

  private render(): void {
    this.renderer.render(this.getMap(), this.offset, this.hovered);
  }
}
