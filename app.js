 /* =========================================================
   설천고 체대입시 PERFORMANCE LAB
   APP.JS
   PART 4 / 4

   CORE
   - 페이지 이동
   - 모바일 메뉴
   - 선수 등록 / 선택
   - 측정 기록
   - 실기 종목 연결
   - 분석 기록
   - 체대입시 리포트
   - 대학 목표 관리
   - 대시보드
   - Chart.js
   - LocalStorage
   - 데이터 백업 / 복원
========================================================= */

"use strict";


/* =========================================================
   01. CONFIG
========================================================= */

const APP_CONFIG = {

  name: "설천고 체대입시 PERFORMANCE LAB",

  version: "2.0.0",

  storage: {

    athletes:
      "pe_athletes",

    records:
      "pe_records",

    targets:
      "pe_university_targets",

    settings:
      "pe_settings",

    selectedAthlete:
      "pe_selected_athlete"

  }

};


/* =========================================================
   02. STATE
========================================================= */

const APP_STATE = {

  athletes: [],

  records: [],

  universityTargets: [],

  settings: {},

  selectedAthleteId: null,

  currentPage: "dashboard",

  charts: {

    radar: null,

    trend: null,

    reportRadar: null

  }

};


/* =========================================================
   03. DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadAppData();

    initNavigation();

    initMobileMenu();

    initClock();

    initAthleteSystem();

    initMeasurementSystem();

    initRecordSystem();

    initUniversitySystem();

    initReportSystem();

    initDataSystem();

    initCharts();

    refreshAllUI();

  }
);


/* =========================================================
   04. STORAGE
========================================================= */

function loadAppData() {

  APP_STATE.athletes =
    readStorage(
      APP_CONFIG.storage.athletes,
      []
    );


  APP_STATE.records =
    readStorage(
      APP_CONFIG.storage.records,
      []
    );


  APP_STATE.universityTargets =
    readStorage(
      APP_CONFIG.storage.targets,
      []
    );


  APP_STATE.settings =
    readStorage(
      APP_CONFIG.storage.settings,
      {}
    );


  APP_STATE.selectedAthleteId =
    localStorage.getItem(
      APP_CONFIG.storage.selectedAthlete
    );

}


function readStorage(key, fallback) {

  try {

    const raw =
      localStorage.getItem(key);


    if (!raw) {

      return fallback;

    }


    return JSON.parse(raw);

  }

  catch (error) {

    console.error(
      "Storage read error:",
      error
    );


    return fallback;

  }

}


function saveAthletes() {

  localStorage.setItem(
    APP_CONFIG.storage.athletes,
    JSON.stringify(
      APP_STATE.athletes
    )
  );

}


function saveRecords() {

  localStorage.setItem(
    APP_CONFIG.storage.records,
    JSON.stringify(
      APP_STATE.records
    )
  );

}


function saveTargets() {

  localStorage.setItem(
    APP_CONFIG.storage.targets,
    JSON.stringify(
      APP_STATE.universityTargets
    )
  );

}


function saveSettings() {

  localStorage.setItem(
    APP_CONFIG.storage.settings,
    JSON.stringify(
      APP_STATE.settings
    )
  );

}


/* =========================================================
   05. ID
========================================================= */

function createId(prefix = "id") {

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
   06. PAGE NAVIGATION
========================================================= */

function initNavigation() {

  document
    .querySelectorAll(
      "[data-page]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showPage(
            button.dataset.page
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-page-target]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showPage(
            button.dataset.pageTarget
          );

        }
      );

    });

}


function showPage(pageName) {

  const target =
    document.getElementById(
      `page-${pageName}`
    );


  if (!target) {

    console.warn(
      `page-${pageName} 없음`
    );

    return;

  }


  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove(
        "active"
      );

    });


  target.classList.add(
    "active"
  );


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page ===
          pageName
      );

    });


  APP_STATE.currentPage =
    pageName;


  closeMobileSidebar();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (
    pageName === "dashboard"
  ) {

    refreshDashboard();

  }


  if (
    pageName === "records"
  ) {

    renderRecords();

  }


  if (
    pageName === "report"
  ) {

    refreshReportSelect();

  }

}


window.showPage =
  showPage;


/* =========================================================
   07. MOBILE SIDEBAR
========================================================= */

function initMobileMenu() {

  const button =
    document.getElementById(
      "mobileMenuBtn"
    );


  const sidebar =
    document.getElementById(
      "sidebar"
    );


  if (
    !button ||
    !sidebar
  ) {

    return;

  }


  button.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "mobile-open"
      );

    }
  );

}


function closeMobileSidebar() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );


  if (!sidebar) return;


  sidebar.classList.remove(
    "mobile-open"
  );

}


/* =========================================================
   08. CLOCK
========================================================= */

function initClock() {

  updateClock();


  setInterval(
    updateClock,
    1000
  );

}


