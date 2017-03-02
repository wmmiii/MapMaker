import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export default class CircleResolver extends RegionResolver {
  private static instance: CircleResolver;

  static getInstance(): CircleResolver {
    if (!CircleResolver.instance) {
      CircleResolver.instance = new CircleResolver();
    }
    return CircleResolver.instance;
  }

  private constructor() {
    super();
  }

  resolve(startCoords: Vec, endCoords: Vec): RegionIndex[] {
    const difference = endCoords.sub(startCoords);

    // Calculate starting index
    const baseX = Math.floor(startCoords.x);
    const baseY = Math.floor(startCoords.y);

    // Calculate the center
    const center = Vec.of(Math.floor(startCoords.x) + 0.5, Math.floor(startCoords.y) + 0.5);
    const radSqr = Math.pow(difference.x, 2) + Math.pow(difference.y, 2);
    const rad = Math.ceil(Math.sqrt(radSqr));

    const elements: RegionIndex[] = [];

    for (let x = -rad; x <= rad; x++) {
      for (let y = -rad; y <= rad; y++) {
        // Check to see if the tile is reasonably within bounds
        const dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (dist < rad - Math.SQRT2 || dist > rad + Math.SQRT2) {
          continue;
        }

        let region: Region = null;
        let contained = 0;

        const ul = Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2) <= radSqr;
        contained += ul ? 1 : 0;
        const ur = Math.pow(x + 0.5, 2) + Math.pow(y - 0.5, 2) <= radSqr;
        contained += ur ? 1 : 0;
        const lr = Math.pow(x + 0.5, 2) + Math.pow(y + 0.5, 2) <= radSqr;
        contained += lr ? 1 : 0;
        const ll = Math.pow(x - 0.5, 2) + Math.pow(y + 0.5, 2) <= radSqr;
        contained += ll ? 1 : 0;

        if (contained === 0 || contained > 2) {
          continue;
        }

        const currX = baseX + x;
        const currY = baseY + y;

        if (ul) {
          if (ur) {
            elements.push(this.newIndex(currX, currY + 1, Region.TOP_EDGE));
          } else if (ll) {
            elements.push(this.newIndex(currX + 1, currY, Region.LEFT_EDGE));
          } else {
            elements.push(this.newIndex(currX, currY, Region.NE_CROSS));
          }
        } else if (ur) {
          if (lr) {
            elements.push(this.newIndex(currX, currY, Region.LEFT_EDGE));
          } else {
            elements.push(this.newIndex(currX, currY, Region.NW_CROSS));
          }
        } else if (lr) {
          if (ll) {
            elements.push(this.newIndex(currX, currY, Region.TOP_EDGE));
          } else {
            elements.push(this.newIndex(currX, currY, Region.NE_CROSS));
          }
        } else {
          elements.push(this.newIndex(currX, currY, Region.NW_CROSS));
        }
      }
    }

    return elements;
  }
}
