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

// 로컬 시간(HH:mm) 반환
function getLocalTime(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
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
    initialData?.start
      ? getLocalIsoDate(new Date(initialData.start))
      : getLocalIsoDate()
  );
  // startTime/endTime
  const [startTime, setStartTime] = useState(
    initialData?.start ? getLocalTime(new Date(initialData.start)) : "09:00"
  );
  const [endTime, setEndTime] = useState(
    initialData?.end ? getLocalTime(new Date(initialData.end)) : "10:00"
  );
  const [allDay, setAllDay] = useState(initialData?.allDay ?? false);
  const [repeatType, setRepeatType] = useState<Event["repeat"]["type"]>(
    initialData?.repeat?.type || "none"
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [color, setColor] = useState(initialData?.color || "");

  // 에러 메시지 state
  const [errors, setErrors] = useState<{
    title?: string;
    time?: string;
    color?: string;
  }>({});

  // initialData가 바뀔 때 로컬 기준으로 폼에 반영
  useEffect(() => {
    if (!initialData) return;
    setTitle(initialData.title || "");

    if (initialData.start) {
      const sd = new Date(initialData.start);
      setDate(getLocalIsoDate(sd));
      setStartTime(getLocalTime(sd));
    }

    if (initialData.end) {
      const ed = new Date(initialData.end);
      setEndTime(getLocalTime(ed));
    }

    // 종일, 반복, 메모, 제목 업데이트
    setAllDay(initialData.allDay ?? false);
    setRepeatType(initialData.repeat?.type || "none");
    setNotes(initialData.notes || "");
    setColor(initialData.color || "");
    setErrors({});
  }, [initialData]);

  // validation 체크
  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (title.trim() === "") newErrors.title = "제목을 입력해주세요.";
    if (!color) newErrors.color = "색상을 선택해주세요.";
    if (!allDay) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      if (sh > eh || (sh === eh && sm >= em))
        newErrors.time = "시작 시간은 종료 시간보다 빨라야 합니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    // allDay면 00:00~23:59:59, 아니면 사용자가 선택한 시간으로 ISO 문자열 생성
    const startISO = allDay
      ? new Date(`${date}T00:00:00`).toISOString()
      : new Date(`${date}T${startTime}:00`).toISOString();
    const endISO = allDay
      ? new Date(`${date}T23:59:59`).toISOString()
      : new Date(`${date}T${endTime}:00`).toISOString();

    // 이벤트 객체 구성
    const ev: Event = {
      id: initialData?.id || uuid(),
      title: title.trim(),
      start: startISO,
      end: endISO,
      allDay,
      repeat: {
        type: repeatType,
        options:
          repeatType === "weekly"
            ? { days: [new Date(date).getDay()] }
            : undefined,
      },
      notes: notes.trim(),
      color,
    };

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
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            style={{
              padding: "0.5rem",
              border: `1px solid ${errors.title ? "#EF4444" : "#d1d5db"}`,
              borderRadius: "4px",
            }}
          />
          {errors.title && (
            <span style={{ color: "#EF4444", fontSize: "0.75rem" }}>
              {errors.title}
            </span>
          )}
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                시작 시간
              </span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (errors.time)
                    setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                style={{
                  padding: "0.5rem",
                  border: `1px solid ${errors.time ? "#EF4444" : "#d1d5db"}`,
                  borderRadius: "4px",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                종료 시간
              </span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (errors.time)
                    setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                style={{
                  padding: "0.5rem",
                  border: `1px solid ${errors.time ? "#EF4444" : "#d1d5db"}`,
                  borderRadius: "4px",
                }}
              />
            </div>
            {errors.time && (
              <span
                style={{
                  gridColumn: "1 / -1",
                  color: "#EF4444",
                  fontSize: "0.75rem",
                }}
              >
                {errors.time}
              </span>
            )}
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
            <option value="weekly">
              매주 {KOREAN_WEEKDAYS[new Date(date).getDay()]}
            </option>
            <option value="yearly">
              매년{" "}
              {`${String(new Date(date).getMonth() + 1).padStart(
                2,
                "0"
              )}월 ${String(new Date(date).getDate()).padStart(2, "0")}일`}
            </option>
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
              onClick={() => {
                setColor(opt.value);
                if (errors.color)
                  setErrors((prev) => ({ ...prev, color: undefined }));
              }}
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
        {errors.color && (
          <span style={{ color: "#EF4444", fontSize: "0.75rem" }}>
            {errors.color}
          </span>
        )}
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
          disabled={!!errors.title || !!errors.time || !!errors.color}
          style={{
            padding: "0.5rem 1rem",
            background:
              !!errors.title || !!errors.time || !!errors.color
                ? "#9CA3AF"
                : "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              !!errors.title || !!errors.time || !!errors.color
                ? "not-allowed"
                : "pointer",
          }}
        >
          저장
        </button>
      </div>
    </Modal>
  );
}
