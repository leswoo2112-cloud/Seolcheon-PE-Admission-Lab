/* =========================================================
   설천고 PE PERFORMANCE LAB PRO
   app.js
   VERSION 3.0

   - Navigation
   - Athlete management
   - Event library
   - Video upload/player
   - MediaPipe Pose
   - Skeleton
   - Joint angles
   - COM / trajectory
   - Rep counter
   - Angle graph
   - Key frames
   - Analysis finish
   - Records
   - Report
   - Training recommendations
========================================================= */

"use strict";


/* =========================================================
   01. GLOBAL STATE
========================================================= */

const APP = {

  version: "3.0",

  storage: {
    athletes: "sc_lab_athletes_v3",
    records: "sc_lab_records_v3",
    settings: "sc_lab_settings_v3"
  },

  currentPage: "dashboard",

  athletes: [],

  records: [],

  selectedCategory: "all",

  selectedEventId: "",

  currentRecord: null,

  videoFile: null,

  videoURL: null,

  pose: null,

  poseReady: false,

  poseBusy: false,

  analysing: false,

  stopRequested: false,

  analysisTimer: null,

  analysedFrames: 0,

  validPoseFrames: 0,

  confidenceTotal: 0,

  repCount: 0,

  repState: "READY",

  previousRepState: "READY",

  trajectory: [],

  keyFrames: [],

  angleHistory: [],

  lastAutoCapture: 0,

  lastFrameTime: -1,

  chart: null,

  reportRadarChart: null,

  reportAngleChart: null,

  latestAngles: null,

  latestMetrics: null

};


/* =========================================================
   02. DOM HELPERS
========================================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
  Array.from(document.querySelectorAll(selector));


function clamp(value, min, max) {

  return Math.max(
    min,
    Math.min(max, value)
  );

}


function safeNumber(value, fallback = 0) {

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;

}


function uid() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {

    return window.crypto.randomUUID();

  }

  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );

}


function showToast(message) {

  const toast = $("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);

}


function setBootStatus(message, error = false) {

  const el = $("bootStatus");

  if (!el) {
    return;
  }

  el.textContent = message;

  el.classList.toggle(
    "error",
    error
  );

}


function hideBootStatus() {

  const el = $("bootStatus");

  if (!el) {
    return;
  }

  setTimeout(() => {

    el.classList.add("hidden");

  }, 500);

}


/* =========================================================
   03. STORAGE
========================================================= */

function loadJSON(key, fallback) {

  try {

    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);

  } catch (error) {

    console.error(
      "[STORAGE LOAD]",
      error
    );

    return fallback;

  }

}


function saveJSON(key, data) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

    return true;

  } catch (error) {

    console.error(
      "[STORAGE SAVE]",
      error
    );

    showToast(
      "저장 공간이 부족하거나 저장할 수 없습니다."
    );

    return false;

  }

}


function loadAppData() {

  APP.athletes =
    loadJSON(
      APP.storage.athletes,
      []
    );

  APP.records =
    loadJSON(
      APP.storage.records,
      []
    );

}


function saveAthletes() {

  saveJSON(
    APP.storage.athletes,
    APP.athletes
  );

}


function saveRecords() {

  saveJSON(
    APP.storage.records,
    APP.records
  );

}


/* =========================================================
   04. CLOCK
========================================================= */

function startClock() {

  function update() {

    const clock = $("clock");

    if (!clock) {
      return;
    }

    const now = new Date();

    clock.textContent =
      now.toLocaleTimeString(
        "ko-KR",
        {
          hour12: false
        }
      );

  }

  update();

  setInterval(
    update,
    1000
  );

}


/* =========================================================
   05. NAVIGATION
========================================================= */

const PAGE_TITLES = {

  dashboard:
    "대시보드",

  athletes:
    "선수 관리",

  events:
    "종목 선택",

  analysis:
    "영상 자세분석",

  records:
    "분석 기록",

  report:
    "선수 리포트",

  settings:
    "설정"

};


function goPage(pageName) {

  APP.currentPage =
    pageName;

  $$(".page").forEach(page => {

    page.classList.remove(
      "active"
    );

  });


  const target =
    document.querySelector(
      `[data-page-name="${pageName}"]`
    );

  if (target) {

    target.classList.add(
      "active"
    );

  }


  $$(".nav-button").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );

  });


  const title =
    $("pageTitle");

  if (title) {

    title.textContent =
      PAGE_TITLES[pageName] ||
      "설천고 PE PERFORMANCE LAB";

  }


  closeSidebar();


  if (pageName === "dashboard") {

    renderDashboard();

  }


  if (pageName === "athletes") {

    renderAthletes();

  }


  if (pageName === "events") {

    renderEventLibrary();

  }


  if (pageName === "records") {

    renderRecords();

  }


  if (pageName === "report") {

    renderReport();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function bindNavigation() {

  $$(".nav-button").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        goPage(
          button.dataset.page
        );

      }
    );

  });


  $("newAnalysisButton")
    ?.addEventListener(
      "click",
      () => goPage("analysis")
    );


  $("goAnalysisButton")
    ?.addEventListener(
      "click",
      () => goPage("analysis")
    );


  $("backToAnalysis")
    ?.addEventListener(
      "click",
      () => goPage("analysis")
    );

}


/* =========================================================
   06. MOBILE SIDEBAR
========================================================= */

function openSidebar() {

  $("sidebar")
    ?.classList.add("open");

  $("sidebarOverlay")
    ?.classList.add("active");

}


function closeSidebar() {

  $("sidebar")
    ?.classList.remove("open");

  $("sidebarOverlay")
    ?.classList.remove("active");

}


function bindSidebar() {

  $("menuButton")
    ?.addEventListener(
      "click",
      openSidebar
    );

  $("sidebarOverlay")
    ?.addEventListener(
      "click",
      closeSidebar
    );

}


/* =========================================================
   07. ATHLETES
========================================================= */

function bindAthleteForm() {

  $("athleteForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const name =
          $("athleteName")
            ?.value
            .trim();

        if (!name) {

          showToast(
            "선수 이름을 입력하세요."
          );

          return;

        }


        const athlete = {

          id: uid(),

          name,

          grade:
            $("athleteGrade")
              ?.value || "",

          gender:
            $("athleteGender")
              ?.value || "",

          height:
            safeNumber(
              $("athleteHeight")
                ?.value,
              0
            ),

          weight:
            safeNumber(
              $("athleteWeight")
                ?.value,
              0
            ),

          sport:
            $("athleteSport")
              ?.value
              .trim() || "",

          university:
            $("athleteUniversity")
              ?.value
              .trim() || "",

          memo:
            $("athleteMemo")
              ?.value
              .trim() || "",

          createdAt:
            new Date()
              .toISOString()

        };


        APP.athletes.push(
          athlete
        );

        saveAthletes();

        $("athleteForm")
          .reset();

        renderAthletes();

        populateAthleteSelectors();

        renderDashboard();

        showToast(
          `${athlete.name} 선수 저장 완료`
        );

      }
    );

}


function renderAthletes() {

  const list =
    $("athleteList");

  if (!list) {
    return;
  }


  $("athleteCount").textContent =
    APP.athletes.length;


  if (!APP.athletes.length) {

    list.innerHTML = `
      <div class="empty-state">
        등록된 선수가 없습니다.
      </div>
    `;

    return;

  }


  list.innerHTML =
    APP.athletes
      .map(athlete => `

        <div
          class="athlete-card"
          data-athlete-id="${athlete.id}"
        >

          <div>

            <strong>
              ${escapeHTML(athlete.name)}
            </strong>

            <p>
              ${escapeHTML(athlete.grade || "-")}
              ·
              ${escapeHTML(athlete.sport || "종목 미설정")}
            </p>

          </div>


          <div class="card-actions">

            <button
              type="button"
              data-athlete-analysis="${athlete.id}"
            >
              분석
            </button>

            <button
              type="button"
              data-athlete-delete="${athlete.id}"
            >
              삭제
            </button>

          </div>

        </div>

      `)
      .join("");


  $$("[data-athlete-analysis]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const athleteId =
            button.dataset
              .athleteAnalysis;

          if ($("analysisAthlete")) {

            $("analysisAthlete").value =
              athleteId;

          }

          goPage("analysis");

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


function deleteAthlete(id) {

  const athlete =
    APP.athletes.find(
      item => item.id === id
    );

  if (!athlete) {
    return;
  }


  const ok =
    confirm(
      `${athlete.name} 선수를 삭제할까요?`
    );

  if (!ok) {
    return;
  }


  APP.athletes =
    APP.athletes.filter(
      item => item.id !== id
    );

  saveAthletes();

  renderAthletes();

  populateAthleteSelectors();

  renderDashboard();

  showToast(
    "선수 삭제 완료"
  );

}


/* =========================================================
   08. ATHLETE SELECTORS
========================================================= */

function populateAthleteSelectors() {

  const selectors = [
    $("analysisAthlete"),
    $("recordAthleteFilter")
  ];


  selectors.forEach(
    select => {

      if (!select) {
        return;
      }

      const oldValue =
        select.value;


      if (
        select.id ===
        "recordAthleteFilter"
      ) {

        select.innerHTML = `
          <option value="">
            전체 선수
          </option>
        `;

      } else {

        select.innerHTML = `
          <option value="">
            선수 선택
          </option>
        `;

      }


      APP.athletes.forEach(
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
        Array.from(
          select.options
        )
          .some(
            option =>
              option.value === oldValue
          )
      ) {

        select.value =
          oldValue;

      }

    }
  );

}


/* =========================================================
   09. EVENT LIBRARY
========================================================= */

function populateEventSelector() {

  const select =
    $("analysisEvent");

  if (!select) {
    return;
  }


  const oldValue =
    select.value;


  select.innerHTML = `
    <option value="">
      종목 선택
    </option>
  `;


  (window.SC_EVENTS || [])
    .forEach(event => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        event.id;

      option.textContent =
        event.name;

      select.appendChild(
        option
      );

    });


  if (
    Array.from(select.options)
      .some(
        option =>
          option.value === oldValue
      )
  ) {

    select.value =
      oldValue;

  }

}


function renderCategoryButtons() {

  const container =
    $("categoryButtons");

  if (!container) {
    return;
  }


  container.innerHTML =
    (window.SC_EVENT_CATEGORIES || [])
      .map(category => `

        <button
          type="button"
          class="category-button
          ${
            APP.selectedCategory ===
            category.id
              ? "active"
              : ""
          }"
          data-category="${category.id}"
        >
          ${category.icon}
          ${escapeHTML(category.name)}
        </button>

      `)
      .join("");


  $$("[data-category]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          APP.selectedCategory =
            button.dataset.category;

          renderEventLibrary();

        }
      );

    });

}


