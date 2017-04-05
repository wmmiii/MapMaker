///<reference path='../lib/immutable-js/dist/immutable.d.ts'/>
import { Edge, Fill } from 'RegionTypes';

/**
 * A state of a tile. Instances of Tile are immutable.
 */
export class Tile {
  constructor(readonly index: Index,
    private edgeRegions?: Immutable.Map<Region, Edge>,
    private fillRegions?: Immutable.Map<Region, Fill>) {
    this.edgeRegions = edgeRegions || Immutable.Map<Region, Edge>();
    this.fillRegions = fillRegions || Immutable.Map<Region, Fill>();
  }

  /**
   * Returns true if this tile contains no state and may be removed.
   */
  noState(): boolean {
    const hasEdge = this.edgeRegions.some(edge => edge !== Edge.NONE);
    const hasFill = this.fillRegions.some(fill => fill !== Fill.NONE);
    return !(hasEdge || hasFill);
  }

  /**
   * Returns a map of the edge regions mapped to their state.
   */
  getEdges(): Immutable.Map<Region, Edge> {
    return this.edgeRegions;
  }

  /**
   * Returns the state of a specifc edge region.
   * 
   * @param region The edge region to retrieve the state for.
   */
  getEdge(region: Region): Edge {
    if (!region.isEdge()) {
      throw new TypeError("Tried to get edge style of non-edge region.");
    }
    return this.edgeRegions.get(region) || Edge.NONE;
  }

  /**
   * Returns an identicle tile except the specified region will be set to the
   * specified state.
   * 
   * @param region The edge region to set the state of.
   * @param edge The edge state to set the region to.
   */
  setEdge(region: Region, edge: Edge): Tile {
    if (!region.isEdge()) {
      throw new TypeError("Tried to set edge style of non-edge region.");
    }
    return new Tile(this.index,
      this.edgeRegions.set(region, edge),
      this.fillRegions);
  }

  /**
   * Returns a map of the fill regions mapped to their state.
   */
  getFills(): Immutable.Map<Region, Fill> {
    return this.fillRegions;
  }

  /**
   * Returns the state of a specifc fill region.
   * 
   * @param region The fill region to retrieve the state for.
   */
  getFill(region: Region): Fill {
    if (!region.isFill()) {
      throw new TypeError("Tried to get fill style of non-fill region.");
    }
    return this.fillRegions.get(region) || Fill.NONE;
  }

  /**
   * Returns an identicle tile except the specified region will be set to the
   * specified state.
   * 
   * @param region The fill region to set the state of.
   * @param fill The fill state to set the region to.
   */
  setFill(region: Region, fill: Fill): Tile {
    if (!region.isFill()) {
      throw new TypeError("Tried to set fill style of non-fill region.");
    }
    return new Tile(this.index,
      this.edgeRegions,
      applyFill(region, fill, this.fillRegions, Fill.NONE));
  }
}

/**
 * The identifier for a single tile. Only one of each identifier may exist in
 * the application at a time so one may use identity comparison.
 */
export class Index {
  private static indicies: any = {};
  readonly x: number;
  readonly y: number;

  /**
   * Returns the identifier of the tile at position [x, y].
   * 
   * @param x The x index of the tile.
   * @param y The y index of the tile.
   */
  static of(x: number, y: number) {
    if (Index.indicies[x] == null) {
      Index.indicies[x] = {};
      Index.indicies[x][y] = new Index(x, y);
    } else if (Index.indicies[x][y] == null) {
      Index.indicies[x][y] = new Index(x, y);
    }

    return Index.indicies[x][y];
  }

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

enum RegionType {
  EDGE,
  FILL
}

/**
 * The different regions in a tile.
 * 
 * Note: This class was modeled after Java's Enum.
 */
export class Region {
  static readonly TOP_EDGE = new Region('TOP_EDGE', RegionType.EDGE);
  static readonly LEFT_EDGE = new Region('LEFT_EDGE', RegionType.EDGE);
  static readonly NW_CROSS = new Region('NW_CROSS', RegionType.EDGE);
  static readonly NE_CROSS = new Region('NE_CROSS', RegionType.EDGE);

