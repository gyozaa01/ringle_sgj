import "./_header.scss";
import logo from "@/assets/logo.png";
import userAvatar from "@/assets/user.png";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  toggleSidebar: () => void;
  onSearch: (q: string) => void;
}

export function Header({
  currentDate,
  setCurrentDate,
  toggleSidebar,
  onSearch,
}: HeaderProps) {
  const [searchText, setSearchText] = useState("");

  // 검색 실행
  const handleSearch = () => {
    onSearch(searchText.trim());
  };

  // 홈으로 돌아가기 -> 검색 비우고 오늘 주간 뷰
  const handleHome = () => {
    setSearchText("");
    onSearch("");
    setCurrentDate(new Date());
  };

  // 오늘 주간 뷰로 이동 -> 검색 해제
  const handleToday = () => {
    setSearchText("");
    onSearch("");
    setCurrentDate(new Date());
  };

  // 1주 전으로 이동
  const goToPreviousWeek = () => {
    setSearchText("");
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  // 1주 후로 이동
  const goToNextWeek = () => {
    setSearchText("");
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // 헤더 표시 -> 년, 월
  const formatCurrentMonth = () =>
    new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      year: "numeric",
    }).format(currentDate);

  return (
    <header className="header">
      {/* 메뉴 버튼 + 로고 */}
      <div className="header__logo">
        <button className="header__nav-button" onClick={toggleSidebar}>
          <MenuIcon size={20} />
        </button>
        <img
          src={logo}
          alt="Logo"
          className="header__logo-icon"
          onClick={handleHome}
        />
        <span className="header__logo-text" onClick={handleHome}>
          Calendar
        </span>
      </div>

      {/* 중앙 내비게이션 버튼들 */}
      <div className="header__nav">
        <button onClick={handleToday} className="header__nav-button">
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
        <input
          type="text"
          placeholder="이벤트 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          type="button"
          className="header__search-button"
          onClick={handleSearch}
        >
          <SearchIcon size={18} />
        </button>
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