function renderEventLibrary() {

  renderCategoryButtons();


  const grid =
    $("eventGrid");

  if (!grid) {
    return;
  }


  const keyword =
    $("eventSearch")
      ?.value || "";


  const events =
    window.SC_EVENT_UTILS
      ?.filterEvents(
        APP.selectedCategory,
        keyword
      ) || [];


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
      .map(event => `

        <article class="event-card">

          <div class="event-card-icon">
            ${event.icon || "◎"}
          </div>

          <h3>
            ${escapeHTML(event.name)}
          </h3>

          <p>
            ${escapeHTML(event.description || "")}
          </p>

          <button
            type="button"
            data-select-event="${event.id}"
          >
            이 종목 분석
          </button>

        </article>

      `)
      .join("");


  $$("[data-select-event]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          selectAnalysisEvent(
            button.dataset.selectEvent
          );

        }
      );

    });

}


function selectAnalysisEvent(eventId) {

  const event =
    window.SC_EVENT_UTILS
      ?.getEvent(eventId);

  if (!event) {
    return;
  }


  APP.selectedEventId =
    eventId;


  if ($("analysisEvent")) {

    $("analysisEvent").value =
      eventId;

  }


  if ($("videoAnalysisTitle")) {

    $("videoAnalysisTitle")
      .textContent =
        `${event.name} 분석`;

  }


  resetRepCounter();

  goPage("analysis");

  showToast(
    `${event.name} 선택 완료`
  );

}


function bindEventLibrary() {

  $("eventSearch")
    ?.addEventListener(
      "input",
      renderEventLibrary
    );


  $("analysisEvent")
    ?.addEventListener(
      "change",
      event => {

        APP.selectedEventId =
          event.target.value;

        const data =
          window.SC_EVENT_UTILS
            ?.getEvent(
              APP.selectedEventId
            );

        $("videoAnalysisTitle")
          .textContent =
            data
              ? `${data.name} 분석`
              : "분석 영상";

        resetRepCounter();

      }
    );

}


/* =========================================================
   10. VIDEO UPLOAD
========================================================= */

