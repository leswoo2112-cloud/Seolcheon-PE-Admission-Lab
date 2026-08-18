/* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   PART 1 / 4

   CORE
   - App State
   - Storage
   - Navigation
   - Athlete Management
   - Event Rendering
   - Event → Video Analysis
========================================================= */

"use strict";


/* =========================================================
   01. APP CONFIG
========================================================= */

const APP_CONFIG = {

  name: "설천고 PE PERFORMANCE LAB",

  version: "2.0.0",

  storage: {
    athletes: "seolcheon_pe_athletes_v2",
    analyses: "seolcheon_pe_analyses_v2",
    settings: "seolcheon_pe_settings_v2",
    selectedAthlete: "seolcheon_pe_selected_athlete_v2"
  },

  defaultAthlete: {
    id: "athlete-eunsung",
    name: "이은성",
    grade: "고1",
    height: 175,
    weight: 65,
    group: "바이애슬론"
  }

};


/* =========================================================
   02. GLOBAL STATE
========================================================= */

const AppState = {

  currentPage: "dashboard",

  selectedAthleteId: null,

  selectedEventId: null,

  selectedCategory: "all",

  searchKeyword: "",

  athletes: [],

  analyses: [],

  settings: {
    skeleton: true,
    angles: true,
    trajectory: true,
    referenceLine: true,
    centerOfMass: true,
    autoKeyFrame: true
  },

  video: {
    file: null,
    url: null,
    duration: 0,
    currentTime: 0,
    playing: false,
    speed: 1
  },

  analysis: {
    running: false,
    finished: false,

    startedAt: null,
    finishedAt: null,

    frameCount: 0,

    currentPhase: "대기",

    score: 0,

    angles: {
      leftKnee: null,
      rightKnee: null,
      leftHip: null,
      rightHip: null,
      leftAnkle: null,
      rightAnkle: null,
      leftElbow: null,
      rightElbow: null,
      trunk: null
    },

    graphData: {
      time: [],
      leftKnee: [],
      rightKnee: [],
      leftHip: [],
      rightHip: [],
      trunk: []
    },

    trajectory: [],

    centerOfMass: [],

    keyFrames: [],

    jump: {
      takeoffTime: null,
      landingTime: null,
      flightTime: 0,
      estimatedHeight: 0,
      takeoffAngle: 0,
      maxCenterHeight: 0
    },

    sprint: {
      cadence: 0,
      stepCount: 0,
      estimatedStride: 0
    },

    metrics: {
      speed: 0,
      power: 0,
      agility: 0,
      stability: 0,
      symmetry: 0,
      technique: 0
    }
  }

};


/* =========================================================
   03. DOM HELPER
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}


function $$(selector, parent = document) {
  return Array.from(
    parent.querySelectorAll(selector)
  );
}


function byId(id) {
  return document.getElementById(id);
}


/* =========================================================
   04. SAFE JSON
========================================================= */

function safeJSONParse(value, fallback) {

  try {

    const parsed = JSON.parse(value);

    return parsed ?? fallback;

  } catch (error) {

    console.warn(
      "[STORAGE] JSON parse 실패",
      error
    );

    return fallback;

  }

}


/* =========================================================
   05. STORAGE
========================================================= */

const Storage = {

  get(key, fallback = null) {

    try {

      const value =
        localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return safeJSONParse(
        value,
        fallback
      );

    } catch (error) {

      console.warn(
        "[STORAGE] 읽기 실패",
        error
      );

      return fallback;

    }

  },


  set(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.error(
        "[STORAGE] 저장 실패",
        error
      );

      return false;

    }

  },


  remove(key) {

    try {

      localStorage.removeItem(key);

      return true;

    } catch (error) {

      return false;

    }

  }

};


/* =========================================================
   06. LOAD DATA
========================================================= */

function loadAppData() {

  AppState.athletes =
    Storage.get(
      APP_CONFIG.storage.athletes,
      []
    );


  if (!Array.isArray(AppState.athletes)) {
    AppState.athletes = [];
  }


  if (AppState.athletes.length === 0) {

    AppState.athletes.push({
      ...APP_CONFIG.defaultAthlete
    });

    saveAthletes();

  }


  AppState.analyses =
    Storage.get(
      APP_CONFIG.storage.analyses,
      []
    );


  if (!Array.isArray(AppState.analyses)) {
    AppState.analyses = [];
  }


  const savedSettings =
    Storage.get(
      APP_CONFIG.storage.settings,
      {}
    );


  AppState.settings = {
    ...AppState.settings,
    ...savedSettings
  };


  const savedAthleteId =
    Storage.get(
      APP_CONFIG.storage.selectedAthlete,
      null
    );


  const exists =
    AppState.athletes.some(
      athlete =>
        athlete.id === savedAthleteId
    );


  AppState.selectedAthleteId =
    exists
      ? savedAthleteId
      : AppState.athletes[0].id;

}


/* =========================================================
   07. SAVE DATA
========================================================= */

function saveAthletes() {

  Storage.set(
    APP_CONFIG.storage.athletes,
    AppState.athletes
  );

}


function saveAnalyses() {

  Storage.set(
    APP_CONFIG.storage.analyses,
    AppState.analyses
  );

}


function saveSettings() {

  Storage.set(
    APP_CONFIG.storage.settings,
    AppState.settings
  );

}


function saveSelectedAthlete() {

  Storage.set(
    APP_CONFIG.storage.selectedAthlete,
    AppState.selectedAthleteId
  );

}


/* =========================================================
   08. UTILITIES
========================================================= */

function createId(prefix = "id") {

  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}


function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(value, min),
    max
  );

}


function round(
  value,
  digits = 1
) {

  const power =
    Math.pow(10, digits);

  return (
    Math.round(value * power) /
    power
  );

}


function formatTime(seconds) {

  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    seconds = 0;
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  return (
    String(minutes)
      .padStart(2, "0") +
    ":" +
    String(secs)
      .padStart(2, "0")
  );

}


function formatDateTime(dateValue) {

  const date =
    dateValue
      ? new Date(dateValue)
      : new Date();

  if (
    Number.isNaN(date.getTime())
  ) {
    return "-";
  }

  return date.toLocaleString(
    "ko-KR"
  );

}


/* =========================================================
   09. TOAST
========================================================= */

let toastTimer = null;


function showToast(
  message,
  duration = 2200
) {

  const toast =
    byId("toast");

  if (!toast) {

    console.log(
      "[TOAST]",
      message
    );

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, duration);

}


/* =========================================================
   10. CURRENT ATHLETE
========================================================= */

function getSelectedAthlete() {

  return (
    AppState.athletes.find(
      athlete =>
        athlete.id ===
        AppState.selectedAthleteId
    ) ||
    AppState.athletes[0] ||
    null
  );

}


/* =========================================================
   11. CURRENT EVENT
========================================================= */

function getSelectedEvent() {

  if (
    typeof getEventById !==
    "function"
  ) {
    return null;
  }

  return getEventById(
    AppState.selectedEventId
  );

}


/* =========================================================
   12. PAGE NAVIGATION
========================================================= */

function navigateTo(pageName) {

  const pages =
    $$(".page");


  pages.forEach(page => {

    page.classList.remove(
      "active"
    );

  });


  const target =
    byId(
      `page-${pageName}`
    );


  if (!target) {

    console.warn(
      `[NAV] 페이지 없음: ${pageName}`
    );

    return;

  }


  target.classList.add(
    "active"
  );


  AppState.currentPage =
    pageName;


  $$(".nav-item").forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.page ===
          pageName
      );

    }
  );


  closeMobileSidebar();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  handlePageEntered(
    pageName
  );

}


/* =========================================================
   13. PAGE ENTER
========================================================= */

function handlePageEntered(pageName) {

  switch (pageName) {

    case "dashboard":

      renderDashboard();

      break;


    case "athletes":

      renderAthleteManagement();

      break;


    case "events":

      renderEventPage();

      break;


    case "analysis":

      updateAnalysisPage();

      break;


    case "records":

      renderRecords();

      break;


    case "report":

      if (
        typeof renderReport ===
        "function"
      ) {

        renderReport();

      }

      break;

  }

}


/* =========================================================
   14. NAVIGATION EVENTS
========================================================= */

function bindNavigation() {

  $$(".nav-item").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;

          if (page) {
            navigateTo(page);
          }

        }
      );

    }
  );


  const mobileMenuButton =
    byId("mobileMenuButton");


  if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
      "click",
      toggleMobileSidebar
    );

  }

}


/* =========================================================
   15. MOBILE SIDEBAR
========================================================= */

function toggleMobileSidebar() {

  const sidebar =
    $(".sidebar");

  if (!sidebar) {
    return;
  }

  sidebar.classList.toggle(
    "mobile-open"
  );

}


function closeMobileSidebar() {

  const sidebar =
    $(".sidebar");

  if (!sidebar) {
    return;
  }

  sidebar.classList.remove(
    "mobile-open"
  );

}


/* =========================================================
   16. CLOCK
========================================================= */

function updateClock() {

  const dateElement =
    byId("headerDate");

  const timeElement =
    byId("headerTime");


  const now =
    new Date();


  if (dateElement) {

    dateElement.textContent =
      now.toLocaleDateString(
        "ko-KR",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      );

  }


  if (timeElement) {

    timeElement.textContent =
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

}


/* =========================================================
   17. DASHBOARD
========================================================= */

function renderDashboard() {

  const athlete =
    getSelectedAthlete();


  setText(
    "dashboardAthleteCount",
    AppState.athletes.length
  );


  setText(
    "dashboardAnalysisCount",
    AppState.analyses.length
  );


  const scores =
    AppState.analyses
      .map(item =>
        Number(item.score)
      )
      .filter(Number.isFinite);


  const averageScore =
    scores.length
      ? round(
          scores.reduce(
            (a, b) => a + b,
            0
          ) / scores.length,
          1
        )
      : 0;


  setText(
    "dashboardAverageScore",
    scores.length
      ? averageScore
      : "--"
  );


  setText(
    "dashboardReportCount",
    AppState.analyses.length
  );


  if (athlete) {

    setText(
      "dashboardAthleteName",
      athlete.name
    );

    setText(
      "dashboardAthleteSport",
      athlete.group || "-"
    );

    setText(
      "dashboardAthleteHeight",
      athlete.height
        ? `${athlete.height}cm`
        : "-"
    );

    setText(
      "dashboardAthleteWeight",
      athlete.weight
        ? `${athlete.weight}kg`
        : "-"
    );

    setText(
      "dashboardAthleteGrade",
      athlete.grade || "-"
    );

  }


  renderDashboardRecent();

}


/* =========================================================
   18. SET TEXT
========================================================= */

function setText(
  id,
  value
) {

  const element =
    byId(id);

  if (element) {

    element.textContent =
      value ?? "-";

  }

}


/* =========================================================
   19. DASHBOARD RECENT
========================================================= */

function renderDashboardRecent() {

  const container =
    byId("dashboardRecentList");

  if (!container) {
    return;
  }


  const recent =
    [...AppState.analyses]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);


  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state">
        아직 저장된 분석 기록이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    recent
      .map(record => {

        const event =
          typeof getEventById ===
          "function"
            ? getEventById(
                record.eventId
              )
            : null;

        return `
          <div class="recent-item">

            <strong>
              ${escapeHTML(
                event?.name ||
                record.eventName ||
                "분석"
              )}
            </strong>

            <p>
              ${escapeHTML(
                record.athleteName ||
                "-"
              )}
              ·
              ${Number(
                record.score || 0
              ).toFixed(0)}점
            </p>

            <small>
              ${escapeHTML(
                formatDateTime(
                  record.createdAt
                )
              )}
            </small>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   20. HTML ESCAPE
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
   21. ATHLETE MANAGEMENT
========================================================= */

function renderAthleteManagement() {

  renderAthleteList();

  fillAthleteSelectors();

}


/* =========================================================
   22. ATHLETE LIST
========================================================= */

function renderAthleteList() {

  const container =
    byId("athleteList");

  if (!container) {
    return;
  }


  if (!AppState.athletes.length) {

    container.innerHTML = `
      <div class="empty-state">
        등록된 선수가 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    AppState.athletes
      .map(athlete => {

        const active =
          athlete.id ===
          AppState.selectedAthleteId;

        return `
          <button
            type="button"
            class="athlete-list-item ${
              active
                ? "active"
                : ""
            }"
            data-athlete-id="${
              athlete.id
            }"
          >

            <strong>
              ${escapeHTML(
                athlete.name
              )}
            </strong>

            <span>
              ${escapeHTML(
                athlete.grade ||
                "-"
              )}
              ·
              ${escapeHTML(
                athlete.group ||
                "-"
              )}
            </span>

          </button>
        `;

      })
      .join("");


  $$(
    "[data-athlete-id]",
    container
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectAthlete(
          button.dataset.athleteId
        );

      }
    );

  });

}


/* =========================================================
   23. SELECT ATHLETE
========================================================= */

function selectAthlete(id) {

  const athlete =
    AppState.athletes.find(
      item =>
        item.id === id
    );


  if (!athlete) {
    return;
  }


  AppState.selectedAthleteId =
    id;


  saveSelectedAthlete();


  renderAthleteManagement();

  renderDashboard();


  showToast(
    `${athlete.name} 선수 선택`
  );

}


/* =========================================================
   24. ATHLETE SELECT OPTIONS
========================================================= */

function fillAthleteSelectors() {

  const selectors = [

    byId("analysisAthleteSelect"),

    byId("recordAthleteFilter"),

    byId("reportAthleteSelect")

  ].filter(Boolean);


  selectors.forEach(select => {

    const current =
      select.value;


    let html = "";


    if (
      select.id ===
      "recordAthleteFilter"
    ) {

      html += `
        <option value="">
          전체 선수
        </option>
      `;

    }


    html +=
      AppState.athletes
        .map(athlete => `
          <option value="${
            athlete.id
          }">
            ${escapeHTML(
              athlete.name
            )}
          </option>
        `)
        .join("");


    select.innerHTML =
      html;


    if (
      current &&
      [...select.options].some(
        option =>
          option.value === current
      )
    ) {

      select.value =
        current;

    } else if (
      select.id !==
      "recordAthleteFilter"
    ) {

      select.value =
        AppState.selectedAthleteId ||
        "";

    }

  });

}


/* =========================================================
   25. ADD ATHLETE
========================================================= */

function addAthleteFromForm() {

  const name =
    byId("athleteNameInput")
      ?.value
      ?.trim();


  if (!name) {

    showToast(
      "선수 이름을 입력해줘."
    );

    return;

  }


  const athlete = {

    id: createId("athlete"),

    name,

    grade:
      byId("athleteGradeInput")
        ?.value
        ?.trim() || "",

    height:
      Number(
        byId("athleteHeightInput")
          ?.value
      ) || null,

    weight:
      Number(
        byId("athleteWeightInput")
          ?.value
      ) || null,

    group:
      byId("athleteGroupInput")
        ?.value
        ?.trim() || "",

    createdAt:
      new Date().toISOString()

  };


  AppState.athletes.push(
    athlete
  );


  AppState.selectedAthleteId =
    athlete.id;


  saveAthletes();

  saveSelectedAthlete();


  clearAthleteForm();

  renderAthleteManagement();

  renderDashboard();


  showToast(
    `${athlete.name} 선수 등록 완료`
  );

}


/* =========================================================
   26. CLEAR ATHLETE FORM
========================================================= */

function clearAthleteForm() {

  [
    "athleteNameInput",
    "athleteGradeInput",
    "athleteHeightInput",
    "athleteWeightInput",
    "athleteGroupInput"
  ].forEach(id => {

    const element =
      byId(id);

    if (element) {
      element.value = "";
    }

  });

}


/* =========================================================
   27. DELETE ATHLETE
========================================================= */

function deleteSelectedAthlete() {

  const athlete =
    getSelectedAthlete();


  if (!athlete) {
    return;
  }


  if (
    AppState.athletes.length <= 1
  ) {

    showToast(
      "선수는 최소 1명 필요해."
    );

    return;

  }


  const confirmed =
    window.confirm(
      `${athlete.name} 선수를 삭제할까요?`
    );


  if (!confirmed) {
    return;
  }


  AppState.athletes =
    AppState.athletes.filter(
      item =>
        item.id !== athlete.id
    );


  AppState.selectedAthleteId =
    AppState.athletes[0].id;


  saveAthletes();

  saveSelectedAthlete();


  renderAthleteManagement();

  renderDashboard();


  showToast(
    "선수 삭제 완료"
  );

}


/* =========================================================
   28. ATHLETE BUTTON EVENTS
========================================================= */

function bindAthleteEvents() {

  const addButton =
    byId("addAthleteButton");


  if (addButton) {

    addButton.addEventListener(
      "click",
      addAthleteFromForm
    );

  }


  const deleteButton =
    byId("deleteAthleteButton");


  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      deleteSelectedAthlete
    );

  }


  const analysisSelect =
    byId("analysisAthleteSelect");


  if (analysisSelect) {

    analysisSelect.addEventListener(
      "change",
      event => {

        const id =
          event.target.value;


        if (
          AppState.athletes.some(
            athlete =>
              athlete.id === id
          )
        ) {

          AppState.selectedAthleteId =
            id;

          saveSelectedAthlete();

          renderDashboard();

        }

      }
    );

  }

}


/* =========================================================
   29. EVENT PAGE
========================================================= */

function renderEventPage() {

  renderCategoryTabs();

  renderEventGrid();

}


/* =========================================================
   30. CATEGORY TABS
========================================================= */

function renderCategoryTabs() {

  const container =
    byId("eventCategoryTabs");

  if (!container) {
    return;
  }


  if (
    typeof EVENT_CATEGORIES ===
    "undefined"
  ) {

    container.innerHTML =
      "events.js를 먼저 불러와야 합니다.";

    return;

  }


  container.innerHTML =
    Object.entries(
      EVENT_CATEGORIES
    )
      .map(
        ([key, category]) => `
          <button
            type="button"
            class="category-tab ${
              AppState.selectedCategory ===
              key
                ? "active"
                : ""
            }"
            data-event-category="${key}"
          >
            ${category.icon}
            ${escapeHTML(
              category.name
            )}
          </button>
        `
      )
      .join("");


  $$(
    "[data-event-category]",
    container
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        AppState.selectedCategory =
          button.dataset.eventCategory;

        renderCategoryTabs();

        renderEventGrid();

      }
    );

  });

}


/* =========================================================
   31. EVENT GRID
========================================================= */

