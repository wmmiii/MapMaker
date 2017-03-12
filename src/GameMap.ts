///<reference path='../lib/immutable-js/dist/immutable.d.ts'/>
import { Tile, Index } from 'Tile';

export default class GameMap {
  constructor(private tileMap?: Immutable.Map<Index, Tile>) {
    this.tileMap = tileMap || Immutable.Map<Index, Tile>();
  }

  getTile(index: Index): Tile {
    return this.tileMap.get(index);
  }

  forEachTile(func: (tile: Tile) => void): void {
    this.tileMap.forEach(func);
  }

  addTile(tile: Tile): GameMap {
    return new GameMap(this.tileMap.set(tile.index, tile));
  }

  removeTile(index: Index): GameMap {
    return new GameMap(this.tileMap.remove(index));
  }
}

