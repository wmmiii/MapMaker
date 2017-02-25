export enum Mode {
  Drag
}

export default class Ui {
  private dragAction: (x: number, y: number) => void;
  private dragEndAction: (x: number, y: number) => void;
  private canvas: HTMLElement;

  private mode: Mode = Mode.Drag;

  private isDragging: boolean = false;
  private dragStart = {'x': 0, 'y': 0};

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
    this.registerClickHandlers();
  }

  public bindDragAction(action: (x: number, y: number) => void) {
    this.dragAction = action;
  }

  public bindDragEndAction(action: (x: number, y: number) => void) {
    this.dragEndAction = action;
  }

  private registerClickHandlers() {
    const canvas = this.canvas;
    canvas.onmousedown = (e: MouseEvent) => {
      if (this.mode === Mode.Drag) {
        console.log(e);
        this.dragStart = {'x': e.clientX, 'y': e.clientY};
        this.isDragging = true;
      }
    };

    const dragEnd = (e: MouseEvent) => {
      if (this.dragEndAction == null) {
        console.error("No end drag action registered");
      } else {
        this.dragEndAction(e.clientX, e.clientY);
      }
      this.isDragging = false;
    };

    canvas.onmouseup = dragEnd;
    canvas.onmouseout = dragEnd;

    canvas.onmousemove = (e: MouseEvent) => {
      switch (this.mode) {
        case Mode.Drag:
          if (!this.isDragging) {
            break;
          }
          if (this.dragAction === null) {
            console.error("No drag action registered");
            return;
          } else {
            this.dragAction(
                e.clientX - this.dragStart.x,
                e.clientY - this.dragStart.y);
          }
          break;
      }
    };
  }
};
