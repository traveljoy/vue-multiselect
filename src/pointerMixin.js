export default {
  data () {
    return {
      pointer: 0,
      pointerDirty: false,
      afterSlotHighlighted: false
    }
  },
  props: {
    /**
     * Enable/disable highlighting of the pointed value.
     * @type {Boolean}
     * @default true
     */
    showPointer: {
      type: Boolean,
      default: true
    },
    optionHeight: {
      type: Number,
      default: 40
    },
    wrapAroundPointer: {
      type: Boolean,
      default: false
    },
    includeAfterSlot: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    pointerPosition () {
      return this.pointer * this.optionHeight
    },
    visibleElements () {
      return this.optimizedHeight / this.optionHeight
    }
  },
  watch: {
    filteredOptions () {
      this.pointerAdjust()
    },
    isOpen () {
      this.pointerDirty = false
    },
    pointer () {
      this.$refs.search.setAttribute('aria-activedescendant', this.id + '-' + this.pointer.toString())
    }
  },
  methods: {
    optionHighlight (index, option) {
      return {
        'multiselect__option--highlight': index === this.pointer && this.showPointer,
        'multiselect__option--selected': this.isSelected(option)
      }
    },
    groupHighlight (index, selectedGroup) {
      if (!this.groupSelect) {
        return [
          'multiselect__option--disabled',
          { 'multiselect__option--group': selectedGroup.$isLabel }
        ]
      }

      const group = this.options.find(option => {
        return option[this.groupLabel] === selectedGroup.$groupLabel
      })

      return group && !this.wholeGroupDisabled(group) ? [
        'multiselect__option--group',
        { 'multiselect__option--highlight': index === this.pointer && this.showPointer },
        { 'multiselect__option--group-selected': this.wholeGroupSelected(group) }
      ] : 'multiselect__option--disabled'
    },
    addPointerElement ({ key } = 'Enter') {
      /* istanbul ignore else */
      if (this.afterSlotHighlighted) {
        this.$emit('after-slot-selected', this.id)
      } else if (this.filteredOptions.length > 0) {
        this.select(this.filteredOptions[this.pointer], key)
      }
      this.pointerReset()
    },
    pointerForward () {
      this.afterSlotHighlighted = false
      if (this.pointer < this.filteredOptions.length - 1) {
        this.pointer++
        /* istanbul ignore next */
        if (this.$refs.list.scrollTop <= this.pointerPosition - (this.visibleElements - 1) * this.optionHeight) {
          this.$refs.list.scrollTop = this.pointerPosition - (this.visibleElements - 1) * this.optionHeight
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
        ) this.pointerForward()
      } else if (this.includeAfterSlot && (this.pointer === this.filteredOptions.length - 1 || this.filteredOptions.length === 0)) {
        this.pointer++
        this.afterSlotHighlighted = true
      } else if (this.wrapAroundPointer) {
        this.pointer = 0
      }
      this.pointerDirty = true
    },
    pointerBackward () {
      this.afterSlotHighlighted = false
      if (this.pointer > 0) {
        this.pointer--
        /* istanbul ignore else */
        if (this.$refs.list.scrollTop >= this.pointerPosition) {
          this.$refs.list.scrollTop = this.pointerPosition
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
        ) this.pointerBackward()
      } else if (this.wrapAroundPointer) {
        if (this.includeAfterSlot) {
          this.pointer = this.filteredOptions.length
          this.afterSlotHighlighted = true
        } else {
          this.pointer = this.filteredOptions.length - 1
        }
      } else {
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[0].$isLabel &&
          !this.groupSelect
        ) this.pointerForward()
      }
      this.pointerDirty = true
    },
    pointerReset () {
      /* istanbul ignore else */
      if (!this.closeOnSelect) return
      this.pointer = 0
      /* istanbul ignore else */
      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0
      }
    },
    pointerAdjust () {
      /* istanbul ignore else */
      if (this.pointer >= this.filteredOptions.length - 1) {
        this.pointer = this.filteredOptions.length
          ? this.filteredOptions.length - 1
          : 0
      }

      if (this.filteredOptions.length > 0 &&
        this.filteredOptions[this.pointer].$isLabel &&
        !this.groupSelect
      ) {
        this.pointerForward()
      }

      if (this.includeAfterSlot &&
        this.filteredOptions.length === 0
      ) {
        this.pointerSetAfterSlot()
      }
    },
    pointerSet (index) {
      this.pointer = index
      this.pointerDirty = true
      this.afterSlotHighlighted = false
    },
    pointerSetAfterSlot () {
      this.pointerSet(this.filteredOptions.length)
      this.afterSlotHighlighted = true
    }
  }
}
