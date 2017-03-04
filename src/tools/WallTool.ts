import App from 'App';
import RegionResolver from 'resolvers/RegionResolver';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';
import { WallEdge, WallFill } from 'Wall';

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
      this.app.toMapSpace(endCoords));

    this.app.setHovered(hovered);
  }

  select(startCoords: Vec, endCoords: Vec): void {
    let map = this.app.getMap();
    const selected = this.resolver.resolve(
      this.app.toMapSpace(startCoords),
      this.app.toMapSpace(endCoords));

    if (selected.length === 1) {
      let tile = map.getTile(selected[0].tileIndex);
      if (!tile) {
        tile = new Tile.Tile(selected[0].tileIndex);
      }

      const region = selected[0].tileRegion;
      if (region.isEdge()) {
        if (tile.getWallEdge(region) === WallEdge.NONE
          || !tile.getWallEdge(region)) {
          tile = tile.setWallEdge(region, WallEdge.BARRIER);
        } else {
          tile = tile.setWallEdge(region, WallEdge.NONE);
        }
      } else if (region.isFill()) {
        if (tile.getWallFill(region) === WallFill.NONE
          || !tile.getWallFill(region)) {
          tile = tile.setWallFill(region, WallFill.BARRIER);
        } else {
          tile = tile.setWallFill(region, WallFill.NONE);
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
          modified.set(tile.index, tile.setWallEdge(region, WallEdge.BARRIER));
        } else {
          modified.set(tile.index, tile.setWallFill(region, WallFill.BARRIER));
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
      return tile.getWallEdge(region) === WallEdge.NONE;
    } else {
      return tile.getWallFill(region) === WallFill.NONE;
    }
  }
}