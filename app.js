/* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   VERSION 3.0

   PART 1 / 4

   - 앱 시작
   - DOM 연결
   - 페이지 전환
   - 모바일 메뉴
   - 시계
   - Toast
   - LocalStorage
   - 기본 상태 관리
========================================================= */

"use strict";


/* =========================================================
   01. CONFIG
========================================================= */

const APP_CONFIG = {

  name: "설천고 PE PERFORMANCE LAB",

  version: "3.0",

  storage: {
    athletes: "sc_pe_athletes_v3",
    analyses: "sc_pe_analyses_v3",
    settings: "sc_pe_settings_v3"
  }

};


/* =========================================================
   02. APP STATE
========================================================= */

const AppState = {

  currentPage: "dashboard",

  athletes: [],

  analyses: [],

  settings: {
    skeleton: true,
    angle: true,
    trajectory: true,
    centerOfMass: true
  },

  selectedEventId: "",

  selectedAthleteId: "",

  videoFile: null,

  videoURL: "",

  analyzing: false,

  analysisTimer: null,

  analysisStartTime: 0,

  analysisFrames: [],

  keyFrames: [],

  trajectory: [],

  latestPose: null,

  currentAnalysis: null,

  currentReport: null,

  charts: {
    angle: null,
    radar: null,
    reportAngle: null
  }

};


/* =========================================================
   03. DOM HELPER
========================================================= */

function $(id) {

  return document.getElementById(id);

}


function $all(selector) {

  return Array.from(
    document.querySelectorAll(selector)
  );

}


/* =========================================================
   04. SAFE STORAGE
========================================================= */

function readStorage(key, fallback) {

  try {

    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);

  } catch (error) {

    console.error(
      "[STORAGE READ ERROR]",
      key,
      error
    );

    return fallback;

  }

}


function writeStorage(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.error(
      "[STORAGE WRITE ERROR]",
      key,
      error
    );

    return false;

  }

}


/* =========================================================
   05. LOAD DATA
========================================================= */

function loadAppData() {

  AppState.athletes =
    readStorage(
      APP_CONFIG.storage.athletes,
      []
    );

  AppState.analyses =
    readStorage(
      APP_CONFIG.storage.analyses,
      []
    );

  const savedSettings =
    readStorage(
      APP_CONFIG.storage.settings,
      null
    );

  if (savedSettings) {

    AppState.settings = {
      ...AppState.settings,
      ...savedSettings
    };

  }

}


/* =========================================================
   06. SAVE DATA
========================================================= */

function saveAthletes() {

  writeStorage(
    APP_CONFIG.storage.athletes,
    AppState.athletes
  );

}


function saveAnalyses() {

  writeStorage(
    APP_CONFIG.storage.analyses,
    AppState.analyses
  );

}


function saveSettings() {

  writeStorage(
    APP_CONFIG.storage.settings,
    AppState.settings
  );

}


/* =========================================================
   07. TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast = $("toast");

  if (!toast) {

    console.log(
      "[TOAST]",
      message
    );

    return;

  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(function () {

      toast.classList.remove("show");

    }, 2200);

}


/* =========================================================
   08. PAGE TITLE MAP
========================================================= */

const PAGE_TITLES = {

  dashboard:
    "대시보드",

  athletes:
    "선수 관리",

  events:
    "체대입시",

  analysis:
    "영상 자세분석",

  records:
    "분석 기록",

  report:
    "리포트",

  settings:
    "설정"

};


/* =========================================================
   09. PAGE NAVIGATION
========================================================= */

function navigateTo(pageName) {

  console.log(
    "[NAVIGATE]",
    pageName
  );


  const targetPage =
    document.querySelector(
      '[data-page-section="' +
      pageName +
      '"]'
    );


  if (!targetPage) {

    console.error(
      "페이지를 찾을 수 없음:",
      pageName
    );

    showToast(
      "페이지 연결 오류: " +
      pageName
    );

    return;

  }


  /*
     모든 페이지 숨김
  */

  $all("[data-page-section]")
    .forEach(function (page) {

      page.classList.remove(
        "active"
      );

    });


  /*
     선택 페이지 표시
  */

  targetPage.classList.add(
    "active"
  );


  /*
     네비게이션 버튼 active 변경
  */

  $all("[data-page]")
    .forEach(function (button) {

      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );

    });


  /*
     제목 변경
  */

  const title =
    $("pageTitle");

  if (title) {

    title.textContent =
      PAGE_TITLES[pageName] ||
      pageName;

  }


  AppState.currentPage =
    pageName;


  /*
     페이지별 갱신
  */

  if (pageName === "dashboard") {

    renderDashboard();

  }


  if (pageName === "athletes") {

    renderAthletes();

  }


  if (pageName === "events") {

    renderEventPage();

  }


  if (pageName === "analysis") {

    refreshAnalysisSelectors();

  }


  if (pageName === "records") {

    renderRecords();

  }


  if (pageName === "report") {

    renderReport();

  }


  if (pageName === "settings") {

    renderSettings();

  }


  closeSidebar();


  /*
     페이지 위로 이동
  */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   10. NAVIGATION EVENT
========================================================= */

function setupNavigation() {

  /*
     data-page가 붙은 모든 버튼 자동 연결
  */

  document.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          "[data-page]"
        );

      if (!button) {
        return;
      }


      const pageName =
        button.dataset.page;


      if (!pageName) {
        return;
      }


      event.preventDefault();


      navigateTo(
        pageName
      );

    }
  );


  console.log(
    "[NAVIGATION READY]"
  );

}


/* =========================================================
   11. MOBILE SIDEBAR
========================================================= */

function openSidebar() {

  const sidebar =
    $("sidebar");

  const overlay =
    $("sidebarOverlay");


  if (sidebar) {

    sidebar.classList.add(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.add(
      "active"
    );

  }

}


function closeSidebar() {

  const sidebar =
    $("sidebar");

  const overlay =
    $("sidebarOverlay");


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }

}


function setupMobileSidebar() {

  const menuButton =
    $("mobileMenuButton");

  const overlay =
    $("sidebarOverlay");


  if (menuButton) {

    menuButton.addEventListener(
      "click",
      openSidebar
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeSidebar
    );

  }

}


/* =========================================================
   12. CLOCK
========================================================= */

