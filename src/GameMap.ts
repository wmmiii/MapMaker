import { Tile, Index } from 'Tile';

export default class GameMap {
  private tileMap: Map<Index, Tile>;

  constructor() {
    this.tileMap = new Map();
  }

  getTile(index: Index): Tile {
    return this.tileMap.get(index);
  }

  getTiles(): Tile[] {
    return Array.from(this.tileMap.values());
  }

  addTile(tile: Tile): void {
    this.tileMap.set(tile.index, tile);
  }

  removeTile(index: Index): Tile {
    const tile = this.tileMap.get(index);
    this.tileMap.delete(index);
    return tile;
  }
}

