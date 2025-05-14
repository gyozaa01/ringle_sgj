import { useRef, useState, useEffect } from "react";
import type { Event as CalendarEvent } from "@/store/eventsSlice";
import "./_searchresults.scss";

interface Props {
  events: CalendarEvent[];
  query: string;
  onSelectDate: (dateIso: string) => void; // 클릭 콜백
}

export function SearchResults({ events, query, onSelectDate }: Props) {
  // 1) 필터링 & 정렬
  const filtered = events.filter((ev) =>
    ev.title.toLowerCase().includes(query.toLowerCase())
  );
  const sorted = filtered.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // 2) 무한 스크롤용 상태
  const [visibleCount, setVisibleCount] = useState(20); // 처음 20개
  const containerRef = useRef<HTMLDivElement>(null);

  // 3) 스크롤 핸들러: 바닥 근처면 더 불러오기
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (
        el.scrollTop + el.clientHeight >=
        el.scrollHeight - 10 /* 바닥과 10px 이내 */
      ) {
        setVisibleCount((prev) => Math.min(prev + 20, sorted.length));
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [sorted.length]);

  // 4) 렌더링할 목록 슬라이스
  const displayList = sorted.slice(0, visibleCount);

  // 5) 결과 없을 때
  if (displayList.length === 0) {
    return <div className="search-results__none">검색 결과가 없습니다.</div>;
  }

  return (
    <div className="search-results" ref={containerRef}>
      {displayList.map((ev) => {
        const sd = new Date(ev.start);
        // 로컬 YYYY-MM-DD
        const iso = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(sd.getDate()).padStart(2, "0")}`;

        const optionsDate = {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "short",
        } as const;
        const optionsTime = { hour: "2-digit", minute: "2-digit" } as const;

        return (
          <div key={ev.id} className="search-results__item">
            <div
              className="search-results__date-circle"
              onClick={() => onSelectDate(iso)}
            >
              {sd.getDate()}
            </div>
            <div className="search-results__info">
              <div className="search-results__date">
                {sd.toLocaleDateString("ko-KR", optionsDate)}
              </div>
              <div className="search-results__time">
                {ev.allDay
                  ? "종일"
                  : `${sd.toLocaleTimeString(
                      "ko-KR",
                      optionsTime
                    )} – ${new Date(ev.end).toLocaleTimeString(
                      "ko-KR",
                      optionsTime
                    )}`}
              </div>
              <div className="search-results__title">{ev.title}</div>
            </div>
          </div>
        );
      })}

      {/* 더 불러올 항목이 있으면 로딩 중 */}
      {visibleCount < sorted.length && (
        <div className="search-results__loading">로딩 중...</div>
      )}
    </div>
  );
}
