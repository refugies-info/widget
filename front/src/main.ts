import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { isPreview, PREVIEW_HEIGHT_MESSAGE } from "./lib/preview.js";

const target = document.getElementById("app");
if (!target) throw new Error("Missing #app element");

mount(App, { target });

// The height is the only thing sent, so any parent can receive it
if (isPreview(window.location.search)) {
  new ResizeObserver(() => {
    const height = Math.ceil(target.getBoundingClientRect().height);
    window.parent.postMessage({ type: PREVIEW_HEIGHT_MESSAGE, height }, "*");
  }).observe(target);
}