function bindVideoUpload() {

  $("chooseVideoButton")
    ?.addEventListener(
      "click",
      () => {

        $("videoInput")
          ?.click();

      }
    );


  $("videoInput")
    ?.addEventListener(
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


function loadVideoFile(file) {

  const video =
    $("analysisVideo");

  if (!video) {
    return;
  }


  if (APP.analysing) {

    stopAnalysis(false);

  }


  if (APP.videoURL) {

    URL.revokeObjectURL(
      APP.videoURL
    );

  }


  APP.videoFile =
    file;

  APP.videoURL =
    URL.createObjectURL(file);


  video.src =
    APP.videoURL;

  video.load();


  $("videoUploadScreen")
    ?.classList.add("hidden");


  resetAnalysisData();


  showToast(
    `영상 로드: ${file.name}`
  );

}


/* =========================================================
   11. VIDEO PLAYER
========================================================= */

function bindVideoPlayer() {

  const video =
    $("analysisVideo");

  if (!video) {
    return;
  }


  video.addEventListener(
    "loadedmetadata",
    () => {

      $("totalVideoTime")
        .textContent =
          formatTime(
            video.duration
          );

      resizeVideoCanvases();

    }
  );


  video.addEventListener(
    "loadeddata",
    resizeVideoCanvases
  );


  video.addEventListener(
    "timeupdate",
    () => {

      updateTimeline();

    }
  );


  video.addEventListener(
    "play",
    () => {

      $("playVideo")
        .textContent = "Ⅱ";

    }
  );


  video.addEventListener(
    "pause",
    () => {

      $("playVideo")
        .textContent = "▶";

    }
  );


  video.addEventListener(
    "ended",
    () => {

      $("playVideo")
        .textContent = "▶";

      if (APP.analysing) {

        finishAnalysis();

      }

    }
  );


  $("playVideo")
    ?.addEventListener(
      "click",
      async () => {

        if (!APP.videoFile) {

          showToast(
            "먼저 영상을 선택하세요."
          );

          return;

        }


        if (video.paused) {

          try {

            await video.play();

          } catch (error) {

            console.error(error);

          }

        } else {

          video.pause();

        }

      }
    );


  $("videoSpeed")
    ?.addEventListener(
      "change",
      event => {

        video.playbackRate =
          Number(
            event.target.value
          );

      }
    );


  $("previousFrame")
    ?.addEventListener(
      "click",
      () => {

        video.pause();

        video.currentTime =
          Math.max(
            0,
            video.currentTime -
            1 / 30
          );

      }
    );


  $("nextFrame")
    ?.addEventListener(
      "click",
      () => {

        video.pause();

        video.currentTime =
          Math.min(
            video.duration || 0,
            video.currentTime +
            1 / 30
          );

      }
    );


  $("videoTimeline")
    ?.addEventListener(
      "input",
      event => {

        if (
          !Number.isFinite(
            video.duration
          )
        ) {
          return;
        }

        const percentage =
          Number(
            event.target.value
          ) / 100;

        video.currentTime =
          video.duration *
          percentage;

      }
    );


  $("captureKeyFrame")
    ?.addEventListener(
      "click",
      () => {

        captureKeyFrame(
          "수동 핵심 프레임"
        );

      }
    );


  window.addEventListener(
    "resize",
    resizeVideoCanvases
  );

}


function updateTimeline() {

  const video =
    $("analysisVideo");

  if (!video) {
    return;
  }


  $("currentVideoTime")
    .textContent =
      formatTime(
        video.currentTime
      );


  if (
    Number.isFinite(
      video.duration
    ) &&
    video.duration > 0
  ) {

    $("videoTimeline").value =
      (
        video.currentTime /
        video.duration
      ) * 100;

  }

}


function formatTime(seconds) {

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
   12. CANVAS
========================================================= */

function resizeVideoCanvases() {

  const video =
    $("analysisVideo");

  if (
    !video ||
    !video.videoWidth ||
    !video.videoHeight
  ) {
    return;
  }


  [
    $("skeletonCanvas"),
    $("trajectoryCanvas")
  ]
    .forEach(canvas => {

      if (!canvas) {
        return;
      }

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

    });

}


/* =========================================================
   13. MEDIAPIPE POSE
========================================================= */

async function initialisePose() {

  if (APP.poseReady) {
    return true;
  }


  if (
    typeof window.Pose !==
    "function"
  ) {

    setSystemState(
      "AI LIBRARY ERROR",
      true
    );

    showToast(
      "MediaPipe Pose를 불러오지 못했습니다."
    );

    return false;
  }


  try {

    APP.pose =
      new window.Pose({

        locateFile: file =>

          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`

      });


    APP.pose.setOptions({

      modelComplexity: 1,

      smoothLandmarks: true,

      enableSegmentation: false,

      smoothSegmentation: false,

      minDetectionConfidence: 0.55,

      minTrackingConfidence: 0.55

    });


    APP.pose.onResults(
      handlePoseResults
    );


    APP.poseReady =
      true;


    setSystemState(
      "AI READY"
    );


    return true;

  } catch (error) {

    console.error(
      "[POSE INIT]",
      error
    );

    setSystemState(
      "AI ERROR",
      true
    );

    showToast(
      "AI 자세분석 초기화 실패"
    );

    return false;

  }

}


/* =========================================================
   14. START ANALYSIS
========================================================= */

function bindAnalysisControls() {

  $("startAnalysis")
    ?.addEventListener(
      "click",
      startAnalysis
    );


  $("stopAnalysis")
    ?.addEventListener(
      "click",
      () => {

        stopAnalysis(true);

      }
    );


  $("analysisResetButton")
    ?.addEventListener(
      "click",
      resetAnalysis
    );


  $("openReportButton")
    ?.addEventListener(
      "click",
      () => {

        goPage("report");

      }
    );


  $("completeReportButton")
    ?.addEventListener(
      "click",
      () => {

        goPage("report");

      }
    );

}


async function startAnalysis() {

  const video =
    $("analysisVideo");


  if (!APP.videoFile) {

    showToast(
      "먼저 분석 영상을 선택하세요."
    );

    return;

  }


  if (!APP.selectedEventId) {

    APP.selectedEventId =
      $("analysisEvent")
        ?.value || "";

  }


  if (!APP.selectedEventId) {

    showToast(
      "분석 종목을 선택하세요."
    );

    return;

  }


  const ready =
    await initialisePose();

  if (!ready) {
    return;
  }


  resetAnalysisData();


  APP.analysing =
    true;

  APP.stopRequested =
    false;


  $("startAnalysis")
    .disabled = true;

  $("stopAnalysis")
    .disabled = false;

  $("openReportButton")
    .disabled = true;


  $("analysisCompletePanel")
    ?.classList.add(
      "hidden"
    );


  setAnalysisState(
    "ANALYSING"
  );


  if (
    video.ended ||
    video.currentTime >=
      video.duration - 0.05
  ) {

    video.currentTime = 0;

  }


  try {

    await video.play();

  } catch (error) {

    console.warn(
      "자동 재생 실패",
      error
    );

  }


  scheduleAnalysisFrame();

  showToast(
    "AI 분석을 시작했습니다."
  );

}


/* =========================================================
   15. ANALYSIS LOOP
========================================================= */

function scheduleAnalysisFrame() {

  if (!APP.analysing) {
    return;
  }


  const video =
    $("analysisVideo");

  if (
    !video ||
    video.ended
  ) {

    finishAnalysis();

    return;

  }


  const interval =
    safeNumber(
      $("analysisInterval")
        ?.value,
      120
    );


  clearTimeout(
    APP.analysisTimer
  );


  APP.analysisTimer =
    setTimeout(
      processVideoFrame,
      interval
    );

}


async function processVideoFrame() {

  if (!APP.analysing) {
    return;
  }


  const video =
    $("analysisVideo");


  if (
    !video ||
    video.readyState < 2
  ) {

    scheduleAnalysisFrame();

    return;

  }


  if (video.paused) {

    scheduleAnalysisFrame();

    return;

  }


  if (APP.poseBusy) {

    scheduleAnalysisFrame();

    return;

  }


  if (
    Math.abs(
      video.currentTime -
      APP.lastFrameTime
    ) < 0.001
  ) {

    scheduleAnalysisFrame();

    return;

  }


  APP.lastFrameTime =
    video.currentTime;

  APP.poseBusy =
    true;


  try {

    await APP.pose.send({
      image: video
    });

  } catch (error) {

    console.error(
      "[POSE FRAME]",
      error
    );

  } finally {

    APP.poseBusy =
      false;

  }


  if (APP.analysing) {

    scheduleAnalysisFrame();

  }

}


/* =========================================================
   16. POSE RESULTS
========================================================= */

function handlePoseResults(results) {

  if (!APP.analysing) {
    return;
  }


  APP.analysedFrames++;


  const landmarks =
    results.poseLandmarks;


  if (
    !landmarks ||
    landmarks.length < 33
  ) {

    updateDetectionUI(
      false,
      0
    );

    updateProgress();

    return;

  }


  const confidence =
    calculatePoseConfidence(
      landmarks
    );


  APP.validPoseFrames++;

  APP.confidenceTotal +=
    confidence;


  updateDetectionUI(
    true,
    confidence
  );


  const angles =
    calculateAngles(
      landmarks
    );


  APP.latestAngles =
    angles;


  const metrics =
    calculatePerformance(
      landmarks,
      angles
    );


  APP.latestMetrics =
    metrics;


  updateAngleUI(
    angles
  );


  updateMetricUI(
    metrics
  );


  updateRepCounter(
    landmarks,
    angles
  );


  updateTrajectory(
    landmarks
  );


  saveAngleFrame(
    angles,
    metrics
  );


  drawPose(
    landmarks,
    angles
  );


  drawTrajectory(
    landmarks
  );


  maybeAutoCapture(
    angles
  );


  updateProgress();

}


/* =========================================================
   17. LANDMARK HELPERS
========================================================= */

const LM = {

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


function point(landmarks, index) {

  return landmarks[index];

}


function midpoint(a, b) {

  return {

    x:
      (a.x + b.x) / 2,

    y:
      (a.y + b.y) / 2,

    z:
      (
        safeNumber(a.z) +
        safeNumber(b.z)
      ) / 2

  };

}


function distance(a, b) {

  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );

}


/* =========================================================
   18. ANGLE
========================================================= */

function jointAngle(a, b, c) {

  if (!a || !b || !c) {
    return 0;
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
    Math.hypot(
      ab.x,
      ab.y
    );


  const magCB =
    Math.hypot(
      cb.x,
      cb.y
    );


  if (
    magAB === 0 ||
    magCB === 0
  ) {

    return 0;

  }


  const cosine =
    clamp(
      dot /
      (
        magAB *
        magCB
      ),
      -1,
      1
    );


  return (
    Math.acos(cosine) *
    180 /
    Math.PI
  );

}


function calculateTrunkAngle(
  shoulderCenter,
  hipCenter
) {

  const dx =
    shoulderCenter.x -
    hipCenter.x;

  const dy =
    shoulderCenter.y -
    hipCenter.y;


  const angle =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) *
    180 /
    Math.PI;


  return angle;

}


function calculateAngles(lm) {

  const leftShoulder =
    point(
      lm,
      LM.leftShoulder
    );

  const rightShoulder =
    point(
      lm,
      LM.rightShoulder
    );

  const leftHip =
    point(
      lm,
      LM.leftHip
    );

  const rightHip =
    point(
      lm,
      LM.rightHip
    );

  const leftKnee =
    point(
      lm,
      LM.leftKnee
    );

  const rightKnee =
    point(
      lm,
      LM.rightKnee
    );

  const leftAnkle =
    point(
      lm,
      LM.leftAnkle
    );

  const rightAnkle =
    point(
      lm,
      LM.rightAnkle
    );

  const leftFoot =
    point(
      lm,
      LM.leftFoot
    );

  const rightFoot =
    point(
      lm,
      LM.rightFoot
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


  const leftKneeAngle =
    jointAngle(
      leftHip,
      leftKnee,
      leftAnkle
    );


  const rightKneeAngle =
    jointAngle(
      rightHip,
      rightKnee,
      rightAnkle
    );


  const leftHipAngle =
    jointAngle(
      leftShoulder,
      leftHip,
      leftKnee
    );


  const rightHipAngle =
    jointAngle(
      rightShoulder,
      rightHip,
      rightKnee
    );


  const leftAnkleAngle =
    jointAngle(
      leftKnee,
      leftAnkle,
      leftFoot
    );


  const rightAnkleAngle =
    jointAngle(
      rightKnee,
      rightAnkle,
      rightFoot
    );


  const leftElbowAngle =
    jointAngle(
      point(
        lm,
        LM.leftShoulder
      ),
      point(
        lm,
        LM.leftElbow
      ),
      point(
        lm,
        LM.leftWrist
      )
    );


  const rightElbowAngle =
    jointAngle(
      point(
        lm,
        LM.rightShoulder
      ),
      point(
        lm,
        LM.rightElbow
      ),
      point(
        lm,
        LM.rightWrist
      )
    );


  const leftShoulderAngle =
    jointAngle(
      leftHip,
      leftShoulder,
      point(
        lm,
        LM.leftElbow
      )
    );


  const rightShoulderAngle =
    jointAngle(
      rightHip,
      rightShoulder,
      point(
        lm,
        LM.rightElbow
      )
    );


  const trunkAngle =
    calculateTrunkAngle(
      shoulderCenter,
      hipCenter
    );


  const asymmetry =
    Math.abs(
      leftKneeAngle -
      rightKneeAngle
    );


  return {

    leftKnee:
      leftKneeAngle,

    rightKnee:
      rightKneeAngle,

    leftHip:
      leftHipAngle,

    rightHip:
      rightHipAngle,

    leftAnkle:
      leftAnkleAngle,

    rightAnkle:
      rightAnkleAngle,

    leftElbow:
      leftElbowAngle,

    rightElbow:
      rightElbowAngle,

    leftShoulder:
      leftShoulderAngle,

    rightShoulder:
      rightShoulderAngle,

    trunk:
      trunkAngle,

    asymmetry

  };

}


/* =========================================================
   19. ANGLE UI
========================================================= */

function setAngleText(
  id,
  value
) {

  const el =
    $(id);

  if (!el) {
    return;
  }

  el.textContent =
    `${Math.round(value)}°`;

}


function updateAngleUI(angles) {

  setAngleText(
    "angleLeftKnee",
    angles.leftKnee
  );

  setAngleText(
    "angleRightKnee",
    angles.rightKnee
  );

  setAngleText(
    "angleLeftHip",
    angles.leftHip
  );

  setAngleText(
    "angleRightHip",
    angles.rightHip
  );

  setAngleText(
    "angleLeftAnkle",
    angles.leftAnkle
  );

  setAngleText(
    "angleRightAnkle",
    angles.rightAnkle
  );

  setAngleText(
    "angleTrunk",
    angles.trunk
  );

  setAngleText(
    "angleAsymmetry",
    angles.asymmetry
  );

}


/* =========================================================
   20. CONFIDENCE
========================================================= */

function calculatePoseConfidence(
  landmarks
) {

  const important = [

    LM.leftShoulder,
    LM.rightShoulder,

    LM.leftHip,
    LM.rightHip,

    LM.leftKnee,
    LM.rightKnee,

    LM.leftAnkle,
    LM.rightAnkle

  ];


  const values =
    important.map(index => {

      const landmark =
        landmarks[index];

      return safeNumber(
        landmark.visibility,
        0.5
      );

    });


  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    values.length;


  return clamp(
    average * 100,
    0,
    100
  );

}


function updateDetectionUI(
  detected,
  confidence
) {

  if ($("personDetection")) {

    $("personDetection")
      .textContent =
        detected
          ? "인식"
          : "미인식";

  }


  if ($("poseConfidence")) {

    $("poseConfidence")
      .textContent =
        `${Math.round(confidence)}%`;

  }


  if ($("analysedFrameCount")) {

    $("analysedFrameCount")
      .textContent =
        APP.analysedFrames;

  }

}


/* =========================================================
   21. PERFORMANCE
========================================================= */

function calculatePerformance(
  landmarks,
  angles
) {

  const symmetry =
    clamp(
      100 -
      angles.asymmetry * 3,
      0,
      100
    );


  const stability =
    clamp(
      100 -
      angles.trunk * 1.25,
      0,
      100
    );


  const kneeAverage =
    (
      angles.leftKnee +
      angles.rightKnee
    ) / 2;


  let technique =
    85;


  const event =
    window.SC_EVENT_UTILS
      ?.getEvent(
        APP.selectedEventId
      );


  if (
    event?.movementType ===
    "squat"
  ) {

    if (
      kneeAverage > 100 &&
      APP.repState === "BOTTOM"
    ) {

      technique -=
        Math.min(
          20,
          kneeAverage - 100
        );

    }

  }


  technique -=
    angles.asymmetry * 1.1;

  technique -=
    Math.max(
      0,
      angles.trunk - 35
    ) * 0.7;


  technique =
    clamp(
      technique,
      0,
      100
    );


  const hipCenter =
    midpoint(
      point(
        landmarks,
        LM.leftHip
      ),
      point(
        landmarks,
        LM.rightHip
      )
    );


  let motion =
    0;


  const last =
    APP.trajectory[
      APP.trajectory.length - 1
    ];


  if (last) {

    motion =
      distance(
        hipCenter,
        last
      );

  }


  const power =
    clamp(
      55 +
      motion * 850,
      0,
      100
    );


  return {

    technique:
      Math.round(
        technique
      ),

    stability:
      Math.round(
        stability
      ),

    symmetry:
      Math.round(
        symmetry
      ),

    power:
      Math.round(
        power
      )

  };

}


function updateMetricUI(
  metrics
) {

  setMetric(
    "metricTechnique",
    "metricTechniqueBar",
    metrics.technique
  );

  setMetric(
    "metricStability",
    "metricStabilityBar",
    metrics.stability
  );

  setMetric(
    "metricSymmetry",
    "metricSymmetryBar",
    metrics.symmetry
  );

  setMetric(
    "metricPower",
    "metricPowerBar",
    metrics.power
  );

}


function setMetric(
  valueId,
  barId,
  value
) {

  const valueElement =
    $(valueId);

  const barElement =
    $(barId);


  if (valueElement) {

    valueElement.textContent =
      `${Math.round(value)}`;

  }


  if (barElement) {

    barElement.style.width =
      `${clamp(value, 0, 100)}%`;

  }

}


/* =========================================================
   22. REP COUNTER
========================================================= */

function resetRepCounter() {

  APP.repCount = 0;

  APP.repState =
    "READY";

  APP.previousRepState =
    "READY";


  if ($("repCount")) {

    $("repCount")
      .textContent = "0";

  }


  if ($("movementPhase")) {

    $("movementPhase")
      .textContent =
        "READY";

  }

}


function updateRepCounter(
  landmarks,
  angles
) {

  const event =
    window.SC_EVENT_UTILS
      ?.getEvent(
        APP.selectedEventId
      );


  if (!event) {
    return;
  }


  if (!event.repCounter) {

    $("movementPhase")
      .textContent =
        detectGeneralPhase(
          event,
          landmarks,
          angles
        );

    return;

  }


  switch (
    event.movementType
  ) {

    case "squat":

      countSquat(angles);

      break;


    case "lunge":

    case "singleLegSquat":

      countLunge(angles);

      break;


    case "pushup":

    case "dip":

      countUpperRep(angles);

      break;


    case "situp":

      countSitup(angles);

      break;


    case "calfRaise":

      countCalfRaise(angles);

      break;


    case "jump":

    case "horizontalJump":

      countJump(
        landmarks,
        angles
      );

      break;


    case "runningDrill":

      countRunningDrill(
        landmarks
      );

      break;


    case "burpee":

      countBurpee(
        landmarks,
        angles
      );

      break;


    default:

      $("movementPhase")
        .textContent =
          detectGeneralPhase(
            event,
            landmarks,
            angles
          );

      break;

  }

}


function setRepState(state) {

  APP.previousRepState =
    APP.repState;

  APP.repState =
    state;


  if ($("movementPhase")) {

    $("movementPhase")
      .textContent =
        state;

  }

}


function incrementRep() {

  APP.repCount++;


  if ($("repCount")) {

    $("repCount")
      .textContent =
        APP.repCount;

  }

}


function countSquat(angles) {

  const knee =
    (
      angles.leftKnee +
      angles.rightKnee
    ) / 2;


  if (knee > 155) {

    if (
      APP.repState ===
      "ASCENT"
    ) {

      incrementRep();

      setRepState(
        "COMPLETE"
      );

    } else {

      setRepState(
        "READY"
      );

    }

  }

  else if (knee < 100) {

    setRepState(
      "BOTTOM"
    );

  }

  else if (
    APP.repState ===
    "BOTTOM"
  ) {

    setRepState(
      "ASCENT"
    );

  }

  else {

    setRepState(
      "DESCENT"
    );

  }

}


function countLunge(angles) {

  const knee =
    Math.min(
      angles.leftKnee,
      angles.rightKnee
    );


  if (knee < 105) {

    setRepState(
      "BOTTOM"
    );

  }

  else if (
    knee > 155 &&
    APP.repState ===
    "BOTTOM"
  ) {

    incrementRep();

    setRepState(
      "COMPLETE"
    );

  }

  else if (knee > 155) {

    setRepState(
      "READY"
    );

  }

  else {

    setRepState(
      "MOVING"
    );

  }

}


function countUpperRep(angles) {

  const elbow =
    (
      angles.leftElbow +
      angles.rightElbow
    ) / 2;


  if (elbow < 105) {

    setRepState(
      "BOTTOM"
    );

  }

  else if (
    elbow > 155 &&
    APP.repState ===
    "BOTTOM"
  ) {

    incrementRep();

    setRepState(
      "COMPLETE"
    );

  }

  else if (elbow > 155) {

    setRepState(
      "TOP"
    );

  }

}


function countSitup(angles) {

  const hip =
    (
      angles.leftHip +
      angles.rightHip
    ) / 2;


  if (hip < 95) {

    setRepState(
      "TOP"
    );

  }

  else if (
    hip > 135 &&
    APP.repState ===
    "TOP"
  ) {

    incrementRep();

    setRepState(
      "DOWN"
    );

  }

  else {

    setRepState(
      "MOVING"
    );

  }

}


function countCalfRaise(angles) {

  const ankle =
    (
      angles.leftAnkle +
      angles.rightAnkle
    ) / 2;


  if (ankle < 95) {

    setRepState(
      "TOP"
    );

  }

  else if (
    ankle > 110 &&
    APP.repState ===
    "TOP"
  ) {

    incrementRep();

    setRepState(
      "BOTTOM"
    );

  }

}


function countJump(
  landmarks,
  angles
) {

  const ankleCenter =
    midpoint(
      point(
        landmarks,
        LM.leftAnkle
      ),
      point(
        landmarks,
        LM.rightAnkle
      )
    );


  const history =
    APP.trajectory;


  if (
    history.length < 5
  ) {

    setRepState(
      "READY"
    );

    return;

  }


  const previous =
    history[
      Math.max(
        0,
        history.length - 5
      )
    ];


  const verticalChange =
    previous.y -
    ankleCenter.y;


  if (
    verticalChange > 0.015
  ) {

    setRepState(
      "FLIGHT"
    );

  }

  else if (
    APP.repState ===
      "FLIGHT" &&
    verticalChange < -0.005
  ) {

    incrementRep();

    setRepState(
      "LANDING"
    );

  }

  else if (
    angles.leftKnee < 120 ||
    angles.rightKnee < 120
  ) {

    setRepState(
      "LOAD"
    );

  }

  else {

    setRepState(
      "READY"
    );

  }

}


function countRunningDrill(
  landmarks
) {

  const leftKnee =
    point(
      landmarks,
      LM.leftKnee
    );

  const rightKnee =
    point(
      landmarks,
      LM.rightKnee
    );

  const hipCenter =
    midpoint(
      point(
        landmarks,
        LM.leftHip
      ),
      point(
        landmarks,
        LM.rightHip
      )
    );


  const kneeHigh =
    Math.min(
      leftKnee.y,
      rightKnee.y
    ) <
    hipCenter.y + 0.12;


  if (
    kneeHigh &&
    APP.repState !==
      "TOP"
  ) {

    setRepState(
      "TOP"
    );

  }

  else if (
    !kneeHigh &&
    APP.repState ===
      "TOP"
  ) {

    incrementRep();

    setRepState(
      "CONTACT"
    );

  }

}


function countBurpee(
  landmarks,
  angles
) {

  const shoulderCenter =
    midpoint(
      point(
        landmarks,
        LM.leftShoulder
      ),
      point(
        landmarks,
        LM.rightShoulder
      )
    );

  const hipCenter =
    midpoint(
      point(
        landmarks,
        LM.leftHip
      ),
      point(
        landmarks,
        LM.rightHip
      )
    );


  const verticalBody =
    Math.abs(
      shoulderCenter.y -
      hipCenter.y
    );


  if (
    verticalBody < 0.12
  ) {

    setRepState(
      "DOWN"
    );

  }

  else if (
    angles.leftKnee > 150 &&
    angles.rightKnee > 150 &&
    APP.repState === "DOWN"
  ) {

    incrementRep();

    setRepState(
      "COMPLETE"
    );

  }

}


function detectGeneralPhase(
  event,
  landmarks,
  angles
) {

  if (
    event.movementType ===
    "hold"
  ) {

    return "HOLD";

  }


  if (
    event.movementType ===
    "running"
  ) {

    return "RUNNING";

  }


  if (
    event.movementType ===
    "agility"
  ) {

    return "MOVING";

  }


  return "ANALYSING";

}


/* =========================================================
   23. TRAJECTORY
========================================================= */

function updateTrajectory(
  landmarks
) {

  const hipCenter =
    midpoint(
      point(
        landmarks,
        LM.leftHip
      ),
      point(
        landmarks,
        LM.rightHip
      )
    );


  APP.trajectory.push({

    x: hipCenter.x,

    y: hipCenter.y,

    time:
      $("analysisVideo")
        ?.currentTime || 0

  });


  if (
    APP.trajectory.length >
    180
  ) {

    APP.trajectory.shift();

  }

}


/* =========================================================
   24. DRAW SKELETON
========================================================= */

const POSE_CONNECTIONS_SC = [

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


function drawPose(
  landmarks,
  angles
) {

  const canvas =
    $("skeletonCanvas");

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
    !$("showSkeleton")
      ?.checked
  ) {

    return;

  }


  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 400
    );

  ctx.strokeStyle =
    "rgba(60,210,255,.95)";

  ctx.fillStyle =
    "rgba(120,235,255,.98)";


  POSE_CONNECTIONS_SC
    .forEach(
      ([aIndex, bIndex]) => {

        const a =
          landmarks[aIndex];

        const b =
          landmarks[bIndex];


        if (!a || !b) {
          return;
        }


        if (
          safeNumber(
            a.visibility,
            1
          ) < 0.35 ||
          safeNumber(
            b.visibility,
            1
          ) < 0.35
        ) {

          return;

        }


        ctx.beginPath();

        ctx.moveTo(
          a.x *
          canvas.width,

          a.y *
          canvas.height
        );

        ctx.lineTo(
          b.x *
          canvas.width,

          b.y *
          canvas.height
        );

        ctx.stroke();

      }
    );


  landmarks.forEach(
    landmark => {

      if (
        safeNumber(
          landmark.visibility,
          1
        ) < 0.35
      ) {
        return;
      }


      ctx.beginPath();

      ctx.arc(
        landmark.x *
        canvas.width,

        landmark.y *
        canvas.height,

        Math.max(
          3,
          canvas.width / 250
        ),

        0,

        Math.PI * 2
      );

      ctx.fill();

    }
  );


  if (
    $("showCenter")
      ?.checked
  ) {

    drawCenterOfMass(
      ctx,
      canvas,
      landmarks
    );

  }


  if (
    $("showReference")
      ?.checked
  ) {

    drawReferenceLines(
      ctx,
      canvas,
      landmarks
    );

  }


  if (
    $("showAngles")
      ?.checked
  ) {

    drawAngleLabels(
      ctx,
      canvas,
      landmarks,
      angles
    );

  }

}


/* =========================================================
   25. COM
========================================================= */

function drawCenterOfMass(
  ctx,
  canvas,
  landmarks
) {

  const hipCenter =
    midpoint(
      point(
        landmarks,
        LM.leftHip
      ),
      point(
        landmarks,
        LM.rightHip
      )
    );


  const shoulderCenter =
    midpoint(
      point(
        landmarks,
        LM.leftShoulder
      ),
      point(
        landmarks,
        LM.rightShoulder
      )
    );


  const center = {

    x:
      hipCenter.x * 0.65 +
      shoulderCenter.x * 0.35,

    y:
      hipCenter.y * 0.65 +
      shoulderCenter.y * 0.35

  };


  ctx.save();

  ctx.fillStyle =
    "rgba(255,210,75,.95)";

  ctx.strokeStyle =
    "rgba(255,255,255,.85)";

  ctx.lineWidth = 2;


  ctx.beginPath();

  ctx.arc(
    center.x *
    canvas.width,

    center.y *
    canvas.height,

    Math.max(
      6,
      canvas.width / 160
    ),

    0,

    Math.PI * 2
  );

  ctx.fill();

  ctx.stroke();

  ctx.restore();

}


/* =========================================================
   26. REFERENCE LINES
========================================================= */

function drawReferenceLines(
  ctx,
  canvas,
  landmarks
) {

  const ankleCenter =
    midpoint(
      point(
        landmarks,
        LM.leftAnkle
      ),
      point(
        landmarks,
        LM.rightAnkle
      )
    );


  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,.28)";

  ctx.setLineDash([
    8,
    8
  ]);

  ctx.lineWidth = 1;


  ctx.beginPath();

  ctx.moveTo(
    ankleCenter.x *
    canvas.width,
    0
  );

  ctx.lineTo(
    ankleCenter.x *
    canvas.width,
    canvas.height
  );

  ctx.stroke();


  ctx.setLineDash([]);

  ctx.restore();

}


/* =========================================================
   27. ANGLE LABELS
========================================================= */

function drawAngleLabels(
  ctx,
  canvas,
  landmarks,
  angles
) {

  const labels = [

    {
      point:
        landmarks[
          LM.leftKnee
        ],

      value:
        angles.leftKnee
    },

    {
      point:
        landmarks[
          LM.rightKnee
        ],

      value:
        angles.rightKnee
    },

    {
      point:
        landmarks[
          LM.leftHip
        ],

      value:
        angles.leftHip
    },

    {
      point:
        landmarks[
          LM.rightHip
        ],

      value:
        angles.rightHip
    }

  ];


  ctx.save();

  ctx.font =
    `bold ${Math.max(
      12,
      canvas.width / 55
    )}px sans-serif`;

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "bottom";


  labels.forEach(item => {

    if (!item.point) {
      return;
    }


    const x =
      item.point.x *
      canvas.width;

    const y =
      item.point.y *
      canvas.height -
      8;


    const text =
      `${Math.round(
        item.value
      )}°`;


    ctx.lineWidth = 4;

    ctx.strokeStyle =
      "rgba(0,0,0,.8)";

    ctx.strokeText(
      text,
      x,
      y
    );


    ctx.fillStyle =
      "white";

    ctx.fillText(
      text,
      x,
      y
    );

  });


  ctx.restore();

}


/* =========================================================
   28. DRAW TRAJECTORY
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
    !$("showTrajectory")
      ?.checked
  ) {

    return;

  }


  if (
    APP.trajectory.length <
    2
  ) {

    return;

  }


  ctx.save();

  ctx.lineWidth =
    Math.max(
      2,
      canvas.width / 300
    );

  ctx.strokeStyle =
    "rgba(255,205,70,.82)";

  ctx.beginPath();


  APP.trajectory.forEach(
    (point, index) => {

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
   29. ANGLE HISTORY
========================================================= */

function saveAngleFrame(
  angles,
  metrics
) {

  const video =
    $("analysisVideo");


  APP.angleHistory.push({

    time:
      safeNumber(
        video?.currentTime,
        0
      ),

    leftKnee:
      angles.leftKnee,

    rightKnee:
      angles.rightKnee,

    leftHip:
      angles.leftHip,

    rightHip:
      angles.rightHip,

    trunk:
      angles.trunk,

    asymmetry:
      angles.asymmetry,

    technique:
      metrics.technique,

    stability:
      metrics.stability,

    symmetry:
      metrics.symmetry,

    power:
      metrics.power

  });


  if (
    APP.angleHistory.length >
    600
  ) {

    APP.angleHistory.shift();

  }


  updateAngleChart();

}


/* =========================================================
   30. ANGLE CHART
========================================================= */

function initialiseAngleChart() {

  const canvas =
    $("angleChart");

  if (
    !canvas ||
    typeof Chart ===
      "undefined"
  ) {

    return;

  }


  if (APP.chart) {

    APP.chart.destroy();

  }


  APP.chart =
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

            mode: "index",

            intersect: false

          },

          scales: {

            y: {

              suggestedMin: 0,

              suggestedMax: 180,

              ticks: {

                color:
                  "#8195aa"

              },

              grid: {

                color:
                  "rgba(255,255,255,.06)"

              }

            },

            x: {

              ticks: {

                color:
                  "#8195aa",

                maxTicksLimit: 8

              },

              grid: {

                color:
                  "rgba(255,255,255,.04)"

              }

            }

          },

          plugins: {

            legend: {

              labels: {

                color:
                  "#b6c5d4"

              }

            }

          }

        }

      }
    );

}


function updateAngleChart() {

  if (!APP.chart) {
    return;
  }


  const data =
    APP.angleHistory.slice(
      -120
    );


  APP.chart.data.labels =
    data.map(
      item =>
        item.time
          .toFixed(1)
    );


  APP.chart.data.datasets[0]
    .data =
      data.map(
        item =>
          Math.round(
            item.leftKnee
          )
      );


  APP.chart.data.datasets[1]
    .data =
      data.map(
        item =>
          Math.round(
            item.rightKnee
          )
      );


  APP.chart.data.datasets[2]
    .data =
      data.map(
        item =>
          Math.round(
            item.trunk
          )
      );


  APP.chart.update("none");

}


/* =========================================================
   31. KEY FRAMES
========================================================= */

function maybeAutoCapture(
  angles
) {

  if (
    !$("autoCapture")
      ?.checked
  ) {

    return;

  }


  const now =
    performance.now();


  if (
    now -
    APP.lastAutoCapture <
    1800
  ) {

    return;

  }


  const event =
    window.SC_EVENT_UTILS
      ?.getEvent(
        APP.selectedEventId
      );


  if (!event) {
    return;
  }


  if (
    (
      event.movementType ===
      "squat" ||
      event.movementType ===
      "lunge"
    ) &&
    Math.min(
      angles.leftKnee,
      angles.rightKnee
    ) < 95
  ) {

    APP.lastAutoCapture =
      now;

    captureKeyFrame(
      "최저 자세"
    );

  }


  if (
    (
      event.movementType ===
      "jump" ||
      event.movementType ===
      "horizontalJump"
    ) &&
    APP.repState ===
      "FLIGHT"
  ) {

    APP.lastAutoCapture =
      now;

    captureKeyFrame(
      "점프 핵심 자세"
    );

  }

}


function captureKeyFrame(
  label = "핵심 자세"
) {

  const video =
    $("analysisVideo");

  if (
    !video ||
    !APP.videoFile ||
    video.readyState < 2
  ) {

    showToast(
      "캡처할 영상 프레임이 없습니다."
    );

    return;

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
    canvas.getContext("2d");


  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  const skeleton =
    $("skeletonCanvas");


  if (
    skeleton &&
    $("showSkeleton")
      ?.checked
  ) {

    ctx.drawImage(
      skeleton,
      0,
      0,
      canvas.width,
      canvas.height
    );

  }


  const trajectory =
    $("trajectoryCanvas");


  if (
    trajectory &&
    $("showTrajectory")
      ?.checked
  ) {

    ctx.drawImage(
      trajectory,
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
        0.72
      );

  } catch (error) {

    console.error(
      "[CAPTURE]",
      error
    );

    return;

  }


  APP.keyFrames.push({

    id: uid(),

    label,

    time:
      video.currentTime,

    image,

    angles:
      APP.latestAngles
        ? {
            ...APP.latestAngles
          }
        : null

  });


  /*
    localStorage 용량 보호.
    리포트에는 최대 6개 핵심 자세 저장.
  */

  if (
    APP.keyFrames.length > 6
  ) {

    APP.keyFrames.shift();

  }


  renderKeyFrames();

  showToast(
    "핵심 프레임 저장"
  );

}


function renderKeyFrames() {

  const list =
    $("keyFrameList");

  if (!list) {
    return;
  }


  $("keyFrameCount")
    .textContent =
      APP.keyFrames.length;


  if (!APP.keyFrames.length) {

    list.innerHTML = `
      <div class="empty-state">
        핵심 프레임이 없습니다.
      </div>
    `;

    return;

  }


  list.innerHTML =
    APP.keyFrames
      .map(frame => `

        <article class="key-frame-card">

          <img
            src="${frame.image}"
            alt="핵심 자세"
          >

          <div class="key-frame-info">

            <strong>
              ${escapeHTML(frame.label)}
            </strong>

            <span>
              ${formatTime(frame.time)}
            </span>

          </div>

        </article>

      `)
      .join("");

}


/* =========================================================
   32. PROGRESS
========================================================= */

function updateProgress() {

  const video =
    $("analysisVideo");


  let progress = 0;


  if (
    video &&
    Number.isFinite(
      video.duration
    ) &&
    video.duration > 0
  ) {

    progress =
      clamp(
        video.currentTime /
        video.duration *
        100,
        0,
        100
      );

  }


  if ($("analysisProgressText")) {

    $("analysisProgressText")
      .textContent =
        `${Math.round(progress)}%`;

  }


  if ($("analysisProgressBar")) {

    $("analysisProgressBar")
      .style.width =
        `${progress}%`;

  }

}


/* =========================================================
   33. STOP / FINISH
========================================================= */

function stopAnalysis(
  createReport = true
) {

  if (!APP.analysing) {

    if (
      createReport &&
      APP.angleHistory.length
    ) {

      finishAnalysis();

    }

    return;

  }


  APP.stopRequested =
    true;

  APP.analysing =
    false;


  clearTimeout(
    APP.analysisTimer
  );


  const video =
    $("analysisVideo");

  video?.pause();


  if (createReport) {

    finishAnalysis();

  } else {

    setAnalysisState(
      "STOPPED"
    );

    $("startAnalysis")
      .disabled = false;

    $("stopAnalysis")
      .disabled = true;

  }

}


function finishAnalysis() {

  if (
    !APP.angleHistory.length
  ) {

    APP.analysing =
      false;

    $("startAnalysis")
      .disabled = false;

    $("stopAnalysis")
      .disabled = true;

    setAnalysisState(
      "NO DATA"
    );

    showToast(
      "분석된 자세 데이터가 없습니다."
    );

    return;

  }


  APP.analysing =
    false;


  clearTimeout(
    APP.analysisTimer
  );


  $("analysisVideo")
    ?.pause();


  $("startAnalysis")
    .disabled = false;

  $("stopAnalysis")
    .disabled = true;


  const summary =
    calculateSummary();


  const feedback =
    createFeedback(
      summary
    );


  const training =
    createTrainingRecommendations(
      summary
    );


  const athleteId =
    $("analysisAthlete")
      ?.value || "";


  const athlete =
    APP.athletes.find(
      item =>
        item.id === athleteId
    ) || null;


  const event =
    window.SC_EVENT_UTILS
      ?.getEvent(
        APP.selectedEventId
      );


  const record = {

    id: uid(),

    athleteId,

    athlete:
      athlete
        ? {
            ...athlete
          }
        : null,

    eventId:
      APP.selectedEventId,

    eventName:
      event?.name ||
      "일반 분석",

    category:
      event?.category ||
      "",

    ability:
      event?.ability ||
      "",

    videoName:
      APP.videoFile
        ?.name ||
        "영상",

    createdAt:
      new Date()
        .toISOString(),

    frameCount:
      APP.analysedFrames,

    validPoseFrames:
      APP.validPoseFrames,

    confidence:
      APP.validPoseFrames
        ? Math.round(
            APP.confidenceTotal /
            APP.validPoseFrames
          )
        : 0,

    reps:
      APP.repCount,

    summary,

    feedback,

    training,

    angleHistory:
      compressAngleHistory(
        APP.angleHistory
      ),

    keyFrames:
      APP.keyFrames.slice(
        0,
        6
      )

  };


  APP.records.unshift(
    record
  );


  /*
    localStorage 용량 보호.
  */

  if (
    APP.records.length > 30
  ) {

    APP.records =
      APP.records.slice(
        0,
        30
      );

  }


  APP.currentRecord =
    record;


  saveRecords();


  renderAnalysisFeedback(
    feedback
  );


  $("finalScore")
    .textContent =
      summary.score;


  $("analysisCompletePanel")
    ?.classList.remove(
      "hidden"
    );


  $("openReportButton")
    .disabled = false;


  setAnalysisState(
    "COMPLETE"
  );


  renderDashboard();

  renderRecords();


  showToast(
    "분석 완료 · 리포트 생성 완료"
  );

}


/* =========================================================
   34. COMPRESS HISTORY
========================================================= */

function compressAngleHistory(
  history
) {

  if (
    history.length <= 120
  ) {

    return history;

  }


  const step =
    Math.ceil(
      history.length / 120
    );


  return history.filter(
    (_, index) =>
      index % step === 0
  );

}


/* =========================================================
   35. SUMMARY
========================================================= */

function average(
  values
) {

  if (!values.length) {
    return 0;
  }


  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    values.length
  );

}


function calculateSummary() {

  const history =
    APP.angleHistory;


  const leftKnees =
    history.map(
      item =>
        item.leftKnee
    );

  const rightKnees =
    history.map(
      item =>
        item.rightKnee
    );

  const trunks =
    history.map(
      item =>
        item.trunk
    );

  const asymmetries =
    history.map(
      item =>
        item.asymmetry
    );


  const technique =
    average(
      history.map(
        item =>
          item.technique
      )
    );


  const stability =
    average(
      history.map(
        item =>
          item.stability
      )
    );


  const symmetry =
    average(
      history.map(
        item =>
          item.symmetry
      )
    );


  const power =
    average(
      history.map(
        item =>
          item.power
      )
    );


  const mobility =
    calculateMobilityScore(
      history
    );


  const coordination =
    clamp(
      (
        technique +
        stability +
        symmetry
      ) / 3,
      0,
      100
    );


  const score =
    Math.round(
      technique * 0.25 +
      stability * 0.2 +
      symmetry * 0.2 +
      power * 0.15 +
      mobility * 0.1 +
      coordination * 0.1
    );


  return {

    score,

    grade:
      scoreGrade(score),

    technique:
      Math.round(
        technique
      ),

    stability:
      Math.round(
        stability
      ),

    symmetry:
      Math.round(
        symmetry
      ),

    power:
      Math.round(
        power
      ),

    mobility:
      Math.round(
        mobility
      ),

    coordination:
      Math.round(
        coordination
      ),

    minimumKnee:
      Math.round(
        Math.min(
          ...leftKnees,
          ...rightKnees
        )
      ),

    maximumKnee:
      Math.round(
        Math.max(
          ...leftKnees,
          ...rightKnees
        )
      ),

    maximumTrunk:
      Math.round(
        Math.max(
          ...trunks
        )
      ),

    averageAsymmetry:
      Math.round(
        average(
          asymmetries
        )
      )

  };

}


function calculateMobilityScore(
  history
) {

  if (!history.length) {
    return 0;
  }


  const kneeValues =
    history.flatMap(
      item => [
        item.leftKnee,
        item.rightKnee
      ]
    );


  const range =
    Math.max(
      ...kneeValues
    ) -
    Math.min(
      ...kneeValues
    );


  return clamp(
    55 +
    range * 0.5,
    0,
    100
  );

}


function scoreGrade(score) {

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
   36. RANGE UI
========================================================= */

function renderRangeSummary(
  summary
) {

  if ($("minimumKneeAngle")) {

    $("minimumKneeAngle")
      .textContent =
        `${summary.minimumKnee}°`;

  }


  if ($("maximumKneeAngle")) {

    $("maximumKneeAngle")
      .textContent =
        `${summary.maximumKnee}°`;

  }


  if ($("maximumTrunkAngle")) {

    $("maximumTrunkAngle")
      .textContent =
        `${summary.maximumTrunk}°`;

  }


  if ($("averageAsymmetry")) {

    $("averageAsymmetry")
      .textContent =
        `${summary.averageAsymmetry}°`;

  }

}


/* =========================================================
   37. FEEDBACK
========================================================= */

function createFeedback(
  summary
) {

  const feedback = [];


  if (
    summary.symmetry >= 85
  ) {

    feedback.push({

      title:
        "좌우 대칭성이 좋습니다.",

      text:
        "양쪽 하지의 관절각 차이가 비교적 작게 유지되었습니다."

    });

  } else {

    feedback.push({

      title:
        "좌우 움직임 차이를 확인하세요.",

      text:
        `평균 좌우 차이가 약 ${summary.averageAsymmetry}°로 측정되었습니다. 한쪽으로 체중이 치우치는 구간을 핵심 프레임에서 확인해 보세요.`

    });

  }


  if (
    summary.maximumTrunk > 45
  ) {

    feedback.push({

      title:
        "몸통 기울기 확인",

      text:
        "일부 구간에서 몸통 기울기가 크게 나타났습니다. 동작 목적에 맞는 몸통 정렬과 코어 안정성을 함께 확인하는 것이 좋습니다."

    });

  } else {

    feedback.push({

      title:
        "몸통 안정성 양호",

      text:
        "분석 구간에서 몸통 움직임이 비교적 안정적으로 유지되었습니다."

    });

  }


  if (
    summary.technique < 75
  ) {

    feedback.push({

      title:
        "동작 패턴 반복 연습 추천",

      text:
        "속도를 낮추고 같은 동작을 일정한 관절 움직임으로 반복하는 기술 훈련을 권장합니다."

    });

  }


  if (
    summary.stability < 75
  ) {

    feedback.push({

      title:
        "안정성 보강 필요",

      text:
        "한발 지지와 느린 템포 동작을 활용해 자세 제어 능력을 보강해 보세요."

    });

  }


  return feedback;

}


function renderAnalysisFeedback(
  feedback
) {

  const container =
    $("analysisFeedback");

  if (!container) {
    return;
  }


  container.innerHTML =
    feedback
      .map(item => `

        <div class="feedback-item">

          <strong>
            ${escapeHTML(item.title)}
          </strong>

          <p>
            ${escapeHTML(item.text)}
          </p>

        </div>

      `)
      .join("");

}


/* =========================================================
   38. TRAINING RECOMMENDATIONS
========================================================= */

function createTrainingRecommendations(
  summary
) {

  const training = [];


  if (
    summary.symmetry < 80
  ) {

    training.push({

      category:
        "좌우 균형",

      name:
        "스플릿 스쿼트",

      description:
        "좌우 다리를 독립적으로 사용하며 균형과 하체 제어를 연습합니다."

    });

  }


  if (
    summary.stability < 80
  ) {

    training.push({

      category:
        "안정성",

      name:
        "싱글 레그 밸런스",

      description:
        "한발 지지 자세에서 골반과 몸통을 안정적으로 유지하는 연습을 합니다."

    });

  }


  if (
    summary.maximumTrunk > 40
  ) {

    training.push({

      category:
        "코어",

      name:
        "플랭크",

      description:
        "몸통 정렬을 유지하는 기본 코어 안정성 훈련입니다."

    });

  }


  if (
    summary.mobility < 75
  ) {

    training.push({

      category:
        "가동성",

      name:
        "딥 스쿼트 모빌리티",

      description:
        "통증 없는 범위에서 발목·고관절 움직임을 천천히 확인합니다."

    });

  }


  if (
    summary.power < 75
  ) {

    training.push({

      category:
        "파워",

      name:
        "기초 점프 착지",

      description:
        "낮은 강도의 점프에서 안정적인 이륙과 착지 패턴을 먼저 연습합니다."

    });

  }


  training.push({

    category:
      "기술",

    name:
      "슬로모션 동작 연습",

    description:
      "영상에서 가장 불안정한 구간을 찾아 천천히 같은 자세를 반복합니다."

  });


  return training.slice(
    0,
    5
  );

}


/* =========================================================
   39. ANALYSIS STATE
========================================================= */

function setAnalysisState(
  text
) {

  if ($("analysisState")) {

    $("analysisState")
      .textContent =
        text;

  }


  const light =
    $("analysisStateLight");

  if (!light) {
    return;
  }


  if (
    text === "ANALYSING"
  ) {

    light.style.background =
      "#39c6ff";

  }

  else if (
    text === "COMPLETE"
  ) {

    light.style.background =
      "#45e49b";

  }

  else {

    light.style.background =
      "#ffc75c";

  }

}


function setSystemState(
  text,
  error = false
) {

  const el =
    $("aiSystemStatus");

  if (!el) {
    return;
  }


  el.innerHTML = `
    <span></span>
    ${escapeHTML(text)}
  `;


  if (error) {

    const dot =
      el.querySelector("span");

    if (dot) {

      dot.style.background =
        "#ff6174";

    }

  }

}


/* =========================================================
   40. RESET ANALYSIS DATA
========================================================= */

function resetAnalysisData() {

  APP.analysedFrames = 0;

  APP.validPoseFrames = 0;

  APP.confidenceTotal = 0;

  APP.repCount = 0;

  APP.repState = "READY";

  APP.previousRepState =
    "READY";

  APP.trajectory = [];

  APP.keyFrames = [];

  APP.angleHistory = [];

  APP.latestAngles = null;

  APP.latestMetrics = null;

  APP.lastAutoCapture = 0;

  APP.lastFrameTime = -1;


  if ($("analysedFrameCount")) {

    $("analysedFrameCount")
      .textContent = "0";

  }


  if ($("poseConfidence")) {

    $("poseConfidence")
      .textContent = "--%";

  }


  if ($("personDetection")) {

    $("personDetection")
      .textContent = "대기";

  }


  resetRepCounter();

  renderKeyFrames();


  if ($("analysisProgressText")) {

    $("analysisProgressText")
      .textContent = "0%";

  }


  if ($("analysisProgressBar")) {

    $("analysisProgressBar")
      .style.width = "0%";

  }


  if ($("analysisFeedback")) {

    $("analysisFeedback")
      .innerHTML = `

        <div class="empty-state">
          분석을 완료하면 피드백이 표시됩니다.
        </div>

      `;

  }


  $("analysisCompletePanel")
    ?.classList.add(
      "hidden"
    );


  $("openReportButton")
    .disabled = true;


  [
    "angleLeftKnee",
    "angleRightKnee",
    "angleLeftHip",
    "angleRightHip",
    "angleLeftAnkle",
    "angleRightAnkle",
    "angleTrunk",
    "angleAsymmetry"
  ]
    .forEach(id => {

      if ($(id)) {

        $(id).textContent =
          "--";

      }

    });


  [
    [
      "metricTechnique",
      "metricTechniqueBar"
    ],

    [
      "metricStability",
      "metricStabilityBar"
    ],

    [
      "metricSymmetry",
      "metricSymmetryBar"
    ],

    [
      "metricPower",
      "metricPowerBar"
    ]
  ]
    .forEach(
      ([value, bar]) => {

        if ($(value)) {

          $(value).textContent =
            "--";

        }

        if ($(bar)) {

          $(bar).style.width =
            "0%";

        }

      }
    );


  [
    "minimumKneeAngle",
    "maximumKneeAngle",
    "maximumTrunkAngle",
    "averageAsymmetry"
  ]
    .forEach(id => {

      if ($(id)) {

        $(id).textContent =
          "--";

      }

    });


  clearCanvas(
    $("skeletonCanvas")
  );

  clearCanvas(
    $("trajectoryCanvas")
  );


  if (APP.chart) {

    APP.chart.data.labels =
      [];

    APP.chart.data.datasets
      .forEach(dataset => {

        dataset.data =
          [];

      });

    APP.chart.update();

  }


  setAnalysisState(
    "STANDBY"
  );

}


function resetAnalysis() {

  if (APP.analysing) {

    APP.analysing =
      false;

    clearTimeout(
      APP.analysisTimer
    );

  }


  const video =
    $("analysisVideo");


  if (video) {

    video.pause();

    video.currentTime = 0;

  }


  resetAnalysisData();

  showToast(
    "분석을 초기화했습니다."
  );

}


function clearCanvas(
  canvas
) {

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
   41. RECORDS
========================================================= */

function renderRecords() {

  const container =
    $("recordList");

  if (!container) {
    return;
  }


  const athleteFilter =
    $("recordAthleteFilter")
      ?.value || "";


  const records =
    athleteFilter
      ? APP.records.filter(
          record =>
            record.athleteId ===
            athleteFilter
        )
      : APP.records;


  $("recordCount")
    .textContent =
      records.length;


  if (!records.length) {

    container.innerHTML = `
      <div class="empty-state">
        분석 기록이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    records
      .map(record => `

        <div class="record-card">

          <div>

            <strong>
              ${
                escapeHTML(
                  record.athlete
                    ?.name ||
                  "선수 미지정"
                )
              }
              ·
              ${
                escapeHTML(
                  record.eventName
                )
              }
            </strong>

            <p>
              ${
                formatDate(
                  record.createdAt
                )
              }
              ·
              ${record.summary.score}/100
              ·
              ${record.reps || 0}회
            </p>

          </div>


          <div class="card-actions">

            <button
              type="button"
              data-open-record="${record.id}"
            >
              리포트
            </button>

            <button
              type="button"
              data-delete-record="${record.id}"
            >
              삭제
            </button>

          </div>

        </div>

      `)
      .join("");


  $$("[data-open-record]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const record =
            APP.records.find(
              item =>
                item.id ===
                button.dataset.openRecord
            );

          if (!record) {
            return;
          }

          APP.currentRecord =
            record;

          goPage("report");

        }
      );

    });


  $$("[data-delete-record]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset
              .deleteRecord;

          APP.records =
            APP.records.filter(
              item =>
                item.id !== id
            );

          saveRecords();

          renderRecords();

          renderDashboard();

          showToast(
            "분석 기록 삭제 완료"
          );

        }
      );

    });

}


