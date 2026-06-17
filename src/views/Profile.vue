<template>
  <AdminLayout pageTitle="Settings">
    <div class="settings-container">

      <!-- ── Tab Switcher (always visible) ── -->
      <div class="card shadow-sm border-0 rounded-4 p-2 mb-4">
        <div class="d-flex gap-2 flex-wrap">
          <button
            class="btn btn-sm rounded-2 px-3 d-flex align-items-center gap-2 fw-semibold"
            :class="activeTab === 'edit' ? 'btn-primary' : 'btn-light text-secondary'"
            @click="activeTab = 'edit'"
          >
            <i class="bi bi-pencil-fill"></i> កែសម្រួលព័ត៌មាន
          </button>
          <button
            class="btn btn-sm rounded-2 px-3 d-flex align-items-center gap-2 fw-semibold"
            :class="activeTab === 'password' ? 'btn-primary' : 'btn-light text-secondary'"
            @click="activeTab = 'password'"
          >
            <i class="bi bi-lock-fill"></i> ផ្លាស់ប្តូរពាក្យសម្ងាត់
          </button>
        </div>
      </div>

      <!-- ── Edit Profile Panel ── -->
      <div v-if="activeTab === 'edit'" class="card shadow-sm border-0 rounded-4 p-4 mb-4">
        <div class="mb-4">
          <h5 class="fw-bold mb-1">កែសម្រួលព័ត៌មាន</h5>
          <p class="text-secondary small mb-0">គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងរូបភាពប្រវត្តិរូប</p>
        </div>

        <!-- Avatar row -->
        <div class="d-flex align-items-center gap-4 mb-4 flex-wrap">
          <div
            class="avatar-preview rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center flex-shrink-0"
            style="width:100px;height:100px;"
          >
            <img
              v-if="formData.avatarPreview"
              :src="formData.avatarPreview"
              alt="Avatar"
              class="w-100 h-100 object-fit-cover"
            />
            <i v-else class="bi bi-person fs-1 text-secondary"></i>
          </div>

          <div class="d-flex flex-column gap-2">
            <label
              class="btn btn-primary btn-sm rounded-2 px-3 d-flex align-items-center gap-2 mb-0"
              style="width:fit-content;cursor:pointer;"
            >
              <i class="bi bi-upload"></i> បញ្ចូលរូបភាព
              <input
                type="file"
                @change="handleAvatarUpload"
                accept="image/*"
                hidden
                ref="fileInput"
              />
            </label>
            <button
              class="btn btn-outline-danger btn-sm rounded-2 px-3 d-flex align-items-center gap-2"
              @click="handleDeleteAvatar"
              :disabled="!formData.avatarPreview || store.deletingAvatar"
            >
              <span v-if="!store.deletingAvatar">
                <i class="bi bi-trash"></i> លុបរូបភាព
              </span>
              <span v-else><span class="spinner-border spinner-border-sm"></span></span>
            </button>
            <p class="form-text text-muted small mb-0">JPG, PNG · អតិបរមា 2MB</p>
          </div>
        </div>

        <!-- Fields -->
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold small">ឈ្មោះពេញ</label>
            <div class="position-relative">
              <i class="bi bi-person input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" v-model="formData.name" class="form-control ps-5" placeholder="បញ្ចូលឈ្មោះពេញ" />
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small">អ៊ីមែល</label>
            <div class="position-relative">
              <i class="bi bi-envelope input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="email" v-model="formData.email" class="form-control ps-5" placeholder="example@domain.com" />
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small">លេខទូរស័ព្ទ</label>
            <div class="position-relative">
              <i class="bi bi-telephone input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" v-model="formData.phone" class="form-control ps-5" placeholder="012 345 678" />
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small">ទីតាំង</label>
            <div class="position-relative">
              <i class="bi bi-geo-alt input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" v-model="formData.location" class="form-control ps-5" placeholder="ភ្នំពេញ" />
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small">តួនាទី / ផ្នែក</label>
            <div class="position-relative">
              <i class="bi bi-briefcase input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input type="text" v-model="formData.role" class="form-control ps-5 bg-light" disabled />
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <button class="btn btn-light rounded-2 px-4" @click="cancelEdit">បោះបង់</button>
          <button
            class="btn btn-primary px-4 fw-semibold rounded-2"
            @click="updateProfile"
            :disabled="store.saving"
          >
            <span v-if="!store.saving"><i class="bi bi-check-lg me-1"></i>រក្សាព័ត៌មាន</span>
            <span v-else><span class="spinner-border spinner-border-sm me-2"></span>កំពុងរក្សា...</span>
          </button>
        </div>
      </div>

      <!-- ── Change Password Panel ── -->
      <div v-if="activeTab === 'password'" class="card shadow-sm border-0 rounded-4 p-4 mb-4">
        <div class="mb-4">
          <h5 class="fw-bold mb-1">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h5>
          <p class="text-secondary small mb-0">ត្រូវការយ៉ាងហោចណាស់ 8 តួអក្សរ</p>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold small">ពាក្យសម្ងាត់បច្ចុប្បន្ន</label>
            <div class="position-relative">
              <i class="bi bi-lock input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                :type="showPwd.current ? 'text' : 'password'"
                v-model="pwdForm.current"
                class="form-control ps-5 pe-5"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary p-0"
                @click="showPwd.current = !showPwd.current"
              >
                <i :class="showPwd.current ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small">ពាក្យសម្ងាត់ថ្មី</label>
            <div class="position-relative">
              <i class="bi bi-lock input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                :type="showPwd.new ? 'text' : 'password'"
                v-model="pwdForm.newPwd"
                class="form-control ps-5 pe-5"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary p-0"
                @click="showPwd.new = !showPwd.new"
              >
                <i :class="showPwd.new ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="mt-2" v-if="pwdForm.newPwd">
              <div class="progress" style="height:4px">
                <div class="progress-bar" :class="pwdStrength.color" :style="{ width: pwdStrength.width }"></div>
              </div>
              <small :class="pwdStrength.textColor">{{ pwdStrength.label }}</small>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold small">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
            <div class="position-relative">
              <i class="bi bi-lock-fill input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                :type="showPwd.confirm ? 'text' : 'password'"
                v-model="pwdForm.confirm"
                class="form-control ps-5 pe-5"
                :class="pwdForm.confirm && pwdForm.newPwd !== pwdForm.confirm ? 'is-invalid' : ''"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary p-0"
                @click="showPwd.confirm = !showPwd.confirm"
              >
                <i :class="showPwd.confirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback d-block" v-if="pwdForm.confirm && pwdForm.newPwd !== pwdForm.confirm">
              ពាក្យសម្ងាត់មិនត្រូវគ្នា
            </div>
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end gap-2">
          <button class="btn btn-light rounded-2 px-4" @click="cancelEdit">បោះបង់</button>
          <button
            class="btn btn-primary px-4 fw-semibold rounded-2"
            @click="changePassword"
            :disabled="store.changingPwd"
          >
            <span v-if="!store.changingPwd"><i class="bi bi-shield-lock me-1"></i>ផ្លាស់ប្តូរ</span>
            <span v-else><span class="spinner-border spinner-border-sm me-2"></span>កំពុងផ្លាស់ប្តូរ...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index:1060" v-if="toast.show">
      <div
        class="toast show align-items-center text-white border-0"
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi" :class="toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
            {{ toast.message }}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useProfileStore } from "@/stores/profileStore.js";
