export const PREVIEW_HEIGHT_MESSAGE = "widget-preview-height";

/** The editor loads the page with `?preview=1` in an iframe, and sizes it to the widget. */
export const isPreview = (search: string) => new URLSearchParams(search).get("preview") === "1";
