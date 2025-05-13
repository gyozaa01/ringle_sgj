import type { Event as CalendarEvent } from "@/store/eventsSlice";
import { deleteEvent, deleteOccurrence } from "@/store/eventsSlice";
import { useDispatch } from "react-redux";
import "./_EventDetailModal.scss";

interface Props {
  event: CalendarEvent; // 선택된 이벤트
  onClose: () => void; // 모달 닫기
  dateIso: string; // 삭제 대상 날짜(YYYY-MM-DD)
}

const KOREAN_WEEKDAYS = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

/** 숫자 요일 배열 → 한글 요일 이름 정렬된 배열로 변환 */
function weekdayNamesFromNums(days: number[]): string[] {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => KOREAN_WEEKDAYS[d]);
}

/** ISO 문자열을 Date로 파싱해서 'MM월 DD일' 형태로 반환 */
function formatMonthDay(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}월 ${dd}일`;
}

export function EventDetailModal({ event, onClose, dateIso }: Props) {
  const dispatch = useDispatch();
  const { id, title, start, end, allDay, repeat, notes } = event;

  /** repeat.type 에 따른 라벨 생성 */
  function getRepeatLabel(): string {
    switch (repeat.type) {
      case "none":
        return "반복 없음";

      case "weekly": {
        // options.days 가 없으면 시작일 기준으로 한 번만
        const dayNums = (repeat.options?.days as number[] | undefined) || [
          new Date(start).getDay(),
        ];

        const names = weekdayNamesFromNums(dayNums);
        // ["화요일"] → "매주 화요일"
        if (names.length === 1) {
          return `매주 ${names[0]}`;
        }
        // ["월요일","수요일"] → "매주 월·수요일"
        const joined =
          names.slice(0, -1).join("·") + "·" + names[names.length - 1];
        return `매주 ${joined}`;
      }

      case "yearly":
        return `매년 ${formatMonthDay(start)}`;

      case "custom":
        return "사용자 지정 반복";

      default:
        return "반복 없음";
    }
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  function confirmDelete() {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    if (repeat.type !== "none") {
      // 반복 이벤트: 한 날짜만 vs 전체
      const onlyOne = window.confirm(
        "이 반복 이벤트의 이 날짜만 삭제하시겠습니까? '취소' 시 전체 삭제됩니다."
      );
      if (onlyOne) {
        dispatch(deleteOccurrence({ id, dateIso }));
      } else {
        dispatch(deleteEvent(id));
      }
    } else {
      dispatch(deleteEvent(id));
    }
    onClose();
  }

  return (
    <div className="event-modal-backdrop" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="event-modal__close" onClick={onClose}>
          ×
        </button>

        <h2 className="event-modal__title">{title}</h2>

        {/* 일정 */}
        <div className="event-modal__section">
          <strong>일정:</strong>{" "}
          {allDay
            ? "종일"
            : `${formatDateTime(start)} – ${new Date(end).toLocaleTimeString(
                "ko-KR",
                { hour: "2-digit", minute: "2-digit" }
              )}`}
        </div>

        {/* 반복 */}
        <div className="event-modal__section">
          <strong>반복:</strong> {getRepeatLabel()}
        </div>

        {/* 메모 */}
        {notes && (
          <div className="event-modal__section">
            <strong>메모:</strong> {notes}
          </div>
        )}

        {/* 삭제 */}
        <button className="event-modal__delete" onClick={confirmDelete}>
          삭제
        </button>
      </div>
    </div>
  );
}
