<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon from "./Icon.svelte";

  let {
    label,
    count,
    clearLabel,
    wide = false,
    onclear,
    children,
  }: {
    label: string;
    count: number;
    clearLabel: string;
    wide?: boolean;
    onclear: () => void;
    children: Snippet;
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
    class:active={count > 0}
    aria-expanded={open}
    aria-controls={panelId}
    bind:this={trigger}
    onclick={() => (open = !open)}
  >
    <span>{label}</span>
    {#if count > 1}
      <span class="more"><span class="plus">+</span> {count - 1}</span>
    {:else if count === 0}
      <Icon name="arrow-down" />
    {/if}
  </button>
  {#if count > 0}
    <button type="button" class="clear" aria-label={clearLabel} title={clearLabel} onclick={onclear}>
      <Icon name="close-circle" size={20} />
    </button>
  {/if}
  {#if open}
    <div class="panel" class:wide id={panelId} role="group" aria-label={label}>
      {@render children()}
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

  /* Selected: blue, with the button that empties the filter at the end */
  .trigger.active {
    padding-inline-end: 44px;
    background: var(--text-action-high-blue-france);
    border-color: var(--text-action-high-blue-france);
    color: #fff;
  }

  .trigger.active:hover {
    background: #1212ff;
    border-color: #1212ff;
  }

  .plus {
    opacity: 0.6;
  }

  .clear {
    position: absolute;
    inset-inline-end: 12px;
    top: 50%;
    z-index: 1;
    display: flex;
    padding: 0;
    background: none;
    border: 0;
    color: var(--background-selected-blue-france);
    transform: translateY(-50%);
    cursor: pointer;
  }

  .clear:hover {
    color: #fff;
  }

  .clear:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
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

  .panel.wide {
    width: 320px;
    max-height: 440px;
  }
</style>
