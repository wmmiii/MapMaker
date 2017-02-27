import { WallEdge, WallFill } from 'Wall';

export class Tile {
  readonly index: TileIndex;

  private wallEdgeRegions: Map<TileRegion, WallEdge>;
  private wallFillRegions: Map<TileRegion, WallFill>;

  constructor(index: TileIndex) {
    this.index = index;
    this.wallEdgeRegions = new Map();
    this.wallFillRegions = new Map();
  }

  noState(): boolean {
    const hasWallEdge = [...this.wallEdgeRegions.values()].some(edge => edge !== WallEdge.NONE);
    const hasWallFill = [...this.wallFillRegions.values()].some(fill => fill !== WallFill.NONE);
    return !(hasWallEdge || hasWallFill);
  }

  getWallEdges(): Map<TileRegion, WallEdge> {
    return this.wallEdgeRegions;
  }

  getWallEdge(region: TileRegion): WallEdge {
    if (!region.isEdge()) {
      throw new TypeError("Tried to get wall edge style of non-edge region.");
    }
    const edgeRegions = this.wallEdgeRegions;
    if (!edgeRegions.get(region)) {
      edgeRegions.set(region, WallEdge.NONE);
    }
    return edgeRegions.get(region);
  }

  setWallEdge(region: TileRegion, edge: WallEdge): void {
    if (!region.isEdge()) {
      throw new TypeError("Tried to set wall edge style of non-edge region.");
    }
    this.wallEdgeRegions.set(region, edge);
  }

  getWallFills(): Map<TileRegion, WallFill> {
    return this.wallFillRegions;
  }

  getWallFill(region: TileRegion): WallFill {
    if (!region.isFill()) {
      throw new TypeError("Tried to get wall fill style of non-fill region.");
    }
    const fillRegions = this.wallFillRegions;
    if (!fillRegions.get(region)) {
      fillRegions.set(region, WallFill.NONE);
    }
    return fillRegions.get(region);
  }

  setWallFill(region: TileRegion, fill: WallFill): void {
    if (!region.isFill()) {
      throw new TypeError("Tried to set wall fill style of non-fill region.");
    }
    this.wallFillRegions.set(region, fill);
  }
}

export class TileIndex {
  private static indicies: any = {};
  readonly x: number;
  readonly y: number;

  static of(x: number, y: number) {
    if (TileIndex.indicies[x] == null) {
      TileIndex.indicies[x] = {};
      TileIndex.indicies[x][y] = new TileIndex(x, y);
    } else if (TileIndex.indicies[x][y] == null) {
      TileIndex.indicies[x][y] = new TileIndex(x, y);
    }

    return TileIndex.indicies[x][y];
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

export class TileRegion {
  static readonly TOP_EDGE: TileRegion = new TileRegion(RegionType.EDGE);
  static readonly LEFT_EDGE: TileRegion = new TileRegion(RegionType.EDGE);
  static readonly NW_CROSS: TileRegion = new TileRegion(RegionType.EDGE);
  static readonly NE_CROSS: TileRegion = new TileRegion(RegionType.EDGE);

  static readonly SQUARE: TileRegion = new TileRegion(RegionType.FILL);
  static readonly UPPER_LEFT: TileRegion = new TileRegion(RegionType.FILL);
  static readonly UPPER_RIGHT: TileRegion = new TileRegion(RegionType.FILL);
  static readonly LOWER_RIGHT: TileRegion = new TileRegion(RegionType.FILL);
  static readonly LOWER_LEFT: TileRegion = new TileRegion(RegionType.FILL);


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

export class TileRegionIndex {
  readonly tileIndex: TileIndex;
  readonly tileRegion: TileRegion;

  constructor(tileIndex: TileIndex, regionType: TileRegion) {
    this.tileIndex = tileIndex;
    this.tileRegion = regionType;
  }
}