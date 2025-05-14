# 프론트엔드 사전과제(링글) - 서교진

## 프로젝트 실행 순서
1. 프로젝트를 클론합니다.
2. 프로젝트 디렉토리로 이동합니다.
3. npm을 사용하여 필요한 모든 의존성을 설치합니다.

## 배포 사이트
**배포 사이트**: [https://ringle-sgj.vercel.app/](https://ringle-sgj.vercel.app/)

## 개발 스택
- **TypeScript** : 정적 타입 검사로 코드 안전성 확보  
- **JavaScript** : 날짜 연산, 로직 구현을 위한 핵심 기능 활용  
- **React** : 컴포넌트 기반으로 구성  
- **Vite** : 빠른 개발 서버와 번들링 제공  
- **Redux Toolkit & React-Redux**: 전역 상태를 간결하게 관리  
- **Redux Persist & safeStorage** : 상태를 로컬 스토리지에 저장하고 용량 초과 시 알림  
- **Tailwind CSS** : 유틸리티 클래스 기반으로 빠르게 레이아웃 및 스타일 작성  
- **SCSS** : 복잡한 컴포넌트별 스타일 캡슐화  
- **react-modal** : 접근성 고려한 모달 창 구현  
- **uuid(v4)** : 각 이벤트에 고유 식별자(ID) 부여  
- **lucide-react** : 아이콘 디자인 일관성 유지  
- **Date API** : 브라우저 내장 API로 날짜 및 시간 파싱  
- **Git** : 프로젝트 버전 관리  
- **ESLint & Prettier** : 코드 품질 검증과 일관된 포맷 유지  
- **Vercel** : Github와 연동 자동 배포

## 프로젝트 구조 설명
```
src/
├─ assets/                        // 로고, 사용자 아바타 등 정적 이미지·폰트 파일
├─ components/                    // UI 구성 단위별 React 컴포넌트
│  ├─ EventModal/                 // 이벤트 생성·수정 관련 모달
│  │  ├─ _EventDetailModal.scss   // 상세 모달 스타일 정의
│  │  ├─ EventDetailModal.tsx     // 선택된 이벤트의 상세 정보 표시
│  │  └─ EventModal.tsx           // 새 이벤트 추가/수정 폼
│  ├─ Header/                     // 상단 내비게이션 바
│  │  ├─ _header.scss             // 헤더 컴포넌트 스타일
│  │  └─ Header.tsx               // 날짜 이동·검색 입력 UI
│  ├─ SearchResults/              // 이벤트 검색 결과 리스트
│  │  ├─ _searchresults.scss      // 검색 결과 스타일
│  │  └─ SearchResults.tsx        // 검색 결과 필터링·렌더링
│  ├─ Sidebar/                    // 달력 측면 사이드바
│  │  ├─ _sidebar.scss            // 사이드바 스타일
│  │  └─ Sidebar.tsx              // 월별 날짜 선택 UI
│  └─ WeekView/                   // 주간 캘린더 그리드
│     ├─ _weekview.scss           // 주간 뷰 스타일
│     └─ WeekView.tsx             // 시간별/종일 이벤트 그리드 렌더링
├─ store/                         // 전역 상태관리 (Redux)
│  ├─ eventsSlice.ts              // 이벤트 CRUD 로직 정의 (Redux Toolkit)
│  ├─ index.ts                    // store 구성 & redux-persist 설정
│  └─ safeStorage.ts              // 로컬스토리지 용량 초과 방지 래퍼
├─ styles/                        // 전역 SCSS 스타일
│  ├─ _variables.scss             // SCSS 변수(컬러, 폰트 등)
│  └─ _calendar.scss              // 캘린더 전반 레이아웃 스타일
├─ App.tsx                        // 애플리케이션 최상위 컴포넌트
├─ main.tsx                       // React 진입점, DOM 마운트
├─ index.scss                     // 전역 스타일 로드
├─ vite-env.d.ts                  // Vite 환경용 타입 정의
└─ .gitignore                     // Git 무시 파일 목록
```

## 서비스 화면

### ⓪ 로컬 스토리지(redux)
<table>
  <tr>
    <td align="center">
      <img width="450" alt="로컬스토리지(전)" src="https://github.com/user-attachments/assets/428e1790-a316-4975-a8db-a6542e5be960">
      <br><b>로컬스토리지(전)</b>
    </td>
        <td align="center">
      <img width="450" alt="로컬스토리지(후)" src="https://github.com/user-attachments/assets/1712f284-e1d4-467a-8e80-ba73cd480710">
      <br><b>로컬스토리지(후)</b>
    </td>
  </tr>
</table>


### 1. Redux Persist로 상태 자동 동기화
- `persistReducer(persistConfig, eventsReducer)`를 통해 events slice를 로컬 스토리지에 저장
- 앱 초기화 시 persistor가 자동으로 저장된 데이터를 복원

### 2. safeStorage 래퍼 적용
- 기본 `localStorage` 대신 사용하여 `setItem()` 중 용량 초과(`QuotaExceededError`) 감지
- 에러 발생 시 `alert("로컬 스토리지 용량이 부족합니다. 저장 공간을 확보해주세요.");` 호출하고, console.error 로깅 후 저장 중단

### 3. persistConfig 설정
```
const persistConfig = {
    key: "events",        // 루트 키
    storage: safeStorage, // 용량 초과 방지 래퍼
};
```

---

### ① 화면 구성
<table>
  <tr>
    <td align="center">
      <img width="900" alt="화면 구성" src="https://github.com/user-attachments/assets/c6416b01-b774-4cb2-a195-25a755643ad6">
      <br><b>화면 구성</b>
    </td>
  </tr>
</table>


### 1. 헤더
- 사이드바 토글, 로고, 주간 네비게이션(오늘/이전 주/다음 주) 버튼
- 검색 입력창, 사용자 아바타

### 2. 사이드바(달력)
- date-picker 월 단위 달력
- 만들기 버튼(이벤트 추가)
- 특정 날짜 선택 시 주간 뷰로 이동

### 3. 주간 달력
- 종일행과 시간별 슬롯으로 이루어진 7일간의 그리드 뷰
- 클릭으로 이벤트 생성/편집이 가능한 메인 캘린더 화면

---

### ② 사이드 바
<table>
  <tr>
    <td align="center">
      <img width="300" alt="사이드바 토글" src="https://github.com/user-attachments/assets/7625ae8b-a813-420d-8ce1-bfd42c5caf85">
      <br><b>사이드바 토글</b>
    </td>
        <td align="center">
      <img width="300" alt="date-picker 이동" src="https://github.com/user-attachments/assets/37fbdbce-083e-4830-a0d2-aa1d026cfaff">
      <br><b>date-picker 이동</b>
    </td>
    <td align="center">
      <img width="300" alt="만들기 버튼" src="https://github.com/user-attachments/assets/dd231f9a-5541-4303-8070-41fc07f63fa3">
      <br><b>만들기 버튼</b>
    </td>
  </tr>
</table>

### 1. 사이드바 토글
- 사이드바 토글 버튼을 클릭하면 사이드바를 숨기거나 다시 표시할 수 있습니다.

### 2. date-picker(달력)
- `currentDate`의 연·월 정보를 이용해 해당 월 1일의 요일(`getDay()`)과 총 일수(`new Date(year, month+1, 0).getDate()`)를 계산하여 날짜 배열을 생성합니다.  
- 시작 요일만큼 빈 셀(offset)을 추가하고, 이어서 실제 날짜 셀을 순서대로 렌더링해 월별 그리드를 구성합니다.  
- 날짜 셀 클릭 시 `setCurrentDate(newDate)`를 호출해 선택된 날짜를 상위 컴포넌트에 전달하고 주간 뷰로 전환합니다.  
- 이전/다음 월 버튼 클릭 시 `currentDate.setMonth(month ± 1)`로 월을 갱신해 달력을 이동시킵니다.

### 3. 만들기 버튼
- ‘만들기’ 버튼을 클릭하면 date-picker에서 선택한 날짜를 기준으로 이벤트 추가 모달이 열립니다.

---

### ③ 이벤트 추가 모달

<table>
  <tr>
    <td align="center">
      <img width="450" alt="이벤트 추가" src="https://github.com/user-attachments/assets/95c3f214-6714-45b2-a81f-4ca50e7b73d0">
      <br><b>이벤트 추가</b>
    </td>
    <td align="center">
      <img width="450" alt="에러 처리" src="https://github.com/user-attachments/assets/7a571029-5ef5-490f-bac2-9751f3f89132">
      <br><b>에러 처리</b>
    </td>
  </tr>
</table>


### 1. 기본 동작 
- ‘만들기’ 버튼 클릭 시 선택한 날짜를 기준으로 모달이 열리며, 기본값으로 ‘종일(allDay)’ 체크가 활성화됩니다.  

### 2. 주요 입력 필드
- 제목: 이벤트 이름
- 날짜: YYYY-MM-DD 형식
- 종일 여부: 체크 시 00:00–23:59:59 구간으로 자동 설정
- 시간 선택: 종일 해제 시 시작/종료 시간 활성화
- 반복 옵션
  - none: 반복 없음
  - weekly: 매주 선택한 요일 => 선택한 날짜 이후에만 반복 적용
  - yearly: 매년 선택한 월.일 => 선택한 날짜 이후에만 반복 적용
- 메모: 부가 설명(선택)
- 색상 선택: 여러 컬러 버튼 중 클릭

### 3. 에러 처리 및 검증
- 필수 항목 검사: 제목 또는 색상이 비어 있으면 저장 불가
  - "제목을 입력해주세요."
  - "색상을 선택해주세요."
- 시간 유효성 검사: 종일 해제 상태에서 'startTime >= endTime'이면
  - "시작 시간은 종료 시간보다 빨라야 합니다."
- 저장 시 동작
  - allDay 이벤트: 주간 뷰의 종일 행에 렌더링
  - 시간 지정 이벤트: 해당 시간 슬롯에 반영 후 렌더링

---

### ④ 이벤트 반복 및 중첩
<table>
  <tr>
    <td align="center">
      <img width="450" alt="이벤트 반복" src="https://github.com/user-attachments/assets/c877a0f9-5aac-4ed4-a82e-7b1ce9a333ef">
      <br><b>이벤트 반복</b>
    </td>
    <td align="center">
      <img width="450" alt="이벤트 중첩" src="https://github.com/user-attachments/assets/5027f3b9-779d-4841-8f22-777685d35c95">
      <br><b>이벤트 중첩</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="900" alt="이벤트 반복 삭제" src="https://github.com/user-attachments/assets/5b551966-34cc-4a12-8294-417d40a841ff">
      <br><b>이벤트 반복 삭제</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="900" alt="이벤트 중첩" src="https://github.com/user-attachments/assets/eda149b4-7642-4c34-8761-6f47c5d9bfec">
      <br><b>이벤트 중첩</b>
    </td>
  </tr>
</table>

### 1. 이벤트 반복
- 반복 유형 처리
  - `repeat.type === "weekly"`:  
    - `options.days`(요일 배열) 중 `cellDate.getDay()`와 일치  
    - `isSameOrAfterDate(cellDate, ev.startDate)`로 시작일 이후만 발생  
  - `repeat.type === "yearly"`:  
    - `startDate.getMonth()`·`startDate.getDate()`가 `cellDate`와 모두 일치  
    - `isSameOrAfterDate(cellDate, ev.startDate)`로 시작일 이후만 발생  
- 예외 날짜 처리:
  - `deleteOccurrence({ id, dateIso })` 호출 시 `ev.repeat.options.exceptions` 배열에 해당 날짜 추가  
  - `eventsFor()` 내 `if (exceptions.includes(toLocalIso(cellDate))) return false;`로 예외 건너뜀  
- 반복 삭제 분기
  - 전체 삭제: `dispatch(deleteEvent(id))`  
  - 개별 삭제: `dispatch(deleteOccurrence({ id, dateIso }))`  

### 2. 이벤트 중첩
- 동일 셀의 다중 이벤트
  - `eventsFor(cellDate, hour)`로 해당 슬롯의 이벤트 배열 구함  
  - 각 이벤트에 대해  
    ```
    const width = 100 / evs.length;
    const left  = width * idx;
    ```
    스타일 적용 (width: ${width}%, left: ${left}%)  
  - `position: absolute`로 배치하여 수평으로 균등 분할된 중첩 레이아웃 구현

---

### ⑤ 주간 달력

<table>
  <tr>
    <td align="center">
      <img width="450" alt="이벤트 추가" src="https://github.com/user-attachments/assets/312af13a-14de-4f32-bc79-b6035aad788d">
      <br><b>이벤트 추가</b>
    </td>
    <td align="center">
      <img width="450" alt="현재 시간" src="https://github.com/user-attachments/assets/a15d2c76-26f9-406d-85af-72891cfe2437">
      <br><b>현재 시간</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="300" alt="상세 모달" src="https://github.com/user-attachments/assets/f7361e49-c178-40fb-8a06-8b10370338b9">
      <br><b>상세 모달</b>
    </td>
    <td align="center">
      <img width="300" alt="이벤트 수정" src="https://github.com/user-attachments/assets/3dcfc212-607a-44c3-a4dd-2faa8795c953">
      <br><b>이벤트 수정</b>
    </td>
    <td align="center">
      <img width="300" alt="이벤트 삭제" src="https://github.com/user-attachments/assets/2890293f-0e14-4630-90f9-53390233b38d">
      <br><b>이벤트 삭제</b>
    </td>
  </tr>
</table>


### 1. 주간 달력 -> 이벤트 추가
- 각 셀 클릭 시 `onCreate(dateIso, hour)`를 호출해 모달 열기
- `hour === null`인 경우 ‘종일’ 이벤트, 그렇지 않으면 해당 시간 슬롯 기준으로 시작·종료 시간 자동 설정

### 2. 현재 시간 표시
- 빨간색 선으로 현재 시간을 표시합니다.

### 3. 상세 모달
- 이벤트 블록 클릭 시 `setSelEvent(ev)` & `setSelDateIso(d.iso)`를 호출해 `EventDetailModal` 렌더링
- 모달 내부의 수정 버튼 -> `updateEvent` 액션 디스패치
- 삭제 버튼 -> 반복 이벤트일 땐 `deleteOccurrence`, 아닐 땐 `deleteEvent` 액션 디스패치  

---

### ⑥ 헤더

<table>
  <tr>
    <td align="center">
      <img width="450" alt="네비게이션 이동" src="https://github.com/user-attachments/assets/5a8cf07a-1c5f-4d47-8f3b-fab0dc929db2">
      <br><b>네비게이션 이동</b>
    </td>
    <td align="center">
      <img width="450" alt="검색" src="https://github.com/user-attachments/assets/f34c1fe6-d86d-4c7c-afe2-baf9a2f00efc">
      <br><b>검색</b>
    </td>
  </tr>
</table>

### 1. 네비게이션 이동
- 오늘 & 로고 클릭: 오늘 날짜로 리셋
- 이전/다음 주: currentDate를 기준으로 플러스/마이너스 7일 이동
- 월 표시: `Intl.DateTimeFormat("ko-KR")` 사용

### 2. 검색
- Enter/버튼: 검색어를 `query` 상태에 설정
- 필터링: 제목 기준으로 필터 + 시작 시간 순 정렬
- 결과 클릭: 날짜 클릭 시 해당 주간 뷰로 전환