function updateClock() {

  const clock =
    $("clock");

  if (!clock) {
    return;
  }


  const now =
    new Date();


  clock.textContent =
    now.toLocaleTimeString(
      "ko-KR",
      {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );

}


function startClock() {

  updateClock();

  setInterval(
    updateClock,
    1000
  );

}


/* =========================================================
   13. UNIQUE ID
========================================================= */

function createId(prefix) {

  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}


/* =========================================================
   14. NUMBER HELPER
========================================================= */

function clamp(
  value,
  min = 0,
  max = 100
) {

  const number =
    Number(value) || 0;

  return Math.max(
    min,
    Math.min(
      max,
      number
    )
  );

}


function average(values) {

  const valid =
    values
      .map(Number)
      .filter(function (value) {

        return Number.isFinite(
          value
        );

      });


  if (!valid.length) {
    return 0;
  }


  return (
    valid.reduce(
      function (sum, value) {

        return sum + value;

      },
      0
    ) /
    valid.length
  );

}


/* =========================================================
   15. FORMAT TIME
========================================================= */

function formatVideoTime(seconds) {

  if (
    !Number.isFinite(seconds)
  ) {

    return "00:00.00";

  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  const remain =
    seconds -
    minutes * 60;


  return (
    String(minutes)
      .padStart(2, "0") +
    ":" +
    remain
      .toFixed(2)
      .padStart(5, "0")
  );

}


/* =========================================================
   16. DATE FORMAT
========================================================= */

function formatDateTime(dateValue) {

  const date =
    dateValue
      ? new Date(dateValue)
      : new Date();


  return date.toLocaleString(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


/* =========================================================
   17. BOOT STATUS
========================================================= */

function setBootStatus(
  message,
  success = false
) {

  const boot =
    $("bootStatus");

  if (!boot) {
    return;
  }


  boot.textContent =
    message;


  if (success) {

    setTimeout(function () {

      boot.classList.add(
        "hidden"
      );

    }, 400);

  }

}


/* =========================================================
   18. APP BOOT
========================================================= */

function bootApplication() {

  try {

    console.log(
      "=================================="
    );

    console.log(
      APP_CONFIG.name
    );

    console.log(
      "VERSION",
      APP_CONFIG.version
    );

    console.log(
      "=================================="
    );


    setBootStatus(
      "SYSTEM INITIALIZING..."
    );


    /*
       저장 데이터
    */

    loadAppData();


    /*
       기본 UI
    */

    setupNavigation();

    setupMobileSidebar();

    startClock();


    /*
       다음 PART에서 만드는 기능들
    */

    if (
      typeof setupDashboard ===
      "function"
    ) {

      setupDashboard();

    }


    if (
      typeof setupAthletes ===
      "function"
    ) {

      setupAthletes();

    }


    if (
      typeof setupEvents ===
      "function"
    ) {

      setupEvents();

    }


    if (
      typeof setupVideoAnalysis ===
      "function"
    ) {

      setupVideoAnalysis();

    }


    if (
      typeof setupRecords ===
      "function"
    ) {

      setupRecords();

    }


    if (
      typeof setupReport ===
      "function"
    ) {

      setupReport();

    }


    if (
      typeof setupSettings ===
      "function"
    ) {

      setupSettings();

    }


    /*
       최초 페이지
    */

    navigateTo(
      "dashboard"
    );


    /*
       버전
    */

    const version =
      $("appVersion");

    if (version) {

      version.textContent =
        APP_CONFIG.version;

    }


    const sidebarVersion =
      $("sidebarVersion");

    if (sidebarVersion) {

      sidebarVersion.textContent =
        "PERFORMANCE SYSTEM v" +
        APP_CONFIG.version;

    }


    setBootStatus(
      "SYSTEM READY",
      true
    );


    console.log(
      "[APP READY]"
    );

  } catch (error) {

    console.error(
      "[BOOT ERROR]",
      error
    );


    setBootStatus(
      "SYSTEM ERROR"
    );


    alert(
      "앱 시작 중 오류가 발생했습니다.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   19. DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  bootApplication
);
/* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   VERSION 3.0

   PART 2 / 4

   - Dashboard
   - Athlete Management
   - PE Events
   - Event Search / Category
   - Event → Video Analysis
========================================================= */


/* =========================================================
   20. DASHBOARD SETUP
========================================================= */

function setupDashboard() {

  const startButton =
    $("dashboardStartAnalysisButton");


  if (startButton) {

    startButton.addEventListener(
      "click",
      function () {

        navigateTo("analysis");

      }
    );

  }


  renderDashboard();

}


/* =========================================================
   21. DASHBOARD RENDER
========================================================= */

function renderDashboard() {

  const athleteCount =
    AppState.athletes.length;


  const analysisCount =
    AppState.analyses.length;


  const scores =
    AppState.analyses
      .map(function (analysis) {

        return Number(
          analysis.score
        );

      })
      .filter(function (score) {

        return Number.isFinite(
          score
        );

      });


  const averageScore =
    scores.length
      ? Math.round(
          average(scores)
        )
      : null;


  /*
     최근 7일 분석
  */

  const sevenDaysAgo =
    Date.now() -
    7 *
    24 *
    60 *
    60 *
    1000;


  const recentAnalyses =
    AppState.analyses.filter(
      function (analysis) {

        const date =
          new Date(
            analysis.createdAt
          ).getTime();

        return (
          Number.isFinite(date) &&
          date >= sevenDaysAgo
        );

      }
    );


  setText(
    "dashboardAthleteCount",
    athleteCount
  );


  setText(
    "dashboardAnalysisCount",
    analysisCount
  );


  setText(
    "dashboardAverageScore",
    averageScore === null
      ? "--"
      : averageScore
  );


  setText(
    "dashboardRecentCount",
    recentAnalyses.length
  );


  renderDashboardPerformance();

  renderDashboardRecent();

}


/* =========================================================
   22. TEXT HELPER
========================================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);


  if (!element) {
    return;
  }


  element.textContent =
    value;

}


/* =========================================================
   23. DASHBOARD PERFORMANCE
========================================================= */

function renderDashboardPerformance() {

  const latest =
    AppState.analyses[0];


  if (!latest) {

    setPerformanceBar(
      "dashboardStabilityBar",
      "dashboardStabilityValue",
      0,
      "--"
    );


    setPerformanceBar(
      "dashboardSymmetryBar",
      "dashboardSymmetryValue",
      0,
      "--"
    );


    setPerformanceBar(
      "dashboardTechniqueBar",
      "dashboardTechniqueValue",
      0,
      "--"
    );


    setPerformanceBar(
      "dashboardPowerBar",
      "dashboardPowerValue",
      0,
      "--"
    );


    return;

  }


  const metrics =
    latest.metrics || {};


  setPerformanceBar(
    "dashboardStabilityBar",
    "dashboardStabilityValue",
    metrics.stability,
    Math.round(
      metrics.stability || 0
    )
  );


  setPerformanceBar(
    "dashboardSymmetryBar",
    "dashboardSymmetryValue",
    metrics.symmetry,
    Math.round(
      metrics.symmetry || 0
    )
  );


  setPerformanceBar(
    "dashboardTechniqueBar",
    "dashboardTechniqueValue",
    metrics.technique,
    Math.round(
      metrics.technique || 0
    )
  );


  setPerformanceBar(
    "dashboardPowerBar",
    "dashboardPowerValue",
    metrics.power,
    Math.round(
      metrics.power || 0
    )
  );

}


/* =========================================================
   24. PERFORMANCE BAR
========================================================= */

function setPerformanceBar(
  barId,
  valueId,
  value,
  displayValue
) {

  const bar =
    $(barId);


  const valueElement =
    $(valueId);


  const percent =
    clamp(
      value || 0
    );


  if (bar) {

    bar.style.width =
      percent + "%";

  }


  if (valueElement) {

    valueElement.textContent =
      displayValue;

  }

}


/* =========================================================
   25. DASHBOARD RECENT
========================================================= */

function renderDashboardRecent() {

  const container =
    $("dashboardRecentList");


  if (!container) {
    return;
  }


  const records =
    AppState.analyses
      .slice(0, 5);


  if (!records.length) {

    container.innerHTML =
      '<div class="empty-state">' +
      "아직 분석 기록이 없습니다." +
      "</div>";

    return;

  }


  container.innerHTML =
    records
      .map(function (analysis) {

        const athlete =
          getAthleteById(
            analysis.athleteId
          );


        const event =
          getPEEventSafe(
            analysis.eventId
          );


        return `
          <div class="recent-card">

            <strong>
              ${
                athlete
                  ? escapeHTML(
                      athlete.name
                    )
                  : "선수 미지정"
              }
            </strong>

            <p>
              ${
                event
                  ? escapeHTML(
                      event.name
                    )
                  : "종목 미지정"
              }
              ·
              ${Math.round(
                analysis.score || 0
              )}점
            </p>

            <p>
              ${escapeHTML(
                formatDateTime(
                  analysis.createdAt
                )
              )}
            </p>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   26. ATHLETE SETUP
========================================================= */

function setupAthletes() {

  const form =
    $("athleteForm");


  if (form) {

    form.addEventListener(
      "submit",
      handleAthleteSubmit
    );

  }


  const list =
    $("athleteList");


  if (list) {

    list.addEventListener(
      "click",
      handleAthleteListClick
    );

  }


  renderAthletes();

}


/* =========================================================
   27. ATHLETE SUBMIT
========================================================= */

function handleAthleteSubmit(event) {

  event.preventDefault();


  const name =
    $("athleteNameInput")
      ?.value
      .trim();


  if (!name) {

    showToast(
      "선수 이름을 입력해 주세요."
    );

    return;

  }


  const athlete = {

    id:
      createId("athlete"),

    name:
      name,

    grade:
      $("athleteGradeInput")
        ?.value || "",

    gender:
      $("athleteGenderInput")
        ?.value || "",

    height:
      Number(
        $("athleteHeightInput")
          ?.value
      ) || null,

    weight:
      Number(
        $("athleteWeightInput")
          ?.value
      ) || null,

    sport:
      $("athleteSportInput")
        ?.value
        .trim() || "",

    memo:
      $("athleteMemoInput")
        ?.value
        .trim() || "",

    createdAt:
      new Date()
        .toISOString()

  };


  AppState.athletes.push(
    athlete
  );


  saveAthletes();


  event.target.reset();


  renderAthletes();

  refreshAnalysisSelectors();

  renderDashboard();


  showToast(
    athlete.name +
    " 선수를 저장했습니다."
  );

}


/* =========================================================
   28. ATHLETE RENDER
========================================================= */

function renderAthletes() {

  const container =
    $("athleteList");


  const badge =
    $("athleteCountBadge");


  if (badge) {

    badge.textContent =
      AppState.athletes.length;

  }


  if (!container) {
    return;
  }


  if (!AppState.athletes.length) {

    container.innerHTML =
      '<div class="empty-state">' +
      "등록된 선수가 없습니다." +
      "</div>";

    return;

  }


  container.innerHTML =
    AppState.athletes
      .map(function (athlete) {

        const info = [
          athlete.grade,
          athlete.gender,
          athlete.sport
        ]
          .filter(Boolean)
          .join(" · ");


        return `
          <div
            class="athlete-card"
            data-athlete-id="${escapeHTML(
              athlete.id
            )}"
          >

            <div class="athlete-card-info">

              <strong>
                ${escapeHTML(
                  athlete.name
                )}
              </strong>

              <span>
                ${
                  escapeHTML(info) ||
                  "정보 없음"
                }
              </span>

            </div>


            <div class="athlete-card-actions">

              <button
                type="button"
                class="mini-button"
                data-athlete-action="analysis"
                data-athlete-id="${escapeHTML(
                  athlete.id
                )}"
              >
                분석
              </button>


              <button
                type="button"
                class="mini-button"
                data-athlete-action="records"
                data-athlete-id="${escapeHTML(
                  athlete.id
                )}"
              >
                기록
              </button>


              <button
                type="button"
                class="mini-button"
                data-athlete-action="delete"
                data-athlete-id="${escapeHTML(
                  athlete.id
                )}"
              >
                삭제
              </button>

            </div>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   29. ATHLETE CARD ACTION
========================================================= */

function handleAthleteListClick(event) {

  const button =
    event.target.closest(
      "[data-athlete-action]"
    );


  if (!button) {
    return;
  }


  const athleteId =
    button.dataset.athleteId;


  const action =
    button.dataset.athleteAction;


  if (!athleteId) {
    return;
  }


  if (action === "analysis") {

    AppState.selectedAthleteId =
      athleteId;


    navigateTo(
      "analysis"
    );


    setTimeout(function () {

      const select =
        $("analysisAthleteSelect");


      if (select) {

        select.value =
          athleteId;

      }

    }, 0);


    return;

  }


  if (action === "records") {

    navigateTo(
      "records"
    );


    setTimeout(function () {

      const filter =
        $("recordAthleteFilter");


      if (filter) {

        filter.value =
          athleteId;


        renderRecords();

      }

    }, 0);


    return;

  }


  if (action === "delete") {

    deleteAthlete(
      athleteId
    );

  }

}


/* =========================================================
   30. DELETE ATHLETE
========================================================= */

function deleteAthlete(athleteId) {

  const athlete =
    getAthleteById(
      athleteId
    );


  if (!athlete) {
    return;
  }


  const confirmed =
    confirm(
      athlete.name +
      " 선수를 삭제할까요?"
    );


  if (!confirmed) {
    return;
  }


  AppState.athletes =
    AppState.athletes.filter(
      function (item) {

        return (
          item.id !== athleteId
        );

      }
    );


  saveAthletes();


  renderAthletes();

  refreshAnalysisSelectors();

  renderDashboard();


  showToast(
    "선수를 삭제했습니다."
  );

}


/* =========================================================
   31. GET ATHLETE
========================================================= */

function getAthleteById(athleteId) {

  return (
    AppState.athletes.find(
      function (athlete) {

        return (
          athlete.id === athleteId
        );

      }
    ) || null
  );

}


/* =========================================================
   32. SAFE EVENT GETTER
========================================================= */

function getPEEventSafe(eventId) {

  if (
    typeof window.getPEEventById ===
    "function"
  ) {

    return window.getPEEventById(
      eventId
    );

  }


  if (
    Array.isArray(
      window.PE_EVENTS
    )
  ) {

    return (
      window.PE_EVENTS.find(
        function (event) {

          return (
            event.id === eventId
          );

        }
      ) || null
    );

  }


  return null;

}


/* =========================================================
   33. ANALYSIS SELECT OPTIONS
========================================================= */

function refreshAnalysisSelectors() {

  const athleteSelect =
    $("analysisAthleteSelect");


  const eventSelect =
    $("analysisEventSelect");


  /*
     선수
  */

  if (athleteSelect) {

    const current =
      athleteSelect.value ||
      AppState.selectedAthleteId;


    athleteSelect.innerHTML =
      '<option value="">' +
      "선수 선택" +
      "</option>" +

      AppState.athletes
        .map(function (athlete) {

          return `
            <option value="${escapeHTML(
              athlete.id
            )}">
              ${escapeHTML(
                athlete.name
              )}
            </option>
          `;

        })
        .join("");


    if (
      current &&
      AppState.athletes.some(
        function (athlete) {

          return (
            athlete.id === current
          );

        }
      )
    ) {

      athleteSelect.value =
        current;

    }

  }


  /*
     종목
  */

  if (eventSelect) {

    const current =
      eventSelect.value ||
      AppState.selectedEventId;


    const events =
      Array.isArray(
        window.PE_EVENTS
      )
        ? window.PE_EVENTS
        : [];


    eventSelect.innerHTML =
      '<option value="">' +
      "종목 선택" +
      "</option>" +

      events
        .map(function (event) {

          return `
            <option value="${escapeHTML(
              event.id
            )}">
              ${escapeHTML(
                event.name
              )}
            </option>
          `;

        })
        .join("");


    if (
      current &&
      events.some(
        function (event) {

          return (
            event.id === current
          );

        }
      )
    ) {

      eventSelect.value =
        current;

    }

  }


  updateAnalysisEventTitle();

}


/* =========================================================
   34. ANALYSIS EVENT TITLE
========================================================= */

function updateAnalysisEventTitle() {

  const select =
    $("analysisEventSelect");


  const title =
    $("analysisEventTitle");


  if (!title) {
    return;
  }


  const eventId =
    select?.value ||
    AppState.selectedEventId;


  const event =
    getPEEventSafe(
      eventId
    );


  title.textContent =
    event
      ? event.name + " 분석 영상"
      : "분석 영상";

}


/* =========================================================
   35. EVENT STATE
========================================================= */

let currentEventCategory =
  "all";


let currentEventSearch =
  "";


/* =========================================================
   36. EVENT SETUP
========================================================= */

function setupEvents() {

  const categoryContainer =
    $("eventCategoryButtons");


  const searchInput =
    $("eventSearchInput");


  const eventGrid =
    $("eventGrid");


  if (categoryContainer) {

    categoryContainer.addEventListener(
      "click",
      function (event) {

        const button =
          event.target.closest(
            "[data-event-category]"
          );


        if (!button) {
          return;
        }


        currentEventCategory =
          button.dataset
            .eventCategory ||
          "all";


        renderEventPage();

      }
    );

  }


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      function () {

        currentEventSearch =
          searchInput.value
            .trim()
            .toLowerCase();


        renderEventGrid();

      }
    );

  }


  if (eventGrid) {

    eventGrid.addEventListener(
      "click",
      function (event) {

        const card =
          event.target.closest(
            "[data-event-id]"
          );


        if (!card) {
          return;
        }


        const eventId =
          card.dataset.eventId;


        selectPEEvent(
          eventId
        );

      }
    );

  }


  renderEventPage();

}


/* =========================================================
   37. EVENT PAGE
========================================================= */

function renderEventPage() {

  renderEventCategories();

  renderEventGrid();

}


/* =========================================================
   38. EVENT CATEGORIES
========================================================= */

function renderEventCategories() {

  const container =
    $("eventCategoryButtons");


  if (!container) {
    return;
  }


  const categories =
    Array.isArray(
      window.PE_EVENT_CATEGORIES
    )
      ? window.PE_EVENT_CATEGORIES
      : [];


  container.innerHTML =
    categories
      .map(function (category) {

        const active =
          category.id ===
          currentEventCategory;


        return `
          <button
            type="button"
            class="category-button ${
              active
                ? "active"
                : ""
            }"
            data-event-category="${escapeHTML(
              category.id
            )}"
          >
            ${escapeHTML(
              category.name
            )}
          </button>
        `;

      })
      .join("");

}


/* =========================================================
   39. EVENT GRID
========================================================= */

function renderEventGrid() {

  const container =
    $("eventGrid");


  if (!container) {
    return;
  }


  let events =
    Array.isArray(
      window.PE_EVENTS
    )
      ? [...window.PE_EVENTS]
      : [];


  /*
     카테고리 필터
  */

  if (
    currentEventCategory !==
    "all"
  ) {

    events =
      events.filter(
        function (event) {

          return (
            event.category ===
            currentEventCategory
          );

        }
      );

  }


  /*
     검색
  */

  if (currentEventSearch) {

    events =
      events.filter(
        function (event) {

          const text = [
            event.name,
            event.categoryName,
            event.ability,
            event.description,
            ...(event.mainMetrics || [])
          ]
            .join(" ")
            .toLowerCase();


          return text.includes(
            currentEventSearch
          );

        }
      );

  }


  if (!events.length) {

    container.innerHTML =
      '<div class="empty-state">' +
      "조건에 맞는 종목이 없습니다." +
      "</div>";

    return;

  }


  container.innerHTML =
    events
      .map(function (event) {

        return `
          <button
            type="button"
            class="event-card"
            data-event-id="${escapeHTML(
              event.id
            )}"
          >

            <div class="event-card-icon">
              ${escapeHTML(
                event.icon || "◆"
              )}
            </div>

            <strong>
              ${escapeHTML(
                event.name
              )}
            </strong>

            <span>
              ${escapeHTML(
                event.ability || ""
              )}
            </span>

            <span>
              ${escapeHTML(
                event.description || ""
              )}
            </span>

            <small>
              VIDEO ANALYSIS →
            </small>

          </button>
        `;

      })
      .join("");

}


/* =========================================================
   40. SELECT PE EVENT
========================================================= */

function selectPEEvent(eventId) {

  const event =
    getPEEventSafe(
      eventId
    );


  if (!event) {

    showToast(
      "종목 정보를 찾을 수 없습니다."
    );

    return;

  }


  AppState.selectedEventId =
    event.id;


  /*
     분석 페이지로 이동
  */

  navigateTo(
    "analysis"
  );


  /*
     이동 후 select 설정
  */

  requestAnimationFrame(
    function () {

      const select =
        $("analysisEventSelect");


      if (select) {

        select.value =
          event.id;

      }


      updateAnalysisEventTitle();


      showToast(
        event.name +
        " 분석 준비 완료"
      );

    }
  );

}


/* =========================================================
   41. ANALYSIS SELECT CHANGE
========================================================= */

function setupAnalysisSelectEvents() {

  const athleteSelect =
    $("analysisAthleteSelect");


  const eventSelect =
    $("analysisEventSelect");


  if (athleteSelect) {

    athleteSelect.addEventListener(
      "change",
      function () {

        AppState.selectedAthleteId =
          athleteSelect.value;

      }
    );

  }


  if (eventSelect) {

    eventSelect.addEventListener(
      "change",
      function () {

        AppState.selectedEventId =
          eventSelect.value;


        updateAnalysisEventTitle();

      }
    );

  }

}


/* =========================================================
   42. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   43. PART 2 READY
========================================================= */

console.log(
  "[APP PART 2 READY]"
);
/* =========================================================
   APP.JS
   PART 3 / 4

   VIDEO ANALYSIS ENGINE
   - 영상 업로드
   - 재생 / 일시정지
   - 타임라인
   - 프레임 이동
   - 슬로모션
   - MediaPipe Pose
   - Skeleton
   - Joint Angles
   - Center of Mass
   - Trajectory
   - Key Frame Capture
   - Performance Metrics
========================================================= */


/* =========================================================
   44. VIDEO ANALYSIS VARIABLES
========================================================= */

let poseEngine = null;

let poseBusy = false;

let analysisLoopId = null;

let lastPoseProcessTime = 0;

let currentLandmarks = null;

let previousCenterPoint = null;

let previousCenterTime = null;

let stepCounter = 0;

let previousAnkleState = null;


/* =========================================================
   45. MEDIAPIPE LANDMARK INDEX
========================================================= */

