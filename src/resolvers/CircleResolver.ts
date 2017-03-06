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
    const center = this.normalizeStart(startCoords);

    // Calculate starting index
    const baseX = center.floor().x;
    const baseY = center.floor().y;

    // Calculate circle things
    const offset = center.x % 1;
    const difference = endCoords.sub(center);
    let radSqr = Math.pow(difference.x, 2) + Math.pow(difference.y, 2);
    let rad = Math.ceil(Math.sqrt(radSqr));

    if (offset === 0.5 && rad < 2) {
      return [
        this.newIndex(baseX, baseY, Region.TOP_EDGE),
        this.newIndex(baseX, baseY, Region.LEFT_EDGE),
        this.newIndex(baseX, baseY + 1, Region.TOP_EDGE),
        this.newIndex(baseX + 1, baseY, Region.LEFT_EDGE)
      ];
    }

    const elements: RegionIndex[] = [];

    for (let x = -rad; x <= rad + offset; x++) {
      for (let y = -rad; y <= rad + offset; y++) {
        const relative = Vec.of(x, y).sub(Vec.of(offset, offset));

        // Check to see if the tile is reasonably within bounds
        const dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (dist < rad - 2 || dist > rad + 2) {
          continue;
        }

        let contained = 0;

        const ul = Math.pow(relative.x, 2) + Math.pow(relative.y, 2) <= radSqr;
        contained += ul ? 1 : 0;
        const ur = Math.pow(relative.x + 1, 2) + Math.pow(relative.y, 2) <= radSqr;
        contained += ur ? 1 : 0;
        const lr = Math.pow(relative.x + 1, 2) + Math.pow(relative.y + 1, 2) <= radSqr;
        contained += lr ? 1 : 0;
        const ll = Math.pow(relative.x, 2) + Math.pow(relative.y + 1, 2) <= radSqr;
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

  protected normalizeStart(coordsStart: Vec) {
    const translated = coordsStart.mod(1).sub(Vec.of(0.5, 0.5));
    if (Math.abs(translated.x) + Math.abs(translated.y) < 0.5) {
      return coordsStart.floor().add(Vec.of(0.5, 0.5));
    } else {
      return coordsStart.add(Vec.of(0.5, 0.5)).floor();
    }
  }
}
