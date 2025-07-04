import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { WeekView } from "@/components/WeekView/WeekView";
import { EventModal } from "@/components/EventModal/EventModal";
import { SearchResults } from "@/components/SearchResults/SearchResults";
import type { Event } from "@/store/eventsSlice";
import "./_calendar.scss";

// 로컬 날짜(YYYY-MM-DD) 반환
function getLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  // create 와 edit 모두 사용할 수 있도록 undefined 허용
  const [modalData, setModalData] = useState<Partial<Event> | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Redux store의 전체 이벤트
  const allEvents = useSelector((s: RootState) => s.events.items) as Event[];

  // WeekView에서 클릭된 dateIso(YYYY-MM-DD)와 hour(null=종일 또는 0~23)을 받아서
  // 모달을 원하는 시간대로 열어주는 함수
  function handleCreate(dateIso: string, hour: number | null) {
    const allDay = hour === null; // 종일 여부 결정
    const startTime = allDay ? "00:00" : `${String(hour).padStart(2, "0")}:00`; // 시작 시간 문자열
    // 종료 시간: 종일인 경우 -> 23:59 / 아니면 -> 시작시간 + 1시간
    const endHour = allDay ? 23 : hour! + 1;
    const endTime = allDay ? "23:59" : `${String(endHour).padStart(2, "0")}:00`;

    setModalData({
      start: `${dateIso}T${startTime}:00`,
      end: `${dateIso}T${endTime}:00`,
      allDay,
    });
    setModalOpen(true);
  }

  // 수정 모드
  function handleEdit(ev: Event) {
    setModalData(ev);
    setModalOpen(true);
  }

  // 모달 닫을 때 modalData까지 리셋
  function handleClose() {
    setModalOpen(false);
    setModalData(undefined);
  }

  return (
    <>
      {/* 이벤트 모달: 열림/닫힘, 초기 데이터 props로 전달 */}
      <EventModal
        isOpen={modalOpen}
        onClose={handleClose}
        initialData={modalData}
      />

      <div className="flex flex-col h-screen w-full bg-white">
        {/* 헤더: 날짜 표시 및 사이드바 토글 */}
        <Header
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          toggleSidebar={() => setShowSidebar((v) => !v)}
          onSearch={setSearchQuery}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 선택된 경우 사이드바 */}
          {showSidebar && (
            <aside className="w-64 flex-shrink-0 border-gray-200">
              <Sidebar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onCreate={() =>
                  // 로컬 기준의 currentDate로 항상 넘기기
                  handleCreate(getLocalIsoDate(currentDate), null)
                }
              />
            </aside>
          )}

          {/* 주간 뷰 */}
          <main className="flex-1 min-h-0 h-full">
            {searchQuery ? (
              <SearchResults
                events={allEvents}
                query={searchQuery}
                onSelectDate={(dateIso) => {
                  // 클릭한 날짜의 주로 이동
                  setCurrentDate(new Date(dateIso));
                  // 검색 모드 종료
                  setSearchQuery("");
                }}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                showSidebar={showSidebar}
                onCreate={handleCreate}
                onEdit={handleEdit}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
