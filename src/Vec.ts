export default class Vec {
  readonly x: number;
  readonly y: number;

  static of(x: number, y: number) {
    return new Vec(x, y);
  }

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abs(): Vec {
    return Vec.of(Math.abs(this.x), Math.abs(this.y));
  }

  add(vec: Vec): Vec {
    return Vec.of(this.x + vec.x, this.y + vec.y);
  }

  sub(vec: Vec): Vec {
    return Vec.of(this.x - vec.x, this.y - vec.y);
  }

  mul(num: number): Vec {
    return Vec.of(this.x * num, this.y * num);
  }

  mod(num: number): Vec {
    return Vec.of(this.x % num, this.y % num);
  }

  floor() {
    return Vec.of(Math.floor(this.x), Math.floor(this.y));
  }
}
