import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export default class SquareResolver extends RegionResolver {
  private static instance: SquareResolver;
  private static readonly edgeDist: number = 0.3;

  static getInstance(): SquareResolver {
    if (!SquareResolver.instance) {
      SquareResolver.instance = new SquareResolver();
    }
    return SquareResolver.instance;
  }

  private constructor() {
    super();
  }

  resolve(startCoords: Vec, endCoords: Vec): RegionIndex[] {
    const tileCoords = startCoords.mod(1);

    // Calculate starting index
    const baseX = startCoords.floor().x;
    const baseY = startCoords.floor().y;

    // Calculate bounding indicies
    const left = Math.floor(Math.min(startCoords.x, endCoords.x));
    const top = Math.floor(Math.min(startCoords.y, endCoords.y));
    const right = Math.floor(Math.max(startCoords.x, endCoords.x));
    const bottom = Math.floor(Math.max(startCoords.y, endCoords.y));

    const elements: RegionIndex[] = [];

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        elements.push(this.newIndex(x, y, Region.SQUARE));
      }
    }

    return elements;
  }
}