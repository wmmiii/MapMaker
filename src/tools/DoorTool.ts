import App from 'App';
import { Edge } from 'RegionTypes';
import { Hover } from 'Hover';
import EdgeResolver from 'resolvers/EdgeResolver';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';

/**
 * Selects a single edge region and marks it as a door. The first time an edge
 * is selected it is marked as a regular door, the second time an edge is
 * selected it is marked as a locked door, and the third time an edge is
 * selected it is removed and so on.
 */
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
      let message;
      let tile = map.getTile(selected[0].tileIndex)
        || new Tile.Tile(selected[0].tileIndex);

      const region = selected[0].tileRegion;
      if (tile.getEdge(region) === Edge.DOOR) {
        tile = tile.setEdge(region, Edge.DOOR_LOCKED);
        message = 'Add locked door.';
      } else if (tile.getEdge(region) === Edge.DOOR_LOCKED) {
        tile = tile.setEdge(region, Edge.NONE);
        message = 'Remove door.';
      } else {
        tile = tile.setEdge(region, Edge.DOOR);
        message = 'Add door.';
      }
      map = map.addTile(tile);
      this.app.setMap(map, message);
    }

    this.app.setHovered([]);
  }
}