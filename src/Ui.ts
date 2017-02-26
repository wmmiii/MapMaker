import Vec from 'Vec';

export enum Mode {
  MOVE,
  SELECT
}

export class Ui {
  private mode: Mode;
  private body: HTMLElement;
  private canvas: HTMLElement;

  private modeChangeAction: (mode: Mode) => void;
  private hoverAction: (cords: Vec) => void;
  private moveAction: (dist: Vec) => void;
  private moveEndAction: (dist: Vec) => void;

  private isMoving: boolean = false;
  private dragStart: Vec = new Vec(0, 0);

  constructor(body: HTMLElement, canvas: HTMLElement) {
    this.body = body;
    this.canvas = canvas;
    
    this.modeChangeAction = (mode: Mode) => {};
    this.hoverAction = (cords: Vec) => {};
    this.moveAction = (dist: Vec) => {};
    this.moveEndAction = (dist: Vec) => {};

    this.registerMouseEvents();
    this.registerKeyEvents();

    this.changeMode(Mode.SELECT);
  }

  public onModeChange(action: (mode: Mode) => void) {
    this.modeChangeAction = action;
  }

  public onHover(action: (cords: Vec) => void) {
    this.hoverAction = action;
  }

  public onMove(action: (dist: Vec) => void) {
    this.moveAction = action;
  }

  public onMoveEnd(action: (dist: Vec) => void) {
    this.moveEndAction = action;
  }

  private changeMode(mode: Mode): void {
    if (this.mode == mode) {
      return;
    }

    // Tear down old mode
    switch (this.mode) {
      case Mode.MOVE:
        this.isMoving = false;
        break;
    }
    this.body.classList.remove("mode_" + Mode[this.mode]);

    // Set up new mode
    switch (mode) {
    }
    this.body.classList.add("mode_" + Mode[mode]);

    this.mode = mode;
    this.modeChangeAction(mode);
  }

  private registerMouseEvents() {
    const canvas = this.canvas;
    canvas.onmousedown = (e: MouseEvent) => {
      if (this.mode === Mode.MOVE) {
        this.dragStart = new Vec(e.clientX, e.clientY);
        this.isMoving = true;
      }
    };

    const mouseUp = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          if (this.isMoving) {
            this.moveEndAction(new Vec(
              e.clientX - this.dragStart.x, 
              e.clientY - this.dragStart.y));
          }
          this.isMoving = false;
          break;
      }
    };

    canvas.onmouseup = mouseUp;
    canvas.onmouseout = mouseUp;

    canvas.onmousemove = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          if (!this.isMoving) {
            break;
          }
          this.moveAction(new Vec(
              e.clientX - this.dragStart.x,
              e.clientY - this.dragStart.y));
          break;
        case Mode.SELECT:
         this.hoverAction(new Vec(e.clientX, e.clientY));
      }
    };
  }

  private registerKeyEvents() {
    this.body.onkeydown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 32: // spacebar
          this.changeMode(Mode.SELECT);
          break;
        case 77: // m
          this.changeMode(Mode.MOVE);
          break;
        default:
          console.log(e.keyCode);
      }
    }
  }
};
