import Vec from 'Vec';

export enum Mode {
  MOVE,
  BOX,
  DIAG,
  SELECT
}

export class Ui {
  private mode: Mode;
  private container: HTMLElement;
  private overlay: HTMLElement;
  private toolbar: HTMLElement;

  private modeChangeAction: (mode: Mode) => void;
  private hoverAction: (cords: Vec) => void;
  private moveAction: (dist: Vec) => void;
  private moveEndAction: (dist: Vec) => void;
  private selectAction: (cords: Vec) => void;

  private isMoving: boolean = false;
  private dragStart: Vec = new Vec(0, 0);

  constructor(container: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.overlay = <HTMLElement> container.querySelector(".overlay");
    this.toolbar = toolbar;
    
    this.modeChangeAction = (mode: Mode) => {};
    this.hoverAction = (cords: Vec) => {};
    this.moveAction = (dist: Vec) => {};
    this.moveEndAction = (dist: Vec) => {};
    this.selectAction = (cords: Vec) => {};

    this.registerMouseEvents();
    this.registerKeyEvents();

    this.changeMode(Mode.BOX);
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

  public onSelect(action: (cords: Vec) => void) {
    this.selectAction = action;
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
    this.overlay.classList.remove("mode_" + Mode[this.mode]);
    let activeButton = 
      this.toolbar.querySelector("#button_" + Mode[this.mode]);
    if (activeButton !== null) {
        activeButton.classList.remove("selected");
    }

    // Set up new mode
    switch (mode) {
    }
    this.overlay.classList.add("mode_" + Mode[mode]);
    let inactiveButton = 
      this.toolbar.querySelector("#button_" + Mode[mode]);
    if (inactiveButton !== null) {
        inactiveButton.classList.add("selected");
    }

    this.mode = mode;
    this.modeChangeAction(mode);
  }

  private registerMouseEvents() {
    const overlay = this.overlay;
    overlay.onmousedown = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          this.dragStart = new Vec(e.clientX, e.clientY);
          this.isMoving = true;
          break;
        case Mode.BOX:
        case Mode.DIAG:
        default:
          this.selectAction(new Vec(e.clientX, e.clientY));
          break;
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

    overlay.onmouseup = mouseUp;
    overlay.onmouseout = mouseUp;

    overlay.onmousemove = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          if (!this.isMoving) {
            break;
          }
          this.moveAction(new Vec(
              e.clientX - this.dragStart.x,
              e.clientY - this.dragStart.y));
          break;
        case Mode.BOX:
        case Mode.DIAG:
        default:
         this.hoverAction(new Vec(e.clientX, e.clientY));
      }
    };

    // Iterate over modes and register the buttons
    for (let mode of Object.keys(Mode)
                .map((key: any) => Mode[key])
                .filter((value: any) => typeof value === "number")
                .map((value: any) => <number> value)) {
      const button = <HTMLElement> this.toolbar
          .querySelector("#button_" + Mode[mode]);
      if (button !== null) {
        button.onclick = () => {
          this.changeMode(mode);
        };
      }
    }
  }

  private registerKeyEvents() {
    this.container.onkeydown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 65: // a
          this.changeMode(Mode.BOX);
          break;
        case 83: // s
          this.changeMode(Mode.DIAG);
          break;
        case 68: //d
          this.changeMode(Mode.MOVE);
          break;
        default:
          console.log(e.keyCode);
      }
    }
  }
};