function renderEventGrid() {

  const container =
    byId("eventGrid");

  if (!container) {
    return;
  }


  if (
    typeof PE_EVENTS ===
    "undefined"
  ) {

    container.innerHTML = `
      <div class="empty-state">
        events.js 데이터를 불러오지 못했습니다.
      </div>
    `;

    return;

  }


  let events =
    typeof getEventsByCategory ===
    "function"
      ? getEventsByCategory(
          AppState.selectedCategory
        )
      : [...PE_EVENTS];


  const keyword =
    String(
      AppState.searchKeyword || ""
    )
      .trim()
      .toLowerCase();


  if (keyword) {

    events =
      events.filter(event => {

        const text = [
          event.name,
          event.ability,
          event.description
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(
          keyword
        );

      });

  }


  setText(
    "eventCount",
    events.length
  );


  if (!events.length) {

    container.innerHTML = `
      <div class="empty-state">
        검색 조건에 맞는 종목이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    events
      .map(event => {

        const categoryName =
          typeof getEventCategoryName ===
          "function"
            ? getEventCategoryName(
                event
              )
            : event.category;


        const viewName =
          typeof getViewName ===
          "function"
            ? getViewName(
                event.view
              )
            : event.view;


        return `
          <article
            class="event-card"
            data-event-id="${
              event.id
            }"
            tabindex="0"
            role="button"
          >

            <div class="event-card-icon">
              ${event.icon || "◎"}
            </div>

            <h3>
              ${escapeHTML(
                event.name
              )}
            </h3>

            <p>
              ${escapeHTML(
                event.description
              )}
            </p>

            <div class="event-card-meta">

              <span>
                ${escapeHTML(
                  categoryName
                )}
              </span>

              <span>
                ${escapeHTML(
                  event.ability
                )}
              </span>

              <span>
                📹 ${escapeHTML(
                  viewName
                )}
              </span>

            </div>

          </article>
        `;

      })
      .join("");


  $$(
    "[data-event-id]",
    container
  ).forEach(card => {

    card.addEventListener(
      "click",
      () => {

        openEvent(
          card.dataset.eventId
        );

      }
    );


    card.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          openEvent(
            card.dataset.eventId
          );

        }

      }
    );

  });

}


/* =========================================================
   32. EVENT SEARCH
========================================================= */

function bindEventSearch() {

  const input =
    byId("eventSearchInput");


  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    event => {

      AppState.searchKeyword =
        event.target.value;

      renderEventGrid();

    }
  );

}


/* =========================================================
   33. OPEN EVENT
========================================================= */

function openEvent(eventId) {

  const event =
    typeof getEventById ===
    "function"
      ? getEventById(eventId)
      : null;


  if (!event) {

    showToast(
      "종목 정보를 찾지 못했습니다."
    );

    return;

  }


  AppState.selectedEventId =
    event.id;


  renderEventModal(
    event
  );

}


/* =========================================================
   34. EVENT MODAL
========================================================= */

function renderEventModal(event) {

  const modal =
    byId("eventModal");


  if (!modal) {

    /*
       모달이 없는 HTML 버전이어도
       바로 분석 화면으로 이동 가능.
    */

    startEventAnalysis(
      event.id
    );

    return;

  }


  setText(
    "eventModalIcon",
    event.icon || "◎"
  );

  setText(
    "eventModalName",
    event.name
  );

  setText(
    "eventModalAbility",
    event.ability
  );

  setText(
    "eventModalDescription",
    event.description
  );

  setText(
    "eventModalView",
    typeof getViewName ===
    "function"
      ? getViewName(event.view)
      : event.view
  );

  setText(
    "eventModalUnit",
    event.unit || "-"
  );


  const metricContainer =
    byId("eventModalMetrics");


  if (metricContainer) {

    metricContainer.innerHTML =
      (event.metrics || [])
        .map(metric => `
          <span>
            ${escapeHTML(metric)}
          </span>
        `)
        .join("");

  }


  const tipsContainer =
    byId("eventModalTips");


  if (tipsContainer) {

    tipsContainer.innerHTML =
      (event.tips || [])
        .map(tip => `
          <li>
            ${escapeHTML(tip)}
          </li>
        `)
        .join("");

  }


  modal.classList.add(
    "active"
  );

}


/* =========================================================
   35. CLOSE EVENT MODAL
========================================================= */

function closeEventModal() {

  const modal =
    byId("eventModal");

  if (modal) {

    modal.classList.remove(
      "active"
    );

  }

}


/* =========================================================
   36. START EVENT ANALYSIS

   ★ 핵심
   체대입시 종목 선택
       ↓
   영상 자세분석 화면으로 이동
========================================================= */

function startEventAnalysis(
  eventId = AppState.selectedEventId
) {

  const event =
    typeof getEventById ===
    "function"
      ? getEventById(eventId)
      : null;


  if (!event) {

    showToast(
      "분석할 종목을 먼저 선택해줘."
    );

    return;

  }


  AppState.selectedEventId =
    event.id;


  resetAnalysisState();


  closeEventModal();


  updateAnalysisPage();


  navigateTo(
    "analysis"
  );


  showToast(
    `${event.name} 영상 분석 준비 완료`
  );

}


/* =========================================================
   37. UPDATE ANALYSIS PAGE
========================================================= */

function updateAnalysisPage() {

  const event =
    getSelectedEvent();


  const athlete =
    getSelectedAthlete();


  if (athlete) {

    const select =
      byId(
        "analysisAthleteSelect"
      );

    if (select) {

      fillAthleteSelectors();

      select.value =
        athlete.id;

    }

  }


  if (!event) {

    setText(
      "analysisEventName",
      "종목을 선택해주세요"
    );

    setText(
      "analysisEventAbility",
      "-"
    );

    setText(
      "analysisRecommendedView",
      "-"
    );

    return;

  }


  setText(
    "analysisEventName",
    event.name
  );


  setText(
    "analysisEventAbility",
    event.ability
  );


  setText(
    "analysisRecommendedView",
    typeof getViewName ===
    "function"
      ? getViewName(event.view)
      : event.view
  );


  const eventSelect =
    byId(
      "analysisEventSelect"
    );


  if (eventSelect) {

    fillAnalysisEventSelect();

    eventSelect.value =
      event.id;

  }


  renderAnalysisFeatureChips(
    event
  );


  updateAnalysisStatusUI();

}


/* =========================================================
   38. ANALYSIS EVENT SELECT
========================================================= */

function fillAnalysisEventSelect() {

  const select =
    byId(
      "analysisEventSelect"
    );


  if (
    !select ||
    typeof PE_EVENTS ===
    "undefined"
  ) {
    return;
  }


  select.innerHTML =
    PE_EVENTS
      .map(event => `
        <option value="${
          event.id
        }">
          ${escapeHTML(
            event.name
          )}
        </option>
      `)
      .join("");


  if (
    AppState.selectedEventId
  ) {

    select.value =
      AppState.selectedEventId;

  }

}


/* =========================================================
   39. ANALYSIS FEATURE CHIPS
========================================================= */

function renderAnalysisFeatureChips(
  event
) {

  const container =
    byId(
      "analysisFeatureChips"
    );


  if (!container) {
    return;
  }


  const features = [];


  features.push(
    "33 POINT SKELETON"
  );

  features.push(
    "JOINT ANGLE"
  );

  features.push(
    "ANGLE GRAPH"
  );

  features.push(
    "KEY FRAME"
  );

  features.push(
    "CENTER OF MASS"
  );


  if (event.trajectory) {

    features.push(
      "TRAJECTORY"
    );

  }


  if (event.jumpAnalysis) {

    features.push(
      "JUMP ANALYSIS"
    );

    features.push(
      "TAKE-OFF"
    );

  }


  if (event.sprintAnalysis) {

    features.push(
      "SPRINT ANALYSIS"
    );

    features.push(
      "CADENCE"
    );

  }


  container.innerHTML =
    features
      .map(feature => `
        <span>
          ${feature}
        </span>
      `)
      .join("");

}


/* =========================================================
   40. RESET ANALYSIS
========================================================= */

function resetAnalysisState() {

  AppState.analysis.running =
    false;

  AppState.analysis.finished =
    false;

  AppState.analysis.startedAt =
    null;

  AppState.analysis.finishedAt =
    null;

  AppState.analysis.frameCount =
    0;

  AppState.analysis.currentPhase =
    "대기";

  AppState.analysis.score =
    0;


  Object.keys(
    AppState.analysis.angles
  ).forEach(key => {

    AppState.analysis.angles[key] =
      null;

  });


  AppState.analysis.graphData = {

    time: [],

    leftKnee: [],

    rightKnee: [],

    leftHip: [],

    rightHip: [],

    trunk: []

  };


  AppState.analysis.trajectory =
    [];

  AppState.analysis.centerOfMass =
    [];

  AppState.analysis.keyFrames =
    [];


  AppState.analysis.jump = {

    takeoffTime: null,

    landingTime: null,

    flightTime: 0,

    estimatedHeight: 0,

    takeoffAngle: 0,

    maxCenterHeight: 0

  };


  AppState.analysis.sprint = {

    cadence: 0,

    stepCount: 0,

    estimatedStride: 0

  };


  AppState.analysis.metrics = {

    speed: 0,

    power: 0,

    agility: 0,

    stability: 0,

    symmetry: 0,

    technique: 0

  };


  clearAnalysisCanvases();

  updateAnalysisStatusUI();

}


/* =========================================================
   41. CLEAR ANALYSIS CANVASES
========================================================= */

function clearAnalysisCanvases() {

  [
    "poseCanvas",
    "trajectoryCanvas"
  ].forEach(id => {

    const canvas =
      byId(id);

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

  });

}


/* =========================================================
   42. ANALYSIS STATUS UI
========================================================= */

function updateAnalysisStatusUI() {

  const status =
    byId("analysisStatus");


  if (status) {

    if (
      AppState.analysis.finished
    ) {

      status.textContent =
        "● 분석 완료";

    } else if (
      AppState.analysis.running
    ) {

      status.textContent =
        "● ANALYZING";

    } else {

      status.textContent =
        "● READY";

    }

  }


  setText(
    "analysisPhase",
    AppState.analysis.currentPhase
  );


  setText(
    "analysisFrameCount",
    AppState.analysis.frameCount
  );


  setText(
    "analysisScore",
    AppState.analysis.score
      ? Math.round(
          AppState.analysis.score
        )
      : "--"
  );

}


/* =========================================================
   43. EVENT MODAL EVENTS
========================================================= */

function bindEventModalEvents() {

  const closeButtons =
    $$(
      "[data-close-event-modal]"
    );


  closeButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        closeEventModal
      );

    }
  );


  const startButton =
    byId(
      "eventStartAnalysisButton"
    );


  if (startButton) {

    startButton.addEventListener(
      "click",
      () => {

        startEventAnalysis();

      }
    );

  }


  const modal =
    byId("eventModal");


  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeEventModal();

        }

      }
    );

  }

}


/* =========================================================
   44. ANALYSIS EVENT CHANGE
========================================================= */

function bindAnalysisEventChange() {

  const select =
    byId(
      "analysisEventSelect"
    );


  if (!select) {
    return;
  }


  select.addEventListener(
    "change",
    event => {

      const eventId =
        event.target.value;


      const selectedEvent =
        typeof getEventById ===
        "function"
          ? getEventById(eventId)
          : null;


      if (!selectedEvent) {
        return;
      }


      AppState.selectedEventId =
        eventId;


      resetAnalysisState();

      updateAnalysisPage();


      showToast(
        `${selectedEvent.name} 분석으로 변경`
      );

    }
  );

}


/* =========================================================
   45. CORE BUTTON BIND
========================================================= */

function bindCoreButtons() {

  bindNavigation();

  bindAthleteEvents();

  bindEventSearch();

  bindEventModalEvents();

  bindAnalysisEventChange();

}


/* =========================================================
   46. INITIAL RENDER
========================================================= */

function initialRender() {

  fillAthleteSelectors();

  fillAnalysisEventSelect();

  renderDashboard();

  renderAthleteManagement();

  renderEventPage();

  updateAnalysisPage();

}


/* =========================================================
   47. INITIALIZE
========================================================= */

function initializeAppCore() {

  console.log(
    `[APP] ${APP_CONFIG.name} v${APP_CONFIG.version}`
  );


  loadAppData();


  bindCoreButtons();


  initialRender();


  updateClock();


  setInterval(
    updateClock,
    1000
  );


  navigateTo(
    "dashboard"
  );


  console.log(
    "[APP] CORE READY"
  );

}


/* =========================================================
   48. DOM READY

   PART 4에서 전체 시스템 초기화 함수가 있으면
   그 함수를 우선 실행.
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
       뒤 PART에서 initializeFullApp이 만들어지면
       전체 초기화를 사용한다.
    */

    if (
      typeof window.initializeFullApp ===
      "function"
    ) {

      window.initializeFullApp();

      return;

    }


    initializeAppCore();

  }
);


/* =========================================================
   49. GLOBAL
========================================================= */

window.AppState =
  AppState;

window.APP_CONFIG =
  APP_CONFIG;

window.navigateTo =
  navigateTo;

window.openEvent =
  openEvent;

window.startEventAnalysis =
  startEventAnalysis;

window.getSelectedAthlete =
  getSelectedAthlete;

window.getSelectedEvent =
  getSelectedEvent;

window.showToast =
  showToast;
  /* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   PART 2 / 4

   VIDEO ANALYSIS SYSTEM
   - Video Upload
   - Video Controls
   - Slow Motion
   - Frame Control
   - Analysis Start / Stop
   - Analysis Finish
   - Report Transition
========================================================= */


/* =========================================================
   50. VIDEO ELEMENT
========================================================= */

function getAnalysisVideo() {

  return (
    byId("analysisVideo") ||
    byId("videoPlayer") ||
    null
  );

}


/* =========================================================
   51. VIDEO FILE INPUT
========================================================= */

function getVideoFileInput() {

  return (
    byId("videoFileInput") ||
    byId("analysisVideoInput") ||
    null
  );

}


/* =========================================================
   52. OPEN VIDEO FILE PICKER
========================================================= */

function openVideoFilePicker() {

  const input =
    getVideoFileInput();


  if (!input) {

    showToast(
      "영상 업로드 입력창을 찾지 못했습니다."
    );

    return;

  }


  input.click();

}


/* =========================================================
   53. VIDEO FILE CHANGE
========================================================= */

function handleVideoFileChange(event) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  if (
    !file.type.startsWith("video/")
  ) {

    showToast(
      "영상 파일을 선택해줘."
    );

    event.target.value = "";

    return;

  }


  loadVideoFile(
    file
  );

}


/* =========================================================
   54. LOAD VIDEO
========================================================= */

function loadVideoFile(file) {

  const video =
    getAnalysisVideo();


  if (!video) {

    showToast(
      "영상 플레이어를 찾지 못했습니다."
    );

    return;

  }


  /*
     기존 Object URL 제거
  */

  if (
    AppState.video.url
  ) {

    try {

      URL.revokeObjectURL(
        AppState.video.url
      );

    } catch (error) {

      console.warn(
        "[VIDEO] URL 해제 실패",
        error
      );

    }

  }


  /*
     분석 초기화
  */

  resetAnalysisState();


  /*
     새 영상 등록
  */

  const url =
    URL.createObjectURL(
      file
    );


  AppState.video.file =
    file;

  AppState.video.url =
    url;

  AppState.video.duration =
    0;

  AppState.video.currentTime =
    0;

  AppState.video.playing =
    false;

  AppState.video.speed =
    1;


  video.pause();

  video.src =
    url;

  video.playbackRate =
    1;

  video.load();


  /*
     파일명 표시
  */

  setText(
    "videoFileName",
    file.name
  );


  setText(
    "analysisVideoFileName",
    file.name
  );


  /*
     빈 화면 숨김
  */

  const placeholder =
    byId(
      "videoPlaceholder"
    );


  if (placeholder) {

    placeholder.classList.add(
      "hidden"
    );

  }


  /*
     플레이어 표시
  */

  video.classList.remove(
    "hidden"
  );


  updatePlaybackSpeedUI();


  showToast(
    "영상 업로드 완료"
  );

}


/* =========================================================
   55. VIDEO METADATA
========================================================= */

function handleVideoMetadata() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  AppState.video.duration =
    Number.isFinite(
      video.duration
    )
      ? video.duration
      : 0;


  /*
     Canvas를 영상 해상도에 맞춤
  */

  resizeAnalysisCanvas();


  updateVideoTimeUI();


  updateVideoProgressUI();


  drawCurrentVideoFrame();


  console.log(
    "[VIDEO] metadata loaded",
    {
      duration:
        video.duration,

      width:
        video.videoWidth,

      height:
        video.videoHeight
    }
  );

}


/* =========================================================
   56. RESIZE CANVAS
========================================================= */

function resizeAnalysisCanvas() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  const width =
    video.videoWidth || 1280;

  const height =
    video.videoHeight || 720;


  [
    "poseCanvas",
    "trajectoryCanvas"
  ].forEach(id => {

    const canvas =
      byId(id);


    if (!canvas) {
      return;
    }


    canvas.width =
      width;

    canvas.height =
      height;

  });

}


/* =========================================================
   57. VIDEO TIME UPDATE
========================================================= */

function handleVideoTimeUpdate() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  AppState.video.currentTime =
    video.currentTime;


  updateVideoTimeUI();

  updateVideoProgressUI();


  /*
     영상이 재생 중이고
     분석 중이면 프레임 분석
  */

  if (
    AppState.analysis.running
  ) {

    schedulePoseAnalysis();

  }

}


/* =========================================================
   58. VIDEO TIME UI
========================================================= */

function updateVideoTimeUI() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  const current =
    formatTime(
      video.currentTime
    );


  const duration =
    formatTime(
      Number.isFinite(
        video.duration
      )
        ? video.duration
        : 0
    );


  setText(
    "videoCurrentTime",
    current
  );


  setText(
    "videoDuration",
    duration
  );


  setText(
    "analysisVideoTime",
    `${current} / ${duration}`
  );

}


/* =========================================================
   59. VIDEO PROGRESS
========================================================= */

function updateVideoProgressUI() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  const slider =
    byId(
      "videoProgress"
    );


  if (!slider) {
    return;
  }


  const duration =
    video.duration;


  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {

    slider.value = 0;

    return;

  }


  slider.min = 0;

  slider.max = 1000;


  slider.value =
    Math.round(
      (
        video.currentTime /
        duration
      ) * 1000
    );

}


/* =========================================================
   60. VIDEO SEEK
========================================================= */

function handleVideoSeek(event) {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  const duration =
    video.duration;


  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return;
  }


  const value =
    Number(
      event.target.value
    );


  video.currentTime =
    (
      value / 1000
    ) * duration;


  drawCurrentVideoFrame();

}


/* =========================================================
   61. PLAY / PAUSE
========================================================= */

async function toggleVideoPlayback() {

  const video =
    getAnalysisVideo();


  if (
    !video ||
    !video.src
  ) {

    showToast(
      "먼저 영상을 업로드해줘."
    );

    return;

  }


  if (
    video.paused
  ) {

    try {

      await video.play();

    } catch (error) {

      console.error(
        "[VIDEO] 재생 실패",
        error
      );


      showToast(
        "영상을 재생할 수 없습니다."
      );

    }

  } else {

    video.pause();

  }

}


/* =========================================================
   62. VIDEO PLAY
========================================================= */

function handleVideoPlay() {

  AppState.video.playing =
    true;


  updatePlayButton();


  if (
    AppState.analysis.running
  ) {

    startAnalysisLoop();

  }

}


/* =========================================================
   63. VIDEO PAUSE
========================================================= */

function handleVideoPause() {

  AppState.video.playing =
    false;


  updatePlayButton();


  drawCurrentVideoFrame();

}


/* =========================================================
   64. PLAY BUTTON UI
========================================================= */

function updatePlayButton() {

  const button =
    byId(
      "videoPlayButton"
    );


  if (!button) {
    return;
  }


  const video =
    getAnalysisVideo();


  if (
    video &&
    !video.paused
  ) {

    button.innerHTML =
      "⏸ 일시정지";

  } else {

    button.innerHTML =
      "▶ 재생";

  }

}


/* =========================================================
   65. PLAYBACK SPEED
========================================================= */

function setPlaybackSpeed(
  speed
) {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  const allowed = [
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2
  ];


  const numericSpeed =
    Number(speed);


  const selectedSpeed =
    allowed.includes(
      numericSpeed
    )
      ? numericSpeed
      : 1;


  video.playbackRate =
    selectedSpeed;


  AppState.video.speed =
    selectedSpeed;


  updatePlaybackSpeedUI();


  showToast(
    `${selectedSpeed}× 재생`
  );

}


/* =========================================================
   66. SPEED UI
========================================================= */

function updatePlaybackSpeedUI() {

  const speed =
    AppState.video.speed || 1;


  setText(
    "videoSpeedValue",
    `${speed}×`
  );


  $$(
    "[data-playback-speed]"
  ).forEach(button => {

    const value =
      Number(
        button.dataset.playbackSpeed
      );


    button.classList.toggle(
      "active",
      value === speed
    );

  });

}


/* =========================================================
   67. FRAME RATE
========================================================= */

function getEstimatedFPS() {

  if (
    typeof MOTION_ANALYSIS_CONFIG !==
    "undefined"
  ) {

    return (
      MOTION_ANALYSIS_CONFIG
        .estimatedFPS ||
      30
    );

  }


  return 30;

}


/* =========================================================
   68. FRAME BACK
========================================================= */

function previousFrame() {

  moveVideoFrames(
    -1
  );

}


/* =========================================================
   69. FRAME FORWARD
========================================================= */

function nextFrame() {

  moveVideoFrames(
    1
  );

}


/* =========================================================
   70. MOVE FRAMES
========================================================= */

function moveVideoFrames(
  frameAmount
) {

  const video =
    getAnalysisVideo();


  if (
    !video ||
    !video.src
  ) {

    showToast(
      "영상을 먼저 업로드해줘."
    );

    return;

  }


  video.pause();


  const fps =
    getEstimatedFPS();


  const frameTime =
    1 / fps;


  let target =
    video.currentTime +
    frameAmount *
    frameTime;


  target =
    clamp(
      target,
      0,
      Number.isFinite(
        video.duration
      )
        ? video.duration
        : target
    );


  video.currentTime =
    target;


  updateVideoTimeUI();

  updateVideoProgressUI();


  /*
     분석 중이면 이동한 프레임도 분석
  */

  if (
    AppState.analysis.running
  ) {

    schedulePoseAnalysis(
      true
    );

  }

}


/* =========================================================
   71. MOVE MULTIPLE FRAMES
========================================================= */

function moveVideoFramesAmount(
  amount
) {

  moveVideoFrames(
    amount
  );

}


/* =========================================================
   72. SEEK SECONDS
========================================================= */

function seekVideoSeconds(
  seconds
) {

  const video =
    getAnalysisVideo();


  if (
    !video ||
    !video.src
  ) {
    return;
  }


  const duration =
    Number.isFinite(
      video.duration
    )
      ? video.duration
      : Infinity;


  video.currentTime =
    clamp(
      video.currentTime +
      seconds,
      0,
      duration
    );

}


/* =========================================================
   73. VIDEO START
========================================================= */

function goVideoStart() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  video.pause();

  video.currentTime =
    0;

}


/* =========================================================
   74. VIDEO END
========================================================= */

function goVideoEnd() {

  const video =
    getAnalysisVideo();


  if (
    !video ||
    !Number.isFinite(
      video.duration
    )
  ) {
    return;
  }


  video.pause();


  video.currentTime =
    Math.max(
      0,
      video.duration - 0.01
    );

}


/* =========================================================
   75. VIDEO ENDED
========================================================= */

function handleVideoEnded() {

  AppState.video.playing =
    false;


  updatePlayButton();


  /*
     분석 중이었다면
     자동 종료하지 않고 일시정지 상태로 둠.

     사용자가 결과를 확인한 뒤
     "분석 종료" 버튼을 누를 수 있음.
  */

  if (
    AppState.analysis.running
  ) {

    AppState.analysis.currentPhase =
      "영상 종료";


    updateAnalysisStatusUI();


    showToast(
      "영상이 끝났습니다. 분석 종료를 눌러 결과를 저장할 수 있습니다.",
      3500
    );

  }

}


/* =========================================================
   76. VIDEO ERROR
========================================================= */

function handleVideoError() {

  console.error(
    "[VIDEO] 영상 로드 오류"
  );


  showToast(
    "영상 파일을 불러오지 못했습니다."
  );

}


/* =========================================================
   77. DRAW CURRENT VIDEO FRAME
========================================================= */

function drawCurrentVideoFrame() {

  const video =
    getAnalysisVideo();


  const canvas =
    byId(
      "poseCanvas"
    );


  if (
    !video ||
    !canvas ||
    video.readyState < 2
  ) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  if (
    canvas.width !==
      video.videoWidth ||
    canvas.height !==
      video.videoHeight
  ) {

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

  }


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
     Canvas 자체에 영상을 그리는 방식은
     HTML 구조에 따라 선택적으로 사용.

     video 위에 canvas overlay가 있는 경우
     영상은 video element가 보여주므로
     canvas에는 분석 정보만 표시한다.
  */

}


/* =========================================================
   78. ANALYSIS READY CHECK
========================================================= */

function canStartAnalysis() {

  const athlete =
    getSelectedAthlete();


  const event =
    getSelectedEvent();


  const video =
    getAnalysisVideo();


  if (!athlete) {

    showToast(
      "분석할 선수를 선택해줘."
    );

    return false;

  }


  if (!event) {

    showToast(
      "분석할 종목을 선택해줘."
    );

    return false;

  }


  if (
    !video ||
    !video.src
  ) {

    showToast(
      "분석할 영상을 업로드해줘."
    );

    return false;

  }


  return true;

}


/* =========================================================
   79. START ANALYSIS
========================================================= */

async function startVideoAnalysis() {

  if (
    AppState.analysis.running
  ) {

    showToast(
      "이미 분석 중입니다."
    );

    return;

  }


  if (
    !canStartAnalysis()
  ) {
    return;
  }


  /*
     이전 분석 결과 초기화
  */

  resetAnalysisState();


  AppState.analysis.running =
    true;

  AppState.analysis.finished =
    false;

  AppState.analysis.startedAt =
    new Date().toISOString();

  AppState.analysis.currentPhase =
    "분석 시작";


  updateAnalysisStatusUI();


  /*
     PART 3에서 MediaPipe 초기화
  */

  if (
    typeof initializePoseSystem ===
    "function"
  ) {

    try {

      await initializePoseSystem();

    } catch (error) {

      console.error(
        "[POSE] 초기화 오류",
        error
      );

    }

  }


  /*
     현재 프레임 즉시 분석
  */

  schedulePoseAnalysis(
    true
  );


  /*
     영상 재생 중이면
     분석 루프 시작
  */

  const video =
    getAnalysisVideo();


  if (
    video &&
    !video.paused
  ) {

    startAnalysisLoop();

  }


  showToast(
    "영상 자세분석 시작"
  );

}


/* =========================================================
   80. ANALYSIS LOOP STATE
========================================================= */

let analysisAnimationFrame =
  null;

let poseFrameBusy =
  false;

let lastAnalyzedVideoTime =
  -1;


/* =========================================================
   81. START ANALYSIS LOOP
========================================================= */

function startAnalysisLoop() {

  if (
    analysisAnimationFrame
  ) {

    cancelAnimationFrame(
      analysisAnimationFrame
    );

  }


  const loop = () => {

    if (
      !AppState.analysis.running
    ) {

      analysisAnimationFrame =
        null;

      return;

    }


    const video =
      getAnalysisVideo();


    if (
      !video ||
      video.paused ||
      video.ended
    ) {

      analysisAnimationFrame =
        null;

      return;

    }


    schedulePoseAnalysis();


    analysisAnimationFrame =
      requestAnimationFrame(
        loop
      );

  };


  analysisAnimationFrame =
    requestAnimationFrame(
      loop
    );

}


/* =========================================================
   82. SCHEDULE POSE ANALYSIS
========================================================= */

async function schedulePoseAnalysis(
  force = false
) {

  if (
    !AppState.analysis.running
  ) {
    return;
  }


  const video =
    getAnalysisVideo();


  if (
    !video ||
    video.readyState < 2
  ) {
    return;
  }


  /*
     같은 video.currentTime을
     계속 분석하지 않게 함.
  */

  if (
    !force &&
    Math.abs(
      video.currentTime -
      lastAnalyzedVideoTime
    ) < 0.015
  ) {

    return;

  }


  if (
    poseFrameBusy
  ) {
    return;
  }


  poseFrameBusy =
    true;


  try {

    lastAnalyzedVideoTime =
      video.currentTime;


    /*
       PART 3에서 실제 MediaPipe 함수 생성.
    */

    if (
      typeof analyzePoseFrame ===
      "function"
    ) {

      await analyzePoseFrame(
        video
      );

    } else {

      /*
         MediaPipe 함수가 아직 없어도
         UI가 먹통이 되지 않게 함.
      */

      AppState.analysis.frameCount +=
        1;


      AppState.analysis.currentPhase =
        "프레임 분석";


      updateAnalysisStatusUI();

    }

  } catch (error) {

    console.error(
      "[ANALYSIS] 프레임 분석 오류",
      error
    );

  } finally {

    poseFrameBusy =
      false;

  }

}


/* =========================================================
   83. STOP ANALYSIS LOOP
========================================================= */

function stopAnalysisLoop() {

  if (
    analysisAnimationFrame
  ) {

    cancelAnimationFrame(
      analysisAnimationFrame
    );


    analysisAnimationFrame =
      null;

  }


  poseFrameBusy =
    false;

}


/* =========================================================
   84. STOP ANALYSIS

   분석 종료 버튼 핵심
========================================================= */

function stopVideoAnalysis() {

  if (
    !AppState.analysis.running
  ) {

    if (
      AppState.analysis.finished
    ) {

      showToast(
        "이미 분석이 완료되었습니다."
      );

    } else {

      showToast(
        "진행 중인 분석이 없습니다."
      );

    }

    return;

  }


  const video =
    getAnalysisVideo();


  if (video) {

    video.pause();

  }


  stopAnalysisLoop();


  AppState.analysis.running =
    false;

  AppState.analysis.finished =
    true;

  AppState.analysis.finishedAt =
    new Date().toISOString();

  AppState.analysis.currentPhase =
    "분석 완료";


  /*
     PART 3에서 실제 최종 점수 계산
  */

  if (
    typeof finalizeAnalysisMetrics ===
    "function"
  ) {

    finalizeAnalysisMetrics();

  } else {

    calculateFallbackScore();

  }


  updateAnalysisStatusUI();


  renderAnalysisSummary();


  showToast(
    "분석 완료"
  );

}


/* =========================================================
   85. FALLBACK SCORE
========================================================= */

function calculateFallbackScore() {

  const frames =
    AppState.analysis.frameCount;


  if (
    frames <= 0
  ) {

    AppState.analysis.score =
      0;

    return;

  }


  /*
     AI 분석 함수가 없는 상황에서
     가짜 biomechanical 결과를 만들지 않음.

     단순히 분석 완료 상태만 표시.
  */

  AppState.analysis.score =
    0;

}


/* =========================================================
   86. ANALYSIS SUMMARY
========================================================= */

function renderAnalysisSummary() {

  const container =
    byId(
      "analysisSummary"
    );


  if (!container) {
    return;
  }


  const event =
    getSelectedEvent();


  const athlete =
    getSelectedAthlete();


  const score =
    Number(
      AppState.analysis.score
    );


  container.innerHTML = `

    <div class="analysis-summary-header">

      <div>

        <span class="eyebrow">
          ANALYSIS COMPLETE
        </span>

        <h3>
          ${escapeHTML(
            event?.name ||
            "자세분석"
          )}
        </h3>

        <p>
          ${escapeHTML(
            athlete?.name ||
            "-"
          )}
        </p>

      </div>

      <div class="analysis-summary-score">

        <strong>
          ${
            score > 0
              ? Math.round(score)
              : "--"
          }
        </strong>

        <span>
          / 100
        </span>

      </div>

    </div>


    <div class="analysis-summary-grid">

      ${createSummaryMetricHTML(
        "스피드",
        AppState.analysis
          .metrics.speed
      )}

      ${createSummaryMetricHTML(
        "파워",
        AppState.analysis
          .metrics.power
      )}

      ${createSummaryMetricHTML(
        "민첩성",
        AppState.analysis
          .metrics.agility
      )}

      ${createSummaryMetricHTML(
        "안정성",
        AppState.analysis
          .metrics.stability
      )}

      ${createSummaryMetricHTML(
        "대칭성",
        AppState.analysis
          .metrics.symmetry
      )}

      ${createSummaryMetricHTML(
        "기술",
        AppState.analysis
          .metrics.technique
      )}

    </div>

  `;

}


/* =========================================================
   87. SUMMARY METRIC HTML
========================================================= */

function createSummaryMetricHTML(
  name,
  value
) {

  const numericValue =
    Number(value);


  return `

    <div class="summary-metric">

      <span>
        ${escapeHTML(name)}
      </span>

      <strong>
        ${
          numericValue > 0
            ? Math.round(
                numericValue
              )
            : "--"
        }
      </strong>

    </div>

  `;

}


/* =========================================================
   88. SAVE CURRENT ANALYSIS
========================================================= */

function saveCurrentAnalysis() {

  if (
    !AppState.analysis.finished
  ) {

    showToast(
      "먼저 분석을 종료해줘."
    );

    return null;

  }


  const athlete =
    getSelectedAthlete();


  const event =
    getSelectedEvent();


  if (
    !athlete ||
    !event
  ) {

    showToast(
      "선수 또는 종목 정보가 없습니다."
    );

    return null;

  }


  const record = {

    id:
      createId(
        "analysis"
      ),

    athleteId:
      athlete.id,

    athleteName:
      athlete.name,

    eventId:
      event.id,

    eventName:
      event.name,

    category:
      event.category,

    ability:
      event.ability,

    score:
      AppState.analysis.score,

    frameCount:
      AppState.analysis.frameCount,

    angles:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.angles
        )
      ),

    graphData:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.graphData
        )
      ),

    trajectory:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.trajectory
        )
      ),

    centerOfMass:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.centerOfMass
        )
      ),

    keyFrames:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.keyFrames
        )
      ),

    jump:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.jump
        )
      ),

    sprint:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.sprint
        )
      ),

    metrics:
      JSON.parse(
        JSON.stringify(
          AppState.analysis.metrics
        )
      ),

    video: {

      name:
        AppState.video.file?.name ||
        "",

      duration:
        AppState.video.duration,

      analyzedTime:
        AppState.video.currentTime

    },

    startedAt:
      AppState.analysis.startedAt,

    finishedAt:
      AppState.analysis.finishedAt,

    createdAt:
      new Date().toISOString()

  };


  AppState.analyses.push(
    record
  );


  saveAnalyses();


  /*
     리포트가 어떤 분석을 보여줄지 기억
  */

  AppState.currentReportId =
    record.id;


  renderDashboard();


  showToast(
    "분석 기록 저장 완료"
  );


  return record;

}


/* =========================================================
   89. FINISH → REPORT
========================================================= */

function finishAnalysisAndOpenReport() {

  /*
     분석 중이면 먼저 종료
  */

  if (
    AppState.analysis.running
  ) {

    stopVideoAnalysis();

  }


  if (
    !AppState.analysis.finished
  ) {

    showToast(
      "완료된 분석이 없습니다."
    );

    return;

  }


  const record =
    saveCurrentAnalysis();


  if (!record) {
    return;
  }


  /*
     PART 4에서 리포트 렌더링
  */

  if (
    typeof renderReport ===
    "function"
  ) {

    renderReport(
      record
    );

  }


  navigateTo(
    "report"
  );

}


/* =========================================================
   90. RESTART ANALYSIS
========================================================= */

function restartVideoAnalysis() {

  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  video.pause();


  video.currentTime =
    0;


  resetAnalysisState();


  lastAnalyzedVideoTime =
    -1;


  updateVideoTimeUI();

  updateVideoProgressUI();


  showToast(
    "분석을 초기화했습니다."
  );

}


/* =========================================================
   91. CAPTURE CURRENT FRAME
========================================================= */

function captureCurrentFrame() {

  const video =
    getAnalysisVideo();


  if (
    !video ||
    video.readyState < 2
  ) {

    showToast(
      "캡처할 영상이 없습니다."
    );

    return null;

  }


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
     Pose overlay도 합성
  */

  const poseCanvas =
    byId(
      "poseCanvas"
    );


  if (
    poseCanvas &&
    poseCanvas.width > 0
  ) {

    ctx.drawImage(
      poseCanvas,
      0,
      0,
      canvas.width,
      canvas.height
    );

  }


  return canvas;

}


/* =========================================================
   92. SAVE KEY FRAME
========================================================= */

function saveManualKeyFrame() {

  const canvas =
    captureCurrentFrame();


  if (!canvas) {
    return;
  }


  let imageData = "";


  try {

    imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.78
      );

  } catch (error) {

    console.error(
      "[KEY FRAME] 이미지 생성 실패",
      error
    );

    return;

  }


  const video =
    getAnalysisVideo();


  const frame = {

    id:
      createId(
        "frame"
      ),

    time:
      video?.currentTime ||
      0,

    image:
      imageData,

    phase:
      AppState.analysis
        .currentPhase,

    angles:
      {
        ...AppState.analysis
          .angles
      },

    createdAt:
      new Date().toISOString()

  };


  /*
     너무 많은 이미지를 localStorage에 넣으면
     브라우저 저장 공간 초과 가능.

     수동 핵심 프레임은 최대 6장.
  */

  AppState.analysis
    .keyFrames
    .push(
      frame
    );


  if (
    AppState.analysis
      .keyFrames.length > 6
  ) {

    AppState.analysis
      .keyFrames
      .shift();

  }


  renderKeyFrameList();


  showToast(
    "현재 자세를 핵심 프레임으로 저장했습니다."
  );

}


/* =========================================================
   93. KEY FRAME LIST
========================================================= */

function renderKeyFrameList() {

  const container =
    byId(
      "keyFrameList"
    );


  if (!container) {
    return;
  }


  const frames =
    AppState.analysis
      .keyFrames;


  if (!frames.length) {

    container.innerHTML = `
      <div class="empty-state">
        저장된 핵심 프레임이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    frames
      .map(
        (
          frame,
          index
        ) => `

          <button
            type="button"
            class="key-frame-card"
            data-key-frame-index="${index}"
          >

            <img
              src="${frame.image}"
              alt="핵심 프레임 ${
                index + 1
              }"
            >

            <div>

              <strong>
                FRAME ${
                  index + 1
                }
              </strong>

              <span>
                ${formatTime(
                  frame.time
                )}
              </span>

            </div>

          </button>

        `
      )
      .join("");


  $$(
    "[data-key-frame-index]",
    container
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const index =
          Number(
            button.dataset
              .keyFrameIndex
          );


        goToKeyFrame(
          index
        );

      }
    );

  });

}


