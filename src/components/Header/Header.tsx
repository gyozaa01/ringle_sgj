import "./_header.scss";
import logo from "@/assets/logo.png";
import userAvatar from "@/assets/user.png";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";

interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  toggleSidebar: () => void;
}

export function Header({
  currentDate,
  setCurrentDate,
  toggleSidebar,
}: HeaderProps) {
  // 오늘 날짜로 이동
  const goToToday = () => setCurrentDate(new Date());

  // 1주 전으로 이동
  const goToPreviousWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  // 1주 후로 이동
  const goToNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // 헤더 표시 -> 년, 월
  const formatCurrentMonth = () =>
    new Intl.DateTimeFormat("ko-KR", { month: "long", year: "numeric" }).format(
      currentDate
    );

  return (
    <header className="header">
      {/* 메뉴 버튼 + 로고 */}
      <div className="header__logo">
        <button className="header__nav-button" onClick={toggleSidebar}>
          <MenuIcon size={20} />
        </button>
        <img src={logo} alt="Logo" className="header__logo-icon" />
        <span className="header__logo-text">Calendar</span>
      </div>

      {/* 중앙 내비게이션 버튼들 */}
      <div className="header__nav">
        <button onClick={goToToday} className="header__nav-button">
          오늘
        </button>
        <button onClick={goToPreviousWeek} className="header__nav-button">
          <ChevronLeftIcon size={20} />
        </button>
        <button onClick={goToNextWeek} className="header__nav-button">
          <ChevronRightIcon size={20} />
        </button>
        <span className="header__month">{formatCurrentMonth()}</span>
      </div>

      <div className="header__search">
        <input type="text" placeholder="Search" />
        <SearchIcon size={18} className="header__search-icon" />
      </div>

      {/* 사용자 로고 */}
      <div className="header__user">
        <img
          src={userAvatar}
          alt="User Avatar"
          className="header__user-avatar"
        />
      </div>
    </header>
  );
}
