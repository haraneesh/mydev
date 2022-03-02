const hideBottom = -70;
let bottom = hideBottom;
let intervalID = 0;

function show() {
  const toolBar = document.getElementById('toolBar');
  if (toolBar !== null) {
    toolBar.style.display = 'flex';

    bottom = parseInt(toolBar.style.bottom, 10);
    if (bottom < 0) {
      bottom += 10;
      toolBar.style.bottom = `${bottom}px`;
    } else {
      clearInterval(intervalID);
    }
  }
}

export function reset() {
  clearInterval(intervalID);
  bottom = hideBottom;
  const toolBar = document.getElementById('toolBar');
  if (toolBar !== null) {
    toolBar.style.display = 'none';
    toolBar.style.bottom = `${bottom}px`;
  }
}

export function bringUp() {
  clearInterval(intervalID);
  intervalID = setInterval(show, 20);
}
