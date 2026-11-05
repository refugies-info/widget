<script lang="ts">
  import { findFlagUrl } from "../flags.js";

  let { flagCode, dimmed = false }: { flagCode: string | undefined; dimmed?: boolean } = $props();

  const url = $derived(findFlagUrl(flagCode));
</script>

{#if url}
  <img class="flag" class:dimmed src={url} alt="" width="16" height="12" />
{/if}

<style>
  .flag {
    width: 16px;
    height: 12px;
    flex: none;
    object-fit: cover;
  }

  .dimmed {
    opacity: 0.4;
  }
</style>
