import Edge from 'Edge';
import Square from 'Square';

export class Tile {
  private index: TileIndex;
  private square: Square;
  private topEdge: Edge;
  private leftEdge: Edge;

  constructor(index: TileIndex) {
    this.index = index;
    this.square = new Square();
    this.topEdge = new Edge();
    this.leftEdge = new Edge();
  }

  getIndex(): TileIndex {
    return this.index;
  }

  getSquare(): Square {
    return this.square;
  }
  
  getTopEdge(): Edge {
    return this.topEdge;
  }

  getLeftEdge(): Edge {
    return this.leftEdge;
  }
}

export class TileIndex {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export enum TileElementType {
  SQUARE,
  TOP_EDGE,
  LEFT_EDGE
}

export class TileElementIndex {
  readonly index: TileIndex;
  readonly element: TileElementType;

  constructor(index: TileIndex, element: TileElementType) {
    this.index = index;
    this.element = element;
  }
}

