/* =========================================================
   SEOLCHEON HIGH SCHOOL
   PE PERFORMANCE LAB — FINAL 3.0

   app.js
   PART 1 / 3

   CORE
   - Navigation
   - Local Storage
   - Athletes
   - PE Events
   - Video Controls
   - Analysis State
========================================================= */

"use strict";


/* =========================================================
   01. CONFIG
========================================================= */

const APP_CONFIG = {

  name: "설천고 PE PERFORMANCE LAB",

  version: "3.0.0",

  storage: {
    athletes: "sc_pe_athletes_v3",
    analyses: "sc_pe_analyses_v3",
    settings: "sc_pe_settings_v3"
  },

  maxTrajectoryPoints: 180,

  maxGraphPoints: 300,

  frameStep: 1 / 30

};


/* =========================================================
   02. DOM HELPER
========================================================= */

const $ = id =>
  document.getElementById(id);

const $$ = selector =>
  Array.from(
    document.querySelectorAll(selector)
  );


/* =========================================================
   03. APP STATE
========================================================= */

const state = {

  currentPage: "dashboard",

  athletes: [],

  analyses: [],

  settings: {
    skeleton: true,
    angles: true,
    trajectory: true,
    centerOfMass: true
  },

  selectedEventId: "",

  selectedAthleteId: "",

  currentVideoFile: null,

  currentVideoURL: null,

  analysisRunning: false,

  poseBusy: false,

  lastPoseTime: 0,

  analysisStartedAt: null,

  frames: [],

  angleHistory: [],

  trajectory: [],

  keyFrames: [],

  currentLandmarks: null,

  currentAngles: null,

  currentMetrics: {
    speed: 0,
    power: 0,
    agility: 0,
    stability: 0,
    symmetry: 0,
    technique: 0
  },

  specialMetrics: {
    jumpHeight: null,
    flightTime: null,
    takeoffAngle: null,
    cadence: null,
    stepCount: 0
  },

  motion: {
    previousCenter: null,
    previousTime: null,
    velocities: [],
    verticalPositions: [],
    hipPositions: [],
    anklePositions: [],
    stepTimes: []
  },

  pose: null,

  chart: null,

  reportRadarChart: null,

  reportAngleChart: null,

  currentReport: null,

  activeEventCategory: "all",

  searchKeyword: ""
};


/* =========================================================
   04. PAGE TITLES
========================================================= */

const PAGE_TITLES = {

  dashboard: "대시보드",

  athletes: "선수 관리",

  events: "체대입시",

  analysis: "영상 자세분석",

  records: "분석 기록",

  report: "리포트",

  settings: "설정"

};


/* =========================================================
   05. SAFE STORAGE
========================================================= */

function loadJSON(key, fallback) {

  try {

    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed =
      JSON.parse(raw);

    return parsed ?? fallback;

  } catch (error) {

    console.warn(
      "[STORAGE] load error",
      key,
      error
    );

    return fallback;
  }
}


function saveJSON(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {

    console.error(
      "[STORAGE] save error",
      key,
      error
    );

    showToast(
      "데이터 저장 중 오류가 발생했습니다.",
      true
    );

    return false;
  }
}


/* =========================================================
   06. LOAD STATE
========================================================= */

function loadState() {

  state.athletes =
    loadJSON(
      APP_CONFIG.storage.athletes,
      []
    );

  state.analyses =
    loadJSON(
      APP_CONFIG.storage.analyses,
      []
    );

  state.settings = {
    ...state.settings,
    ...loadJSON(
      APP_CONFIG.storage.settings,
      {}
    )
  };

}


/* =========================================================
   07. SAVE STATE
========================================================= */

function saveAthletes() {

  saveJSON(
    APP_CONFIG.storage.athletes,
    state.athletes
  );
}


function saveAnalyses() {

  saveJSON(
    APP_CONFIG.storage.analyses,
    state.analyses
  );
}


function saveSettings() {

  saveJSON(
    APP_CONFIG.storage.settings,
    state.settings
  );
}


/* =========================================================
   08. ID
========================================================= */

function createId(prefix = "id") {

  if (
    window.crypto &&
    typeof crypto.randomUUID === "function"
  ) {

    return (
      prefix +
      "-" +
      crypto.randomUUID()
    );
  }

  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}


/* =========================================================
   09. HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   10. CLAMP
========================================================= */

function clamp(
  value,
  min = 0,
  max = 100
) {

  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.max(
    min,
    Math.min(max, number)
  );
}


/* =========================================================
   11. AVERAGE
========================================================= */

function average(values = []) {

  const valid =
    values.filter(
      value =>
        Number.isFinite(
          Number(value)
        )
    );

  if (!valid.length) {
    return 0;
  }

  return (
    valid.reduce(
      (sum, value) =>
        sum + Number(value),
      0
    ) / valid.length
  );
}


/* =========================================================
   12. FORMAT TIME
========================================================= */

function formatVideoTime(seconds) {

  const safe =
    Math.max(
      0,
      Number(seconds) || 0
    );

  const minutes =
    Math.floor(safe / 60);

  const secs =
    Math.floor(safe % 60);

  const centiseconds =
    Math.floor(
      (safe % 1) * 100
    );

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0") +
    "." +
    String(centiseconds).padStart(2, "0")
  );
}


/* =========================================================
   13. TOAST
========================================================= */

let toastTimer = null;

function showToast(
  message,
  isError = false
) {

  const toast = $("toast");

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.toggle(
    "error",
    isError
  );

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2600);
}


/* =========================================================
   14. CLOCK
========================================================= */

function updateClock() {

  const clock = $("clock");

  if (!clock) {
    return;
  }

  const now =
    new Date();

  clock.textContent =
    now.toLocaleTimeString(
      "ko-KR",
      {
        hour12: false
      }
    );
}


/* =========================================================
   15. NAVIGATION
========================================================= */

function openPage(pageName) {

  const target =
    document.querySelector(
      `[data-page-section="${pageName}"]`
    );

  if (!target) {

    console.warn(
      "[NAV] page not found:",
      pageName
    );

    return;
  }


  $$(".page").forEach(page => {

    page.classList.remove("active");

  });


  target.classList.add("active");


  $$(".nav-button").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );

  });


  state.currentPage =
    pageName;


  const title =
    $("pageTitle");

  if (title) {

    title.textContent =
      PAGE_TITLES[pageName] ||
      pageName;
  }


  closeMobileSidebar();


  if (pageName === "dashboard") {

    renderDashboard();

  } else if (pageName === "athletes") {

    renderAthletes();

  } else if (pageName === "events") {

    renderEventPage();

  } else if (pageName === "analysis") {

    refreshAnalysisSelectors();

  } else if (pageName === "records") {

    renderRecords();

  } else if (pageName === "report") {

    renderReport();

  } else if (pageName === "settings") {

    renderSettings();
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   16. NAVIGATION EVENTS
========================================================= */

function bindNavigation() {

  $$(".nav-button").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;

        if (page) {
          openPage(page);
        }
      }
    );

  });


  $("dashboardStartAnalysisButton")
    ?.addEventListener(
      "click",
      () => openPage("events")
    );


  $("reportEmptyAnalysisButton")
    ?.addEventListener(
      "click",
      () => openPage("analysis")
    );


  $("reportBackAnalysisButton")
    ?.addEventListener(
      "click",
      () => openPage("analysis")
    );


  $("finishReportButton")
    ?.addEventListener(
      "click",
      () => openPage("report")
    );


  $("summaryOpenReportButton")
    ?.addEventListener(
      "click",
      () => openPage("report")
    );
}


/* =========================================================
   17. MOBILE SIDEBAR
========================================================= */

function openMobileSidebar() {

  $("sidebar")
    ?.classList.add("open");

  $("sidebarOverlay")
    ?.classList.add("active");
}


function closeMobileSidebar() {

  $("sidebar")
    ?.classList.remove("open");

  $("sidebarOverlay")
    ?.classList.remove("active");
}


function bindMobileSidebar() {

  $("mobileMenuButton")
    ?.addEventListener(
      "click",
      openMobileSidebar
    );

  $("sidebarOverlay")
    ?.addEventListener(
      "click",
      closeMobileSidebar
    );
}


/* =========================================================
   18. DASHBOARD
========================================================= */

function renderDashboard() {

  const athleteCount =
    state.athletes.length;

  const analysisCount =
    state.analyses.length;


  if ($("dashboardAthleteCount")) {

    $("dashboardAthleteCount")
      .textContent =
      athleteCount;
  }


  if ($("dashboardAnalysisCount")) {

    $("dashboardAnalysisCount")
      .textContent =
      analysisCount;
  }


  const scores =
    state.analyses
      .map(item =>
        Number(item.score)
      )
      .filter(Number.isFinite);


  const averageScore =
    scores.length
      ? Math.round(average(scores))
      : null;


  if ($("dashboardAverageScore")) {

    $("dashboardAverageScore")
      .textContent =
      averageScore ?? "--";
  }


  const recent =
    state.analyses.slice(0, 5);


  if ($("dashboardRecentCount")) {

    $("dashboardRecentCount")
      .textContent =
      recent.length;
  }


  renderDashboardPerformance();

  renderDashboardRecent();
}


/* =========================================================
   19. DASHBOARD PERFORMANCE
========================================================= */

function renderDashboardPerformance() {

  const latest =
    state.analyses[0];


  const metrics =
    latest?.metrics || {};


  setDashboardMetric(
    "dashboardStability",
    metrics.stability
  );

  setDashboardMetric(
    "dashboardSymmetry",
    metrics.symmetry
  );

  setDashboardMetric(
    "dashboardTechnique",
    metrics.technique
  );

  setDashboardMetric(
    "dashboardPower",
    metrics.power
  );
}


function setDashboardMetric(
  prefix,
  value
) {

  const numeric =
    Number(value);

  const display =
    Number.isFinite(numeric)
      ? Math.round(numeric)
      : "--";


  const bar =
    $(prefix + "Bar");

  const text =
    $(prefix + "Value");


  if (bar) {

    bar.style.width =
      Number.isFinite(numeric)
        ? clamp(numeric) + "%"
        : "0%";
  }


  if (text) {

    text.textContent =
      display;
  }
}


/* =========================================================
   20. DASHBOARD RECENT
========================================================= */

function renderDashboardRecent() {

  const container =
    $("dashboardRecentList");

  if (!container) {
    return;
  }


  const recent =
    state.analyses.slice(0, 5);


  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state">
        아직 분석 기록이 없습니다.
      </div>
    `;

    return;
  }


  container.innerHTML =
    recent
      .map(record => {

        const athlete =
          getAthleteById(
            record.athleteId
          );

        return `
          <div class="record-card">

            <div class="record-card-header">

              <strong>
                ${escapeHTML(
                  athlete?.name ||
                  record.athleteName ||
                  "선수"
                )}
              </strong>

              <span class="count-badge">
                ${Math.round(
                  Number(record.score) || 0
                )}
              </span>

            </div>

            <p>
              ${escapeHTML(
                record.eventName ||
                "영상 분석"
              )}
              ·
              ${escapeHTML(
                formatDateTime(
                  record.createdAt
                )
              )}
            </p>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   21. ATHLETE HELPERS
========================================================= */

function getAthleteById(id) {

  return (
    state.athletes.find(
      athlete =>
        athlete.id === id
    ) || null
  );
}


/* =========================================================
   22. ATHLETE FORM
========================================================= */

function bindAthleteForm() {

  const form =
    $("athleteForm");

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const name =
        $("athleteNameInput")
          ?.value
          .trim();


      if (!name) {

        showToast(
          "선수 이름을 입력해주세요.",
          true
        );

        return;
      }


      const athlete = {

        id:
          createId("athlete"),

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


      state.athletes.unshift(
        athlete
      );


      saveAthletes();

      form.reset();

      renderAthletes();

      refreshAnalysisSelectors();

      renderDashboard();


      showToast(
        `${athlete.name} 선수 저장 완료`
      );
    }
  );
}


/* =========================================================
   23. ATHLETE LIST
========================================================= */

function renderAthletes() {

  const list =
    $("athleteList");

  const badge =
    $("athleteCountBadge");


  if (badge) {

    badge.textContent =
      state.athletes.length;
  }


  if (!list) {
    return;
  }


  if (!state.athletes.length) {

    list.innerHTML = `
      <div class="empty-state">
        등록된 선수가 없습니다.
      </div>
    `;

    return;
  }


  list.innerHTML =
    state.athletes
      .map(athlete => {

        return `
          <article class="athlete-card">

            <div class="athlete-card-header">

              <div>

                <strong>
                  ${escapeHTML(
                    athlete.name
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    athlete.grade || "-"
                  )}
                  ·
                  ${escapeHTML(
                    athlete.sport || "종목 미설정"
                  )}
                </p>

              </div>

            </div>


            <p>
              키:
              ${
                athlete.height
                  ? athlete.height + "cm"
                  : "-"
              }
              ·
              체중:
              ${
                athlete.weight
                  ? athlete.weight + "kg"
                  : "-"
              }
            </p>


            <div class="athlete-card-actions">

              <button
                type="button"
                data-athlete-analysis="${athlete.id}"
              >
                영상 분석
              </button>

              <button
                type="button"
                data-athlete-delete="${athlete.id}"
              >
                삭제
              </button>

            </div>

          </article>
        `;

      })
      .join("");


  $$("[data-athlete-analysis]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.selectedAthleteId =
            button.dataset
              .athleteAnalysis;

          refreshAnalysisSelectors();

          openPage("analysis");
        }
      );

    });


  $$("[data-athlete-delete]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteAthlete(
            button.dataset
              .athleteDelete
          );
        }
      );

    });
}


/* =========================================================
   24. DELETE ATHLETE
========================================================= */

function deleteAthlete(id) {

  const athlete =
    getAthleteById(id);

  if (!athlete) {
    return;
  }


  const confirmed =
    window.confirm(
      `${athlete.name} 선수를 삭제할까요?`
    );


  if (!confirmed) {
    return;
  }


  state.athletes =
    state.athletes.filter(
      item =>
        item.id !== id
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
   25. EVENT PAGE
========================================================= */

function renderEventPage() {

  renderEventCategories();

  renderEventGrid();

  populateEventSelect();
}


/* =========================================================
   26. EVENT CATEGORIES
========================================================= */

function renderEventCategories() {

  const container =
    $("eventCategoryButtons");

  if (!container) {
    return;
  }


  const categories =
    window.EVENT_CATEGORIES || [];


  container.innerHTML =
    categories
      .map(category => {

        if (
          typeof window
            .createCategoryButtonHTML
          === "function"
        ) {

          return (
            window
              .createCategoryButtonHTML(
                category,
                state.activeEventCategory
              )
          );
        }


        return `
          <button
            type="button"
            class="${
              category.id ===
              state.activeEventCategory
                ? "active"
                : ""
            }"
            data-event-category="${category.id}"
          >
            ${escapeHTML(
              category.name
            )}
          </button>
        `;

      })
      .join("");


  $$("[data-event-category]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          state.activeEventCategory =
            button.dataset
              .eventCategory;

          renderEventCategories();

          renderEventGrid();
        }
      );

    });
}


/* =========================================================
   27. EVENT GRID
========================================================= */

