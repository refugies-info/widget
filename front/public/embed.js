// Resizes the iframes of the Réfugiés.info widgets of the page. Given with the embed code.
(() => {
  const script = document.currentScript;
  if (!script) return;
  const widgetOrigin = new URL(script.src).origin;

  window.refugiesInfoWidgets ??= new Set();
  const loadedOrigins = window.refugiesInfoWidgets;

  const askHeight = () => {
    for (const iframe of document.querySelectorAll("iframe")) {
      if (iframe.src.startsWith(`${widgetOrigin}/`)) {
        iframe.contentWindow?.postMessage({ type: "widget-height-request" }, widgetOrigin);
      }
    }
  };

  if (loadedOrigins.has(widgetOrigin)) {
    askHeight();
    return;
  }
  loadedOrigins.add(widgetOrigin);

  const heights = new WeakMap();
  const fullscreens = new WeakMap();

  const applyHeight = (iframe) => {
    const height = heights.get(iframe);
    if (height && !fullscreens.has(iframe)) iframe.style.height = `${height}px`;
  };

  const enterFullscreen = (iframe) => {
    if (fullscreens.has(iframe)) return;
    const page = document.documentElement;
    fullscreens.set(iframe, {
      style: iframe.getAttribute("style"),
      overflow: page.style.overflow,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });

    const styles = {
      position: "fixed",
      top: "0",
      bottom: "auto",
      left: "max(0px, calc(50% - 299px))",
      right: "auto",
      width: "min(100%, 599px)",
      "min-width": "0",
      "max-width": "none",
      height: window.CSS?.supports("height", "100dvh") ? "100dvh" : "100vh",
      "min-height": "0",
      "max-height": "none",
      margin: "0",
      padding: "0",
      border: "0",
      transform: "none",
      "z-index": "2147483647",
      "box-shadow": "0 0 0 100vmax rgba(0, 0, 0, 0.5)",
    };
    for (const [name, value] of Object.entries(styles)) {
      iframe.style.setProperty(name, value, "important");
    }
    page.style.overflow = "hidden";

    if (iframe.showPopover) {
      iframe.setAttribute("popover", "manual");
      iframe.showPopover();
    }
  };

  const leaveFullscreen = (iframe) => {
    const previous = fullscreens.get(iframe);
    if (!previous) return;
    fullscreens.delete(iframe);
    if (iframe.hasAttribute("popover")) {
      iframe.hidePopover();
      iframe.removeAttribute("popover");
    }
    if (previous.style === null) iframe.removeAttribute("style");
    else iframe.setAttribute("style", previous.style);
    document.documentElement.style.overflow = previous.overflow;
    applyHeight(iframe);
    window.scrollTo({ left: previous.scrollX, top: previous.scrollY, behavior: "instant" });
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== widgetOrigin) return;
    const iframe = [...document.querySelectorAll("iframe")].find(
      (candidate) => candidate.contentWindow === event.source,
    );
    if (!iframe) return;

    const { type, height, active } = event.data ?? {};
    if (type === "widget-height" && Number.isFinite(height) && height > 0) {
      heights.set(iframe, height);
      applyHeight(iframe);
    } else if (type === "widget-fullscreen") {
      if (active === true) enterFullscreen(iframe);
      else leaveFullscreen(iframe);
    }
  });

  askHeight();
})();