const POSE_INDEX = {

  nose: 0,

  leftShoulder: 11,
  rightShoulder: 12,

  leftElbow: 13,
  rightElbow: 14,

  leftWrist: 15,
  rightWrist: 16,

  leftHip: 23,
  rightHip: 24,

  leftKnee: 25,
  rightKnee: 26,

  leftAnkle: 27,
  rightAnkle: 28,

  leftHeel: 29,
  rightHeel: 30,

  leftFoot: 31,
  rightFoot: 32

};


/* =========================================================
   46. VIDEO ANALYSIS SETUP
========================================================= */

function setupVideoAnalysis() {

  setupAnalysisSelectEvents();

  setupVideoUpload();

  setupVideoControls();

  setupAnalysisButtons();

  setupAnalysisOptions();

  setupPoseEngine();

  setupAngleChart();

  resetAnalysisUI();

  console.log(
    "[VIDEO ANALYSIS READY]"
  );

}


/* =========================================================
   47. VIDEO UPLOAD
========================================================= */

function setupVideoUpload() {

  const selectButton =
    $("selectVideoButton");

  const input =
    $("videoFileInput");

  const video =
    $("analysisVideo");


  if (selectButton && input) {

    selectButton.addEventListener(
      "click",
      function () {

        input.click();

      }
    );

  }


  if (input) {

    input.addEventListener(
      "change",
      function () {

        const file =
          input.files?.[0];


        if (!file) {
          return;
        }


        loadAnalysisVideo(
          file
        );

      }
    );

  }


  if (video) {

    video.addEventListener(
      "loadedmetadata",
      function () {

        updateVideoDuration();

        resizeAnalysisCanvases();

      }
    );


    video.addEventListener(
      "loadeddata",
      function () {

        resizeAnalysisCanvases();

        drawCurrentVideoFrame();

      }
    );


    video.addEventListener(
      "timeupdate",
      updateVideoTimeline
    );


    video.addEventListener(
      "play",
      function () {

        updatePlayButton();

      }
    );


    video.addEventListener(
      "pause",
      function () {

        updatePlayButton();

      }
    );


    video.addEventListener(
      "ended",
      function () {

        updatePlayButton();

        if (AppState.analyzing) {

          finishVideoAnalysis();

        }

      }
    );

  }


  window.addEventListener(
    "resize",
    resizeAnalysisCanvases
  );

}


/* =========================================================
   48. LOAD VIDEO
========================================================= */

function loadAnalysisVideo(file) {

  const video =
    $("analysisVideo");


  if (!video) {

    showToast(
      "영상 플레이어를 찾을 수 없습니다."
    );

    return;

  }


  if (AppState.videoURL) {

    try {

      URL.revokeObjectURL(
        AppState.videoURL
      );

    } catch (error) {

      console.warn(error);

    }

  }


  AppState.videoFile =
    file;


  AppState.videoURL =
    URL.createObjectURL(
      file
    );


  video.src =
    AppState.videoURL;


  video.load();


  const empty =
    $("videoEmptyState");


  if (empty) {

    empty.classList.add(
      "hidden"
    );

  }


  resetAnalysisResults();


  setAnalysisStatus(
    "VIDEO READY",
    ""
  );


  showToast(
    "영상이 준비되었습니다."
  );

}


/* =========================================================
   49. VIDEO CONTROLS
========================================================= */

function setupVideoControls() {

  const video =
    $("analysisVideo");


  const playButton =
    $("playPauseButton");


  const previousButton =
    $("previousFrameButton");


  const nextButton =
    $("nextFrameButton");


  const slowButton =
    $("slowMotionButton");


  const speedSelect =
    $("playbackSpeedSelect");


  const timeline =
    $("videoTimeline");


  const captureButton =
    $("captureFrameButton");


  if (playButton) {

    playButton.addEventListener(
      "click",
      toggleVideoPlayback
    );

  }


  if (previousButton) {

    previousButton.addEventListener(
      "click",
      function () {

        moveVideoFrame(-1);

      }
    );

  }


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      function () {

        moveVideoFrame(1);

      }
    );

  }


  if (slowButton) {

    slowButton.addEventListener(
      "click",
      function () {

        if (!video) {
          return;
        }


        video.playbackRate =
          0.5;


        if (speedSelect) {

          speedSelect.value =
            "0.5";

        }


        showToast(
          "0.5배 슬로모션"
        );

      }
    );

  }


  if (speedSelect) {

    speedSelect.addEventListener(
      "change",
      function () {

        if (!video) {
          return;
        }


        video.playbackRate =
          Number(
            speedSelect.value
          ) || 1;

      }
    );

  }


  if (timeline) {

    timeline.addEventListener(
      "input",
      function () {

        if (
          !video ||
          !Number.isFinite(
            video.duration
          )
        ) {
          return;
        }


        video.currentTime =
          Number(
            timeline.value
          );

      }
    );

  }


  if (captureButton) {

    captureButton.addEventListener(
      "click",
      function () {

        captureKeyFrame(
          "수동 핵심 프레임"
        );

      }
    );

  }

}


/* =========================================================
   50. PLAY / PAUSE
========================================================= */

function toggleVideoPlayback() {

  const video =
    $("analysisVideo");


  if (
    !video ||
    !AppState.videoFile
  ) {

    showToast(
      "먼저 영상을 선택하세요."
    );

    return;

  }


  if (video.paused) {

    video
      .play()
      .catch(function (error) {

        console.error(error);

        showToast(
          "영상을 재생할 수 없습니다."
        );

      });

  } else {

    video.pause();

  }

}


/* =========================================================
   51. PLAY BUTTON
========================================================= */

function updatePlayButton() {

  const video =
    $("analysisVideo");


  const button =
    $("playPauseButton");


  if (
    !video ||
    !button
  ) {
    return;
  }


  button.textContent =
    video.paused
      ? "▶"
      : "Ⅱ";

}


/* =========================================================
   52. FRAME MOVE
========================================================= */

function moveVideoFrame(direction) {

  const video =
    $("analysisVideo");


  if (
    !video ||
    !AppState.videoFile
  ) {

    showToast(
      "먼저 영상을 선택하세요."
    );

    return;

  }


  video.pause();


  /*
     일반 영상에서 30fps 기준
  */

  const frameDuration =
    1 / 30;


  video.currentTime =
    Math.max(
      0,
      Math.min(
        video.duration || 0,
        video.currentTime +
        frameDuration *
        direction
      )
    );


  setTimeout(
    drawCurrentVideoFrame,
    30
  );

}


/* =========================================================
   53. VIDEO TIMELINE
========================================================= */

function updateVideoDuration() {

  const video =
    $("analysisVideo");


  const timeline =
    $("videoTimeline");


  if (!video) {
    return;
  }


  setText(
    "videoDuration",
    formatVideoTime(
      video.duration
    )
  );


  if (timeline) {

    timeline.max =
      Number.isFinite(
        video.duration
      )
        ? video.duration
        : 0;

  }

}


function updateVideoTimeline() {

  const video =
    $("analysisVideo");


  const timeline =
    $("videoTimeline");


  if (!video) {
    return;
  }


  setText(
    "videoCurrentTime",
    formatVideoTime(
      video.currentTime
    )
  );


  if (timeline) {

    timeline.value =
      video.currentTime || 0;

  }

}


/* =========================================================
   54. CANVAS SIZE
========================================================= */

function resizeAnalysisCanvases() {

  const video =
    $("analysisVideo");


  if (!video) {
    return;
  }


  const width =
    video.videoWidth || 1280;


  const height =
    video.videoHeight || 720;


  [
    $("poseCanvas"),
    $("trajectoryCanvas")
  ]
    .filter(Boolean)
    .forEach(function (canvas) {

      canvas.width =
        width;

      canvas.height =
        height;

    });

}


/* =========================================================
   55. POSE ENGINE
========================================================= */

function setupPoseEngine() {

  if (
    typeof window.Pose !==
    "function"
  ) {

    console.warn(
      "[MEDIAPIPE] Pose library not found."
    );

    setAnalysisStatus(
      "POSE LIBRARY ERROR",
      ""
    );

    return;

  }


  try {

    poseEngine =
      new window.Pose({

        locateFile:
          function (file) {

            return (
              "https://cdn.jsdelivr.net/npm/@mediapipe/pose/" +
              file
            );

          }

      });


    poseEngine.setOptions({

      modelComplexity: 1,

      smoothLandmarks: true,

      enableSegmentation: false,

      smoothSegmentation: false,

      minDetectionConfidence: 0.5,

      minTrackingConfidence: 0.5

    });


    poseEngine.onResults(
      handlePoseResults
    );


    console.log(
      "[MEDIAPIPE POSE READY]"
    );

  } catch (error) {

    console.error(
      "[POSE SETUP ERROR]",
      error
    );

  }

}


/* =========================================================
   56. ANALYSIS BUTTONS
========================================================= */

function setupAnalysisButtons() {

  const start =
    $("startAnalysisButton");


  const stop =
    $("stopAnalysisButton");


  const reset =
    $("resetAnalysisButton");


  const report =
    $("finishReportButton");


  const summaryReport =
    $("summaryOpenReportButton");


  if (start) {

    start.addEventListener(
      "click",
      startVideoAnalysis
    );

  }


  if (stop) {

    stop.addEventListener(
      "click",
      finishVideoAnalysis
    );

  }


  if (reset) {

    reset.addEventListener(
      "click",
      resetAnalysis
    );

  }


  if (report) {

    report.addEventListener(
      "click",
      function () {

        if (
          !AppState.currentReport
        ) {

          showToast(
            "먼저 분석을 완료하세요."
          );

          return;

        }


        navigateTo(
          "report"
        );

      }
    );

  }


  if (summaryReport) {

    summaryReport.addEventListener(
      "click",
      function () {

        navigateTo(
          "report"
        );

      }
    );

  }

}


/* =========================================================
   57. START ANALYSIS
========================================================= */

async function startVideoAnalysis() {

  const video =
    $("analysisVideo");


  const athleteSelect =
    $("analysisAthleteSelect");


  const eventSelect =
    $("analysisEventSelect");


  if (!AppState.videoFile) {

    showToast(
      "분석할 영상을 선택하세요."
    );

    return;

  }


  if (!eventSelect?.value) {

    showToast(
      "분석 종목을 선택하세요."
    );

    return;

  }


  if (!poseEngine) {

    showToast(
      "자세분석 엔진을 불러오지 못했습니다."
    );

    return;

  }


  AppState.selectedAthleteId =
    athleteSelect?.value || "";


  AppState.selectedEventId =
    eventSelect.value;


  AppState.analyzing =
    true;


  AppState.analysisStartTime =
    Date.now();


  AppState.analysisFrames =
    [];


  AppState.keyFrames =
    [];


  AppState.trajectory =
    [];


  currentLandmarks =
    null;


  previousCenterPoint =
    null;


  previousCenterTime =
    null;


  stepCounter =
    0;


  previousAnkleState =
    null;


  clearAnalysisCanvases();

  clearKeyFrames();

  clearFeedback();


  const startButton =
    $("startAnalysisButton");


  const stopButton =
    $("stopAnalysisButton");


  if (startButton) {

    startButton.disabled =
      true;

  }


  if (stopButton) {

    stopButton.disabled =
      false;

  }


  setAnalysisStatus(
    "ANALYZING",
    "running"
  );


  if (
    video.currentTime >=
    video.duration - 0.1
  ) {

    video.currentTime =
      0;

  }


  try {

    await video.play();

  } catch (error) {

    console.warn(
      error
    );

  }


  startAnalysisLoop();


  showToast(
    "영상 자세분석을 시작합니다."
  );

}


/* =========================================================
   58. ANALYSIS LOOP
========================================================= */

function startAnalysisLoop() {

  stopAnalysisLoop();


  const loop =
    async function (timestamp) {

      if (
        !AppState.analyzing
      ) {

        return;

      }


      const video =
        $("analysisVideo");


      if (
        !video ||
        video.ended
      ) {

        finishVideoAnalysis();

        return;

      }


      const interval =
        Number(
          $("analysisFrameRateSelect")
            ?.value
        ) || 150;


      if (
        !video.paused &&
        timestamp -
        lastPoseProcessTime >=
        interval
      ) {

        lastPoseProcessTime =
          timestamp;


        await processVideoPose();

      }


      analysisLoopId =
        requestAnimationFrame(
          loop
        );

    };


  analysisLoopId =
    requestAnimationFrame(
      loop
    );

}


/* =========================================================
   59. STOP LOOP
========================================================= */

function stopAnalysisLoop() {

  if (analysisLoopId) {

    cancelAnimationFrame(
      analysisLoopId
    );


    analysisLoopId =
      null;

  }

}


/* =========================================================
   60. PROCESS VIDEO POSE
========================================================= */

async function processVideoPose() {

  const video =
    $("analysisVideo");


  if (
    !poseEngine ||
    !video ||
    poseBusy ||
    video.readyState < 2
  ) {
    return;
  }


  poseBusy =
    true;


  try {

    await poseEngine.send({

      image:
        video

    });

  } catch (error) {

    console.error(
      "[POSE PROCESS ERROR]",
      error
    );

  } finally {

    poseBusy =
      false;

  }

}


/* =========================================================
   61. POSE RESULTS
========================================================= */

function handlePoseResults(results) {

  if (!results) {
    return;
  }


  const landmarks =
    results.poseLandmarks;


  if (
    !landmarks ||
    landmarks.length < 33
  ) {

    return;

  }


  currentLandmarks =
    landmarks;


  AppState.latestPose =
    landmarks;


  const frame =
    analyzePoseFrame(
      landmarks
    );


  if (frame) {

    AppState.analysisFrames.push(
      frame
    );

  }


  drawPoseOverlay(
    landmarks,
    frame
  );


  updateLiveAnalysisUI(
    frame
  );


  updateAngleChart(
    frame
  );


  checkAutomaticKeyFrame(
    frame
  );

}


/* =========================================================
   62. ANALYZE FRAME
========================================================= */

