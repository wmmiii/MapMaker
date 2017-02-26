import Edge from 'Edge';
import Fill from 'Fill';

export class Tile {
  private index: TileIndex;

  private edgeElements: {[key: TileElement]: Edge};
  private fillElements: {[key: TileElement]: Fill};

  constructor(index: TileIndex) {
    this.index = index;
    this.edgeElements = {};
    this.fillElements = {};
  }

  noState(): boolean {
    return this.square === Fill.NONE
        && this.topEdge === Edge.NONE
        && this.leftEdge === Edge.NONE
        && this.ulFill == Fill.NONE
        && this.urFill == Fill.NONE
        && this.lrFill == Fill.NONE
        && this.llFill == Fill.NONE;
  }

  getIndex(): TileIndex {
    return this.index;
  }

  getEdge(tileElement: TileElement): Edge {
    if (!isEdge(tileElement)) {
      throw new TypeError();
    }
    if (edgeElements[tileElement] === null) {
      edegeElements[tileElement] === null;
    }
    return edgeElements[tileElement];
  }

  setEdge(tileElement: TileElement, edge: Edge): void {
    if (!isEdge(tileElement)) {
      throw new TypeError();
    }
    edegeElements[tileElement] === edge;
  }
 
  getFill(tileElement: TileElement): Edge {
    if (!isFill(tileElement)) {
      throw new TypeError();
    }
    if (fillElements[tileElement] === null) {
      fillElements[tileElement] === null;
    }
    return fillElements[tileElement];
  }

  setFill(tileElement: TileElement, fill: Fill): void {
    if (!isFill(tileElement)) {
      throw new TypeError();
    }
    edegeElements[tileElement] === fill;
  }

  getSquare(): Fill {
    return this.square;
  }

  setSquare(square: Fill): void {
    this.square = square;
  }

  getTopEdge(): Edge {
    return this.topEdge;
  }

  setTopEdge(topEdge: Edge): void {
    this.topEdge = topEdge;
  }

  getLeftEdge(): Edge {
    return this.leftEdge;
  }

  setLeftEdge(leftEdge: Edge): void {
    this.leftEdge = leftEdge;
  }

  getUlFill(): Fill {
    return this.ulFill;
  }

  setUlFill(ulFill: Fill): void {
    this.ulFill = ulFill;
  }

  getUrFill(): Fill {
    return this.urFill;
  }

  setUrFill(urFill: Fill): void {
    this.urFill = urFill;
  }

  getLrFill(): Fill {
    return this.lrFill;
  }

  setLrFill(lrFill: Fill): void {
    this.lrFill = lrFill;
  }

  getLlFill(): Fill {
    return this.llFill;
  }

  setLlFill(llFill: Fill): void {
    this.llFill = llFill;
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

export enum TileElement {
  SQUARE,
  TOP_EDGE,
  LEFT_EDGE,
  UPPER_LEFT,
  UPPER_RIGHT,
  LOWER_RIGHT,
  LOWER_LEFT
}

export class TileElementIndex {
  readonly tileIndex: TileIndex;
  readonly elementType: TileElement;

  constructor(tileIndex: TileIndex, elementType: TileElement) {
    this.tileIndex = tileIndex;
    this.elementType = elementType;
  }
}

export enum Edge {
  NONE,
  BARRIER
}

export function isEdge(tileElement: tileElement) {
  return tileElement === TileElement.TOP_EDGE
      || tileELement === TileElement.LEFT_EDGE;
}

export enum Fill {
  NONE,
  BARRIER,
}

export function isFill(tileElement: TileElement) {
  return tileElement === TileElement.SQUARE
      || tileElement === TileElement.UPPER_LEFT
      || tileElement === TileElement.UPPER_RIGHT
      || tileElement === TileElement.LOWER_RIGHT
      || tileElement === TileElement.LOWER_LEFT;
}
