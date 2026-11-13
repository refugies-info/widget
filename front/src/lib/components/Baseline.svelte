<script lang="ts">
  import logo from "../assets/logo-ri.svg";
  import { SITE_URL } from "../siteUrl.js";
  import { t } from "../wording.js";

  let { locale }: { locale: string } = $props();

  const SITE_MARK = "\u0001";
  const [before = "", after = ""] = $derived(
    t(locale, "baseline", { site: SITE_MARK }).split(SITE_MARK),
  );
</script>

<p class="baseline">
  <img src={logo} alt="" width="34" height="34" />
  <span>
    {before}<a href={SITE_URL} target="_blank" rel="noopener">Réfugiés.info</a>{after}
  </span>
</p>

<style>
  .baseline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0;
    padding: 8px;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-title-grey);
  }

  img {
    flex: none;
  }

  a {
    font-weight: 700;
    color: inherit;
    text-decoration: underline;
  }
</style>
