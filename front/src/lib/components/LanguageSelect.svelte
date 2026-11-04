<script lang="ts">
    import chevronDown from "../assets/icon-chevron-down.svg";
  import { isLanguageAvailable, type Language } from "../languages.js";
  import Flag from "./Flag.svelte";

  let {
    languages,
    selected,
    availableLanguages,
    onselect,
  }: {
    languages: Language[];
    selected: string;
    availableLanguages: string[] | undefined;
    onselect: (code: string) => void;
  } = $props();

  let open = $state(false);

  const current = $derived(languages.find(({ code }) => code === selected) ?? languages[0]);

  const choose = (code: string) => {
    open = false;
    onselect(code);
  };
</script>

<div class="bar">
  <span class="label">Traduire :</span>
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
      <img src={chevronDown} alt="" width="16" height="16" />
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

  .label {
    font-size: 12px;
    line-height: 20px;
    font-weight: 700;
    color: var(--text-mention-grey);
    white-space: nowrap;
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

  .current {
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-action-high-blue-france);
    white-space: nowrap;
  }

  .options {
    position: absolute;
    inset-inline-end: 0;
    z-index: 1;
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
