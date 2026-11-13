<script lang="ts">
  import type { DisplayedCard } from "../api.js";
  import { buildBadge, formatCommitment, formatPrice, formatUpdate } from "../cardFormat.js";
  import { buildContentUrl } from "../contentUrl.js";
  import { plainText } from "../text.js";
  import { SITE_URL } from "../siteUrl.js";
  import Icon from "./Icon.svelte";

  let { card, locale }: { card: DisplayedCard; locale: string } = $props();

  const uid = $props.id();
  const titleId = `card-title-${uid}`;
  const url = $derived(buildContentUrl(SITE_URL, card, locale));
  const badge = $derived(buildBadge(card, locale));
  const image = $derived(card.theme?.imageUrl);
  const logo = $derived(card.sponsor?.pictureUrl);
  const isProcedure = $derived(card.typeContenu === "demarche");
  const price = $derived(formatPrice(card.price, locale));
  const commitment = $derived(formatCommitment(card.commitment, locale));
  const update = $derived(
    card.lastModificationDate ? formatUpdate(card.lastModificationDate, locale) : null,
  );
</script>

<article class="card" aria-labelledby={titleId}>
  <div class="media" style:background-color={card.theme?.color ?? "var(--background-open-blue-france)"}>
    {#if image}<img class="illustration" src={image} alt="" loading="lazy" />{/if}
    {#if badge}<span class="badge" class:procedure={badge.kind === "procedure"}>{badge.text}</span>{/if}
    {#if logo}<img class="logo" src={logo} alt="" loading="lazy" />{/if}
  </div>
  <div class="content">
    <div class="precision">
      {#if card.theme?.name}
        <div class="tags">
          <span class="tag" style:background-color={card.theme.color ?? undefined}>{card.theme.name}</span>
          {#if card.secondaryThemeCount > 0}
            <span class="tag more">+{card.secondaryThemeCount}</span>
          {/if}
        </div>
      {/if}
      {#if card.sponsor}
        <p class="detail">
          <Icon name="building" />
          <span class="ellipsis">{plainText(card.sponsor.name)}</span>
        </p>
      {/if}
    </div>
    <div class="body">
      <h3 class="title" id={titleId}>
        <a class="link" href={url} target="_blank" rel="noopener">{plainText(card.titreInformatif)}</a>
      </h3>
      <p class="description">{plainText(card.abstract)}</p>
    </div>
    <div class="action">
      <div class="infos">
        {#if isProcedure}
          {#if update}
            <p class="detail"><Icon name="time" /><span class="ellipsis">{update}</span></p>
          {/if}
        {:else}
          {#if price}
            <p class="detail"><Icon name="euro" /><span class="ellipsis">{price}</span></p>
          {/if}
          {#if commitment}
            <p class="detail"><Icon name="time" /><span class="ellipsis">{commitment}</span></p>
          {/if}
        {/if}
      </div>
      <span class="arrow"><Icon name="arrow-right" flipInRtl /></span>
    </div>
  </div>
</article>

<style>
  .card {
    --card-background: var(--background-default-grey);
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--card-background);
    border: 1px solid var(--border-default-grey);
  }

  .card:hover {
    --card-background: var(--background-alt-blue-france);
  }

  .card:focus-within {
    outline: 2px solid var(--text-action-high-blue-france);
    outline-offset: 2px;
  }

  .media {
    position: relative;
    flex: none;
    aspect-ratio: 16 / 9;
  }

  .illustration {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .badge {
    position: absolute;
    top: 11px;
    inset-inline-start: 11px;
    padding: 0 6px;
    border-radius: 4px;
    background: #fee7fc;
    color: #6e445a;
    font-size: 12px;
    line-height: 20px;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .badge.procedure {
    background: #feecc2;
    color: #716043;
  }

  .logo {
    position: absolute;
    inset-inline-end: 17px;
    bottom: -24px;
    width: 48px;
    height: 48px;
    object-fit: contain;
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
  }

  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
  }

  .precision {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 20px;
  }

  .tags {
    display: flex;
    gap: 8px;
  }

  .tag {
    padding: 2px 8px;
    border-radius: 12px;
    background: #eee;
    color: var(--text-title-grey);
    font-size: 12px;
    line-height: 20px;
    white-space: nowrap;
  }

  .tag.more {
    background: #eee;
  }

  .detail {
    display: flex;
    gap: 8px;
    min-width: 0;
    margin: 0;
    font-size: 12px;
    line-height: 20px;
    color: var(--text-mention-grey);
  }

  .detail :global(.icon) {
    margin-top: 2px;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Like the cards of the site: a block of a fixed height whose overflow fades out */
  .body {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 152px;
    overflow: clip;
  }

  .body::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 24px;
    background: linear-gradient(0deg, var(--card-background) 0%, transparent 100%);
    pointer-events: none;
  }

  .title {
    flex: none;
    margin: 0;
    overflow: hidden;
    font-size: 20px;
    line-height: 28px;
    font-weight: 700;
    color: var(--text-title-grey);
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  /* The whole card is the link */
  .link {
    color: inherit;
    text-decoration: none;
  }

  .link::after {
    content: "";
    position: absolute;
    inset: 0;
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
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
  }

  .infos {
    display: flex;
    flex: 1;
    gap: 12px;
    min-width: 0;
  }

  .infos .detail:last-child {
    min-width: 0;
  }

  .arrow {
    display: flex;
    flex: none;
    color: var(--text-action-high-blue-france);
  }
</style>