/* =========================================================
   42. REPORT
========================================================= */

function renderReport() {

  const record =
    APP.currentRecord;


  if (!record) {

    $("reportEmpty")
      ?.classList.remove(
        "hidden"
      );

    $("reportBody")
      ?.classList.add(
        "hidden"
      );

    return;

  }


  $("reportEmpty")
    ?.classList.add(
      "hidden"
    );

  $("reportBody")
    ?.classList.remove(
      "hidden"
    );


  const athlete =
    record.athlete;


  setText(
    "reportAthlete",
    athlete?.name ||
    "선수 미지정"
  );

  setText(
    "reportGrade",
    athlete?.grade ||
    "-"
  );

  setText(
    "reportHeight",
    athlete?.height
      ? `${athlete.height} cm`
      : "-"
  );

  setText(
    "reportWeight",
    athlete?.weight
      ? `${athlete.weight} kg`
      : "-"
  );

  setText(
    "reportEvent",
    record.eventName
  );

  setText(
    "reportDate",
    formatDate(
      record.createdAt
    )
  );

  setText(
    "reportScore",
    record.summary.score
  );

  setText(
    "reportScoreGrade",
    record.summary.grade
  );

  setText(
    "reportVideo",
    record.videoName
  );

  setText(
    "reportFrames",
    record.frameCount
  );

  setText(
    "reportReps",
    record.reps || 0
  );

  setText(
    "reportConfidence",
    `${record.confidence || 0}%`
  );


  renderReportMetrics(
    record
  );

  renderReportKeyFrames(
    record
  );

  renderReportRanges(
    record
  );

  renderReportFeedback(
    record
  );

  renderTrainingProgram(
    record
  );

  renderReportRadar(
    record
  );

  renderReportAngleChart(
    record
  );

}


