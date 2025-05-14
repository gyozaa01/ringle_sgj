import storage from "redux-persist/lib/storage";
import type { Storage } from "redux-persist";

// 용량 초과 시 사용자에게 알리고 저장을 중단
export const safeStorage: Storage = {
  getItem: async (key) => storage.getItem(key),

  setItem: async (key, value) => {
    try {
      await storage.setItem(key, value);
    } catch (error: unknown) {
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" || error.code === 22)
      ) {
        // 사용자에게 용량 초과 알림
        alert("로컬 스토리지 용량이 부족합니다. 저장 공간을 확보해주세요.");
        console.error(
          "SafeStorage: 로컬 스토리지 용량 초과로 저장에 실패했습니다."
        );
      } else {
        throw error;
      }
    }
  },

  removeItem: async (key) => storage.removeItem(key),
};
