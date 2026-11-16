<script lang="ts">
  import Icon from "./Icon.svelte";

  let {
    active,
    label,
    ontoggle,
  }: { active: boolean; label: string; ontoggle: () => void } = $props();
</script>

<button type="button" class="pill" class:active aria-pressed={active} onclick={ontoggle}>
  {label}
  {#if active}
    <span class="check"><Icon name="check" size={12} /></span>
  {/if}
</button>

<style>
  .pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    background: var(--background-alt-blue-france);
    border: 0;
    border-radius: 999px;
    font: inherit;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-action-high-blue-france);
    cursor: pointer;
  }

  .pill:hover {
    background: var(--background-open-blue-france);
  }

  .pill.active,
  .pill.active:hover {
    background: var(--text-action-high-blue-france);
    color: #fff;
  }

  .check {
    position: absolute;
    top: -6px;
    inset-inline-end: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #fff;
    border: 1px solid var(--text-action-high-blue-france);
    border-radius: 50%;
    color: var(--text-action-high-blue-france);
  }

  .pill:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }
</style>
