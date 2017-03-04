import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export default class DiagResolver extends RegionResolver {
  private static instance: DiagResolver;
  private static readonly cornerDist: number = 0.6;

  static getInstance(): DiagResolver {
    if (!DiagResolver.instance) {
      DiagResolver.instance = new DiagResolver();
    }
    return DiagResolver.instance;
  }

  private constructor() {
    super();
  }

  resolve(startCoords: Vec, endCoords: Vec): RegionIndex[] {
    const tileCoords = startCoords.mod(1);

    // Calculate starting index
    const baseX = startCoords.floor().x;
    const baseY = startCoords.floor().y;

    const startRegion = this.resolveStart(tileCoords);

    if (startCoords.x === endCoords.x && startCoords.y === endCoords.y) {
      return [this.newIndex(baseX, baseY, startRegion)];
    }

    if (startRegion.isEdge()) {
      const difference = endCoords.sub(startCoords);
      const elements: RegionIndex[] = [];
      let x = 0;
      let y = 0;

      if (difference.x < 0) {
        if (difference.y < 0) {
          while (x > difference.x || y > difference.y) {
            elements.push(this.newIndex(baseX + x--, baseY + y--, Region.NW_CROSS));
          }
        } else {
          while (x > difference.x || y < difference.y) {
            elements.push(this.newIndex(baseX + x--, baseY + y++, Region.NE_CROSS));
          }
        }
      } else {
        if (difference.y < 0) {
          while (x < difference.x || y > difference.y) {
            elements.push(this.newIndex(baseX + x++, baseY + y--, Region.NE_CROSS));
          }
        } else {
          while (x < difference.x || y < difference.y) {
            elements.push(this.newIndex(baseX + x++, baseY + y++, Region.NW_CROSS));
          }
        }
      }

      return elements;
    } else {
      if (baseX !== Math.floor(endCoords.x) || baseY !== Math.floor(endCoords.y)) {
        return [];
      } else {
        return [this.newIndex(baseX, baseY, startRegion)];
      }
    }
  }

  private resolveStart(coords: Vec): Region {
    const edgeDist = DiagResolver.cornerDist;

    const distLeft = coords.x;
    const distRight = 1 - coords.x
    const distTop = coords.y;
    const distBottom = 1 - coords.y;

    if (coords.x < 0.5) {
      if (coords.y < 0.5) {
        if (coords.x + coords.y > DiagResolver.cornerDist) {
          return Region.NW_CROSS;
        } else {
          return Region.UPPER_LEFT;
        }
      } else {
        if (coords.x + (1 - coords.y) > DiagResolver.cornerDist) {
          return Region.NE_CROSS;
        } else {
          return Region.LOWER_LEFT;
        }
      }
    } else {
      if (coords.y < 0.5) {
        if ((1 - coords.x) + coords.y > DiagResolver.cornerDist) {
          return Region.NE_CROSS;
        } else {
          return Region.UPPER_RIGHT;
        }
      } else {
        if ((1 - coords.x) + (1 - coords.y) > DiagResolver.cornerDist) {
          return Region.NW_CROSS;
        } else {
          return Region.LOWER_RIGHT;
        }
      }
    }
  }
}