export class Edge {
  static readonly NONE = new Edge('NONE');
  static readonly BARRIER = new Edge('BARRIER');
  static readonly DOOR = new Edge('DOOR');
  static readonly DOOR_LOCKED = new Edge('DOOR_LOCKED');

  private static mapping: Map<string, Edge>;

  private constructor(private name: string) {
    if (!Edge.mapping) {
      Edge.mapping = new Map();
    }
    Edge.mapping.set(name, this);
  }

  static forEach(action: (edge: Edge) => void) {
    this.mapping.forEach(action);
  }

  static fromString(name: string) {
    return Edge.mapping.get(name);
  }

  getName(): string {
    return this.name;
  }
}

export class Fill {
  static readonly NONE = new Fill('NONE');
  static readonly BARRIER = new Fill('BARRIER');
  static readonly TERRAIN_DIFFICULT = new Fill('TERRAIN_DIFFICULT');
  static readonly TERRAIN_WATER = new Fill('TERRAIN_WATER');

  private static mapping: Map<string, Fill>;

  private constructor(private name: string) {
    if (!Fill.mapping) {
      Fill.mapping = new Map();
    }
    Fill.mapping.set(name, this);
  }

  static forEach(action: (fill: Fill) => void) {
    this.mapping.forEach(action);
  }

  static fromString(name: string) {
    return Fill.mapping.get(name);
  }

  getName(): string {
    return this.name;
  }
}