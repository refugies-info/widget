import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { reportHeight } from "./lib/hostPage.js";

const target = document.getElementById("app");
if (!target) throw new Error("Missing #app element");

mount(App, { target });

reportHeight(target);
