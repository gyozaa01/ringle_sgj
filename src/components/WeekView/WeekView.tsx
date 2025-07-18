import "./_weekview.scss";
import { PlusIcon } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Event as CalendarEvent } from "@/store/eventsSlice";
import { useRef, useState, useLayoutEffect } from "react";
import { EventDetailModal } from "@/components/EventModal/EventDetailModal";

interface WeeklyCalendarProps {
  currentDate: Date; // 현재 보고 있는 날짜
  showSidebar: boolean; // 사이드바 노출 여부
  onCreate: (dateIso: string, hour: number | null) => void;
  onEdit: (ev: CalendarEvent) => void;
}

// 시/분/초 제거 후 비교
function isSameOrAfterDate(a: Date, b: Date) {
  const da = new Date(a);
  da.setHours(0, 0, 0, 0);
  const db = new Date(b);
  db.setHours(0, 0, 0, 0);
  return da.getTime() >= db.getTime();
}

type DateInfo = {
  date: Date;
  iso: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
};

// 로컬 기준 YYYY-MM-DD 생성 함수
function toLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function WeekView({
  currentDate,
  showSidebar,
  onCreate,
  onEdit,
}: WeeklyCalendarProps) {
  // Redux에서 저장된 이벤트 목록 불러오기
  const raw = useSelector((s: RootState) => s.events.items) as CalendarEvent[];

  // ISO 문자열(start/end)를 Date 객체로 변환
  const events = raw.map((e) => ({
    ...e,
    // color는 store에 이미 들어있다고 가정
    startDate: new Date(e.start),
    endDate: new Date(e.end),
  }));
  const [selEvent, setSelEvent] = useState<CalendarEvent | null>(null);
  const [selDateIso, setSelDateIso] = useState<string>("");

  // 이번 주 시작(일요일) 계산
  const weekStart = (() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  })();

  // 요일 헤더 생성(일~토)
  const weekDays: DateInfo[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return {
      date,
      iso: toLocalIso(date),
      dayName: new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(
        date
      ),
      dayNumber: date.getDate(), // 1~31
      isToday: date.toDateString() === new Date().toDateString(),
    };
  });

  // 왼쪽 시간 축 생성(12am ~ 23pm)
  const timeSlots = Array.from({ length: 24 }).map((_, hour) => ({
    hour,
    label: `${hour === 0 ? "12" : hour > 12 ? hour - 12 : hour}${
      hour >= 12 ? "pm" : "am"
    }`,
  }));

  // 특정 날짜(cellDate)와 시간에 해당하는 이벤트만 필터링
  function eventsFor(cellDate: Date, hour: number | null) {
    return events.filter((ev) => {
      // 제외된 날짜 예외 처리
      if (ev.repeat.options?.exceptions?.includes(toLocalIso(cellDate))) {
        return false;
      }
      if (hour === null) {
        // All-day 이벤트
        if (!ev.allDay) return false;

        switch (ev.repeat.type) {
          // 매주 반복: 시간 요일 일치 & 셀 날짜 >= 시작 날짜
          case "weekly":
            return (
              ev.startDate.getDay() === cellDate.getDay() &&
              isSameOrAfterDate(cellDate, ev.startDate)
            );
          // 매년 반복: 월&일 같고 셀 날짜 >= 시작 날짜
          case "yearly":
            return (
              ev.startDate.getMonth() === cellDate.getMonth() &&
              ev.startDate.getDate() === cellDate.getDate() &&
              isSameOrAfterDate(cellDate, ev.startDate)
            );
          // 정확히 같은 날짜 -> 반복 없음
          default:
            return ev.startDate.toDateString() === cellDate.toDateString();
        }
      }
      // 시간 이벤트
      if (ev.allDay || ev.startDate.getHours() !== hour) return false;
      switch (ev.repeat.type) {
        case "weekly":
          return (
            ev.startDate.getDay() === cellDate.getDay() &&
            isSameOrAfterDate(cellDate, ev.startDate)
          );
        case "yearly":
          return (
            ev.startDate.getMonth() === cellDate.getMonth() &&
            ev.startDate.getDate() === cellDate.getDate() &&
            isSameOrAfterDate(cellDate, ev.startDate)
          );
        default:
          return ev.startDate.toDateString() === cellDate.toDateString();
      }
    });
  }

  // 런타임 측정을 위한 ref & state
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState<number>(0);

  useLayoutEffect(() => {
    const firstCell = gridRef.current?.querySelector<HTMLElement>(
      ".weekly-calendar__cell"
    );
    if (firstCell) {
      setCellHeight(firstCell.getBoundingClientRect().height);
    }
  }, []);

  // 현재 시간 선 그리기용 offset 계산
  const now = new Date();
  const todayIdx = weekDays.findIndex((d) => d.isToday);
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const topOffset = cellHeight + (minutesSinceMidnight / 60) * cellHeight;

  return (
    <div className="weekly-calendar">
      {/* 헤더 */}
      <div className="weekly-calendar__header">
        <div className="weekly-calendar__header-first-cell">
          <div className="weekly-calendar__time-placeholder" />
          {/* 사이드바 없을 땐 상단 +버튼 : 디폴트 오전 9시 */}
          {!showSidebar && (
            <button
              className="weekly-calendar__create-button"
              // 여기만 new Date() -> currentDate 로 교체
              onClick={() => onCreate(toLocalIso(currentDate), 9)}
            >
              <PlusIcon size={25} />
            </button>
          )}
        </div>

        {/* 요일 헤더 7칸 */}
        {weekDays.map((d, i) => (
          <div key={i} className="weekly-calendar__day-header">
            <div className="weekly-calendar__day-header-name">{d.dayName}</div>
            {/* 날짜 숫자, 오늘인 경우 강조 */}
            <div
              className={`weekly-calendar__day-header-date ${
                d.isToday ? "weekly-calendar__day-header-date--today" : ""
              }`}
            >
              {d.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* 시간 축, 날짜별 그리드 */}
      <div className="weekly-calendar__body">
        {/* 시간 */}
        <div className="weekly-calendar__time-column">
          {/* All Day */}
          <div className="weekly-calendar__time-slot">
            <span>종일</span>
          </div>
          {timeSlots.map((ts) => (
            <div key={ts.hour} className="weekly-calendar__time-slot">
              <span>{ts.label}</span>
            </div>
          ))}
        </div>

        {/* 이벤트가 표시될 날짜, 시간 그리드 */}
        <div className="weekly-calendar__days-grid" ref={gridRef}>
          {todayIdx >= 0 && cellHeight > 0 && (
            <>
              <div
                className="weekly-calendar__now-line"
                style={{
                  top: `${topOffset}px`,
                  left: `${(todayIdx / 7) * 100}%`,
                  width: `${100 / 7}%`,
                }}
              />
              <div
                className="weekly-calendar__now-dot"
                style={{
                  top: `${topOffset}px`,
                  left: `${(todayIdx / 7) * 100 + (100 / 7) * 0.015}%`,
                }}
              />
            </>
          )}

          {/* All-day */}
          {weekDays.map((d, colIdx) => {
            const evs = eventsFor(d.date, null);
            return (
              <div
                key={colIdx}
                className="weekly-calendar__cell"
                onClick={() => {
                  setSelEvent(null);
                  onCreate(d.iso, null);
                }}
              >
                {evs.map((ev, idx) => {
                  const width = 100 / evs.length;
                  const left = width * idx;
                  return (
                    <div
                      key={ev.id}
                      className={`weekly-calendar__event weekly-calendar__event--${ev.color}`}
                      style={{
                        top: 0,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: `${cellHeight}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelDateIso(d.iso);
                        setSelEvent(ev);
                      }}
                    >
                      <div className="weekly-calendar__event-title">
                        {ev.title}
                      </div>
                      <div className="weekly-calendar__event-time">
                        {`${ev.startDate
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${ev.startDate
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")} – ${ev.endDate
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${ev.endDate
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* 시간별 */}
          {timeSlots.flatMap((ts) =>
            weekDays.map((d, colIdx) => {
              const evs = eventsFor(d.date, ts.hour);
              return (
                <div
                  key={`${colIdx}-${ts.hour}`}
                  className="weekly-calendar__cell"
                  onClick={() => {
                    setSelEvent(null);
                    onCreate(d.iso, ts.hour);
                  }}
                >
                  {evs.map((ev, idx) => {
                    const startMin = ev.startDate.getMinutes();
                    const minuteOffset = (startMin / 60) * cellHeight;
                    const durationH =
                      (ev.endDate.getTime() - ev.startDate.getTime()) /
                      (1000 * 60 * 60);
                    // 실제 시간 길이만큼 높이를 계산
                    const height = durationH * cellHeight;
                    const width = 100 / evs.length;
                    const left = width * idx;
                    return (
                      <div
                        key={ev.id}
                        className={`weekly-calendar__event weekly-calendar__event--${ev.color}`}
                        style={{
                          position: "absolute",
                          top: `${minuteOffset}px`,
                          left: `${left}%`,
                          width: `${width}%`,
                          height: `${height}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelDateIso(d.iso);
                          setSelEvent(ev);
                        }}
                      >
                        <div className="weekly-calendar__event-title">
                          {ev.title}
                        </div>
                        <div className="weekly-calendar__event-time">
                          {`${ev.startDate
                            .getHours()
                            .toString()
                            .padStart(2, "0")}:${ev.startDate
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")} – ${ev.endDate
                            .getHours()
                            .toString()
                            .padStart(2, "0")}:${ev.endDate
                            .getMinutes()
                            .toString()
                            .padStart(2, "0")}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      {selEvent && (
        <EventDetailModal
          event={selEvent}
          dateIso={selDateIso}
          onClose={() => setSelEvent(null)}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}