import AdminLayout from "@/layouts/AdminLayout.vue";

const store     = useProfileStore();
const activeTab = ref("edit"); // ← default tab so edit panel shows on mount
const fileInput = ref(null);

const formData = reactive({
  name: "", email: "", phone: "", location: "", role: "",
  avatarPreview: null,
});

const pwdForm = reactive({ current: "", newPwd: "", confirm: "" });
const showPwd = reactive({ current: false, new: false, confirm: false });
const toast   = reactive({ show: false, message: "", type: "success" });

// ── Sync formData with store.profile whenever it changes (incl. initial load)
watch(
  () => store.profile,
  (p) => {
    if (!p || !Object.keys(p).length) return;
    Object.assign(formData, {
      name:          p.name,
      email:         p.email,
      phone:         p.phone,
      location:      p.location,
      role:          p.role,
      avatarPreview: p.avatar,
    });
  },
  { immediate: true, deep: true }
);

const showToast = (message, type = "success") => {
  Object.assign(toast, { message, type, show: true });
  setTimeout(() => (toast.show = false), 3000);
};

const pwdStrength = computed(() => {
  const p = pwdForm.newPwd;
  let score = 0;
  if (p.length >= 8)           score++;
  if (/[A-Z]/.test(p))         score++;
  if (/[0-9]/.test(p))         score++;
  if (/[^A-Za-z0-9]/.test(p))  score++;
  const map = [
    { label: "ខ្សោយណាស់", color: "bg-danger",  textColor: "text-danger",  width: "25%"  },
    { label: "ខ្សោយ",     color: "bg-warning", textColor: "text-warning", width: "50%"  },
    { label: "មធ្យម",     color: "bg-info",    textColor: "text-info",    width: "75%"  },
    { label: "រឹងមាំ",   color: "bg-success", textColor: "text-success", width: "100%" },
  ];
  return map[Math.max(0, score - 1)];
});

