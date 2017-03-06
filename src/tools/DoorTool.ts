import App from 'App';
import { Edge } from 'RegionTypes';
import { Hover } from 'Hover';
import EdgeResolver from 'resolvers/EdgeResolver';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';

export default class DoorTool implements Tool {
  private app: App;
  private resolver: EdgeResolver;

  constructor(app: App) {
    this.app = app;
    this.resolver = EdgeResolver.getInstance();
  }

  cancel(): void {
    this.app.setHovered([]);
  }

  hover(startCoords: Vec, endCoords: Vec): void {
    const hovered = this.resolver.resolve(
      this.app.toMapSpace(startCoords),
      this.app.toMapSpace(endCoords))
      .map((regionIndex): [Tile.RegionIndex, Hover] =>
        [regionIndex, Hover.ADD]);

    this.app.setHovered(hovered);
  }

  select(startCoords: Vec, endCoords: Vec): void {
    let map = this.app.getMap();
    const selected = this.resolver.resolve(
      this.app.toMapSpace(startCoords),
      this.app.toMapSpace(endCoords));

    if (selected.length === 1) {
      let tile = map.getTile(selected[0].tileIndex)
        || new Tile.Tile(selected[0].tileIndex);

      const region = selected[0].tileRegion;
      if (tile.getEdge(region) === Edge.DOOR) {
        tile = tile.setEdge(region, Edge.DOOR_LOCKED);
      } else if (tile.getEdge(region) === Edge.DOOR_LOCKED) {
        tile = tile.setEdge(region, Edge.NONE);
      } else {
        tile = tile.setEdge(region, Edge.DOOR);
      }
      map = map.setTile(tile);
    }

    this.app.setMap(map);
    this.app.setHovered([]);
  }
}