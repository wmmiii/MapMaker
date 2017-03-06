import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export default class FillResolver extends RegionResolver {
  private static instance: FillResolver;
  private static readonly edgeDist: number = 0.6;

  static getInstance(): FillResolver {
    if (!FillResolver.instance) {
      FillResolver.instance = new FillResolver();
    }
    return FillResolver.instance;
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

    const start = this.resolveStart(tileCoords);
    const elements: RegionIndex[] = [];

    if (start === Region.SQUARE) {
      for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
          elements.push(this.newIndex(x, y, Region.SQUARE));
        }
      }
      return elements;
    } else {
      if (left === right && top === bottom) {
        return [this.newIndex(baseX, baseY, start)];
      } else {
        return [];
      }
    }
  }

  private resolveStart(coords: Vec): Region {
    const edgeDist = FillResolver.edgeDist;

    const distLeft = coords.x;
    const distRight = 1 - coords.x
    const distTop = coords.y;
    const distBottom = 1 - coords.y;

    if (coords.x < 0.5) {
      if (coords.y < 0.5) {
        if (coords.x + coords.y < FillResolver.edgeDist) {
          return Region.UPPER_LEFT;
        } else {
          return Region.SQUARE;
        }
      } else {
        if (coords.x + (1 - coords.y) < FillResolver.edgeDist) {
          return Region.LOWER_LEFT;
        } else {
          return Region.SQUARE;
        }
      }
    } else {
      if (coords.y < 0.5) {
        if ((1 - coords.x) + coords.y < FillResolver.edgeDist) {
          return Region.UPPER_RIGHT;
        } else {
          return Region.SQUARE;
        }
      } else {
        if ((1 - coords.x) + (1 - coords.y) < FillResolver.edgeDist) {
          return Region.LOWER_RIGHT;
        } else {
          return Region.SQUARE;
        }
      }
    }
  }
}