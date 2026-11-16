<script lang="ts">
  import { isLanguageAvailable, type Language } from "../languages.js";
  import Flag from "./Flag.svelte";
  import Icon from "./Icon.svelte";

  let {
    languages,
    selected,
    label,
    availableLanguages,
    inline = false,
    onselect,
  }: {
    languages: Language[];
    selected: string;
    label: string;
    availableLanguages: string[] | undefined;
    inline?: boolean;
    onselect: (code: string) => void;
  } = $props();

  let open = $state(false);

  const current = $derived(languages.find(({ code }) => code === selected) ?? languages[0]);

  const choose = (code: string) => {
    open = false;
    onselect(code);
  };
</script>

<div class="bar" class:inline>
  <span class="label">{label}</span>
  <div class="select">
    <button
      type="button"
      class="trigger"
      aria-haspopup="listbox"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <Flag flagCode={current?.flagCode} />
      <span class="current">{current?.label}</span>
      <span class="chevron"><Icon name="arrow-down" /></span>
    </button>
    {#if open}
      <ul class="options" role="listbox">
        {#each languages as language (language.code)}
          {@const available = isLanguageAvailable(language.code, availableLanguages)}
          <li role="option" aria-selected={language.code === selected}>
            <button
              type="button"
              class="option"
              disabled={!available}
              lang={language.code}
              onclick={() => choose(language.code)}
            >
              <Flag flagCode={language.flagCode} dimmed={!available} />
              {language.label}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px;
    background: var(--background-default-grey);
  }

  .bar.inline {
    padding: 0;
    gap: 8px;
  }

  .label {
    font-size: 12px;
    line-height: 20px;
    font-weight: 700;
    color: var(--text-mention-grey);
    white-space: nowrap;
  }

  .inline .label {
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
  }

  .select {
    position: relative;
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border: 1px solid var(--border-default-grey);
    background: var(--background-default-grey);
    cursor: pointer;
  }

  .inline .trigger {
    padding: 5px 10px;
    border-width: 1.25px;
  }

  .chevron {
    display: flex;
    color: var(--text-action-high-blue-france);
  }

  .current {
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-action-high-blue-france);
    white-space: nowrap;
  }

  .inline .current {
    font-size: 17.5px;
    line-height: 30px;
  }

  .options {
    position: absolute;
    inset-inline-end: 0;
    z-index: 2;
    min-width: 100%;
    max-height: 240px;
    margin: 4px 0 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
    box-shadow: 0 4px 6px var(--shadow-color);
  }

  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px;
    border: 0;
    background: none;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-title-grey);
    text-align: start;
    white-space: nowrap;
    cursor: pointer;
  }

  .option:hover:not(:disabled) {
    background: var(--background-alt-blue-france);
  }

  .option:disabled {
    color: var(--text-disabled-grey);
    cursor: not-allowed;
  }

  .trigger:focus-visible,
  .option:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }
</style>
