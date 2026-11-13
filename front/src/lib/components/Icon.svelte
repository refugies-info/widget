<script lang="ts">
  import { ICONS, type IconName } from "../icons.js";

  let {
    name,
    size = 16,
    flipInRtl = false,
  }: { name: IconName; size?: number; flipInRtl?: boolean } = $props();
</script>

<!-- A mask: the icon takes the color of the text around it -->
<span
  class="icon"
  class:flip={flipInRtl}
  style:--icon={`url("${ICONS[name]}")`}
  style:width="{size}px"
  style:height="{size}px"
  aria-hidden="true"
></span>

<style>
  .icon {
    display: inline-block;
    flex: none;
    background-color: currentColor;
    -webkit-mask: var(--icon) no-repeat center / contain;
    mask: var(--icon) no-repeat center / contain;
  }

  :global([dir="rtl"]) .flip {
    transform: scaleX(-1);
  }
</style>