function updateClock() {

  const now =
    new Date();


  const date =
    document.getElementById(
      "headerDate"
    );


  const time =
    document.getElementById(
      "headerTime"
    );


  if (date) {

    date.textContent =
      now.toLocaleDateString(
        "ko-KR"
      );

  }


  if (time) {

    time.textContent =
      now.toLocaleTimeString(
        "ko-KR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );

  }

}


/* =========================================================
   09. ATHLETE SYSTEM
========================================================= */

function initAthleteSystem() {

  const form =
    document.getElementById(
      "athleteForm"
    );


  if (form) {

    form.addEventListener(
      "submit",
      handleAthleteSubmit
    );

  }


  const search =
    document.getElementById(
      "athleteSearch"
    );


  if (search) {

    search.addEventListener(
      "input",
      renderAthletes
    );

  }

}


function handleAthleteSubmit(event) {

  event.preventDefault();


  const name =
    valueOf(
      "athleteName"
    ).trim();


  if (!name) {

    showToast(
      "선수 이름을 입력하세요."
    );

    return;

  }


  const athlete = {

    id:
      createId("athlete"),

    name,

    birth:
      valueOf(
        "athleteBirth"
      ),

    sport:
      valueOf(
        "athleteSport"
      ),

    height:
      numberValue(
        "athleteHeight"
      ),

    weight:
      numberValue(
        "athleteWeight"
      ),

    group:
      valueOf(
        "athleteGroup"
      ),

    memo:
      valueOf(
        "athleteMemo"
      ),

    createdAt:
      new Date().toISOString()

  };


  APP_STATE.athletes.push(
    athlete
  );


  APP_STATE.selectedAthleteId =
    athlete.id;


  localStorage.setItem(
    APP_CONFIG.storage.selectedAthlete,
    athlete.id
  );


  saveAthletes();


  event.target.reset();


  refreshAllUI();


  showToast(
    `${athlete.name} 선수 등록 완료`
  );

}


function renderAthletes() {

  const container =
    document.getElementById(
      "athleteList"
    );


  if (!container) return;


  const keyword =
    valueOf(
      "athleteSearch"
    )
      .trim()
      .toLowerCase();


  const filtered =
    APP_STATE.athletes.filter(
      athlete => {

        return (

          !keyword ||

          athlete.name
            .toLowerCase()
            .includes(keyword) ||

          (athlete.sport || "")
            .toLowerCase()
            .includes(keyword)

        );

      }
    );


  if (!filtered.length) {

    container.innerHTML = `

      <div class="empty-state">

        등록된 선수가 없습니다.

      </div>

    `;

    return;

  }


  container.innerHTML =
    filtered
      .map(
        athlete => {

          const active =
            athlete.id ===
            APP_STATE.selectedAthleteId;


          return `

            <article
              class="athlete-list-card
              ${active ? "active" : ""}"
              data-athlete-id="${athlete.id}"
            >

              <div class="athlete-avatar">

                👤

              </div>


              <div class="athlete-list-info">

                <strong>

                  ${escapeHTML(
                    athlete.name
                  )}

                </strong>

                <span>

                  ${escapeHTML(
                    athlete.sport ||
                    "종목 미입력"
                  )}

                </span>

                <small>

                  ${
                    athlete.height ||
                    "-"
                  } cm ·
                  ${
                    athlete.weight ||
                    "-"
                  } kg

                </small>

              </div>


              <div class="athlete-card-actions">

                <button
                  data-athlete-select="${athlete.id}"
                  type="button"
                >

                  선택

                </button>


                <button
                  data-athlete-delete="${athlete.id}"
                  type="button"
                >

                  삭제

                </button>

              </div>

            </article>

          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      "[data-athlete-select]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          selectAthlete(
            button.dataset.athleteSelect
          );

        }
      );

    });


  container
    .querySelectorAll(
      "[data-athlete-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          deleteAthlete(
            button.dataset.athleteDelete
          );

        }
      );

    });

}


function selectAthlete(id) {

  const athlete =
    getAthlete(id);


  if (!athlete) return;


  APP_STATE.selectedAthleteId =
    id;


  localStorage.setItem(
    APP_CONFIG.storage.selectedAthlete,
    id
  );


  refreshAllUI();


  showToast(
    `${athlete.name} 선수 선택`
  );

}


function deleteAthlete(id) {

  const athlete =
    getAthlete(id);


  if (!athlete) return;


  const confirmed =
    confirm(
      `${athlete.name} 선수를 삭제할까요?`
    );


  if (!confirmed) return;


  APP_STATE.athletes =
    APP_STATE.athletes.filter(
      item =>
        item.id !== id
    );


  if (
    APP_STATE.selectedAthleteId ===
    id
  ) {

    APP_STATE.selectedAthleteId =
      APP_STATE.athletes[0]?.id ||
      null;

  }


  saveAthletes();


  if (
    APP_STATE.selectedAthleteId
  ) {

    localStorage.setItem(
      APP_CONFIG.storage.selectedAthlete,
      APP_STATE.selectedAthleteId
    );

  }

  else {

    localStorage.removeItem(
      APP_CONFIG.storage.selectedAthlete
    );

  }


  refreshAllUI();


  showToast(
    "선수를 삭제했습니다."
  );

}


function getAthlete(id) {

  return APP_STATE.athletes.find(
    athlete =>
      athlete.id === id
  );

}


function getSelectedAthlete() {

  return getAthlete(
    APP_STATE.selectedAthleteId
  );

}


/* =========================================================
   10. ATHLETE SELECTS
========================================================= */

function populateAthleteSelects() {

  const ids = [

    "measurementAthlete",

    "motionAthlete",

    "reportAthlete",

    "recordAthleteFilter",

    "targetAthlete"

  ];


  ids.forEach(id => {

    const select =
      document.getElementById(id);


    if (!select) return;


    const filter =
      id ===
      "recordAthleteFilter";


    select.innerHTML =
      filter
        ? `<option value="all">전체 선수</option>`
        : `<option value="">선수 선택</option>`;


    APP_STATE.athletes.forEach(
      athlete => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          athlete.id;


        option.textContent =
          athlete.name;


        select.appendChild(
          option
        );

      }
    );


    if (
      !filter &&
      APP_STATE.selectedAthleteId
    ) {

      select.value =
        APP_STATE.selectedAthleteId;

    }

  });

}


/* =========================================================
   11. MEASUREMENT
========================================================= */

function initMeasurementSystem() {

  const save =
    document.getElementById(
      "saveMeasurementBtn"
    );


  if (save) {

    save.addEventListener(
      "click",
      saveMeasurement
    );

  }


  const eventSelect =
    document.getElementById(
      "measurementEvent"
    );


  if (eventSelect) {

    eventSelect.addEventListener(
      "change",
      () => {

        if (
          typeof window.getPEEvent !==
          "function"
        ) {

          return;

        }


        const item =
          window.getPEEvent(
            eventSelect.value
          );


        if (
          item &&
          typeof window
            .selectPEEventForMeasurement ===
            "function"
        ) {

          localStorage.setItem(
            "pe_selected_event",
            item.id
          );

        }

      }
    );

  }

}


function saveMeasurement() {

  const athleteId =
    valueOf(
      "measurementAthlete"
    ) ||
    APP_STATE.selectedAthleteId;


  const eventId =
    valueOf(
      "measurementEvent"
    );


  const result =
    numberValue(
      "measurementResult"
    );


  if (!athleteId) {

    showToast(
      "선수를 선택하세요."
    );

    return;

  }


  if (!eventId) {

    showToast(
      "실기 종목을 선택하세요."
    );

    return;

  }


  if (
    Number.isNaN(result)
  ) {

    showToast(
      "측정 기록을 입력하세요."
    );

    return;

  }


  const peEvent =
    typeof window.getPEEvent ===
    "function"
      ? window.getPEEvent(
          eventId
        )
      : null;


  if (!peEvent) {

    showToast(
      "종목 정보를 찾지 못했습니다."
    );

    return;

  }


  const athlete =
    getAthlete(
      athleteId
    );


  const previousBest =
    findBestRecord(
      athleteId,
      eventId
    );


  const isPR =
    checkPR(
      result,
      previousBest?.result,
      peEvent
    );


  const record = {

    id:
      createId("record"),

    athleteId,

    athleteName:
      athlete?.name || "-",

    eventId,

    eventName:
      peEvent.name,

    category:
      peEvent.category,

    ability:
      peEvent.ability,

    result,

    unit:
      peEvent.unit,

    score:
      calculatePerformanceScore(
        result,
        peEvent
      ),

    isPR,

    type:
      "measurement",

    createdAt:
      new Date().toISOString()

  };


  APP_STATE.records.push(
    record
  );


  saveRecords();


  refreshAllUI();


  showToast(
    isPR
      ? `🔥 NEW PR! ${result}${peEvent.unit}`
      : "측정 기록 저장 완료"
  );

}


/* =========================================================
   12. BEST RECORD
========================================================= */

function findBestRecord(
  athleteId,
  eventId
) {

  const records =
    APP_STATE.records.filter(
      record =>
        record.athleteId ===
          athleteId &&
        record.eventId ===
          eventId
    );


  if (!records.length) {

    return null;

  }


  const peEvent =
    typeof window.getPEEvent ===
    "function"
      ? window.getPEEvent(
          eventId
        )
      : null;


  if (!peEvent) {

    return records[0];

  }


  return records.reduce(
    (best, current) => {

      if (!best) {

        return current;

      }


      if (
        peEvent.measurementType ===
        "time"
      ) {

        return (
          current.result <
          best.result
        )
          ? current
          : best;

      }


      return (
        current.result >
        best.result
      )
        ? current
        : best;

    },
    null
  );

}


function checkPR(
  result,
  previous,
  peEvent
) {

  if (
    previous === undefined ||
    previous === null
  ) {

    return true;

  }


  if (
    peEvent.measurementType ===
    "time"
  ) {

    return result < previous;

  }


  return result > previous;

}


/* =========================================================
   13. SCORE

   실제 대학별 점수표가 아니라
   앱 내부 퍼포먼스 표시용 상대점수.
========================================================= */

function calculatePerformanceScore(
  result,
  peEvent
) {

  if (!peEvent) return 0;


  let score = 70;


  switch (
    peEvent.measurementType
  ) {

    case "time":

      score =
        100 -
        result * 2;

      break;


    case "distance":

      score =
        result > 20
          ? result / 3
          : result * 8;

      break;


    case "height":

      score =
        result * 1.5;

      break;


    case "count":

      score =
        result * 2;

      break;


    case "weight":

      score =
        result;

      break;


    case "score":

      score =
        result;

      break;

  }


  return clamp(
    Math.round(score),
    0,
    100
  );

}


/* =========================================================
   14. RECORD SYSTEM
========================================================= */

function initRecordSystem() {

  [

    "recordAthleteFilter",

    "recordEventFilter",

    "recordSearch"

  ]
    .forEach(id => {

      const element =
        document.getElementById(id);


      if (!element) return;


      element.addEventListener(
        id === "recordSearch"
          ? "input"
          : "change",
        renderRecords
      );

    });


  const csv =
    document.getElementById(
      "exportCSVBtn"
    );


  if (csv) {

    csv.addEventListener(
      "click",
      exportRecordsCSV
    );

  }

}


function renderRecords() {

  const body =
    document.getElementById(
      "recordsTableBody"
    );


  if (!body) return;


  const athleteFilter =
    valueOf(
      "recordAthleteFilter"
    ) || "all";


  const eventFilter =
    valueOf(
      "recordEventFilter"
    ) || "all";


  const search =
    valueOf(
      "recordSearch"
    )
      .trim()
      .toLowerCase();


  const filtered =
    [...APP_STATE.records]
      .reverse()
      .filter(record => {

        const athleteMatch =
          athleteFilter === "all" ||
          record.athleteId ===
            athleteFilter;


        const eventMatch =
          eventFilter === "all" ||
          record.eventId ===
            eventFilter;


        const searchMatch =
          !search ||
          `${record.athleteName} ${record.eventName}`
            .toLowerCase()
            .includes(search);


        return (
          athleteMatch &&
          eventMatch &&
          searchMatch
        );

      });


  if (!filtered.length) {

    body.innerHTML = `

      <tr>

        <td
          colspan="8"
          class="empty-table"
        >

          저장된 기록이 없습니다.

        </td>

      </tr>

    `;

    return;

  }


  body.innerHTML =
    filtered
      .map(
        record => `

          <tr>

            <td>

              ${formatDate(
                record.createdAt
              )}

            </td>

            <td>

              ${escapeHTML(
                record.athleteName
              )}

            </td>

            <td>

              ${escapeHTML(
                record.eventName
              )}

            </td>

            <td>

              ${record.result}
              ${record.unit || ""}

            </td>

            <td>

              ${record.score ?? "-"}

            </td>

            <td>

              ${
                record.isPR
                  ? "🏆 PR"
                  : "-"
              }

            </td>

            <td>

              ${
                record.type ===
                "motion"
                  ? "AI"
                  : "기록"
              }

            </td>

            <td>

              <button
                class="table-action"
                data-record-delete="${record.id}"
              >

                삭제

              </button>

            </td>

          </tr>

        `
      )
      .join("");


  body
    .querySelectorAll(
      "[data-record-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteRecord(
            button.dataset.recordDelete
          );

        }
      );

    });

}


function deleteRecord(id) {

  if (
    !confirm(
      "이 기록을 삭제할까요?"
    )
  ) {

    return;

  }


  APP_STATE.records =
    APP_STATE.records.filter(
      record =>
        record.id !== id
    );


  saveRecords();


  refreshAllUI();


  showToast(
    "기록 삭제 완료"
  );

}


/* =========================================================
   15. CSV
========================================================= */

function exportRecordsCSV() {

  if (
    !APP_STATE.records.length
  ) {

    showToast(
      "저장된 기록이 없습니다."
    );

    return;

  }


  const rows = [

    [
      "측정일",
      "선수",
      "종목",
      "결과",
      "단위",
      "점수",
      "PR"
    ]

  ];


  APP_STATE.records.forEach(
    record => {

      rows.push([

        formatDate(
          record.createdAt
        ),

        record.athleteName,

        record.eventName,

        record.result,

        record.unit,

        record.score,

        record.isPR
          ? "YES"
          : "NO"

      ]);

    }
  );


  const csv =
    "\uFEFF" +
    rows
      .map(row =>
        row
          .map(csvEscape)
          .join(",")
      )
      .join("\n");


  downloadBlob(
    csv,
    "seolcheon_pe_records.csv",
    "text/csv;charset=utf-8"
  );

}


/* =========================================================
   16. UNIVERSITY TARGET
========================================================= */

function initUniversitySystem() {

  const button =
    document.getElementById(
      "saveTargetUniversityBtn"
    );


  if (button) {

    button.addEventListener(
      "click",
      saveUniversityTarget
    );

  }

}


function saveUniversityTarget() {

  const athleteId =
    valueOf(
      "targetAthlete"
    ) ||
    APP_STATE.selectedAthleteId;


  const university =
    valueOf(
      "targetUniversity"
    ).trim();


  const department =
    valueOf(
      "targetDepartment"
    ).trim();


  if (!athleteId) {

    showToast(
      "선수를 선택하세요."
    );

    return;

  }


  if (!university) {

    showToast(
      "목표 대학을 입력하세요."
    );

    return;

  }


  const existing =
    APP_STATE.universityTargets
      .find(
        item =>
          item.athleteId ===
          athleteId
      );


  if (existing) {

    existing.university =
      university;

    existing.department =
      department;

    existing.updatedAt =
      new Date().toISOString();

  }

  else {

    APP_STATE
      .universityTargets
      .push({

        id:
          createId("target"),

        athleteId,

        university,

        department,

        createdAt:
          new Date().toISOString()

      });

  }


  saveTargets();


  renderUniversityTarget();


  showToast(
    "목표 대학 저장 완료"
  );

}


function renderUniversityTarget() {

  const athlete =
    getSelectedAthlete();


  const target =
    APP_STATE.universityTargets
      .find(
        item =>
          item.athleteId ===
          athlete?.id
      );


  setText(
    "dashboardTargetUniversity",
    target
      ? target.university
      : "-"
  );


  setText(
    "dashboardTargetDepartment",
    target
      ? target.department || "-"
      : "-"
  );

}


/* =========================================================
   17. DASHBOARD
========================================================= */

function refreshDashboard() {

  setText(
    "dashboardAthleteCount",
    APP_STATE.athletes.length
  );


  setText(
    "dashboardRecordCount",
    APP_STATE.records.length
  );


  const scores =
    APP_STATE.records
      .map(record =>
        Number(record.score)
      )
      .filter(Number.isFinite);


  const average =
    scores.length
      ? Math.round(
          scores.reduce(
            (a, b) => a + b,
            0
          ) / scores.length
        )
      : null;


  setText(
    "dashboardAverageScore",
    average ?? "--"
  );


  setText(
    "dashboardPRCount",
    APP_STATE.records.filter(
      record =>
        record.isPR
    ).length
  );


  const athlete =
    getSelectedAthlete();


  setText(
    "dashboardAthleteName",
    athlete?.name ||
      "선수 미선택"
  );


  setText(
    "dashboardAthleteSport",
    athlete?.sport || "-"
  );


  setText(
    "dashboardHeight",
    athlete?.height
      ? `${athlete.height} cm`
      : "-"
  );


  setText(
    "dashboardWeight",
    athlete?.weight
      ? `${athlete.weight} kg`
      : "-"
  );


  const athleteRecords =
    APP_STATE.records.filter(
      record =>
        record.athleteId ===
        athlete?.id
    );


  const latest =
    athleteRecords.at(-1);


  setText(
    "dashboardLatestScore",
    latest?.score ?? "-"
  );


  renderDashboardRecent(
    athleteRecords
  );


  renderDashboardPR(
    athleteRecords
  );


  renderUniversityTarget();


  updatePerformanceRadar(
    athleteRecords
  );


  updateTrendChart(
    athleteRecords
  );

}


/* =========================================================
   18. RECENT
========================================================= */

function renderDashboardRecent(
  records
) {

  const container =
    document.getElementById(
      "dashboardRecentList"
    );


  if (!container) return;


  const recent =
    [...records]
      .reverse()
      .slice(0, 5);


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

          <div class="recent-item">

            <div>

              <strong>

                ${escapeHTML(
                  record.eventName
                )}

              </strong>

              <span>

                ${formatDate(
                  record.createdAt
                )}

              </span>

            </div>


            <strong>

              ${record.result}
              ${record.unit || ""}

            </strong>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   19. PR LIST
========================================================= */

function renderDashboardPR(
  records
) {

  const container =
    document.getElementById(
      "dashboardPRList"
    );


  if (!container) return;


  const prs =
    [...records]
      .filter(
        record =>
          record.isPR
      )
      .reverse()
      .slice(0, 5);


  if (!prs.length) {

    container.innerHTML = `

      <div class="empty-state">

        기록된 PR이 없습니다.

      </div>

    `;

    return;

  }


  container.innerHTML =
    prs
      .map(
        record => `

          <div class="pr-item">

            <span>

              🏆
              ${escapeHTML(
                record.eventName
              )}

            </span>


            <strong>

              ${record.result}
              ${record.unit || ""}

            </strong>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   20. CHARTS
========================================================= */

function initCharts() {

  if (
    typeof Chart ===
    "undefined"
  ) {

    console.warn(
      "Chart.js 없음"
    );

    return;

  }


  initDashboardRadar();

  initTrendChart();

}


function initDashboardRadar() {

  const canvas =
    document.getElementById(
      "performanceRadar"
    );


  if (!canvas) return;


  APP_STATE.charts.radar =
    new Chart(
      canvas,
      {

        type: "radar",

        data: {

          labels: [

            "스피드",

            "순발력",

            "민첩성",

            "근력",

            "지구력",

            "기술"

          ],

          datasets: [

            {

              label:
                "PERFORMANCE",

              data:
                [0, 0, 0, 0, 0, 0],

              borderWidth:
                2,

              pointRadius:
                3,

              fill:
                true

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

              beginAtZero:
                true,

              max:
                100,

              ticks: {

                display:
                  false

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


function updatePerformanceRadar(
  records
) {

  if (
    !APP_STATE.charts.radar
  ) {

    return;

  }


  const categoryScores = {

    sprint: [],

    jump: [],

    agility: [],

    strength: [],

    endurance: [],

    technique: []

  };


  records.forEach(record => {

    const score =
      Number(record.score);


    if (
      !Number.isFinite(score)
    ) {

      return;

    }


    if (
      record.category ===
      "sprint"
    ) {

      categoryScores.sprint.push(
        score
      );

    }


    if (
      record.category ===
      "jump" ||
      record.category ===
      "power" ||
      record.category ===
      "throw"
    ) {

      categoryScores.jump.push(
        score
      );

    }


    if (
      record.category ===
      "agility" ||
      record.category ===
      "balance"
    ) {

      categoryScores.agility.push(
        score
      );

    }


    if (
      record.category ===
      "strength" ||
      record.category ===
      "bodyweight"
    ) {

      categoryScores.strength.push(
        score
      );

    }


    if (
      record.category ===
      "endurance"
    ) {

      categoryScores.endurance.push(
        score
      );

    }


    if (
      record.category ===
      "ball" ||
      record.type ===
      "motion"
    ) {

      categoryScores.technique.push(
        score
      );

    }

  });


  const values = [

    averageArray(
      categoryScores.sprint
    ),

    averageArray(
      categoryScores.jump
    ),

    averageArray(
      categoryScores.agility
    ),

    averageArray(
      categoryScores.strength
    ),

    averageArray(
      categoryScores.endurance
    ),

    averageArray(
      categoryScores.technique
    )

  ];


  APP_STATE
    .charts
    .radar
    .data
    .datasets[0]
    .data =
      values;


  APP_STATE
    .charts
    .radar
    .update();

}


/* =========================================================
   21. TREND CHART
========================================================= */

function initTrendChart() {

  const canvas =
    document.getElementById(
      "performanceTrendChart"
    );


  if (!canvas) return;


  APP_STATE.charts.trend =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels: [],

          datasets: [

            {

              label:
                "퍼포먼스 점수",

              data: [],

              tension:
                0.3,

              borderWidth:
                2,

              pointRadius:
                3

            }

          ]

        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          scales: {

            y: {

              min:
                0,

              max:
                100

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


function updateTrendChart(
  records
) {

  if (
    !APP_STATE.charts.trend
  ) {

    return;

  }


  const recent =
    records.slice(-14);


  APP_STATE
    .charts
    .trend
    .data
    .labels =
      recent.map(
        record =>
          formatShortDate(
            record.createdAt
          )
      );


  APP_STATE
    .charts
    .trend
    .data
    .datasets[0]
    .data =
      recent.map(
        record =>
          record.score || 0
      );


  APP_STATE
    .charts
    .trend
    .update();

}


/* =========================================================
   22. REPORT
========================================================= */

function initReportSystem() {

  const generate =
    document.getElementById(
      "generateReportBtn"
    );


  if (generate) {

    generate.addEventListener(
      "click",
      generateReport
    );

  }


  const print =
    document.getElementById(
      "printReportBtn"
    );


  if (print) {

    print.addEventListener(
      "click",
      () => {

        window.print();

      }
    );

  }

}


function refreshReportSelect() {

  const select =
    document.getElementById(
      "reportAthlete"
    );


  if (
    select &&
    APP_STATE.selectedAthleteId
  ) {

    select.value =
      APP_STATE.selectedAthleteId;

  }

}


function generateReport() {

  const athleteId =
    valueOf(
      "reportAthlete"
    ) ||
    APP_STATE.selectedAthleteId;


  const athlete =
    getAthlete(
      athleteId
    );


  if (!athlete) {

    showToast(
      "선수를 선택하세요."
    );

    return;

  }


  const records =
    APP_STATE.records.filter(
      record =>
        record.athleteId ===
        athlete.id
    );


  const scores =
    records
      .map(record =>
        Number(record.score)
      )
      .filter(Number.isFinite);


  const overall =
    scores.length
      ? Math.round(
          scores.reduce(
            (a, b) => a + b,
            0
          ) /
          scores.length
        )
      : 0;


  setText(
    "reportAthleteName",
    athlete.name
  );


  setText(
    "reportSport",
    athlete.sport || "-"
  );


  setText(
    "reportHeight",
    athlete.height
      ? `${athlete.height} cm`
      : "-"
  );


  setText(
    "reportWeight",
    athlete.weight
      ? `${athlete.weight} kg`
      : "-"
  );


  setText(
    "reportOverallScore",
    overall
  );


  setText(
    "reportGeneratedDate",
    new Date()
      .toLocaleString(
        "ko-KR"
      )
  );


  const latest =
    records.at(-1);


  setText(
    "reportExerciseName",
    latest?.eventName ||
      "측정 기록 없음"
  );


  const peEvent =
    latest &&
    typeof window.getPEEvent ===
      "function"
      ? window.getPEEvent(
          latest.eventId
        )
      : null;


  setText(
    "reportExercisePictogram",
    peEvent?.icon || "🏃"
  );


  setText(
    "reportExerciseCategory",
    peEvent?.ability || "-"
  );


  generateReportRadar(
    records
  );


  generateReportRecommendations(
    records
  );


  showToast(
    "리포트를 생성했습니다."
  );

}


/* =========================================================
   23. REPORT RADAR
========================================================= */

function generateReportRadar(
  records
) {

  if (
    typeof Chart ===
    "undefined"
  ) {

    return;

  }


  const canvas =
    document.getElementById(
      "reportRadarChart"
    );


  if (!canvas) return;


  if (
    APP_STATE.charts.reportRadar
  ) {

    APP_STATE
      .charts
      .reportRadar
      .destroy();

  }


  const scores =
    records
      .slice(-6)
      .map(
        record =>
          record.score || 0
      );


  while (
    scores.length < 6
  ) {

    scores.push(0);

  }


  APP_STATE.charts.reportRadar =
    new Chart(
      canvas,
      {

        type: "radar",

        data: {

          labels: [

            "스피드",

            "파워",

            "민첩성",

            "근력",

            "지구력",

            "기술"

          ],

          datasets: [

            {

              data:
                scores.slice(
                  0,
                  6
                ),

              fill:
                true,

              borderWidth:
                2

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
                100

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
   24. REPORT RECOMMENDATIONS
========================================================= */

function generateReportRecommendations(
  records
) {

  const container =
    document.getElementById(
      "reportRecommendations"
    );


  if (!container) return;


  if (!records.length) {

    container.innerHTML =
      "측정 기록이 없습니다.";

    return;

  }


  const sorted =
    [...records]
      .filter(record =>
        Number.isFinite(
          Number(record.score)
        )
      )
      .sort(
        (a, b) =>
          a.score - b.score
      );


  const weak =
    sorted.slice(0, 3);


  container.innerHTML =
    weak
      .map(
        record => `

          <div class="report-recommendation-item">

            <strong>

              ${escapeHTML(
                record.eventName
              )}

            </strong>

            <p>

              현재 퍼포먼스 점수
              ${record.score}/100.
              해당 능력을 우선적으로
              보완하는 훈련을 권장합니다.

            </p>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   25. DATA BACKUP
========================================================= */

function initDataSystem() {

  const backup =
    document.getElementById(
      "backupDataBtn"
    );


  if (backup) {

    backup.addEventListener(
      "click",
      backupData
    );

  }


  const restore =
    document.getElementById(
      "restoreDataInput"
    );


  if (restore) {

    restore.addEventListener(
      "change",
      restoreData
    );

  }


  const clear =
    document.getElementById(
      "clearDataBtn"
    );


  if (clear) {

    clear.addEventListener(
      "click",
      clearAllData
    );

  }

}


function backupData() {

  const data = {

    app:
      APP_CONFIG.name,

    version:
      APP_CONFIG.version,

    exportedAt:
      new Date().toISOString(),

    athletes:
      APP_STATE.athletes,

    records:
      APP_STATE.records,

    universityTargets:
      APP_STATE.universityTargets,

    settings:
      APP_STATE.settings

  };


  downloadBlob(
    JSON.stringify(
      data,
      null,
      2
    ),
    "seolcheon_pe_backup.json",
    "application/json"
  );

}


function restoreData(event) {

  const file =
    event.target.files?.[0];


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    () => {

      try {

        const data =
          JSON.parse(
            reader.result
          );


        APP_STATE.athletes =
          Array.isArray(
            data.athletes
          )
            ? data.athletes
            : [];


        APP_STATE.records =
          Array.isArray(
            data.records
          )
            ? data.records
            : [];


        APP_STATE.universityTargets =
          Array.isArray(
            data.universityTargets
          )
            ? data.universityTargets
            : [];


        APP_STATE.settings =
          data.settings || {};


        saveAthletes();

        saveRecords();

        saveTargets();

        saveSettings();


        refreshAllUI();


        showToast(
          "데이터 복원 완료"
        );

      }

      catch (error) {

        console.error(error);


        showToast(
          "백업 파일을 읽을 수 없습니다."
        );

      }

    };


  reader.readAsText(file);

}


/* =========================================================
   26. CLEAR DATA
========================================================= */

function clearAllData() {

  const confirmed =
    confirm(
      "선수와 기록 데이터를 모두 삭제할까요?"
    );


  if (!confirmed) return;


  Object.values(
    APP_CONFIG.storage
  ).forEach(key => {

    localStorage.removeItem(
      key
    );

  });


  APP_STATE.athletes =
    [];

  APP_STATE.records =
    [];

  APP_STATE.universityTargets =
    [];

  APP_STATE.settings =
    {};

  APP_STATE.selectedAthleteId =
    null;


  refreshAllUI();


  showToast(
    "데이터를 초기화했습니다."
  );

}


/* =========================================================
   27. REFRESH ALL
========================================================= */

function refreshAllUI() {

  populateAthleteSelects();

  renderAthletes();

  renderRecords();

  refreshDashboard();

  refreshReportSelect();

}


/* =========================================================
   28. HELPER
========================================================= */

function valueOf(id) {

  const element =
    document.getElementById(id);


  if (!element) {

    return "";

  }


  return element.value || "";

}


function numberValue(id) {

  const raw =
    valueOf(id);


  if (
    raw === ""
  ) {

    return NaN;

  }


  return Number(raw);

}


function setText(id, value) {

  const element =
    document.getElementById(id);


  if (!element) return;


  element.textContent =
    value ?? "-";

}


function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


function averageArray(array) {

  if (!array.length) {

    return 0;

  }


  return Math.round(

    array.reduce(
      (a, b) =>
        a + b,
      0
    ) /

    array.length

  );

}


/* =========================================================
   29. DATE
========================================================= */

function formatDate(value) {

  if (!value) return "-";


  return new Date(value)
    .toLocaleString(
      "ko-KR",
      {

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        minute:
          "2-digit"

      }
    );

}


function formatShortDate(value) {

  if (!value) return "-";


  const date =
    new Date(value);


  return (
    `${date.getMonth() + 1}/` +
    `${date.getDate()}`
  );

}


/* =========================================================
   30. ESCAPE HTML
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
   31. CSV ESCAPE
========================================================= */

function csvEscape(value) {

  const text =
    String(
      value ?? ""
    );


  return (
    '"' +
    text.replaceAll(
      '"',
      '""'
    ) +
    '"'
  );

}


/* =========================================================
   32. DOWNLOAD
========================================================= */

function downloadBlob(
  content,
  filename,
  type
) {

  const blob =
    new Blob(
      [content],
      {
        type
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const anchor =
    document.createElement(
      "a"
    );


  anchor.href =
    url;


  anchor.download =
    filename;


  document.body.appendChild(
    anchor
  );


  anchor.click();


  anchor.remove();


  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );

}


/* =========================================================
   33. TOAST
========================================================= */

function appToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {

    console.log(message);

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    appToast.timer
  );


  appToast.timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


window.appToast =
  appToast;


/* =========================================================
   34. MOTION RESULT API

   나중에 motion.js가 분석 완료하면
   이 함수에 결과를 넘기면 자동 저장 가능.
========================================================= */

window.saveMotionAnalysisResult =
  function (data) {

    const athleteId =
      data.athleteId ||
      APP_STATE.selectedAthleteId;


    if (!athleteId) {

      showToast(
        "선수를 먼저 선택하세요."
      );

      return false;

    }


    const athlete =
      getAthlete(
        athleteId
      );


    const peEvent =
      typeof window.getPEEvent ===
      "function"
        ? window.getPEEvent(
            data.eventId
          )
        : null;


    const record = {

      id:
        createId("motion"),

      athleteId,

      athleteName:
        athlete?.name || "-",

      eventId:
        data.eventId,

      eventName:
        peEvent?.name ||
        data.eventName ||
        "AI 자세분석",

      category:
        peEvent?.category ||
        "special",

      ability:
        peEvent?.ability ||
        "기술",

      result:
        data.result ?? "-",

      unit:
        data.unit || "",

      score:
        clamp(
          Math.round(
            Number(
              data.score
            ) || 0
          ),
          0,
          100
        ),

      symmetry:
        data.symmetry ?? null,

      stability:
        data.stability ?? null,

      mobility:
        data.mobility ?? null,

      technique:
        data.technique ?? null,

      angles:
        data.angles || {},

      reps:
        data.reps ?? 0,

      duration:
        data.duration ?? 0,

      type:
        "motion",

      isPR:
        false,

      createdAt:
        new Date().toISOString()

    };


    APP_STATE.records.push(
      record
    );


    saveRecords();


    refreshAllUI();


    showToast(
      "AI 자세분석 결과 저장 완료"
    );


    return true;

  };


/* =========================================================
   35. SHOW TOAST ALIAS
========================================================= */

function showToast(message) {

  appToast(message);

}


/* =========================================================
   36. GLOBAL API
========================================================= */

window.PE_APP = {

  state:
    APP_STATE,

  config:
    APP_CONFIG,

  showPage,

  refresh:
    refreshAllUI,

  getSelectedAthlete,

  getAthlete,

  saveMotionAnalysisResult:
    window.saveMotionAnalysisResult

};


/* =========================================================
   END APP.JS
========================================================= */