function renderEventGrid() {

  const grid =
    $("eventGrid");

  if (!grid) {
    return;
  }


  let events =
    window.PE_EVENTS || [];


  if (
    state.activeEventCategory !==
    "all"
  ) {

    events =
      events.filter(
        event =>
          event.category ===
          state.activeEventCategory
      );
  }


  const keyword =
    state.searchKeyword
      .trim()
      .toLowerCase();


  if (keyword) {

    events =
      events.filter(event => {

        return [
          event.name,
          event.shortName,
          event.categoryName,
          event.ability,
          event.description
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      });
  }


  if (!events.length) {

    grid.innerHTML = `
      <div class="empty-state">
        검색 결과가 없습니다.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    events
      .map(event => {

        if (
          typeof window
            .createEventCardHTML
          === "function"
        ) {

          return (
            window
              .createEventCardHTML(
                event
              )
          );
        }


        return `
          <article class="event-card">

            <span class="section-label">
              ${escapeHTML(
                event.categoryName
              )}
            </span>

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

            <button
              type="button"
              data-event-id="${event.id}"
              class="event-analysis-button"
            >
              영상 분석
            </button>

          </article>
        `;

      })
      .join("");


  $$(".event-analysis-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const eventId =
            button.dataset.eventId;

          selectEventAndOpenAnalysis(
            eventId
          );
        }
      );

    });
}


/* =========================================================
   28. EVENT SEARCH
========================================================= */

function bindEventSearch() {

  $("eventSearchInput")
    ?.addEventListener(
      "input",
      event => {

        state.searchKeyword =
          event.target.value || "";

        renderEventGrid();
      }
    );
}


/* =========================================================
   29. SELECT EVENT
========================================================= */

function selectEventAndOpenAnalysis(
  eventId
) {

  const event =
    window.getEventById?.(
      eventId
    );


  if (!event) {

    showToast(
      "종목 정보를 찾지 못했습니다.",
      true
    );

    return;
  }


  state.selectedEventId =
    eventId;


  refreshAnalysisSelectors();

  updateAnalysisEventTitle();

  openPage("analysis");


  showToast(
    `${event.name} 분석 준비`
  );
}


/* =========================================================
   30. POPULATE EVENT SELECT
========================================================= */

function populateEventSelect() {

  const select =
    $("analysisEventSelect");

  if (!select) {
    return;
  }


  const events =
    window.PE_EVENTS || [];


  select.innerHTML = `
    <option value="">
      종목 선택
    </option>

    ${events
      .map(event => `
        <option value="${event.id}">
          ${escapeHTML(event.name)}
        </option>
      `)
      .join("")}
  `;


  if (state.selectedEventId) {

    select.value =
      state.selectedEventId;
  }
}


/* =========================================================
   31. POPULATE ATHLETE SELECT
========================================================= */

function populateAthleteSelect() {

  const select =
    $("analysisAthleteSelect");

  if (!select) {
    return;
  }


  select.innerHTML = `
    <option value="">
      선수 선택
    </option>

    ${state.athletes
      .map(athlete => `
        <option value="${athlete.id}">
          ${escapeHTML(
            athlete.name
          )}
        </option>
      `)
      .join("")}
  `;


  if (state.selectedAthleteId) {

    select.value =
      state.selectedAthleteId;
  }
}


/* =========================================================
   32. REFRESH ANALYSIS SELECTORS
========================================================= */

function refreshAnalysisSelectors() {

  populateAthleteSelect();

  populateEventSelect();

  updateAnalysisEventTitle();
}


/* =========================================================
   33. ANALYSIS SELECT EVENTS
========================================================= */

function bindAnalysisSelectors() {

  $("analysisAthleteSelect")
    ?.addEventListener(
      "change",
      event => {

        state.selectedAthleteId =
          event.target.value;
      }
    );


  $("analysisEventSelect")
    ?.addEventListener(
      "change",
      event => {

        state.selectedEventId =
          event.target.value;

        updateAnalysisEventTitle();

        resetAnalysisSession(
          false
        );
      }
    );
}


/* =========================================================
   34. EVENT TITLE
========================================================= */

function updateAnalysisEventTitle() {

  const title =
    $("analysisEventTitle");

  if (!title) {
    return;
  }


  const event =
    window.getEventById?.(
      state.selectedEventId
    );


  title.textContent =
    event
      ? `${event.name} 분석 영상`
      : "분석 영상";
}


/* =========================================================
   35. VIDEO ELEMENT
========================================================= */

function getVideo() {

  return $("analysisVideo");
}


/* =========================================================
   36. VIDEO FILE SELECT
========================================================= */

function bindVideoUpload() {

  const input =
    $("videoFileInput");

  const button =
    $("selectVideoButton");


  button?.addEventListener(
    "click",
    () => {

      input?.click();

    }
  );


  input?.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      loadVideoFile(file);
    }
  );
}


/* =========================================================
   37. LOAD VIDEO
========================================================= */

function loadVideoFile(file) {

  const video =
    getVideo();

  if (!video) {
    return;
  }


  if (
    !file.type.startsWith("video/")
  ) {

    showToast(
      "영상 파일을 선택해주세요.",
      true
    );

    return;
  }


  if (state.currentVideoURL) {

    URL.revokeObjectURL(
      state.currentVideoURL
    );
  }


  resetAnalysisSession(
    false
  );


  state.currentVideoFile =
    file;

  state.currentVideoURL =
    URL.createObjectURL(file);


  video.src =
    state.currentVideoURL;

  video.load();


  $("videoEmptyState")
    ?.classList.add("hidden");


  setAnalysisStatus(
    "VIDEO READY"
  );


  showToast(
    `${file.name} 영상 로드 완료`
  );
}


/* =========================================================
   38. VIDEO METADATA
========================================================= */

function bindVideoEvents() {

  const video =
    getVideo();

  if (!video) {
    return;
  }


  video.addEventListener(
    "loadedmetadata",
    () => {

      resizeAnalysisCanvases();

      updateVideoTimeline();

      const duration =
        $("videoDuration");

      if (duration) {

        duration.textContent =
          formatVideoTime(
            video.duration
          );
      }
    }
  );


  video.addEventListener(
    "timeupdate",
    () => {

      updateVideoTimeline();

    }
  );


  video.addEventListener(
    "play",
    () => {

      const button =
        $("playPauseButton");

      if (button) {
        button.textContent = "Ⅱ";
      }
    }
  );


  video.addEventListener(
    "pause",
    () => {

      const button =
        $("playPauseButton");

      if (button) {
        button.textContent = "▶";
      }
    }
  );


  video.addEventListener(
    "ended",
    () => {

      if (state.analysisRunning) {

        stopAnalysis();
      }
    }
  );
}


/* =========================================================
   39. VIDEO TIMELINE
========================================================= */

function updateVideoTimeline() {

  const video =
    getVideo();

  const timeline =
    $("videoTimeline");

  if (
    !video ||
    !timeline
  ) {
    return;
  }


  const duration =
    Number(video.duration) || 0;

  const current =
    Number(video.currentTime) || 0;


  timeline.max =
    duration || 1;

  timeline.value =
    current;


  if ($("videoCurrentTime")) {

    $("videoCurrentTime")
      .textContent =
      formatVideoTime(current);
  }


  if ($("videoDuration")) {

    $("videoDuration")
      .textContent =
      formatVideoTime(duration);
  }
}


/* =========================================================
   40. TIMELINE SEEK
========================================================= */

function bindTimeline() {

  $("videoTimeline")
    ?.addEventListener(
      "input",
      event => {

        const video =
          getVideo();

        if (!video) {
          return;
        }


        video.currentTime =
          Number(
            event.target.value
          ) || 0;
      }
    );
}


/* =========================================================
   41. PLAY / PAUSE
========================================================= */

function bindPlaybackControls() {

  $("playPauseButton")
    ?.addEventListener(
      "click",
      async () => {

        const video =
          getVideo();

        if (
          !video ||
          !video.src
        ) {

          showToast(
            "먼저 영상을 선택해주세요.",
            true
          );

          return;
        }


        if (video.paused) {

          try {

            await video.play();

          } catch (error) {

            console.error(error);

            showToast(
              "영상을 재생할 수 없습니다.",
              true
            );
          }

        } else {

          video.pause();
        }
      }
    );


  $("previousFrameButton")
    ?.addEventListener(
      "click",
      () => stepVideo(-1)
    );


  $("nextFrameButton")
    ?.addEventListener(
      "click",
      () => stepVideo(1)
    );


  $("slowMotionButton")
    ?.addEventListener(
      "click",
      () => {

        const video =
          getVideo();

        if (!video) {
          return;
        }


        video.playbackRate =
          0.5;


        if (
          $("playbackSpeedSelect")
        ) {

          $("playbackSpeedSelect")
            .value = "0.5";
        }


        showToast(
          "0.5× 슬로모션"
        );
      }
    );


  $("playbackSpeedSelect")
    ?.addEventListener(
      "change",
      event => {

        const video =
          getVideo();

        if (!video) {
          return;
        }


        video.playbackRate =
          Number(
            event.target.value
          ) || 1;
      }
    );
}


/* =========================================================
   42. FRAME STEP
========================================================= */

function stepVideo(direction) {

  const video =
    getVideo();

  if (
    !video ||
    !video.src
  ) {

    showToast(
      "먼저 영상을 선택해주세요.",
      true
    );

    return;
  }


  video.pause();


  const step =
    APP_CONFIG.frameStep *
    direction;


  video.currentTime =
    clamp(
      video.currentTime + step,
      0,
      video.duration || 0
    );
}


/* =========================================================
   43. RESIZE CANVAS
========================================================= */

function resizeAnalysisCanvases() {

  const video =
    getVideo();

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
    .forEach(canvas => {

      canvas.width =
        width;

      canvas.height =
        height;
    });
}


/* =========================================================
   44. ANALYSIS OPTIONS
========================================================= */

function bindAnalysisOptions() {

  const map = [

    [
      "skeletonOption",
      "skeleton"
    ],

    [
      "angleOption",
      "angles"
    ],

    [
      "trajectoryOption",
      "trajectory"
    ],

    [
      "centerOfMassOption",
      "centerOfMass"
    ]

  ];


  map.forEach(
    ([id, key]) => {

      $(id)?.addEventListener(
        "change",
        event => {

          state.settings[key] =
            event.target.checked;

          saveSettings();

          syncSettingsControls();

          redrawCurrentPose();
        }
      );

    }
  );
}


/* =========================================================
   45. SETTINGS CONTROLS
========================================================= */

function syncSettingsControls() {

  const pairs = [

    [
      "skeletonOption",
      "settingsSkeletonOption",
      "skeleton"
    ],

    [
      "angleOption",
      "settingsAngleOption",
      "angles"
    ],

    [
      "trajectoryOption",
      "settingsTrajectoryOption",
      "trajectory"
    ],

    [
      "centerOfMassOption",
      "settingsCenterOfMassOption",
      "centerOfMass"
    ]

  ];


  pairs.forEach(
    ([analysisId, settingsId, key]) => {

      const value =
        Boolean(
          state.settings[key]
        );


      if ($(analysisId)) {

        $(analysisId).checked =
          value;
      }


      if ($(settingsId)) {

        $(settingsId).checked =
          value;
      }
    }
  );
}


/* =========================================================
   46. SETTINGS PAGE
========================================================= */

function bindSettings() {

  const pairs = [

    [
      "settingsSkeletonOption",
      "skeleton"
    ],

    [
      "settingsAngleOption",
      "angles"
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


  pairs.forEach(
    ([id, key]) => {

      $(id)?.addEventListener(
        "change",
        event => {

          state.settings[key] =
            event.target.checked;

          saveSettings();

          syncSettingsControls();

          redrawCurrentPose();
        }
      );

    }
  );


  $("clearAnalysisDataButton")
    ?.addEventListener(
      "click",
      () => {

        const confirmed =
          window.confirm(
            "저장된 분석 기록을 모두 삭제할까요?"
          );

        if (!confirmed) {
          return;
        }


        state.analyses = [];

        state.currentReport =
          null;


        saveAnalyses();

        renderDashboard();

        renderRecords();

        renderReport();


        showToast(
          "분석 기록을 모두 삭제했습니다."
        );
      }
    );
}


/* =========================================================
   47. RENDER SETTINGS
========================================================= */

function renderSettings() {

  syncSettingsControls();


  if ($("appVersion")) {

    $("appVersion")
      .textContent =
      APP_CONFIG.version;
  }
}


/* =========================================================
   48. ANALYSIS STATUS
========================================================= */

function setAnalysisStatus(
  text,
  mode = ""
) {

  const label =
    $("analysisStatusText");

  const dot =
    $("analysisStatusDot");


  if (label) {

    label.textContent =
      text;
  }


  if (dot) {

    dot.classList.remove(
      "running",
      "error"
    );


    if (mode) {

      dot.classList.add(mode);
    }
  }


  if ($("systemStatusText")) {

    $("systemStatusText")
      .textContent =
      text;
  }
}


/* =========================================================
   49. RESET ANALYSIS SESSION
========================================================= */

function resetAnalysisSession(
  resetVideo = true
) {

  state.analysisRunning =
    false;

  state.poseBusy =
    false;

  state.frames = [];

  state.angleHistory = [];

  state.trajectory = [];

  state.keyFrames = [];

  state.currentLandmarks =
    null;

  state.currentAngles =
    null;

  state.currentMetrics = {
    speed: 0,
    power: 0,
    agility: 0,
    stability: 0,
    symmetry: 0,
    technique: 0
  };

  state.specialMetrics = {
    jumpHeight: null,
    flightTime: null,
    takeoffAngle: null,
    cadence: null,
    stepCount: 0
  };

  state.motion = {
    previousCenter: null,
    previousTime: null,
    velocities: [],
    verticalPositions: [],
    hipPositions: [],
    anklePositions: [],
    stepTimes: []
  };


  if (resetVideo) {

    const video =
      getVideo();


    if (video) {

      video.pause();

      video.removeAttribute("src");

      video.load();
    }


    if (state.currentVideoURL) {

      URL.revokeObjectURL(
        state.currentVideoURL
      );
    }


    state.currentVideoURL =
      null;

    state.currentVideoFile =
      null;


    $("videoEmptyState")
      ?.classList.remove("hidden");


    if ($("videoFileInput")) {

      $("videoFileInput").value =
        "";
    }
  }


  clearAnalysisCanvas();

  resetLiveMetrics();

  renderKeyFrames();

  renderFeedback([]);


  $("analysisSummaryPanel")
    ?.classList.add("hidden");


  if ($("finishReportButton")) {

    $("finishReportButton")
      .disabled = true;
  }


  if ($("startAnalysisButton")) {

    $("startAnalysisButton")
      .disabled = false;
  }


  if ($("stopAnalysisButton")) {

    $("stopAnalysisButton")
      .disabled = true;
  }


  destroyAnalysisChart();

  setAnalysisStatus(
    resetVideo
      ? "STANDBY"
      : "VIDEO READY"
  );
}


/* =========================================================
   50. RESET BUTTON
========================================================= */

function bindResetAnalysis() {

  $("resetAnalysisButton")
    ?.addEventListener(
      "click",
      () => {

        resetAnalysisSession(true);

        showToast(
          "분석을 초기화했습니다."
        );
      }
    );
}


/* =========================================================
   51. CLEAR CANVAS
========================================================= */

function clearAnalysisCanvas() {

  [
    $("poseCanvas"),
    $("trajectoryCanvas")
  ]
    .filter(Boolean)
    .forEach(canvas => {

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
   52. RESET LIVE METRICS
========================================================= */

function resetLiveMetrics() {

  [
    "leftKneeAngle",
    "rightKneeAngle",
    "leftHipAngle",
    "rightHipAngle",
    "leftAnkleAngle",
    "rightAnkleAngle",
    "trunkAngle"
  ]
    .forEach(id => {

      if ($(id)) {

        $(id).textContent =
          "--";
      }
    });


  [
    "speed",
    "power",
    "agility",
    "stability",
    "symmetry",
    "technique"
  ]
    .forEach(metric => {

      setLiveMetric(
        metric,
        0,
        false
      );
    });


  if ($("jumpHeight")) {
    $("jumpHeight").textContent = "--";
  }

  if ($("jumpFlightTime")) {
    $("jumpFlightTime").textContent = "--";
  }

  if ($("jumpTakeoffAngle")) {
    $("jumpTakeoffAngle").textContent = "--";
  }

  if ($("sprintCadence")) {
    $("sprintCadence").textContent = "--";
  }

  if ($("sprintStepCount")) {
    $("sprintStepCount").textContent = "0";
  }

  if ($("analysisPhaseText")) {
    $("analysisPhaseText").textContent = "READY";
  }
}


/* =========================================================
   53. SET LIVE METRIC
========================================================= */

function setLiveMetric(
  metric,
  value,
  showValue = true
) {

  const normalized =
    clamp(value);


  const valueElement =
    $(
      metric +
      "MetricValue"
    );

  const barElement =
    $(
      metric +
      "MetricBar"
    );


  if (valueElement) {

    valueElement.textContent =
      showValue
        ? Math.round(normalized)
        : "--";
  }


  if (barElement) {

    barElement.style.width =
      showValue
        ? normalized + "%"
        : "0%";
  }
}


/* =========================================================
   54. DATE FORMAT
========================================================= */

function formatDateTime(value) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }


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
   55. ANALYSIS BUTTON BINDING
========================================================= */

function bindAnalysisButtons() {

  $("startAnalysisButton")
    ?.addEventListener(
      "click",
      startAnalysis
    );


  $("stopAnalysisButton")
    ?.addEventListener(
      "click",
      stopAnalysis
    );


  $("captureFrameButton")
    ?.addEventListener(
      "click",
      () => {

        captureKeyFrame(
          "수동 핵심 프레임"
        );
      }
    );


  $("printReportButton")
    ?.addEventListener(
      "click",
      () => {

        window.print();
      }
    );
}


/* =========================================================
   56. PRECHECK
========================================================= */

function validateAnalysisStart() {

  const video =
    getVideo();


  if (
    !video ||
    !video.src
  ) {

    showToast(
      "먼저 분석 영상을 업로드해주세요.",
      true
    );

    return false;
  }


  if (!state.selectedEventId) {

    showToast(
      "분석 종목을 선택해주세요.",
      true
    );

    return false;
  }


  return true;
}


/* =========================================================
   57. START ANALYSIS PLACEHOLDER

   실제 MediaPipe 분석 루프는
   PART 2에서 이어짐.
========================================================= */

async function startAnalysis() {

  if (!validateAnalysisStart()) {
    return;
  }


  if (state.analysisRunning) {
    return;
  }


  const poseReady =
    await initializePose();


  if (!poseReady) {

    showToast(
      "자세 분석 엔진을 시작하지 못했습니다.",
      true
    );

    setAnalysisStatus(
      "POSE ERROR",
      "error"
    );

    return;
  }


  state.analysisRunning =
    true;

  state.analysisStartedAt =
    new Date().toISOString();


  state.frames = [];

  state.angleHistory = [];

  state.trajectory = [];

  state.keyFrames = [];


  if ($("startAnalysisButton")) {

    $("startAnalysisButton")
      .disabled = true;
  }


  if ($("stopAnalysisButton")) {

    $("stopAnalysisButton")
      .disabled = false;
  }


  setAnalysisStatus(
    "ANALYZING",
    "running"
  );


  renderKeyFrames();


  const video =
    getVideo();


  try {

    video.currentTime = 0;

    await video.play();

    requestAnimationFrame(
      analysisLoop
    );

  } catch (error) {

    console.error(
      "[VIDEO] play failed",
      error
    );

    state.analysisRunning =
      false;


    showToast(
      "영상 재생을 시작하지 못했습니다.",
      true
    );
  }
}


/* =========================================================
   58. STOP ANALYSIS PLACEHOLDER

   최종 결과 계산은 PART 3에서 연결.
========================================================= */

function stopAnalysis() {

  if (!state.analysisRunning) {
    return;
  }


  state.analysisRunning =
    false;


  const video =
    getVideo();

  video?.pause();


  if ($("startAnalysisButton")) {

    $("startAnalysisButton")
      .disabled = false;
  }


  if ($("stopAnalysisButton")) {

    $("stopAnalysisButton")
      .disabled = true;
  }


  setAnalysisStatus(
    "ANALYSIS COMPLETE"
  );


  finalizeAnalysis();
}


/* =========================================================
   59. BEFORE UNLOAD
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (state.currentVideoURL) {

      URL.revokeObjectURL(
        state.currentVideoURL
      );
    }
  }
);


/* =========================================================
   60. INITIAL BOOT

   PART 2/3 함수들도 전체 app.js가 로드된 뒤
   실행되므로 정상 연결됨.
========================================================= */

function bootApplication() {

  try {

    loadState();

    bindNavigation();

    bindMobileSidebar();

    bindAthleteForm();

    bindEventSearch();

    bindAnalysisSelectors();

    bindVideoUpload();

    bindVideoEvents();

    bindTimeline();

    bindPlaybackControls();

    bindAnalysisOptions();

    bindSettings();

    bindResetAnalysis();

    bindAnalysisButtons();


    syncSettingsControls();

    renderAthletes();

    renderEventPage();

    refreshAnalysisSelectors();

    renderDashboard();

    renderRecords();

    renderSettings();


    updateClock();

    setInterval(
      updateClock,
      1000
    );


    if ($("sidebarVersion")) {

      $("sidebarVersion")
        .textContent =
        "PERFORMANCE SYSTEM " +
        APP_CONFIG.version;
    }


    if ($("bootStatus")) {

      $("bootStatus")
        .classList.add("hidden");
    }


    setAnalysisStatus(
      "SYSTEM READY"
    );


    console.log(
      "[APP] PE PERFORMANCE LAB READY"
    );

  } catch (error) {

    console.error(
      "[BOOT ERROR]",
      error
    );


    if ($("bootStatus")) {

      $("bootStatus")
        .textContent =
        "SYSTEM ERROR — 콘솔을 확인하세요";
    }


    showToast(
      "시스템 시작 중 오류가 발생했습니다.",
      true
    );
  }
}


/* =========================================================
   61. DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  bootApplication
);
/* =========================================================
   SEOLCHEON HIGH SCHOOL
   PE PERFORMANCE LAB — FINAL 3.0

   app.js
   PART 2 / 3

   MOTION ANALYSIS ENGINE
   - MediaPipe Pose
   - Skeleton
   - Joint Angles
   - Center of Mass
   - Trajectory
   - Motion Tracking
   - Jump Analysis
   - Sprint Analysis
   - Phase Detection
   - Auto Key Frames
========================================================= */


/* =========================================================
   62. MEDIAPIPE LANDMARK INDEX
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
   63. SKELETON CONNECTIONS

   직접 연결선을 정의해서
   MediaPipe drawing_utils 없이도 동작하도록 함.
========================================================= */

const POSE_CONNECTIONS_CUSTOM = [

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
  [27, 31],

  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [28, 32]

];


/* =========================================================
   64. INITIALIZE MEDIAPIPE POSE
========================================================= */

async function initializePose() {

  if (state.pose) {
    return true;
  }


  if (
    typeof window.Pose !==
    "function"
  ) {

    console.error(
      "[POSE] MediaPipe Pose not loaded"
    );

    return false;
  }


  try {

    const pose =
      new window.Pose({

        locateFile: file => {

          return (
            "https://cdn.jsdelivr.net/npm/" +
            "@mediapipe/pose/" +
            file
          );
        }

      });


    pose.setOptions({

      modelComplexity: 1,

      smoothLandmarks: true,

      enableSegmentation: false,

      smoothSegmentation: false,

      minDetectionConfidence: 0.55,

      minTrackingConfidence: 0.55

    });


    pose.onResults(
      handlePoseResults
    );


    state.pose =
      pose;


    console.log(
      "[POSE] initialized"
    );


    return true;

  } catch (error) {

    console.error(
      "[POSE] initialization failed",
      error
    );

    return false;
  }
}


/* =========================================================
   65. ANALYSIS LOOP
========================================================= */

async function analysisLoop(timestamp) {

  if (!state.analysisRunning) {
    return;
  }


  const video =
    getVideo();


  if (
    !video ||
    video.paused ||
    video.ended
  ) {

    if (
      video?.ended &&
      state.analysisRunning
    ) {

      stopAnalysis();
    }

    return;
  }


  const interval =
    Number(
      $("analysisFrameRateSelect")
        ?.value
    ) || 150;


  if (
    !state.poseBusy &&
    (
      !state.lastPoseTime ||
      timestamp -
      state.lastPoseTime >=
      interval
    )
  ) {

    state.lastPoseTime =
      timestamp;

    state.poseBusy =
      true;


    try {

      await state.pose.send({
        image: video
      });

    } catch (error) {

      console.error(
        "[POSE SEND ERROR]",
        error
      );

    } finally {

      state.poseBusy =
        false;
    }
  }


  if (state.analysisRunning) {

    requestAnimationFrame(
      analysisLoop
    );
  }
}


/* =========================================================
   66. POSE RESULTS
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

    clearPoseCanvasOnly();

    return;
  }


  state.currentLandmarks =
    landmarks;


  const angles =
    calculateAllAngles(
      landmarks
    );


  state.currentAngles =
    angles;


  const center =
    calculateBodyCenter(
      landmarks
    );


  updateMotionTracking(
    landmarks,
    center
  );


  const metrics =
    calculatePerformanceMetrics(
      landmarks,
      angles,
      center
    );


  state.currentMetrics =
    metrics;


  updateSpecialMetrics(
    landmarks,
    angles,
    center
  );


  const phase =
    detectMovementPhase(
      landmarks,
      angles,
      center
    );


  updatePhaseDisplay(
    phase
  );


  recordAnalysisFrame(
    landmarks,
    angles,
    center,
    metrics,
    phase
  );


  drawPoseOverlay(
    landmarks,
    angles,
    center
  );


  drawTrajectory();


  updateAngleDisplay(
    angles
  );


  updateMetricDisplay(
    metrics
  );


  updateSpecialMetricDisplay();


  detectAutomaticKeyFrame(
    phase,
    metrics
  );
}


/* =========================================================
   67. VISIBILITY
========================================================= */

function landmarkVisible(
  landmark,
  threshold = 0.45
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
    landmark.visibility >=
    threshold
  );
}


/* =========================================================
   68. POINT
========================================================= */

function getPoint(
  landmarks,
  index
) {

  const landmark =
    landmarks?.[index];


  if (
    !landmark ||
    !landmarkVisible(landmark)
  ) {

    return null;
  }


  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z || 0,
    visibility:
      landmark.visibility ?? 1
  };
}


/* =========================================================
   69. MIDPOINT
========================================================= */

function midpoint(
  pointA,
  pointB
) {

  if (!pointA && !pointB) {
    return null;
  }


  if (!pointA) {
    return { ...pointB };
  }


  if (!pointB) {
    return { ...pointA };
  }


  return {

    x:
      (pointA.x + pointB.x) / 2,

    y:
      (pointA.y + pointB.y) / 2,

    z:
      (
        (pointA.z || 0) +
        (pointB.z || 0)
      ) / 2

  };
}


/* =========================================================
   70. DISTANCE 2D
========================================================= */

function distance2D(
  pointA,
  pointB
) {

  if (!pointA || !pointB) {
    return 0;
  }


  return Math.hypot(
    pointB.x - pointA.x,
    pointB.y - pointA.y
  );
}


/* =========================================================
   71. ANGLE BETWEEN 3 POINTS
========================================================= */

function calculateAngle(
  pointA,
  pointB,
  pointC
) {

  if (
    !pointA ||
    !pointB ||
    !pointC
  ) {

    return null;
  }


  const vectorBA = {
    x:
      pointA.x -
      pointB.x,

    y:
      pointA.y -
      pointB.y
  };


  const vectorBC = {
    x:
      pointC.x -
      pointB.x,

    y:
      pointC.y -
      pointB.y
  };


  const dot =
    vectorBA.x *
    vectorBC.x +
    vectorBA.y *
    vectorBC.y;


  const magnitudeBA =
    Math.hypot(
      vectorBA.x,
      vectorBA.y
    );


  const magnitudeBC =
    Math.hypot(
      vectorBC.x,
      vectorBC.y
    );


  if (
    magnitudeBA === 0 ||
    magnitudeBC === 0
  ) {

    return null;
  }


  const cosine =
    clamp(
      dot /
      (
        magnitudeBA *
        magnitudeBC
      ),
      -1,
      1
    );


  const radians =
    Math.acos(cosine);


  return (
    radians *
    180 /
    Math.PI
  );
}


/* =========================================================
   72. TRUNK ANGLE
========================================================= */

function calculateTrunkAngle(
  landmarks
) {

  const leftShoulder =
    getPoint(
      landmarks,
      POSE_INDEX.leftShoulder
    );

  const rightShoulder =
    getPoint(
      landmarks,
      POSE_INDEX.rightShoulder
    );

  const leftHip =
    getPoint(
      landmarks,
      POSE_INDEX.leftHip
    );

  const rightHip =
    getPoint(
      landmarks,
      POSE_INDEX.rightHip
    );


  const shoulderCenter =
    midpoint(
      leftShoulder,
      rightShoulder
    );

  const hipCenter =
    midpoint(
      leftHip,
      rightHip
    );


  if (
    !shoulderCenter ||
    !hipCenter
  ) {

    return null;
  }


  const dx =
    shoulderCenter.x -
    hipCenter.x;

  const dy =
    hipCenter.y -
    shoulderCenter.y;


  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) *
    180 /
    Math.PI;


  return angle;
}


/* =========================================================
   73. ALL JOINT ANGLES
========================================================= */

function calculateAllAngles(
  landmarks
) {

  const LS =
    getPoint(
      landmarks,
      POSE_INDEX.leftShoulder
    );

  const RS =
    getPoint(
      landmarks,
      POSE_INDEX.rightShoulder
    );

  const LE =
    getPoint(
      landmarks,
      POSE_INDEX.leftElbow
    );

  const RE =
    getPoint(
      landmarks,
      POSE_INDEX.rightElbow
    );

  const LW =
    getPoint(
      landmarks,
      POSE_INDEX.leftWrist
    );

  const RW =
    getPoint(
      landmarks,
      POSE_INDEX.rightWrist
    );

  const LH =
    getPoint(
      landmarks,
      POSE_INDEX.leftHip
    );

  const RH =
    getPoint(
      landmarks,
      POSE_INDEX.rightHip
    );

  const LK =
    getPoint(
      landmarks,
      POSE_INDEX.leftKnee
    );

  const RK =
    getPoint(
      landmarks,
      POSE_INDEX.rightKnee
    );

  const LA =
    getPoint(
      landmarks,
      POSE_INDEX.leftAnkle
    );

  const RA =
    getPoint(
      landmarks,
      POSE_INDEX.rightAnkle
    );

  const LF =
    getPoint(
      landmarks,
      POSE_INDEX.leftFoot
    );

  const RF =
    getPoint(
      landmarks,
      POSE_INDEX.rightFoot
    );


  return {

    leftKnee:
      calculateAngle(
        LH,
        LK,
        LA
      ),

    rightKnee:
      calculateAngle(
        RH,
        RK,
        RA
      ),

    leftHip:
      calculateAngle(
        LS,
        LH,
        LK
      ),

    rightHip:
      calculateAngle(
        RS,
        RH,
        RK
      ),

    leftAnkle:
      calculateAngle(
        LK,
        LA,
        LF
      ),

    rightAnkle:
      calculateAngle(
        RK,
        RA,
        RF
      ),

    leftElbow:
      calculateAngle(
        LS,
        LE,
        LW
      ),

    rightElbow:
      calculateAngle(
        RS,
        RE,
        RW
      ),

    leftShoulder:
      calculateAngle(
        LE,
        LS,
        LH
      ),

    rightShoulder:
      calculateAngle(
        RE,
        RS,
        RH
      ),

    trunk:
      calculateTrunkAngle(
        landmarks
      )

  };
}


/* =========================================================
   74. BODY CENTER

   단순 화면 중심이 아니라
   어깨/골반 중심을 조합해서
   추정 신체 중심점 사용.
========================================================= */

function calculateBodyCenter(
  landmarks
) {

  const leftShoulder =
    getPoint(
      landmarks,
      POSE_INDEX.leftShoulder
    );

  const rightShoulder =
    getPoint(
      landmarks,
      POSE_INDEX.rightShoulder
    );

  const leftHip =
    getPoint(
      landmarks,
      POSE_INDEX.leftHip
    );

  const rightHip =
    getPoint(
      landmarks,
      POSE_INDEX.rightHip
    );


  const shoulderCenter =
    midpoint(
      leftShoulder,
      rightShoulder
    );

  const hipCenter =
    midpoint(
      leftHip,
      rightHip
    );


  if (
    !shoulderCenter ||
    !hipCenter
  ) {

    return null;
  }


  return {

    x:
      hipCenter.x * 0.65 +
      shoulderCenter.x * 0.35,

    y:
      hipCenter.y * 0.65 +
      shoulderCenter.y * 0.35,

    z:
      (hipCenter.z || 0) * 0.65 +
      (shoulderCenter.z || 0) * 0.35

  };
}


/* =========================================================
   75. MOTION TRACKING
========================================================= */

function updateMotionTracking(
  landmarks,
  center
) {

  if (!center) {
    return;
  }


  const video =
    getVideo();


  const currentTime =
    Number(
      video?.currentTime
    ) || 0;


  const previousCenter =
    state.motion.previousCenter;

  const previousTime =
    state.motion.previousTime;


  if (
    previousCenter &&
    previousTime !== null
  ) {

    const dt =
      currentTime -
      previousTime;


    if (dt > 0.001) {

      const movement =
        distance2D(
          previousCenter,
          center
        );


      const velocity =
        movement / dt;


      state.motion.velocities.push(
        velocity
      );


      if (
        state.motion.velocities.length >
        100
      ) {

        state.motion.velocities.shift();
      }
    }
  }


  state.motion.previousCenter = {
    ...center
  };

  state.motion.previousTime =
    currentTime;


  state.motion.verticalPositions.push({

    time: currentTime,

    y: center.y

  });


  if (
    state.motion.verticalPositions
      .length > 300
  ) {

    state.motion.verticalPositions
      .shift();
  }


  const hipCenter =
    midpoint(

      getPoint(
        landmarks,
        POSE_INDEX.leftHip
      ),

      getPoint(
        landmarks,
        POSE_INDEX.rightHip
      )

    );


  if (hipCenter) {

    state.motion.hipPositions.push({

      time: currentTime,

      x: hipCenter.x,

      y: hipCenter.y

    });


    if (
      state.motion.hipPositions
        .length > 300
    ) {

      state.motion.hipPositions
        .shift();
    }
  }


  detectSteps(
    landmarks,
    currentTime
  );


  addTrajectoryPoint(
    center,
    currentTime
  );
}


/* =========================================================
   76. TRAJECTORY POINT
========================================================= */

function addTrajectoryPoint(
  center,
  time
) {

  if (!center) {
    return;
  }


  const last =
    state.trajectory[
      state.trajectory.length - 1
    ];


  if (
    last &&
    distance2D(
      last,
      center
    ) < 0.002
  ) {

    return;
  }


  state.trajectory.push({

    x: center.x,

    y: center.y,

    time

  });


  if (
    state.trajectory.length >
    APP_CONFIG.maxTrajectoryPoints
  ) {

    state.trajectory.shift();
  }
}


/* =========================================================
   77. STEP DETECTION
========================================================= */

function detectSteps(
  landmarks,
  currentTime
) {

  const leftAnkle =
    getPoint(
      landmarks,
      POSE_INDEX.leftAnkle
    );

  const rightAnkle =
    getPoint(
      landmarks,
      POSE_INDEX.rightAnkle
    );


  if (
    !leftAnkle ||
    !rightAnkle
  ) {

    return;
  }


  const separation =
    Math.abs(
      leftAnkle.x -
      rightAnkle.x
    );


  state.motion.anklePositions.push({

    time:
      currentTime,

    separation

  });


  if (
    state.motion.anklePositions
      .length > 5
  ) {

    state.motion.anklePositions
      .shift();
  }


  if (
    state.motion.anklePositions
      .length < 3
  ) {

    return;
  }


  const values =
    state.motion.anklePositions;


  const a =
    values[
      values.length - 3
    ];

  const b =
    values[
      values.length - 2
    ];

  const c =
    values[
      values.length - 1
    ];


  const localPeak =
    b.separation >
      a.separation &&
    b.separation >
      c.separation &&
    b.separation >
      0.035;


  if (!localPeak) {
    return;
  }


  const lastStep =
    state.motion.stepTimes[
      state.motion.stepTimes.length - 1
    ];


  if (
    lastStep !== undefined &&
    b.time - lastStep < 0.18
  ) {

    return;
  }


  state.motion.stepTimes.push(
    b.time
  );


  if (
    state.motion.stepTimes.length >
    100
  ) {

    state.motion.stepTimes.shift();
  }


  state.specialMetrics.stepCount =
    state.motion.stepTimes.length;


  calculateCadence();
}


/* =========================================================
   78. CADENCE
========================================================= */

function calculateCadence() {

  const times =
    state.motion.stepTimes;


  if (times.length < 2) {
    return;
  }


  const intervals = [];


  for (
    let i = 1;
    i < times.length;
    i++
  ) {

    const interval =
      times[i] -
      times[i - 1];


    if (
      interval > 0.12 &&
      interval < 2
    ) {

      intervals.push(
        interval
      );
    }
  }


  if (!intervals.length) {
    return;
  }


  const averageInterval =
    average(intervals);


  if (averageInterval <= 0) {
    return;
  }


  state.specialMetrics.cadence =
    Math.round(
      60 / averageInterval
    );
}


/* =========================================================
   79. PERFORMANCE METRICS
========================================================= */

function calculatePerformanceMetrics(
  landmarks,
  angles,
  center
) {

  const event =
    window.getEventById?.(
      state.selectedEventId
    );


  const speed =
    calculateSpeedScore();


  const power =
    calculatePowerScore(
      landmarks,
      angles
    );


  const agility =
    calculateAgilityScore(
      landmarks,
      center
    );


  const stability =
    calculateStabilityScore();


  const symmetry =
    calculateSymmetryScore(
      angles,
      landmarks
    );


  const technique =
    calculateTechniqueScore(
      event,
      angles,
      landmarks
    );


  return {

    speed:
      clamp(speed),

    power:
      clamp(power),

    agility:
      clamp(agility),

    stability:
      clamp(stability),

    symmetry:
      clamp(symmetry),

    technique:
      clamp(technique)

  };
}


/* =========================================================
   80. SPEED SCORE
========================================================= */

function calculateSpeedScore() {

  const velocities =
    state.motion.velocities;


  if (!velocities.length) {

    return 60;
  }


  const recent =
    velocities.slice(-15);


  const velocity =
    average(recent);


  return clamp(
    45 +
    velocity * 150
  );
}


/* =========================================================
   81. POWER SCORE
========================================================= */

function calculatePowerScore(
  landmarks,
  angles
) {

  const kneeAverage =
    average(
      [
        angles.leftKnee,
        angles.rightKnee
      ].filter(Number.isFinite)
    );


  const hipAverage =
    average(
      [
        angles.leftHip,
        angles.rightHip
      ].filter(Number.isFinite)
    );


  let score = 50;


  if (
    kneeAverage >= 145
  ) {

    score += 15;
  }


  if (
    hipAverage >= 145
  ) {

    score += 15;
  }


  const velocities =
    state.motion.velocities;


  if (velocities.length) {

    const recentVelocity =
      average(
        velocities.slice(-8)
      );


    score +=
      clamp(
        recentVelocity * 60,
        0,
        20
      );
  }


  return clamp(score);
}


/* =========================================================
   82. AGILITY SCORE
========================================================= */

function calculateAgilityScore(
  landmarks,
  center
) {

  if (!center) {
    return 50;
  }


  const trajectory =
    state.trajectory;


  if (trajectory.length < 5) {

    return 60;
  }


  let directionChanges = 0;


  for (
    let i = 2;
    i < trajectory.length;
    i++
  ) {

    const first =
      trajectory[i - 2];

    const second =
      trajectory[i - 1];

    const third =
      trajectory[i];


    const directionA =
      Math.sign(
        second.x -
        first.x
      );


    const directionB =
      Math.sign(
        third.x -
        second.x
      );


    if (
      directionA !== 0 &&
      directionB !== 0 &&
      directionA !== directionB
    ) {

      directionChanges++;
    }
  }


  return clamp(
    55 +
    directionChanges * 4
  );
}


/* =========================================================
   83. STABILITY SCORE
========================================================= */

function calculateStabilityScore() {

  const positions =
    state.motion.hipPositions
      .slice(-20);


  if (positions.length < 4) {

    return 70;
  }


  const xs =
    positions.map(
      item => item.x
    );


  const ys =
    positions.map(
      item => item.y
    );


  const xAverage =
    average(xs);

  const yAverage =
    average(ys);


  const variance =
    average(
      positions.map(item => {

        return (
          Math.pow(
            item.x -
            xAverage,
            2
          ) +
          Math.pow(
            item.y -
            yAverage,
            2
          )
        );

      })
    );


  const penalty =
    Math.sqrt(variance) *
    300;


  return clamp(
    95 - penalty
  );
}


/* =========================================================
   84. SYMMETRY SCORE
========================================================= */

function calculateSymmetryScore(
  angles,
  landmarks
) {

  const differences = [];


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


  pairs.forEach(
    ([left, right]) => {

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
    }
  );


  if (!differences.length) {

    return 70;
  }


  const difference =
    average(differences);


  return clamp(
    100 -
    difference * 2
  );
}


/* =========================================================
   85. TECHNIQUE SCORE
========================================================= */

function calculateTechniqueScore(
  event,
  angles,
  landmarks
) {

  let score = 72;


  if (!event) {
    return score;
  }


  const targets =
    event.targetAngles || {};


  const scores = [];


  if (
    targets.takeoffKnee &&
    Number.isFinite(
      angles.leftKnee
    )
  ) {

    scores.push(
      window.getAngleQuality?.(
        angles.leftKnee,
        targets.takeoffKnee
      )?.score || 0
    );
  }


  if (
    targets.takeoffKnee &&
    Number.isFinite(
      angles.rightKnee
    )
  ) {

    scores.push(
      window.getAngleQuality?.(
        angles.rightKnee,
        targets.takeoffKnee
      )?.score || 0
    );
  }


  if (
    targets.takeoffHip &&
    Number.isFinite(
      angles.leftHip
    )
  ) {

    scores.push(
      window.getAngleQuality?.(
        angles.leftHip,
        targets.takeoffHip
      )?.score || 0
    );
  }


  if (scores.length) {

    score =
      average(scores);

  } else {

    const trunk =
      Number(angles.trunk);


    if (
      Number.isFinite(trunk)
    ) {

      score +=
        trunk < 35
          ? 10
          : 0;
    }
  }


  return clamp(score);
}


/* =========================================================
   86. UPDATE SPECIAL METRICS
========================================================= */

function updateSpecialMetrics(
  landmarks,
  angles,
  center
) {

  const event =
    window.getEventById?.(
      state.selectedEventId
    );


  if (!event) {
    return;
  }


  if (
    event.analysisType === "jump"
  ) {

    analyzeJump(
      landmarks,
      angles,
      center
    );
  }


  if (
    event.analysisType === "sprint" ||
    event.analysisType === "running"
  ) {

    calculateCadence();
  }
}


/* =========================================================
   87. JUMP ANALYSIS
========================================================= */

function analyzeJump(
  landmarks,
  angles,
  center
) {

  const positions =
    state.motion.verticalPositions;


  if (
    positions.length < 4 ||
    !center
  ) {

    return;
  }


  const recent =
    positions.slice(-80);


  const lowestScreenPoint =
    Math.max(
      ...recent.map(
        item => item.y
      )
    );


  const highestScreenPoint =
    Math.min(
      ...recent.map(
        item => item.y
      )
    );


  const normalizedRise =
    lowestScreenPoint -
    highestScreenPoint;


  /*
     영상만으로 실제 cm를 정확히 알 수 없으므로
     신체 비율 기반 추정값.
     PART 3 리포트에서도 "영상 추정"으로 표시.
  */

  const leftShoulder =
    getPoint(
      landmarks,
      POSE_INDEX.leftShoulder
    );

  const leftAnkle =
    getPoint(
      landmarks,
      POSE_INDEX.leftAnkle
    );

  const rightShoulder =
    getPoint(
      landmarks,
      POSE_INDEX.rightShoulder
    );

  const rightAnkle =
    getPoint(
      landmarks,
      POSE_INDEX.rightAnkle
    );


  const bodyLength =
    average(
      [
        distance2D(
          leftShoulder,
          leftAnkle
        ),
        distance2D(
          rightShoulder,
          rightAnkle
        )
      ].filter(
        value => value > 0
      )
    );


  if (bodyLength > 0) {

    const estimatedHeightCm =
      getSelectedAthleteHeight() ||
      170;


    const pixelsToBodyRatio =
      normalizedRise /
      bodyLength;


    const estimatedJump =
      pixelsToBodyRatio *
      estimatedHeightCm;


    if (
      Number.isFinite(
        estimatedJump
      )
    ) {

      state.specialMetrics.jumpHeight =
        Math.max(
          0,
          estimatedJump
        );
    }
  }


  const knee =
    average(
      [
        angles.leftKnee,
        angles.rightKnee
      ].filter(
        Number.isFinite
      )
    );


  const hip =
    average(
      [
        angles.leftHip,
        angles.rightHip
      ].filter(
        Number.isFinite
      )
    );


  if (
    knee > 150 &&
    hip > 145
  ) {

    const trunk =
      Number(angles.trunk) || 0;


    state.specialMetrics.takeoffAngle =
      clamp(
        35 +
        trunk * 0.2,
        15,
        60
      );
  }


  estimateFlightTime();
}


/* =========================================================
   88. ESTIMATE FLIGHT TIME
========================================================= */

function estimateFlightTime() {

  const positions =
    state.motion.verticalPositions;


  if (positions.length < 10) {
    return;
  }


  const recent =
    positions.slice(-120);


  const yValues =
    recent.map(
      item => item.y
    );


  const baseline =
    Math.max(...yValues);


  const threshold =
    baseline - 0.025;


  const airborne =
    recent.filter(
      item =>
        item.y < threshold
    );


  if (airborne.length < 2) {
    return;
  }


  const start =
    airborne[0].time;

  const end =
    airborne[
      airborne.length - 1
    ].time;


  const flight =
    end - start;


  if (
    flight > 0.05 &&
    flight < 2
  ) {

    state.specialMetrics.flightTime =
      flight;
  }
}


/* =========================================================
   89. SELECTED ATHLETE HEIGHT
========================================================= */

function getSelectedAthleteHeight() {

  const athlete =
    getAthleteById(
      state.selectedAthleteId
    );


  const height =
    Number(
      athlete?.height
    );


  return (
    Number.isFinite(height) &&
    height > 0
  )
    ? height
    : null;
}


/* =========================================================
   90. MOVEMENT PHASE
========================================================= */

function detectMovementPhase(
  landmarks,
  angles,
  center
) {

  const event =
    window.getEventById?.(
      state.selectedEventId
    );


  if (!event) {
    return "분석";
  }


  const knee =
    average(
      [
        angles.leftKnee,
        angles.rightKnee
      ].filter(Number.isFinite)
    );


  const hip =
    average(
      [
        angles.leftHip,
        angles.rightHip
      ].filter(Number.isFinite)
    );


  const velocity =
    average(
      state.motion.velocities
        .slice(-5)
    );


  switch (
    event.analysisType
  ) {

    case "jump":

      if (
        knee < 120 &&
        hip < 130
      ) {

        return "반동";
      }


      if (
        knee > 155 &&
        hip > 150 &&
        velocity > 0.15
      ) {

        return "이륙";
      }


      if (
        state.specialMetrics
          .flightTime
      ) {

        return "비행";
      }


      return "준비";


    case "sprint":

      if (
        Number(angles.trunk) >
        25
      ) {

        return "가속";
      }


      if (
        state.specialMetrics
          .cadence > 120
      ) {

        return "최고속도";
      }


      return "출발";


    case "running":

      return "러닝";


    case "agility":

      if (
        velocity > 0.3
      ) {

        return "방향전환";
      }

      return "이동";


    case "throw":

      if (
        angles.leftElbow > 150 ||
        angles.rightElbow > 150
      ) {

        return "릴리스";
      }

      return "준비";


    case "repetition":

      if (knee < 100) {

        return "하강";
      }

      return "상승";


    case "flexibility":

      if (
        Number(angles.leftHip) <
          100 ||
        Number(angles.rightHip) <
          100
      ) {

        return "최대 도달";
      }

      return "전굴";


    default:

      return "동작";
  }
}


/* =========================================================
   91. PHASE DISPLAY
========================================================= */

function updatePhaseDisplay(
  phase
) {

  const element =
    $("analysisPhaseText");

  if (element) {

    element.textContent =
      phase || "ANALYSIS";
  }
}


/* =========================================================
   92. RECORD FRAME
========================================================= */

function recordAnalysisFrame(
  landmarks,
  angles,
  center,
  metrics,
  phase
) {

  const video =
    getVideo();


  const frame = {

    time:
      Number(
        video?.currentTime
      ) || 0,

    angles: {
      ...angles
    },

    center:
      center
        ? { ...center }
        : null,

    metrics: {
      ...metrics
    },

    phase

  };


  state.frames.push(frame);


  state.angleHistory.push({

    time:
      frame.time,

    leftKnee:
      angles.leftKnee,

    rightKnee:
      angles.rightKnee,

    leftHip:
      angles.leftHip,

    rightHip:
      angles.rightHip,

    trunk:
      angles.trunk

  });


  if (
    state.angleHistory.length >
    APP_CONFIG.maxGraphPoints
  ) {

    state.angleHistory.shift();
  }
}


/* =========================================================
   93. CLEAR POSE CANVAS
========================================================= */

function clearPoseCanvasOnly() {

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
}


/* =========================================================
   94. NORMALIZED TO CANVAS
========================================================= */

function toCanvasPoint(
  landmark,
  canvas
) {

  if (
    !landmark ||
    !canvas
  ) {

    return null;
  }


  return {

    x:
      landmark.x *
      canvas.width,

    y:
      landmark.y *
      canvas.height

  };
}


/* =========================================================
   95. DRAW POSE OVERLAY
========================================================= */

function drawPoseOverlay(
  landmarks,
  angles,
  center
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


  if (state.settings.skeleton) {

    drawSkeleton(
      ctx,
      canvas,
      landmarks
    );
  }


  if (state.settings.angles) {

    drawJointAngles(
      ctx,
      canvas,
      landmarks,
      angles
    );
  }


  if (
    state.settings.centerOfMass &&
    center
  ) {

    drawCenterOfMass(
      ctx,
      canvas,
      center
    );
  }


  if (
    $("referenceLineOption")
      ?.checked
  ) {

    drawReferenceLines(
      ctx,
      canvas,
      landmarks
    );
  }
}


/* =========================================================
   96. DRAW SKELETON
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
      canvas.width / 450
    );

  ctx.strokeStyle =
    "rgba(62, 211, 255, 0.95)";

  ctx.fillStyle =
    "rgba(236, 250, 255, 0.98)";


  POSE_CONNECTIONS_CUSTOM
    .forEach(
      ([startIndex, endIndex]) => {

        const start =
          getPoint(
            landmarks,
            startIndex
          );

        const end =
          getPoint(
            landmarks,
            endIndex
          );


        if (
          !start ||
          !end
        ) {
          return;
        }


        const a =
          toCanvasPoint(
            start,
            canvas
          );

        const b =
          toCanvasPoint(
            end,
            canvas
          );


        ctx.beginPath();

        ctx.moveTo(
          a.x,
          a.y
        );

        ctx.lineTo(
          b.x,
          b.y
        );

        ctx.stroke();
      }
    );


  const importantIndices = [

    11, 12,
    13, 14,
    15, 16,
    23, 24,
    25, 26,
    27, 28,
    29, 30,
    31, 32

  ];


  importantIndices
    .forEach(index => {

      const point =
        getPoint(
          landmarks,
          index
        );


      if (!point) {
        return;
      }


      const position =
        toCanvasPoint(
          point,
          canvas
        );


      ctx.beginPath();

      ctx.arc(
        position.x,
        position.y,
        Math.max(
          3,
          canvas.width / 260
        ),
        0,
        Math.PI * 2
      );

      ctx.fill();
    });


  ctx.restore();
}


/* =========================================================
   97. DRAW ANGLE LABEL
========================================================= */

function drawAngleLabel(
  ctx,
  canvas,
  landmark,
  angle,
  label
) {

  if (
    !landmark ||
    !Number.isFinite(angle)
  ) {

    return;
  }


  const point =
    toCanvasPoint(
      landmark,
      canvas
    );


  const text =
    `${label} ${Math.round(angle)}°`;


  ctx.save();


  const fontSize =
    Math.max(
      12,
      canvas.width / 85
    );


  ctx.font =
    `700 ${fontSize}px sans-serif`;


  const metrics =
    ctx.measureText(text);


  const padding = 6;


  const boxWidth =
    metrics.width +
    padding * 2;


  const boxHeight =
    fontSize + 10;


  const x =
    point.x + 8;

  const y =
    point.y -
    boxHeight -
    4;


  ctx.fillStyle =
    "rgba(3, 15, 25, 0.82)";


  ctx.fillRect(
    x,
    y,
    boxWidth,
    boxHeight
  );


  ctx.fillStyle =
    "#b9efff";


  ctx.fillText(
    text,
    x + padding,
    y + fontSize + 1
  );


  ctx.restore();
}


/* =========================================================
   98. DRAW JOINT ANGLES
========================================================= */

function drawJointAngles(
  ctx,
  canvas,
  landmarks,
  angles
) {

  drawAngleLabel(
    ctx,
    canvas,
    getPoint(
      landmarks,
      POSE_INDEX.leftKnee
    ),
    angles.leftKnee,
    "LK"
  );


  drawAngleLabel(
    ctx,
    canvas,
    getPoint(
      landmarks,
      POSE_INDEX.rightKnee
    ),
    angles.rightKnee,
    "RK"
  );


  drawAngleLabel(
    ctx,
    canvas,
    getPoint(
      landmarks,
      POSE_INDEX.leftHip
    ),
    angles.leftHip,
    "LH"
  );


  drawAngleLabel(
    ctx,
    canvas,
    getPoint(
      landmarks,
      POSE_INDEX.rightHip
    ),
    angles.rightHip,
    "RH"
  );


  drawAngleLabel(
    ctx,
    canvas,
    getPoint(
      landmarks,
      POSE_INDEX.leftAnkle
    ),
    angles.leftAnkle,
    "LA"
  );


  drawAngleLabel(
    ctx,
    canvas,
    getPoint(
      landmarks,
      POSE_INDEX.rightAnkle
    ),
    angles.rightAnkle,
    "RA"
  );
}


/* =========================================================
   99. CENTER OF MASS
========================================================= */

function drawCenterOfMass(
  ctx,
  canvas,
  center
) {

  const point =
    toCanvasPoint(
      center,
      canvas
    );


  ctx.save();


  ctx.beginPath();

  ctx.arc(
    point.x,
    point.y,
    Math.max(
      7,
      canvas.width / 140
    ),
    0,
    Math.PI * 2
  );


  ctx.fillStyle =
    "rgba(255, 210, 64, 0.95)";

  ctx.fill();


  ctx.beginPath();

  ctx.moveTo(
    point.x - 15,
    point.y
  );

  ctx.lineTo(
    point.x + 15,
    point.y
  );

  ctx.moveTo(
    point.x,
    point.y - 15
  );

  ctx.lineTo(
    point.x,
    point.y + 15
  );


  ctx.strokeStyle =
    "rgba(255,255,255,0.95)";

  ctx.lineWidth = 2;

  ctx.stroke();


  ctx.restore();
}


/* =========================================================
   100. REFERENCE LINES
========================================================= */

function drawReferenceLines(
  ctx,
  canvas,
  landmarks
) {

  const leftAnkle =
    getPoint(
      landmarks,
      POSE_INDEX.leftAnkle
    );

  const rightAnkle =
    getPoint(
      landmarks,
      POSE_INDEX.rightAnkle
    );


  const ankleCenter =
    midpoint(
      leftAnkle,
      rightAnkle
    );


  if (!ankleCenter) {
    return;
  }


  const point =
    toCanvasPoint(
      ankleCenter,
      canvas
    );


  ctx.save();


  ctx.setLineDash([
    8,
    8
  ]);


  ctx.lineWidth = 1;


  ctx.strokeStyle =
    "rgba(255,255,255,0.28)";


  ctx.beginPath();

  ctx.moveTo(
    0,
    point.y
  );

  ctx.lineTo(
    canvas.width,
    point.y
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.moveTo(
    point.x,
    0
  );

  ctx.lineTo(
    point.x,
    canvas.height
  );

  ctx.stroke();


  ctx.restore();
}


/* =========================================================
   101. DRAW TRAJECTORY
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
    !state.settings.trajectory ||
    state.trajectory.length < 2
  ) {

    return;
  }


  ctx.save();


  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 400
    );


  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";


  for (
    let i = 1;
    i < state.trajectory.length;
    i++
  ) {

    const previous =
      state.trajectory[i - 1];

    const current =
      state.trajectory[i];


    const alpha =
      i /
      state.trajectory.length;


    ctx.strokeStyle =
      `rgba(255, 191, 62, ${
        0.15 +
        alpha * 0.8
      })`;


    ctx.beginPath();


    ctx.moveTo(
      previous.x *
      canvas.width,

      previous.y *
      canvas.height
    );


    ctx.lineTo(
      current.x *
      canvas.width,

      current.y *
      canvas.height
    );


    ctx.stroke();
  }


  const latest =
    state.trajectory[
      state.trajectory.length - 1
    ];


  ctx.beginPath();


  ctx.arc(
    latest.x *
    canvas.width,

    latest.y *
    canvas.height,

    Math.max(
      5,
      canvas.width / 180
    ),

    0,

    Math.PI * 2
  );


  ctx.fillStyle =
    "rgba(255, 215, 74, 0.95)";


  ctx.fill();


  ctx.restore();
}


/* =========================================================
   102. REDRAW CURRENT POSE
========================================================= */

function redrawCurrentPose() {

  if (
    !state.currentLandmarks
  ) {

    clearAnalysisCanvas();

    return;
  }


  drawPoseOverlay(
    state.currentLandmarks,
    state.currentAngles || {},
    calculateBodyCenter(
      state.currentLandmarks
    )
  );


  drawTrajectory();
}


/* =========================================================
   103. UPDATE ANGLE DISPLAY
========================================================= */

function updateAngleDisplay(
  angles
) {

  setAngleText(
    "leftKneeAngle",
    angles.leftKnee
  );

  setAngleText(
    "rightKneeAngle",
    angles.rightKnee
  );

  setAngleText(
    "leftHipAngle",
    angles.leftHip
  );

  setAngleText(
    "rightHipAngle",
    angles.rightHip
  );

  setAngleText(
    "leftAnkleAngle",
    angles.leftAnkle
  );

  setAngleText(
    "rightAnkleAngle",
    angles.rightAnkle
  );

  setAngleText(
    "trunkAngle",
    angles.trunk
  );
}


/* =========================================================
   104. SET ANGLE TEXT
========================================================= */

function setAngleText(
  id,
  value
) {

  const element =
    $(id);

  if (!element) {
    return;
  }


  element.textContent =
    Number.isFinite(value)
      ? Math.round(value) + "°"
      : "--";
}


/* =========================================================
   105. UPDATE METRIC DISPLAY
========================================================= */

function updateMetricDisplay(
  metrics
) {

  Object.entries(metrics)
    .forEach(
      ([key, value]) => {

        setLiveMetric(
          key,
          value,
          true
        );
      }
    );
}


/* =========================================================
   106. SPECIAL METRIC DISPLAY
========================================================= */

function updateSpecialMetricDisplay() {

  const special =
    state.specialMetrics;


  if ($("jumpHeight")) {

    $("jumpHeight")
      .textContent =
      Number.isFinite(
        special.jumpHeight
      )
        ? special.jumpHeight
            .toFixed(1) + " cm*"
        : "--";
  }


  if ($("jumpFlightTime")) {

    $("jumpFlightTime")
      .textContent =
      Number.isFinite(
        special.flightTime
      )
        ? special.flightTime
            .toFixed(2) + " s"
        : "--";
  }


  if ($("jumpTakeoffAngle")) {

    $("jumpTakeoffAngle")
      .textContent =
      Number.isFinite(
        special.takeoffAngle
      )
        ? Math.round(
            special.takeoffAngle
          ) + "°"
        : "--";
  }


  if ($("sprintCadence")) {

    $("sprintCadence")
      .textContent =
      Number.isFinite(
        special.cadence
      )
        ? Math.round(
            special.cadence
          ) + " spm"
        : "--";
  }


  if ($("sprintStepCount")) {

    $("sprintStepCount")
      .textContent =
      special.stepCount || 0;
  }
}


/* =========================================================
   107. AUTO KEY FRAME
========================================================= */

const AUTO_FRAME_COOLDOWN =
  new Map();


function detectAutomaticKeyFrame(
  phase,
  metrics
) {

  const enabled =
    $("autoKeyFrameOption")
      ?.checked;


  if (!enabled) {
    return;
  }


  const importantPhases = [

    "반동",
    "이륙",
    "비행",
    "최고속도",
    "방향전환",
    "릴리스",
    "최대 도달"

  ];


  if (
    !importantPhases.includes(
      phase
    )
  ) {

    return;
  }


  const video =
    getVideo();


  const currentTime =
    Number(
      video?.currentTime
    ) || 0;


  const previous =
    AUTO_FRAME_COOLDOWN.get(
      phase
    );


  if (
    previous !== undefined &&
    currentTime - previous < 0.8
  ) {

    return;
  }


  const score =
    average(
      Object.values(metrics)
    );


  if (score < 45) {
    return;
  }


  AUTO_FRAME_COOLDOWN.set(
    phase,
    currentTime
  );


  captureKeyFrame(
    `${phase} 핵심 자세`,
    true
  );
}


/* =========================================================
   108. CAPTURE KEY FRAME
========================================================= */

function captureKeyFrame(
  label = "핵심 프레임",
  automatic = false
) {

  const video =
    getVideo();


  if (
    !video ||
    !video.src ||
    video.readyState < 2
  ) {

    if (!automatic) {

      showToast(
        "캡처할 영상이 없습니다.",
        true
      );
    }

    return;
  }


  const width =
    video.videoWidth;

  const height =
    video.videoHeight;


  if (
    !width ||
    !height
  ) {
    return;
  }


  try {

    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      width;

    canvas.height =
      height;


    const ctx =
      canvas.getContext("2d");


    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );


    if (
      state.currentLandmarks
    ) {

      drawPoseForCapture(
        ctx,
        canvas,
        state.currentLandmarks,
        state.currentAngles,
        calculateBodyCenter(
          state.currentLandmarks
        )
      );
    }


    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.82
      );


    const frame = {

      id:
        createId("frame"),

      time:
        Number(
          video.currentTime
        ) || 0,

      label,

      image,

      automatic,

      angles:
        state.currentAngles
          ? {
              ...state.currentAngles
            }
          : {},

      metrics: {
        ...state.currentMetrics
      }

    };


    state.keyFrames.push(
      frame
    );


    if (
      state.keyFrames.length >
      8
    ) {

      state.keyFrames.shift();
    }


    renderKeyFrames();


    if (!automatic) {

      showToast(
        "핵심 프레임을 저장했습니다."
      );
    }

  } catch (error) {

    console.error(
      "[CAPTURE ERROR]",
      error
    );


    if (!automatic) {

      showToast(
        "프레임 캡처에 실패했습니다.",
        true
      );
    }
  }
}


/* =========================================================
   109. DRAW POSE INTO CAPTURE
========================================================= */

function drawPoseForCapture(
  ctx,
  canvas,
  landmarks,
  angles,
  center
) {

  if (state.settings.skeleton) {

    drawSkeleton(
      ctx,
      canvas,
      landmarks
    );
  }


  if (state.settings.angles) {

    drawJointAngles(
      ctx,
      canvas,
      landmarks,
      angles || {}
    );
  }


  if (
    state.settings.centerOfMass &&
    center
  ) {

    drawCenterOfMass(
      ctx,
      canvas,
      center
    );
  }
}


/* =========================================================
   110. RENDER KEY FRAMES
========================================================= */

function renderKeyFrames() {

  const container =
    $("keyFrameList");

  const count =
    $("keyFrameCount");


  if (count) {

    count.textContent =
      state.keyFrames.length;
  }


  if (!container) {
    return;
  }


  if (!state.keyFrames.length) {

    container.innerHTML = `
      <div class="empty-state">
        핵심 프레임이 없습니다.
      </div>
    `;

    return;
  }


  container.innerHTML =
    state.keyFrames
      .map(
        (
          frame,
          index
        ) => {

          return `
            <article class="key-frame-card">

              <img
                src="${frame.image}"
                alt="${escapeHTML(
                  frame.label
                )}"
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

                <button
                  type="button"
                  class="secondary-button"
                  data-key-frame-seek="${index}"
                  style="
                    min-height:30px;
                    margin-top:8px;
                    padding:0 10px;
                    font-size:9px;
                  "
                >
                  이 장면 보기
                </button>

              </div>

            </article>
          `;

        }
      )
      .join("");


  $$("[data-key-frame-seek]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset
                .keyFrameSeek
            );


          const frame =
            state.keyFrames[
              index
            ];


          const video =
            getVideo();


          if (
            !frame ||
            !video
          ) {
            return;
          }


          video.pause();

          video.currentTime =
            frame.time;
        }
      );

    });
}


/* =========================================================
   111. LIVE FEEDBACK

   분석 도중 간단한 현재 상태 피드백.
   최종 상세 피드백은 PART 3에서 생성.
========================================================= */

function createLiveFeedback() {

  const metrics =
    state.currentMetrics;


  const feedback = [];


  if (
    metrics.symmetry < 65
  ) {

    feedback.push({

      title:
        "좌우 움직임 차이",

      text:
        "현재 프레임에서 좌우 관절각 차이가 비교적 크게 나타납니다."

    });
  }


  if (
    metrics.stability < 65
  ) {

    feedback.push({

      title:
        "중심 안정성",

      text:
        "골반과 신체 중심 이동이 크게 나타나는 구간입니다."

    });
  }


  if (
    metrics.technique >= 85
  ) {

    feedback.push({

      title:
        "좋은 기술 구간",

      text:
        "현재 구간의 관절 정렬과 동작 연결이 비교적 좋습니다."

    });
  }


  return feedback;
}


/* =========================================================
   112. RENDER FEEDBACK
========================================================= */

function renderFeedback(
  feedback
) {

  const container =
    $("analysisFeedbackList");


  if (!container) {
    return;
  }


  if (
    !Array.isArray(feedback) ||
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
      .map(item => {

        return `
          <div class="feedback-item">

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

      })
      .join("");
}


