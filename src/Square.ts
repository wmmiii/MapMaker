export default class Square {
  private state: State;

  constructor() {
    this.state = State.NONE;
  }

  getState(): State {
    return this.state;
  }

  setState(state: State): void {
    this.state = state;
  }
}

export enum State {
  NONE,
  BARRIER
}