/* =========================================================
   94. GO TO KEY FRAME
========================================================= */

function goToKeyFrame(index) {

  const frame =
    AppState.analysis
      .keyFrames[index];


  if (!frame) {
    return;
  }


  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  video.pause();


  video.currentTime =
    frame.time;


  showToast(
    `핵심 프레임 ${index + 1}`
  );

}


/* =========================================================
   95. DELETE KEY FRAME
========================================================= */

function deleteLastKeyFrame() {

  if (
    !AppState.analysis
      .keyFrames.length
  ) {

    showToast(
      "삭제할 핵심 프레임이 없습니다."
    );

    return;

  }


  AppState.analysis
    .keyFrames
    .pop();


  renderKeyFrameList();


  showToast(
    "마지막 핵심 프레임 삭제"
  );

}


/* =========================================================
   96. TOGGLE ANALYSIS OPTION
========================================================= */

function toggleAnalysisOption(
  key
) {

  if (
    !(key in AppState.settings)
  ) {
    return;
  }


  AppState.settings[key] =
    !AppState.settings[key];


  saveSettings();


  updateAnalysisOptionUI();


  /*
     일시정지 화면이라면
     overlay 즉시 다시 그림
  */

  if (
    typeof redrawLastPose ===
    "function"
  ) {

    redrawLastPose();

  }

}


