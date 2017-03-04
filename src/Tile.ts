///<reference path='../lib/immutable-js/dist/immutable.d.ts'/>
import { WallEdge, WallFill } from 'Wall';

export class Tile {
  constructor(readonly index: Index,
    private wallEdgeRegions?: Immutable.Map<Region, WallEdge>,
    private wallFillRegions?: Immutable.Map<Region, WallFill>) {
    this.wallEdgeRegions = wallEdgeRegions || Immutable.Map<Region, WallEdge>();
    this.wallFillRegions = wallFillRegions || Immutable.Map<Region, WallFill>();
  }

  noState(): boolean {
    const hasWallEdge = this.wallEdgeRegions.some(edge => edge !== WallEdge.NONE);
    const hasWallFill = this.wallFillRegions.some(fill => fill !== WallFill.NONE);
    return !(hasWallEdge || hasWallFill);
  }

  getWallEdges(): Immutable.Map<Region, WallEdge> {
    return this.wallEdgeRegions;
  }

  getWallEdge(region: Region): WallEdge {
    if (!region.isEdge()) {
      throw new TypeError("Tried to get wall edge style of non-edge region.");
    }
    return this.wallEdgeRegions.get(region) || WallEdge.NONE;
  }

  setWallEdge(region: Region, edge: WallEdge): Tile {
    if (!region.isEdge()) {
      throw new TypeError("Tried to set wall edge style of non-edge region.");
    }
    return new Tile(this.index,
      this.wallEdgeRegions.set(region, edge),
      this.wallFillRegions);
  }

  getWallFills(): Immutable.Map<Region, WallFill> {
    return this.wallFillRegions;
  }

  getWallFill(region: Region): WallFill {
    if (!region.isFill()) {
      throw new TypeError("Tried to get wall fill style of non-fill region.");
    }
    return this.wallFillRegions.get(region) || WallFill.NONE;
  }

  setWallFill(region: Region, fill: WallFill): Tile {
    if (!region.isFill()) {
      throw new TypeError("Tried to set wall fill style of non-fill region.");
    }
    return new Tile(this.index,
      this.wallEdgeRegions,
      this.wallFillRegions.set(region, fill));
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