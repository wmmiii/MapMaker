import {
  Tile,
  TileIndex,
  TileElementIndex,
  TileElement
} from 'Tile';
import { Mode } from 'Ui';
import Vec from 'Vec';

export default class ElementResolver {
  private tileSize: number;
  private edgeDist: number;

  constructor(tileSize: number, edgeDist: number) {
    this.tileSize = tileSize;
    this.edgeDist = edgeDist;
  }

  resolve(cords: Vec, mode: Mode) {
    const tileSize = this.tileSize;

    const baseX = Math.floor(cords.x / tileSize);
    const baseY = Math.floor(cords.y / tileSize);

    // Transform from map-space to tile-space
    cords = new Vec(
      (cords.x - baseX * tileSize) / tileSize,
      (cords.y - baseY * tileSize) / tileSize);

    switch (mode) {
      case Mode.DIAG:
        return this.resolveDiag(cords, baseX, baseY);
      case Mode.BOX:
      default:
        return this.resolveBox(cords, baseX, baseY);
    }
  }

  private resolveBox(cords: Vec, baseX: number, baseY: number): 
      TileElementIndex {
    const edgeDist = this.edgeDist;

    const distLeft = cords.x;
    const distRight = 1 - cords.x
    const distTop = cords.y;
    const distBottom = 1 - cords.y;

    if (distLeft < edgeDist) {
      if (distLeft <= distTop && distLeft <= distBottom) {
        return this.newIndex(baseX, baseY, TileElement.LEFT_EDGE);
      }
    }
    
    if (distTop < edgeDist) {
      if (distTop <= distRight) {
        return this.newIndex(baseX, baseY, TileElement.TOP_EDGE);
      }
    }
    
    if (distRight < edgeDist) {
      if (distRight <= distBottom) {
        return this.newIndex(baseX + 1, baseY, TileElement.LEFT_EDGE);
      }
    }

    if (distBottom < edgeDist) {
      return this.newIndex(baseX, baseY + 1, TileElement.TOP_EDGE);
    }

    return this.newIndex(baseX, baseY, TileElement.SQUARE);
  }

  private resolveDiag(coords: Vec, baseX: number, baseY: number):
     TileElementIndex {
    if (coords.x < 0.5) {
      if (coords.y < 0.5) {
        return this.newIndex(baseX, baseY, TileElement.UPPER_LEFT);
      } else {
        return this.newIndex(baseX, baseY, TileElement.LOWER_LEFT);
      }
    } else {
      if (coords.y < 0.5) {
        return this.newIndex(baseX, baseY, TileElement.UPPER_RIGHT);
      } else {
        return this.newIndex(baseX, baseY, TileElement.LOWER_RIGHT);
      }
    }
  }


  private newIndex(x: number,y: number, element: TileElement): 
      TileElementIndex {
    return new TileElementIndex(new TileIndex(x, y), element);
  }
}
