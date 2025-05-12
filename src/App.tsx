import { useState } from "react";
import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { WeekView } from "@/components/WeekView/WeekView";
import "./_calendar.scss";

export function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar((v) => !v);

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <Header
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar currentDate={currentDate} setCurrentDate={setCurrentDate} />
        )}
        <WeekView
          currentDate={currentDate}
          showSidebar={showSidebar}
          toggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
}
