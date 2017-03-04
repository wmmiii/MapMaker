import App from 'App';
import { ToolId } from 'tools/Tool';
import Vec from 'Vec';

export default class Ui {
  private app: App;
  private container: HTMLElement;
  private overlay: HTMLElement;
  private toolbar: HTMLElement;

  private isMouseDown: boolean = false;
  private mouseDown: Vec = null;
  private toolMapping: Map<ToolId, [string, string]>;

  constructor(app: App, container: HTMLElement, toolbar: HTMLElement) {
    this.app = app;
    this.container = container;
    this.overlay = container.querySelector('.overlay') as HTMLElement;
    this.toolbar = toolbar;

    this.toolMapping = new Map();
    this.toolMapping.set(ToolId.MOVE, ['move-tool', 'm']);
    this.toolMapping.set(ToolId.BOX_WALL, ['box-tool', 'b']);
    this.toolMapping.set(ToolId.CIRCLE_WALL, ['circle-tool', 'c']);
    this.toolMapping.set(ToolId.DIAG_WALL, ['diag-tool', 'd']);
    this.toolMapping.set(ToolId.ERASER, ['eraser-tool', 'e']);
    this.toolMapping.set(ToolId.SHITTY_CIRCLE, ['', 's']);

    this.bindMouseEvents();
    this.bindKeyEvents();
    this.bindToolbar();

    this.overlay.focus();
  }

  public setTool(tool: ToolId): void {
    this.isMouseDown = false;

    if (tool === ToolId.MOVE) {
      this.overlay.style.cursor = 'move';
    } else {
      this.overlay.style.cursor = 'pointer';
    }

    this.toolMapping.forEach(([id, shortcut], toolId) => {
      if (id === '') {
        return;
      }
      let element = this.toolbar.querySelector('#' + id) as HTMLElement;
      if (toolId === tool) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  }

  private bindMouseEvents() {
    const overlay = this.overlay;
    overlay.onmousedown = (e: MouseEvent) => {
      this.mouseDown = Vec.of(e.clientX, e.clientY);
      this.isMouseDown = true;
    };

    overlay.onmouseup = (e: MouseEvent) => {
      if (this.isMouseDown) {
        this.app.select(this.mouseDown, Vec.of(e.clientX, e.clientY));
      }
      this.isMouseDown = false;
    };

    overlay.onmouseout = (e: MouseEvent) => {
      this.cancelHover();
    };

    overlay.onmousemove = (e: MouseEvent) => {
      const currentPos = Vec.of(e.clientX, e.clientY);
      if (this.isMouseDown) {
        this.app.hover(this.mouseDown, currentPos);
      } else {
        this.app.hover(currentPos, currentPos);
      }
    };

    overlay.onwheel = (e: MouseWheelEvent) => {
      this.app.zoom(e.wheelDelta / 120, Vec.of(e.clientX, e.clientY));
      this.app.cancel();
    };
  }

  private bindKeyEvents() {
    this.container.onkeydown = (e: KeyboardEvent) => {
      let foundTool: ToolId;
      this.toolMapping.forEach(([_, shortcut], tool) => {
        if (shortcut === e.key) {
          foundTool = tool;
        }
      });
      if (foundTool) {
        this.app.cancel();
        this.app.setCurrentTool(foundTool);
        return;
      }

      if (e.ctrlKey) {
        if (e.key === 'z') {
          this.app.undo();
        } else if (e.key === 'y') {
          this.app.redo();
        }
        return;
      }

      // Bind ESC key to cancel
      if (e.keyCode === 27) {
        this.cancelHover();
        return;
      }

      console.log(e.keyCode);
    }
  }

  private bindToolbar() {
    this.toolMapping.forEach(([id, shortcut], tool) => {
      if (id === '') {
        return;
      }
      const element = this.toolbar.querySelector('#' + id) as HTMLElement;
      element.onclick = () => {
        this.app.setCurrentTool(tool);
      };
    });
  }

  private cancelHover() {
    this.isMouseDown = false;
    this.app.cancel();
  }
};