/* =========================================================
   97. ANALYSIS OPTION UI
========================================================= */

function updateAnalysisOptionUI() {

  $$(
    "[data-analysis-option]"
  ).forEach(button => {

    const key =
      button.dataset
        .analysisOption;


    const active =
      Boolean(
        AppState.settings[key]
      );


    button.classList.toggle(
      "active",
      active
    );


    button.setAttribute(
      "aria-pressed",
      String(active)
    );

  });

}


/* =========================================================
   98. VIDEO CONTROL EVENTS
========================================================= */

function bindVideoEvents() {

  const input =
    getVideoFileInput();


  if (input) {

    input.addEventListener(
      "change",
      handleVideoFileChange
    );

  }


  const uploadButton =
    byId(
      "videoUploadButton"
    );


  if (uploadButton) {

    uploadButton.addEventListener(
      "click",
      openVideoFilePicker
    );

  }


  const video =
    getAnalysisVideo();


  if (video) {

    video.addEventListener(
      "loadedmetadata",
      handleVideoMetadata
    );


    video.addEventListener(
      "timeupdate",
      handleVideoTimeUpdate
    );


    video.addEventListener(
      "play",
      handleVideoPlay
    );


    video.addEventListener(
      "pause",
      handleVideoPause
    );


    video.addEventListener(
      "ended",
      handleVideoEnded
    );


    video.addEventListener(
      "error",
      handleVideoError
    );


    video.addEventListener(
      "seeked",
      () => {

        updateVideoTimeUI();

        updateVideoProgressUI();


        if (
          AppState.analysis.running
        ) {

          schedulePoseAnalysis(
            true
          );

        } else {

          drawCurrentVideoFrame();

        }

      }
    );

  }


  const playButton =
    byId(
      "videoPlayButton"
    );


  if (playButton) {

    playButton.addEventListener(
      "click",
      toggleVideoPlayback
    );

  }


  const progress =
    byId(
      "videoProgress"
    );


  if (progress) {

    progress.addEventListener(
      "input",
      handleVideoSeek
    );

  }


  /*
     재생속도 버튼
  */

  $$(
    "[data-playback-speed]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setPlaybackSpeed(
          Number(
            button.dataset
              .playbackSpeed
          )
        );

      }
    );

  });


  /*
     1 frame backward
  */

  const previousButton =
    byId(
      "previousFrameButton"
    );


  if (previousButton) {

    previousButton.addEventListener(
      "click",
      previousFrame
    );

  }


  /*
     1 frame forward
  */

  const nextButton =
    byId(
      "nextFrameButton"
    );


  if (nextButton) {

    nextButton.addEventListener(
      "click",
      nextFrame
    );

  }


  /*
     -10 frames
  */

  const back10 =
    byId(
      "back10FramesButton"
    );


  if (back10) {

    back10.addEventListener(
      "click",
      () => {

        moveVideoFramesAmount(
          -10
        );

      }
    );

  }


  /*
     +10 frames
  */

  const forward10 =
    byId(
      "forward10FramesButton"
    );


  if (forward10) {

    forward10.addEventListener(
      "click",
      () => {

        moveVideoFramesAmount(
          10
        );

      }
    );

  }


  /*
     -5 sec
  */

  const back5Seconds =
    byId(
      "back5SecondsButton"
    );


  if (back5Seconds) {

    back5Seconds.addEventListener(
      "click",
      () => {

        seekVideoSeconds(
          -5
        );

      }
    );

  }


  /*
     +5 sec
  */

  const forward5Seconds =
    byId(
      "forward5SecondsButton"
    );


  if (forward5Seconds) {

    forward5Seconds.addEventListener(
      "click",
      () => {

        seekVideoSeconds(
          5
        );

      }
    );

  }


  const startButton =
    byId(
      "videoStartButton"
    );


  if (startButton) {

    startButton.addEventListener(
      "click",
      goVideoStart
    );

  }


  const endButton =
    byId(
      "videoEndButton"
    );


  if (endButton) {

    endButton.addEventListener(
      "click",
      goVideoEnd
    );

  }

}


/* =========================================================
   99. ANALYSIS CONTROL EVENTS
========================================================= */

function bindAnalysisControlEvents() {

  const start =
    byId(
      "startAnalysisButton"
    );


  if (start) {

    start.addEventListener(
      "click",
      startVideoAnalysis
    );

  }


  const stop =
    byId(
      "stopAnalysisButton"
    );


  if (stop) {

    stop.addEventListener(
      "click",
      stopVideoAnalysis
    );

  }


  const restart =
    byId(
      "restartAnalysisButton"
    );


  if (restart) {

    restart.addEventListener(
      "click",
      restartVideoAnalysis
    );

  }


  const report =
    byId(
      "finishAnalysisButton"
    );


  if (report) {

    report.addEventListener(
      "click",
      finishAnalysisAndOpenReport
    );

  }


  const report2 =
    byId(
      "openReportButton"
    );


  if (report2) {

    report2.addEventListener(
      "click",
      finishAnalysisAndOpenReport
    );

  }


  const capture =
    byId(
      "captureFrameButton"
    );


  if (capture) {

    capture.addEventListener(
      "click",
      saveManualKeyFrame
    );

  }


  const deleteFrame =
    byId(
      "deleteKeyFrameButton"
    );


  if (deleteFrame) {

    deleteFrame.addEventListener(
      "click",
      deleteLastKeyFrame
    );

  }


  /*
     Skeleton / Angle /
     Trajectory 등의 ON/OFF
  */

  $$(
    "[data-analysis-option]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        toggleAnalysisOption(
          button.dataset
            .analysisOption
        );

      }
    );

  });

}


/* =========================================================
   100. KEYBOARD SHORTCUTS

   분석 화면에서만 작동
========================================================= */

function bindAnalysisKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        AppState.currentPage !==
        "analysis"
      ) {
        return;
      }


      /*
         input 입력 중이면 무시
      */

      const tag =
        document.activeElement
          ?.tagName
          ?.toLowerCase();


      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
      ) {
        return;
      }


      switch (
        event.key
      ) {

        /*
           Space = 재생/정지
        */

        case " ":

          event.preventDefault();

          toggleVideoPlayback();

          break;


        /*
           ← = 이전 프레임
        */

        case "ArrowLeft":

          event.preventDefault();

          previousFrame();

          break;


        /*
           → = 다음 프레임
        */

        case "ArrowRight":

          event.preventDefault();

          nextFrame();

          break;


        /*
           K = 핵심 프레임
        */

        case "k":

        case "K":

          saveManualKeyFrame();

          break;


        /*
           1 = 0.25×
        */

        case "1":

          setPlaybackSpeed(
            0.25
          );

          break;


        /*
           2 = 0.5×
        */

        case "2":

          setPlaybackSpeed(
            0.5
          );

          break;


        /*
           3 = 1×
        */

        case "3":

          setPlaybackSpeed(
            1
          );

          break;

      }

    }
  );

}


/* =========================================================
   101. UPDATE VIDEO UI
========================================================= */

function updateVideoUI() {

  updateVideoTimeUI();

  updateVideoProgressUI();

  updatePlayButton();

  updatePlaybackSpeedUI();

  updateAnalysisOptionUI();

  renderKeyFrameList();

}


/* =========================================================
   102. VIDEO SYSTEM INITIALIZE
========================================================= */

function initializeVideoSystem() {

  bindVideoEvents();

  bindAnalysisControlEvents();

  bindAnalysisKeyboard();

  updateVideoUI();


  console.log(
    "[VIDEO] SYSTEM READY"
  );

}


/* =========================================================
   103. GLOBAL EXPORT
========================================================= */

window.openVideoFilePicker =
  openVideoFilePicker;

window.toggleVideoPlayback =
  toggleVideoPlayback;

window.setPlaybackSpeed =
  setPlaybackSpeed;

window.previousFrame =
  previousFrame;

window.nextFrame =
  nextFrame;

window.moveVideoFrames =
  moveVideoFrames;

window.startVideoAnalysis =
  startVideoAnalysis;

window.stopVideoAnalysis =
  stopVideoAnalysis;

window.restartVideoAnalysis =
  restartVideoAnalysis;

window.finishAnalysisAndOpenReport =
  finishAnalysisAndOpenReport;

window.saveManualKeyFrame =
  saveManualKeyFrame;

window.captureCurrentFrame =
  captureCurrentFrame;

window.initializeVideoSystem =
  initializeVideoSystem;
  /* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   PART 3 / 4

   POSE ANALYSIS ENGINE
   - MediaPipe Pose
   - 33 Point Skeleton
   - Joint Angles
   - Center of Mass
   - Trajectory
   - Symmetry
   - Jump Analysis
   - Sprint Analysis
   - Angle Graph Data
   - Performance Score
========================================================= */


/* =========================================================
   104. POSE ENGINE STATE
========================================================= */

let poseSystem = null;

let poseSystemReady = false;

let poseSystemLoading = false;

let lastPoseLandmarks = null;

let previousPoseLandmarks = null;

let previousPoseTime = null;

let lastPoseResultTime = 0;


/* =========================================================
   105. MOTION HISTORY
========================================================= */

const MotionHistory = {

  hipY: [],

  ankleY: [],

  kneeY: [],

  shoulderY: [],

  centerY: [],

  leftAnkleY: [],

  rightAnkleY: [],

  leftWristY: [],

  rightWristY: [],

  time: [],

  reset() {

    this.hipY = [];

    this.ankleY = [];

    this.kneeY = [];

    this.shoulderY = [];

    this.centerY = [];

    this.leftAnkleY = [];

    this.rightAnkleY = [];

    this.leftWristY = [];

    this.rightWristY = [];

    this.time = [];

  }

};


/* =========================================================
   106. MEDIAPIPE INITIALIZE
========================================================= */

async function initializePoseSystem() {

  if (poseSystemReady) {

    return true;

  }


  if (poseSystemLoading) {

    return false;

  }


  poseSystemLoading = true;


  try {

    /*
       index.html에서 MediaPipe Pose CDN을
       먼저 불러온 상태를 사용한다.

       예:
       <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"></script>
    */

    if (
      typeof window.Pose ===
      "undefined"
    ) {

      throw new Error(
        "MediaPipe Pose 라이브러리를 찾을 수 없습니다."
      );

    }


    poseSystem =
      new window.Pose({

        locateFile: file => {

          return (
            "https://cdn.jsdelivr.net/npm/@mediapipe/pose/" +
            file
          );

        }

      });


    poseSystem.setOptions({

      modelComplexity: 1,

      smoothLandmarks: true,

      enableSegmentation: false,

      smoothSegmentation: false,

      minDetectionConfidence: 0.5,

      minTrackingConfidence: 0.5

    });


    poseSystem.onResults(
      handlePoseResults
    );


    poseSystemReady = true;


    console.log(
      "[POSE] MediaPipe READY"
    );


    showToast(
      "자세분석 엔진 준비 완료"
    );


    return true;

  } catch (error) {

    console.error(
      "[POSE] 초기화 실패",
      error
    );


    showToast(
      "자세분석 엔진을 불러오지 못했습니다."
    );


    return false;

  } finally {

    poseSystemLoading = false;

  }

}


/* =========================================================
   107. ANALYZE VIDEO FRAME
========================================================= */

async function analyzePoseFrame(
  video
) {

  if (
    !video ||
    video.readyState < 2
  ) {
    return;
  }


  if (!poseSystemReady) {

    const ready =
      await initializePoseSystem();


    if (!ready) {

      return;

    }

  }


  try {

    await poseSystem.send({

      image: video

    });

  } catch (error) {

    console.warn(
      "[POSE] frame send error",
      error
    );

  }

}


/* =========================================================
   108. HANDLE POSE RESULTS
========================================================= */

function handlePoseResults(
  results
) {

  const landmarks =
    results.poseLandmarks;


  if (
    !landmarks ||
    landmarks.length < 33
  ) {

    drawPoseMissingState();

    return;

  }


  const video =
    getAnalysisVideo();


  const currentTime =
    video?.currentTime || 0;


  previousPoseLandmarks =
    lastPoseLandmarks;


  lastPoseLandmarks =
    landmarks.map(
      point => ({
        x: point.x,
        y: point.y,
        z: point.z,
        visibility:
          point.visibility ?? 1
      })
    );


  AppState.analysis.frameCount +=
    1;


  lastPoseResultTime =
    currentTime;


  /*
     계산
  */

  calculateCurrentAngles(
    landmarks
  );


  calculateCenterOfMass(
    landmarks,
    currentTime
  );


  collectMotionHistory(
    landmarks,
    currentTime
  );


  updateTrajectory(
    landmarks,
    currentTime
  );


  updateJumpAnalysis(
    landmarks,
    currentTime
  );


  updateSprintAnalysis(
    landmarks,
    currentTime
  );


  updateMovementPhase(
    landmarks
  );


  collectAngleGraphData(
    currentTime
  );


  calculateLiveMetrics(
    landmarks
  );


  /*
     화면
  */

  drawPoseOverlay(
    landmarks
  );


  drawTrajectoryCanvas();


  updateAngleUI();


  updateAnalysisStatusUI();


  updateLiveMetricUI();


  renderAngleGraph();


  previousPoseTime =
    currentTime;

}


/* =========================================================
   109. LANDMARK VALID
========================================================= */

function isLandmarkValid(
  point
) {

  if (!point) {
    return false;
  }


  const threshold =
    typeof MOTION_ANALYSIS_CONFIG !==
    "undefined"
      ? MOTION_ANALYSIS_CONFIG
          .visibilityThreshold || 0.45
      : 0.45;


  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    (
      point.visibility ===
        undefined ||
      point.visibility >=
        threshold
    )
  );

}


/* =========================================================
   110. DISTANCE 2D
========================================================= */

function distance2D(
  a,
  b
) {

  if (
    !isLandmarkValid(a) ||
    !isLandmarkValid(b)
  ) {
    return 0;
  }


  const dx =
    b.x - a.x;

  const dy =
    b.y - a.y;


  return Math.sqrt(
    dx * dx +
    dy * dy
  );

}


/* =========================================================
   111. MID POINT
========================================================= */

function midpoint(
  a,
  b
) {

  if (
    !isLandmarkValid(a) ||
    !isLandmarkValid(b)
  ) {

    return null;

  }


  return {

    x:
      (a.x + b.x) / 2,

    y:
      (a.y + b.y) / 2,

    z:
      (
        (a.z || 0) +
        (b.z || 0)
      ) / 2,

    visibility:
      Math.min(
        a.visibility ?? 1,
        b.visibility ?? 1
      )

  };

}


/* =========================================================
   112. ANGLE
========================================================= */

function calculateAngle(
  a,
  b,
  c
) {

  if (
    !isLandmarkValid(a) ||
    !isLandmarkValid(b) ||
    !isLandmarkValid(c)
  ) {

    return null;

  }


  const ab = {

    x: a.x - b.x,

    y: a.y - b.y

  };


  const cb = {

    x: c.x - b.x,

    y: c.y - b.y

  };


  const dot =
    ab.x * cb.x +
    ab.y * cb.y;


  const magAB =
    Math.sqrt(
      ab.x * ab.x +
      ab.y * ab.y
    );


  const magCB =
    Math.sqrt(
      cb.x * cb.x +
      cb.y * cb.y
    );


  if (
    magAB === 0 ||
    magCB === 0
  ) {

    return null;

  }


  let cosine =
    dot /
    (
      magAB *
      magCB
    );


  cosine =
    clamp(
      cosine,
      -1,
      1
    );


  const angle =
    Math.acos(
      cosine
    ) *
    180 /
    Math.PI;


  return round(
    angle,
    1
  );

}


/* =========================================================
   113. TRUNK ANGLE
========================================================= */

function calculateTrunkAngle(
  landmarks
) {

  const shoulder =
    midpoint(
      landmarks[11],
      landmarks[12]
    );


  const hip =
    midpoint(
      landmarks[23],
      landmarks[24]
    );


  if (
    !shoulder ||
    !hip
  ) {

    return null;

  }


  /*
     수직선 기준 몸통 기울기
  */

  const dx =
    shoulder.x -
    hip.x;


  const dy =
    hip.y -
    shoulder.y;


  if (
    Math.abs(dy) <
    0.0001
  ) {

    return 90;

  }


  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) *
    180 /
    Math.PI;


  return round(
    angle,
    1
  );

}


/* =========================================================
   114. CURRENT ANGLES
========================================================= */

function calculateCurrentAngles(
  landmarks
) {

  const angles =
    AppState.analysis
      .angles;


  angles.leftKnee =
    calculateAngle(
      landmarks[23],
      landmarks[25],
      landmarks[27]
    );


  angles.rightKnee =
    calculateAngle(
      landmarks[24],
      landmarks[26],
      landmarks[28]
    );


  angles.leftHip =
    calculateAngle(
      landmarks[11],
      landmarks[23],
      landmarks[25]
    );


  angles.rightHip =
    calculateAngle(
      landmarks[12],
      landmarks[24],
      landmarks[26]
    );


  angles.leftAnkle =
    calculateAngle(
      landmarks[25],
      landmarks[27],
      landmarks[31]
    );


  angles.rightAnkle =
    calculateAngle(
      landmarks[26],
      landmarks[28],
      landmarks[32]
    );


  angles.leftElbow =
    calculateAngle(
      landmarks[11],
      landmarks[13],
      landmarks[15]
    );


  angles.rightElbow =
    calculateAngle(
      landmarks[12],
      landmarks[14],
      landmarks[16]
    );


  angles.trunk =
    calculateTrunkAngle(
      landmarks
    );

}


/* =========================================================
   115. CENTER OF MASS ESTIMATE
========================================================= */

function estimateCenterOfMass(
  landmarks
) {

  const shoulders =
    midpoint(
      landmarks[11],
      landmarks[12]
    );


  const hips =
    midpoint(
      landmarks[23],
      landmarks[24]
    );


  if (
    !shoulders ||
    !hips
  ) {

    return null;

  }


  /*
     실제 생체역학적 COM 측정값이 아니라
     영상 기반 자세 궤적 비교용 근사값.
  */

  return {

    x:
      hips.x * 0.58 +
      shoulders.x * 0.42,

    y:
      hips.y * 0.58 +
      shoulders.y * 0.42

  };

}


