export const HEIGHT_MESSAGE = "widget-height";
export const HEIGHT_REQUEST_MESSAGE = "widget-height-request";
export const FULLSCREEN_MESSAGE = "widget-fullscreen";

export const OVERLAY_ATTRIBUTE = "data-widget-overlay";
const OVERLAY_SHADOW_IN_PX = 8;

type Box = Pick<DOMRect, "top" | "bottom" | "height">;

export const measureHeight = (content: Box, overlays: Box[]) => {
  const bottoms = overlays
    .filter((overlay) => overlay.height > 0)
    .map((overlay) => overlay.bottom + OVERLAY_SHADOW_IN_PX);
  return Math.ceil(Math.max(content.bottom, ...bottoms) - content.top);
};

const sendToHostPage = (message: Record<string, unknown>) => {
  if (window.parent !== window) window.parent.postMessage(message, "*");
};

export const setHostFullscreen = (active: boolean) =>
  sendToHostPage({ type: FULLSCREEN_MESSAGE, active });

export const reportHeight = (target: HTMLElement) => {
  let sentHeight: number | undefined;

  const send = () => {
    const overlays = [...target.querySelectorAll(`[${OVERLAY_ATTRIBUTE}]`)];
    const height = measureHeight(
      target.getBoundingClientRect(),
      overlays.map((overlay) => overlay.getBoundingClientRect()),
    );
    if (height === sentHeight) return;
    sentHeight = height;
    sendToHostPage({ type: HEIGHT_MESSAGE, height });
  };

  const sizes = new ResizeObserver(send);
  sizes.observe(target);

  new MutationObserver(() => {
    sizes.disconnect();
    sizes.observe(target);
    for (const overlay of target.querySelectorAll(`[${OVERLAY_ATTRIBUTE}]`)) sizes.observe(overlay);
    send();
  }).observe(target, { childList: true, subtree: true });

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.data?.type !== HEIGHT_REQUEST_MESSAGE) return;
    sentHeight = undefined;
    send();
  });
};
