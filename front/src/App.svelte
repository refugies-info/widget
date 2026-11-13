<script lang="ts">
  import { fetchWidgetConfig, WidgetNotFoundError } from "./lib/api.js";
  import { isRtl } from "./lib/languages.js";
  import { readInitialLocale, readPublicId } from "./lib/locale.js";
  import { useRequest } from "./lib/useRequest.svelte.js";
  import ListWidget from "./ListWidget.svelte";
  import ThumbnailWidget from "./ThumbnailWidget.svelte";

  const publicId = readPublicId(window.location.pathname);
  let locale = $state(readInitialLocale(window.location.search));

  const request = useRequest((signal) =>
    publicId ? fetchWidgetConfig(publicId, signal) : Promise.reject(new WidgetNotFoundError()),
  );

  const selectLocale = (code: string) => {
    locale = code;
  };

  $effect(() => {
    document.documentElement.lang = locale;
  });
</script>

{#if publicId && request.state.status === "ready"}
  {@const config = request.state.data}
  <div dir={isRtl(locale) ? "rtl" : "ltr"}>
    {#if config.type === "thumbnail"}
      <ThumbnailWidget {publicId} {locale} onselectlocale={selectLocale} />
    {:else}
      <ListWidget {config} {publicId} {locale} onselectlocale={selectLocale} />
    {/if}
  </div>
{/if}