/* =========================================================
   113. ANALYSIS CHART
========================================================= */

function renderAnalysisChart() {

  const canvas =
    $("angleGraphCanvas");


  if (
    !canvas ||
    typeof window.Chart !==
      "function"
  ) {

    return;
  }


  destroyAnalysisChart();


  const history =
    state.angleHistory;


  state.chart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels:
            history.map(
              item =>
                item.time.toFixed(2)
            ),

          datasets: [

            {
              label: "왼쪽 무릎",
              data:
                history.map(
                  item =>
                    item.leftKnee
                ),
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label: "오른쪽 무릎",
              data:
                history.map(
                  item =>
                    item.rightKnee
                ),
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label: "왼쪽 고관절",
              data:
                history.map(
                  item =>
                    item.leftHip
                ),
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label: "오른쪽 고관절",
              data:
                history.map(
                  item =>
                    item.rightHip
                ),
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.25
            },

            {
              label: "몸통",
              data:
                history.map(
                  item =>
                    item.trunk
                ),
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.25
            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          animation: false,

          interaction: {
            intersect: false,
            mode: "index"
          },

          scales: {

            x: {

              title: {
                display: true,
                text: "시간 (초)"
              }

            },

            y: {

              suggestedMin: 0,

              suggestedMax: 180,

              title: {
                display: true,
                text: "각도 (°)"
              }

            }

          },

          plugins: {

            legend: {

              labels: {
                boxWidth: 12,
                font: {
                  size: 10
                }
              }

            }

          }

        }

      }
    );
}


