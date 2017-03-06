///<reference path='../lib/immutable-js/dist/immutable.d.ts'/>
import { Edge, Fill } from 'RegionTypes';

export class Tile {
  constructor(readonly index: Index,
    private edgeRegions?: Immutable.Map<Region, Edge>,
    private fillRegions?: Immutable.Map<Region, Fill>) {
    this.edgeRegions = edgeRegions || Immutable.Map<Region, Edge>();
    this.fillRegions = fillRegions || Immutable.Map<Region, Fill>();
  }

  noState(): boolean {
    const hasEdge = this.edgeRegions.some(edge => edge !== Edge.NONE);
    const hasFill = this.fillRegions.some(fill => fill !== Fill.NONE);
    return !(hasEdge || hasFill);
  }

  getEdges(): Immutable.Map<Region, Edge> {
    return this.edgeRegions;
  }

  getEdge(region: Region): Edge {
    if (!region.isEdge()) {
      throw new TypeError("Tried to get edge style of non-edge region.");
    }
    return this.edgeRegions.get(region) || Edge.NONE;
  }

  setEdge(region: Region, edge: Edge): Tile {
    if (!region.isEdge()) {
      throw new TypeError("Tried to set edge style of non-edge region.");
    }
    return new Tile(this.index,
      this.edgeRegions.set(region, edge),
      this.fillRegions);
  }

  getFills(): Immutable.Map<Region, Fill> {
    return this.fillRegions;
  }

  getFill(region: Region): Fill {
    if (!region.isFill()) {
      throw new TypeError("Tried to get fill style of non-fill region.");
    }
    return this.fillRegions.get(region) || Fill.NONE;
  }

  setFill(region: Region, fill: Fill): Tile {
    if (!region.isFill()) {
      throw new TypeError("Tried to set fill style of non-fill region.");
    }
    return new Tile(this.index,
      this.edgeRegions,
      applyFill(region, fill, this.fillRegions, Fill.NONE));
  }
}

export class Index {
  private static indicies: any = {};
  readonly x: number;
  readonly y: number;

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

export class Region {
  static readonly TOP_EDGE: Region = new Region(RegionType.EDGE);
  static readonly LEFT_EDGE: Region = new Region(RegionType.EDGE);
  static readonly NW_CROSS: Region = new Region(RegionType.EDGE);
  static readonly NE_CROSS: Region = new Region(RegionType.EDGE);

  static readonly SQUARE: Region = new Region(RegionType.FILL);
  static readonly UPPER_LEFT: Region = new Region(RegionType.FILL);
  static readonly UPPER_RIGHT: Region = new Region(RegionType.FILL);
  static readonly LOWER_RIGHT: Region = new Region(RegionType.FILL);
  static readonly LOWER_LEFT: Region = new Region(RegionType.FILL);


  private type: RegionType;

  private constructor(type: RegionType) {
    this.type = type;
  }

  isFill(): boolean {
    return this.type === RegionType.FILL;
  }

  isEdge(): boolean {
    return this.type === RegionType.EDGE;
  }
}

export class RegionIndex {
  readonly tileIndex: Index;
  readonly tileRegion: Region;

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