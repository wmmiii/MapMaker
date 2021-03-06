import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

/**
 * Resolves a selection to a set of NW_CROSSes or NE_CROSSes if the selection
 * starts near the center of a tile or a single UPPER_LEFT, UPPER_RIGHT,
 * LOWER_RIGHT, or LOWER_LEFT region if the selection starts near the outside
 * of a tile. If the starting coordinate resolves to one of the fill regions
 * within a different tile than what the ending coordinate would resolve to
 * then an empty set is returned.
 */
export default class DiagResolver extends RegionResolver {
  private static instance: DiagResolver;
  private static readonly cornerDist: number = 0.6;

  /**
   * Returns the singleton instance of the DiagResolver.
   */
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
    const tileCoords = startCoords.sub(startCoords.floor());

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