function analyzePoseFrame(landmarks) {

  const video =
    $("analysisVideo");


  if (!video) {
    return null;
  }


  const leftKnee =
    calculateJointAngle(
      landmarks[
        POSE_INDEX.leftHip
      ],
      landmarks[
        POSE_INDEX.leftKnee
      ],
      landmarks[
        POSE_INDEX.leftAnkle
      ]
    );


  const rightKnee =
    calculateJointAngle(
      landmarks[
        POSE_INDEX.rightHip
      ],
      landmarks[
        POSE_INDEX.rightKnee
      ],
      landmarks[
        POSE_INDEX.rightAnkle
      ]
    );


  const leftHip =
    calculateJointAngle(
      landmarks[
        POSE_INDEX.leftShoulder
      ],
      landmarks[
        POSE_INDEX.leftHip
      ],
      landmarks[
        POSE_INDEX.leftKnee
      ]
    );


  const rightHip =
    calculateJointAngle(
      landmarks[
        POSE_INDEX.rightShoulder
      ],
      landmarks[
        POSE_INDEX.rightHip
      ],
      landmarks[
        POSE_INDEX.rightKnee
      ]
    );


  const leftAnkle =
    calculateJointAngle(
      landmarks[
        POSE_INDEX.leftKnee
      ],
      landmarks[
        POSE_INDEX.leftAnkle
      ],
      landmarks[
        POSE_INDEX.leftFoot
      ]
    );


  const rightAnkle =
    calculateJointAngle(
      landmarks[
        POSE_INDEX.rightKnee
      ],
      landmarks[
        POSE_INDEX.rightAnkle
      ],
      landmarks[
        POSE_INDEX.rightFoot
      ]
    );


  const trunkAngle =
    calculateTrunkAngle(
      landmarks
    );


  const center =
    calculateBodyCenter(
      landmarks
    );


  const movementSpeed =
    calculateMovementSpeed(
      center,
      video.currentTime
    );


  const symmetry =
    calculateSymmetryScore(
      leftKnee,
      rightKnee,
      leftHip,
      rightHip
    );


  const stability =
    calculateStabilityScore(
      trunkAngle,
      movementSpeed
    );


  const technique =
    calculateTechniqueScore(
      leftKnee,
      rightKnee,
      leftHip,
      rightHip,
      trunkAngle
    );


  const power =
    calculatePowerScore(
      movementSpeed,
      leftKnee,
      rightKnee
    );


  const agility =
    calculateAgilityScore(
      movementSpeed,
      symmetry
    );


  const speed =
    clamp(
      55 +
      movementSpeed * 220
    );


  detectStep(
    landmarks
  );


  const phase =
    detectMovementPhase(
      leftKnee,
      rightKnee,
      center
    );


  const frame = {

    time:
      video.currentTime,

    angles: {

      leftKnee,
      rightKnee,

      leftHip,
      rightHip,

      leftAnkle,
      rightAnkle,

      trunk:
        trunkAngle

    },

    center,

    metrics: {

      speed,

      power,

      agility,

      stability,

      symmetry,

      technique

    },

    phase,

    stepCount:
      stepCounter

  };


  AppState.trajectory.push({

    x:
      center.x,

    y:
      center.y,

    time:
      video.currentTime

  });


  if (
    AppState.trajectory.length >
    400
  ) {

    AppState.trajectory.shift();

  }


  return frame;

}


/* =========================================================
   63. JOINT ANGLE
========================================================= */

function calculateJointAngle(
  pointA,
  pointB,
  pointC
) {

  if (
    !pointA ||
    !pointB ||
    !pointC
  ) {

    return 0;

  }


  const radians =
    Math.atan2(
      pointC.y - pointB.y,
      pointC.x - pointB.x
    ) -
    Math.atan2(
      pointA.y - pointB.y,
      pointA.x - pointB.x
    );


  let angle =
    Math.abs(
      radians *
      180 /
      Math.PI
    );


  if (angle > 180) {

    angle =
      360 - angle;

  }


  return Math.round(
    angle * 10
  ) / 10;

}


/* =========================================================
   64. TRUNK ANGLE
========================================================= */

function calculateTrunkAngle(
  landmarks
) {

  const leftShoulder =
    landmarks[
      POSE_INDEX.leftShoulder
    ];


  const rightShoulder =
    landmarks[
      POSE_INDEX.rightShoulder
    ];


  const leftHip =
    landmarks[
      POSE_INDEX.leftHip
    ];


  const rightHip =
    landmarks[
      POSE_INDEX.rightHip
    ];


  const shoulder = {

    x:
      (
        leftShoulder.x +
        rightShoulder.x
      ) / 2,

    y:
      (
        leftShoulder.y +
        rightShoulder.y
      ) / 2

  };


  const hip = {

    x:
      (
        leftHip.x +
        rightHip.x
      ) / 2,

    y:
      (
        leftHip.y +
        rightHip.y
      ) / 2

  };


  const dx =
    shoulder.x -
    hip.x;


  const dy =
    hip.y -
    shoulder.y;


  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) *
    180 /
    Math.PI;


  return Math.round(
    angle * 10
  ) / 10;

}


/* =========================================================
   65. BODY CENTER
========================================================= */

function calculateBodyCenter(
  landmarks
) {

  const leftHip =
    landmarks[
      POSE_INDEX.leftHip
    ];


  const rightHip =
    landmarks[
      POSE_INDEX.rightHip
    ];


  const leftShoulder =
    landmarks[
      POSE_INDEX.leftShoulder
    ];


  const rightShoulder =
    landmarks[
      POSE_INDEX.rightShoulder
    ];


  return {

    x:
      (
        leftHip.x +
        rightHip.x +
        leftShoulder.x +
        rightShoulder.x
      ) / 4,

    y:
      (
        leftHip.y +
        rightHip.y +
        leftShoulder.y +
        rightShoulder.y
      ) / 4

  };

}


/* =========================================================
   66. MOVEMENT SPEED
========================================================= */

function calculateMovementSpeed(
  center,
  currentTime
) {

  if (
    !previousCenterPoint ||
    previousCenterTime === null
  ) {

    previousCenterPoint =
      {
        ...center
      };


    previousCenterTime =
      currentTime;


    return 0;

  }


  const dx =
    center.x -
    previousCenterPoint.x;


  const dy =
    center.y -
    previousCenterPoint.y;


  const distance =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  const deltaTime =
    Math.max(
      0.001,
      currentTime -
      previousCenterTime
    );


  const speed =
    distance /
    deltaTime;


  previousCenterPoint =
    {
      ...center
    };


  previousCenterTime =
    currentTime;


  return Math.min(
    speed,
    1
  );

}


/* =========================================================
   67. SYMMETRY SCORE
========================================================= */

function calculateSymmetryScore(
  leftKnee,
  rightKnee,
  leftHip,
  rightHip
) {

  const kneeDifference =
    Math.abs(
      leftKnee -
      rightKnee
    );


  const hipDifference =
    Math.abs(
      leftHip -
      rightHip
    );


  const difference =
    (
      kneeDifference +
      hipDifference
    ) / 2;


  return clamp(
    100 -
    difference * 1.6
  );

}


/* =========================================================
   68. STABILITY SCORE
========================================================= */

function calculateStabilityScore(
  trunkAngle,
  movementSpeed
) {

  const trunkPenalty =
    Math.max(
      0,
      trunkAngle - 10
    ) * 0.8;


  const movementPenalty =
    Math.max(
      0,
      movementSpeed - 0.15
    ) * 35;


  return clamp(
    95 -
    trunkPenalty -
    movementPenalty
  );

}


/* =========================================================
   69. TECHNIQUE SCORE
========================================================= */

function calculateTechniqueScore(
  leftKnee,
  rightKnee,
  leftHip,
  rightHip,
  trunkAngle
) {

  const symmetry =
    calculateSymmetryScore(
      leftKnee,
      rightKnee,
      leftHip,
      rightHip
    );


  const posture =
    clamp(
      100 -
      Math.max(
        0,
        trunkAngle - 20
      ) *
      0.8
    );


  return clamp(
    symmetry * 0.55 +
    posture * 0.45
  );

}


/* =========================================================
   70. POWER SCORE
========================================================= */

function calculatePowerScore(
  movementSpeed,
  leftKnee,
  rightKnee
) {

  const kneeAverage =
    (
      leftKnee +
      rightKnee
    ) / 2;


  const extensionScore =
    clamp(
      (
        kneeAverage -
        70
      ) /
      110 *
      100
    );


  return clamp(
    movementSpeed *
    180 +
    extensionScore *
    0.45
  );

}


/* =========================================================
   71. AGILITY SCORE
========================================================= */

function calculateAgilityScore(
  movementSpeed,
  symmetry
) {

  return clamp(
    movementSpeed *
    160 +
    symmetry *
    0.55
  );

}


/* =========================================================
   72. STEP DETECTION
========================================================= */

function detectStep(
  landmarks
) {

  const left =
    landmarks[
      POSE_INDEX.leftAnkle
    ];


  const right =
    landmarks[
      POSE_INDEX.rightAnkle
    ];


  const difference =
    left.y -
    right.y;


  let state =
    "same";


  if (difference > 0.025) {

    state =
      "left";

  } else if (
    difference < -0.025
  ) {

    state =
      "right";

  }


  if (
    previousAnkleState &&
    state !== "same" &&
    previousAnkleState !== state
  ) {

    stepCounter++;

  }


  if (state !== "same") {

    previousAnkleState =
      state;

  }

}


/* =========================================================
   73. MOVEMENT PHASE
========================================================= */

function detectMovementPhase(
  leftKnee,
  rightKnee,
  center
) {

  const knee =
    (
      leftKnee +
      rightKnee
    ) / 2;


  if (knee < 95) {

    return "LOW";

  }


  if (knee < 135) {

    return "DRIVE";

  }


  if (
    center.y < 0.42
  ) {

    return "AIR";

  }


  return "EXTENSION";

}


/* =========================================================
   74. DRAW POSE
========================================================= */

function drawPoseOverlay(
  landmarks,
  frame
) {

  const canvas =
    $("poseCanvas");


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    $("referenceLineOption")
      ?.checked
  ) {

    drawReferenceLines(
      ctx,
      canvas
    );

  }


  if (
    $("skeletonOption")
      ?.checked
  ) {

    drawSkeleton(
      ctx,
      canvas,
      landmarks
    );

  }


  if (
    $("centerOfMassOption")
      ?.checked &&
    frame?.center
  ) {

    drawCenterPoint(
      ctx,
      canvas,
      frame.center
    );

  }


  if (
    $("angleOption")
      ?.checked &&
    frame
  ) {

    drawAngleLabels(
      ctx,
      canvas,
      landmarks,
      frame
    );

  }


  drawTrajectory();

}


/* =========================================================
   75. SKELETON CONNECTIONS
========================================================= */

const SKELETON_CONNECTIONS = [

  [11, 12],

  [11, 13],
  [13, 15],

  [12, 14],
  [14, 16],

  [11, 23],
  [12, 24],

  [23, 24],

  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],

  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32]

];


/* =========================================================
   76. DRAW SKELETON
========================================================= */

function drawSkeleton(
  ctx,
  canvas,
  landmarks
) {

  ctx.save();


  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 500
    );


  ctx.strokeStyle =
    "rgba(103,232,249,0.95)";


  SKELETON_CONNECTIONS.forEach(
    function (connection) {

      const a =
        landmarks[
          connection[0]
        ];


      const b =
        landmarks[
          connection[1]
        ];


      if (
        !isVisibleLandmark(a) ||
        !isVisibleLandmark(b)
      ) {

        return;

      }


      ctx.beginPath();

      ctx.moveTo(
        a.x * canvas.width,
        a.y * canvas.height
      );

      ctx.lineTo(
        b.x * canvas.width,
        b.y * canvas.height
      );

      ctx.stroke();

    }
  );


  landmarks.forEach(
    function (
      point,
      index
    ) {

      if (
        index < 11 ||
        !isVisibleLandmark(point)
      ) {

        return;

      }


      ctx.beginPath();


      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        Math.max(
          3,
          canvas.width / 260
        ),
        0,
        Math.PI * 2
      );


      ctx.fillStyle =
        "rgba(255,255,255,0.95)";


      ctx.fill();

    }
  );


  ctx.restore();

}


/* =========================================================
   77. LANDMARK VISIBILITY
========================================================= */

function isVisibleLandmark(
  landmark
) {

  if (!landmark) {
    return false;
  }


  if (
    landmark.visibility ===
    undefined
  ) {

    return true;

  }


  return (
    landmark.visibility >
    0.35
  );

}


/* =========================================================
   78. CENTER POINT
========================================================= */

function drawCenterPoint(
  ctx,
  canvas,
  center
) {

  const x =
    center.x *
    canvas.width;


  const y =
    center.y *
    canvas.height;


  ctx.save();


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    Math.max(
      7,
      canvas.width / 150
    ),
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    "rgba(250,204,21,0.9)";


  ctx.fill();


  ctx.restore();

}


/* =========================================================
   79. REFERENCE LINES
========================================================= */

function drawReferenceLines(
  ctx,
  canvas
) {

  ctx.save();


  ctx.strokeStyle =
    "rgba(255,255,255,0.18)";


  ctx.lineWidth =
    1;


  ctx.setLineDash(
    [8, 8]
  );


  ctx.beginPath();

  ctx.moveTo(
    canvas.width / 2,
    0
  );

  ctx.lineTo(
    canvas.width / 2,
    canvas.height
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    0,
    canvas.height * 0.75
  );

  ctx.lineTo(
    canvas.width,
    canvas.height * 0.75
  );

  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   80. ANGLE LABELS
========================================================= */

function drawAngleLabels(
  ctx,
  canvas,
  landmarks,
  frame
) {

  const labels = [

    {
      point:
        landmarks[
          POSE_INDEX.leftKnee
        ],
      value:
        frame.angles.leftKnee
    },

    {
      point:
        landmarks[
          POSE_INDEX.rightKnee
        ],
      value:
        frame.angles.rightKnee
    },

    {
      point:
        landmarks[
          POSE_INDEX.leftHip
        ],
      value:
        frame.angles.leftHip
    },

    {
      point:
        landmarks[
          POSE_INDEX.rightHip
        ],
      value:
        frame.angles.rightHip
    }

  ];


  ctx.save();


  ctx.font =
    Math.max(
      14,
      canvas.width / 65
    ) +
    "px sans-serif";


  ctx.textAlign =
    "center";


  labels.forEach(
    function (item) {

      if (
        !isVisibleLandmark(
          item.point
        )
      ) {

        return;

      }


      const x =
        item.point.x *
        canvas.width;


      const y =
        item.point.y *
        canvas.height -
        12;


      const text =
        Math.round(
          item.value
        ) +
        "°";


      ctx.lineWidth =
        4;


      ctx.strokeStyle =
        "rgba(0,0,0,0.7)";


      ctx.strokeText(
        text,
        x,
        y
      );


      ctx.fillStyle =
        "#ffffff";


      ctx.fillText(
        text,
        x,
        y
      );

    }
  );


  ctx.restore();

}


/* =========================================================
   81. TRAJECTORY
========================================================= */

function drawTrajectory() {

  const canvas =
    $("trajectoryCanvas");


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    !$("trajectoryOption")
      ?.checked
  ) {

    return;

  }


  const points =
    AppState.trajectory;


  if (
    points.length < 2
  ) {

    return;

  }


  ctx.save();


  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 450
    );


  ctx.strokeStyle =
    "rgba(250,204,21,0.85)";


  ctx.beginPath();


  points.forEach(
    function (
      point,
      index
    ) {

      const x =
        point.x *
        canvas.width;


      const y =
        point.y *
        canvas.height;


      if (index === 0) {

        ctx.moveTo(
          x,
          y
        );

      } else {

        ctx.lineTo(
          x,
          y
        );

      }

    }
  );


  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   82. LIVE UI
