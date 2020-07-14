<template lang="pug">
div
  label.typo__label(for="ajax") Async multiselect
  multiselect(
    v-model="selectedCountries",
    id="ajax",
    label="name",
    track-by="code",
    placeholder="Type to search",
    open-direction="bottom",
    :options="countries",
    :searchable="true",
    :loading="isLoading",
    :internal-search="false",
    :options-limit="300",
    :limit="3",
    :limit-text="limitText",
    :max-height="600",
    :show-no-results="false",
    :hide-selected="true",
    :wrapAroundPointer="true"
    :includeAfterSlot="true"
    :showSelectedOptionAsSearch="true"
    @search-change="asyncFind"
  )
    template(slot="tag", slot-scope="{ option, remove }")
      span.custom__tag
        span {{ option.name }}
        span.custom__remove(@click="remove(option)") ❌
    template(slot="clear", slot-scope="props")
      div.multiselect__clear(
        v-if="selectedCountries.length",
        @mousedown.prevent.stop="clearAll(props.search)"
      )
    span(slot="noResult").
      Oops! No elements found. Consider changing the search query.
    template(v-slot:afterList="{ afterSlotHighlighted, pointerSetAfterSlot, select }")
      li.multiselect__element.add-supplier-slot(
        v-if="searchQuery != ''"
        :class="{ 'multiselect__option--highlight': afterSlotHighlighted }"
        @mouseenter.self="pointerSetAfterSlot()"
        @click="select(searchQuery, 'Enter')"
      )
        span.multiselect__option
          i.far.fa-plus-circle.m-r-5
          span
            | Add new supplier &quot;
            strong {{ searchQuery }}
            | &quot;
  pre.language-json
    code.
      {{ selectedCountries  }}
</template>

<script>
import Multiselect from "vue-multiselect";
import { ajaxFindCountry } from "./countriesApi";

export default {
  components: {
    Multiselect
  },
  data() {
    return {
      selectedCountries: [],
      countries: [],
      isLoading: false,
      searchQuery: "",
      selectFn: null
    };
  },
  methods: {
    limitText(count) {
      return `and ${count} other countries`;
    },
    asyncFind(query) {
      this.isLoading = true;
      this.searchQuery = query;
      ajaxFindCountry(query).then(response => {
        this.countries = response;
        this.isLoading = false;
      });
    },
    clearAll() {
      this.selectedCountries = [];
    },
  }
};
</script>

<style lang="sass">
.multiselect__clear
  position: absolute
  right: 41px
  height: 40px
  width: 40px
  display: block
  cursor: pointer
  z-index: 3

  &:before,
  &:after
    content: ""
    display: block
    position: absolute
    width: 3px
    height: 16px
    background: #aaa
    top: 12px
    right: 4px

  &:before
    transform: rotate(45deg)

  &:after
    transform: rotate(-45deg)

.add-supplier-slot
  background-color: #f6f6f6
  position: sticky
  bottom: 0
</style>
