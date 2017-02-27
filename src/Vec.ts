export default class Vec {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vec: Vec): Vec {
    return new Vec(this.x + vec.x, this.y + vec.y);
  }

  sub(vec: Vec): Vec {
    return new Vec(this.x - vec.x, this.y - vec.y);
  }

  mul(num: number): Vec {
    return new Vec(this.x * num, this.y * num);
  }
}