========================================================= */

function updateLiveAnalysisUI(
  frame
) {

  if (!frame) {
    return;
  }


  setText(
    "leftKneeAngle",
    Math.round(
      frame.angles.leftKnee
    ) + "°"
  );


  setText(
    "rightKneeAngle",
    Math.round(
      frame.angles.rightKnee
    ) + "°"
  );


  setText(
    "leftHipAngle",
    Math.round(
      frame.angles.leftHip
    ) + "°"
  );


  setText(
    "rightHipAngle",
    Math.round(
      frame.angles.rightHip
    ) + "°"
  );


  setText(
    "leftAnkleAngle",
    Math.round(
      frame.angles.leftAnkle
    ) + "°"
  );


  setText(
    "rightAnkleAngle",
    Math.round(
      frame.angles.rightAnkle
    ) + "°"
  );


  setText(
    "trunkAngle",
    Math.round(
      frame.angles.trunk
    ) + "°"
  );


  updateMetricUI(
    "speedMetricValue",
    "speedMetricBar",
    frame.metrics.speed
  );


  updateMetricUI(
    "powerMetricValue",
    "powerMetricBar",
    frame.metrics.power
  );


  updateMetricUI(
    "agilityMetricValue",
    "agilityMetricBar",
    frame.metrics.agility
  );


  updateMetricUI(
    "stabilityMetricValue",
    "stabilityMetricBar",
    frame.metrics.stability
  );


  updateMetricUI(
    "symmetryMetricValue",
    "symmetryMetricBar",
    frame.metrics.symmetry
  );


  updateMetricUI(
    "techniqueMetricValue",
    "techniqueMetricBar",
    frame.metrics.technique
  );


  setText(
    "sprintStepCount",
    frame.stepCount
  );


  setText(
    "analysisPhaseText",
    frame.phase
  );


  updateSpecialMetrics(
    frame
  );

}


/* =========================================================
   83. METRIC UI
========================================================= */

function updateMetricUI(
  valueId,
  barId,
  value
) {

  const score =
    Math.round(
      clamp(value)
    );


  setText(
    valueId,
    score
  );


  const bar =
    $(barId);


  if (bar) {

    bar.style.width =
      score + "%";

  }

}


/* =========================================================
   84. SPECIAL METRICS
========================================================= */

function updateSpecialMetrics(
  frame
) {

  const event =
    getPEEventSafe(
      AppState.selectedEventId
    );


  if (!event) {
    return;
  }


  /*
     현재 버전은 단안 영상 기반 추정값.
     실제 cm 측정은 별도 스케일 보정 필요.
  */

  if (
    event.category ===
    "jump"
  ) {

    const trajectory =
      AppState.trajectory;


    if (
      trajectory.length > 2
    ) {

      const ys =
        trajectory.map(
          function (point) {

            return point.y;

          }
        );


      const maxY =
        Math.max(...ys);


      const minY =
        Math.min(...ys);


      const normalizedHeight =
        Math.max(
          0,
          maxY - minY
        );


      const estimatedHeight =
        Math.round(
          normalizedHeight *
          180
        );


      setText(
        "jumpHeight",
        estimatedHeight +
        " cm*"
      );

    }


    setText(
      "jumpTakeoffAngle",
      Math.round(
        90 -
        frame.angles.trunk
      ) +
      "°"
    );

  }


  const video =
    $("analysisVideo");


  if (
    video &&
    video.currentTime > 0
  ) {

    const cadence =
      Math.round(
        stepCounter /
        video.currentTime *
        60
      );


    setText(
      "sprintCadence",
      Number.isFinite(
        cadence
      )
        ? cadence +
          " spm"
        : "--"
    );

  }

}


/* =========================================================
   85. AUTO KEY FRAME
========================================================= */

function checkAutomaticKeyFrame(
  frame
) {

  if (
    !$("autoKeyFrameOption")
      ?.checked
  ) {

    return;

  }


  if (
    AppState.keyFrames.length >=
    6
  ) {

    return;

  }


  const last =
    AppState.keyFrames[
      AppState.keyFrames.length - 1
    ];


  if (
    last &&
    Math.abs(
      frame.time -
      last.time
    ) < 0.8
  ) {

    return;

  }


  const kneeAverage =
    (
      frame.angles.leftKnee +
      frame.angles.rightKnee
    ) / 2;


  /*
     깊은 굴곡
  */

  if (
    kneeAverage < 105
  ) {

    captureKeyFrame(
      "최대 굴곡"
    );

    return;

  }


  /*
     신전
  */

  if (
    kneeAverage > 165 &&
    frame.metrics.power > 65
  ) {

    captureKeyFrame(
      "신전 / 이륙"
    );

  }

}


/* =========================================================
   86. CAPTURE KEY FRAME
========================================================= */

function captureKeyFrame(
  label
) {

  const video =
    $("analysisVideo");


  if (
    !video ||
    video.readyState < 2
  ) {

    return;

  }


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    video.videoWidth || 1280;


  canvas.height =
    video.videoHeight || 720;


  const ctx =
    canvas.getContext("2d");


  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
     Pose overlay까지 사진에 합성
  */

  const poseCanvas =
    $("poseCanvas");


  const trajectoryCanvas =
    $("trajectoryCanvas");


  if (poseCanvas) {

    ctx.drawImage(
      poseCanvas,
      0,
      0,
      canvas.width,
      canvas.height
    );

  }


  if (trajectoryCanvas) {

    ctx.drawImage(
      trajectoryCanvas,
      0,
      0,
      canvas.width,
      canvas.height
    );

  }


  let image = "";


  try {

    image =
      canvas.toDataURL(
        "image/jpeg",
        0.82
      );

  } catch (error) {

    console.warn(
      "[CAPTURE ERROR]",
      error
    );

    return;

  }


  const currentFrame =
    AppState.analysisFrames[
      AppState.analysisFrames.length - 1
    ];


  const keyFrame = {

    id:
      createId(
        "frame"
      ),

    time:
      video.currentTime,

    label:
      label ||
      "핵심 프레임",

    image,

    angles:
      currentFrame?.angles
        ? {
            ...currentFrame.angles
          }
        : null,

    metrics:
      currentFrame?.metrics
        ? {
            ...currentFrame.metrics
          }
        : null

  };


  AppState.keyFrames.push(
    keyFrame
  );


  /*
     최대 8개
  */

  if (
    AppState.keyFrames.length >
    8
  ) {

    AppState.keyFrames.shift();

  }


  renderKeyFrames();


  showToast(
    "핵심 프레임을 저장했습니다."
  );

}


/* =========================================================
   87. KEY FRAME RENDER
========================================================= */

