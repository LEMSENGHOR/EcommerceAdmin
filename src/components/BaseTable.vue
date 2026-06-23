<template>
  <!-- ផ្លាស់ប្តូរ Root Element ពី table-responsive ទៅជា divធម្មតា ដើម្បីគ្រប់គ្រង Table និង Pagination បានងាយ -->
  <div>
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="small text-uppercase text-secondary fw-bold"
              :class="col.align ? `text-${col.align}` : ''"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- ស្ថានភាព Loading -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="text-center text-secondary py-5">
              <div class="spinner-border spinner-border-sm me-2"></div> កំពុងដំណើរការ...
            </td>
          </tr>

          <!-- ស្ថានភាព មិនមានទិន្នន័យ -->
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="text-center text-secondary py-5">
              <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
              {{ emptyMessage }}
            </td>
          </tr>

          <!-- ស្ថានភាពមានទិន្នន័យពិតប្រាកដ -->
          <tr v-else v-for="row in rows" :key="row.id">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="col.align ? `text-${col.align}` : ''"
            >
              <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ⬅️⬅️⬅️ កូនកម្មវិធី PAGINATION ថ្មី ⬅️⬅️⬅️ -->
    <!-- វានឹងបង្ហាញតែពេល lastPage > 1 តែប៉ុណ្ណោះ -->
    <div 
      class="d-flex flex-wrap align-items-center justify-content-between gap-3 border-top pt-3 mt-3"
      v-if="lastPage > 1"
    >
      <div class="text-secondary small">
        បង្ហាញពី {{ startItem }} ដល់ {{ endItem }} នៃ {{ totalItems }} ទិន្នន័យ
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <!-- ប៊ូតុង មុន -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">មុន</a>
          </li>
          
          <!-- លេខទំព័រ -->
          <li 
            class="page-item" 
            v-for="page in displayPages" 
            :key="page" 
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>

          <!-- ប៊ូតុង បន្ទាប់ -->
          <li class="page-item" :class="{ disabled: currentPage === lastPage }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">បន្ទាប់</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: "រកមិនឃើញទិន្នន័យ",
  },
  // ⬅️ Props ថ្មីសម្រាប់ Pagination (មាន Default អស់ហើយ មិនធ្វើឲ្យកូនកម្មវិធីខូចទេ)
  currentPage: {
    type: Number,
    default: 1,
  },
  lastPage: {
    type: Number,
    default: 1,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  perPage: {
    type: Number,
    default: 10,
  }
});

// ⬅️ Emit សម្រាប់បញ្ជូនលេខទំព័រថ្មីទៅឲ្យ Component មេ
const emit = defineEmits(['change-page']);

// មុខងារចុចប្តូរទំព័រ (ពិនិត្យមើលដែលកុំឲ្យចុចលើលេខមិនត្រឹមត្រូវ)
const changePage = (page) => {
  if (page >= 1 && page <= props.lastPage && page !== props.currentPage) {
    emit('change-page', page);
  }
};

// ⬅️ គណនាលេខដើម និងលេខចុងដែលកំពុងបង្ហាញ
const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.totalItems);
});

// ⬅️ គណនាលេខទំព័រដែលត្រូវបង្ហាញ (ឧ. បើចុចទំព័រ ៥ វានឹងបង្ហាញ ៣,៤,៥,៦,៧)
const displayPages = computed(() => {
  const total = props.lastPage;
  const current = props.currentPage;
  
  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + 4); 
  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }
  
  let pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>