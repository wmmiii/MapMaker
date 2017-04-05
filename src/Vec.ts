/**
 * A two-dimensional vector. Instances of Vec are immutable.
 */
export default class Vec {
  readonly x: number;
  readonly y: number;

  /**
   * Creates a new vector
   * 
   * @param x The first length component.
   * @param y The second length component.
   */
  static of(x: number, y: number) {
    return new Vec(x, y);
  }

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns a vector whose lengths are the absolute values of this vectors 
   * lengths.
   */
  abs(): Vec {
    return Vec.of(Math.abs(this.x), Math.abs(this.y));
  }

  /**
   * Returns a vector whose lengths are the sum of this vector's lengths and the
   * specified vector's lengths.
   * 
   * @param vec The vector to add to this.
   */
  add(vec: Vec): Vec {
    return Vec.of(this.x + vec.x, this.y + vec.y);
  }

  /**
   * Returns a vector whose lengths are the difference between this vector's 
   * lengths and the specified vector's lengths.
   * 
   * @param vec The vector to subtract from this.
   */
  sub(vec: Vec): Vec {
    return Vec.of(this.x - vec.x, this.y - vec.y);
  }

  /**
   * Returns a vector whose lengths are multiplied by the number specified.
   * 
   * @param num The number to multiply this vector by.
   */
  mul(num: number): Vec {
    return Vec.of(this.x * num, this.y * num);
  }

  /**
   * Returns a vector whose lengths are the remainder of this vector's lengths
   * divided by the number specified.
   * 
   * @param num The number to mod this vector by.
   */
  mod(num: number): Vec {
    return Vec.of(this.x % num, this.y % num);
  }

  /**
   * Returns a vector whose lengths are the greatest integer that is still 
   * smaller than this vector's lengths.
   */
  floor() {
    return Vec.of(Math.floor(this.x), Math.floor(this.y));
  }
}
