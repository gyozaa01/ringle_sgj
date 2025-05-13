import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Event {
  id: string; // 식별자
  title: string; // 이벤트 제목
  start: string; // ISO 문자열(시작)
  end: string; // ISO 문자열(끝)
  allDay: boolean; // 종일 여부
  // 반복
  repeat: {
    type: "none" | "daily" | "weekly" | "yearly" | "custom";
    options?: {
      days?: number[]; // 주간 반복 요일
      exceptions?: string[]; // 삭제된 특정 날짜(ISO 문자열)
    };
  };
  notes?: string; // 메모(필수사항 아님)
  color: string; // 색상 선택
}

// redux state : 이벤트 목록 items로 보관
interface EventsState {
  items: Event[];
}

const initialState: EventsState = { items: [] }; // 초기 빈 이벤트 배열

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    // 새 이벤트 추가
    addEvent(state, action: PayloadAction<Event>) {
      state.items.push(action.payload);
    },

    // 기존 이벤트 수정
    updateEvent(state, action: PayloadAction<Event>) {
      // 동일한 ID 이벤트 인덱스 찾기
      const idx = state.items.findIndex((e) => e.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    // 전체 이벤트 삭제
    deleteEvent(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },

    // 반복 이벤트의 특정 발생분만 삭제 (exceptions 배열에 날짜 추가)
    deleteOccurrence(
      state,
      action: PayloadAction<{ id: string; dateIso: string }>
    ) {
      const ev = state.items.find((e) => e.id === action.payload.id);
      if (ev && ev.repeat.type !== "none") {
        ev.repeat.options = ev.repeat.options || {};
        const ex = ev.repeat.options.exceptions || [];
        ev.repeat.options.exceptions = [...ex, action.payload.dateIso];
      }
    },
  },
});

export const { addEvent, updateEvent, deleteEvent, deleteOccurrence } =
  eventsSlice.actions;
export default eventsSlice.reducer;