// ── Reset form fields back to store values (instead of hiding everything)
const cancelEdit = () => {
  const p = store.profile;
  if (p && Object.keys(p).length) {
    Object.assign(formData, {
      name: p.name, email: p.email, phone: p.phone,
      location: p.location, role: p.role, avatarPreview: p.avatar,
    });
  }
  Object.assign(pwdForm, { current: "", newPwd: "", confirm: "" });
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = "";
  try {
    await store.uploadAvatar(file);
    formData.avatarPreview = store.profile.avatar;
    showToast("ប្តូររូបភាពបានជោគជ័យ");
  } catch (err) {
    showToast(err.message ?? "បរាជ័យក្នុងការបញ្ចូលរូបភាព", "error");
  }
};

const handleDeleteAvatar = async () => {
  if (!confirm("តើអ្នកពិតជាចង់លុបរូបភាព?")) return;
  try {
    await store.deleteAvatar();
    formData.avatarPreview = null;
    showToast("រូបភាពត្រូវបានលុបជោគជ័យ");
  } catch {
    showToast("មិនអាចលុបរូបភាពបានទេ", "error");
  }
};

const updateProfile = async () => {
  try {
    await store.updateProfile(formData);
    showToast("ព័ត៌មានគណនីបានរក្សាជោគជ័យ");
  } catch {
    showToast("បរាជ័យក្នុងការរក្សាព័ត៌មាន", "error");
  }
};

const changePassword = async () => {
  if (pwdForm.newPwd !== pwdForm.confirm) {
    showToast("ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នា", "error");
    return;
  }
  if (pwdForm.newPwd.length < 8) {
    showToast("ពាក្យសម្ងាត់ត្រូវការ 8 តួអក្សរ", "error");
    return;
  }
  try {
    await store.changePassword(pwdForm);
    showToast("ពាក្យសម្ងាត់ផ្លាស់ប្តូរបានជោគជ័យ");
    Object.assign(pwdForm, { current: "", newPwd: "", confirm: "" });
  } catch (err) {
    showToast(err?.response?.data?.message ?? "បរាជ័យក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់", "error");
  }
};

onMounted(() => store.fetchProfile());
</script>

<style scoped>
.avatar-preview {
  border: 2px solid var(--bs-border-color);
}
.input-icon {
  width: 20px;
  height: 20px;
  z-index: 1;
  pointer-events: none;
}
</style>