<script lang="ts">
  import { MAX_SELECTED_VALUES } from "../filters.js";
  import Icon from "./Icon.svelte";

  let {
    label,
    choices,
    selected,
    ontoggle,
  }: {
    label: string;
    choices: { value: string; label: string }[];
    selected: string[];
    ontoggle: (value: string) => void;
  } = $props();

  const uid = $props.id();
  const panelId = `filter-${uid}`;

  let open = $state(false);
  let root: HTMLElement | undefined;
  let trigger: HTMLButtonElement | undefined;

  const closeOnOutsideClick = (event: MouseEvent) => {
    if (open && root && !root.contains(event.target as Node)) open = false;
  };

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !open) return;
    open = false;
    trigger?.focus();
  };
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={closeOnEscape} />

<div class="filter" bind:this={root}>
  <button
    type="button"
    class="trigger"
    class:active={selected.length > 0}
    aria-expanded={open}
    aria-controls={panelId}
    bind:this={trigger}
    onclick={() => (open = !open)}
  >
    <span>{label}</span>
    <Icon name="arrow-down" />
  </button>
  {#if open}
    <div class="panel" id={panelId} role="group" aria-label={label}>
      <ul>
        {#each choices as choice (choice.value)}
          {@const checked = selected.includes(choice.value)}
          <li>
            <label class="choice">
              <input
                type="checkbox"
                {checked}
                disabled={!checked && selected.length >= MAX_SELECTED_VALUES}
                onchange={() => ontoggle(choice.value)}
              />
              <span>{choice.label}</span>
            </label>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .filter {
    position: relative;
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 8px 12px 8px 16px;
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
    border-radius: 28px;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-title-grey);
    white-space: nowrap;
    cursor: pointer;
  }

  .trigger.active {
    border-color: var(--text-action-high-blue-france);
    color: var(--text-action-high-blue-france);
  }

  .trigger:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }

  .panel {
    position: absolute;
    inset-inline-start: 0;
    top: calc(100% + 4px);
    z-index: 3;
    width: max-content;
    min-width: 240px;
    max-width: min(360px, 90cqw);
    max-height: 320px;
    overflow-y: auto;
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
    box-shadow: 0 4px 6px var(--shadow-color);
  }

  ul {
    margin: 0;
    padding: 8px 0;
    list-style: none;
  }

  .choice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 16px;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-title-grey);
    cursor: pointer;
  }

  .choice:hover {
    background: var(--background-alt-blue-france);
  }

  input {
    flex: none;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    accent-color: var(--text-action-high-blue-france);
  }

  input:disabled + span {
    color: var(--text-disabled-grey);
  }
</style>
