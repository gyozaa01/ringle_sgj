import "./_weekview.scss";

interface WeeklyCalendarProps {
  currentDate: Date; // 현재 보고 있는 날짜
}

export function WeekView({ currentDate }: WeeklyCalendarProps) {
  // 이번주 시작일인 일요일 구하기
  const getStartOfWeek = (date: Date) => {
    const result = new Date(date);

    // getDay()가 0(일)부터 6(토)까지 반환하므로
    // 오늘에서 요일만큼 빼면 해당 주의 일요일
    result.setDate(result.getDate() - result.getDay());
    return result;
  };

  // 요일 헤더 생성(일~토)
  const generateWeekDays = () =>
    Array.from({ length: 7 }).map((_, i) => {
      const weekStart = getStartOfWeek(currentDate);
      const date = new Date(weekStart);

      date.setDate(weekStart.getDate() + i);

      return {
        date,
        dayName: new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(
          date
        ),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(), // 오늘
      };
    });

  // 왼쪽 시간 축 생성(12am ~ 23pm)
  const generateTimeSlots = () =>
    Array.from({ length: 24 }).map((_, hour) => ({
      hour,
      label: `${hour === 0 ? "12" : hour > 12 ? hour - 12 : hour}${
        hour >= 12 ? "pm" : "am"
      }`,
    }));

  const weekDays = generateWeekDays();
  const timeSlots = generateTimeSlots();

  // 더미 이벤트
  const events = [
    {
      id: 1,
      title: "공부하기",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        10,
        0
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        11,
        30
      ),
      color: "weekly-calendar__event--yellow",
    },
    {
      id: 2,
      title: "점심 약속",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1,
        12,
        0
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1,
        13,
        30
      ),
      color: "weekly-calendar__event--green",
    },
    {
      id: 3,
      title: "회의 준비",
      start: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 2,
        14,
        0
      ),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 2,
        15,
        40
      ),
      color: "weekly-calendar__event--purple",
    },
  ];

  // 각 셀에 해당하는 이벤트 필터링
  const getEventsForCell = (day: number, hour: number) => {
    const cellDate = weekDays[day].date;

    return events.filter((e) => {
      return (
        e.start.getDate() === cellDate.getDate() &&
        e.start.getMonth() === cellDate.getMonth() &&
        e.start.getFullYear() === cellDate.getFullYear() &&
        e.start.getHours() === hour
      );
    });
  };

  return (
    <div className="weekly-calendar">
      {/* 헤더 */}
      <div className="weekly-calendar__header">
        <div className="weekly-calendar__time-placeholder" />
        <div className="weekly-calendar__days-header">
          {weekDays.map((d, idx) => (
            <div key={idx} className="weekly-calendar__day-header">
              {/* 요일 이름 */}
              <div className="weekly-calendar__day-header-name">
                {d.dayName}
              </div>
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
      </div>

      {/* 시간 축, 날짜별 그리드 */}
      <div className="weekly-calendar__body">
        {/* 시간 */}
        <div className="weekly-calendar__time-column">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="weekly-calendar__time-slot">
              <span>{slot.label}</span>
            </div>
          ))}
        </div>

        {/* 이벤트가 표시될 날짜, 시간 그리드 */}
        <div className="weekly-calendar__days-grid">
          {timeSlots.map((slot) =>
            weekDays.map((_, dayIdx) => (
              <div
                key={`${slot.hour}-${dayIdx}`}
                className="weekly-calendar__cell"
              >
                {/* 해당 셀의 이벤트들 */}
                {getEventsForCell(dayIdx, slot.hour).map((ev) => (
                  <div
                    key={ev.id}
                    className={`weekly-calendar__event ${ev.color}`}
                    style={{
                      // 이벤트 높이 계산
                      height: `${
                        (ev.end.getHours() -
                          ev.start.getHours() +
                          (ev.end.getMinutes() - ev.start.getMinutes()) / 60) *
                        56
                      }px`,
                    }}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