/* =========================================================
   114. DESTROY ANALYSIS CHART
========================================================= */

function destroyAnalysisChart() {

  if (state.chart) {

    state.chart.destroy();

    state.chart =
      null;
  }
}


/* =========================================================
   115. FRAME SUMMARY
========================================================= */

function calculateFrameSummary() {

  if (!state.frames.length) {

    return {
      metrics: {
        ...state.currentMetrics
      },

      angles:
        state.currentAngles
          ? {
              ...state.currentAngles
            }
          : {}
    };
  }


  const metricKeys = [

    "speed",
    "power",
    "agility",
    "stability",
    "symmetry",
    "technique"

  ];


  const metrics = {};


  metricKeys.forEach(key => {

    metrics[key] =
      average(
        state.frames.map(
          frame =>
            frame.metrics?.[key]
        )
      );

  });


  const angleKeys = [

    "leftKnee",
    "rightKnee",
    "leftHip",
    "rightHip",
    "leftAnkle",
    "rightAnkle",
    "leftElbow",
    "rightElbow",
    "trunk"

  ];


  const angles = {};


  angleKeys.forEach(key => {

    const values =
      state.frames
        .map(
          frame =>
            frame.angles?.[key]
        )
        .filter(
          Number.isFinite
        );


    if (values.length) {

      angles[key] = {

        average:
          average(values),

        min:
          Math.min(...values),

        max:
          Math.max(...values)

      };

    } else {

      angles[key] = {

        average: null,
        min: null,
        max: null

      };
    }

  });


  return {
    metrics,
    angles
  };
}


