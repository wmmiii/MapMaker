import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export default class EdgeResolver extends RegionResolver {
  private static instance: EdgeResolver;
  private static readonly edgeDist: number = 0.3;

  static getInstance(): EdgeResolver {
    if (!EdgeResolver.instance) {
      EdgeResolver.instance = new EdgeResolver();
    }
    return EdgeResolver.instance;
  }

  private constructor() {
    super();
  }

  resolve(startCoords: Vec, endCoords: Vec): RegionIndex[] {
    const tileCoords = startCoords.sub(startCoords.floor());;

    // Calculate starting index
    const baseX = startCoords.floor().x;
    const baseY = startCoords.floor().y;

    if (baseX !== Math.floor(endCoords.x) || baseY !== Math.floor(endCoords.y)) {
      return [];
    }

    let innerDist = tileCoords.sub(Vec.of(0.5, 0.5)).abs();
    if (innerDist.x > EdgeResolver.edgeDist || innerDist.y > EdgeResolver.edgeDist) {
      let horizontal: [number, RegionIndex];
      if (tileCoords.x < 0.5) {
        horizontal = [tileCoords.x, this.newIndex(baseX, baseY, Region.LEFT_EDGE)];
      } else {
        horizontal = [1 - tileCoords.x, this.newIndex(baseX + 1, baseY, Region.LEFT_EDGE)];
      }

      let vertical: [number, RegionIndex];
      if (tileCoords.y < 0.5) {
        vertical = [tileCoords.y, this.newIndex(baseX, baseY, Region.TOP_EDGE)];
      } else {
        vertical = [1 - tileCoords.y, this.newIndex(baseX, baseY + 1, Region.TOP_EDGE)];
      }

      if (horizontal[0] < vertical[0]) {
        return [horizontal[1]];
      } else {
        return [vertical[1]];
      }

    } else {
      if (tileCoords.x < 0.5) {
        if (tileCoords.y < 0.5) {
          return [this.newIndex(baseX, baseY, Region.NW_CROSS)];
        } else {
          return [this.newIndex(baseX, baseY, Region.NE_CROSS)];
        }
      } else {
        if (tileCoords.y < 0.5) {
          return [this.newIndex(baseX, baseY, Region.NE_CROSS)];
        } else {
          return [this.newIndex(baseX, baseY, Region.NW_CROSS)];
        }
      }
    }
  }
}