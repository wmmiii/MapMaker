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
    this.overlay = <HTMLElement> container.querySelector('.overlay');
    this.toolbar = toolbar;

    this.toolMapping = new Map();
    this.toolMapping.set(ToolId.MOVE, ['move_tool', 'm']);
    this.toolMapping.set(ToolId.BOX_WALL, ['box_tool', 'b']);
    this.toolMapping.set(ToolId.DIAG_WALL, ['diag_tool', 'd']);

    this.bindMouseEvents();
    this.bindKeyEvents();
    this.bindToolbar();
  }

  public setTool(tool: ToolId): void {
    this.isMouseDown = false;

    if (tool === ToolId.MOVE) {
      this.overlay.style.cursor = 'move';
    } else {
      this.overlay.style.cursor = 'pointer';
    }

    this.toolMapping.forEach(([id, shortcut], toolId) => {
      let element = <HTMLElement> this.toolbar.querySelector("#" + id);
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
      this.app.cancel();
      this.isMouseDown = false;
    };

    overlay.onmousemove = (e: MouseEvent) => {
      const currentPos = Vec.of(e.clientX, e.clientY);
      if (this.isMouseDown) {
        this.app.hover(this.mouseDown, currentPos);
      } else {
        this.app.hover(currentPos, currentPos);
      }
    };
  }

  private bindKeyEvents() {
    this.container.onkeydown = (e: KeyboardEvent) => {
      let foundTool;
      this.toolMapping.forEach(([tool, [_, shortcut]]) => {
        if (shortcut.charCodeAt(0) === e.keyCode) {
          foundTool = tool;
        }
      });
      if (foundTool) {
        this.app.setCurrentTool(foundTool);
        return;
      }
      
      console.log(e.keyCode);
    }
  }

  private bindToolbar() {
    this.toolMapping.forEach(([id, shortcut], tool) => {
      const element = <HTMLElement> this.toolbar.querySelector('#' + id);
      element.onclick = () => {
        this.app.setCurrentTool(tool);
      };
    });
  }
};
