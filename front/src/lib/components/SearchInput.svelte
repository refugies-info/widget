<script lang="ts">
  import Icon from "./Icon.svelte";

  let {
    value,
    placeholder,
    oninput,
  }: { value: string; placeholder: string; oninput: (value: string) => void } = $props();
</script>

<label class="search">
  <Icon name="search" size={24} />
  <input
    type="search"
    {value}
    {placeholder}
    aria-label={placeholder}
    maxlength="100"
    autocomplete="off"
    oninput={(event) => oninput(event.currentTarget.value)}
  />
</label>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    width: 250px;
    max-width: 100%;
    height: 40px;
    padding: 0 12px;
    color: var(--text-action-high-blue-france);
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
    border-bottom: 2px solid var(--text-action-high-blue-france);
    border-radius: 4px 4px 0 0;
  }

  .search:focus-within {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: none;
    font: inherit;
    font-size: 16px;
    line-height: 24px;
    color: var(--text-title-grey);
    appearance: none;
  }

  input::placeholder {
    font-style: italic;
    color: var(--text-mention-grey);
  }

  @container widget (max-width: 599px) {
    .search {
      width: 100%;
    }
  }

  input::-webkit-search-cancel-button {
    display: none;
  }
</style>