function renderReportMetrics(
  record
) {

  const container =
    $("reportMetrics");

  if (!container) {
    return;
  }


  const metrics = [

    [
      "기술",
      record.summary.technique
    ],

    [
      "안정성",
      record.summary.stability
    ],

    [
      "대칭성",
      record.summary.symmetry
    ],

    [
      "파워",
      record.summary.power
    ],

    [
      "가동성",
      record.summary.mobility
    ],

    [
      "협응성",
      record.summary.coordination
    ]

  ];


  container.innerHTML =
    metrics
      .map(
        ([name, value]) => `

          <div class="report-metric-card">

            <span>
              ${name}
            </span>

            <strong>
              ${value}
            </strong>

          </div>

        `
      )
      .join("");

}


function renderReportKeyFrames(
  record
) {

  const container =
    $("reportKeyFrames");

  if (!container) {
    return;
  }


  if (
    !record.keyFrames?.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        저장된 핵심 자세가 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    record.keyFrames
      .map(frame => `

        <article class="key-frame-card">

          <img
            src="${frame.image}"
            alt="핵심 자세"
          >

          <div class="key-frame-info">

            <strong>
              ${escapeHTML(frame.label)}
            </strong>

            <span>
              ${formatTime(frame.time)}
            </span>

            <p>
              ${
                createFrameFeedback(
                  frame
                )
              }
            </p>

          </div>

        </article>

      `)
      .join("");

}


function createFrameFeedback(
  frame
) {

  if (!frame.angles) {

    return "핵심 자세 프레임";

  }


  const knee =
    Math.round(
      (
        frame.angles.leftKnee +
        frame.angles.rightKnee
      ) / 2
    );


  const asymmetry =
    Math.round(
      frame.angles.asymmetry
    );


  return (
    `평균 무릎각 ${knee}°, ` +
    `좌우 차이 ${asymmetry}°.`
  );

}


function renderReportRanges(
  record
) {

  const container =
    $("reportAngleRanges");

  if (!container) {
    return;
  }


  const s =
    record.summary;


  container.innerHTML = `

    <div>
      <span>최저 무릎각</span>
      <strong>${s.minimumKnee}°</strong>
    </div>

    <div>
      <span>최고 무릎각</span>
      <strong>${s.maximumKnee}°</strong>
    </div>

    <div>
      <span>최대 몸통 기울기</span>
      <strong>${s.maximumTrunk}°</strong>
    </div>

    <div>
      <span>평균 좌우 차이</span>
      <strong>${s.averageAsymmetry}°</strong>
    </div>

  `;

}


function renderReportFeedback(
  record
) {

  const container =
    $("reportFeedback");

  if (!container) {
    return;
  }


  container.innerHTML =
    (record.feedback || [])
      .map(item => `

        <div class="feedback-item">

          <strong>
            ${escapeHTML(item.title)}
          </strong>

          <p>
            ${escapeHTML(item.text)}
          </p>

        </div>

      `)
      .join("");

}


function renderTrainingProgram(
  record
) {

  const container =
    $("trainingProgram");

  if (!container) {
    return;
  }


  container.innerHTML =
    (record.training || [])
      .map(item => `

        <article class="training-card">

          <span>
            ${escapeHTML(item.category)}
          </span>

          <h4>
            ${escapeHTML(item.name)}
          </h4>

          <p>
            ${escapeHTML(item.description)}
          </p>

        </article>

      `)
      .join("");

}


/* =========================================================
   43. REPORT RADAR
========================================================= */

function renderReportRadar(
  record
) {

  const canvas =
    $("reportRadarChart");

  if (
    !canvas ||
    typeof Chart ===
      "undefined"
  ) {
    return;
  }


  if (
    APP.reportRadarChart
  ) {

    APP.reportRadarChart
      .destroy();

  }


  const s =
    record.summary;


  APP.reportRadarChart =
    new Chart(
      canvas,
      {

        type: "radar",

        data: {

          labels: [
            "기술",
            "안정성",
            "대칭성",
            "파워",
            "가동성",
            "협응성"
          ],

          datasets: [

            {

              label:
                "PERFORMANCE",

              data: [
                s.technique,
                s.stability,
                s.symmetry,
                s.power,
                s.mobility,
                s.coordination
              ],

              borderWidth: 2,

              pointRadius: 3,

              fill: true

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          scales: {

            r: {

              min: 0,

              max: 100,

              ticks: {

                display: false

              },

              pointLabels: {

                color:
                  "#b9c8d8"

              },

              grid: {

                color:
                  "rgba(255,255,255,.08)"

              },

              angleLines: {

                color:
                  "rgba(255,255,255,.08)"

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
   44. REPORT ANGLE CHART
========================================================= */

function renderReportAngleChart(
  record
) {

  const canvas =
    $("reportAngleChart");

  if (
    !canvas ||
    typeof Chart ===
      "undefined"
  ) {
    return;
  }


  if (
    APP.reportAngleChart
  ) {

    APP.reportAngleChart
      .destroy();

  }


  const history =
    record.angleHistory || [];


  APP.reportAngleChart =
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
                )
                  .toFixed(1)
            ),

          datasets: [

            {

              label:
                "왼쪽 무릎",

              data:
                history.map(
                  item =>
                    Math.round(
                      item.leftKnee
                    )
                ),

              pointRadius: 0,

              borderWidth: 2,

              tension: 0.25

            },

            {

              label:
                "오른쪽 무릎",

              data:
                history.map(
                  item =>
                    Math.round(
                      item.rightKnee
                    )
                ),

              pointRadius: 0,

              borderWidth: 2,

              tension: 0.25

            },

            {

              label:
                "몸통",

              data:
                history.map(
                  item =>
                    Math.round(
                      item.trunk
                    )
                ),

              pointRadius: 0,

              borderWidth: 2,

              tension: 0.25

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio:
            false,

          animation: false,

          scales: {

            y: {

              suggestedMin: 0,

              suggestedMax: 180,

              ticks: {

                color:
                  "#8195aa"

              },

              grid: {

                color:
                  "rgba(255,255,255,.06)"

              }

            },

            x: {

              ticks: {

                color:
                  "#8195aa",

                maxTicksLimit: 10

              },

              grid: {

                color:
                  "rgba(255,255,255,.04)"

              }

            }

          },

          plugins: {

            legend: {

              labels: {

                color:
                  "#b6c5d4"

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   45. DASHBOARD
========================================================= */

function renderDashboard() {

  setText(
    "statAthletes",
    APP.athletes.length
  );

  setText(
    "statAnalyses",
    APP.records.length
  );


  const averageScore =
    APP.records.length
      ? Math.round(
          average(
            APP.records.map(
              record =>
                record.summary
                  ?.score || 0
            )
          )
        )
      : "--";


  setText(
    "statAverageScore",
    averageScore
  );


  const keyFrameTotal =
    APP.records.reduce(
      (sum, record) =>
        sum +
        (
          record.keyFrames
            ?.length || 0
        ),
      0
    );


  setText(
    "statKeyFrames",
    keyFrameTotal
  );


  const latest =
    APP.records[0];


  if (latest) {

    setDashboardMetric(
      "dashTechnique",
      "dashTechniqueBar",
      latest.summary.technique
    );

    setDashboardMetric(
      "dashStability",
      "dashStabilityBar",
      latest.summary.stability
    );

    setDashboardMetric(
      "dashSymmetry",
      "dashSymmetryBar",
      latest.summary.symmetry
    );

    setDashboardMetric(
      "dashPower",
      "dashPowerBar",
      latest.summary.power
    );

  } else {

    [
      [
        "dashTechnique",
        "dashTechniqueBar"
      ],

      [
        "dashStability",
        "dashStabilityBar"
      ],

      [
        "dashSymmetry",
        "dashSymmetryBar"
      ],

      [
        "dashPower",
        "dashPowerBar"
      ]

    ]
      .forEach(
        ([value, bar]) => {

          setText(
            value,
            "--"
          );

          if ($(bar)) {

            $(bar).style.width =
              "0%";

          }

        }
      );

  }


  renderRecentAnalysis();

}


function setDashboardMetric(
  valueId,
  barId,
  value
) {

  setText(
    valueId,
    value
  );


  if ($(barId)) {

    $(barId)
      .style.width =
        `${clamp(
          value,
          0,
          100
        )}%`;

  }

}


function renderRecentAnalysis() {

  const container =
    $("recentAnalysisList");

  if (!container) {
    return;
  }


  const records =
    APP.records.slice(
      0,
      5
    );


  if (!records.length) {

    container.innerHTML = `
      <div class="empty-state">
        아직 분석 기록이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    records
      .map(record => `

        <div class="recent-card">

          <div>

            <strong>
              ${
                escapeHTML(
                  record.athlete
                    ?.name ||
                  "선수 미지정"
                )
              }
            </strong>

            <p>
              ${
                escapeHTML(
                  record.eventName
                )
              }
              ·
              ${
                formatDate(
                  record.createdAt
                )
              }
            </p>

          </div>

          <strong>
            ${record.summary.score}
          </strong>

        </div>

      `)
      .join("");

}


/* =========================================================
   46. SETTINGS
========================================================= */

function bindSettings() {

  const pairs = [

    [
      "settingSkeleton",
      "showSkeleton"
    ],

    [
      "settingAngles",
      "showAngles"
    ],

    [
      "settingTrajectory",
      "showTrajectory"
    ],

    [
      "settingCenter",
      "showCenter"
    ]

  ];


  pairs.forEach(
    ([settingId, analysisId]) => {

      $(settingId)
        ?.addEventListener(
          "change",
          event => {

            if ($(analysisId)) {

              $(analysisId).checked =
                event.target.checked;

            }

          }
        );

    }
  );


  $("clearRecordsButton")
    ?.addEventListener(
      "click",
      () => {

        if (!APP.records.length) {

          showToast(
            "삭제할 분석 기록이 없습니다."
          );

          return;

        }


        const ok =
          confirm(
            "분석 기록을 모두 삭제할까요?"
          );


        if (!ok) {
          return;
        }


        APP.records = [];

        APP.currentRecord =
          null;

        saveRecords();

        renderDashboard();

        renderRecords();

        renderReport();

        showToast(
          "분석 기록 전체 삭제 완료"
        );

      }
    );


  $("printReport")
    ?.addEventListener(
      "click",
      () => {

        window.print();

      }
    );


  $("recordAthleteFilter")
    ?.addEventListener(
      "change",
      renderRecords
    );

}


/* =========================================================
   47. OPTIONS REDRAW
========================================================= */

function bindDisplayOptions() {

  [
    "showSkeleton",
    "showAngles",
    "showCenter",
    "showReference"
  ]
    .forEach(id => {

      $(id)
        ?.addEventListener(
          "change",
          () => {

            if (
              APP.latestAngles &&
              APP.analysing
            ) {

              /*
                다음 pose frame에서 자동 redraw.
              */

            }

          }
        );

    });


  $("showTrajectory")
    ?.addEventListener(
      "change",
      () => {

        if (
          !$("showTrajectory")
            .checked
        ) {

          clearCanvas(
            $("trajectoryCanvas")
          );

        }

      }
    );

}


/* =========================================================
   48. HELPERS
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


function formatDate(
  value
) {

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
   49. ERROR HANDLING
========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "[GLOBAL ERROR]",
      event.error ||
      event.message
    );

    /*
      한 기능에서 오류가 나더라도
      bootStatus가 무조건 전체 화면을 막지 않도록 한다.
    */

  }
);


window.addEventListener(
  "unhandledrejection",
  event => {

    console.error(
      "[PROMISE ERROR]",
      event.reason
    );

  }
);


/* =========================================================
   50. INITIALISE
========================================================= */

function initialiseApp() {

  try {

    setBootStatus(
      "SYSTEM INITIALIZING..."
    );


    if (
      !window.SC_EVENTS ||
      !window.SC_EVENT_UTILS
    ) {

      throw new Error(
        "events.js가 로드되지 않았습니다."
      );

    }


    loadAppData();


    startClock();


    bindNavigation();

    bindSidebar();

    bindAthleteForm();

    bindEventLibrary();

    bindVideoUpload();

    bindVideoPlayer();

    bindAnalysisControls();

    bindSettings();

    bindDisplayOptions();


    populateAthleteSelectors();

    populateEventSelector();


    renderAthletes();

    renderEventLibrary();

    renderRecords();

    renderDashboard();

    renderKeyFrames();


    initialiseAngleChart();


    /*
      기본 분석 종목 = 일반 스쿼트
    */

    if (
      !APP.selectedEventId &&
      window.SC_EVENT_UTILS
        .getEvent("squat")
    ) {

      APP.selectedEventId =
        "squat";

      if ($("analysisEvent")) {

        $("analysisEvent")
          .value =
            "squat";

      }

      if ($("videoAnalysisTitle")) {

        $("videoAnalysisTitle")
          .textContent =
            "스쿼트 분석";

      }

    }


    setSystemState(
      "AI READY"
    );


    setBootStatus(
      "SYSTEM READY"
    );


    hideBootStatus();


    console.log(
      "%cSEOLCHEON PE PERFORMANCE LAB PRO 3.0 READY",
      "color:#39c6ff;font-size:14px;font-weight:bold;"
    );


    console.log(
      `[SYSTEM] ${
        window.SC_EVENTS.length
      }개 종목 로드`
    );


  } catch (error) {

    console.error(
      "[BOOT ERROR]",
      error
    );


    setBootStatus(
      `ERROR: ${error.message}`,
      true
    );


    alert(
      "프로그램 시작 중 오류가 발생했습니다.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   51. DOM READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialiseApp
  );

} else {

  initialiseApp();

}