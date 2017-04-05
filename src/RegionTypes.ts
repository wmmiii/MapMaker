/**
 * Essentially an enum of all the edge regions in a tile.
 * 
 * Note: This class was modeled after Java's Enum.
 */
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

  /**
   * Performs the specified function on each Edge.
   * 
   * @param func The function to perform on each Edge.
   */
  static forEach(func: (edge: Edge) => void) {
    this.mapping.forEach(func);
  }

  /**
   * Returns the Edge with the specified name.
   * 
   * @param name The name of the Edge.
   */
  static fromString(name: string) {
    return Edge.mapping.get(name);
  }

  /**
   * Returns the name of this Edge.
   */
  getName(): string {
    return this.name;
  }
}

/**
 * Essentially an enum of all the fill regions in a tile.
 * 
 * Note: This class was modeled after Java's Enum.
 */
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

  /**
   * Performs the specified function on each Fill.
   * 
   * @param func The function to perform on each Fill.
   */
  static forEach(action: (fill: Fill) => void) {
    this.mapping.forEach(action);
  }

  /**
   * Returns the Fill with the specified name.
   * 
   * @param name The name of the Fill.
   */
  static fromString(name: string) {
    return Fill.mapping.get(name);
  }

  /**
   * Returns the name of this Fill.
   */
  getName(): string {
    return this.name;
  }
}