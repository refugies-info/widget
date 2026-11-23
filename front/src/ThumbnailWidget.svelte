<script lang="ts">
  import { fetchThumbnail } from "./lib/api.js";
  import EmptyState from "./lib/components/EmptyState.svelte";
  import LanguageBar from "./lib/components/LanguageBar.svelte";
  import LanguageSelect from "./lib/components/LanguageSelect.svelte";
  import ThumbnailCard from "./lib/components/ThumbnailCard.svelte";
  import { SITE_LANGUAGES } from "./lib/languages.js";
  import { useRequest } from "./lib/useRequest.svelte.js";
  import { t } from "./lib/wording.js";

  let {
    publicId,
    locale,
    onselectlocale,
  }: { publicId: string; locale: string; onselectlocale: (code: string) => void } = $props();

  const request = useRequest((signal) => fetchThumbnail(publicId, locale, signal));
</script>

{#if "error" === request.state.status}
  <main class="widget">
    <EmptyState title={t(locale, "loadError")} />
  </main>
{:else if request.state.status === "ready"}
  {@const content = request.state.data}
  <main class="widget">
    <div class="language-bar">
      <LanguageBar
        languages={SITE_LANGUAGES}
        selected={locale}
        {locale}
        availableLanguages={content?.availableLanguages}
        onselect={onselectlocale}
      />
    </div>
    <div class="language-select">
      <LanguageSelect
        languages={SITE_LANGUAGES}
        selected={locale}
        label={t(locale, "translateLabel")}
        availableLanguages={content?.availableLanguages}
        onselect={onselectlocale}
      />
    </div>
    {#if content}
      <ThumbnailCard {content} {locale} />
    {:else}
      <EmptyState title={t(locale, "emptyTitle")} text={t(locale, "emptyText")} />
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
