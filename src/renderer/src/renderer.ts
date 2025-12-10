// Basic renderer logic
const statusEl = document.getElementById("status") as HTMLElement;
const logEl = document.getElementById("log") as HTMLElement;

// @ts-ignore
window.electronAPI.onKeyEvent((_event, value) => {
  statusEl.innerText = `Last Key VK Code: ${value.vkCode}`;
  const li = document.createElement("li");
  li.innerText = `Key Pressed: ${
    value.vkCode
  } at ${new Date().toLocaleTimeString()}`;
  logEl.prepend(li);
  if (logEl.children.length > 10) logEl.removeChild(logEl.lastChild!);
});
