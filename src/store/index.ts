import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { safeStorage } from "./safeStorage";
import eventsReducer from "./eventsSlice";

// redux-persist 설정: safeStorage 사용
const persistConfig = {
  key: "events", // 로컬 스토리지에 사용할 최상위 key
  storage: safeStorage,
};

// 장기 저장 reducer 생성
const persistedEventsReducer = persistReducer(persistConfig, eventsReducer);

// 실제 redux store 생성
export const store = configureStore({
  reducer: {
    // events slice 데이터를 persistedEventsReducer로 관리
    events: persistedEventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
