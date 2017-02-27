import { Tile, TileIndex } from 'Tile';

export default class GameMap {
  private tileMap: Map<TileIndex, Tile>;

  constructor() {
    this.tileMap = new Map();
  }

  getTile(index: TileIndex): Tile {
    return this.tileMap.get(index);
  }

  getTiles(): Tile[] {
    return Array.from(this.tileMap.values());
  }

  addTile(tile: Tile): void {
    this.tileMap.set(tile.index, tile);
  }

  removeTile(index: TileIndex): Tile {
    const tile = this.tileMap.get(index);
    this.tileMap.delete(index);
    return tile;
  }
}

