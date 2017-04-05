import { Edge, Fill } from 'RegionTypes';
import GameMap from 'GameMap';
import { Tile, Index, Region } from 'Tile';

const EDGE_KEY = 'e';
const FILL_KEY = 'f';

/**
 * Serializes a GameMap into a string.
 */
export class Exporter {

  /**
   * Returns a string of the serialized state of map.
   * 
   * @param map The GameMap to serialize.
   */
  export(map: GameMap): string {
    const tiles: Map<number, [{}, Set<Index>]> = new Map();

    map.forEachTile((tile: Tile) => {
      if (tile.noState()) {
        return;
      }
      const tileJson: { [key: string]: any } = {};
      const tileShape: { [key: string]: any } = {};
      tileJson['x'] = tile.index.x;
      tileJson['y'] = tile.index.y;

      tile.getEdges().forEach((edge: Edge, region: Region) => {
        if (edge === Edge.NONE) {
          return;
        }

        if (!tileShape[EDGE_KEY]) {
          tileShape[EDGE_KEY] = {};
        }

        tileShape[EDGE_KEY][region.getName()] = edge.getName();
      });

      tile.getFills().forEach((fill: Fill, region: Region) => {
        if (fill === Fill.NONE) {
          return;
        }

        if (!tileShape[FILL_KEY]) {
          tileShape[FILL_KEY] = {};
        }

        tileShape[FILL_KEY][region.getName()] = fill.getName();
      });

      const tileHash = hashTile(tileShape);
      if (!tiles.get(tileHash)) {
        tiles.set(tileHash, [tileShape, new Set()]);
      }
      tiles.get(tileHash)[1].add(tile.index);
    });

    const tilesJson: [{}, number[][]][] = [];
    tiles.forEach(([shape, indicies]) => {
      const indiciesList: number[][] = [];
      indicies.forEach((tileIndex: Index) => {
        indiciesList.push([tileIndex.x, tileIndex.y]);
      })
      tilesJson.push([shape, indiciesList]);
    });

    const mapJson: { [key: string]: any } = {};
    mapJson['version'] = 1;
    mapJson['legend'] = {};
    mapJson['tiles'] = tilesJson;

    return JSON.stringify(mapJson);
  }
}

/**
 * Deserializes a GameMap from a string.
 */
export class Importer {
  
  /**
   * Returns a GameMap from a string describing serialized state.
   * 
   * @param serializedMap A string describing the state of a GameMap.
   */
  import(serializedMap: string): GameMap {
    const mapJson = JSON.parse(serializedMap);
    const tiles: [{ [key: string]: { [key: string]: string} }, number[][]][]
        = mapJson['tiles'];

    let map = new GameMap();    
    tiles.forEach(([shape, indicies]) => {
      indicies.forEach((index) => {
        let tile = new Tile(Index.of(index[0], index[1]));
        const edges = shape[EDGE_KEY];
        for (let regionName in edges) {
          tile = tile.setEdge(Region.fromString(regionName),
              Edge.fromString(edges[regionName]));
        }
        const fills = shape[FILL_KEY];
        for (let regionName in fills) {
          tile = tile.setFill(Region.fromString(regionName),
              Fill.fromString(fills[regionName]));
        }
        map = map.addTile(tile);
      });
    });

    return map;
  }
}

function hashTile(tile: { [key: string]: any }): number {
  let result = 7;
  if (tile[EDGE_KEY]) {
    for (let region in tile[EDGE_KEY]) {
      result = result * 37 + hashString(region + tile[EDGE_KEY][region]);
    };
  }
  if (tile[FILL_KEY]) {
    for (let region in tile[FILL_KEY]) {
      result = result * 37 + hashString(region + tile[FILL_KEY][region]);
    };
  }
  return result;
}

function hashString(string: string): number {
  var result = 0, i, chr;
  if (string.length === 0) return result;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    result = ((result << 5) - result) + chr;
    result |= 0; // Convert to 32bit integer
  }
  return result;
}