<script lang="ts">
  import { buildPageItems } from "../pagination.js";
  import { translate } from "../wording.js";
  import Icon from "./Icon.svelte";

  let {
    page,
    pageCount,
    locale,
    onchange,
  }: { page: number; pageCount: number; locale: string; onchange: (page: number) => void } =
    $props();

  const items = $derived(buildPageItems(page, pageCount));
</script>

<nav class="pagination" aria-label={translate(locale, "paginationLabel")}>
  <button
    type="button"
    class="step"
    disabled={page <= 1}
    aria-label={translate(locale, "previousPage")}
    onclick={() => onchange(page - 1)}
  >
    <Icon name="arrow-left" flipInRtl />
    <span class="step-label">{translate(locale, "previousPage")}</span>
  </button>
  <ul class="pages">
    {#each items as item, index (item === "ellipsis" ? `ellipsis-${index}` : item)}
      <li>
        {#if item === "ellipsis"}
          <span class="gap" aria-hidden="true">…</span>
        {:else}
          <button
            type="button"
            class="number"
            class:current={item === page}
            aria-label={translate(locale, "pageLabel", { page: item })}
            aria-current={item === page ? "page" : undefined}
            onclick={() => onchange(item)}
          >
            {item}
          </button>
        {/if}
      </li>
    {/each}
  </ul>
  <button
    type="button"
    class="step"
    disabled={page >= pageCount}
    aria-label={translate(locale, "nextPage")}
    onclick={() => onchange(page + 1)}
  >
    <span class="step-label">{translate(locale, "nextPage")}</span>
    <Icon name="arrow-right-small" flipInRtl />
  </button>
</nav>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .pages {
    display: flex;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border: 0;
    background: none;
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-title-grey);
    cursor: pointer;
  }

  button:disabled {
    color: var(--text-disabled-grey);
    cursor: not-allowed;
  }

  button:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }

  .number.current {
    background: var(--text-action-high-blue-france);
    color: #f5f5fe;
  }

  .gap {
    padding: 4px 12px;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-title-grey);
  }

  /* On a narrow widget, the arrows are enough */
  @container widget (max-width: 599px) {
    .step-label {
      display: none;
    }

    .pagination,
    .pages {
      gap: 4px;
    }
  }
</style>
