import Renderer from 'Renderer';
import Ui from 'Ui';

export const init = () => {
  const canvas = <HTMLCanvasElement> document.getElementById("canvas");
  const ui = new Ui(canvas);
  const renderer =  new Renderer(canvas);
 
  const redraw = () => {
    renderer.clear();
    renderer.drawGrid();
  };

  const resizeCanvas = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    redraw();
  }; 

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  
  ui.bindDragAction((x: number, y: number) => {
    renderer.setOffset(x, y);
    redraw();
  });

};