/* =========================================================
   116. CENTER OF MASS HISTORY
========================================================= */

function calculateCenterOfMass(
  landmarks,
  time
) {

  const center =
    estimateCenterOfMass(
      landmarks
    );


  if (!center) {
    return;
  }


  AppState.analysis
    .centerOfMass
    .push({

      x: center.x,

      y: center.y,

      time

    });


  const max =
    typeof MOTION_ANALYSIS_CONFIG !==
    "undefined"
      ? MOTION_ANALYSIS_CONFIG
          .maxTrajectoryPoints || 250
      : 250;


  if (
    AppState.analysis
      .centerOfMass.length >
    max
  ) {

    AppState.analysis
      .centerOfMass
      .shift();

  }

}


/* =========================================================
   117. TRAJECTORY
========================================================= */

function updateTrajectory(
  landmarks,
  time
) {

  const event =
    getSelectedEvent();


  if (
    !event ||
    !event.trajectory
  ) {
    return;
  }


  const center =
    estimateCenterOfMass(
      landmarks
    );


  if (!center) {
    return;
  }


  AppState.analysis
    .trajectory
    .push({

      x: center.x,

      y: center.y,

      time

    });


  const max =
    typeof MOTION_ANALYSIS_CONFIG !==
    "undefined"
      ? MOTION_ANALYSIS_CONFIG
          .maxTrajectoryPoints || 250
      : 250;


  if (
    AppState.analysis
      .trajectory.length >
    max
  ) {

    AppState.analysis
      .trajectory
      .shift();

  }

}


/* =========================================================
   118. MOTION HISTORY
========================================================= */

function collectMotionHistory(
  landmarks,
  time
) {

  const hip =
    midpoint(
      landmarks[23],
      landmarks[24]
    );


  const knee =
    midpoint(
      landmarks[25],
      landmarks[26]
    );


  const ankle =
    midpoint(
      landmarks[27],
      landmarks[28]
    );


  const shoulder =
    midpoint(
      landmarks[11],
      landmarks[12]
    );


  const center =
    estimateCenterOfMass(
      landmarks
    );


  if (
    !hip ||
    !knee ||
    !ankle ||
    !shoulder ||
    !center
  ) {
    return;
  }


  MotionHistory.hipY.push(
    hip.y
  );

  MotionHistory.kneeY.push(
    knee.y
  );

  MotionHistory.ankleY.push(
    ankle.y
  );

  MotionHistory.shoulderY.push(
    shoulder.y
  );

  MotionHistory.centerY.push(
    center.y
  );


  MotionHistory.leftAnkleY.push(
    landmarks[27].y
  );

  MotionHistory.rightAnkleY.push(
    landmarks[28].y
  );


  MotionHistory.leftWristY.push(
    landmarks[15].y
  );

  MotionHistory.rightWristY.push(
    landmarks[16].y
  );


  MotionHistory.time.push(
    time
  );


  const max = 180;


  Object.keys(
    MotionHistory
  ).forEach(key => {

    if (
      Array.isArray(
        MotionHistory[key]
      ) &&
      MotionHistory[key].length >
        max
    ) {

      MotionHistory[key].shift();

    }

  });

}


/* =========================================================
   119. MOVEMENT PHASE
========================================================= */

function updateMovementPhase(
  landmarks
) {

  const event =
    getSelectedEvent();


  if (!event) {
    return;
  }


  const kneeAverage =
    averageValid([
      AppState.analysis
        .angles.leftKnee,

      AppState.analysis
        .angles.rightKnee
    ]);


  const hipAverage =
    averageValid([
      AppState.analysis
        .angles.leftHip,

      AppState.analysis
        .angles.rightHip
    ]);


  /*
     점프 계열
  */

  if (
    event.jumpAnalysis
  ) {

    if (
      kneeAverage !== null &&
      kneeAverage < 105
    ) {

      AppState.analysis
        .currentPhase =
        "LOAD";

    } else if (
      AppState.analysis
        .jump.takeoffTime !==
        null &&
      AppState.analysis
        .jump.landingTime ===
        null
    ) {

      AppState.analysis
        .currentPhase =
        "FLIGHT";

    } else {

      AppState.analysis
        .currentPhase =
        "READY";

    }

    return;

  }


  /*
     스프린트
  */

  if (
    event.sprintAnalysis
  ) {

    if (
      AppState.analysis
        .frameCount < 20
    ) {

      AppState.analysis
        .currentPhase =
        "START";

    } else {

      AppState.analysis
        .currentPhase =
        "RUN";

    }

    return;

  }


  /*
     근력 계열
  */

  if (
    kneeAverage !== null &&
    hipAverage !== null
  ) {

    if (
      kneeAverage < 100
    ) {

      AppState.analysis
        .currentPhase =
        "LOW";

    } else if (
      kneeAverage < 145
    ) {

      AppState.analysis
        .currentPhase =
        "MID";

    } else {

      AppState.analysis
        .currentPhase =
        "TOP";

    }

  }

}


/* =========================================================
   120. AVERAGE VALID
========================================================= */

function averageValid(
  values
) {

  const valid =
    values.filter(
      value =>
        Number.isFinite(value)
    );


  if (!valid.length) {

    return null;

  }


  return (
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    valid.length
  );

}


/* =========================================================
   121. ANGLE GRAPH DATA
========================================================= */

function collectAngleGraphData(
  time
) {

  const graph =
    AppState.analysis
      .graphData;


  graph.time.push(
    round(time, 2)
  );


  graph.leftKnee.push(
    AppState.analysis
      .angles.leftKnee
  );


  graph.rightKnee.push(
    AppState.analysis
      .angles.rightKnee
  );


  graph.leftHip.push(
    AppState.analysis
      .angles.leftHip
  );


  graph.rightHip.push(
    AppState.analysis
      .angles.rightHip
  );


  graph.trunk.push(
    AppState.analysis
      .angles.trunk
  );


  const max =
    typeof MOTION_ANALYSIS_CONFIG !==
    "undefined"
      ? MOTION_ANALYSIS_CONFIG
          .maxGraphPoints || 300
      : 300;


  while (
    graph.time.length >
    max
  ) {

    graph.time.shift();

    graph.leftKnee.shift();

    graph.rightKnee.shift();

    graph.leftHip.shift();

    graph.rightHip.shift();

    graph.trunk.shift();

  }

}


/* =========================================================
   122. SYMMETRY SCORE
========================================================= */

function calculateSymmetryScore() {

  const angles =
    AppState.analysis
      .angles;


  const pairs = [

    [
      angles.leftKnee,
      angles.rightKnee
    ],

    [
      angles.leftHip,
      angles.rightHip
    ],

    [
      angles.leftAnkle,
      angles.rightAnkle
    ],

    [
      angles.leftElbow,
      angles.rightElbow
    ]

  ];


  const differences = [];


  pairs.forEach(pair => {

    const [
      left,
      right
    ] = pair;


    if (
      Number.isFinite(left) &&
      Number.isFinite(right)
    ) {

      differences.push(
        Math.abs(
          left - right
        )
      );

    }

  });


  if (
    !differences.length
  ) {

    return 0;

  }


  const averageDifference =
    differences.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    differences.length;


  return round(
    clamp(
      100 -
      averageDifference * 2.5,
      0,
      100
    ),
    1
  );

}


/* =========================================================
   123. STABILITY SCORE
========================================================= */

function calculateStabilityScore() {

  const centers =
    AppState.analysis
      .centerOfMass;


  if (
    centers.length < 5
  ) {

    return 0;

  }


  const recent =
    centers.slice(-20);


  const xs =
    recent.map(
      point => point.x
    );


  const mean =
    xs.reduce(
      (a, b) => a + b,
      0
    ) /
    xs.length;


  const variance =
    xs.reduce(
      (sum, value) => {

        return (
          sum +
          Math.pow(
            value - mean,
            2
          )
        );

      },
      0
    ) /
    xs.length;


  const deviation =
    Math.sqrt(
      variance
    );


  return round(
    clamp(
      100 -
      deviation * 600,
      0,
      100
    ),
    1
  );

}


/* =========================================================
   124. TECHNIQUE SCORE
========================================================= */

function calculateTechniqueScore() {

  const event =
    getSelectedEvent();


  if (!event) {
    return 0;
  }


  let score = 75;


  const symmetry =
    calculateSymmetryScore();


  const stability =
    calculateStabilityScore();


  if (
    symmetry > 0
  ) {

    score +=
      (
        symmetry - 75
      ) * 0.2;

  }


  if (
    stability > 0
  ) {

    score +=
      (
        stability - 75
      ) * 0.2;

  }


  return round(
    clamp(
      score,
      0,
      100
    ),
    1
  );

}


/* =========================================================
   125. LIVE METRICS
========================================================= */

function calculateLiveMetrics(
  landmarks
) {

  const event =
    getSelectedEvent();


  if (!event) {
    return;
  }


  const metrics =
    AppState.analysis
      .metrics;


  metrics.symmetry =
    calculateSymmetryScore();


  metrics.stability =
    calculateStabilityScore();


  metrics.technique =
    calculateTechniqueScore();


  /*
     이 값들은 영상 좌표 기반 상대 지표.
     실제 절대적인 운동능력 측정치가 아님.
  */

  if (
    event.jumpAnalysis
  ) {

    metrics.power =
      calculateJumpPowerIndex();

    metrics.speed =
      calculateMovementSpeedIndex();

    metrics.agility =
      round(
        (
          metrics.stability +
          metrics.symmetry
        ) / 2,
        1
      );

  } else if (
    event.sprintAnalysis
  ) {

    metrics.speed =
      calculateMovementSpeedIndex();

    metrics.power =
      round(
        metrics.speed * 0.8,
        1
      );

    metrics.agility =
      round(
        (
          metrics.speed +
          metrics.stability
        ) / 2,
        1
      );

  } else {

    metrics.power =
      calculateMovementSpeedIndex();

    metrics.speed =
      metrics.power;

    metrics.agility =
      round(
        (
          metrics.symmetry +
          metrics.stability
        ) / 2,
        1
      );

  }

}


/* =========================================================
   126. MOVEMENT SPEED INDEX
========================================================= */

function calculateMovementSpeedIndex() {

  const centers =
    AppState.analysis
      .centerOfMass;


  if (
    centers.length < 2
  ) {

    return 0;

  }


  const current =
    centers[
      centers.length - 1
    ];


  const previous =
    centers[
      centers.length - 2
    ];


  const dt =
    current.time -
    previous.time;


  if (
    dt <= 0
  ) {

    return 0;

  }


  const dx =
    current.x -
    previous.x;


  const dy =
    current.y -
    previous.y;


  const velocity =
    Math.sqrt(
      dx * dx +
      dy * dy
    ) /
    dt;


  return round(
    clamp(
      velocity * 500,
      0,
      100
    ),
    1
  );

}


/* =========================================================
   127. JUMP POWER INDEX
========================================================= */

function calculateJumpPowerIndex() {

  const jump =
    AppState.analysis
      .jump;


  if (
    jump.flightTime > 0
  ) {

    return round(
      clamp(
        jump.flightTime *
        120,
        0,
        100
      ),
      1
    );

  }


  return (
    calculateMovementSpeedIndex()
  );

}


/* =========================================================
   128. JUMP ANALYSIS
========================================================= */

function updateJumpAnalysis(
  landmarks,
  currentTime
) {

  const event =
    getSelectedEvent();


  if (
    !event ||
    !event.jumpAnalysis
  ) {
    return;
  }


  if (
    MotionHistory.centerY.length <
    6
  ) {
    return;
  }


  const history =
    MotionHistory.centerY;


  const current =
    history[
      history.length - 1
    ];


  const previous =
    history[
      history.length - 2
    ];


  const beforePrevious =
    history[
      history.length - 3
    ];


  const jump =
    AppState.analysis
      .jump;


  /*
     영상 좌표에서는
     y가 작아질수록 위로 이동.
  */

  const upwardVelocity =
    previous - current;


  const previousVelocity =
    beforePrevious - previous;


  /*
     이륙 후보
  */

  if (
    jump.takeoffTime === null &&
    upwardVelocity > 0.004 &&
    previousVelocity > 0
  ) {

    jump.takeoffTime =
      currentTime;


    const leftHip =
      landmarks[23];

    const leftKnee =
      landmarks[25];


    if (
      isLandmarkValid(leftHip) &&
      isLandmarkValid(leftKnee)
    ) {

      const dx =
        leftKnee.x -
        leftHip.x;

      const dy =
        leftHip.y -
        leftKnee.y;


      jump.takeoffAngle =
        round(
          Math.atan2(
            Math.abs(dy),
            Math.abs(dx)
          ) *
          180 /
          Math.PI,
          1
        );

    }

  }


  /*
     최고점
  */

  if (
    jump.takeoffTime !== null
  ) {

    if (
      jump.maxCenterHeight === 0 ||
      current <
        jump.maxCenterHeight
    ) {

      jump.maxCenterHeight =
        current;

    }

  }


  /*
     착지 후보
  */

  if (
    jump.takeoffTime !== null &&
    jump.landingTime === null &&
    currentTime -
      jump.takeoffTime >
      0.15
  ) {

    const downward =
      current -
      previous;


    if (
      downward > 0.003 &&
      Math.abs(
        upwardVelocity
      ) < 0.02
    ) {

      jump.landingTime =
        currentTime;


      jump.flightTime =
        round(
          jump.landingTime -
          jump.takeoffTime,
          3
        );


      /*
         비행시간 기반 점프 높이 근사

         h = gT² / 8

         영상 프레임에서 이륙/착지 검출이
         정확한 경우에만 참고용으로 사용.
      */

      const g =
        9.80665;


      jump.estimatedHeight =
        round(
          (
            g *
            Math.pow(
              jump.flightTime,
              2
            )
          ) /
          8 *
          100,
          1
        );

    }

  }


  updateJumpUI();

}


/* =========================================================
   129. JUMP UI
========================================================= */

function updateJumpUI() {

  const jump =
    AppState.analysis
      .jump;


  setText(
    "jumpFlightTime",
    jump.flightTime > 0
      ? `${jump.flightTime}s`
      : "--"
  );


  setText(
    "jumpHeight",
    jump.estimatedHeight > 0
      ? `${jump.estimatedHeight}cm`
      : "--"
  );


  setText(
    "jumpTakeoffAngle",
    jump.takeoffAngle > 0
      ? `${jump.takeoffAngle}°`
      : "--"
  );

}


/* =========================================================
   130. SPRINT ANALYSIS
========================================================= */

function updateSprintAnalysis(
  landmarks,
  currentTime
) {

  const event =
    getSelectedEvent();


  if (
    !event ||
    !event.sprintAnalysis
  ) {
    return;
  }


  if (
    MotionHistory.leftAnkleY
      .length < 5
  ) {
    return;
  }


  const left =
    MotionHistory.leftAnkleY;


  const right =
    MotionHistory.rightAnkleY;


  const len =
    left.length;


  /*
     발목 높이 교차를 이용한
     간단한 step 이벤트 감지
  */

  const previousDiff =
    left[len - 2] -
    right[len - 2];


  const currentDiff =
    left[len - 1] -
    right[len - 1];


  if (
    previousDiff *
    currentDiff <
    0
  ) {

    const sprint =
      AppState.analysis
        .sprint;


    sprint.stepCount +=
      1;


    const elapsed =
      currentTime -
      (
        AppState.analysis
          .startedVideoTime ||
        0
      );


    if (
      elapsed > 0
    ) {

      sprint.cadence =
        round(
          sprint.stepCount /
          elapsed *
          60,
          1
        );

    }

  }


  updateSprintUI();

}


/* =========================================================
   131. SPRINT UI
========================================================= */

function updateSprintUI() {

  const sprint =
    AppState.analysis
      .sprint;


  setText(
    "sprintCadence",
    sprint.cadence > 0
      ? `${sprint.cadence} spm`
      : "--"
  );


  setText(
    "sprintStepCount",
    sprint.stepCount || 0
  );

}


/* =========================================================
   132. POSE CANVAS
========================================================= */

function getPoseCanvas() {

  return byId(
    "poseCanvas"
  );

}


/* =========================================================
   133. DRAW POSE OVERLAY
========================================================= */

function drawPoseOverlay(
  landmarks
) {

  const canvas =
    getPoseCanvas();


  const video =
    getAnalysisVideo();


  if (
    !canvas ||
    !video
  ) {
    return;
  }


  if (
    canvas.width !==
      video.videoWidth ||
    canvas.height !==
      video.videoHeight
  ) {

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
     신체 중심
  */

  if (
    AppState.settings
      .centerOfMass
  ) {

    drawCenterOfMass(
      ctx,
      landmarks,
      canvas
    );

  }


  /*
     스켈레톤
  */

  if (
    AppState.settings
      .skeleton
  ) {

    drawSkeleton(
      ctx,
      landmarks,
      canvas
    );

  }


  /*
     관절 포인트
  */

  if (
    AppState.settings
      .skeleton
  ) {

    drawLandmarkPoints(
      ctx,
      landmarks,
      canvas
    );

  }


  /*
     각도
  */

  if (
    AppState.settings
      .angles
  ) {

    drawAngleLabels(
      ctx,
      landmarks,
      canvas
    );

  }


  /*
     기준선
  */

  if (
    AppState.settings
      .referenceLine
  ) {

    drawReferenceLines(
      ctx,
      landmarks,
      canvas
    );

  }

}


/* =========================================================
   134. NORMALIZED → CANVAS
========================================================= */

function landmarkToCanvas(
  point,
  canvas
) {

  return {

    x:
      point.x *
      canvas.width,

    y:
      point.y *
      canvas.height

  };

}


/* =========================================================
   135. DRAW SKELETON
========================================================= */

function drawSkeleton(
  ctx,
  landmarks,
  canvas
) {

  const connections =
    typeof CUSTOM_POSE_CONNECTIONS !==
    "undefined"
      ? CUSTOM_POSE_CONNECTIONS
      : [];


  ctx.save();


  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 420
    );


  ctx.strokeStyle =
    "rgba(55, 255, 170, 0.95)";


  ctx.lineCap =
    "round";


  connections.forEach(
    connection => {

      const a =
        landmarks[
          connection[0]
        ];

      const b =
        landmarks[
          connection[1]
        ];


      if (
        !isLandmarkValid(a) ||
        !isLandmarkValid(b)
      ) {
        return;
      }


      const pa =
        landmarkToCanvas(
          a,
          canvas
        );


      const pb =
        landmarkToCanvas(
          b,
          canvas
        );


      ctx.beginPath();

      ctx.moveTo(
        pa.x,
        pa.y
      );

      ctx.lineTo(
        pb.x,
        pb.y
      );

      ctx.stroke();

    }
  );


  ctx.restore();

}


/* =========================================================
   136. DRAW LANDMARK POINTS
========================================================= */