function renderKeyFrames() {

  const container =
    $("keyFrameList");


  const count =
    $("keyFrameCount");


  if (count) {

    count.textContent =
      AppState.keyFrames.length;

  }


  if (!container) {
    return;
  }


  if (
    !AppState.keyFrames.length
  ) {

    container.innerHTML =
      '<div class="empty-state">' +
      "핵심 프레임이 없습니다." +
      "</div>";

    return;

  }


  container.innerHTML =
    AppState.keyFrames
      .map(function (frame) {

        return `
          <div class="key-frame-card">

            <img
              src="${frame.image}"
              alt="핵심 자세"
            >

            <div class="key-frame-card-content">

              <strong>
                ${escapeHTML(
                  frame.label
                )}
              </strong>

              <p>
                ${formatVideoTime(
                  frame.time
                )}
              </p>

            </div>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   88. DRAW CURRENT FRAME
========================================================= */

function drawCurrentVideoFrame() {

  if (
    currentLandmarks
  ) {

    const latest =
      AppState.analysisFrames[
        AppState.analysisFrames.length - 1
      ];


    drawPoseOverlay(
      currentLandmarks,
      latest
    );

  }

}


/* =========================================================
   89. ANALYSIS OPTIONS
========================================================= */

function setupAnalysisOptions() {

  const mappings = [

    [
      "settingsSkeletonOption",
      "skeletonOption",
      "skeleton"
    ],

    [
      "settingsAngleOption",
      "angleOption",
      "angle"
    ],

    [
      "settingsTrajectoryOption",
      "trajectoryOption",
      "trajectory"
    ],

    [
      "settingsCenterOfMassOption",
      "centerOfMassOption",
      "centerOfMass"
    ]

  ];


  mappings.forEach(
    function (mapping) {

      const analysis =
        $(mapping[1]);


      if (analysis) {

        analysis.checked =
          AppState.settings[
            mapping[2]
          ] !== false;

      }

    }
  );

}


/* =========================================================
   90. ANGLE CHART
========================================================= */

function setupAngleChart() {

  const canvas =
    $("angleGraphCanvas");


  if (
    !canvas ||
    typeof window.Chart !==
    "function"
  ) {

    return;

  }


  if (
    AppState.charts.angle
  ) {

    AppState.charts.angle.destroy();

  }


  AppState.charts.angle =
    new window.Chart(
      canvas,
      {

        type:
          "line",

        data: {

          labels: [],

          datasets: [

            {
              label:
                "왼쪽 무릎",
              data: []
            },

            {
              label:
                "오른쪽 무릎",
              data: []
            },

            {
              label:
                "왼쪽 고관절",
              data: []
            },

            {
              label:
                "오른쪽 고관절",
              data: []
            }

          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          animation:
            false,

          interaction: {

            intersect:
              false,

            mode:
              "index"

          },

          scales: {

            y: {

              min:
                0,

              max:
                180

            }

          }

        }

      }
    );

}


/* =========================================================
   91. UPDATE ANGLE CHART
========================================================= */

function updateAngleChart(
  frame
) {

  const chart =
    AppState.charts.angle;


  if (
    !chart ||
    !frame
  ) {

    return;

  }


  chart.data.labels.push(
    frame.time.toFixed(2)
  );


  chart.data.datasets[0]
    .data
    .push(
      frame.angles.leftKnee
    );


  chart.data.datasets[1]
    .data
    .push(
      frame.angles.rightKnee
    );


  chart.data.datasets[2]
    .data
    .push(
      frame.angles.leftHip
    );


  chart.data.datasets[3]
    .data
    .push(
      frame.angles.rightHip
    );


  /*
     그래프가 너무 길어지지 않게
  */

  if (
    chart.data.labels.length >
    150
  ) {

    chart.data.labels.shift();


    chart.data.datasets
      .forEach(
        function (dataset) {

          dataset.data.shift();

        }
      );

  }


  chart.update("none");

}


/* =========================================================
   92. ANALYSIS STATUS
========================================================= */

function setAnalysisStatus(
  text,
  state
) {

  setText(
    "analysisStatusText",
    text
  );


  const dot =
    $("analysisStatusDot");


  if (!dot) {
    return;
  }


  dot.classList.remove(
    "running",
    "complete"
  );


  if (state) {

    dot.classList.add(
      state
    );

  }

}


/* =========================================================
   93. CLEAR CANVAS
========================================================= */

function clearAnalysisCanvases() {

  [
    $("poseCanvas"),
    $("trajectoryCanvas")
  ]
    .filter(Boolean)
    .forEach(function (canvas) {

      const ctx =
        canvas.getContext("2d");


      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    });

}


/* =========================================================
   94. CLEAR KEY FRAMES
========================================================= */

function clearKeyFrames() {

  AppState.keyFrames =
    [];


  renderKeyFrames();

}


/* =========================================================
   95. CLEAR FEEDBACK
========================================================= */

function clearFeedback() {

  const container =
    $("analysisFeedbackList");


  if (container) {

    container.innerHTML =
      '<div class="empty-state">' +
      "분석이 완료되면 피드백이 표시됩니다." +
      "</div>";

  }

}


/* =========================================================
   96. RESET ANALYSIS RESULTS
========================================================= */

function resetAnalysisResults() {

  stopAnalysisLoop();


  AppState.analyzing =
    false;


  AppState.analysisFrames =
    [];


  AppState.keyFrames =
    [];


  AppState.trajectory =
    [];


  AppState.latestPose =
    null;


  AppState.currentAnalysis =
    null;


  AppState.currentReport =
    null;


  currentLandmarks =
    null;


  previousCenterPoint =
    null;


  previousCenterTime =
    null;


  stepCounter =
    0;


  previousAnkleState =
    null;


  clearAnalysisCanvases();

  clearKeyFrames();

  clearFeedback();


  resetLiveValues();


  if (
    AppState.charts.angle
  ) {

    AppState.charts.angle
      .data
      .labels =
      [];


    AppState.charts.angle
      .data
      .datasets
      .forEach(
        function (dataset) {

          dataset.data =
            [];

        }
      );


    AppState.charts.angle
      .update();

  }


  const summary =
    $("analysisSummaryPanel");


  if (summary) {

    summary.classList.add(
      "hidden"
    );

  }


  const reportButton =
    $("finishReportButton");


  if (reportButton) {

    reportButton.disabled =
      true;

  }

}


/* =========================================================
   97. RESET LIVE VALUES
========================================================= */

function resetLiveValues() {

  [
    "leftKneeAngle",
    "rightKneeAngle",

    "leftHipAngle",
    "rightHipAngle",

    "leftAnkleAngle",
    "rightAnkleAngle",

    "trunkAngle",

    "speedMetricValue",
    "powerMetricValue",
    "agilityMetricValue",
    "stabilityMetricValue",
    "symmetryMetricValue",
    "techniqueMetricValue",

    "jumpHeight",
    "jumpFlightTime",
    "jumpTakeoffAngle",
    "sprintCadence"

  ].forEach(
    function (id) {

      setText(
        id,
        "--"
      );

    }
  );


  setText(
    "sprintStepCount",
    "0"
  );


  setText(
    "analysisPhaseText",
    "READY"
  );


  [
    "speedMetricBar",
    "powerMetricBar",
    "agilityMetricBar",
    "stabilityMetricBar",
    "symmetryMetricBar",
    "techniqueMetricBar"
  ].forEach(
    function (id) {

      const bar =
        $(id);


      if (bar) {

        bar.style.width =
          "0%";

      }

    }
  );

}


/* =========================================================
   98. RESET ANALYSIS UI
========================================================= */

function resetAnalysisUI() {

  resetLiveValues();

  renderKeyFrames();

  clearFeedback();

  setAnalysisStatus(
    "STANDBY",
    ""
  );

}


/* =========================================================
   99. FULL RESET
========================================================= */

function resetAnalysis() {

  const video =
    $("analysisVideo");


  if (
    AppState.analyzing
  ) {

    const confirmed =
      confirm(
        "현재 분석을 초기화할까요?"
      );


    if (!confirmed) {
      return;
    }

  }


  stopAnalysisLoop();


  if (video) {

    video.pause();

    video.removeAttribute(
      "src"
    );

    video.load();

  }


  if (AppState.videoURL) {

    URL.revokeObjectURL(
      AppState.videoURL
    );

  }


  AppState.videoFile =
    null;


  AppState.videoURL =
    "";


  resetAnalysisResults();


  const empty =
    $("videoEmptyState");


  if (empty) {

    empty.classList.remove(
      "hidden"
    );

  }


  const input =
    $("videoFileInput");


  if (input) {

    input.value =
      "";

  }


  const start =
    $("startAnalysisButton");


  const stop =
    $("stopAnalysisButton");


  if (start) {

    start.disabled =
      false;

  }


  if (stop) {

    stop.disabled =
      true;

  }


  setText(
    "videoCurrentTime",
    "00:00.00"
  );


  setText(
    "videoDuration",
    "00:00.00"
  );


  const timeline =
    $("videoTimeline");


  if (timeline) {

    timeline.value =
      0;

  }


  setAnalysisStatus(
    "STANDBY",
    ""
  );


  showToast(
    "분석을 초기화했습니다."
  );

}


/* =========================================================
   100. PART 3 READY
========================================================= */

console.log(
  "[APP PART 3 READY]"
);
/* =========================================================
   APP.JS
   PART 4 / 4

   RESULT / RECORD / REPORT ENGINE

   - 분석 종료
   - 최종 점수
   - 평균 관절각
   - 피드백 생성
   - 추천 훈련
   - 분석 기록 저장
   - 기록 조회
   - 리포트 생성
   - 핵심 프레임 리포트
   - Radar Chart
   - Angle Chart
   - 설정
   - Print
========================================================= */


/* =========================================================
   101. FINISH VIDEO ANALYSIS
========================================================= */

function finishVideoAnalysis() {

  if (!AppState.analyzing) {

    if (!AppState.analysisFrames.length) {

      showToast(
        "분석된 프레임이 없습니다."
      );

      return;

    }

  }


  AppState.analyzing =
    false;


  stopAnalysisLoop();


  const video =
    $("analysisVideo");


  if (video) {

    video.pause();

  }


  const startButton =
    $("startAnalysisButton");


  const stopButton =
    $("stopAnalysisButton");


  if (startButton) {

    startButton.disabled =
      false;

  }


  if (stopButton) {

    stopButton.disabled =
      true;

  }


  if (!AppState.analysisFrames.length) {

    setAnalysisStatus(
      "NO DATA",
      ""
    );


    showToast(
      "자세를 인식하지 못했습니다."
    );

    return;

  }


  /*
     핵심 프레임이 하나도 없으면
     현재 프레임 자동 저장
  */

  if (!AppState.keyFrames.length) {

    captureKeyFrame(
      "대표 자세"
    );

  }


  const result =
    buildAnalysisResult();


  AppState.currentAnalysis =
    result;


  AppState.currentReport =
    result;


  saveAnalysisResult(
    result
  );


  renderAnalysisComplete(
    result
  );


  renderAnalysisFeedback(
    result.feedback
  );


  setAnalysisStatus(
    "COMPLETE",
    "complete"
  );


  const reportButton =
    $("finishReportButton");


  if (reportButton) {

    reportButton.disabled =
      false;

  }


  renderDashboard();


  showToast(
    "영상 분석이 완료되었습니다."
  );

}


/* =========================================================
   102. BUILD ANALYSIS RESULT
========================================================= */

function buildAnalysisResult() {

  const frames =
    AppState.analysisFrames;


  const athleteId =
    $("analysisAthleteSelect")
      ?.value || "";


  const eventId =
    $("analysisEventSelect")
      ?.value || "";


  const goal =
    $("analysisGoalSelect")
      ?.value || "technique";


  const athlete =
    getAthleteById(
      athleteId
    );


  const peEvent =
    getPEEventSafe(
      eventId
    );


  const metrics =
    calculateAverageMetrics(
      frames
    );


  const angles =
    calculateAngleSummary(
      frames
    );


  const special =
    calculateSpecialMetrics(
      frames
    );


  const score =
    calculateFinalScore(
      metrics,
      goal
    );


  const grade =
    getPerformanceGrade(
      score
    );


  const feedback =
    generateAnalysisFeedback(
      metrics,
      angles,
      peEvent
    );


  const training =
    generateTrainingRecommendations(
      metrics,
      angles,
      peEvent
    );


  return {

    id:
      createId(
        "analysis"
      ),

    athleteId,

    athleteName:
      athlete
        ? athlete.name
        : "선수 미지정",

    eventId,

    eventName:
      peEvent
        ? peEvent.name
        : "종목 미지정",

    ability:
      peEvent
        ? peEvent.ability || "-"
        : "-",

    category:
      peEvent
        ? peEvent.categoryName ||
          peEvent.category ||
          "-"
        : "-",

    goal,

    score,

    grade,

    metrics,

    angles,

    special,

    feedback,

    training,

    keyFrames:
      AppState.keyFrames.map(
        function (frame) {

          return {
            ...frame
          };

        }
      ),

    angleTimeline:
      createAngleTimeline(
        frames
      ),

    frameCount:
      frames.length,

    duration:
      $("analysisVideo")
        ?.duration || 0,

    videoName:
      AppState.videoFile
        ?.name || "-",

    createdAt:
      new Date()
        .toISOString()

  };

}


/* =========================================================
   103. AVERAGE METRICS
========================================================= */

function calculateAverageMetrics(
  frames
) {

  const names = [

    "speed",
    "power",
    "agility",
    "stability",
    "symmetry",
    "technique"

  ];


  const result = {};


  names.forEach(
    function (name) {

      result[name] =
        Math.round(
          average(
            frames.map(
              function (frame) {

                return (
                  frame.metrics?.[
                    name
                  ] || 0
                );

              }
            )
          )
        );

    }
  );


  return result;

}


/* =========================================================
   104. ANGLE SUMMARY
========================================================= */

function calculateAngleSummary(
  frames
) {

  const angleNames = [

    "leftKnee",
    "rightKnee",

    "leftHip",
    "rightHip",

    "leftAnkle",
    "rightAnkle",

    "trunk"

  ];


  const result = {};


  angleNames.forEach(
    function (name) {

      const values =
        frames
          .map(
            function (frame) {

              return Number(
                frame.angles?.[
                  name
                ]
              );

            }
          )
          .filter(
            Number.isFinite
          );


      result[name] = {

        average:
          values.length
            ? Math.round(
                average(values)
              )
            : 0,

        min:
          values.length
            ? Math.round(
                Math.min(
                  ...values
                )
              )
            : 0,

        max:
          values.length
            ? Math.round(
                Math.max(
                  ...values
                )
              )
            : 0

      };

    }
  );


  return result;

}


/* =========================================================
   105. SPECIAL METRICS
========================================================= */

function calculateSpecialMetrics(
  frames
) {

  const video =
    $("analysisVideo");


  const duration =
    video?.duration || 0;


  const trajectory =
    AppState.trajectory;


  let verticalMovement =
    0;


  if (trajectory.length > 1) {

    const ys =
      trajectory.map(
        function (point) {

          return point.y;

        }
      );


    verticalMovement =
      Math.max(...ys) -
      Math.min(...ys);

  }


  const estimatedJumpHeight =
    Math.max(
      0,
      Math.round(
        verticalMovement * 180
      )
    );


  const cadence =
    duration > 0
      ? Math.round(
          stepCounter /
          duration *
          60
        )
      : 0;


  /*
     이륙각은 현재 영상 기반 추정
  */

  const trunkValues =
    frames.map(
      function (frame) {

        return (
          frame.angles?.trunk || 0
        );

      }
    );


  const trunkAverage =
    average(
      trunkValues
    );


  const takeoffAngle =
    Math.round(
      clamp(
        90 -
        trunkAverage,
        0,
        90
      )
    );


  return {

    estimatedJumpHeight,

    cadence,

    stepCount:
      stepCounter,

    takeoffAngle,

    duration:
      Math.round(
        duration * 100
      ) / 100

  };

}


/* =========================================================
   106. FINAL SCORE
========================================================= */

function calculateFinalScore(
  metrics,
  goal
) {

  let weights = {

    technique:
      0.25,

    stability:
      0.20,

    symmetry:
      0.20,

    power:
      0.15,

    speed:
      0.10,

    agility:
      0.10

  };


  if (goal === "power") {

    weights = {

      technique:
        0.15,

      stability:
        0.15,

      symmetry:
        0.15,

      power:
        0.30,

      speed:
        0.15,

      agility:
        0.10

    };

  }


  if (goal === "speed") {

    weights = {

      technique:
        0.15,

      stability:
        0.15,

      symmetry:
        0.15,

      power:
        0.15,

      speed:
        0.25,

      agility:
        0.15

    };

  }


  if (goal === "symmetry") {

    weights = {

      technique:
        0.20,

      stability:
        0.20,

      symmetry:
        0.30,

      power:
        0.10,

      speed:
        0.10,

      agility:
        0.10

    };

  }


  let score = 0;


  Object.keys(
    weights
  )
    .forEach(
      function (name) {

        score +=
          (
            metrics[name] || 0
          ) *
          weights[name];

      }
    );


  return Math.round(
    clamp(score)
  );

}


/* =========================================================
   107. PERFORMANCE GRADE
========================================================= */

function getPerformanceGrade(
  score
) {

  if (score >= 90) {
    return "S";
  }


  if (score >= 80) {
    return "A";
  }


  if (score >= 70) {
    return "B";
  }


  if (score >= 60) {
    return "C";
  }


  return "D";

}


/* =========================================================
   108. ANALYSIS FEEDBACK
========================================================= */

function generateAnalysisFeedback(
  metrics,
  angles,
  peEvent
) {

  const feedback = [];


  /*
     대칭성
  */

  if (metrics.symmetry >= 85) {

    feedback.push({

      type:
        "good",

      title:
        "좌우 대칭성이 좋습니다.",

      text:
        "양측 관절 움직임 차이가 비교적 작게 나타났습니다."

    });

  } else {

    feedback.push({

      type:
        "warning",

      title:
        "좌우 움직임 차이 확인",

      text:
        "왼쪽과 오른쪽 무릎·고관절 움직임에 차이가 나타났습니다. 영상에서 양측 동작 타이밍을 비교해 보세요."

    });

  }


  /*
     안정성
  */

  if (metrics.stability < 70) {

    feedback.push({

      type:
        "warning",

      title:
        "자세 안정성 개선 필요",

      text:
        "동작 중 몸통과 신체중심의 움직임이 비교적 크게 나타났습니다."

    });

  } else {

    feedback.push({

      type:
        "good",

      title:
        "신체 중심 제어 양호",

      text:
        "동작 중 자세와 신체중심을 비교적 안정적으로 유지했습니다."

    });

  }


  /*
     기술
  */

  if (metrics.technique < 75) {

    feedback.push({

      type:
        "info",

      title:
        "기술 동작 반복 권장",

      text:
        "핵심 자세에서 관절 정렬과 동작 순서를 반복 확인하는 것이 좋습니다."

    });

  }


  /*
     파워
  */

  if (metrics.power >= 80) {

    feedback.push({

      type:
        "good",

      title:
        "파워 지표 우수",

      text:
        "신전 동작과 신체 이동 속도가 높은 편으로 분석되었습니다."

    });

  } else if (
    metrics.power < 65
  ) {

    feedback.push({

      type:
        "info",

      title:
        "폭발적 신전 능력 보완",

      text:
        "하체 신전 속도와 동작 연결을 향상시키는 훈련을 고려할 수 있습니다."

    });

  }


  /*
     몸통
  */

  if (
    angles.trunk?.average >
    25
  ) {

    feedback.push({

      type:
        "warning",

      title:
        "몸통 기울기 확인",

      text:
        "평균 몸통 기울기가 크게 나타났습니다. 종목 특성에 맞는 상체 각도인지 핵심 프레임에서 확인하세요."

    });

  }


  /*
     종목
  */

  if (peEvent) {

    feedback.push({

      type:
        "event",

      title:
        peEvent.name +
        " 종목 분석",

      text:
        peEvent.description ||
        "종목별 핵심 자세와 수행 타이밍을 함께 확인하세요."

    });

  }


  return feedback;

}


/* =========================================================
   109. TRAINING RECOMMENDATIONS
========================================================= */

function generateTrainingRecommendations(
  metrics,
  angles,
  peEvent
) {

  const training = [];


  if (metrics.stability < 80) {

    training.push({

      name:
        "코어 안정화",

      purpose:
        "몸통 안정성",

      examples:
        "데드버그 · 버드독 · 플랭크"

    });

  }


  if (metrics.symmetry < 80) {

    training.push({

      name:
        "단측 움직임 훈련",

      purpose:
        "좌우 대칭 개선",

      examples:
        "스플릿 스쿼트 · 스텝업 · 싱글레그 밸런스"

    });

  }


  if (metrics.power < 75) {

    training.push({

      name:
        "하체 파워",

      purpose:
        "폭발적 신전 능력",

      examples:
        "점프 스쿼트 · 박스 점프 · 메디신볼 동작"

    });

  }


  if (metrics.agility < 75) {

    training.push({

      name:
        "민첩성",

      purpose:
        "빠른 방향전환 및 신체 제어",

      examples:
        "사이드 스텝 · 반응 드릴 · 짧은 가속 드릴"

    });

  }


  if (
    angles.leftAnkle?.average < 80 ||
    angles.rightAnkle?.average < 80
  ) {

    training.push({

      name:
        "발목 가동성",

      purpose:
        "하체 동작 범위 확보",

      examples:
        "발목 가동성 드릴 · 종아리 스트레칭"

    });

  }


  /*
     아무 문제가 크게 없을 때
  */

  if (!training.length) {

    training.push({

      name:
        "기술 유지 훈련",

      purpose:
        "현재 수행 능력 유지",

      examples:
        "종목 기술 반복 · 영상 피드백 · 저강도 기술 드릴"

    });

  }


  /*
     종목명 연결
  */

  if (peEvent) {

    training.unshift({

      name:
        peEvent.name +
        " 기술 훈련",

      purpose:
        peEvent.ability ||
        "종목 수행 능력",

      examples:
        "핵심 자세 반복 · 동작 구간별 영상 비교"

    });

  }


  return training.slice(
    0,
    6
  );

}


/* =========================================================
   110. ANGLE TIMELINE
========================================================= */

function createAngleTimeline(
  frames
) {

  /*
     너무 많은 데이터 저장 방지
  */

  const maximum =
    120;


  const interval =
    Math.max(
      1,
      Math.ceil(
        frames.length /
        maximum
      )
    );


  return frames
    .filter(
      function (
        frame,
        index
      ) {

        return (
          index %
          interval ===
          0
        );

      }
    )
    .map(
      function (frame) {

        return {

          time:
            Number(
              frame.time.toFixed(
                2
              )
            ),

          leftKnee:
            Math.round(
              frame.angles.leftKnee
            ),

          rightKnee:
            Math.round(
              frame.angles.rightKnee
            ),

          leftHip:
            Math.round(
              frame.angles.leftHip
            ),

          rightHip:
            Math.round(
              frame.angles.rightHip
            )

        };

      }
    );

}


/* =========================================================
   111. SAVE ANALYSIS
========================================================= */

function saveAnalysisResult(
  result
) {

  /*
     핵심 프레임 사진은 용량이 커서
     LocalStorage 초과 가능성이 있음.
     최대 3장만 기록 저장.
  */

  const storageResult = {

    ...result,

    keyFrames:
      result.keyFrames
        .slice(0, 3)

  };


  AppState.analyses.unshift(
    storageResult
  );


  /*
     최근 30개
  */

  if (
    AppState.analyses.length >
    30
  ) {

    AppState.analyses =
      AppState.analyses.slice(
        0,
        30
      );

  }


  try {

    saveAnalyses();

  } catch (error) {

    console.warn(
      "[ANALYSIS STORAGE]",
      error
    );

  }

}


/* =========================================================
   112. ANALYSIS COMPLETE UI
========================================================= */

function renderAnalysisComplete(
  result
) {

  const summary =
    $("analysisSummaryPanel");


  if (summary) {

    summary.classList.remove(
      "hidden"
    );

  }


  setText(
    "analysisFinalScore",
    result.score
  );

}


/* =========================================================
   113. ANALYSIS FEEDBACK UI
========================================================= */

function renderAnalysisFeedback(
  feedback
) {

  const container =
    $("analysisFeedbackList");


  if (!container) {
    return;
  }


  if (!feedback?.length) {

    container.innerHTML =
      '<div class="empty-state">피드백이 없습니다.</div>';

    return;

  }


  container.innerHTML =
    feedback
      .map(
        function (item) {

          return `
            <div class="feedback-card ${escapeHTML(
              item.type || ""
            )}">

              <strong>
                ${escapeHTML(
                  item.title
                )}
              </strong>

              <p>
                ${escapeHTML(
                  item.text
                )}
              </p>

            </div>
          `;

        }
      )
      .join("");

}


/* =========================================================
   114. RECORD SETUP
========================================================= */

function setupRecords() {

  const filter =
    $("recordAthleteFilter");


  if (filter) {

    filter.addEventListener(
      "change",
      renderRecords
    );

  }


  const list =
    $("recordList");


  if (list) {

    list.addEventListener(
      "click",
      handleRecordClick
    );

  }


  renderRecords();

}


/* =========================================================
   115. RECORD RENDER
========================================================= */

function renderRecords() {

  const filter =
    $("recordAthleteFilter");


  const list =
    $("recordList");


  /*
     선수 필터
  */

  if (filter) {

    const current =
      filter.value;


    filter.innerHTML =
      '<option value="">전체 선수</option>' +

      AppState.athletes
        .map(
          function (athlete) {

            return `
              <option value="${escapeHTML(
                athlete.id
              )}">
                ${escapeHTML(
                  athlete.name
                )}
              </option>
            `;

          }
        )
        .join("");


    if (
      current &&
      AppState.athletes.some(
        function (athlete) {

          return (
            athlete.id ===
            current
          );

        }
      )
    ) {

      filter.value =
        current;

    }

  }


  const athleteId =
    filter?.value || "";


  let records =
    [...AppState.analyses];


  if (athleteId) {

    records =
      records.filter(
        function (record) {

          return (
            record.athleteId ===
            athleteId
          );

        }
      );

  }


  setText(
    "recordCount",
    records.length
  );


  if (!list) {
    return;
  }


  if (!records.length) {

    list.innerHTML =
      '<div class="empty-state">저장된 분석 기록이 없습니다.</div>';

    return;

  }


  list.innerHTML =
    records
      .map(
        function (record) {

          return `
            <article
              class="record-card"
            >

              <div>

                <span>
                  ${escapeHTML(
                    formatDateTime(
                      record.createdAt
                    )
                  )}
                </span>

                <strong>
                  ${escapeHTML(
                    record.athleteName ||
                    "선수 미지정"
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    record.eventName ||
                    "종목 미지정"
                  )}
                </p>

              </div>


              <div class="record-score">

                <strong>
                  ${Math.round(
                    record.score || 0
                  )}
                </strong>

                <span>
                  ${escapeHTML(
                    record.grade || "-"
                  )}
                </span>

              </div>


              <div class="record-actions">

                <button
                  type="button"
                  class="mini-button"
                  data-record-action="report"
                  data-record-id="${escapeHTML(
                    record.id
                  )}"
                >
                  리포트
                </button>


                <button
                  type="button"
                  class="mini-button"
                  data-record-action="delete"
                  data-record-id="${escapeHTML(
                    record.id
                  )}"
                >
                  삭제
                </button>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


