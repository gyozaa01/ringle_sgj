import "./_sidebar.scss";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

interface SidebarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function Sidebar({ currentDate, setCurrentDate }: SidebarProps) {
  // 해당 월의 1일이 무슨 요일인지 파악해서 빈 cell 채우기
  const generateCalendarDays = () => {
    // 이번 달 1일이 가리키는 Date 객체
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const days = [];
    const firstDayOfMonth = date.getDay();

    // 1일이 시작되는 요일(0->일요일, 1->월요일 ...) 만큼 빈칸 추가!
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // 이번 달 총 일 수 계산
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    // 각 날짜 cell 생성
    for (let i = 1; i <= daysInMonth; i++) {
      // 오늘 날짜인지, 현재 선택된 날짜인지 체크
      const isCurrentDay =
        i === currentDate.getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      const isSelectedDay = i === currentDate.getDate();

      days.push(
        <div
          key={i}
          className={`sidebar__calendar-day ${
            isCurrentDay
              ? "sidebar__calendar-day--today" // 오늘
              : isSelectedDay
              ? "sidebar__calendar-day--selected" // 선택된 날짜
              : ""
          }`}
          onClick={() => {
            // 날짜 클릭 시 setCurrentDate로 상태 업데이트
            const newDate = new Date(currentDate);
            newDate.setDate(i);
            setCurrentDate(newDate);
          }}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  // 이전 달 이동
  const prevMonth = () => {
    const newDate = new Date(currentDate);

    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  // 다음 달 이동
  const nextMonth = () => {
    const newDate = new Date(currentDate);

    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  return (
    <aside className="sidebar">
      {/* 만들기 버튼 */}
      <button className="sidebar__create-button">
        <PlusIcon size={16} />
        만들기
      </button>

      {/* date-picker 달력 영역 */}
      <div className="sidebar__calendar">
        {/* 헤더 -> 년, 월, 이전/다음 버튼 */}
        <div className="sidebar__calendar-header">
          <span className="font-medium">
            {new Intl.DateTimeFormat("ko-KR", {
              month: "long",
              year: "numeric",
            }).format(currentDate)}
          </span>
          <div className="flex">
            <button onClick={prevMonth} className="header__nav-button">
              <ChevronLeftIcon size={16} />
            </button>
            <button onClick={nextMonth} className="header__nav-button">
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* 요일 표시 */}
        <div className="sidebar__calendar-grid">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="text-xs text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* 실제 날짜 그리드 */}
        <div className="sidebar__calendar-grid">{generateCalendarDays()}</div>
      </div>
    </aside>
  );
}
