import { WallEdge, WallFill } from 'Wall';

export class Tile {
  readonly index: Index;

  private wallEdgeRegions: Map<Region, WallEdge>;
  private wallFillRegions: Map<Region, WallFill>;

  constructor(index: Index) {
    this.index = index;
    this.wallEdgeRegions = new Map();
    this.wallFillRegions = new Map();
  }

  noState(): boolean {
    const hasWallEdge = [...this.wallEdgeRegions.values()].some(edge => edge !== WallEdge.NONE);
    const hasWallFill = [...this.wallFillRegions.values()].some(fill => fill !== WallFill.NONE);
    return !(hasWallEdge || hasWallFill);
  }

  getWallEdges(): Map<Region, WallEdge> {
    return this.wallEdgeRegions;
  }

  getWallEdge(region: Region): WallEdge {
    if (!region.isEdge()) {
      throw new TypeError("Tried to get wall edge style of non-edge region.");
    }
    const edgeRegions = this.wallEdgeRegions;
    if (!edgeRegions.get(region)) {
      edgeRegions.set(region, WallEdge.NONE);
    }
    return edgeRegions.get(region);
  }

  setWallEdge(region: Region, edge: WallEdge): void {
    if (!region.isEdge()) {
      throw new TypeError("Tried to set wall edge style of non-edge region.");
    }
    this.wallEdgeRegions.set(region, edge);
  }

  getWallFills(): Map<Region, WallFill> {
    return this.wallFillRegions;
  }

  getWallFill(region: Region): WallFill {
    if (!region.isFill()) {
      throw new TypeError("Tried to get wall fill style of non-fill region.");
    }
    const fillRegions = this.wallFillRegions;
    if (!fillRegions.get(region)) {
      fillRegions.set(region, WallFill.NONE);
    }
    return fillRegions.get(region);
  }

  setWallFill(region: Region, fill: WallFill): void {
    if (!region.isFill()) {
      throw new TypeError("Tried to set wall fill style of non-fill region.");
    }
    this.wallFillRegions.set(region, fill);
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