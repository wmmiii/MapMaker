import Edge from 'Edge';
import Square from 'Square';
import { Tile, TileIndex } from 'Tile';

export default class Map {
  private tileMap: {[key: string]: Tile};

  constructor() {
    this.tileMap = {};
  }

  getTile(index: TileIndex): Tile {
    return this.tileMap[this.stringify(index)];
  }

  addTile(tile: Tile): void {
    this.tileMap[this.stringify(tile.getIndex())] = tile;
  }

  removeTile(index: TileIndex): Tile {
    let tile: Tile = this.tileMap[this.stringify(index)];
    delete this.tileMap[this.stringify(index)];
    return tile;
  }

  public stringify(index: TileIndex): string {
    return index.x + "," + index.y;
  }
}

