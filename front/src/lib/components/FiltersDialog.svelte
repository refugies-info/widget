<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon from "./Icon.svelte";

  let {
    open,
    title,
    closeLabel,
    clearLabel,
    submitLabel,
    onclose,
    onclear,
    children,
  }: {
    open: boolean;
    title: string;
    closeLabel: string;
    clearLabel: string;
    submitLabel: string;
    onclose: () => void;
    onclear: () => void;
    children: Snippet;
  } = $props();

  const uid = $props.id();
  const titleId = `dialog-${uid}`;
  let dialog: HTMLDialogElement | undefined;

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });

  $effect(() => {
    if (!open) return;
    const wide = matchMedia("(min-width: 600px)");
    const closeWhenWide = () => {
      if (wide.matches) onclose();
    };
    closeWhenWide();
    wide.addEventListener("change", closeWhenWide);
    return () => wide.removeEventListener("change", closeWhenWide);
  });
</script>

<dialog bind:this={dialog} aria-labelledby={titleId} {onclose}>
  <header>
    <h2 id={titleId}>{title}</h2>
    <button type="button" class="close" aria-label={closeLabel} title={closeLabel} onclick={onclose}>
      <Icon name="close" size={24} />
    </button>
  </header>
  <div class="body">{@render children()}</div>
  <footer>
    <button type="button" class="clear" onclick={onclear}>{clearLabel}</button>
    <button type="button" class="submit" onclick={onclose}>{submitLabel}</button>
  </footer>
</dialog>

<style>
  dialog {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: var(--background-default-grey);
    color: var(--text-default-grey);
  }

  dialog[open] {
    display: flex;
    flex-direction: column;
  }

  header,
  footer {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  header {
    padding: 8px 8px 8px 16px;
    border-bottom: 1px solid var(--border-default-grey);
  }

  footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border-default-grey);
  }

  h2 {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 700;
    color: var(--text-title-grey);
  }

  .close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    background: none;
    border: 0;
    color: var(--text-title-grey);
    cursor: pointer;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px;
  }

  .clear {
    min-height: 44px;
    padding: 0 8px;
    background: none;
    border: 0;
    font: inherit;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-action-high-blue-france);
    cursor: pointer;
  }

  .submit {
    min-height: 44px;
    padding: 0 24px;
    background: var(--text-action-high-blue-france);
    border: 0;
    font: inherit;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
  }

  .close:focus-visible,
  .clear:focus-visible,
  .submit:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }
</style>
