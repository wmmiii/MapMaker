import App from 'App';
import { Edge, Fill } from 'RegionTypes';
import { Hover } from 'Hover';
import RegionResolver from 'resolvers/RegionResolver';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';

export default class WallTool implements Tool {
  private app: App;
  private resolver: RegionResolver;

  constructor(app: App, resolver: RegionResolver) {
    this.app = app;
    this.resolver = resolver;
  }

  cancel(): void {
    this.app.setHovered([]);
  }

  hover(startCoords: Vec, endCoords: Vec): void {
    const map = this.app.getMap();
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
      if (region.isEdge()) {
        if (tile.getEdge(region) === Edge.NONE
          || !tile.getEdge(region)) {
          tile = tile.setEdge(region, Edge.BARRIER);
        } else {
          tile = tile.setEdge(region, Edge.NONE);
        }
      } else if (region.isFill()) {
        if (tile.getFill(region) === Fill.NONE
          && tile.getFill(Tile.Region.SQUARE) === Fill.NONE) {
          tile = tile.setFill(region, Fill.BARRIER);
        } else {
          tile = tile.setFill(region, Fill.NONE);
        }
      }
      map = map.setTile(tile);

    } else {
      const modified = new Map<Tile.Index, Tile.Tile>();
      selected.map((regionIndex) => {
        const tile = modified.get(regionIndex.tileIndex)
          || map.getTile(regionIndex.tileIndex)
          || new Tile.Tile(regionIndex.tileIndex);
        const region = regionIndex.tileRegion;

        if (regionIndex.tileRegion.isEdge()) {
          modified.set(tile.index, tile.setEdge(region, Edge.BARRIER));
        } else {
          modified.set(tile.index, tile.setFill(region, Fill.BARRIER));
        }
      });

      modified.forEach((tile) => {
        map = map.setTile(tile);
      });
    }

    this.app.setMap(map);
    this.app.setHovered([]);
  }

  private canApply(tile: Tile.Tile, region: Tile.Region): boolean {
    if (region.isEdge()) {
      return tile.getEdge(region) === Edge.NONE;
    } else {
      return tile.getFill(region) === Fill.NONE;
    }
  }
}