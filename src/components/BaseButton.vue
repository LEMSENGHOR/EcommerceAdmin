<script setup>
import { computed } from 'vue'

const props = defineProps({
  // ── Variants ──
  variant: {
    type: String,
    default: 'primary',
    validator: (v) =>
      ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
       'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger',
       'outline-warning', 'outline-info', 'outline-light', 'outline-dark',
       'ghost'].includes(v),
  },

  // ── Sizes ──
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },

  // ── States ──
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },

  // ── Native ──
  type: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'submit', 'reset'].includes(v),
  },

  // ── Icons ──
  iconLeft: {
    type: String,
    default: '',
  },
  iconRight: {
    type: String,
    default: '',
  },

  // ── Misc ──
  pill: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

// ── Computed ───────────────────────────────────────────
const isDisabled = computed(() => props.disabled || props.loading)

const classes = computed(() => {
  const base = ['base-btn', 'd-inline-flex', 'align-items-center', 'justify-content-center', 'gap-2']

  // Variant
  const variant = props.variant
  if (variant.startsWith('outline-')) {
    base.push(`btn-outline-${variant.replace('outline-', '')}`)
  } else if (variant === 'ghost') {
    base.push('base-btn-ghost')
  } else {
    base.push(`btn-${variant}`)
  }

  // Size
  const sizeMap = { sm: 'btn-sm', md: '', lg: 'btn-lg' }
  if (sizeMap[props.size]) base.push(sizeMap[props.size])

  // Block
  if (props.block) base.push('w-100')

  // Pill shape
  if (props.pill) base.push('rounded-pill')

  return base
})

function handleClick(e) {
  if (isDisabled.value) return
  emit('click', e)
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="base-btn-spinner">
      <i class="bi bi-arrow-repeat"></i>
    </span>

    <!-- Left Icon -->
    <i v-if="iconLeft && !loading" :class="`bi ${iconLeft}`"></i>

    <!-- Default Slot (button text/content) -->
    <slot />

    <!-- Right Icon -->
    <i v-if="iconRight" :class="`bi ${iconRight}`"></i>
  </button>
</template>

<style scoped>
.base-btn {
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
  line-height: 1.5;
  text-decoration: none;
}

.base-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  pointer-events: none;
}

/* Ghost variant */
.base-btn-ghost {
  background: transparent;
  color: inherit;
  border: none;
  padding: 0.375rem 0.75rem;
}

.base-btn-ghost:hover {
  background: rgba(0, 0, 0, 0.06);
}

.base-btn-ghost:active {
  background: rgba(0, 0, 0, 0.1);
}

/* Loading spinner */
.base-btn-spinner {
  display: inline-flex;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>