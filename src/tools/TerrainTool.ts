import App from 'App';
import { Fill } from 'RegionTypes';
import FillResolver from 'resolvers/FillResolver';
import { Hover } from 'Hover';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';

export default class TerrainTool implements Tool {
  private app: App;
  private terrain: Fill;
  private resolver: FillResolver;

  constructor(app: App, terrain: Fill) {
    this.app = app;
    this.terrain = terrain;
    this.resolver = FillResolver.getInstance();;
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
        [regionIndex, Hover.ADD]);

    this.app.setHovered(hovered);
    this.app.render();
  }

  select(startCoords: Vec, endCoords: Vec): void {
    let map = this.app.getMap();
    const selected = this.resolver.resolve(
      this.app.toMapSpace(startCoords),
      this.app.toMapSpace(endCoords));
    let message;

    if (selected.length === 1) {
      let tile = map.getTile(selected[0].tileIndex)
        || new Tile.Tile(selected[0].tileIndex);

      const region = selected[0].tileRegion;
      if (tile.getFill(region) === Fill.NONE
        && tile.getFill(Tile.Region.SQUARE) === Fill.NONE) {
        tile = tile.setFill(region, this.terrain);
        message = 'Add terrain to 1 tile.';
      } else {
        tile = tile.setFill(region, Fill.NONE);
        message = 'Remove terrain from 1 tile.';
      }
      map = map.addTile(tile);
    } else {
      selected.forEach((regionIndex) => {
        const tile = map.getTile(regionIndex.tileIndex)
          || new Tile.Tile(regionIndex.tileIndex);

        map = map.addTile(tile.setFill(regionIndex.tileRegion, this.terrain));
        message = 'Add terrain to ' + selected.length + ' tiles.';
      });
    }

    this.app.setMap(map, message);
    this.app.setHovered([]);
    this.app.render();
  }
}