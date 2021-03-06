import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

/**
 * Resolves a selection to a set of TOP_EDGEs, LEFT_EDGEs, or SQUAREs. Only one
 * type of Region will be referred to in a returned set. The type of region
 * returned depends on the proximity of the starting coordinate to each of the
 * regions on any tile.
 */
export default class BoxResolver extends RegionResolver {
  private static instance: BoxResolver;
  private static readonly edgeDist: number = 0.3;

  /**
   * Returns the singleton instance of the BoxResolver.
   */
  static getInstance(): BoxResolver {
    if (!BoxResolver.instance) {
      BoxResolver.instance = new BoxResolver();
    }
    return BoxResolver.instance;
  }

  private constructor() {
    super();
  }

  resolve(startCoords: Vec, endCoords: Vec): RegionIndex[] {
    const tileCoords = startCoords.sub(startCoords.floor());

    // Calculate starting index
    const baseX = startCoords.floor().x;
    const baseY = startCoords.floor().y;

    // Calculate bounding indicies
    const left = Math.floor(Math.min(startCoords.x, endCoords.x));
    const top = Math.floor(Math.min(startCoords.y, endCoords.y));
    const right = Math.floor(Math.max(startCoords.x, endCoords.x));
    const bottom = Math.floor(Math.max(startCoords.y, endCoords.y));

    const start = this.resolveStart(tileCoords, baseX, baseY);
    const elements: RegionIndex[] = [];

    if (start.tileRegion === Region.SQUARE) {
      for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
          elements.push(this.newIndex(x, y, Region.SQUARE));
        }
      }
    } else if (start.tileRegion === Region.TOP_EDGE) {
      for (let x = left; x <= right; x++) {
        elements.push(this.newIndex(x, start.tileIndex.y,
          Region.TOP_EDGE));
      }
    } else if (start.tileRegion === Region.LEFT_EDGE) {
      for (let y = top; y <= bottom; y++) {
        elements.push(this.newIndex(start.tileIndex.x, y,
          Region.LEFT_EDGE));
      }
    }

    return elements;
  }

  private resolveStart(coords: Vec, baseX: number, baseY: number): RegionIndex {
    const edgeDist = BoxResolver.edgeDist;

    const distLeft = coords.x;
    const distRight = 1 - coords.x;
    const distTop = coords.y;
    const distBottom = 1 - coords.y;

    if (distLeft < edgeDist) {
      if (distLeft <= distTop && distLeft <= distBottom) {
        return this.newIndex(baseX, baseY, Region.LEFT_EDGE);
      }
    }

    if (distTop < edgeDist) {
      if (distTop <= distRight) {
        return this.newIndex(baseX, baseY, Region.TOP_EDGE);
      }
    }

    if (distRight < edgeDist) {
      if (distRight <= distBottom) {
        return this.newIndex(baseX + 1, baseY, Region.LEFT_EDGE);
      }
    }

    if (distBottom < edgeDist) {
      return this.newIndex(baseX, baseY + 1, Region.TOP_EDGE);
    }

    return this.newIndex(baseX, baseY, Region.SQUARE);
  }
}