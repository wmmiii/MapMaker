import Edge from 'Edge';
import BoxResolver from 'resolvers/BoxResolver';
import DiagResolver from 'resolvers/DiagResolver';
import Fill from 'Fill';
import GameMap from 'GameMap';
import RegionResolver from 'resolvers/RegionResolver';
import Renderer from 'Renderer';
import {
  Tile,
  TileIndex,
  TileRegion,
  TileRegionIndex
} from 'Tile';
import { Ui, Mode } from 'Ui';
import Vec from 'Vec';
import { WallEdge, WallFill } from 'Wall';

export const init = (): App => {
  const container = document.getElementById("canvas-container");
  const toolbar = document.getElementById("toolbar");
  return new App(container, toolbar);
}

export class App {
  private map: GameMap;
  private mode: Mode;

  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private ui: Ui;

  private hovered: TileRegionIndex[];
  private offset: Vec;

  private tileSize: number = 40;
  private edgeDist: number = 0.2;

  constructor(container: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.canvas = container.querySelector("canvas");
    this.ui = new Ui(container, toolbar);
    this.renderer = new Renderer(this.canvas, this.tileSize);

    this.map = new GameMap();

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

    this.ui.onHover((startCoords: Vec, endCoords: Vec) => {
      let resolver: RegionResolver;
      if (this.mode === Mode.DIAG) {
        resolver = DiagResolver.getInstance();
      } else {
        resolver = BoxResolver.getInstance();
      }
      this.hovered = resolver.resolve(
        startCoords.sub(this.offset).mul(1 / this.tileSize),
        endCoords.sub(this.offset).mul(1 / this.tileSize));
      this.renderer.render(this.map, this.offset, this.hovered);
    });

    this.ui.onHoverEnd(() => {
      this.hovered = null;
      this.renderer.render(this.map, this.offset, this.hovered);
    });

    this.ui.onMove((dist: Vec) => {
      this.renderer.render(this.map, this.offset.add(dist), this.hovered);
    });

    this.ui.onMoveEnd((dist: Vec) => {
      this.offset = this.offset.add(dist);
      this.renderer.render(this.map, this.offset, this.hovered);
    });

    this.ui.onSelect((startCoords: Vec, endCoords: Vec) => {
      let resolver: RegionResolver;
      if (this.mode === Mode.DIAG) {
        resolver = DiagResolver.getInstance();
      } else {
        resolver = BoxResolver.getInstance();
      }
      resolver.resolve(
        startCoords.sub(this.offset).mul(1 / this.tileSize),
        endCoords.sub(this.offset).mul(1 / this.tileSize))
        .forEach((regionIndex) => {
          let tile = this.map.getTile(regionIndex.tileIndex);
          if (tile == null) {
            tile = new Tile(regionIndex.tileIndex);
            this.map.addTile(tile);
          }

          const region = regionIndex.tileRegion;
          if (region.isEdge()) {
            if (tile.getWallEdge(region) === WallEdge.NONE) {
              tile.setWallEdge(region, WallEdge.BARRIER);
            } else {
              tile.setWallEdge(region, WallEdge.NONE);
            }
          } else if (region.isFill()) {
            if (tile.getWallFill(region) === WallFill.NONE) {
              tile.setWallFill(region, WallFill.BARRIER);
            } else {
              tile.setWallFill(region, WallFill.NONE);
            }
          }

          if (tile.noState()) {
            this.map.removeTile(tile.index);
          }
        });
    });
  }
}
