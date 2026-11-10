<script lang="ts">
  import type { FilterOptions } from "../api.js";
  import {
    type FilterConfiguration,
    type FilterKey,
    FRENCH_LEVEL_SHORT_LABELS,
    type Filters,
    hasActiveFilters,
    toggleValue,
  } from "../filters.js";
  import { t } from "../wording.js";
  import FilterDropdown from "./FilterDropdown.svelte";
  import Icon from "./Icon.svelte";
  import SearchInput from "./SearchInput.svelte";

  let {
    configurations,
    showSearch,
    filters,
    options,
    locale,
    onchange,
    onclear,
  }: {
    configurations: FilterConfiguration[];
    showSearch: boolean;
    filters: Filters;
    options: FilterOptions | undefined;
    locale: string;
    onchange: (filters: Filters) => void;
    onclear: () => void;
  } = $props();

  const optionsOf = ({ key, options: knownOptions }: FilterConfiguration) => {
    if (knownOptions) return knownOptions.map(({ value, label }) => ({ value, label: t(locale, label) }));
    if (key === "departments") return (options?.departments ?? []).map((name) => ({ value: name, label: name }));
    if (key === "themes") return (options?.themes ?? []).map(({ id, name }) => ({ value: id, label: name }));
    return (options?.languages ?? []).map(({ code, name, localName }) => ({
      value: code,
      label: localName ?? name,
    }));
  };

  const toggle = (key: FilterKey, value: string) =>
    onchange({ ...filters, [key]: toggleValue(filters[key], value) });

  const selectedTags = $derived(
    configurations.flatMap((configuration) => {
      const choices = optionsOf(configuration);
      return filters[configuration.key].flatMap((value) => {
        const label =
          configuration.key === "frenchLevels"
            ? FRENCH_LEVEL_SHORT_LABELS[value]
            : choices.find((choice) => choice.value === value)?.label;
        return label ? [{ key: configuration.key, value, label }] : [];
      });
    }),
  );

  const clearable = $derived(hasActiveFilters(filters));
</script>

<div class="filters">
  <div class="bar">
    {#if showSearch}
      <SearchInput
        value={filters.search}
        placeholder={t(locale, "filterSearch")}
        oninput={(search) => onchange({ ...filters, search })}
      />
    {/if}
    {#each configurations as configuration (configuration.key)}
      <FilterDropdown
        label={t(locale, configuration.label)}
        choices={optionsOf(configuration)}
        selected={filters[configuration.key]}
        ontoggle={(value) => toggle(configuration.key, value)}
      />
    {/each}
  </div>
  {#if selectedTags.length > 0 || clearable}
    <div class="selected">
      <ul class="tags">
        {#each selectedTags as tag (`${tag.key}:${tag.value}`)}
          <li>
            <button
              type="button"
              class="tag"
              aria-label={t(locale, "filterRemove", { name: tag.label })}
              onclick={() => toggle(tag.key, tag.value)}
            >
              <span>{tag.label}</span>
              <Icon name="close" />
            </button>
          </li>
        {/each}
      </ul>
      {#if clearable}
        <button type="button" class="clear" onclick={onclear}>{t(locale, "filtersClear")}</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .filters {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px;
  }

  .selected {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px 4px 12px;
    background: var(--text-action-high-blue-france);
    border: 0;
    border-radius: 16px;
    font-size: 14px;
    line-height: 24px;
    color: #f5f5fe;
    cursor: pointer;
  }

  .tag:focus-visible,
  .clear:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }

  .clear {
    padding: 4px 0;
    background: none;
    border: 0;
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-action-high-blue-france);
    text-decoration: underline;
    cursor: pointer;
  }
</style>