/* =========================================================
   116. TRAJECTORY SUMMARY
========================================================= */

function calculateTrajectorySummary() {

  const points =
    state.trajectory;


  if (points.length < 2) {

    return {
      horizontalRange: 0,
      verticalRange: 0,
      pathLength: 0
    };
  }


  const xs =
    points.map(
      point => point.x
    );

  const ys =
    points.map(
      point => point.y
    );


  let pathLength = 0;


  for (
    let i = 1;
    i < points.length;
    i++
  ) {

    pathLength +=
      distance2D(
        points[i - 1],
        points[i]
      );
  }


  return {

    horizontalRange:
      Math.max(...xs) -
      Math.min(...xs),

    verticalRange:
      Math.max(...ys) -
      Math.min(...ys),

    pathLength

  };
}


/* =========================================================
   117. ASYMMETRY SUMMARY
========================================================= */

function calculateAsymmetrySummary() {

  const frames =
    state.frames;


  const calculateDifference =
    (
      leftKey,
      rightKey
    ) => {

      const differences =
        frames
          .map(frame => {

            const left =
              frame.angles?.[
                leftKey
              ];

            const right =
              frame.angles?.[
                rightKey
              ];


            if (
              !Number.isFinite(left) ||
              !Number.isFinite(right)
            ) {

              return null;
            }


            return Math.abs(
              left - right
            );

          })
          .filter(
            Number.isFinite
          );


      return differences.length
        ? average(differences)
        : null;
    };


  return {

    kneeDifference:
      calculateDifference(
        "leftKnee",
        "rightKnee"
      ),

    hipDifference:
      calculateDifference(
        "leftHip",
        "rightHip"
      ),

    ankleDifference:
      calculateDifference(
        "leftAnkle",
        "rightAnkle"
      ),

    elbowDifference:
      calculateDifference(
        "leftElbow",
        "rightElbow"
      )

  };
}


