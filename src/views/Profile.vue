<template>
  <div class="settings-container">
    <!-- Loading State -->
    <div v-if="store.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-secondary mt-2">កំពុងផ្ទុកព័ត៌មាន...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <div class="card shadow-sm border-0 rounded-4 mb-4">
        <div class="card-body p-4">
          <!-- Profile Header Section -->
          <div class="profile-header d-flex flex-wrap align-items-center gap-4 mb-4">
            <!-- Avatar -->
            <div class="profile-avatar-wrapper position-relative">
              <div
                class="profile-avatar rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center shrink-0"
                style="width: 80px; height: 80px"
              >
                <img
                  v-if="store.profile?.avatar"
                  :src="store.profile.avatar"
                  alt="Avatar"
                  class="w-100 h-100 object-fit-cover"
                  @error="handleAvatarError"
                />
                <i v-else class="bi bi-person fs-1 text-secondary"></i>
              </div>
              <!-- Online Status Indicator -->
              <div
                class="avatar-status position-absolute bottom-0 end-0 rounded-circle border-2 border-white"
                :class="statusColor"
                style="width: 16px; height: 16px"
              ></div>
            </div>

            <!-- User Info -->
            <div class="profile-info grow">
              <div class="d-flex align-items-start justify-content-between flex-wrap gap-2">
                <div>
                  <h5 class="fw-bold mb-1">
                    {{ store.profile?.name || "អ្នកប្រើប្រាស់" }}
                  </h5>
                  <p class="text-secondary small mb-0">
                    {{ store.profile?.email || "user@example.com" }}
                  </p>
                  <div class="d-flex align-items-center gap-2 mt-2">
                    <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle small">
                      <i class="bi bi-briefcase me-1"></i>
                      {{ store.profile?.role || "Admin" }}
                    </span>
                    <span class="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle small">
                      <i class="bi bi-shield-check me-1"></i>
                      {{ store.profile?.status || "Active" }}
                    </span>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-outline-primary border-0 rounded-2"
                    @click="triggerFileInput"
                    title="ផ្លាស់ប្តូររូបភាព"
                    :disabled="store.uploadingAvatar"
                  >
                    <span v-if="!store.uploadingAvatar"><i class="bi bi-camera"></i></span>
                    <span v-else><span class="spinner-border spinner-border-sm"></span></span>
                  </button>
                  <input
                    type="file"
                    ref="quickFileInput"
                    @change="handleQuickAvatarUpload"
                    accept="image/*"
                    hidden
                  />
                </div>
              </div>

              <!-- Additional Info -->
              <div class="mt-2">
                <div class="d-flex align-items-center gap-4 text-secondary small">
                  <span v-if="store.profile?.phone">
                    <i class="bi bi-telephone me-1"></i>
                    {{ store.profile.phone }}
                  </span>
                  <span v-if="store.profile?.location">
                    <i class="bi bi-geo-alt me-1"></i>
                    {{ store.profile.location }}
                  </span>
                  <span v-if="store.profile?.joined">
                    <i class="bi bi-calendar me-1"></i>
                    Joined: {{ store.profile.joined }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Switcher -->
          <div class="tab-switcher-wrapper mb-3">
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
                :class="activeTab === 'notifications' ? 'btn-primary' : 'btn-light text-secondary'"
                @click="activeTab = 'notifications'"
              >
                <i class="bi bi-bell-fill"></i> ការជូនដំណឹង
                <span v-if="unreadCount > 0" class="badge bg-danger rounded-pill ms-1">{{ unreadCount }}</span>
              </button>
            </div>
          </div>

          <!-- ────────────── PANELS ────────────── -->

          <!-- ── Edit Profile Panel ── -->
          <div v-if="activeTab === 'edit'">
            <hr class="my-0 mb-4" />

            <div class="mb-4">
              <h5 class="fw-bold mb-1">កែសម្រួលព័ត៌មាន</h5>
              <p class="text-secondary small mb-0">
                គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន និងរូបភាពប្រវត្តិរូប
              </p>
            </div>

            <!-- Avatar row -->
            <div class="d-flex align-items-center gap-4 mb-4 flex-wrap">
              <div
                class="avatar-preview rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center shrink-0"
                style="width: 100px; height: 100px"
              >
                <img
                  v-if="formData.avatarPreview"
                  :src="formData.avatarPreview"
                  alt="Avatar"
                  class="w-100 h-100 object-fit-cover"
                  @error="handleAvatarError"
                />
                <i v-else class="bi bi-person fs-1 text-secondary"></i>
              </div>

              <div class="d-flex flex-column gap-2">
                <label
                  class="btn btn-primary border-0 btn-sm rounded-2 px-2 d-flex align-items-center gap-2 mb-0"
                  style="width: fit-content; cursor: pointer"
                >
                  <span v-if="!store.uploadingAvatar">
                    <i class="bi bi-upload"></i> បញ្ចូលរូបភាព
                  </span>
                  <span v-else>
                    <span class="spinner-border spinner-border-sm me-1"></span> កំពុងផ្ទុក...
                  </span>
                  <input
                    type="file"
                    @change="handleAvatarUpload"
                    accept="image/*"
                    hidden
                    ref="fileInput"
                  />
                </label>
                <div>
                  <button
                    class="btn btn-outline-danger btn-sm rounded-2 px-3 d-flex align-items-center gap-2"
                    @click="handleDeleteAvatar"
                    :disabled="!formData.avatarPreview || store.deletingAvatar"
                  >
                    <span v-if="!store.deletingAvatar">
                      <i class="bi bi-trash"></i> លុបរូបភាព
                    </span>
                    <span v-else>
                      <span class="spinner-border spinner-border-sm"></span>
                    </span>
                  </button>
                </div>
                <p class="form-text text-muted small mb-0">
                  JPG, PNG · អតិបរមា 2MB
                </p>
              </div>
            </div>

            <!-- Fields -->
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small">ឈ្មោះពេញ</label>
                <div class="position-relative">
                  <i class="bi bi-person input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input
                    type="text"
                    v-model="formData.name"
                    class="form-control ps-5"
                    placeholder="បញ្ចូលឈ្មោះពេញ"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">អ៊ីមែល</label>
                <div class="position-relative">
                  <i class="bi bi-envelope input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input
                    type="email"
                    v-model="formData.email"
                    class="form-control ps-5"
                    placeholder="example@domain.com"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">លេខទូរស័ព្ទ</label>
                <div class="position-relative">
                  <i class="bi bi-telephone input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input
                    type="text"
                    v-model="formData.phone"
                    class="form-control ps-5"
                    placeholder="012 345 678"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">ទីតាំង</label>
                <div class="position-relative">
                  <i class="bi bi-geo-alt input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input
                    type="text"
                    v-model="formData.location"
                    class="form-control ps-5"
                    placeholder="ភ្នំពេញ"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">តួនាទី / ផ្នែក</label>
                <div class="position-relative">
                  <i class="bi bi-briefcase input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input
                    type="text"
                    v-model="formData.role"
                    class="form-control ps-5 bg-light"
                    disabled
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">ស្ថានភាព</label>
                <div class="position-relative">
                  <i class="bi bi-shield-check input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
                  <input
                    type="text"
                    v-model="formData.status"
                    class="form-control ps-5 bg-light"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div class="mt-4 d-flex justify-content-end gap-2">
              <button class="btn btn-light rounded-2 px-4" @click="cancelEdit">
                បោះបង់
              </button>
              <button
                class="btn btn-primary px-4 fw-semibold rounded-2"
                @click="updateProfile"
                :disabled="store.saving"
              >
                <span v-if="!store.saving">
                  <i class="bi bi-check-lg me-1"></i>រក្សាព័ត៌មាន
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-2"></span>កំពុងរក្សា...
                </span>
              </button>
            </div>
          </div>

          <!-- ── Notifications Panel ── -->
          <div v-if="activeTab === 'notifications'">
            <hr class="my-0 mb-4" />

            <div class="mb-4">
              <h5 class="fw-bold mb-1">ការជូនដំណឹង</h5>
              <p class="text-secondary small mb-0">
                គ្រប់គ្រងការជូនដំណឹងរបស់អ្នក
              </p>
            </div>

            <div class="notifications-list">
              <!-- Loading -->
              <div v-if="notificationStore.loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-secondary mt-2">កំពុងផ្ទុកការជូនដំណឹង...</p>
              </div>

              <!-- Empty -->
              <div v-else-if="notificationStore.notifications.length === 0" class="text-center py-5">
                <i class="bi bi-bell-slash text-muted fs-1"></i>
                <p class="text-secondary small mt-2">មិនមានការជូនដំណឹង</p>
              </div>

              <!-- Notifications List -->
              <div v-else>
                <div
                  v-for="notification in notificationStore.notifications"
                  :key="notification.id"
                  class="notification-item d-flex gap-3 p-3 mb-3 rounded-3"
                  :class="notification.read ? 'bg-light' : 'bg-primary bg-opacity-10'"
                >
                  <div
                    class="notification-icon rounded-circle d-flex align-items-center justify-content-center shrink-0"
                    :class="getNotificationIconClass(notification.type)"
                    style="width: 40px; height: 40px"
                  >
                    <i :class="getNotificationIcon(notification.type)"></i>
                  </div>
                  <div class="grow">
                    <div class="fw-semibold">{{ notification.title }}</div>
                    <div class="text-secondary small">{{ notification.message }}</div>
                    <div class="text-muted small mt-1">
                      {{ formatDate(notification.created_at) }}
                    </div>
                  </div>
                  <div class="notification-actions d-flex align-items-center gap-2">
                    <button
                      class="btn btn-sm btn-link text-decoration-none p-0"
                      @click="handleMarkAsRead(notification.id)"
                      v-if="!notification.read"
                      title="សម្គាល់ថាបានអាន"
                    >
                      <i class="bi bi-check2-circle"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-link text-decoration-none p-0 text-danger"
                      @click="handleDeleteNotification(notification.id)"
                      title="លុប"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 d-flex justify-content-between align-items-center">
              <button
                class="btn btn-sm btn-outline-secondary rounded-2"
                @click="handleMarkAllAsRead"
                :disabled="notificationStore.loading"
              >
                <i class="bi bi-check2-all me-1"></i> សម្គាល់ទាំងអស់
              </button>
              <button
                class="btn btn-sm btn-outline-danger rounded-2"
                @click="handleClearAllNotifications"
                :disabled="notificationStore.loading"
              >
                <i class="bi bi-trash me-1"></i> លុបទាំងអស់
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1060"
      v-if="toast.show"
    >
      <div
        class="toast show align-items-center text-white border-0"
        :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i
              class="bi"
              :class="toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"
            ></i>
            {{ toast.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useProfileStore } from "../stores/profileStore";
import { useNotificationStore } from "../stores/notification";

const store = useProfileStore();
const notificationStore = useNotificationStore();

const activeTab = ref("edit");
const fileInput = ref(null);
const quickFileInput = ref(null);

const formData = reactive({
  name: "",
  email: "",
  phone: "",
  location: "",
  role: "",
  status: "",
  avatarPreview: null,
});

const toast = reactive({ show: false, message: "", type: "success" });

// ── Computed ──
const unreadCount = computed(() => {
  return notificationStore.notifications.filter((n) => !n.read).length;
});

const statusColor = computed(() => {
  const status = store.profile?.status?.toLowerCase();
  if (status === "active" || status === "online") return "bg-success";
  if (status === "inactive" || status === "offline") return "bg-secondary";
  return "bg-warning";
});

// ── Helpers ──
const syncFormData = (profileData) => {
  Object.assign(formData, {
    name: profileData.name || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
    location: profileData.location || "",
    role: profileData.role || "",
    status: profileData.status || "",
    avatarPreview: profileData.avatar || null,
  });
};

const showToast = (message, type = "success") => {
  Object.assign(toast, { message, type, show: true });
  setTimeout(() => (toast.show = false), 3000);
};

const getNotificationIcon = (type) => {
  const icons = {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };
  return icons[type] || "bi-bell-fill";
};

const getNotificationIconClass = (type) => {
  const classes = {
    success: "bg-success bg-opacity-10 text-success",
    error: "bg-danger bg-opacity-10 text-danger",
    warning: "bg-warning bg-opacity-10 text-warning",
    info: "bg-info bg-opacity-10 text-info",
  };
  return classes[type] || "bg-primary bg-opacity-10 text-primary";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("km-KH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Actions ──
const triggerFileInput = () => {
  quickFileInput.value?.click();
};

const handleQuickAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = "";

  if (file.size > 2 * 1024 * 1024) {
    showToast("រូបភាពមិនត្រឹមមានទំហំ 2MB", "error");
    return;
  }

  try {
    await store.uploadAvatar(file);
    showToast("ប្តូររូបភាពបានជោគជ័យ");
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "បរាជ័យក្នុងការបញ្ចូលរូបភាព";
    showToast(msg, "error");
  }
};

const handleAvatarError = (event) => {
  event.target.style.display = "none";
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = "";

  if (file.size > 2 * 1024 * 1024) {
    showToast("រូបភាពមិនត្រឹមមានទំហំ 2MB", "error");
    return;
  }

  try {
    await store.uploadAvatar(file);
    showToast("ប្តូររូបភាពបានជោគជ័យ");
  } catch (err) {
    console.error("Avatar upload error:", err);
    const msg = err.response?.data?.message || err.message || "បរាជ័យក្នុងការបញ្ចូលរូបភាព";
    showToast(msg, "error");
  }
};

const handleDeleteAvatar = async () => {
  if (!confirm("តើអ្នកពិតជាចង់លុបរូបភាព?")) return;
  try {
    await store.deleteAvatar();
    showToast("រូបភាពត្រូវបានលុបជោគជ័យ");
  } catch (err) {
    console.error("Delete avatar error:", err);
    showToast("មិនអាចលុបរូបភាពបានទេ", "error");
  }
};

const cancelEdit = () => {
  syncFormData(store.profile);
};

const updateProfile = async () => {
  try {
    await store.updateProfile(formData);
    showToast("ព័ត៌មានគណនីបានរក្សាជោគជ័យ");
  } catch (err) {
    console.error("Update profile error:", err);
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.data?.message ||
      err.message ||
      "បរាជ័យក្នុងការរក្សាព័ត៌មាន";
    showToast(errorMessage, "error");
  }
};

// Notification Actions
const handleMarkAsRead = async (id) => {
  try {
    await notificationStore.markAsRead(id);
    showToast("សម្គាល់ការជូនដំណឹងជោគជ័យ");
  } catch (err) {
    console.error("Mark as read error:", err);
    showToast("បរាជ័យក្នុងការសម្គាល់", "error");
  }
};

const handleDeleteNotification = async (id) => {
  if (!confirm("តើអ្នកពិតជាចង់លុបការជូនដំណឹងនេះ?")) return;
  try {
    await notificationStore.deleteNotification(id);
    showToast("ការជូនដំណឹងត្រូវបានលុប");
  } catch (err) {
    console.error("Delete notification error:", err);
    showToast("បរាជ័យក្នុងការលុប", "error");
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
    showToast("សម្គាល់ការជូនដំណឹងទាំងអស់");
  } catch (err) {
    console.error("Mark all as read error:", err);
    showToast("បរាជ័យក្នុងការសម្គាល់ទាំងអស់", "error");
  }
};

const handleClearAllNotifications = async () => {
  if (!confirm("តើអ្នកពិតជាចង់លុបការជូនដំណឹងទាំងអស់?")) return;
  try {
    await notificationStore.clearAllNotifications();
    showToast("លុបការជូនដំណឹងទាំងអស់");
  } catch (err) {
    console.error("Clear all notifications error:", err);
    showToast("បរាជ័យក្នុងការលុប", "error");
  }
};

// ── Watchers & Lifecycle ──
watch(
  () => store.profile,
  (newProfile) => {
    if (!newProfile || !Object.keys(newProfile).length) return;
    syncFormData(newProfile);
  },
  { immediate: true, deep: true },
);

watch(activeTab, async (newTab) => {
  if (newTab === "notifications") {
    try {
      if (typeof notificationStore.fetchNotifications === "function") {
        await notificationStore.fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }
});

onMounted(async () => {
  try {
    await store.fetchProfile();
  } catch (err) {
    console.error("Failed to load profile:", err);
    showToast("បរាជ័យក្នុងការផ្ទុកព័ត៌មាន", "error");
  }
});
</script>

<style scoped>
.avatar-preview {
  border: 2px solid var(--bs-border-color);
  transition: border-color 0.2s ease-in-out;
}
.avatar-preview:hover {
  border-color: var(--bs-primary);
}

.profile-avatar {
  border: 3px solid var(--bs-border-color);
  transition: border-color 0.2s ease-in-out;
}
.profile-avatar:hover {
  border-color: var(--bs-primary);
}

.profile-avatar-wrapper {
  transition: transform 0.2s ease-in-out;
}
.profile-avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar-status {
  border-color: var(--bs-border-color);
}

.input-icon {
  width: 20px;
  height: 20px;
  z-index: 1;
  pointer-events: none;
}

.tab-switcher-wrapper {
  border-top: 1px solid var(--bs-border-color);
  padding-top: 1rem;
  margin-top: 1rem;
}

.notification-item {
  transition: background-color 0.2s ease-in-out;
}
.notification-item:hover {
  background-color: var(--bs-light) !important;
}

.card {
  transition: box-shadow 0.2s ease-in-out;
}
.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.btn {
  transition: all 0.2s ease-in-out;
}
.btn:hover {
  transform: translateY(-1px);
}
</style>