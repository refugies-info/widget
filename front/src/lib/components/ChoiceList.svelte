<script lang="ts">
  import { MAX_SELECTED_VALUES } from "../filters.js";

  let {
    choices,
    selected,
    ontoggle,
  }: {
    choices: { value: string; label: string }[];
    selected: string[];
    ontoggle: (value: string) => void;
  } = $props();
</script>

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

<style>
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
