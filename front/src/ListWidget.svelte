<script lang="ts">
  import { fetchList, type PublicListWidgetConfig } from "./lib/api.js";
  import Baseline from "./lib/components/Baseline.svelte";
  import DispositifCard from "./lib/components/DispositifCard.svelte";
  import EmptyState from "./lib/components/EmptyState.svelte";
  import LanguageSelect from "./lib/components/LanguageSelect.svelte";
  import Pagination from "./lib/components/Pagination.svelte";
  import { SITE_LANGUAGES } from "./lib/languages.js";
  import { plainText } from "./lib/text.js";
  import { useRequest } from "./lib/useRequest.svelte.js";
  import { translate, translateCount } from "./lib/wording.js";

  let {
    config,
    publicId,
    locale,
    onselectlocale,
  }: {
    config: PublicListWidgetConfig;
    publicId: string;
    locale: string;
    onselectlocale: (code: string) => void;
  } = $props();

  let page = $state(1);

  const request = useRequest((signal) => fetchList(publicId, locale, page, signal));

  const description = $derived(config.displayDescription ? plainText(config.description) : "");
</script>

<div class="list">
  <header class="header">
    <div class="intro">
      <h1 class="title">{plainText(config.externalTitle)}</h1>
      {#if description}<p class="description">{description}</p>{/if}
    </div>
    <div class="language">
      <LanguageSelect
        languages={SITE_LANGUAGES}
        selected={locale}
        label={translate(locale, "translateInLabel")}
        availableLanguages={undefined}
        inline
        onselect={onselectlocale}
      />
    </div>
  </header>

  <section class="results" aria-busy={request.busy}>
    {#if request.state.status === "error"}
      <EmptyState title={translate(locale, "loadError")} />
    {:else if request.state.status === "loading"}
      <ul class="grid" aria-hidden="true">
        {#each { length: Math.min(config.pageSize, 8) } as _, index (index)}
          <li><div class="skeleton"><div class="skeleton-media"></div><div class="skeleton-lines"></div></div></li>
        {/each}
      </ul>
    {:else}
      {@const data = request.state.data}
      <p class="count" aria-live="polite">{translateCount(locale, "resultsCount", data.total)}</p>
      {#if data.items.length === 0}
        <EmptyState title={translate(locale, "noResults")} />
      {:else}
        <ul class="grid">
          {#each data.items as card (card.id)}
            <li><DispositifCard {card} {locale} /></li>
          {/each}
        </ul>
        {#if data.pageCount > 1}
          <div class="pagination">
            <Pagination page={data.page} pageCount={data.pageCount} {locale} onchange={(next) => (page = next)} />
          </div>
        {/if}
      {/if}
    {/if}
  </section>

  <footer class="footer"><Baseline {locale} /></footer>
</div>

<style>
  .list {
    container: widget / inline-size;
    padding: 16px 0 24px;
    background: var(--background-default-grey);
  }

  .header,
  .results,
  .footer {
    padding-inline: clamp(16px, 8cqw, 120px);
  }

  .header {
    display: flex;
    flex-direction: column-reverse;
    gap: 16px;
    align-items: stretch;
    text-align: center;
  }

  .intro {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .title {
    margin: 0;
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
    color: var(--text-title-grey);
    overflow-wrap: anywhere;
  }

  .description {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    color: var(--text-default-grey);
  }

  .results {
    padding-top: 24px;
  }

  .count {
    margin: 0 0 24px;
    font-size: 20px;
    line-height: 28px;
    font-weight: 700;
    color: var(--text-title-grey);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    gap: 24px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pagination {
    margin-top: 40px;
  }

  .footer {
    margin-top: 32px;
  }

  .skeleton {
    height: 100%;
    min-height: 330px;
    border: 1px solid var(--border-default-grey);
  }

  .skeleton-media {
    aspect-ratio: 16 / 9;
    background: var(--background-open-blue-france);
  }

  .skeleton-lines {
    height: 80px;
    margin: 24px;
    background: linear-gradient(var(--background-alt-blue-france) 0 16px, transparent 16px 32px, var(--background-alt-blue-france) 32px 48px);
  }

  @container widget (min-width: 600px) {
    .list {
      padding-top: 56px;
    }

    .header {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
      text-align: start;
    }

    .intro {
      max-width: 800px;
    }

    .title {
      font-size: 32px;
      line-height: 40px;
    }

    .description {
      font-size: 18px;
      line-height: 28px;
    }
  }
</style>
