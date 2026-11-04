<script lang="ts">
  import illustration from "../assets/empty-illustration.svg";
  import { translate } from "../wording.js";

  let { locale }: { locale: string } = $props();
</script>

<div class="empty">
  <img class="illustration" src={illustration} alt="" width="323" height="248" />
  <div class="text">
    <p class="title">{translate(locale, "emptyTitle")}</p>
    <p>{translate(locale, "emptyText")}</p>
  </div>
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    margin: 40px 16px;
    padding: 28px 8px;
    border: 1px dashed var(--background-open-blue-france);
    border-radius: 4px;
    background: var(--background-default-grey);
    font-size: 20px;
    line-height: 32px;
    text-align: center;
  }

  .illustration {
    width: 235px;
    height: 180px;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .text p {
    margin: 0;
  }

  .title {
    font-weight: 700;
  }

  @container widget (min-width: 600px) {
    .empty {
      margin-block: 56px;
      margin-inline: clamp(16px, 10%, 120px);
      padding-block: 56px;
    }

    .illustration {
      width: 323px;
      height: 248px;
    }
  }
</style>
