<script lang="ts">
  import type { DisplayedThumbnail } from "../api.js";
  import arrowRight from "../assets/icon-arrow-right.svg";
  import iconHelp from "../assets/icon-help.svg";
  import logoRi from "../assets/logo-ri.svg";
  import illustration from "../assets/thumbnail-illustration.svg";
  import { buildContentUrl } from "../contentUrl.js";
  import { translate } from "../wording.js";
  import { SITE_URL } from "../siteUrl.js";

  let { content, locale }: { content: DisplayedThumbnail; locale: string } = $props();
</script>

<a class="card" href={buildContentUrl(SITE_URL, content, locale)} target="_blank" rel="noopener">
  <img class="media" src={illustration} alt="" />
  <div class="content">
    <p class="hint">
      <img src={iconHelp} alt="" width="16" height="16" />
      {translate(locale, "translateHint")}
    </p>
    <div class="body">
      <h2 class="title">{content.titreInformatif}</h2>
      <p class="description">{content.abstract}</p>
    </div>
    <div class="action">
      <p class="source">
        <img src={logoRi} alt="" width="16" height="16" />
        <span class="source-long">{translate(locale, "sourceLong")}</span>
        <span class="source-short">Réfugiés.info</span>
      </p>
      <img src={arrowRight} alt="" width="24" height="24" />
    </div>
  </div>
</a>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background: var(--background-default-grey);
    color: inherit;
    text-decoration: none;
  }

  .card:focus-visible {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: -2px;
  }

  .media {
    display: block;
    width: 100%;
    height: 216px;
    object-fit: cover;
    object-position: left center;
    background: #fee9e5;
  }

  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    padding: 24px;
  }

  .hint {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    font-size: 12px;
    line-height: 20px;
    color: var(--text-mention-grey);
  }

  .hint img {
    margin-top: 2px;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title {
    margin: 0;
    font-size: 20px;
    line-height: 28px;
    font-weight: 700;
    color: var(--text-title-grey);
    overflow-wrap: anywhere;
  }

  .description {
    margin: 0;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-default-grey);
    overflow-wrap: anywhere;
  }

  .action {
    display: flex;
    flex: 1;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding-top: 8px;
  }

  .source {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    font-size: 12px;
    line-height: 20px;
    color: var(--text-mention-grey);
  }

  .source img {
    margin-top: 2px;
  }

  .source-long {
    display: none;
  }

  .action img:last-child {
    flex: none;
    transform: var(--arrow-transform, none);
  }

  /* Wide container: the illustration sits next to the text */
  @container widget (min-width: 600px) {
    .card {
      flex-direction: row;
    }

    .media {
      width: 282px;
      flex: none;
    }

    .source-long {
      display: inline;
    }

    .source-short {
      display: none;
    }
  }
</style>