/* =========================================================
   116. RECORD ACTION
========================================================= */

function handleRecordClick(
  event
) {

  const button =
    event.target.closest(
      "[data-record-action]"
    );


  if (!button) {
    return;
  }


  const recordId =
    button.dataset.recordId;


  const action =
    button.dataset.recordAction;


  const record =
    AppState.analyses.find(
      function (item) {

        return (
          item.id === recordId
        );

      }
    );


  if (!record) {

    showToast(
      "분석 기록을 찾을 수 없습니다."
    );

    return;

  }


  if (action === "report") {

    AppState.currentReport =
      record;


    navigateTo(
      "report"
    );

    return;

  }


  if (action === "delete") {

    const confirmed =
      confirm(
        "이 분석 기록을 삭제할까요?"
      );


    if (!confirmed) {
      return;
    }


    AppState.analyses =
      AppState.analyses.filter(
        function (item) {

          return (
            item.id !== recordId
          );

        }
      );


    saveAnalyses();

    renderRecords();

    renderDashboard();


    showToast(
      "분석 기록을 삭제했습니다."
    );

  }

}


/* =========================================================
   117. REPORT SETUP
========================================================= */

function setupReport() {

  const emptyAnalysisButton =
    $("reportEmptyAnalysisButton");


  const backButton =
    $("reportBackAnalysisButton");


  const printButton =
    $("printReportButton");


  if (emptyAnalysisButton) {

    emptyAnalysisButton.addEventListener(
      "click",
      function () {

        navigateTo(
          "analysis"
        );

      }
    );

  }


  if (backButton) {

    backButton.addEventListener(
      "click",
      function () {

        navigateTo(
          "analysis"
        );

      }
    );

  }


  if (printButton) {

    printButton.addEventListener(
      "click",
      function () {

        window.print();

      }
    );

  }

}


/* =========================================================
   118. REPORT RENDER
========================================================= */

function renderReport() {

  const report =
    AppState.currentReport;


  const empty =
    $("reportEmptyState");


  const content =
    $("reportContent");


  if (!report) {

    if (empty) {

      empty.classList.remove(
        "hidden"
      );

    }


    if (content) {

      content.classList.add(
        "hidden"
      );

    }


    return;

  }


  if (empty) {

    empty.classList.add(
      "hidden"
    );

  }


  if (content) {

    content.classList.remove(
      "hidden"
    );

  }


  const athlete =
    getAthleteById(
      report.athleteId
    );


  setText(
    "reportAthleteName",
    report.athleteName ||
    athlete?.name ||
    "-"
  );


  setText(
    "reportGrade",
    athlete?.grade || "-"
  );


  setText(
    "reportHeight",
    athlete?.height
      ? athlete.height + " cm"
      : "-"
  );


  setText(
    "reportWeight",
    athlete?.weight
      ? athlete.weight + " kg"
      : "-"
  );


  setText(
    "reportEventName",
    report.eventName || "-"
  );


  setText(
    "reportAbility",
    report.ability || "-"
  );


  setText(
    "reportCategory",
    report.category || "-"
  );


  setText(
    "reportDate",
    formatDateTime(
      report.createdAt
    )
  );


  setText(
    "reportTotalScore",
    report.score ?? "--"
  );


  setText(
    "reportGradeScore",
    report.grade || "-"
  );


  setText(
    "reportVideoName",
    report.videoName || "-"
  );


  setText(
    "reportFrameCount",
    report.frameCount || 0
  );


  renderReportMetrics(
    report
  );


  renderPEEvaluation(
    report
  );


  renderReportKeyFrames(
    report
  );


  renderReportAngles(
    report
  );


  renderReportSpecial(
    report
  );


  renderReportFeedback(
    report
  );


  renderTrainingRecommendations(
    report
  );


  /*
     Chart canvas는 페이지가 보인 뒤 생성
  */

  requestAnimationFrame(
    function () {

      renderReportRadar(
        report
      );


      renderReportAngleChart(
        report
      );

    }
  );

}


/* =========================================================
   119. REPORT METRICS
========================================================= */

function renderReportMetrics(
  report
) {

  const container =
    $("reportMetricGrid");


  if (!container) {
    return;
  }


  const labels = {

    speed:
      "스피드",

    power:
      "파워",

    agility:
      "민첩성",

    stability:
      "안정성",

    symmetry:
      "대칭성",

    technique:
      "기술"

  };


  container.innerHTML =
    Object.keys(labels)
      .map(
        function (key) {

          const score =
            Math.round(
              report.metrics?.[
                key
              ] || 0
            );


          return `
            <div class="report-metric-card">

              <span>
                ${labels[key]}
              </span>

              <strong>
                ${score}
              </strong>

              <div class="metric-track">

                <div
                  class="metric-fill"
                  style="width:${clamp(
                    score
                  )}%"
                ></div>

              </div>

            </div>
          `;

        }
      )
      .join("");

}


/* =========================================================
   120. PE EVALUATION
========================================================= */

function renderPEEvaluation(
  report
) {

  const container =
    $("peEvaluation");


  if (!container) {
    return;
  }


  let message = "";


  if (report.score >= 90) {

    message =
      "전체적인 움직임 완성도가 매우 높게 분석되었습니다.";

  } else if (
    report.score >= 80
  ) {

    message =
      "전반적인 수행은 좋은 편이며 세부 자세를 보완하면 더 높은 완성도를 기대할 수 있습니다.";

  } else if (
    report.score >= 70
  ) {

    message =
      "기본 수행 능력은 확보되어 있으나 핵심 동작의 안정성과 반복성이 중요합니다.";

  } else {

    message =
      "현재 영상에서 개선 가능한 동작 요소가 확인되었습니다. 핵심 자세와 추천 훈련을 참고하세요.";

  }


  container.innerHTML = `

    <span class="section-label">
      PE ENTRANCE EVALUATION
    </span>

    <h3>
      체대입시 수행 평가
    </h3>

    <div class="pe-evaluation-score">

      <strong>
        ${report.score}
      </strong>

      <span>
        /100 · ${escapeHTML(
          report.grade
        )} GRADE
      </span>

    </div>

    <p>
      ${escapeHTML(
        message
      )}
    </p>

    <small>
      ※ 본 점수는 업로드 영상의 자세 데이터를 기반으로 한
      동작 분석 점수이며 실제 대학 실기 점수 또는 합격 가능성을
      의미하지 않습니다.
    </small>
  `;

}


/* =========================================================
   121. REPORT KEY FRAMES
========================================================= */