/* =========================================================
   118. BEST FRAME
========================================================= */

function findBestFrame() {

  if (!state.frames.length) {
    return null;
  }


  let best = null;

  let bestScore =
    -Infinity;


  state.frames.forEach(frame => {

    const score =
      average(
        Object.values(
          frame.metrics || {}
        )
      );


    if (
      score >
      bestScore
    ) {

      bestScore =
        score;

      best =
        frame;
    }
  });


  if (!best) {
    return null;
  }


  return {

    ...best,

    score:
      Math.round(
        bestScore
      )

  };
}


/* =========================================================
   119. BEST KEY FRAME
========================================================= */

function findBestCapturedFrame() {

  if (!state.keyFrames.length) {
    return null;
  }


  let best =
    state.keyFrames[0];

  let bestScore =
    average(
      Object.values(
        best.metrics || {}
      )
    );


  state.keyFrames
    .slice(1)
    .forEach(frame => {

      const score =
        average(
          Object.values(
            frame.metrics || {}
          )
        );


      if (score > bestScore) {

        best =
          frame;

        bestScore =
          score;
      }

    });


  return {
    ...best,
    score:
      Math.round(bestScore)
  };
}


/* =========================================================
   120. PART 2 READY
========================================================= */

console.log(
  "[APP] Motion Analysis Engine loaded"
);
/* =========================================================
   SEOLCHEON HIGH SCHOOL
   PE PERFORMANCE LAB — FINAL 3.0

   app.js
   PART 3 / 3

   FINAL ANALYSIS
   - Final Score
   - Feedback
   - Training Recommendation
   - Analysis Save
   - Records
   - Report
   - Radar Chart
   - Key Frame Report
   - PE Entrance Evaluation
   - Print Report
========================================================= */


/* =========================================================
   121. FINALIZE ANALYSIS
========================================================= */

function finalizeAnalysis() {

  if (!state.frames.length) {

    showToast(
      "분석된 프레임이 없습니다.",
      true
    );

    return null;
  }


  const summary =
    calculateFrameSummary();


  const trajectory =
    calculateTrajectorySummary();


  const asymmetry =
    calculateAsymmetrySummary();


  const bestFrame =
    findBestFrame();


  const bestCapturedFrame =
    findBestCapturedFrame();


  const finalScore =
    calculateFinalScore(
      summary.metrics
    );


  const feedback =
    generateFinalFeedback(
      summary,
      asymmetry,
      trajectory
    );


  const training =
    generateTrainingRecommendations(
      summary,
      asymmetry
    );


  const event =
    window.getEventById?.(
      state.selectedEventId
    );


  const athlete =
    getAthleteById(
      state.selectedAthleteId
    );


  const result = {

    id:
      createId("analysis"),

    createdAt:
      new Date().toISOString(),

    athleteId:
      state.selectedAthleteId,

    athleteName:
      athlete?.name ||
      "미등록 선수",

    athlete: athlete
      ? { ...athlete }
      : null,

    eventId:
      state.selectedEventId,

    eventName:
      event?.name ||
      "일반 자세분석",

    eventCategory:
      event?.category ||
      "-",

    ability:
      event?.ability ||
      event?.analysisType ||
      "-",

    analysisType:
      event?.analysisType ||
      "motion",

    goal:
      $("analysisGoalSelect")
        ?.value ||
      "technique",

    videoName:
      state.videoFile?.name ||
      "video",

    duration:
      Number(
        getVideo()?.duration
      ) || 0,

    frameCount:
      state.frames.length,

    score:
      finalScore,

    metrics:
      summary.metrics,

    angles:
      summary.angles,

    specialMetrics: {
      ...state.specialMetrics
    },

    trajectory,

    asymmetry,

    bestFrame,

    bestCapturedFrame,

    keyFrames:
      state.keyFrames.map(
        frame => ({
          ...frame
        })
      ),

    angleHistory:
      state.angleHistory.map(
        item => ({
          ...item
        })
      ),

    feedback,

    training

  };


  return result;
}


/* =========================================================
   122. FINAL SCORE
========================================================= */

function calculateFinalScore(
  metrics
) {

  const values = [

    metrics.speed,
    metrics.power,
    metrics.agility,
    metrics.stability,
    metrics.symmetry,
    metrics.technique

  ].filter(
    Number.isFinite
  );


  if (!values.length) {
    return 0;
  }


  /*
     기술 / 안정성 / 대칭성에
     조금 더 높은 비중을 둠.
  */

  const weighted =

    (metrics.technique || 0) *
      0.25 +

    (metrics.stability || 0) *
      0.20 +

    (metrics.symmetry || 0) *
      0.20 +

    (metrics.power || 0) *
      0.15 +

    (metrics.speed || 0) *
      0.10 +

    (metrics.agility || 0) *
      0.10;


  return Math.round(
    clamp(weighted)
  );
}


/* =========================================================
   123. SCORE GRADE
========================================================= */

