<script lang="ts">
  import {
    addDepartment,
    canGeolocate,
    COMMON_CITIES,
    findDepartmentAt,
    getCurrentPosition,
    type LocationSelection,
    type LocationSuggestion,
    MIN_SEARCH_LENGTH,
    searchLocations,
    toggleCity,
    toggleDepartment,
  } from "../location.js";
  import { t } from "../wording.js";
  import ChoiceList from "./ChoiceList.svelte";
  import Icon from "./Icon.svelte";
  import SearchInput from "./SearchInput.svelte";

  let {
    selection,
    locale,
    onchange,
  }: {
    selection: LocationSelection;
    locale: string;
    onchange: (selection: LocationSelection) => void;
  } = $props();

  let search = $state("");
  let suggestions = $state.raw<LocationSuggestion[]>([]);
  let searched = $state(false);
  let position = $state<"idle" | "loading" | "error">("idle");

  const searching = $derived(search.trim().length >= MIN_SEARCH_LENGTH);

  $effect(() => {
    const text = search.trim();
    if (text.length < MIN_SEARCH_LENGTH) {
      suggestions = [];
      searched = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const found = await searchLocations(text, controller.signal);
      if (controller.signal.aborted) return;
      suggestions = found;
      searched = true;
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  });

  const keyOf = ({ type, name }: Pick<LocationSuggestion, "type" | "name">) => `${type}:${name}`;

  const choiceOf = (suggestion: LocationSuggestion) => ({
    value: keyOf(suggestion),
    label:
      suggestion.type === "department"
        ? `${suggestion.name} (${suggestion.departmentCode}) · ${t(locale, "locationDepartment")}`
        : `${suggestion.name} (${suggestion.departmentCode})`,
  });

  const selectedKeys = $derived([
    ...selection.departments.map((name) => keyOf({ type: "department", name })),
    ...selection.cities.map((name) => keyOf({ type: "city", name })),
  ]);

  const selectedChoices = $derived([
    ...selection.departments.map((name) => ({
      value: keyOf({ type: "department", name }),
      label: `${name} (${t(locale, "locationDepartment")})`,
    })),
    ...selection.cities.map((name) => ({
      value: keyOf({ type: "city", name }),
      label: `${name} (${t(locale, "locationCity")})`,
    })),
  ]);

  const toggleKey = (key: string) => {
    const [type, ...rest] = key.split(":");
    const name = rest.join(":");
    if (type === "department") return onchange(toggleDepartment(selection, name));
    const suggestion = [...suggestions, ...COMMON_CITIES].find((item) => item.type === "city" && item.name === name);
    if (suggestion) return onchange(toggleCity(selection, suggestion));
    onchange({ ...selection, cities: selection.cities.filter((city) => city !== name) });
  };

  const useMyPosition = async () => {
    position = "loading";
    try {
      const { latitude, longitude } = await getCurrentPosition();
      const department = await findDepartmentAt(latitude, longitude, new AbortController().signal);
      if (!department) throw new Error("No department at this position");
      onchange(addDepartment(selection, department));
      position = "idle";
    } catch {
      position = "error";
    }
  };
</script>

<div class="location">
  {#if canGeolocate()}
    <div class="section">
      <button type="button" class="position" disabled={position === "loading"} onclick={useMyPosition}>
        <Icon name="send-plane" />
        <span>{t(locale, "locationUseMyPosition")}</span>
      </button>
      {#if position === "error"}
        <p class="error" role="alert">{t(locale, "locationPositionError")}</p>
      {/if}
    </div>
  {/if}

  <div class="section">
    <SearchInput
      value={search}
      placeholder={t(locale, "locationSearchPlaceholder")}
      oninput={(next) => (search = next)}
    />
  </div>

  {#if selectedChoices.length > 0}
    <section>
      <h3>{t(locale, "locationSelected")}</h3>
      <ChoiceList choices={selectedChoices} selected={selectedKeys} ontoggle={toggleKey} />
    </section>
  {/if}

  {#if searching}
    {#if suggestions.length > 0}
      <section>
        <h3>{t(locale, "locationResults")}</h3>
        <ChoiceList choices={suggestions.map(choiceOf)} selected={selectedKeys} ontoggle={toggleKey} />
      </section>
    {:else if searched}
      <p class="empty" role="status">{t(locale, "locationNoResults")}</p>
    {/if}
  {:else}
    <section>
      <h3>{t(locale, "locationCommonCities")}</h3>
      <ChoiceList choices={COMMON_CITIES.map(choiceOf)} selected={selectedKeys} ontoggle={toggleKey} />
    </section>
  {/if}
</div>

<style>
  .location {
    padding: 8px 0;
  }

  .section {
    padding: 8px 16px;
  }

  h3 {
    margin: 0;
    padding: 8px 16px 0;
    font-size: 14px;
    line-height: 24px;
    font-weight: 700;
    color: var(--text-title-grey);
  }

  .position {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: 14px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-action-high-blue-france);
    cursor: pointer;
  }

  .position:disabled {
    color: var(--text-disabled-grey);
    cursor: progress;
  }

  .error,
  .empty {
    margin: 4px 0 0;
    font-size: 14px;
    line-height: 24px;
    color: var(--text-default-grey);
  }

  .empty {
    padding: 0 16px;
  }
</style>
