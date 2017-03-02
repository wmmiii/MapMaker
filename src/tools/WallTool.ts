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
    const map = this.app.getMap();
    const selected = this.resolver.resolve(
        this.app.toMapSpace(startCoords),
        this.app.toMapSpace(endCoords));

    if (selected.length === 1) {
      let tile = map.getTile(selected[0].tileIndex);
      if (!tile) {
        tile = new Tile.Tile(selected[0].tileIndex);
        map.addTile(tile);
      } 
      
      const region = selected[0].tileRegion;
      if (region.isEdge()) {
        if (tile.getWallEdge(region) === WallEdge.NONE
          || !tile.getWallEdge(region)) {
          tile.setWallEdge(region, WallEdge.BARRIER);
        } else {
          tile.setWallEdge(region, WallEdge.NONE);
        }
      } else if (region.isFill()) {
        if (tile.getWallFill(region) === WallFill.NONE
          || !tile.getWallFill(region)) {
          tile.setWallFill(region, WallFill.BARRIER);
        } else {
          tile.setWallFill(region, WallFill.NONE);
        }
      }

    } else {
      selected.map((regionIndex): [Tile.Tile, Tile.RegionIndex] => 
          [map.getTile(regionIndex.tileIndex), regionIndex])
        .map(([tile, regionIndex]): [Tile.Tile, Tile.Region] => {
          if (!tile) {
            return [new Tile.Tile(regionIndex.tileIndex), regionIndex.tileRegion]
          } else {
            return [tile, regionIndex.tileRegion];
          }
        })
        .filter(([tile, regionIndex]) => this.canApply(tile, regionIndex))
        .map(([tile, region]) => {
          if (region.isEdge()) {
            tile.setWallEdge(region, WallEdge.BARRIER);
          } else {
            tile.setWallFill(region, WallFill.BARRIER);
          }
          return tile;
        })
        .forEach((tile) => map.addTile(tile));
    }

    this.app.setHovered([]);
  }

  private canApply(tile: Tile.Tile, region: Tile.Region): boolean {
    if (!tile) {
      return true;
    } else if (region.isEdge()) {
      return tile.getWallEdge(region) === WallEdge.NONE;
    } else {
      return tile.getWallFill(region) === WallFill.NONE;
    }
  }
}