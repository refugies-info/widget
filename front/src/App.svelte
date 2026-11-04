<script lang="ts">
  import { onMount } from "svelte";
  import {
    type DisplayedThumbnail,
    fetchThumbnail,
    fetchWidgetConfig,
    WidgetNotFoundError,
  } from "./lib/api.js";
  import EmptyState from "./lib/components/EmptyState.svelte";
  import LanguageBar from "./lib/components/LanguageBar.svelte";
  import LanguageSelect from "./lib/components/LanguageSelect.svelte";
  import ThumbnailCard from "./lib/components/ThumbnailCard.svelte";
  import { isRtl, SITE_LANGUAGES } from "./lib/languages.js";
  import { readInitialLocale, readPublicId } from "./lib/locale.js";

  type State =
    | { status: "loading" }
    | { status: "unavailable" }
    | { status: "ready"; content: DisplayedThumbnail | null };

  const publicId = readPublicId(window.location.pathname);
  let locale = $state(readInitialLocale(window.location.search));
  let view = $state<State>({ status: publicId ? "loading" : "unavailable" });

  const load = async (id: string, requestedLocale: string) => {
    try {
      const config = await fetchWidgetConfig(id);
      if (config.type !== "thumbnail") {
        view = { status: "unavailable" };
        return;
      }
      view = { status: "ready", content: await fetchThumbnail(id, requestedLocale) };
    } catch (error) {
      if (!(error instanceof WidgetNotFoundError)) console.error(error);
      view = { status: "unavailable" };
    }
  };

  const selectLocale = (code: string) => {
    locale = code;
    if (publicId) load(publicId, code);
  };

  onMount(() => {
    if (publicId) load(publicId, locale);
  });
</script>

{#if view.status === "ready"}
  {@const { content } = view}
  <main class="widget" dir={isRtl(locale) ? "rtl" : "ltr"}>
    <div class="language-bar">
      <LanguageBar
        languages={SITE_LANGUAGES}
        selected={locale}
        availableLanguages={content?.availableLanguages}
        onselect={selectLocale}
      />
    </div>
    <div class="language-select">
      <LanguageSelect
        languages={SITE_LANGUAGES}
        selected={locale}
        availableLanguages={content?.availableLanguages}
        onselect={selectLocale}
      />
    </div>
    {#if content}
      <ThumbnailCard {content} {locale} />
    {:else}
      <EmptyState />
    {/if}
  </main>
{/if}

<style>
  .widget {
    container: widget / inline-size;
    border: 1px solid var(--border-default-grey);
    background: var(--background-default-grey);
    box-shadow: 0 4px 6px var(--shadow-color);
  }

  .language-bar {
    display: none;
  }

  @container widget (min-width: 600px) {
    .language-bar {
      display: block;
    }

    .language-select {
      display: none;
    }
  }
</style>
