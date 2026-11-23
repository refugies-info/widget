<script lang="ts">
    import { isLanguageAvailable, type Language } from "../languages.js";
  import { t } from "../wording.js";
  import Flag from "./Flag.svelte";

  let {
    languages,
    selected,
    locale,
    availableLanguages,
    onselect,
  }: {
    languages: Language[];
    selected: string;
    locale: string;
    availableLanguages: string[] | undefined;
    onselect: (code: string) => void;
  } = $props();
</script>

<div class="bar">
  <span class="label">{t(locale, "translateLabel")}</span>
  <ul class="languages">
    {#each languages as language (language.code)}
      {@const available = isLanguageAvailable(language.code, availableLanguages)}
      <li>
        <button
          type="button"
          class="language"
          class:selected={language.code === selected}
          disabled={!available}
          aria-pressed={language.code === selected}
          lang={language.code}
          onclick={() => onselect(language.code)}
        >
          <Flag flagCode={language.flagCode} dimmed={!available} />
          {language.code === "fr" ? "FR" : language.label}
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--background-alt-blue-france);
    border-bottom: 1px solid var(--border-default-grey);
  }

  .label {
    font-size: 12px;
    line-height: 20px;
    font-weight: 700;
    color: var(--text-mention-grey);
    white-space: nowrap;
  }

  .languages {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .language {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border: 0;
    border-radius: 16px;
    background: none;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-title-grey);
    cursor: pointer;
    white-space: nowrap;
  }

  .language.selected {
    background: var(--background-selected-blue-france);
    color: var(--text-action-high-blue-france);
    font-weight: 500;
  }

  .language:disabled {
    color: var(--text-disabled-grey);
    cursor: not-allowed;
  }

  .language:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }
</style>
