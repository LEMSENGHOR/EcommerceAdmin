import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api.js";

export const useProfileStore = defineStore("profile", () => {
  // ── State ──────────────────────────────────────────
  const profile = ref({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    status: "",
    joined: null,
    avatar: null,
  });

  const loading = ref(false);
  const saving = ref(false);
  const changingPwd = ref(false);
  const deletingAvatar = ref(false);
  const uploadingAvatar = ref(false);

  // ── Helpers ────────────────────────────────────────
  const resolveAvatar = (path) => {
    if (!path) return null;
    // If it's already a full URL (AWS S3, CDN, etc), return it
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    // If it's a relative path, prepend the Backend URL
    if (path.startsWith("/")) return import.meta.env.VITE_BASE_URL + path;
    return path;
  };

  const unwrap = (res) =>
    res?.data?.data ?? res?.data?.user ?? res?.data ?? res;

  const formatDate = (raw) => {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d)
      ? raw
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  // ── 1. Fetch Profile ───────────────────────────────
  const fetchProfile = async () => {
    loading.value = true;
    try {
      // api.js adds /api, so this requests /api/me
      const res = await api.get("/me");
      const user = unwrap(res);

      profile.value = {
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        location: user.location ?? "",
        role: user.role ?? "",
        status: user.status ?? "Active",
        joined: formatDate(user.created_at ?? user.joined),
        avatar: resolveAvatar(user.avatar),
      };
    } catch (err) {
      console.error("fetchProfile error:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ── 2. Update Info ─────────────────────────────────
  // Corrected: Removed '/api' prefix because api.js handles it
  const updateProfile = async (payload) => {
    saving.value = true;
    try {
      // This requests /api/profile/info
      await api.put("/profile/info", {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
      });

      // Update local state
      profile.value.name = payload.name;
      profile.value.email = payload.email;
      profile.value.phone = payload.phone;
      profile.value.location = payload.location;

      return true;
    } catch (err) {
      console.error("updateProfile error:", err);
      throw err;
    } finally {
      saving.value = false;
    }
  };

  // ── 3. Change Password ─────────────────────────────
  // Corrected: Removed '/api' prefix
  const changePassword = async (payload) => {
    changingPwd.value = true;
    try {
      // This requests /api/profile/change-pass
      await api.put("/profile/change-pass", {
        current_password: payload.current,
        password: payload.newPwd,
        password_confirmation: payload.confirm,
      });
      return true;
    } catch (err) {
      console.error("changePassword error:", err);
      throw err;
    } finally {
      changingPwd.value = false;
    }
  };

  // ── 4. Upload Avatar ───────────────────────────────
  // Corrected: Removed '/api' prefix AND removed manual Content-Type header
  const uploadAvatar = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("រូបភាពមិនត្រឹមមានទំហំ 2MB"); // Max 2MB
    }

    uploadingAvatar.value = true;
    const formData = new FormData();
    // formData.append("avatar", file);
    // formData.append("file", file);
    formData.append("image", file);
    // formData.append("_method", "POST"); // or "PUT" depending on your route
    // formData.append("avatar", file);

    try {
      // Axios automatically detects FormData and sets the correct headers with boundary
      const res = await api.post("/profile/image", formData);

      const updated = unwrap(res);
      profile.value.avatar = updated?.avatar
        ? resolveAvatar(updated.avatar)
        : URL.createObjectURL(file);

      return true;
    } catch (err) {
       console.log("Backend Error Details:", err.response?.data);
      console.error("uploadAvatar error:", err);
      throw err;
    } finally {
      uploadingAvatar.value = false;
    }
  };

  // ── 5. Delete Avatar ───────────────────────────────
  // Corrected: Removed '/api' prefix
  const deleteAvatar = async () => {
    deletingAvatar.value = true;
    try {
      // This requests /api/profile/image
      await api.delete("/profile/image");
      profile.value.avatar = null;
      return true;
    } catch (err) {
      console.error("deleteAvatar error:", err);
      throw err;
    } finally {
      deletingAvatar.value = false;
    }
  };

  return {
    profile,
    loading,
    saving,
    changingPwd,
    deletingAvatar,
    uploadingAvatar,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
  };
});
