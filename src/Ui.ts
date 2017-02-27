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
  private hoverAction: (startCoords: Vec, endCoords: Vec) => void;
  private hoverEndAction: () => void;
  private moveAction: (dist: Vec) => void;
  private moveEndAction: (dist: Vec) => void;
  private selectAction: (startCoords: Vec, endCoords: Vec) => void;

  private isMouseDown: boolean = false;
  private mouseDown: Vec = new Vec(0, 0);

  constructor(container: HTMLElement, toolbar: HTMLElement) {
    this.container = container;
    this.overlay = <HTMLElement> container.querySelector(".overlay");
    this.toolbar = toolbar;
    
    this.modeChangeAction = () => {};
    this.hoverAction = () => {};
    this.hoverEndAction = () => {};
    this.moveAction = () => {};
    this.moveEndAction = () => {};
    this.selectAction = () => {};

    this.registerMouseEvents();
    this.registerKeyEvents();

    this.changeMode(Mode.BOX);
  }

  public onModeChange(action: (mode: Mode) => void) {
    this.modeChangeAction = action;
  }

  public onHover(action: (startCoords: Vec, endCoords: Vec) => void) {
    this.hoverAction = action;
  }

  public onHoverEnd(action: () => void) {
    this.hoverEndAction = action;
  }

  public onMove(action: (dist: Vec) => void) {
    this.moveAction = action;
  }

  public onMoveEnd(action: (dist: Vec) => void) {
    this.moveEndAction = action;
  }

  public onSelect(action: (startCoords: Vec, endCoords: Vec) => void) {
    this.selectAction = action;
  }

  private changeMode(mode: Mode): void {
    if (this.mode == mode) {
      return;
    }

    // Tear down old mode
    switch (this.mode) {
      case Mode.MOVE:
        this.isMouseDown = false;
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
      this.mouseDown = new Vec(e.clientX, e.clientY);
      this.isMouseDown = true;
    };

    overlay.onmouseup = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          if (this.isMouseDown) {
            this.moveEndAction(new Vec(
              e.clientX - this.mouseDown.x, 
              e.clientY - this.mouseDown.y));
          }
          break;

        default:
          if (this.isMouseDown) {
            this.selectAction(this.mouseDown, new Vec(e.clientX, e.clientY));
          }
      }
      this.isMouseDown = false;
    };
    
    overlay.onmouseout = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          if (this.isMouseDown) {
            this.moveEndAction(new Vec(
              e.clientX - this.mouseDown.x, 
              e.clientY - this.mouseDown.y));
          }
          break;

        case Mode.BOX:
        case Mode.DIAG:
        default:
          this.hoverEndAction();

      }
      this.isMouseDown = false;
    };

    overlay.onmousemove = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.MOVE:
          if (!this.isMouseDown) {
            break;
          }
          this.moveAction(new Vec(
              e.clientX - this.mouseDown.x,
              e.clientY - this.mouseDown.y));
          break;

        case Mode.BOX:
        case Mode.DIAG:
        default:
          const currentPos = new Vec(e.clientX, e.clientY);
          if (this.isMouseDown) {
            this.hoverAction(this.mouseDown, currentPos);
          } else {
            this.hoverAction(currentPos, currentPos);
          }
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
