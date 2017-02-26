export class Tile {
  private index: TileIndex;

  private edgeElements: {[key: string]: Edge};
  private fillElements: {[key: string]: Fill};

  constructor(index: TileIndex) {
    this.index = index;
    this.edgeElements = {};
    this.fillElements = {};
  }

  noState(): boolean {
    for (let key in this.edgeElements) {
      if (this.edgeElements[key] !== Edge.NONE) {
        return false;
      }
    }
    for (let key in this.fillElements) {
      if (this.edgeElements[key] !== Edge.NONE) {
        return false;
      }
    }
    return true;
  }

  getIndex(): TileIndex {
    return this.index;
  }

  getEdge(tileElement: TileElement): Edge {
    const edgeElements = this.edgeElements;
    const stringify = this.stringify;
    if (!isEdge(tileElement)) {
      throw new TypeError();
    }
    if (edgeElements[stringify(tileElement)] == null) {
      edgeElements[stringify(tileElement)] = Edge.NONE;
    }
    return edgeElements[stringify(tileElement)];
  }

  setEdge(tileElement: TileElement, edge: Edge): void {
    if (!isEdge(tileElement)) {
      throw new TypeError();
    }
    this.edgeElements[this.stringify(tileElement)] = edge;
  }
 
  getFill(tileElement: TileElement): Fill {
    const fillElements = this.fillElements;
    const stringify = this.stringify;
    if (!isFill(tileElement)) {
      throw new TypeError();
    }
    if (fillElements[stringify(tileElement)] == null) {
      fillElements[stringify(tileElement)] = Fill.NONE;
    }
    return fillElements[this.stringify(tileElement)];
  }

  setFill(tileElement: TileElement, fill: Fill): void {
    if (!isFill(tileElement)) {
      throw new TypeError();
    }
    this.fillElements[this.stringify(tileElement)] = fill;
  }

  private stringify(element: TileElement) {
    return TileElement[element];
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

export function isEdge(tileElement: TileElement) {
  return tileElement === TileElement.TOP_EDGE
      || tileElement === TileElement.LEFT_EDGE;
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
