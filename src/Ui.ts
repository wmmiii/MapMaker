import App from 'App';
import { ToolId } from 'tools/Tool';
import Vec from 'Vec';

export default class Ui {
  private overlay: HTMLElement;

  private isMouseDown: boolean = false;
  private mouseDown: Vec = null;
  private toolMapping: Map<ToolId, [string, string]>;

  constructor(private app: App,
    private container: HTMLElement,
    private metabar: HTMLElement,
    private toolbar: HTMLElement) {
      
    this.overlay = container.querySelector('.overlay') as HTMLElement;

    this.toolMapping = new Map();
    this.toolMapping.set(ToolId.MOVE, ['move-tool', 'm']);
    this.toolMapping.set(ToolId.BOX_WALL, ['box-tool', 'b']);
    this.toolMapping.set(ToolId.CIRCLE_WALL, ['circle-tool', 'c']);
    this.toolMapping.set(ToolId.DIAG_WALL, ['diag-tool', 'd']);
    this.toolMapping.set(ToolId.DOOR, ['door-tool', 'd']);
    this.toolMapping.set(ToolId.TERRAIN_DIFFICULT, ['terrain-difficult-tool', 'x']);
    this.toolMapping.set(ToolId.TERRAIN_WATER, ['terrain-water-tool', 'w']);
    this.toolMapping.set(ToolId.ERASER, ['eraser-tool', 'e']);
    this.toolMapping.set(ToolId.SHITTY_CIRCLE, ['', 's']);

    this.bindMouseEvents();
    this.bindKeyEvents();
    this.bindToolbars();

    this.overlay.focus();
  }

  setTool(tool: ToolId): void {
    this.isMouseDown = false;

    if (tool === ToolId.MOVE) {
      this.overlay.style.cursor = 'move';
    } else {
      this.overlay.style.cursor = 'pointer';
    }

    this.toolMapping.forEach(([id, _], toolId) => {
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

  mapChange() {
      this.metabar.querySelector('#download-link-container').innerHTML = null;
  }

  private bindMouseEvents() {
    const overlay = this.overlay;
    overlay.onmousedown = (e: MouseEvent) => {
      this.mouseDown = Vec.of(e.clientX, e.clientY);
      this.isMouseDown = true;
    };

    overlay.onmouseup = (e: MouseEvent) => {
      if (this.isMouseDown) {
        const end = Vec.of(e.clientX, e.clientY);
        this.app.select(this.mouseDown, end);
        this.app.hover(end, end);
      }
      this.isMouseDown = false;
    };

    overlay.onmouseout = (_: MouseEvent) => {
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

  private bindToolbars() {
    const saveButton = this.metabar.querySelector('#export') as HTMLElement;
    saveButton.onclick = () => {
      const name = prompt("What should the filename be?", "map");
      const exported: string = this.app.export();
      const link: HTMLAnchorElement = document.createElement('a');
      link.download = name + '.mm';
      link.href = 'data:application/octet-stream;base64,' + btoa(exported);
      link.innerText = "Download";
      const linkContainer = this.metabar.querySelector('#download-link-container');
      linkContainer.innerHTML = '';
      linkContainer.appendChild(link);
    };

    const openButton = this.metabar.querySelector('#import') as HTMLElement;
    openButton.onclick = () => {
      const app = this.app;
      const input: HTMLInputElement = document.createElement('input');
      input.type = 'file';
      input.addEventListener('change', function(_: Event) {
        var file = this.files[0];
        if (!file) {
          return;
        }
        var reader = new FileReader();
        reader.addEventListener('load', function(_: Event) {
          app.import(this.result);
        });
        reader.readAsText(file);
      });
      input.click();
    };

    this.toolMapping.forEach(([id, _], tool) => {
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
