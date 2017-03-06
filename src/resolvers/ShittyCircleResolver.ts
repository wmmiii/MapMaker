import RegionResolver from 'RegionResolver';
import { Region, RegionIndex } from 'Tile';
import Vec from 'Vec';

export default class ShittyCircleResolver extends RegionResolver {
  private static instance: ShittyCircleResolver;

  static getInstance(): ShittyCircleResolver {
    if (!ShittyCircleResolver.instance) {
      ShittyCircleResolver.instance = new ShittyCircleResolver();
    }
    return ShittyCircleResolver.instance;
  }

  private constructor() {
    super();
  }

  resolve(startCoords: Vec, endCoords: Vec): RegionIndex[] {
    // Calculate starting index
    const baseX = Math.floor(startCoords.x);
    const baseY = Math.floor(startCoords.y);

    // Calculate circle things
    const center = this.normalizeStart(startCoords);
    const offset = center.x % 1;
    const difference = endCoords.sub(center);
    const radSqr = Math.pow(difference.x, 2) + Math.pow(difference.y, 2);
    const rad = Math.ceil(Math.sqrt(radSqr));

    const elements: RegionIndex[] = [];

    for (let x = -rad; x <= rad; x++) {
      for (let y = -rad; y <= rad; y++) {
        // Check to see if the tile is reasonably within bounds
        const dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (dist < rad - Math.SQRT2 || dist > rad + Math.SQRT2) {
          break;
        }
        
        let contained = 0;

        const ul = Math.pow(x + offset - 0.5, 2) + Math.pow(y + offset - 0.5, 2) <= radSqr;
        contained += ul ? 1 : 0;
        const ur = Math.pow(x + offset + 0.5, 2) + Math.pow(y + offset - 0.5, 2) <= radSqr;
        contained += ur ? 1 : 0;
        const lr = Math.pow(x + offset + 0.5, 2) + Math.pow(y + offset + 0.5, 2) <= radSqr;
        contained += lr ? 1 : 0;
        const ll = Math.pow(x + offset - 0.5, 2) + Math.pow(y + offset + 0.5, 2) <= radSqr;
        contained += ll ? 1 : 0;

        // if (contained === 0 || contained > 2) {
        //   continue;
        // }

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

  protected normalizeStart(coordsStart: Vec) {
    const translated = coordsStart.mod(1).sub(Vec.of(0.5, 0.5));
    if (Math.abs(translated.x) + Math.abs(translated.y) < 0.5) {
        return coordsStart.floor().add(Vec.of(0.5, 0.5));
    } else {
        return coordsStart.add(Vec.of(0.5, 0.5)).floor();
    }
  }
}
