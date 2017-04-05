///<reference path='../lib/immutable-js/dist/immutable.d.ts'/>
import { Tile, Index } from 'Tile';

/**
 * A state of a map. Tiles should only be specified if they contain data.
 * Instances of GameMap are immutable.
 */
export default class GameMap {
  constructor(private tileMap?: Immutable.Map<Index, Tile>) {
    this.tileMap = tileMap || Immutable.Map<Index, Tile>();
  }

  /**
   * Returns the Tile at the specified index.
   * 
   * @param index The index of the tile to retrieve.
   */
  getTile(index: Index): Tile {
    return this.tileMap.get(index);
  }

  /**
   * Performs the specified function on each Tile in the map.
   * 
   * @param func The function to perform on each tile.
   */
  forEachTile(func: (tile: Tile) => void): void {
    this.tileMap.forEach(func);
  }

  /**
   * Returns an identicle GameMap except the specified tile will be added. Any
   * tile that exists at the same Index will be overridden in the returned
   * GameMap.
   * 
   * @param tile The tile to add.
   */
  addTile(tile: Tile): GameMap {
    return new GameMap(this.tileMap.set(tile.index, tile));
  }

  /**
   * Returns an identicle GameMap except the tile at the specified index will
   * be removed.
   * 
   * @param index The index of the tile to remove.
   */
  removeTile(index: Index): GameMap {
    return new GameMap(this.tileMap.remove(index));
  }
}

