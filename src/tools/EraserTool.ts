import App from 'App';
import { Edge } from 'RegionTypes';
import { Hover } from 'Hover';
import SquareResolver from 'resolvers/SquareResolver';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';

export default class EraserTool implements Tool {
  private app: App;
  private resolver: SquareResolver;

  constructor(app: App) {
    this.app = app;
    this.resolver = SquareResolver.getInstance();
  }

  cancel(): void {
    this.app.setHovered([]);
    this.app.render();
  }

  hover(startCoords: Vec, endCoords: Vec): void {
    const hovered = this.resolver.resolve(
      this.app.toMapSpace(startCoords),
      this.app.toMapSpace(endCoords))
      .map((regionIndex): [Tile.RegionIndex, Hover] =>
        [regionIndex, Hover.REMOVE]);

    this.app.setHovered(hovered);
    this.app.render();
  }

  select(startCoords: Vec, endCoords: Vec): void {
    startCoords = this.app.toMapSpace(startCoords);
    endCoords = this.app.toMapSpace(endCoords);
    let map = this.app.getMap();

    const left = Math.floor(Math.min(startCoords.x, endCoords.x));
    const top = Math.floor(Math.min(startCoords.y, endCoords.y));
    const right = Math.floor(Math.max(startCoords.x, endCoords.x));
    const bottom = Math.floor(Math.max(startCoords.y, endCoords.y));

    let count = 0;
    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        const index = Tile.Index.of(x, y);
        const tile = map.getTile(index);
        const restoreEdges = new Map<Tile.Region, Edge>();

        if (x === left && tile) {
          restoreEdges.set(Tile.Region.LEFT_EDGE, tile.getEdge(Tile.Region.LEFT_EDGE));
        }

        if (y === top && tile) {
          restoreEdges.set(Tile.Region.TOP_EDGE, tile.getEdge(Tile.Region.TOP_EDGE));
        }

        map = map.removeTile(Tile.Index.of(x, y));

        if (restoreEdges.size > 0) {
          let tile = new Tile.Tile(index);
          restoreEdges.forEach((edge, region) => {
            tile = tile.setEdge(region, edge);
          });
          map = map.addTile(tile);
        }

        if (tile) {
          count++;
        }
      }
    }

    this.app.setMap(map, 'Erased ' + count + ' tiles.');
    this.app.setHovered([]);
    this.app.render();
  }
}