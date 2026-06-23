import { computed } from "vue";
import { useProfileStore } from "../stores/profileStore";

export function useUser() {
  const profileStore = useProfileStore();

  const userName = computed(() => {
    return profileStore.profile?.name || "Admin";
  });

  const userInitial = computed(() => {
    const name = profileStore.profile?.name || "Admin";
    return name.charAt(0).toUpperCase();
  });

  const userAvatar = computed(() => {
    return profileStore.profile?.avatar || null;
  });

  const hasAvatar = computed(() => {
    return !!profileStore.profile?.avatar;
  });

  return {
    userName,
    userInitial,
    userAvatar,
    hasAvatar,
    profileStore,
  };
}