function drawLandmarkPoints(
  ctx,
  landmarks,
  canvas
) {

  const important = [

    11, 12,

    13, 14,

    15, 16,

    23, 24,

    25, 26,

    27, 28,

    29, 30,

    31, 32

  ];


  ctx.save();


  important.forEach(index => {

    const point =
      landmarks[index];


    if (
      !isLandmarkValid(
        point
      )
    ) {
      return;
    }


    const p =
      landmarkToCanvas(
        point,
        canvas
      );


    ctx.beginPath();


    ctx.arc(
      p.x,
      p.y,
      Math.max(
        3,
        canvas.width / 240
      ),
      0,
      Math.PI * 2
    );


    ctx.fillStyle =
      "rgba(255,255,255,0.96)";


    ctx.fill();


    ctx.lineWidth =
      2;


    ctx.strokeStyle =
      "rgba(0,0,0,0.65)";


    ctx.stroke();

  });


  ctx.restore();

}


/* =========================================================
   137. DRAW ANGLE LABEL
========================================================= */

function drawAngleText(
  ctx,
  canvas,
  point,
  text
) {

  if (
    !point ||
    !Number.isFinite(text)
  ) {
    return;
  }


  const p =
    landmarkToCanvas(
      point,
      canvas
    );


  const fontSize =
    Math.max(
      12,
      canvas.width / 75
    );


  const label =
    `${Math.round(text)}°`;


  ctx.save();


  ctx.font =
    `700 ${fontSize}px Arial`;


  const width =
    ctx.measureText(
      label
    ).width;


  const padding = 5;


  ctx.fillStyle =
    "rgba(0,0,0,0.72)";


  ctx.fillRect(
    p.x + 7,
    p.y - fontSize,
    width +
      padding * 2,
    fontSize + 8
  );


  ctx.fillStyle =
    "#ffffff";


  ctx.fillText(
    label,
    p.x +
      7 +
      padding,
    p.y + 2
  );


  ctx.restore();

}


/* =========================================================
   138. DRAW ANGLE LABELS
========================================================= */

function drawAngleLabels(
  ctx,
  landmarks,
  canvas
) {

  const angles =
    AppState.analysis
      .angles;


  drawAngleText(
    ctx,
    canvas,
    landmarks[25],
    angles.leftKnee
  );


  drawAngleText(
    ctx,
    canvas,
    landmarks[26],
    angles.rightKnee
  );


  drawAngleText(
    ctx,
    canvas,
    landmarks[23],
    angles.leftHip
  );


  drawAngleText(
    ctx,
    canvas,
    landmarks[24],
    angles.rightHip
  );


  drawAngleText(
    ctx,
    canvas,
    landmarks[27],
    angles.leftAnkle
  );


  drawAngleText(
    ctx,
    canvas,
    landmarks[28],
    angles.rightAnkle
  );

}


/* =========================================================
   139. DRAW CENTER OF MASS
========================================================= */

function drawCenterOfMass(
  ctx,
  landmarks,
  canvas
) {

  const center =
    estimateCenterOfMass(
      landmarks
    );


  if (!center) {
    return;
  }


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
      canvas.width / 100
    ),
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    "rgba(255,215,0,0.92)";


  ctx.fill();


  ctx.lineWidth =
    2;


  ctx.strokeStyle =
    "#ffffff";


  ctx.stroke();


  ctx.font =
    `700 ${Math.max(
      11,
      canvas.width / 90
    )}px Arial`;


  ctx.fillStyle =
    "#ffffff";


  ctx.fillText(
    "COM",
    x + 10,
    y - 10
  );


  ctx.restore();

}


/* =========================================================
   140. REFERENCE LINES
========================================================= */