  static readonly SQUARE = new Region('SQUARE', RegionType.FILL);
  static readonly UPPER_LEFT = new Region('UPPER_LEFT', RegionType.FILL);
  static readonly UPPER_RIGHT = new Region('UPPER_RIGHT', RegionType.FILL);
  static readonly LOWER_RIGHT = new Region('LOWER_RIGHT', RegionType.FILL);
  static readonly LOWER_LEFT = new Region('LOWER_LEFT', RegionType.FILL);

  private static mapping: Map<string, Region>;

  private constructor(private name: string, private type: RegionType) {
    if (!Region.mapping) {
      Region.mapping = new Map();
    }
    Region.mapping.set(name, this);
  }

  /**
   * Performs the specified function on each Region.
   * 
   * @param func The function to perform on each Region.
   */
  static forEach(func: (region: Region) => void) {
    this.mapping.forEach(func);
  }

  /**
   * Returns the Region with the specified name.
   * 
   * @param name The name of the Region.
   */
  static fromString(name: string) {
    return Region.mapping.get(name);
  }

  /**
   * Returns the name of this Region.
   */
  getName(): string {
    return this.name;
  }

  /**
   * If this region is a EDGE region.
   */
  isEdge(): boolean {
    return this.type === RegionType.EDGE;
  }

  /**
   * If this region is a FUKK region.
   */
  isFill(): boolean {
    return this.type === RegionType.FILL;
  }
}

/**
 * The identifier for a region in a specific tile.
 */
export class RegionIndex {
  readonly tileIndex: Index;
  readonly tileRegion: Region;

  /**
   * Creates a new RegionIndex object.
   * 
   * @param tileIndex The identifier of the tile which contains the region.
   * @param regionType The type of the region.
   */
  constructor(tileIndex: Index, regionType: Region) {
    this.tileIndex = tileIndex;
    this.tileRegion = regionType;
  }
}

function applyFill<T>(region: Region, fill: T, map: Immutable.Map<Region, T>, emptyState: T):
  Immutable.Map<Region, T> {
  let result = map;
  if (region === Region.SQUARE) {
    result = map.set(region, fill);
  } else {
    const squareState = map.get(Region.SQUARE);
    if (squareState && squareState !== fill) {
      if (region === Region.UPPER_LEFT) {
        result = result.set(Region.UPPER_LEFT, fill)
          .set(Region.LOWER_RIGHT, squareState)
          .set(Region.SQUARE, emptyState);
      } else if (region === Region.UPPER_RIGHT) {
        result = result.set(Region.UPPER_RIGHT, fill)
          .set(Region.LOWER_LEFT, squareState)
          .set(Region.SQUARE, emptyState);
      } else if (region === Region.LOWER_RIGHT) {
        result = result.set(Region.LOWER_RIGHT, fill)
          .set(Region.UPPER_LEFT, squareState)
          .set(Region.SQUARE, emptyState);
      } else if (region === Region.LOWER_LEFT) {
        result = result.set(Region.LOWER_LEFT, fill)
          .set(Region.UPPER_RIGHT, squareState)
          .set(Region.SQUARE, emptyState);
      }
    } else {
      result = result.set(region, fill);
    }
  }

  return optimizeFill(result, emptyState);
}

function optimizeFill<T>(map: Immutable.Map<Region, T>, emptyState: T): Immutable.Map<Region, T> {
  const squareState = map.get(Region.SQUARE);
  if (squareState && squareState !== emptyState) {
    return Immutable.Map<Region, T>().set(Region.SQUARE, squareState);
  }

  const ulState = map.get(Region.UPPER_LEFT);

  if (ulState && ulState !== emptyState && ulState === map.get(Region.LOWER_RIGHT)) {
    return Immutable.Map<Region, T>().set(Region.SQUARE, map.get(Region.UPPER_LEFT));
  }

  const urState = map.get(Region.UPPER_RIGHT);
  if (urState && urState !== emptyState && urState === map.get(Region.LOWER_LEFT)) {
    return Immutable.Map<Region, T>().set(Region.SQUARE, map.get(Region.UPPER_RIGHT));
  }

  return map;
}