function getScoreGrade(
  score
) {

  if (score >= 95) {
    return "S+";
  }

  if (score >= 90) {
    return "S";
  }

  if (score >= 85) {
    return "A+";
  }

  if (score >= 80) {
    return "A";
  }

  if (score >= 75) {
    return "B+";
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
   124. FINAL FEEDBACK
========================================================= */

function generateFinalFeedback(
  summary,
  asymmetry,
  trajectory
) {

  const feedback = [];


  const metrics =
    summary.metrics;


  /* TECHNIQUE */

  if (
    metrics.technique >= 85
  ) {

    feedback.push({

      type: "good",

      title:
        "기술 수행 우수",

      text:
        "전체 동작의 관절 정렬과 움직임 연결이 안정적으로 나타났습니다."

    });

  } else if (
    metrics.technique < 70
  ) {

    feedback.push({

      type: "improve",

      title:
        "기술 동작 개선",

      text:
        "주요 관절의 움직임 타이밍과 동작 연결을 반복 훈련하는 것이 좋습니다."

    });

  }


  /* SYMMETRY */

  if (
    metrics.symmetry >= 85
  ) {

    feedback.push({

      type: "good",

      title:
        "좌우 대칭성 우수",

      text:
        "좌우 관절 움직임의 차이가 비교적 작고 균형이 좋습니다."

    });

  } else if (
    metrics.symmetry < 70
  ) {

    feedback.push({

      type: "improve",

      title:
        "좌우 비대칭 확인",

      text:
        "좌우 관절각 차이가 나타났습니다. 한쪽에 치우치지 않도록 양측 움직임을 확인하세요."

    });

  }


  /* KNEE */

  if (
    Number.isFinite(
      asymmetry.kneeDifference
    )
  ) {

    if (
      asymmetry.kneeDifference >
      12
    ) {

      feedback.push({

        type: "warning",

        title:
          "무릎 각도 차이",

        text:
          `좌우 무릎 평균 차이가 약 ${asymmetry.kneeDifference.toFixed(1)}°로 나타났습니다.`

      });

    }
  }


  /* HIP */

  if (
    Number.isFinite(
      asymmetry.hipDifference
    ) &&
    asymmetry.hipDifference > 12
  ) {

    feedback.push({

      type: "warning",

      title:
        "고관절 좌우 차이",

      text:
        `좌우 고관절 평균 차이가 약 ${asymmetry.hipDifference.toFixed(1)}°입니다.`

    });

  }


  /* STABILITY */

  if (
    metrics.stability >= 85
  ) {

    feedback.push({

      type: "good",

      title:
        "신체 중심 안정",

      text:
        "동작 중 골반과 신체 중심의 흔들림이 비교적 안정적으로 유지되었습니다."

    });

  } else if (
    metrics.stability < 70
  ) {

    feedback.push({

      type: "improve",

      title:
        "중심 안정성 개선",

      text:
        "동작 중 신체 중심 이동이 크게 나타나는 구간이 있습니다."

    });

  }


  /* POWER */

  if (
    metrics.power >= 85
  ) {

    feedback.push({

      type: "good",

      title:
        "파워 발휘 우수",

      text:
        "하지 관절의 신전과 움직임 속도가 비교적 좋은 수준으로 분석되었습니다."

    });

  } else if (
    metrics.power < 65
  ) {

    feedback.push({

      type: "improve",

      title:
        "파워 연결 개선",

      text:
        "고관절·무릎·발목의 연속적인 신전 타이밍을 강화하면 동작 효율을 높이는 데 도움이 됩니다."

    });

  }


  /* TRAJECTORY */

  if (
    trajectory.pathLength > 0.8
  ) {

    feedback.push({

      type: "info",

      title:
        "움직임 궤적 확인",

      text:
        "신체 중심 이동량이 크게 나타났습니다. 종목 특성에 필요한 이동인지 핵심 프레임에서 확인하세요."

    });

  }


  if (!feedback.length) {

    feedback.push({

      type: "info",

      title:
        "분석 완료",

      text:
        "전체적인 움직임을 확인했습니다. 핵심 자세와 관절각 데이터를 함께 비교하세요."

    });

  }


  return feedback;
}


/* =========================================================
   125. TRAINING RECOMMENDATIONS
========================================================= */

function generateTrainingRecommendations(
  summary,
  asymmetry
) {

  const metrics =
    summary.metrics;


  const training = [];


  if (
    metrics.stability < 80
  ) {

    training.push({

      title:
        "코어 안정화",

      exercises: [
        "데드버그",
        "버드독",
        "플랭크",
        "싱글레그 밸런스"
      ],

      purpose:
        "동작 중 몸통과 골반 안정성 향상"

    });

  }


  if (
    metrics.symmetry < 80
  ) {

    training.push({

      title:
        "좌우 균형 훈련",

      exercises: [
        "스플릿 스쿼트",
        "싱글레그 스쿼트 패턴",
        "스텝업",
        "싱글레그 RDL 패턴"
      ],

      purpose:
        "좌우 하지 움직임의 균형 향상"

    });

  }


  if (
    metrics.power < 80
  ) {

    training.push({

      title:
        "하지 파워",

      exercises: [
        "점프 착지 드릴",
        "박스 점프",
        "스쿼트 점프",
        "메디신볼 동작"
      ],

      purpose:
        "하지 신전 속도와 폭발적인 힘 향상"

    });

  }


  if (
    metrics.speed < 80
  ) {

    training.push({

      title:
        "스피드 기술",

      exercises: [
        "A-스킵",
        "빠른 발 드릴",
        "짧은 가속주",
        "리듬 러닝"
      ],

      purpose:
        "동작 빈도와 가속 기술 향상"

    });

  }


  if (
    metrics.technique < 80
  ) {

    training.push({

      title:
        "종목 기술 반복",

      exercises: [
        "저속 기술 반복",
        "핵심 구간 정지 동작",
        "영상 피드백 반복",
        "동작 단계별 연결"
      ],

      purpose:
        "종목별 핵심 자세와 타이밍 개선"

    });

  }


  if (
    Number.isFinite(
      asymmetry.kneeDifference
    ) &&
    asymmetry.kneeDifference > 10
  ) {

    training.push({

      title:
        "무릎 정렬 컨트롤",

      exercises: [
        "싱글레그 착지 연습",
        "스텝다운",
        "저강도 방향전환",
        "거울 자세 피드백"
      ],

      purpose:
        "좌우 무릎 움직임 차이 감소"

    });

  }


  if (!training.length) {

    training.push({

      title:
        "퍼포먼스 유지",

      exercises: [
        "종목 기술 반복",
        "코어 안정화",
        "기초 근력",
        "움직임 품질 훈련"
      ],

      purpose:
        "현재 움직임 수준 유지 및 세부 기술 향상"

    });

  }


  return training.slice(
    0,
    6
  );
}


/* =========================================================
   126. COMPLETE ANALYSIS
========================================================= */

function completeAnalysis() {

  const result =
    finalizeAnalysis();


  if (!result) {
    return;
  }


  state.currentReport =
    result;


  state.analyses.unshift(
    result
  );


  /*
     localStorage 용량 때문에
     이미지가 포함된 분석은 너무 많이
     저장하지 않도록 제한.
  */

  if (
    state.analyses.length >
    20
  ) {

    state.analyses =
      state.analyses.slice(
        0,
        20
      );
  }


  saveAnalyses();


  updateDashboard();


  renderRecords();


  showAnalysisComplete(
    result
  );


  renderFeedback(
    result.feedback
  );


  renderAnalysisChart();


  if (
    $("finishReportButton")
  ) {

    $("finishReportButton")
      .disabled =
      false;
  }


  showToast(
    "영상 분석이 완료되었습니다."
  );
}


/* =========================================================
   127. ANALYSIS COMPLETE PANEL
========================================================= */

function showAnalysisComplete(
  result
) {

  const panel =
    $("analysisSummaryPanel");


  if (panel) {

    panel.classList.remove(
      "hidden"
    );
  }


  if (
    $("analysisFinalScore")
  ) {

    $("analysisFinalScore")
      .textContent =
      result.score;
  }
}


/* =========================================================
   128. SAVE ANALYSES
========================================================= */

function saveAnalyses() {

  try {

    localStorage.setItem(
      APP_CONFIG.storageKeys
        .analyses,

      JSON.stringify(
        state.analyses
      )
    );

  } catch (error) {

    console.warn(
      "[STORAGE] analysis save failed",
      error
    );


    /*
       이미지 때문에 localStorage
       용량 초과 시 이미지 제거 후 재시도.
    */

    try {

      const lightweight =
        state.analyses.map(
          analysis => ({

            ...analysis,

            keyFrames:
              analysis.keyFrames
                ?.map(frame => ({

                  ...frame,

                  image: null

                })) || [],

            bestCapturedFrame:
              analysis.bestCapturedFrame
                ? {
                    ...analysis.bestCapturedFrame,
                    image: null
                  }
                : null

          })
        );


      localStorage.setItem(
        APP_CONFIG.storageKeys
          .analyses,

        JSON.stringify(
          lightweight
        )
      );


      state.analyses =
        lightweight;


      showToast(
        "저장 공간 제한으로 리포트 사진 일부를 제외하고 저장했습니다.",
        true
      );

    } catch (
      secondError
    ) {

      console.error(
        secondError
      );
    }
  }
}


/* =========================================================
   129. RECORDS
========================================================= */

function renderRecords() {

  const container =
    $("recordList");


  if (!container) {
    return;
  }


  updateRecordAthleteFilter();


  const filter =
    $("recordAthleteFilter")
      ?.value || "";


  const records =
    state.analyses.filter(
      analysis => {

        if (!filter) {
          return true;
        }


        return (
          analysis.athleteId ===
          filter
        );
      }
    );


  if ($("recordCount")) {

    $("recordCount")
      .textContent =
      records.length;
  }


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

        return `
          <article class="record-card">

            <div class="record-card-main">

              <span class="section-label">
                ${escapeHTML(
                  formatDateTime(
                    record.createdAt
                  )
                )}
              </span>

              <h3>
                ${escapeHTML(
                  record.athleteName
                )}
              </h3>

              <p>
                ${escapeHTML(
                  record.eventName
                )}
              </p>

            </div>


            <div class="record-score">

              <strong>
                ${record.score}
              </strong>

              <span>
                /100
              </span>

            </div>


            <div class="record-actions">

              <button
                type="button"
                class="secondary-button"
                data-open-record="${record.id}"
              >
                리포트
              </button>


              <button
                type="button"
                class="danger-button"
                data-delete-record="${record.id}"
              >
                삭제
              </button>

            </div>

          </article>
        `;

      })
      .join("");


  $$("[data-open-record]")
    .forEach(button => {

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


  $$("[data-delete-record]")
    .forEach(button => {

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
   130. RECORD FILTER
========================================================= */

function updateRecordAthleteFilter() {

  const select =
    $("recordAthleteFilter");


  if (!select) {
    return;
  }


  const current =
    select.value;


  select.innerHTML = `
    <option value="">
      전체 선수
    </option>

    ${state.athletes
      .map(
        athlete => `
          <option value="${athlete.id}">
            ${escapeHTML(
              athlete.name
            )}
          </option>
        `
      )
      .join("")
    }
  `;


  if (
    state.athletes.some(
      athlete =>
        athlete.id === current
    )
  ) {

    select.value =
      current;
  }
}


/* =========================================================
   131. OPEN RECORD
========================================================= */

function openAnalysisRecord(
  id
) {

  const record =
    state.analyses.find(
      analysis =>
        analysis.id === id
    );


  if (!record) {

    showToast(
      "분석 기록을 찾을 수 없습니다.",
      true
    );

    return;
  }


  state.currentReport =
    record;


  renderReport(
    record
  );


  navigateTo(
    "report"
  );
}


/* =========================================================
   132. DELETE RECORD
========================================================= */

function deleteAnalysisRecord(
  id
) {

  const record =
    state.analyses.find(
      analysis =>
        analysis.id === id
    );


  if (!record) {
    return;
  }


  const confirmed =
    window.confirm(
      `${record.athleteName} - ${record.eventName} 분석 기록을 삭제할까요?`
    );


  if (!confirmed) {
    return;
  }


  state.analyses =
    state.analyses.filter(
      analysis =>
        analysis.id !== id
    );


  saveAnalyses();

  renderRecords();

  updateDashboard();


  if (
    state.currentReport?.id ===
    id
  ) {

    state.currentReport =
      null;
  }


  showToast(
    "분석 기록을 삭제했습니다."
  );
}


/* =========================================================
   133. CLEAR ALL ANALYSIS
========================================================= */

function clearAllAnalysisData() {

  if (
    !state.analyses.length
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


  state.analyses = [];

  state.currentReport =
    null;


  localStorage.removeItem(
    APP_CONFIG.storageKeys
      .analyses
  );


  renderRecords();

  updateDashboard();

  renderReportEmpty();


  showToast(
    "모든 분석 기록을 삭제했습니다."
  );
}


/* =========================================================
   134. OPEN CURRENT REPORT
========================================================= */

function openCurrentReport() {

  if (!state.currentReport) {

    if (
      state.analyses.length
    ) {

      state.currentReport =
        state.analyses[0];

    } else {

      showToast(
        "먼저 영상을 분석해주세요.",
        true
      );

      navigateTo(
        "analysis"
      );

      return;
    }
  }


  renderReport(
    state.currentReport
  );


  navigateTo(
    "report"
  );
}


/* =========================================================
   135. REPORT
========================================================= */

function renderReport(
  report
) {

  if (!report) {

    renderReportEmpty();

    return;
  }


  $("reportEmptyState")
    ?.classList.add(
      "hidden"
    );


  $("reportContent")
    ?.classList.remove(
      "hidden"
    );


  setText(
    "reportAthleteName",
    report.athleteName ||
    "-"
  );


  setText(
    "reportGrade",
    report.athlete?.grade ||
    "-"
  );


  setText(
    "reportHeight",
    report.athlete?.height
      ? `${report.athlete.height} cm`
      : "-"
  );


  setText(
    "reportWeight",
    report.athlete?.weight
      ? `${report.athlete.weight} kg`
      : "-"
  );


  setText(
    "reportEventName",
    report.eventName ||
    "-"
  );


  setText(
    "reportAbility",
    report.ability ||
    "-"
  );


  setText(
    "reportCategory",
    report.eventCategory ||
    "-"
  );


  setText(
    "reportDate",
    formatDateTime(
      report.createdAt
    )
  );


  setText(
    "reportTotalScore",
    report.score
  );


  setText(
    "reportGradeScore",
    getScoreGrade(
      report.score
    )
  );


  setText(
    "reportVideoName",
    report.videoName ||
    "-"
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


  renderReportAngleSummary(
    report
  );


  renderReportSpecialMetrics(
    report
  );


  renderReportFeedback(
    report
  );


  renderTrainingRecommendations(
    report
  );


  setTimeout(
    () => {

      renderReportRadar(
        report
      );

      renderReportAngleChart(
        report
      );

    },
    80
  );
}


/* =========================================================
   136. EMPTY REPORT
========================================================= */

function renderReportEmpty() {

  $("reportEmptyState")
    ?.classList.remove(
      "hidden"
    );


  $("reportContent")
    ?.classList.add(
      "hidden"
    );
}


/* =========================================================
   137. SET TEXT
========================================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);


  if (element) {

    element.textContent =
      value ?? "-";
  }
}


/* =========================================================
   138. REPORT METRICS
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
      "기술 수행"

  };


  container.innerHTML =
    Object.entries(labels)
      .map(
        ([key, label]) => {

          const value =
            Math.round(
              report.metrics?.[key] ||
              0
            );


          return `
            <div class="report-metric-card">

              <span>
                ${label}
              </span>

              <strong>
                ${value}
              </strong>

              <div class="metric-track">

                <div
                  class="metric-fill"
                  style="
                    width:${value}%;
                  "
                ></div>

              </div>

            </div>
          `;

        }
      )
      .join("");
}


/* =========================================================
   139. PE ENTRANCE EVALUATION

   실제 대학 합격 판정이 아니라
   영상 움직임 분석 결과를
   체대입시 훈련 관점에서 보여줌.
========================================================= */

function renderPEEvaluation(
  report
) {

  const container =
    $("peEvaluation");


  if (!container) {
    return;
  }


  const event =
    window.getEventById?.(
      report.eventId
    );


  const score =
    report.score;


  let level =
    "기초 보완";


  if (score >= 90) {

    level =
      "매우 우수";

  } else if (
    score >= 80
  ) {

    level =
      "우수";

  } else if (
    score >= 70
  ) {

    level =
      "보통 이상";
  }


  const benchmark =
    event?.benchmark ||
    event?.description ||
    "종목별 실기 기록과 함께 확인하세요.";


  container.innerHTML = `

    <div class="panel-heading">

      <div>

        <span class="section-label">
          PE ENTRANCE TEST
        </span>

        <h3>
          체대입시 평가
        </h3>

      </div>

    </div>


    <div class="pe-evaluation-grid">

      <div>

        <span>
          자세분석 수준
        </span>

        <strong>
          ${escapeHTML(level)}
        </strong>

      </div>


      <div>

        <span>
          종목
        </span>

        <strong>
          ${escapeHTML(
            report.eventName
          )}
        </strong>

      </div>


      <div>

        <span>
          움직임 점수
        </span>

        <strong>
          ${report.score}/100
        </strong>

      </div>

    </div>


    <p class="pe-evaluation-note">
      ${escapeHTML(
        benchmark
      )}
    </p>


    <p class="pe-evaluation-disclaimer">
      ※ 본 점수는 업로드 영상의 자세·움직임을 분석한
      훈련용 지표이며 실제 대학 합격 여부나
      공식 실기 기록을 의미하지 않습니다.
    </p>
  `;
}


/* =========================================================
   140. REPORT KEY FRAMES
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

    container.innerHTML = `
      <div class="empty-state">
        저장된 핵심 자세 사진이 없습니다.
      </div>
    `;

    return;
  }


  container.innerHTML =
    frames
      .slice(0, 6)
      .map(
        (
          frame,
          index
        ) => {

          const feedback =
            createFrameFeedback(
              frame,
              report
            );


          return `
            <article class="report-frame-card">

              ${
                frame.image
                  ? `
                    <img
                      src="${frame.image}"
                      alt="핵심 자세 ${index + 1}"
                    >
                  `
                  : `
                    <div class="report-frame-placeholder">
                      이미지 저장 안 됨
                    </div>
                  `
              }

              <div class="report-frame-info">

                <span>
                  ${formatVideoTime(
                    frame.time
                  )}
                </span>

                <strong>
                  ${escapeHTML(
                    frame.label ||
                    `핵심 자세 ${index + 1}`
                  )}
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
   141. FRAME FEEDBACK
========================================================= */

function createFrameFeedback(
  frame,
  report
) {

  const metrics =
    frame.metrics || {};


  const angles =
    frame.angles || {};


  const messages = [];


  if (
    Number(metrics.technique) >=
    85
  ) {

    messages.push(
      "기술 수행이 좋은 구간입니다."
    );
  }


  if (
    Number(metrics.stability) <
    70
  ) {

    messages.push(
      "신체 중심 안정성을 확인하세요."
    );
  }


  if (
    Number(metrics.symmetry) <
    70
  ) {

    messages.push(
      "좌우 관절 움직임 차이가 보입니다."
    );
  }


  if (
    Number.isFinite(
      angles.leftKnee
    ) &&
    Number.isFinite(
      angles.rightKnee
    )
  ) {

    const difference =
      Math.abs(
        angles.leftKnee -
        angles.rightKnee
      );


    if (difference > 12) {

      messages.push(
        `무릎 좌우 차이 약 ${difference.toFixed(0)}°입니다.`
      );
    }
  }


  if (!messages.length) {

    messages.push(
      "이 프레임의 관절 정렬과 중심 이동을 종목 동작과 함께 확인하세요."
    );
  }


  return messages.join(" ");
}


/* =========================================================
   142. REPORT ANGLE SUMMARY
========================================================= */

function renderReportAngleSummary(
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
    Object.entries(labels)
      .map(
        ([key, label]) => {

          const data =
            report.angles?.[key];


          const avg =
            Number.isFinite(
              data?.average
            )
              ? Math.round(
                  data.average
                )
              : "--";


          const min =
            Number.isFinite(
              data?.min
            )
              ? Math.round(
                  data.min
                )
              : "--";


          const max =
            Number.isFinite(
              data?.max
            )
              ? Math.round(
                  data.max
                )
              : "--";


          return `
            <div class="angle-summary-card">

              <span>
                ${label}
              </span>

              <strong>
                ${avg}°
              </strong>

              <small>
                MIN ${min}° ·
                MAX ${max}°
              </small>

            </div>
          `;

        }
      )
      .join("");
}


/* =========================================================
   143. SPECIAL METRICS REPORT
========================================================= */

function renderReportSpecialMetrics(
  report
) {

  const container =
    $("reportSpecialMetrics");


  if (!container) {
    return;
  }


  const special =
    report.specialMetrics || {};


  const items = [

    [
      "점프 높이",
      Number.isFinite(
        special.jumpHeight
      )
        ? `${special.jumpHeight.toFixed(1)} cm*`
        : "--"
    ],

    [
      "비행시간",
      Number.isFinite(
        special.flightTime
      )
        ? `${special.flightTime.toFixed(2)} s`
        : "--"
    ],

    [
      "이륙각",
      Number.isFinite(
        special.takeoffAngle
      )
        ? `${Math.round(
            special.takeoffAngle
          )}°`
        : "--"
    ],

    [
      "케이던스",
      Number.isFinite(
        special.cadence
      )
        ? `${Math.round(
            special.cadence
          )} spm`
        : "--"
    ],

    [
      "스텝",
      special.stepCount || 0
    ]

  ];


  container.innerHTML =
    items
      .map(
        ([label, value]) => `
          <div>

            <span>
              ${label}
            </span>

            <strong>
              ${value}
            </strong>

          </div>
        `
      )
      .join("");
}


/* =========================================================
   144. REPORT FEEDBACK
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

    container.innerHTML = `
      <div class="empty-state">
        피드백이 없습니다.
      </div>
    `;

    return;
  }


  container.innerHTML =
    feedback
      .map(item => `

        <article class="report-feedback-item">

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
   145. TRAINING REPORT
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


  container.innerHTML =
    training
      .map(
        (
          item,
          index
        ) => `

          <article class="training-card">

            <span class="training-number">
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
                  item.purpose
                )}
              </p>

              <div class="training-tags">

                ${item.exercises
                  .map(
                    exercise => `
                      <span>
                        ${escapeHTML(
                          exercise
                        )}
                      </span>
                    `
                  )
                  .join("")
                }

              </div>

            </div>

          </article>

        `
      )
      .join("");
}


/* =========================================================
   146. RADAR CHART
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
    state.reportRadarChart
  ) {

    state.reportRadarChart
      .destroy();

    state.reportRadarChart =
      null;
  }


  const metrics =
    report.metrics || {};


  state.reportRadarChart =
    new Chart(
      canvas,
      {

        type: "radar",

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

          responsive: true,

          maintainAspectRatio: false,

          scales: {

            r: {

              min: 0,

              max: 100,

              ticks: {
                stepSize: 20,
                backdropColor:
                  "transparent"
              }

            }

          },

          plugins: {

            legend: {
              display: false
            }

          }

        }

      }
    );
}


/* =========================================================
   147. REPORT ANGLE CHART
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
    state.reportAngleChart
  ) {

    state.reportAngleChart
      .destroy();

    state.reportAngleChart =
      null;
  }


  const history =
    report.angleHistory || [];


  state.reportAngleChart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels:
            history.map(
              item =>
                Number(
                  item.time
                ).toFixed(2)
            ),

          datasets: [

            {
              label:
                "왼쪽 무릎",

              data:
                history.map(
                  item =>
                    item.leftKnee
                ),

              borderWidth: 2,

              pointRadius: 0,

              tension: 0.25
            },

            {
              label:
                "오른쪽 무릎",

              data:
                history.map(
                  item =>
                    item.rightKnee
                ),

              borderWidth: 2,

              pointRadius: 0,

              tension: 0.25
            },

            {
              label:
                "왼쪽 고관절",

              data:
                history.map(
                  item =>
                    item.leftHip
                ),

              borderWidth: 1.5,

              pointRadius: 0,

              tension: 0.25
            },

            {
              label:
                "오른쪽 고관절",

              data:
                history.map(
                  item =>
                    item.rightHip
                ),

              borderWidth: 1.5,

              pointRadius: 0,

              tension: 0.25
            }

          ]

        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          interaction: {
            intersect: false,
            mode: "index"
          },

          scales: {

            y: {

              suggestedMin: 0,

              suggestedMax: 180

            }

          }

        }

      }
    );
}


/* =========================================================
   148. DASHBOARD
========================================================= */

function updateDashboard() {

  const athleteCount =
    state.athletes.length;


  const analysisCount =
    state.analyses.length;


  const scores =
    state.analyses
      .map(
        item =>
          Number(item.score)
      )
      .filter(
        Number.isFinite
      );


  const averageScore =
    scores.length
      ? Math.round(
          average(scores)
        )
      : null;


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
    averageScore ?? "--"
  );


  setText(
    "dashboardRecentCount",
    Math.min(
      analysisCount,
      5
    )
  );


  updateDashboardPerformance();

  updateDashboardRecent();
}


/* =========================================================
   149. DASHBOARD PERFORMANCE
========================================================= */

function updateDashboardPerformance() {

  const latest =
    state.analyses[0];


  const metrics =
    latest?.metrics;


  const mapping = [

    [
      "stability",
      "dashboardStabilityValue",
      "dashboardStabilityBar"
    ],

    [
      "symmetry",
      "dashboardSymmetryValue",
      "dashboardSymmetryBar"
    ],

    [
      "technique",
      "dashboardTechniqueValue",
      "dashboardTechniqueBar"
    ],

    [
      "power",
      "dashboardPowerValue",
      "dashboardPowerBar"
    ]

  ];


  mapping.forEach(
    (
      [
        key,
        valueId,
        barId
      ]
    ) => {

      const value =
        Number(
          metrics?.[key]
        );


      const finalValue =
        Number.isFinite(value)
          ? Math.round(value)
          : 0;


      setText(
        valueId,
        Number.isFinite(value)
          ? finalValue
          : "--"
      );


      const bar =
        $(barId);


      if (bar) {

        bar.style.width =
          `${finalValue}%`;
      }

    }
  );
}


/* =========================================================
   150. DASHBOARD RECENT
========================================================= */

function updateDashboardRecent() {

  const container =
    $("dashboardRecentList");


  if (!container) {
    return;
  }


  const recent =
    state.analyses.slice(
      0,
      5
    );


  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state">
        아직 분석 기록이 없습니다.
      </div>
    `;

    return;
  }


  container.innerHTML =
    recent
      .map(
        record => `

          <button
            type="button"
            class="recent-analysis-item"
            data-dashboard-record="${record.id}"
          >

            <div>

              <strong>
                ${escapeHTML(
                  record.athleteName
                )}
              </strong>

              <span>
                ${escapeHTML(
                  record.eventName
                )}
              </span>

            </div>

            <b>
              ${record.score}
            </b>

          </button>

        `
      )
      .join("");


  $$("[data-dashboard-record]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openAnalysisRecord(
            button.dataset
              .dashboardRecord
          );

        }
      );

    });
}


/* =========================================================
   151. PRINT REPORT
========================================================= */

function printCurrentReport() {

  if (!state.currentReport) {

    showToast(
      "출력할 리포트가 없습니다.",
      true
    );

    return;
  }


  window.print();
}


/* =========================================================
   152. SETTINGS SYNC
========================================================= */

function syncSettingsControls() {

  const mapping = [

    [
      "settingsSkeletonOption",
      "skeleton"
    ],

    [
      "settingsAngleOption",
      "angles"
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


  mapping.forEach(
    ([id, key]) => {

      const input =
        $(id);


      if (input) {

        input.checked =
          Boolean(
            state.settings[key]
          );
      }

    }
  );
}


/* =========================================================
   153. SAVE SETTINGS
========================================================= */

function saveSettings() {

  try {

    localStorage.setItem(
      APP_CONFIG.storageKeys
        .settings,

      JSON.stringify(
        state.settings
      )
    );

  } catch (error) {

    console.warn(
      "[SETTINGS SAVE ERROR]",
      error
    );
  }
}


/* =========================================================
   154. BIND FINAL EVENTS
========================================================= */

function bindFinalEvents() {

  $("recordAthleteFilter")
    ?.addEventListener(
      "change",
      renderRecords
    );


  $("finishReportButton")
    ?.addEventListener(
      "click",
      openCurrentReport
    );


  $("summaryOpenReportButton")
    ?.addEventListener(
      "click",
      openCurrentReport
    );


  $("reportEmptyAnalysisButton")
    ?.addEventListener(
      "click",
      () => {

        navigateTo(
          "analysis"
        );

      }
    );


  $("reportBackAnalysisButton")
    ?.addEventListener(
      "click",
      () => {

        navigateTo(
          "analysis"
        );

      }
    );


  $("printReportButton")
    ?.addEventListener(
      "click",
      printCurrentReport
    );


  $("clearAnalysisDataButton")
    ?.addEventListener(
      "click",
      clearAllAnalysisData
    );


  $("dashboardStartAnalysisButton")
    ?.addEventListener(
      "click",
      () => {

        navigateTo(
          "analysis"
        );

      }
    );


  const settingsMapping = [

    [
      "settingsSkeletonOption",
      "skeleton",
      "skeletonOption"
    ],

    [
      "settingsAngleOption",
      "angles",
      "angleOption"
    ],

    [
      "settingsTrajectoryOption",
      "trajectory",
      "trajectoryOption"
    ],

    [
      "settingsCenterOfMassOption",
      "centerOfMass",
      "centerOfMassOption"
    ]

  ];


  settingsMapping.forEach(
    (
      [
        settingsId,
        key,
        analysisId
      ]
    ) => {

      $(settingsId)
        ?.addEventListener(
          "change",
          event => {

            state.settings[key] =
              event.target.checked;


            const analysisInput =
              $(analysisId);


            if (analysisInput) {

              analysisInput.checked =
                event.target.checked;
            }


            saveSettings();

            redrawCurrentPose();

          }
        );

    }
  );
}


/* =========================================================
   155. ANALYSIS OPTION SYNC
========================================================= */

function bindAnalysisOptionSync() {

  const mapping = [

    [
      "skeletonOption",
      "skeleton",
      "settingsSkeletonOption"
    ],

    [
      "angleOption",
      "angles",
      "settingsAngleOption"
    ],

    [
      "trajectoryOption",
      "trajectory",
      "settingsTrajectoryOption"
    ],

    [
      "centerOfMassOption",
      "centerOfMass",
      "settingsCenterOfMassOption"
    ]

  ];


  mapping.forEach(
    (
      [
        analysisId,
        key,
        settingsId
      ]
    ) => {

      $(analysisId)
        ?.addEventListener(
          "change",
          event => {

            state.settings[key] =
              event.target.checked;


            const settingInput =
              $(settingsId);


            if (settingInput) {

              settingInput.checked =
                event.target.checked;
            }


            saveSettings();

            redrawCurrentPose();

          }
        );

    }
  );
}


/* =========================================================
   156. AUTO COMPLETE WHEN VIDEO ENDS
========================================================= */

function bindVideoEndAnalysis() {

  const video =
    getVideo();


  if (!video) {
    return;
  }


  video.addEventListener(
    "ended",
    () => {

      if (
        state.analysisRunning
      ) {

        stopAnalysis();

        completeAnalysis();
      }

    }
  );
}


/* =========================================================
   157. ANALYSIS STOP BUTTON FINALIZATION
========================================================= */

function bindStopFinalization() {

  const button =
    $("stopAnalysisButton");


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      /*
         PART 1에서 stopAnalysis()가
         먼저 실행되어도 frames가 남아 있으므로
         최종 분석 가능.
      */

      setTimeout(
        () => {

          if (
            state.frames.length
          ) {

            completeAnalysis();
          }

        },
        80
      );

    }
  );
}


/* =========================================================
   158. REPORT NAVIGATION HOOK

   사이드바에서 리포트를 눌렀을 때
   현재 리포트가 있으면 렌더링.
========================================================= */

function installReportNavigationHook() {

  const button =
    document.querySelector(
      '[data-page="report"]'
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      if (
        state.currentReport
      ) {

        renderReport(
          state.currentReport
        );

      } else if (
        state.analyses.length
      ) {

        state.currentReport =
          state.analyses[0];


        renderReport(
          state.currentReport
        );

      } else {

        renderReportEmpty();
      }

    }
  );
}


/* =========================================================
   159. STORAGE IMAGE WARNING
========================================================= */

function checkStorageSupport() {

  try {

    const key =
      "__sc_test__";


    localStorage.setItem(
      key,
      "1"
    );


    localStorage.removeItem(
      key
    );


    return true;

  } catch {

    return false;
  }
}


/* =========================================================
   160. FINAL SYSTEM START
========================================================= */

function initializeFinalSystem() {

  bindFinalEvents();

  bindAnalysisOptionSync();

  bindVideoEndAnalysis();

  bindStopFinalization();

  installReportNavigationHook();

  syncSettingsControls();

  renderRecords();

  updateDashboard();


  if (
    state.currentReport
  ) {

    renderReport(
      state.currentReport
    );

  } else {

    renderReportEmpty();
  }


  if (
    !checkStorageSupport()
  ) {

    console.warn(
      "[SYSTEM] localStorage unavailable"
    );
  }


  console.log(
    "[APP] Final report system initialized"
  );
}


/* =========================================================
   161. SAFE FINAL BOOT

   PART 1의 기본 부팅이 끝난 뒤
   마지막 기능들을 연결.
========================================================= */

function finalBoot() {

  try {

    initializeFinalSystem();


    const bootStatus =
      $("bootStatus");


    if (bootStatus) {

      bootStatus.classList.add(
        "hidden"
      );
    }


    if (
      $("systemStatusText")
    ) {

      $("systemStatusText")
        .textContent =
        "SYSTEM READY";
    }


    console.log(
      "=================================="
    );

    console.log(
      "SEOLCHEON PE PERFORMANCE LAB"
    );

    console.log(
      "FINAL 3.0 READY"
    );

    console.log(
      "=================================="
    );

  } catch (error) {

    console.error(
      "[FINAL BOOT ERROR]",
      error
    );


    const bootStatus =
      $("bootStatus");


    if (bootStatus) {

      bootStatus.textContent =
        "SYSTEM ERROR - 개발자 콘솔을 확인하세요.";

      bootStatus.classList.remove(
        "hidden"
      );
    }
  }
}


/* =========================================================
   162. DOM READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setTimeout(
        finalBoot,
        100
      );

    }
  );

} else {

  setTimeout(
    finalBoot,
    100
  );
}


/* =========================================================
   163. DEBUG API

   브라우저 콘솔에서 상태 확인 가능.

   SC_DEBUG.state()
   SC_DEBUG.page("analysis")
========================================================= */

window.SC_DEBUG = {

  state() {

    console.log(
      state
    );

    return state;
  },


  page(name) {

    navigateTo(name);

  },


  analyses() {

    console.table(
      state.analyses.map(
        analysis => ({

          athlete:
            analysis.athleteName,

          event:
            analysis.eventName,

          score:
            analysis.score,

          frames:
            analysis.frameCount

        })
      )
    );

  },


  clearAnalyses() {

    state.analyses = [];

    saveAnalyses();

    renderRecords();

    updateDashboard();

  }

};


/* =========================================================
   164. FINAL READY
========================================================= */

console.log(
  "[APP] PART 3 / 3 loaded"
);