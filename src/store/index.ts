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
import storage from "redux-persist/lib/storage"; // 기본 브라우저 로컬 스토리지 사용
import eventsReducer from "./eventsSlice";

// redux-persist 설정: 어떤 slice를, 어떤 key로, 어떤 스토리지에 저장할지
const persistConfig = {
  key: "events", // 로컬 스토리지에 사용할 최상위 key
  storage, // 로컬 스토리지
};

// 장기 저장 reducer 생성
const persistedEventsReducer = persistReducer(persistConfig, eventsReducer);

// 실제 redux store 생ㅅ어
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
