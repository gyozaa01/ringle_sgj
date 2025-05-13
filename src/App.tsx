import { useState } from "react";
import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { WeekView } from "@/components/WeekView/WeekView";
import { EventModal } from "@/components/EventModal/EventModal";
import type { Event } from "@/store/eventsSlice";
import "./_calendar.scss";

export function App() {
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 선택된 날짜
  const [showSidebar, setShowSidebar] = useState(true); // 사이드바 보임/숨김
  const [modalOpen, setModalOpen] = useState(false); // 이벤트 모달 열림/닫힘
  // 모달에 전달할 초기 이벤트 데이터(start, end, allDay)
  const [modalData, setModalData] = useState<Partial<Event>>({});

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

  return (
    <>
      {/* 이벤트 모달: 열림/닫힘, 초기 데이터 props로 전달 */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={modalData as Event}
      />

      <div className="flex flex-col h-screen w-full bg-white">
        {/* 헤더: 날짜 표시 및 사이드바 토글 */}
        <Header
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          toggleSidebar={() => setShowSidebar((v) => !v)}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 선택된 경우 사이드바 */}
          {showSidebar && (
            <aside className="w-64 flex-shrink-0 border-gray-200">
              <Sidebar
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onCreate={() =>
                  // 사이드바에서 클릭한 만들기 버튼 -> 오늘 날짜, 종일을 디폴트로
                  handleCreate(new Date().toISOString().slice(0, 10), null)
                }
              />
            </aside>
          )}

          {/* 주간 달력 뷰 */}
          <main className="flex-1 min-h-0 h-full">
            <WeekView
              currentDate={currentDate}
              showSidebar={showSidebar}
              onCreate={handleCreate}
            />
          </main>
        </div>
      </div>
    </>
  );
}
