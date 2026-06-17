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

  //  changingPwd = ref(false);
  // deletingAvatar = ref(false);
  // uploadingAvatar = ref(false);
  // ── Helpers ────────────────────────────────────────
  const resolveAvatar = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
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
  // (Assuming GET uses the same base path /profile/info)
  const fetchProfile = async () => {
    loading.value = true;
    try {
      const res = await api.get("/profile/info");
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
  // PUT /profile/info
  const updateProfile = async (payload) => {
    saving.value = true;
    try {
      await api.put("/profile/info", {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
      });

      // Update local state optimistically
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
  // PUT /profile/change-pass
  const changePassword = async (payload) => {
    changingPwd.value = true;
    try {
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
  // POST /profile/image
  const uploadAvatar = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("រូបភាពមិនត្រឹមមានទំហំ 2MB"); // Max 2MB
    }

    uploadingAvatar.value = true;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post("/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = unwrap(res);
      profile.value.avatar = updated?.avatar
        ? resolveAvatar(updated.avatar)
        : URL.createObjectURL(file);

      return true;
    } catch (err) {
      console.error("uploadAvatar error:", err);
      throw err;
    } finally {
      uploadingAvatar.value = false;
    }
  };

  // ── 5. Delete Avatar ───────────────────────────────
  // DELETE /profile/image
  const deleteAvatar = async () => {
    deletingAvatar.value = true;
    try {
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