function drawReferenceLines(
  ctx,
  landmarks,
  canvas
) {

  const hip =
    midpoint(
      landmarks[23],
      landmarks[24]
    );


  if (!hip) {
    return;
  }


  const p =
    landmarkToCanvas(
      hip,
      canvas
    );


  ctx.save();


  ctx.setLineDash([
    8,
    8
  ]);


  ctx.lineWidth =
    1;


  ctx.strokeStyle =
    "rgba(255,255,255,0.45)";


  /*
     vertical
  */

  ctx.beginPath();

  ctx.moveTo(
    p.x,
    0
  );

  ctx.lineTo(
    p.x,
    canvas.height
  );

  ctx.stroke();


  /*
     horizontal
  */

  ctx.beginPath();

  ctx.moveTo(
    0,
    p.y
  );

  ctx.lineTo(
    canvas.width,
    p.y
  );

  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   141. TRAJECTORY CANVAS
========================================================= */

function drawTrajectoryCanvas() {

  const canvas =
    byId(
      "trajectoryCanvas"
    );


  const video =
    getAnalysisVideo();


  if (
    !canvas ||
    !video
  ) {
    return;
  }


  if (
    canvas.width !==
      video.videoWidth ||
    canvas.height !==
      video.videoHeight
  ) {

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    !AppState.settings
      .trajectory
  ) {
    return;
  }


  const points =
    AppState.analysis
      .trajectory;


  if (
    points.length < 2
  ) {
    return;
  }


  ctx.save();


  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 350
    );


  ctx.strokeStyle =
    "rgba(255,205,55,0.9)";


  ctx.lineCap =
    "round";


  ctx.lineJoin =
    "round";


  ctx.beginPath();


  points.forEach(
    (
      point,
      index
    ) => {

      const x =
        point.x *
        canvas.width;


      const y =
        point.y *
        canvas.height;


      if (
        index === 0
      ) {

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


  /*
     마지막 위치
  */

  const last =
    points[
      points.length - 1
    ];


  ctx.beginPath();


  ctx.arc(
    last.x *
      canvas.width,
    last.y *
      canvas.height,
    Math.max(
      5,
      canvas.width / 150
    ),
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    "#ffffff";


  ctx.fill();


  ctx.restore();

}


/* =========================================================
   142. ANGLE UI
========================================================= */

function updateAngleUI() {

  const a =
    AppState.analysis
      .angles;


  setAngleText(
    "leftKneeAngle",
    a.leftKnee
  );


  setAngleText(
    "rightKneeAngle",
    a.rightKnee
  );


  setAngleText(
    "leftHipAngle",
    a.leftHip
  );


  setAngleText(
    "rightHipAngle",
    a.rightHip
  );


  setAngleText(
    "leftAnkleAngle",
    a.leftAnkle
  );


  setAngleText(
    "rightAnkleAngle",
    a.rightAnkle
  );


  setAngleText(
    "trunkAngle",
    a.trunk
  );

}


/* =========================================================
   143. SET ANGLE TEXT
========================================================= */

function setAngleText(
  id,
  value
) {

  setText(
    id,
    Number.isFinite(value)
      ? `${Math.round(value)}°`
      : "--"
  );

}


/* =========================================================
   144. LIVE METRIC UI
========================================================= */

function updateLiveMetricUI() {

  const metrics =
    AppState.analysis
      .metrics;


  Object.entries(
    metrics
  ).forEach(
    ([key, value]) => {

      setText(
        `${key}MetricValue`,
        value > 0
          ? Math.round(value)
          : "--"
      );


      const bar =
        byId(
          `${key}MetricBar`
        );


      if (bar) {

        bar.style.width =
          `${clamp(
            value,
            0,
            100
          )}%`;

      }

    }
  );

}


/* =========================================================
   145. ANGLE GRAPH
========================================================= */

let angleGraphChart =
  null;


/* =========================================================
   146. CREATE ANGLE GRAPH
========================================================= */

function createAngleGraph() {

  const canvas =
    byId(
      "angleGraphCanvas"
    );


  if (
    !canvas ||
    typeof Chart ===
      "undefined"
  ) {

    return;

  }


  if (
    angleGraphChart
  ) {

    angleGraphChart.destroy();

  }


  angleGraphChart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels: [],

          datasets: [

            {
              label:
                "왼쪽 무릎",
              data: [],
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label:
                "오른쪽 무릎",
              data: [],
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label:
                "왼쪽 고관절",
              data: [],
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label:
                "오른쪽 고관절",
              data: [],
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label:
                "몸통",
              data: [],
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          animation: false,

          interaction: {

            intersect: false,

            mode: "index"

          },

          scales: {

            x: {

              title: {

                display: true,

                text: "TIME (s)"

              }

            },


            y: {

              suggestedMin: 0,

              suggestedMax: 180,

              title: {

                display: true,

                text: "ANGLE (°)"

              }

            }

          },

          plugins: {

            legend: {

              display: true,

              position: "bottom"

            }

          }

        }

      }
    );

}


/* =========================================================
   147. UPDATE ANGLE GRAPH
========================================================= */

function renderAngleGraph() {

  if (
    !angleGraphChart
  ) {

    createAngleGraph();

  }


  if (
    !angleGraphChart
  ) {
    return;
  }


  const graph =
    AppState.analysis
      .graphData;


  /*
     그래프가 너무 무거워지지 않게
     최근 150개 표시
  */

  const start =
    Math.max(
      0,
      graph.time.length -
      150
    );


  angleGraphChart.data.labels =
    graph.time.slice(
      start
    );


  angleGraphChart
    .data
    .datasets[0]
    .data =
      graph.leftKnee.slice(
        start
      );


  angleGraphChart
    .data
    .datasets[1]
    .data =
      graph.rightKnee.slice(
        start
      );


  angleGraphChart
    .data
    .datasets[2]
    .data =
      graph.leftHip.slice(
        start
      );


  angleGraphChart
    .data
    .datasets[3]
    .data =
      graph.rightHip.slice(
        start
      );


  angleGraphChart
    .data
    .datasets[4]
    .data =
      graph.trunk.slice(
        start
      );


  angleGraphChart.update(
    "none"
  );

}


/* =========================================================
   148. FINAL METRICS
========================================================= */

function finalizeAnalysisMetrics() {

  const metrics =
    AppState.analysis
      .metrics;


  /*
     마지막 프레임 하나만으로 평가하지 않고
     현재 확보된 분석 지표를 종합.
  */

  const values = [

    metrics.speed,

    metrics.power,

    metrics.agility,

    metrics.stability,

    metrics.symmetry,

    metrics.technique

  ].filter(
    value =>
      Number.isFinite(value) &&
      value > 0
  );


  if (
    !values.length
  ) {

    AppState.analysis.score =
      0;

    return;

  }


  AppState.analysis.score =
    round(
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      values.length,
      1
    );


  generateAutomaticFeedback();

}


/* =========================================================
   149. AUTOMATIC FEEDBACK
========================================================= */

function generateAutomaticFeedback() {

  const metrics =
    AppState.analysis
      .metrics;


  const feedback = [];


  if (
    metrics.symmetry > 0 &&
    metrics.symmetry < 70
  ) {

    feedback.push({

      type: "warning",

      title:
        "좌우 움직임 차이",

      text:
        "좌우 관절 움직임 차이가 비교적 크게 나타났습니다. 핵심 프레임에서 무릎과 고관절 움직임을 확인하세요."

    });

  } else if (
    metrics.symmetry >= 85
  ) {

    feedback.push({

      type: "good",

      title:
        "좌우 대칭성",

      text:
        "분석된 구간에서 좌우 관절 움직임이 비교적 균형적으로 나타났습니다."

    });

  }


  if (
    metrics.stability > 0 &&
    metrics.stability < 65
  ) {

    feedback.push({

      type: "warning",

      title:
        "중심 안정성",

      text:
        "신체 중심의 좌우 이동 폭이 크게 나타난 구간이 있습니다. 궤적 그래프와 해당 프레임을 함께 확인하세요."

    });

  }


  const event =
    getSelectedEvent();


  if (
    event?.jumpAnalysis &&
    AppState.analysis
      .jump.flightTime > 0
  ) {

    feedback.push({

      type: "info",

      title:
        "점프 분석",

      text:
        `검출된 비행시간은 ${AppState.analysis.jump.flightTime}s이며 영상 기반 추정 점프 높이는 약 ${AppState.analysis.jump.estimatedHeight}cm입니다.`

    });

  }


  if (
    event?.sprintAnalysis &&
    AppState.analysis
      .sprint.cadence > 0
  ) {

    feedback.push({

      type: "info",

      title:
        "러닝 리듬",

      text:
        `분석 구간에서 추정된 케이던스는 약 ${AppState.analysis.sprint.cadence}spm입니다.`

    });

  }


  AppState.analysis.feedback =
    feedback;


  renderFeedbackList();

}


/* =========================================================
   150. FEEDBACK UI
========================================================= */

function renderFeedbackList() {

  const container =
    byId(
      "analysisFeedbackList"
    );


  if (!container) {
    return;
  }


  const feedback =
    AppState.analysis
      .feedback || [];


  if (
    !feedback.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        분석이 완료되면 피드백이 표시됩니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    feedback
      .map(item => `

        <article
          class="feedback-item ${
            item.type
          }"
        >

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

        </article>

      `)
      .join("");

}


/* =========================================================
   151. DRAW POSE MISSING
========================================================= */

function drawPoseMissingState() {

  const canvas =
    getPoseCanvas();


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  AppState.analysis
    .currentPhase =
    "POSE SEARCH";


  updateAnalysisStatusUI();

}


/* =========================================================
   152. REDRAW LAST POSE
========================================================= */

function redrawLastPose() {

  if (
    !lastPoseLandmarks
  ) {

    clearAnalysisCanvases();

    return;

  }


  drawPoseOverlay(
    lastPoseLandmarks
  );


  drawTrajectoryCanvas();

}


/* =========================================================
   153. RESET POSE ANALYSIS
========================================================= */

function resetPoseAnalysisEngine() {

  lastPoseLandmarks =
    null;

  previousPoseLandmarks =
    null;

  previousPoseTime =
    null;

  lastPoseResultTime =
    0;


  MotionHistory.reset();


  if (
    angleGraphChart
  ) {

    angleGraphChart.data.labels =
      [];


    angleGraphChart
      .data
      .datasets
      .forEach(dataset => {

        dataset.data =
          [];

      });


    angleGraphChart.update();

  }

}


/* =========================================================
   154. PATCH RESET ANALYSIS

   PART 1 resetAnalysisState에
   Pose 엔진 초기화까지 자동 연결
========================================================= */

const originalResetAnalysisState =
  resetAnalysisState;


resetAnalysisState =
  function() {

    originalResetAnalysisState();


    AppState.analysis.feedback =
      [];


    AppState.analysis
      .startedVideoTime =
      0;


    resetPoseAnalysisEngine();


    renderFeedbackList();


    updateJumpUI();


    updateSprintUI();


    updateAngleUI();


    updateLiveMetricUI();

  };


/* =========================================================
   155. PATCH START ANALYSIS

   분석 시작 시 영상 위치 기억
========================================================= */

const originalStartVideoAnalysis =
  startVideoAnalysis;


startVideoAnalysis =
  async function() {

    const video =
      getAnalysisVideo();


    if (video) {

      AppState.analysis
        .startedVideoTime =
        video.currentTime;

    }


    await originalStartVideoAnalysis();

  };


window.startVideoAnalysis =
  startVideoAnalysis;


/* =========================================================
   156. AUTO KEY FRAME DETECTION
========================================================= */

let lastAutoKeyFrameTime =
  -999;


function tryAutoKeyFrame(
  reason = ""
) {

  if (
    !AppState.settings
      .autoKeyFrame
  ) {
    return;
  }


  const video =
    getAnalysisVideo();


  if (!video) {
    return;
  }


  /*
     0.6초 이내 중복 캡처 방지
  */

  if (
    video.currentTime -
    lastAutoKeyFrameTime <
    0.6
  ) {
    return;
  }


  const canvas =
    captureCurrentFrame();


  if (!canvas) {
    return;
  }


  try {

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.68
      );


    AppState.analysis
      .keyFrames
      .push({

        id:
          createId(
            "auto-frame"
          ),

        time:
          video.currentTime,

        image,

        phase:
          reason ||
          AppState.analysis
            .currentPhase,

        angles: {
          ...AppState.analysis
            .angles
        },

        automatic:
          true,

        createdAt:
          new Date()
            .toISOString()

      });


    const max =
      typeof MOTION_ANALYSIS_CONFIG !==
      "undefined"
        ? MOTION_ANALYSIS_CONFIG
            .maxKeyFrames || 8
        : 8;


    while (
      AppState.analysis
        .keyFrames.length >
      max
    ) {

      AppState.analysis
        .keyFrames
        .shift();

    }


    lastAutoKeyFrameTime =
      video.currentTime;


    renderKeyFrameList();

  } catch (error) {

    console.warn(
      "[AUTO FRAME]",
      error
    );

  }

}


/* =========================================================
   157. IMPORTANT MOTION DETECTION
========================================================= */

function detectImportantMotion() {

  const event =
    getSelectedEvent();


  if (!event) {
    return;
  }


  /*
     점프
  */

  if (
    event.jumpAnalysis
  ) {

    const jump =
      AppState.analysis
        .jump;


    const video =
      getAnalysisVideo();


    if (!video) {
      return;
    }


    if (
      jump.takeoffTime !== null &&
      Math.abs(
        video.currentTime -
        jump.takeoffTime
      ) < 0.04
    ) {

      tryAutoKeyFrame(
        "TAKE-OFF"
      );

    }


    if (
      jump.landingTime !== null &&
      Math.abs(
        video.currentTime -
        jump.landingTime
      ) < 0.04
    ) {

      tryAutoKeyFrame(
        "LANDING"
      );

    }

  }

}


/* =========================================================
   158. PATCH POSE RESULTS

   기존 분석 후
   핵심동작 자동 감지 추가
========================================================= */

const originalHandlePoseResults =
  handlePoseResults;


handlePoseResults =
  function(results) {

    originalHandlePoseResults(
      results
    );


    detectImportantMotion();

  };


/*
   MediaPipe callback도
   새 함수로 다시 연결
*/

function reconnectPoseCallback() {

  if (
    poseSystem &&
    poseSystemReady
  ) {

    poseSystem.onResults(
      handlePoseResults
    );

  }

}


/* =========================================================
   159. POSE SYSTEM STATUS
========================================================= */

function updatePoseSystemStatus() {

  const element =
    byId(
      "poseSystemStatus"
    );


  if (!element) {
    return;
  }


  if (
    poseSystemReady
  ) {

    element.textContent =
      "POSE ENGINE READY";


    element.classList.add(
      "ready"
    );

  } else {

    element.textContent =
      "POSE ENGINE STANDBY";


    element.classList.remove(
      "ready"
    );

  }

}


/* =========================================================
   160. ANALYSIS ENGINE INIT
========================================================= */

function initializeAnalysisEngine() {

  createAngleGraph();


  resetPoseAnalysisEngine();


  updatePoseSystemStatus();


  console.log(
    "[ANALYSIS] ENGINE READY"
  );

}


/* =========================================================
   161. GLOBAL EXPORT
========================================================= */

window.initializePoseSystem =
  initializePoseSystem;

window.analyzePoseFrame =
  analyzePoseFrame;

window.calculateAngle =
  calculateAngle;

window.calculateCurrentAngles =
  calculateCurrentAngles;

window.estimateCenterOfMass =
  estimateCenterOfMass;

window.finalizeAnalysisMetrics =
  finalizeAnalysisMetrics;

window.redrawLastPose =
  redrawLastPose;

window.renderAngleGraph =
  renderAngleGraph;

window.initializeAnalysisEngine =
  initializeAnalysisEngine;

window.MotionHistory =
  MotionHistory;
  /* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   PART 4 / 4

   REPORT & RECORD SYSTEM
   - Analysis Records
   - Report
   - Key Frame Feedback
   - Training Recommendation
   - Radar Chart
   - PE Entrance Exam Report
   - Full App Initialization
========================================================= */


/* =========================================================
   162. CURRENT REPORT
========================================================= */

AppState.currentReportId =
  AppState.currentReportId || null;


/* =========================================================
   163. GET REPORT RECORD
========================================================= */

function getCurrentReportRecord() {

  if (
    AppState.currentReportId
  ) {

    const record =
      AppState.analyses.find(
        item =>
          item.id ===
          AppState.currentReportId
      );

    if (record) {
      return record;
    }

  }


  /*
     현재 선택 선수의
     가장 최근 분석
  */

  const athlete =
    getSelectedAthlete();


  if (!athlete) {
    return null;
  }


  return [...AppState.analyses]
    .filter(
      item =>
        item.athleteId ===
        athlete.id
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )[0] || null;

}


/* =========================================================
   164. RECORD LIST
========================================================= */

function renderRecords() {

  const container =
    byId("recordList");


  if (!container) {
    return;
  }


  const athleteFilter =
    byId(
      "recordAthleteFilter"
    )?.value || "";


  let records =
    [...AppState.analyses];


  if (athleteFilter) {

    records =
      records.filter(
        record =>
          record.athleteId ===
          athleteFilter
      );

  }


  records.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );


  setText(
    "recordCount",
    records.length
  );


  if (!records.length) {

    container.innerHTML = `
      <div class="empty-state">
        저장된 분석 기록이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    records
      .map(record => {

        const score =
          Number(
            record.score
          );


        return `

          <article
            class="record-card"
          >

            <div
              class="record-main"
            >

              <span
                class="record-type"
              >
                ${
                  escapeHTML(
                    record.category ||
                    "분석"
                  )
                }
              </span>

              <h3>
                ${
                  escapeHTML(
                    record.eventName ||
                    "자세분석"
                  )
                }
              </h3>

              <p>
                ${
                  escapeHTML(
                    record.athleteName ||
                    "-"
                  )
                }
                ·
                ${
                  escapeHTML(
                    record.ability ||
                    "-"
                  )
                }
              </p>

              <small>
                ${
                  escapeHTML(
                    formatDateTime(
                      record.createdAt
                    )
                  )
                }
              </small>

            </div>


            <div
              class="record-score"
            >

              <strong>
                ${
                  score > 0
                    ? Math.round(
                        score
                      )
                    : "--"
                }
              </strong>

              <span>
                /100
              </span>

            </div>


            <div
              class="record-actions"
            >

              <button
                type="button"
                data-open-record="${
                  record.id
                }"
              >
                리포트
              </button>

              <button
                type="button"
                data-delete-record="${
                  record.id
                }"
              >
                삭제
              </button>

            </div>

          </article>

        `;

      })
      .join("");


  $$(
    "[data-open-record]",
    container
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openAnalysisRecord(
          button.dataset
            .openRecord
        );

      }
    );

  });


  $$(
    "[data-delete-record]",
    container
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        deleteAnalysisRecord(
          button.dataset
            .deleteRecord
        );

      }
    );

  });

}


/* =========================================================
   165. OPEN RECORD
========================================================= */

function openAnalysisRecord(
  recordId
) {

  const record =
    AppState.analyses.find(
      item =>
        item.id ===
        recordId
    );


  if (!record) {

    showToast(
      "분석 기록을 찾지 못했습니다."
    );

    return;

  }


  AppState.currentReportId =
    record.id;


  AppState.selectedAthleteId =
    record.athleteId;


  AppState.selectedEventId =
    record.eventId;


  saveSelectedAthlete();


  renderReport(
    record
  );


  navigateTo(
    "report"
  );

}


/* =========================================================
   166. DELETE RECORD
========================================================= */

function deleteAnalysisRecord(
  recordId
) {

  const record =
    AppState.analyses.find(
      item =>
        item.id ===
        recordId
    );


  if (!record) {
    return;
  }


  const confirmed =
    window.confirm(
      `${record.eventName || "분석"} 기록을 삭제할까요?`
    );


  if (!confirmed) {
    return;
  }


  AppState.analyses =
    AppState.analyses.filter(
      item =>
        item.id !==
        recordId
    );


  if (
    AppState.currentReportId ===
    recordId
  ) {

    AppState.currentReportId =
      null;

  }


  saveAnalyses();


  renderRecords();

  renderDashboard();


  showToast(
    "분석 기록 삭제 완료"
  );

}


/* =========================================================
   167. RECORD FILTER EVENT
========================================================= */

function bindRecordEvents() {

  const filter =
    byId(
      "recordAthleteFilter"
    );


  if (filter) {

    filter.addEventListener(
      "change",
      renderRecords
    );

  }

}


/* =========================================================
   168. REPORT CHARTS
========================================================= */

let reportRadarChart =
  null;

let reportAngleChart =
  null;


/* =========================================================
   169. REPORT
========================================================= */

function renderReport(
  suppliedRecord = null
) {

  const record =
    suppliedRecord ||
    getCurrentReportRecord();


  const empty =
    byId(
      "reportEmptyState"
    );


  const content =
    byId(
      "reportContent"
    );


  if (!record) {

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


  AppState.currentReportId =
    record.id;


  renderReportHeader(
    record
  );


  renderReportScore(
    record
  );


  renderReportMetrics(
    record
  );


  renderReportKeyFrames(
    record
  );


  renderReportAngles(
    record
  );


  renderReportJumpSprint(
    record
  );


  renderReportFeedback(
    record
  );


  renderTrainingRecommendations(
    record
  );


  renderReportRadarChart(
    record
  );


  renderReportAngleChart(
    record
  );


  renderPEEntranceEvaluation(
    record
  );

}


/* =========================================================
   170. REPORT HEADER
========================================================= */

function renderReportHeader(
  record
) {

  setText(
    "reportAthleteName",
    record.athleteName ||
    "-"
  );


  setText(
    "reportEventName",
    record.eventName ||
    "-"
  );


  setText(
    "reportAbility",
    record.ability ||
    "-"
  );


  setText(
    "reportCategory",
    record.category ||
    "-"
  );


  setText(
    "reportDate",
    formatDateTime(
      record.createdAt
    )
  );


  setText(
    "reportVideoName",
    record.video?.name ||
    "-"
  );


  setText(
    "reportFrameCount",
    record.frameCount || 0
  );


  const athlete =
    AppState.athletes.find(
      item =>
        item.id ===
        record.athleteId
    );


  if (athlete) {

    setText(
      "reportGrade",
      athlete.grade || "-"
    );


    setText(
      "reportHeight",
      athlete.height
        ? `${athlete.height}cm`
        : "-"
    );


    setText(
      "reportWeight",
      athlete.weight
        ? `${athlete.weight}kg`
        : "-"
    );

  }

}


/* =========================================================
   171. REPORT SCORE
========================================================= */

function renderReportScore(
  record
) {

  const score =
    Number(
      record.score
    );


  setText(
    "reportTotalScore",
    score > 0
      ? Math.round(score)
      : "--"
  );


  let grade = "-";


  if (
    Number.isFinite(score) &&
    score > 0
  ) {

    if (score >= 90) {

      grade = "S";

    } else if (
      score >= 80
    ) {

      grade = "A";

    } else if (
      score >= 70
    ) {

      grade = "B";

    } else if (
      score >= 60
    ) {

      grade = "C";

    } else {

      grade = "D";

    }

  }


  setText(
    "reportGradeScore",
    grade
  );

}


/* =========================================================
   172. REPORT METRICS
========================================================= */

function renderReportMetrics(
  record
) {

  const container =
    byId(
      "reportMetricGrid"
    );


  if (!container) {
    return;
  }


  const metrics =
    record.metrics || {};


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
      "좌우 대칭성",

    technique:
      "기술 수행"

  };


  container.innerHTML =
    Object.entries(
      labels
    )
      .map(
        ([key, label]) => {

          const value =
            Number(
              metrics[key]
            );


          return `

            <article
              class="report-metric-card"
            >

              <span>
                ${
                  escapeHTML(
                    label
                  )
                }
              </span>

              <strong>
                ${
                  value > 0
                    ? Math.round(
                        value
                      )
                    : "--"
                }
              </strong>

              <div
                class="report-metric-track"
              >

                <div
                  class="report-metric-fill"
                  style="
                    width:${
                      clamp(
                        value || 0,
                        0,
                        100
                      )
                    }%
                  "
                ></div>

              </div>

            </article>

          `;

        }
      )
      .join("");

}


/* =========================================================
   173. REPORT KEY FRAMES
========================================================= */

function renderReportKeyFrames(
  record
) {

  const container =
    byId(
      "reportKeyFrames"
    );


  if (!container) {
    return;
  }


  const frames =
    record.keyFrames || [];


  if (!frames.length) {

    container.innerHTML = `
      <div class="empty-state">
        저장된 자세 사진이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    frames
      .map(
        (
          frame,
          index
        ) => {

          const angleText =
            createKeyFrameAngleText(
              frame
            );


          const feedback =
            createFrameFeedback(
              frame,
              record
            );


          return `

            <article
              class="report-frame-card"
            >

              <div
                class="report-frame-image"
              >

                <img
                  src="${
                    frame.image
                  }"
                  alt="자세 분석 프레임 ${
                    index + 1
                  }"
                >

                <span>
                  ${
                    escapeHTML(
                      frame.phase ||
                      `FRAME ${
                        index + 1
                      }`
                    )
                  }
                </span>

              </div>


              <div
                class="report-frame-info"
              >

                <strong>
                  ${
                    formatTime(
                      frame.time || 0
                    )
                  }
                </strong>

                <p>
                  ${
                    escapeHTML(
                      angleText
                    )
                  }
                </p>

                <div
                  class="frame-feedback"
                >
                  ${
                    escapeHTML(
                      feedback
                    )
                  }
                </div>

              </div>

            </article>

          `;

        }
      )
      .join("");

}


/* =========================================================
   174. KEY FRAME ANGLES
========================================================= */

function createKeyFrameAngleText(
  frame
) {

  const angles =
    frame.angles || {};


  const parts = [];


  if (
    Number.isFinite(
      angles.leftKnee
    )
  ) {

    parts.push(
      `왼무릎 ${Math.round(
        angles.leftKnee
      )}°`
    );

  }


  if (
    Number.isFinite(
      angles.rightKnee
    )
  ) {

    parts.push(
      `오른무릎 ${Math.round(
        angles.rightKnee
      )}°`
    );

  }


  if (
    Number.isFinite(
      angles.leftHip
    )
  ) {

    parts.push(
      `왼고관절 ${Math.round(
        angles.leftHip
      )}°`
    );

  }


  if (
    Number.isFinite(
      angles.rightHip
    )
  ) {

    parts.push(
      `오른고관절 ${Math.round(
        angles.rightHip
      )}°`
    );

  }


  return (
    parts.join(" · ") ||
    "관절각 데이터 없음"
  );

}


/* =========================================================
   175. FRAME FEEDBACK
========================================================= */

function createFrameFeedback(
  frame,
  record
) {

  const angles =
    frame.angles || {};


  const leftKnee =
    Number(
      angles.leftKnee
    );


  const rightKnee =
    Number(
      angles.rightKnee
    );


  if (
    Number.isFinite(leftKnee) &&
    Number.isFinite(rightKnee)
  ) {

    const difference =
      Math.abs(
        leftKnee -
        rightKnee
      );


    if (
      difference >= 15
    ) {

      return (
        "이 프레임에서는 좌우 무릎 각도 차이가 크게 나타났습니다. 촬영 각도와 발 위치를 함께 확인하세요."
      );

    }


    if (
      difference <= 6
    ) {

      return (
        "이 프레임에서는 좌우 무릎 각도가 비교적 비슷하게 나타났습니다."
      );

    }

  }


  if (
    String(
      frame.phase || ""
    )
      .toUpperCase()
      .includes(
        "TAKE"
      )
  ) {

    return (
      "이륙 구간입니다. 무릎·고관절 신전 타이밍과 신체중심 이동 방향을 함께 확인하세요."
    );

  }


  if (
    String(
      frame.phase || ""
    )
      .toUpperCase()
      .includes(
        "LAND"
      )
  ) {

    return (
      "착지 구간입니다. 좌우 무릎 굴곡과 중심 이동이 한쪽으로 치우치지 않는지 확인하세요."
    );

  }


  return (
    `${record.eventName || "종목"}의 핵심 자세 프레임입니다. 각도 그래프와 함께 전후 움직임을 비교하세요.`
  );

}


/* =========================================================
   176. REPORT ANGLES
========================================================= */

function renderReportAngles(
  record
) {

  const container =
    byId(
      "reportAngleSummary"
    );


  if (!container) {
    return;
  }


  const graph =
    record.graphData || {};


  const items = [

    [
      "왼쪽 무릎",
      graph.leftKnee
    ],

    [
      "오른쪽 무릎",
      graph.rightKnee
    ],

    [
      "왼쪽 고관절",
      graph.leftHip
    ],

    [
      "오른쪽 고관절",
      graph.rightHip
    ],

    [
      "몸통 기울기",
      graph.trunk
    ]

  ];


  container.innerHTML =
    items
      .map(
        ([name, values]) => {

          const stats =
            calculateSeriesStats(
              values
            );


          return `

            <article
              class="angle-summary-card"
            >

              <span>
                ${
                  escapeHTML(
                    name
                  )
                }
              </span>

              <strong>
                ${
                  stats.average !==
                  null
                    ? `${Math.round(
                        stats.average
                      )}°`
                    : "--"
                }
              </strong>

              <small>
                MIN ${
                  stats.min !==
                  null
                    ? Math.round(
                        stats.min
                      )
                    : "--"
                }°
                /
                MAX ${
                  stats.max !==
                  null
                    ? Math.round(
                        stats.max
                      )
                    : "--"
                }°
              </small>

            </article>

          `;

        }
      )
      .join("");

}


/* =========================================================
   177. SERIES STATS
========================================================= */

function calculateSeriesStats(
  values
) {

  if (
    !Array.isArray(values)
  ) {

    return {

      min: null,

      max: null,

      average: null

    };

  }


  const valid =
    values.filter(
      value =>
        Number.isFinite(value)
    );


  if (!valid.length) {

    return {

      min: null,

      max: null,

      average: null

    };

  }


  return {

    min:
      Math.min(...valid),

    max:
      Math.max(...valid),

    average:
      valid.reduce(
        (a, b) =>
          a + b,
        0
      ) /
      valid.length

  };

}


/* =========================================================
   178. JUMP / SPRINT REPORT
========================================================= */

function renderReportJumpSprint(
  record
) {

  const container =
    byId(
      "reportSpecialMetrics"
    );


  if (!container) {
    return;
  }


  const event =
    typeof getEventById ===
    "function"
      ? getEventById(
          record.eventId
        )
      : null;


  let html = "";


  if (
    event?.jumpAnalysis
  ) {

    const jump =
      record.jump || {};


    html += `

      <article
        class="special-metric-card"
      >

        <span>
          비행시간
        </span>

        <strong>
          ${
            jump.flightTime > 0
              ? `${jump.flightTime}s`
              : "--"
          }
        </strong>

      </article>


      <article
        class="special-metric-card"
      >

        <span>
          추정 점프높이
        </span>

        <strong>
          ${
            jump.estimatedHeight > 0
              ? `${jump.estimatedHeight}cm`
              : "--"
          }
        </strong>

      </article>


      <article
        class="special-metric-card"
      >

        <span>
          이륙각
        </span>

        <strong>
          ${
            jump.takeoffAngle > 0
              ? `${jump.takeoffAngle}°`
              : "--"
          }
        </strong>

      </article>

    `;

  }


  if (
    event?.sprintAnalysis
  ) {

    const sprint =
      record.sprint || {};


    html += `

      <article
        class="special-metric-card"
      >

        <span>
          추정 케이던스
        </span>

        <strong>
          ${
            sprint.cadence > 0
              ? `${sprint.cadence} spm`
              : "--"
          }
        </strong>

      </article>


      <article
        class="special-metric-card"
      >

        <span>
          감지 스텝
        </span>

        <strong>
          ${
            sprint.stepCount || 0
          }
        </strong>

      </article>

    `;

  }


  if (!html) {

    html = `
      <div class="empty-state">
        이 종목에는 별도의 점프/스프린트 지표가 없습니다.
      </div>
    `;

  }


  container.innerHTML =
    html;

}


/* =========================================================
   179. REPORT FEEDBACK
========================================================= */

function renderReportFeedback(
  record
) {

  const container =
    byId(
      "reportFeedbackList"
    );


  if (!container) {
    return;
  }


  const feedback =
    createReportFeedback(
      record
    );


  container.innerHTML =
    feedback
      .map(
        item => `

          <article
            class="report-feedback-item ${
              item.type
            }"
          >

            <strong>
              ${
                escapeHTML(
                  item.title
                )
              }
            </strong>

            <p>
              ${
                escapeHTML(
                  item.text
                )
              }
            </p>

          </article>

        `
      )
      .join("");

}


/* =========================================================
   180. CREATE REPORT FEEDBACK
========================================================= */

function createReportFeedback(
  record
) {

  const metrics =
    record.metrics || {};


  const feedback = [];


  /*
     강점
  */

  const metricEntries = [

    [
      "speed",
      "동작 속도"
    ],

    [
      "power",
      "파워"
    ],

    [
      "agility",
      "민첩성"
    ],

    [
      "stability",
      "중심 안정성"
    ],

    [
      "symmetry",
      "좌우 대칭성"
    ],

    [
      "technique",
      "기술 수행"
    ]

  ]
    .map(
      ([key, label]) => ({

        key,

        label,

        value:
          Number(
            metrics[key]
          ) || 0

      })
    )
    .filter(
      item =>
        item.value > 0
    )
    .sort(
      (a, b) =>
        b.value -
        a.value
    );


  if (
    metricEntries.length
  ) {

    const strongest =
      metricEntries[0];


    feedback.push({

      type: "good",

      title:
        "강점 지표",

      text:
        `${strongest.label} 지표가 현재 분석 항목 중 가장 높게 나타났습니다. 같은 촬영 조건에서 반복 측정해 변화 추이를 확인하는 것이 좋습니다.`

    });


    const weakest =
      metricEntries[
        metricEntries.length -
        1
      ];


    if (
      weakest.value <
      strongest.value
    ) {

      feedback.push({

        type: "warning",

        title:
          "우선 확인 항목",

        text:
          `${weakest.label} 지표가 상대적으로 낮게 나타났습니다. 핵심 프레임과 각도 변화 그래프에서 원인이 되는 구간을 확인하세요.`

      });

    }

  }


  /*
     좌우 대칭
  */

  if (
    Number(
      metrics.symmetry
    ) > 0
  ) {

    if (
      metrics.symmetry >= 85
    ) {

      feedback.push({

        type: "good",

        title:
          "좌우 밸런스",

        text:
          "분석된 영상에서는 좌우 관절각 차이가 비교적 작게 나타났습니다."

      });

    } else if (
      metrics.symmetry < 70
    ) {

      feedback.push({

        type: "warning",

        title:
          "좌우 밸런스 확인",

        text:
          "좌우 관절 움직임 차이가 나타났습니다. 한 번의 영상만으로 판단하지 말고 동일 조건에서 여러 번 촬영해 비교하세요."

      });

    }

  }


  /*
     안정성
  */

  if (
    Number(
      metrics.stability
    ) > 0 &&
    metrics.stability < 70
  ) {

    feedback.push({

      type: "info",

      title:
        "신체중심 궤적",

      text:
        "신체중심의 좌우 이동량이 비교적 크게 나타났습니다. 발 지지 위치와 몸통 정렬을 함께 확인하세요."

    });

  }


  /*
     데이터 주의
  */

  feedback.push({

    type: "info",

    title:
      "분석 데이터 안내",

    text:
      "관절각·신체중심·점프·케이던스 값은 단일 영상 기반 추정값입니다. 실제 체대입시 기록이나 의료·진단 결과를 대신하지 않습니다."

  });


  return feedback;

}


/* =========================================================
   181. TRAINING RECOMMENDATIONS
========================================================= */

function renderTrainingRecommendations(
  record
) {

  const container =
    byId(
      "trainingRecommendationList"
    );


  if (!container) {
    return;
  }


  const recommendations =
    createTrainingRecommendations(
      record
    );


  container.innerHTML =
    recommendations
      .map(
        (
          item,
          index
        ) => `

          <article
            class="training-card"
          >

            <div
              class="training-number"
            >
              ${
                index + 1
              }
            </div>

            <div>

              <strong>
                ${
                  escapeHTML(
                    item.name
                  )
                }
              </strong>

              <p>
                ${
                  escapeHTML(
                    item.reason
                  )
                }
              </p>

              <span>
                ${
                  escapeHTML(
                    item.guide
                  )
                }
              </span>

            </div>

          </article>

        `
      )
      .join("");

}


/* =========================================================
   182. CREATE TRAINING RECOMMENDATIONS
========================================================= */

function createTrainingRecommendations(
  record
) {

  const metrics =
    record.metrics || {};


  const eventName =
    String(
      record.eventName || ""
    );


  const list = [];


  /*
     안정성
  */

  if (
    Number(
      metrics.stability
    ) > 0 &&
    metrics.stability < 75
  ) {

    list.push({

      name:
        "싱글 레그 밸런스",

      reason:
        "신체중심 안정성과 한쪽 다리 지지 능력을 확인하기 위한 기본 훈련입니다.",

      guide:
        "정확한 자세를 유지할 수 있는 범위에서 짧게 반복"

    });

  }


  /*
     대칭
  */

  if (
    Number(
      metrics.symmetry
    ) > 0 &&
    metrics.symmetry < 80
  ) {

    list.push({

      name:
        "스플릿 스쿼트",

      reason:
        "좌우 다리를 따로 사용해 움직임 차이를 확인하고 기본적인 하지 조절 능력을 훈련합니다.",

      guide:
        "좌우 같은 동작 품질을 우선하고 무게보다 자세에 집중"

    });

  }


  /*
     점프
  */

  if (
    record.jump &&
    (
      record.jump.flightTime > 0 ||
      /점프|멀리뛰기|서전트/.test(
        eventName
      )
    )
  ) {

    list.push({

      name:
        "카운터무브먼트 점프 기술연습",

      reason:
        "하강-전환-이륙 타이밍을 영상으로 비교하기 좋습니다.",

      guide:
        "충분한 휴식을 두고 소수 반복, 착지 자세가 무너지면 종료"

    });


    list.push({

      name:
        "포고 점프 기초",

      reason:
        "발목과 하지의 빠른 반응 및 리듬을 연습할 수 있습니다.",

      guide:
        "낮은 높이와 안정적인 착지부터 시작"

    });

  }


  /*
     달리기
  */

  if (
    record.sprint &&
    (
      record.sprint.cadence > 0 ||
      /달리기|왕복|스프린트/.test(
        eventName
      )
    )
  ) {

    list.push({

      name:
        "A-March / A-Skip",

      reason:
        "달리기 자세의 무릎 드라이브와 상하체 리듬을 연습하기 좋습니다.",

      guide:
        "속도보다 자세와 리듬을 먼저 맞추기"

    });

  }


  /*
     기본
  */

  if (
    list.length < 3
  ) {

    list.push({

      name:
        "맨몸 스쿼트 자세연습",

      reason:
        "무릎·고관절·몸통의 기본적인 협응을 영상으로 확인하기 좋은 동작입니다.",

      guide:
        "통증 없는 범위에서 자세를 우선해 실시"

    });

  }


  if (
    list.length < 3
  ) {

    list.push({

      name:
        "리버스 런지",

      reason:
        "한쪽 다리 지지와 골반 안정성을 확인하기 좋습니다.",

      guide:
        "좌우를 번갈아 실시하며 움직임 차이 확인"

    });

  }


  return list.slice(
    0,
    5
  );

}


/* =========================================================
   183. RADAR CHART
========================================================= */

function renderReportRadarChart(
  record
) {

  const canvas =
    byId(
      "reportRadarCanvas"
    );


  if (
    !canvas ||
    typeof Chart ===
      "undefined"
  ) {
    return;
  }


  if (
    reportRadarChart
  ) {

    reportRadarChart.destroy();

  }


  const metrics =
    record.metrics || {};


  reportRadarChart =
    new Chart(
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
                record.athleteName ||
                "선수",

              data: [

                metrics.speed || 0,

                metrics.power || 0,

                metrics.agility || 0,

                metrics.stability || 0,

                metrics.symmetry || 0,

                metrics.technique || 0

              ],

              borderWidth: 2,

              pointRadius: 3

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

              min: 0,

              max: 100,

              ticks: {

                stepSize: 20

              }

            }

          },

          plugins: {

            legend: {

              position:
                "bottom"

            }

          }

        }

      }
    );

}


