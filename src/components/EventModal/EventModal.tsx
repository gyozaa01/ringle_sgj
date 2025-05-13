import { useState, useEffect } from "react";
import Modal from "react-modal";
import { useDispatch } from "react-redux";
import type { Event } from "@/store/eventsSlice";
import { addEvent, updateEvent } from "@/store/eventsSlice";
import { v4 as uuid } from "uuid";

interface Props {
  isOpen: boolean; // 모달 열림 여부
  onClose: () => void; // 모달 닫기
  initialData?: Partial<Event>; // 편집할 이벤트 초기 데이터
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 요일 한글 매핑
const KOREAN_WEEKDAYS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

// 색상 옵션
const COLOR_OPTIONS = [
  { label: "색상1", value: "color1", hex: "#FFB3B3" },
  { label: "색상2", value: "color2", hex: "#FFF5BA" },
  { label: "색상3", value: "color3", hex: "#B3FFB3" },
  { label: "색상4", value: "color4", hex: "#B3E0FF" },
  { label: "색상5", value: "color5", hex: "#E0B3FF" },
];

export function EventModal({ isOpen, onClose, initialData }: Props) {
  const dispatch = useDispatch();

  // 모달 접근성 설정을 위해 app root 엘리먼트 설정
  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  // 폼 상태
  const [title, setTitle] = useState(initialData?.title || ""); // 이벤트 제목
  // date: YYYY-MM-DD
  const [date, setDate] = useState(
    initialData?.start ? initialData.start.slice(0, 10) : getLocalIsoDate()
  );
  // startTime/endTime
  const [startTime, setStartTime] = useState(
    initialData?.start ? initialData.start.slice(11, 16) : "09:00"
  );
  const [endTime, setEndTime] = useState(
    initialData?.end ? initialData.end.slice(11, 16) : "10:00"
  );
  const [allDay, setAllDay] = useState(initialData?.allDay ?? false); // 종일 여부
  // 반복 여부(none/dailiy/weekly/yearly)
  const [repeatType, setRepeatType] = useState<Event["repeat"]["type"]>(
    initialData?.repeat?.type || "none"
  );
  const [notes, setNotes] = useState(initialData?.notes || ""); // 상세 메모
  const [color, setColor] = useState<string>(initialData?.color || "color3"); // 색상 옵션

  // initialData 변경될 때마다 폼에 반영
  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title || "");
    if (initialData.start) {
      setDate(initialData.start.slice(0, 10));
      setStartTime(initialData.start.slice(11, 16));
    }

    // 날짜/시간 설정
    if (initialData.end) {
      setEndTime(initialData.end.slice(11, 16));
    }

    // 종일, 반복, 메모, 제목 업데이트
    setAllDay(initialData.allDay ?? false);
    setRepeatType(initialData.repeat?.type || "none");
    setNotes(initialData.notes || "");
    setColor(initialData.color || "color3");
  }, [initialData]);

  // date에 따라 요일/월일 뽑아서 레이블 생성
  const selected = new Date(date);
  const weekdayLabel = KOREAN_WEEKDAYS[selected.getDay()];
  const month = String(selected.getMonth() + 1).padStart(2, "0");
  const day = String(selected.getDate()).padStart(2, "0");
  const yearlyLabel = `${month}월 ${day}일`;

  function handleSave() {
    // allDay면 00:00~23:59:59, 아니면 사용자가 선택한 시간으로 ISO 문자열 생성
    const startISO = allDay
      ? new Date(`${date}T00:00:00`).toISOString()
      : new Date(`${date}T${startTime}:00`).toISOString();
    const endISO = allDay
      ? new Date(`${date}T23:59:59`).toISOString()
      : new Date(`${date}T${endTime}:00`).toISOString();

    // 이벤트 객체 구성
    const ev: Event = {
      id: initialData?.id || uuid(), // 기존 ID 없으면 새로 생성
      title,
      start: startISO,
      end: endISO,
      allDay,
      repeat: {
        type: repeatType,
        options:
          repeatType === "weekly" ? { days: [selected.getDay()] } : undefined,
      },
      notes,
      color,
    };

    // 수정 모드이면 update, 새로 만들기면 add
    if (initialData?.id) dispatch(updateEvent(ev));
    else dispatch(addEvent(ev));

    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 1000,
        },
        content: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          padding: "1.5rem",
          borderRadius: "6px",
          maxWidth: "400px",
          width: "90%",
        },
      }}
    >
      <h2 style={{ margin: 0, marginBottom: "1rem", fontSize: "1.25rem" }}>
        {initialData?.id ? "이벤트 수정" : "새 이벤트 추가"}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* 제목 */}
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>제목</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        </label>

        {/* 날짜 */}
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>날짜</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          />
        </label>

        {/* 종일 */}
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          <span style={{ fontSize: "0.875rem" }}>종일</span>
        </label>

        {/* 시간 선택 */}
        {!allDay && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                시작 시간
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                종료 시간
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </label>
          </div>
        )}

        {/* 반복 */}
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>반복</span>
          <select
            value={repeatType}
            onChange={(e) =>
              setRepeatType(e.target.value as Event["repeat"]["type"])
            }
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
            }}
          >
            <option value="none">반복 없음</option>
            <option value="weekly">매주 {weekdayLabel}</option>
            <option value="yearly">매년 {yearlyLabel}</option>
          </select>
        </label>

        {/* 메모 */}
        <label style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>메모</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              resize: "vertical",
            }}
          />
        </label>

        {/* 색상 선택 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>색상</span>
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-label={opt.label}
              onClick={() => setColor(opt.value)}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "50%",
                border:
                  color === opt.value ? "2px solid #000" : "1px solid #d1d5db",
                backgroundColor: opt.hex,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>

      {/* 취소/저장 버튼 */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            background: "white",
            cursor: "pointer",
          }}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          저장
        </button>
      </div>
    </Modal>
  );
}