function renderReportKeyFrames(
  report
) {

  const container =
    $("reportKeyFrames");


  if (!container) {
    return;
  }


  const frames =
    report.keyFrames || [];


  if (!frames.length) {

    container.innerHTML =
      '<div class="empty-state">저장된 핵심 자세 사진이 없습니다.</div>';

    return;

  }


  container.innerHTML =
    frames
      .map(
        function (
          frame,
          index
        ) {

          const feedback =
            getKeyFrameFeedback(
              frame,
              index
            );


          return `
            <article class="report-frame-card">

              <div class="report-frame-image">

                <img
                  src="${frame.image}"
                  alt="핵심 자세 ${index + 1}"
                >

              </div>


              <div class="report-frame-info">

                <span>
                  KEY FRAME ${index + 1}
                </span>

                <h4>
                  ${escapeHTML(
                    frame.label ||
                    "핵심 자세"
                  )}
                </h4>

                <p>
                  영상 위치:
                  ${formatVideoTime(
                    frame.time || 0
                  )}
                </p>

                <strong>
                  자세 피드백
                </strong>

                <p>
                  ${escapeHTML(
                    feedback
                  )}
                </p>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


/* =========================================================
   122. KEY FRAME FEEDBACK
========================================================= */

function getKeyFrameFeedback(
  frame,
  index
) {

  const angles =
    frame.angles;


  if (!angles) {

    return (
      "핵심 동작의 관절 정렬과 신체 중심 위치를 확인하세요."
    );

  }


  const kneeDifference =
    Math.abs(
      (
        angles.leftKnee || 0
      ) -
      (
        angles.rightKnee || 0
      )
    );


  if (kneeDifference > 15) {

    return (
      "이 프레임에서는 좌우 무릎 각도 차이가 나타납니다. 양측 체중 분배와 무릎 움직임 타이밍을 확인하세요."
    );

  }


  if (
    (
      angles.trunk || 0
    ) > 30
  ) {

    return (
      "몸통 기울기가 비교적 크게 나타난 구간입니다. 종목 수행에 필요한 기울기인지, 불필요한 상체 흔들림인지 영상을 함께 확인하세요."
    );

  }


  if (
    index === 0
  ) {

    return (
      "첫 번째 핵심 구간입니다. 준비 자세에서 중심 위치와 다음 동작으로 이어지는 연결을 확인하세요."
    );

  }


  return (
    "좌우 관절 정렬이 비교적 안정적입니다. 현재 자세를 반복해서 재현할 수 있는지 확인하세요."
  );

}


/* =========================================================
   123. REPORT ANGLES
========================================================= */

function renderReportAngles(
  report
) {

  const container =
    $("reportAngleSummary");


  if (!container) {
    return;
  }


  const labels = {

    leftKnee:
      "왼쪽 무릎",

    rightKnee:
      "오른쪽 무릎",

    leftHip:
      "왼쪽 고관절",

    rightHip:
      "오른쪽 고관절",

    leftAnkle:
      "왼쪽 발목",

    rightAnkle:
      "오른쪽 발목",

    trunk:
      "몸통 기울기"

  };


  container.innerHTML =
    Object.keys(labels)
      .map(
        function (key) {

          const data =
            report.angles?.[
              key
            ] || {};


          return `
            <div class="angle-summary-card">

              <span>
                ${labels[key]}
              </span>

              <strong>
                ${data.average ?? 0}°
              </strong>

              <small>
                MIN ${data.min ?? 0}°
                ·
                MAX ${data.max ?? 0}°
              </small>

            </div>
          `;

        }
      )
      .join("");

}


/* =========================================================
   124. REPORT SPECIAL METRICS
========================================================= */

function renderReportSpecial(
  report
) {

  const container =
    $("reportSpecialMetrics");


  if (!container) {
    return;
  }


  const special =
    report.special || {};


  container.innerHTML = `

    <div>
      <span>추정 수직 이동</span>
      <strong>
        ${
          special.estimatedJumpHeight ??
          0
        } cm*
      </strong>
    </div>

    <div>
      <span>추정 이륙각</span>
      <strong>
        ${
          special.takeoffAngle ??
          0
        }°
      </strong>
    </div>

    <div>
      <span>스텝</span>
      <strong>
        ${
          special.stepCount ??
          0
        }
      </strong>
    </div>

    <div>
      <span>케이던스</span>
      <strong>
        ${
          special.cadence ??
          0
        } spm
      </strong>
    </div>

    <div>
      <span>영상 길이</span>
      <strong>
        ${formatVideoTime(
          special.duration || 0
        )}
      </strong>
    </div>

    <small>
      * 실제 거리 보정이 없는 단안 영상 기반 추정값
    </small>
  `;

}


/* =========================================================
   125. REPORT FEEDBACK
========================================================= */

function renderReportFeedback(
  report
) {

  const container =
    $("reportFeedbackList");


  if (!container) {
    return;
  }


  const feedback =
    report.feedback || [];


  if (!feedback.length) {

    container.innerHTML =
      '<div class="empty-state">피드백이 없습니다.</div>';

    return;

  }


  container.innerHTML =
    feedback
      .map(
        function (
          item,
          index
        ) {

          return `
            <div class="report-feedback-card">

              <span>
                ${String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                )}
              </span>

              <div>

                <strong>
                  ${escapeHTML(
                    item.title
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    item.text
                  )}
                </p>

              </div>

            </div>
          `;

        }
      )
      .join("");

}


/* =========================================================
   126. TRAINING REPORT
========================================================= */

function renderTrainingRecommendations(
  report
) {

  const container =
    $("trainingRecommendationList");


  if (!container) {
    return;
  }


  const training =
    report.training || [];


  if (!training.length) {

    container.innerHTML =
      '<div class="empty-state">추천 훈련이 없습니다.</div>';

    return;

  }


  container.innerHTML =
    training
      .map(
        function (
          item,
          index
        ) {

          return `
            <article class="training-card">

              <span>
                ${String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                )}
              </span>

              <div>

                <strong>
                  ${escapeHTML(
                    item.name
                  )}
                </strong>

                <p>
                  목표:
                  ${escapeHTML(
                    item.purpose
                  )}
                </p>

                <small>
                  ${escapeHTML(
                    item.examples
                  )}
                </small>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


/* =========================================================
   127. REPORT RADAR
========================================================= */

function renderReportRadar(
  report
) {

  const canvas =
    $("reportRadarCanvas");


  if (
    !canvas ||
    typeof window.Chart !==
    "function"
  ) {
    return;
  }


  if (
    AppState.charts.radar
  ) {

    AppState.charts.radar.destroy();

  }


  AppState.charts.radar =
    new window.Chart(
      canvas,
      {

        type:
          "radar",

        data: {

          labels: [

            "스피드",
            "파워",
            "민첩성",
            "안정성",
            "대칭성",
            "기술"

          ],

          datasets: [

            {

              label:
                "PERFORMANCE",

              data: [

                report.metrics
                  ?.speed || 0,

                report.metrics
                  ?.power || 0,

                report.metrics
                  ?.agility || 0,

                report.metrics
                  ?.stability || 0,

                report.metrics
                  ?.symmetry || 0,

                report.metrics
                  ?.technique || 0

              ]

            }

          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          scales: {

            r: {

              min:
                0,

              max:
                100,

              ticks: {

                stepSize:
                  20

              }

            }

          },

          plugins: {

            legend: {

              display:
                false

            }

          }

        }

      }
    );

}


/* =========================================================
   128. REPORT ANGLE CHART
========================================================= */

function renderReportAngleChart(
  report
) {

  const canvas =
    $("reportAngleCanvas");


  if (
    !canvas ||
    typeof window.Chart !==
    "function"
  ) {

    return;

  }


  if (
    AppState.charts.reportAngle
  ) {

    AppState.charts
      .reportAngle
      .destroy();

  }


  const timeline =
    report.angleTimeline || [];


  AppState.charts.reportAngle =
    new window.Chart(
      canvas,
      {

        type:
          "line",

        data: {

          labels:
            timeline.map(
              function (item) {

                return (
                  item.time +
                  "s"
                );

              }
            ),

          datasets: [

            {

              label:
                "왼쪽 무릎",

              data:
                timeline.map(
                  function (item) {

                    return (
                      item.leftKnee
                    );

                  }
                )

            },

            {

              label:
                "오른쪽 무릎",

              data:
                timeline.map(
                  function (item) {

                    return (
                      item.rightKnee
                    );

                  }
                )

            },

            {

              label:
                "왼쪽 고관절",

              data:
                timeline.map(
                  function (item) {

                    return (
                      item.leftHip
                    );

                  }
                )

            },

            {

              label:
                "오른쪽 고관절",

              data:
                timeline.map(
                  function (item) {

                    return (
                      item.rightHip
                    );

                  }
                )

            }

          ]

        },

        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          interaction: {

            mode:
              "index",

            intersect:
              false

          },

          scales: {

            y: {

              min:
                0,

              max:
                180,

              title: {

                display:
                  true,

                text:
                  "ANGLE °"

              }

            },

            x: {

              title: {

                display:
                  true,

                text:
                  "VIDEO TIME"

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   129. SETTINGS SETUP
========================================================= */

function setupSettings() {

  const mappings = [

    [
      "settingsSkeletonOption",
      "skeletonOption",
      "skeleton"
    ],

    [
      "settingsAngleOption",
      "angleOption",
      "angle"
    ],

    [
      "settingsTrajectoryOption",
      "trajectoryOption",
      "trajectory"
    ],

    [
      "settingsCenterOfMassOption",
      "centerOfMassOption",
      "centerOfMass"
    ]

  ];


  mappings.forEach(
    function (mapping) {

      const settingsInput =
        $(mapping[0]);


      if (!settingsInput) {
        return;
      }


      settingsInput.addEventListener(
        "change",
        function () {

          AppState.settings[
            mapping[2]
          ] =
            settingsInput.checked;


          const analysisInput =
            $(mapping[1]);


          if (analysisInput) {

            analysisInput.checked =
              settingsInput.checked;

          }


          saveSettings();


          drawCurrentVideoFrame();

        }
      );

  });


  const clearButton =
    $("clearAnalysisDataButton");


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearAllAnalysisData
    );

  }


  renderSettings();

}


/* =========================================================
   130. SETTINGS RENDER
========================================================= */

function renderSettings() {

  const mappings = [

    [
      "settingsSkeletonOption",
      "skeleton"
    ],

    [
      "settingsAngleOption",
      "angle"
    ],

    [
      "settingsTrajectoryOption",
      "trajectory"
    ],

    [
      "settingsCenterOfMassOption",
      "centerOfMass"
    ]

  ];


  mappings.forEach(
    function (mapping) {

      const input =
        $(mapping[0]);


      if (input) {

        input.checked =
          AppState.settings[
            mapping[1]
          ] !== false;

      }

    }
  );

}


/* =========================================================
   131. CLEAR ANALYSIS DATA
========================================================= */

function clearAllAnalysisData() {

  const confirmed =
    confirm(
      "저장된 분석 기록을 모두 삭제할까요?\n\n선수 정보는 삭제되지 않습니다."
    );


  if (!confirmed) {
    return;
  }


  AppState.analyses =
    [];


  AppState.currentAnalysis =
    null;


  AppState.currentReport =
    null;


  saveAnalyses();


  renderDashboard();

  renderRecords();

  renderReport();


  showToast(
    "분석 기록을 모두 삭제했습니다."
  );

}


/* =========================================================
   132. KEYBOARD VIDEO CONTROL
========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      AppState.currentPage !==
      "analysis"
    ) {
      return;
    }


    /*
       input 입력 중에는 단축키 사용 X
    */

    const tag =
      document.activeElement
        ?.tagName;


    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    ) {

      return;

    }


    if (
      event.code ===
      "Space"
    ) {

      event.preventDefault();

      toggleVideoPlayback();

    }


    if (
      event.code ===
      "ArrowLeft"
    ) {

      event.preventDefault();

      moveVideoFrame(-1);

    }


    if (
      event.code ===
      "ArrowRight"
    ) {

      event.preventDefault();

      moveVideoFrame(1);

    }

  }
);


/* =========================================================
   133. VIDEO SEEK POSE UPDATE

   영상을 멈춘 상태에서 타임라인을 움직여도
   해당 프레임 자세를 다시 분석
========================================================= */

(function setupSeekAnalysis() {

  const video =
    $("analysisVideo");


  if (!video) {
    return;
  }


  let seekTimer = null;


  video.addEventListener(
    "seeked",
    function () {

      clearTimeout(
        seekTimer
      );


      seekTimer =
        setTimeout(
          async function () {

            if (
              !poseEngine ||
              !AppState.videoFile
            ) {
              return;
            }


            await processVideoPose();

          },
          80
        );

    }
  );

})();


/* =========================================================
   134. ANALYSIS OPTION LIVE UPDATE
========================================================= */

[
  "skeletonOption",
  "angleOption",
  "trajectoryOption",
  "centerOfMassOption",
  "referenceLineOption"
]
  .forEach(
    function (id) {

      const input =
        $(id);


      if (!input) {
        return;
      }


      input.addEventListener(
        "change",
        function () {

          drawCurrentVideoFrame();

        }
      );

    }
  );


/* =========================================================
   135. VIDEO DOUBLE CLICK

   영상 더블클릭 = 재생 / 정지
========================================================= */

(function setupVideoDoubleClick() {

  const stage =
    $("videoStage");


  if (!stage) {
    return;
  }


  stage.addEventListener(
    "dblclick",
    function (event) {

      if (
        event.target.closest(
          "button"
        )
      ) {

        return;

      }


      toggleVideoPlayback();

    }
  );

})();


/* =========================================================
   136. PAGE VISIBILITY

   다른 앱/탭으로 이동하면 영상 자동 정지
========================================================= */

document.addEventListener(
  "visibilitychange",
  function () {

    if (
      document.hidden
    ) {

      const video =
        $("analysisVideo");


      if (
        video &&
        !video.paused
      ) {

        video.pause();

      }

    }

  }
);


/* =========================================================
   137. BEFORE UNLOAD
========================================================= */

window.addEventListener(
  "beforeunload",
  function () {

    stopAnalysisLoop();


    if (
      AppState.videoURL
    ) {

      try {

        URL.revokeObjectURL(
          AppState.videoURL
        );

      } catch (error) {

        console.warn(error);

      }

    }

  }
);


/* =========================================================
   138. SYSTEM TEST
========================================================= */

function runSystemCheck() {

  const checks = {

    navigation:
      !!document.querySelector(
        "[data-page]"
      ),

    dashboard:
      !!$("page-dashboard"),

    athletes:
      !!$("page-athletes"),

    events:
      !!$("page-events"),

    analysis:
      !!$("page-analysis"),

    records:
      !!$("page-records"),

    report:
      !!$("page-report"),

    video:
      !!$("analysisVideo"),

    poseCanvas:
      !!$("poseCanvas"),

    trajectoryCanvas:
      !!$("trajectoryCanvas"),

    chart:
      typeof window.Chart ===
      "function",

    mediapipe:
      typeof window.Pose ===
      "function"

  };


  console.table(
    checks
  );


  const failed =
    Object.entries(
      checks
    )
      .filter(
        function (entry) {

          return (
            entry[1] === false
          );

        }
      );


  if (failed.length) {

    console.warn(
      "[SYSTEM CHECK FAILED]",
      failed
    );


    return false;

  }


  console.log(
    "[SYSTEM CHECK PASSED]"
  );


  return true;

}


/* =========================================================
   139. FINAL INITIAL REFRESH

   DOMContentLoaded 이후 bootApplication이 실행되므로
   약간 뒤에 연결 상태 검사
========================================================= */

window.addEventListener(
  "load",
  function () {

    setTimeout(
      function () {

        runSystemCheck();

        refreshAnalysisSelectors();

        renderDashboard();

        renderAthletes();

        renderEventPage();

        renderRecords();

      },
      300
    );

  }
);


/* =========================================================
   140. GLOBAL DEBUG

   개발자 콘솔에서
   PE_DEBUG.check()
   PE_DEBUG.page("analysis")
   등으로 테스트 가능
========================================================= */

window.PE_DEBUG = {

  check:
    runSystemCheck,

  page:
    navigateTo,

  state:
    AppState,

  dashboard:
    renderDashboard,

  athletes:
    renderAthletes,

  events:
    renderEventPage,

  records:
    renderRecords,

  report:
    renderReport

};


/* =========================================================
   APP COMPLETE
========================================================= */

console.log(
  "========================================"
);

console.log(
  "SEOLCHEON PE PERFORMANCE LAB"
);

console.log(
  "APP.JS PART 4 / 4 READY"
);

console.log(
  "FULL SYSTEM CODE LOADED"
);

console.log(
  "========================================"
);