/* =========================================================
   184. REPORT ANGLE CHART
========================================================= */

function renderReportAngleChart(
  record
) {

  const canvas =
    byId(
      "reportAngleCanvas"
    );


  if (
    !canvas ||
    typeof Chart ===
      "undefined"
  ) {
    return;
  }


  if (
    reportAngleChart
  ) {

    reportAngleChart.destroy();

  }


  const graph =
    record.graphData || {};


  const labels =
    Array.isArray(
      graph.time
    )
      ? graph.time
      : [];


  reportAngleChart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label:
                "왼무릎",

              data:
                graph.leftKnee ||
                [],

              pointRadius: 0,

              borderWidth: 2

            },

            {

              label:
                "오른무릎",

              data:
                graph.rightKnee ||
                [],

              pointRadius: 0,

              borderWidth: 2

            },

            {

              label:
                "왼고관절",

              data:
                graph.leftHip ||
                [],

              pointRadius: 0,

              borderWidth: 2

            },

            {

              label:
                "오른고관절",

              data:
                graph.rightHip ||
                [],

              pointRadius: 0,

              borderWidth: 2

            },

            {

              label:
                "몸통",

              data:
                graph.trunk ||
                [],

              pointRadius: 0,

              borderWidth: 2

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

            mode:
              "index",

            intersect:
              false

          },

          scales: {

            x: {

              title: {

                display:
                  true,

                text:
                  "TIME (s)"

              }

            },

            y: {

              suggestedMin:
                0,

              suggestedMax:
                180,

              title: {

                display:
                  true,

                text:
                  "ANGLE (°)"

              }

            }

          },

          plugins: {

            legend: {

              position:
                "bottom"

            }

          }

        }

      }
    );

}


/* =========================================================
   185. PE ENTRANCE EVALUATION
========================================================= */

function renderPEEntranceEvaluation(
  record
) {

  const container =
    byId(
      "peEvaluation"
    );


  if (!container) {
    return;
  }


  const evaluation =
    createPEEvaluation(
      record
    );


  container.innerHTML = `

    <div
      class="pe-evaluation-head"
    >

      <div>

        <span>
          PE ENTRANCE ANALYSIS
        </span>

        <h3>
          체대입시 동작 분석
        </h3>

      </div>

      <strong>
        ${
          evaluation.level
        }
      </strong>

    </div>


    <div
      class="pe-evaluation-grid"
    >

      <article>

        <span>
          자세 안정성
        </span>

        <strong>
          ${
            evaluation.stability
          }
        </strong>

      </article>


      <article>

        <span>
          좌우 대칭
        </span>

        <strong>
          ${
            evaluation.symmetry
          }
        </strong>

      </article>


      <article>

        <span>
          기술 수행
        </span>

        <strong>
          ${
            evaluation.technique
          }
        </strong>

      </article>


      <article>

        <span>
          분석 신뢰도
        </span>

        <strong>
          ${
            evaluation.confidence
          }
        </strong>

      </article>

    </div>


    <p
      class="pe-evaluation-note"
    >
      ${
        escapeHTML(
          evaluation.note
        )
      }
    </p>

  `;

}


/* =========================================================
   186. CREATE PE EVALUATION
========================================================= */

function createPEEvaluation(
  record
) {

  const metrics =
    record.metrics || {};


  const stability =
    Math.round(
      Number(
        metrics.stability
      ) || 0
    );


  const symmetry =
    Math.round(
      Number(
        metrics.symmetry
      ) || 0
    );


  const technique =
    Math.round(
      Number(
        metrics.technique
      ) || 0
    );


  const score =
    Number(
      record.score
    ) || 0;


  let level =
    "분석 필요";


  if (score >= 90) {

    level =
      "EXCELLENT";

  } else if (
    score >= 80
  ) {

    level =
      "VERY GOOD";

  } else if (
    score >= 70
  ) {

    level =
      "GOOD";

  } else if (
    score > 0
  ) {

    level =
      "DEVELOPING";

  }


  /*
     프레임 수를 이용한
     단순 영상 분석 데이터 충분도.
  */

  let confidence =
    "LOW";


  if (
    record.frameCount >= 80
  ) {

    confidence =
      "HIGH";

  } else if (
    record.frameCount >= 30
  ) {

    confidence =
      "MEDIUM";

  }


  return {

    stability:
      stability > 0
        ? stability
        : "--",

    symmetry:
      symmetry > 0
        ? symmetry
        : "--",

    technique:
      technique > 0
        ? technique
        : "--",

    level,

    confidence,

    note:
      "이 평가는 업로드 영상에서 계산된 자세·움직임 지표를 정리한 참고 분석입니다. 대학별 실제 실기 점수·합격선은 별도의 공식 기준과 기록을 사용해야 합니다."

  };

}


/* =========================================================
   187. PRINT REPORT
========================================================= */

function printCurrentReport() {

  const record =
    getCurrentReportRecord();


  if (!record) {

    showToast(
      "출력할 리포트가 없습니다."
    );

    return;

  }


  window.print();

}


/* =========================================================
   188. REPORT → ANALYSIS
========================================================= */

function returnToAnalysis() {

  navigateTo(
    "analysis"
  );

}


/* =========================================================
   189. REPORT → EVENTS
========================================================= */

function returnToEvents() {

  navigateTo(
    "events"
  );

}


/* =========================================================
   190. REPORT EVENTS
========================================================= */

function bindReportEvents() {

  const printButton =
    byId(
      "printReportButton"
    );


  if (printButton) {

    printButton.addEventListener(
      "click",
      printCurrentReport
    );

  }


  const analysisButton =
    byId(
      "reportBackAnalysisButton"
    );


  if (analysisButton) {

    analysisButton.addEventListener(
      "click",
      returnToAnalysis
    );

  }


  const eventButton =
    byId(
      "reportBackEventsButton"
    );


  if (eventButton) {

    eventButton.addEventListener(
      "click",
      returnToEvents
    );

  }

}


/* =========================================================
   191. SETTINGS UI
========================================================= */

function renderSettings() {

  updateAnalysisOptionUI();


  const version =
    byId(
      "appVersion"
    );


  if (version) {

    version.textContent =
      APP_CONFIG.version;

  }

}


/* =========================================================
   192. CLEAR ALL ANALYSIS DATA
========================================================= */

function clearAllAnalysisData() {

  if (
    !AppState.analyses.length
  ) {

    showToast(
      "삭제할 분석 기록이 없습니다."
    );

    return;

  }


  const confirmed =
    window.confirm(
      "저장된 분석 기록을 모두 삭제할까요?"
    );


  if (!confirmed) {
    return;
  }


  AppState.analyses =
    [];


  AppState.currentReportId =
    null;


  saveAnalyses();


  renderDashboard();

  renderRecords();

  renderReport();


  showToast(
    "모든 분석 기록을 삭제했습니다."
  );

}


/* =========================================================
   193. SETTINGS EVENTS
========================================================= */

function bindSettingsEvents() {

  const clearButton =
    byId(
      "clearAnalysisDataButton"
    );


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearAllAnalysisData
    );

  }

}


/* =========================================================
   194. UPDATE PAGE ENTER HANDLER
========================================================= */

const originalHandlePageEntered =
  handlePageEntered;


handlePageEntered =
  function(pageName) {

    originalHandlePageEntered(
      pageName
    );


    if (
      pageName ===
      "analysis"
    ) {

      updateVideoUI();

      renderFeedbackList();

    }


    if (
      pageName ===
      "records"
    ) {

      fillAthleteSelectors();

      renderRecords();

    }


    if (
      pageName ===
      "report"
    ) {

      renderReport();

    }


    if (
      pageName ===
      "settings"
    ) {

      renderSettings();

    }

  };


/* =========================================================
   195. SAVE RECORD PATCH

   feedback도 저장되도록 보완
========================================================= */

const originalSaveCurrentAnalysis =
  saveCurrentAnalysis;


saveCurrentAnalysis =
  function() {

    const record =
      originalSaveCurrentAnalysis();


    if (!record) {
      return null;
    }


    record.feedback =
      JSON.parse(
        JSON.stringify(
          AppState.analysis
            .feedback || []
        )
      );


    saveAnalyses();


    return record;

  };


window.saveCurrentAnalysis =
  saveCurrentAnalysis;


/* =========================================================
   196. ANALYSIS FINISH PATCH

   종료 후 결과 UI 전체 갱신
========================================================= */

const originalStopVideoAnalysis =
  stopVideoAnalysis;


stopVideoAnalysis =
  function() {

    originalStopVideoAnalysis();


    if (
      !AppState.analysis.finished
    ) {
      return;
    }


    renderAnalysisSummary();

    renderFeedbackList();

    renderAngleGraph();

    renderKeyFrameList();

    updateJumpUI();

    updateSprintUI();

    updateLiveMetricUI();

  };


window.stopVideoAnalysis =
  stopVideoAnalysis;


/* =========================================================
   197. FINISH → REPORT PATCH
========================================================= */

const originalFinishAnalysisAndOpenReport =
  finishAnalysisAndOpenReport;


finishAnalysisAndOpenReport =
  function() {

    /*
       현재 분석 중이면 종료
    */

    if (
      AppState.analysis.running
    ) {

      stopVideoAnalysis();

    }


    if (
      !AppState.analysis.finished
    ) {

      showToast(
        "먼저 영상을 분석해줘."
      );

      return;

    }


    const record =
      saveCurrentAnalysis();


    if (!record) {
      return;
    }


    AppState.currentReportId =
      record.id;


    renderReport(
      record
    );


    navigateTo(
      "report"
    );

  };


window.finishAnalysisAndOpenReport =
  finishAnalysisAndOpenReport;


/* =========================================================
   198. FULL SYSTEM INITIALIZATION FLAG
========================================================= */

let fullAppInitialized =
  false;


/* =========================================================
   199. FULL APP INITIALIZE
========================================================= */

function initializeFullApp() {

  if (
    fullAppInitialized
  ) {

    return;

  }


  fullAppInitialized =
    true;


  console.log(
    "=================================="
  );

  console.log(
    "설천고 PE PERFORMANCE LAB"
  );

  console.log(
    `VERSION ${APP_CONFIG.version}`
  );

  console.log(
    "SYSTEM START"
  );

  console.log(
    "=================================="
  );


  /*
     DATA
  */

  loadAppData();


  /*
     CORE EVENTS
  */

  bindCoreButtons();


  /*
     VIDEO
  */

  initializeVideoSystem();


  /*
     ANALYSIS
  */

  initializeAnalysisEngine();


  /*
     RECORD
  */

  bindRecordEvents();


  /*
     REPORT
  */

  bindReportEvents();


  /*
     SETTINGS
  */

  bindSettingsEvents();


  /*
     UI
  */

  fillAthleteSelectors();

  fillAnalysisEventSelect();

  renderDashboard();

  renderAthleteManagement();

  renderEventPage();

  updateAnalysisPage();

  renderRecords();

  renderSettings();


  /*
     CLOCK
  */

  updateClock();


  setInterval(
    updateClock,
    1000
  );


  /*
     DEFAULT PAGE
  */

  navigateTo(
    "dashboard"
  );


  console.log(
    "[APP] FULL SYSTEM READY"
  );


  showToast(
    "PE PERFORMANCE LAB 준비 완료"
  );

}


/* =========================================================
   200. DOM READY FIX

   PART 1에서 DOMContentLoaded가 이미 등록되어 있으므로
   window.initializeFullApp을 노출하면
   PART 1의 DOM READY가 이 함수를 실행한다.
========================================================= */

window.initializeFullApp =
  initializeFullApp;


/* =========================================================
   201. DOM ALREADY LOADED FALLBACK

   script가 DOMContentLoaded 이후 로드되는 경우 대응
========================================================= */

if (
  document.readyState !==
  "loading"
) {

  setTimeout(
    () => {

      if (
        !fullAppInitialized
      ) {

        initializeFullApp();

      }

    },
    0
  );

}


/* =========================================================
   202. CLEANUP
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    stopAnalysisLoop();


    if (
      AppState.video.url
    ) {

      try {

        URL.revokeObjectURL(
          AppState.video.url
        );

      } catch (error) {

        console.warn(
          error
        );

      }

    }

  }
);


/* =========================================================
   203. DEBUG STATUS

   브라우저 콘솔에서
   PE_DEBUG() 입력하면 현재 상태 확인 가능
========================================================= */

window.PE_DEBUG =
  function() {

    console.log(
      "===== PE PERFORMANCE LAB DEBUG ====="
    );


    console.log(
      "Current Page:",
      AppState.currentPage
    );


    console.log(
      "Selected Athlete:",
      getSelectedAthlete()
    );


    console.log(
      "Selected Event:",
      getSelectedEvent()
    );


    console.log(
      "Video:",
      AppState.video
    );


    console.log(
      "Analysis:",
      AppState.analysis
    );


    console.log(
      "Pose Ready:",
      poseSystemReady
    );


    console.log(
      "Records:",
      AppState.analyses.length
    );


    console.log(
      "===================================="
    );

  };


/* =========================================================
   204. GLOBAL EXPORT
========================================================= */

window.renderRecords =
  renderRecords;

window.openAnalysisRecord =
  openAnalysisRecord;

window.deleteAnalysisRecord =
  deleteAnalysisRecord;

window.renderReport =
  renderReport;

window.printCurrentReport =
  printCurrentReport;

window.createTrainingRecommendations =
  createTrainingRecommendations;

window.createPEEvaluation =
  createPEEvaluation;

window.initializeFullApp =
  initializeFullApp;


/* =========================================================
   END OF APP.JS
========================================================= */