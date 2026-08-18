/* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS
   VERSION 2.0

   VIDEO MOTION ANALYSIS SYSTEM
========================================================= */

"use strict";


/* =========================================================
   01. CONFIG
========================================================= */

const APP = {
  version: "2.0",

  storage: {
    athletes: "sc_pe_athletes_v2",
    analyses: "sc_pe_analyses_v2",
    settings: "sc_pe_settings_v2"
  }
};


/* =========================================================
   02. GLOBAL STATE
========================================================= */

const STATE = {
  page: "dashboard",

  athletes: [],
  analyses: [],

  selectedEventId: "",
  selectedAthleteId: "",

  videoFile: null,
  videoURL: null,

  pose: null,
  poseReady: false,

  analysing: false,
  sendingFrame: false,

  analysisTimer: null,
  analysisStartedAt: 0,

  frameCount: 0,

  frames: [],
  keyFrames: [],

  trajectories: {
    hip: [],
    leftAnkle: [],
    rightAnkle: []
  },

  lastLandmarks: null,
  lastAngles: null,

  repetition: {
    count: 0,
    phase: "READY",
    armed: true
  },

  special: {
    jumpHeight: null,
    flightTime: null,
    takeoffAngle: null,
    cadence: null,
    stepCount: 0
  },

  metrics: {
    speed: 0,
    power: 0,
    agility: 0,
    stability: 0,
    symmetry: 0,
    technique: 0
  },

  currentReport: null,

  angleChart: null,
  reportAngleChart: null,
  radarChart: null
};


/* =========================================================
   03. DOM HELPERS
========================================================= */

const $ = id => document.getElementById(id);

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values) {
  const valid = values.filter(Number.isFinite);

  if (!valid.length) return 0;

  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function round(value, digits = 0) {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   04. STORAGE
========================================================= */

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch (error) {
    console.warn("Storage load error:", key, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Storage save error:", key, error);
    return false;
  }
}

function saveAthletes() {
  saveJSON(APP.storage.athletes, STATE.athletes);
}

function saveAnalyses() {
  saveJSON(APP.storage.analyses, STATE.analyses);
}


/* =========================================================
   05. TOAST
========================================================= */

let toastTimer = null;

function toast(message) {
  const element = $("toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}


/* =========================================================
   06. CLOCK
========================================================= */

function startClock() {
  const update = () => {
    const element = $("clock");

    if (!element) return;

    element.textContent = new Date().toLocaleTimeString("ko-KR", {
      hour12: false
    });
  };

  update();

  setInterval(update, 1000);
}


/* =========================================================
   07. NAVIGATION
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

function openPage(page) {
  STATE.page = page;

  document.querySelectorAll(".page").forEach(section => {
    section.classList.toggle(
      "active",
      section.dataset.pageSection === page
    );
  });

  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  if ($("pageTitle")) {
    $("pageTitle").textContent =
      PAGE_TITLES[page] || "PE PERFORMANCE LAB";
  }

  closeMobileMenu();

  if (page === "dashboard") renderDashboard();
  if (page === "athletes") renderAthletes();
  if (page === "events") renderEvents();
  if (page === "analysis") refreshAnalysisSelectors();
  if (page === "records") renderRecords();
  if (page === "report") renderReport();
}

function setupNavigation() {
  document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
      openPage(button.dataset.page);
    });
  });

  $("dashboardStartAnalysisButton")?.addEventListener(
    "click",
    () => openPage("analysis")
  );

  $("reportEmptyAnalysisButton")?.addEventListener(
    "click",
    () => openPage("analysis")
  );

  $("reportBackAnalysisButton")?.addEventListener(
    "click",
    () => openPage("analysis")
  );
}


/* =========================================================
   08. MOBILE MENU
========================================================= */

function openMobileMenu() {
  $("sidebar")?.classList.add("open");
  $("sidebarOverlay")?.classList.add("show");
}

function closeMobileMenu() {
  $("sidebar")?.classList.remove("open");
  $("sidebarOverlay")?.classList.remove("show");
}

function setupMobileMenu() {
  $("mobileMenuButton")?.addEventListener(
    "click",
    openMobileMenu
  );

  $("sidebarOverlay")?.addEventListener(
    "click",
    closeMobileMenu
  );
}


/* =========================================================
   09. ATHLETES
========================================================= */

function setupAthleteForm() {
  $("athleteForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const name = $("athleteNameInput")?.value.trim();

    if (!name) {
      toast("선수 이름을 입력해줘.");
      return;
    }

    const athlete = {
      id: uid("athlete"),
      name,
      grade: $("athleteGradeInput")?.value || "",
      gender: $("athleteGenderInput")?.value || "",
      height: Number($("athleteHeightInput")?.value) || null,
      weight: Number($("athleteWeightInput")?.value) || null,
      sport: $("athleteSportInput")?.value.trim() || "",
      memo: $("athleteMemoInput")?.value.trim() || "",
      createdAt: new Date().toISOString()
    };

    STATE.athletes.unshift(athlete);

    saveAthletes();

    $("athleteForm").reset();

    renderAthletes();
    refreshAnalysisSelectors();
    renderDashboard();

    toast(`${athlete.name} 선수 저장 완료`);
  });
}

function deleteAthlete(id) {
  const athlete = STATE.athletes.find(a => a.id === id);

  if (!athlete) return;

  if (!confirm(`${athlete.name} 선수를 삭제할까요?`)) {
    return;
  }

  STATE.athletes =
    STATE.athletes.filter(a => a.id !== id);

  saveAthletes();

  renderAthletes();
  refreshAnalysisSelectors();
  renderDashboard();

  toast("선수 삭제 완료");
}

function analyseAthlete(id) {
  STATE.selectedAthleteId = id;

  refreshAnalysisSelectors();

  if ($("analysisAthleteSelect")) {
    $("analysisAthleteSelect").value = id;
  }

  openPage("analysis");
}

function renderAthletes() {
  const list = $("athleteList");

  if (!list) return;

  $("athleteCountBadge").textContent =
    STATE.athletes.length;

  if (!STATE.athletes.length) {
    list.innerHTML = `
      <div class="empty-state">
        등록된 선수가 없습니다.
      </div>
    `;
    return;
  }

  list.innerHTML = STATE.athletes.map(athlete => `
    <article class="athlete-item">
      <div>
        <strong>${escapeHTML(athlete.name)}</strong>

        <span>
          ${escapeHTML(athlete.grade || "-")}
          ·
          ${escapeHTML(athlete.sport || "종목 미등록")}
        </span>
      </div>

      <div class="athlete-item-actions">
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
    </article>
  `).join("");

  list
    .querySelectorAll("[data-athlete-analysis]")
    .forEach(button => {
      button.addEventListener("click", () => {
        analyseAthlete(
          button.dataset.athleteAnalysis
        );
      });
    });

  list
    .querySelectorAll("[data-athlete-delete]")
    .forEach(button => {
      button.addEventListener("click", () => {
        deleteAthlete(
          button.dataset.athleteDelete
        );
      });
    });
}


/* =========================================================
   10. EVENT DATA
========================================================= */

function getEventData() {
  return window.PE_EVENT_DATA || null;
}

function getEvents() {
  return getEventData()?.events || [];
}

function getSelectedEvent() {
  return getEventData()?.getEventById(
    $("analysisEventSelect")?.value ||
    STATE.selectedEventId
  );
}


/* =========================================================
   11. EVENT PAGE
========================================================= */

let activeEventCategory = "all";

function renderEventCategories() {
  const root = $("eventCategoryButtons");
  const data = getEventData();

  if (!root || !data) return;

  root.innerHTML = data.categories.map(category => `
    <button
      type="button"
      class="${activeEventCategory === category.id ? "active" : ""}"
      data-event-category="${category.id}"
    >
      ${category.icon}
      ${escapeHTML(category.name)}
    </button>
  `).join("");

  root
    .querySelectorAll("[data-event-category]")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeEventCategory =
          button.dataset.eventCategory;

        renderEvents();
      });
    });
}

function renderEvents() {
  renderEventCategories();

  const grid = $("eventGrid");
  const data = getEventData();

  if (!grid || !data) return;

  const keyword =
    $("eventSearchInput")?.value.trim() || "";

  let events =
    data.getEventsByCategory(activeEventCategory);

  if (keyword) {
    const searched = data.searchEvents(keyword);
    const ids = new Set(searched.map(item => item.id));

    events = events.filter(item =>
      ids.has(item.id)
    );
  }

  if (!events.length) {
    grid.innerHTML = `
      <div class="empty-state">
        검색된 종목이 없습니다.
      </div>
    `;
    return;
  }

  grid.innerHTML = events.map(event => `
    <button
      type="button"
      class="event-card"
      data-event-id="${event.id}"
    >
      <span class="event-card-icon">
        ${event.icon || "◆"}
      </span>

      <strong>
        ${escapeHTML(event.name)}
      </strong>

      <span>
        ${escapeHTML(event.ability || "")}
      </span>

      <small>
        ${escapeHTML(event.description || "")}
      </small>
    </button>
  `).join("");

  grid
    .querySelectorAll("[data-event-id]")
    .forEach(button => {
      button.addEventListener("click", () => {
        selectEventForAnalysis(
          button.dataset.eventId
        );
      });
    });
}

function selectEventForAnalysis(eventId) {
  STATE.selectedEventId = eventId;

  refreshAnalysisSelectors();

  if ($("analysisEventSelect")) {
    $("analysisEventSelect").value = eventId;
  }

  updateAnalysisEventTitle();

  openPage("analysis");

  toast("종목을 선택했어. 영상을 업로드해줘.");
}


/* =========================================================
   12. ANALYSIS SELECTORS
========================================================= */

function refreshAnalysisSelectors() {
  const athleteSelect =
    $("analysisAthleteSelect");

  const eventSelect =
    $("analysisEventSelect");

  if (athleteSelect) {
    const current =
      athleteSelect.value ||
      STATE.selectedAthleteId;

    athleteSelect.innerHTML = `
      <option value="">선수 선택</option>

      ${STATE.athletes.map(athlete => `
        <option value="${athlete.id}">
          ${escapeHTML(athlete.name)}
        </option>
      `).join("")}
    `;

    if (
      current &&
      STATE.athletes.some(a => a.id === current)
    ) {
      athleteSelect.value = current;
    }
  }

  if (eventSelect) {
    const current =
      eventSelect.value ||
      STATE.selectedEventId;

    eventSelect.innerHTML = `
      <option value="">종목 선택</option>

      ${getEvents().map(event => `
        <option value="${event.id}">
          ${escapeHTML(event.name)}
        </option>
      `).join("")}
    `;

    if (
      current &&
      getEvents().some(e => e.id === current)
    ) {
      eventSelect.value = current;
    }
  }

  updateAnalysisEventTitle();
}

function updateAnalysisEventTitle() {
  const event = getSelectedEvent();

  $("analysisEventTitle").textContent =
    event
      ? `${event.name} 분석 영상`
      : "분석 영상";
}


/* =========================================================
   13. VIDEO UPLOAD
========================================================= */

function setupVideoUpload() {
  $("selectVideoButton")?.addEventListener(
    "click",
    () => $("videoFileInput")?.click()
  );

  $("videoFileInput")?.addEventListener(
    "change",
    event => {
      const file = event.target.files?.[0];

      if (file) {
        loadVideo(file);
      }
    }
  );
}

function loadVideo(file) {
  const video = $("analysisVideo");

  if (!video) return;

  stopAnalysis(false);

  if (STATE.videoURL) {
    URL.revokeObjectURL(STATE.videoURL);
  }

  STATE.videoFile = file;
  STATE.videoURL = URL.createObjectURL(file);

  video.src = STATE.videoURL;
  video.load();

  $("videoEmptyState")?.classList.add("hidden");

  resetAnalysisData(false);

  setAnalysisStatus("VIDEO READY");

  toast(`영상 선택: ${file.name}`);
}


/* =========================================================
   14. VIDEO EVENTS
========================================================= */

function setupVideoEvents() {
  const video = $("analysisVideo");

  if (!video) return;

  video.addEventListener("loadedmetadata", () => {
    syncCanvasSize();

    $("videoDuration").textContent =
      formatTime(video.duration);

    $("videoTimeline").max =
      video.duration || 0;
  });

  video.addEventListener("timeupdate", () => {
    $("videoCurrentTime").textContent =
      formatTime(video.currentTime);

    if (!$("videoTimeline").matches(":active")) {
      $("videoTimeline").value =
        video.currentTime || 0;
    }
  });

  video.addEventListener("play", () => {
    $("playPauseButton").textContent = "❚❚";
  });

  video.addEventListener("pause", () => {
    $("playPauseButton").textContent = "▶";
  });

  video.addEventListener("ended", () => {
    $("playPauseButton").textContent = "▶";

    if (STATE.analysing) {
      stopAnalysis(true);
    }
  });

  window.addEventListener(
    "resize",
    syncCanvasSize
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00.00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hundredths =
    Math.floor((seconds % 1) * 100);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0") +
    "." +
    String(hundredths).padStart(2, "0")
  );
}


/* =========================================================
   15. VIDEO CONTROLS
========================================================= */

function setupVideoControls() {
  const video = $("analysisVideo");

  $("playPauseButton")?.addEventListener(
    "click",
    async () => {
      if (!STATE.videoFile) {
        toast("먼저 영상을 선택해줘.");
        return;
      }

      if (video.paused) {
        try {
          await video.play();
        } catch (error) {
          console.warn(error);
        }
      } else {
        video.pause();
      }
    }
  );

  $("previousFrameButton")?.addEventListener(
    "click",
    () => {
      if (!STATE.videoFile) return;

      video.pause();

      video.currentTime =
        Math.max(
          0,
          video.currentTime - 1 / 30
        );
    }
  );

  $("nextFrameButton")?.addEventListener(
    "click",
    () => {
      if (!STATE.videoFile) return;

      video.pause();

      video.currentTime =
        Math.min(
          video.duration || Infinity,
          video.currentTime + 1 / 30
        );
    }
  );

  $("videoTimeline")?.addEventListener(
    "input",
    event => {
      video.currentTime =
        Number(event.target.value) || 0;
    }
  );

  $("playbackSpeedSelect")?.addEventListener(
    "change",
    event => {
      video.playbackRate =
        Number(event.target.value) || 1;
    }
  );

  $("slowMotionButton")?.addEventListener(
    "click",
    () => {
      video.playbackRate = 0.5;

      if ($("playbackSpeedSelect")) {
        $("playbackSpeedSelect").value = "0.5";
      }

      toast("0.5× 슬로모션");
    }
  );

  $("captureFrameButton")?.addEventListener(
    "click",
    () => captureKeyFrame("수동 캡처")
  );
}


/* =========================================================
   16. CANVAS
========================================================= */

function syncCanvasSize() {
  const video = $("analysisVideo");

  if (!video?.videoWidth) return;

  [
    $("poseCanvas"),
    $("trajectoryCanvas")
  ].forEach(canvas => {
    if (!canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
}

function clearAnalysisCanvas() {
  [
    $("poseCanvas"),
    $("trajectoryCanvas")
  ].forEach(canvas => {
    if (!canvas) return;

    canvas
      .getContext("2d")
      .clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
  });
}


/* =========================================================
   17. MEDIAPIPE POSE
========================================================= */

async function initialisePose() {
  if (STATE.poseReady) return true;

  if (typeof Pose === "undefined") {
    setAnalysisStatus("AI LOAD ERROR");

    toast(
      "MediaPipe를 불러오지 못했어. 인터넷 연결을 확인해줘."
    );

    return false;
  }

  try {
    const pose = new Pose({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55
    });

    pose.onResults(handlePoseResults);

    STATE.pose = pose;
    STATE.poseReady = true;

    return true;
  } catch (error) {
    console.error("Pose init error:", error);

    setAnalysisStatus("AI ERROR");

    toast("자세분석 AI 초기화에 실패했어.");

    return false;
  }
}


/* =========================================================
   18. ANALYSIS START
========================================================= */

async function startAnalysis() {
  const video = $("analysisVideo");

  if (!STATE.videoFile) {
    toast("분석할 영상을 먼저 선택해줘.");
    return;
  }

  if (!$("analysisEventSelect")?.value) {
    toast("분석 종목을 선택해줘.");
    return;
  }

  const ready = await initialisePose();

  if (!ready) return;

  resetAnalysisData(false);

  STATE.analysing = true;
  STATE.analysisStartedAt = performance.now();

  $("startAnalysisButton").disabled = true;
  $("stopAnalysisButton").disabled = false;
  $("finishReportButton").disabled = true;

  $("analysisSummaryPanel")
    ?.classList.add("hidden");

  setAnalysisStatus("ANALYSING");

  const interval =
    Number(
      $("analysisFrameRateSelect")?.value
    ) || 150;

  STATE.analysisTimer =
    setInterval(processVideoFrame, interval);

  if (video.paused) {
    try {
      await video.play();
    } catch (error) {
      console.warn(error);
    }
  }

  toast("영상 자세분석 시작");
}


/* =========================================================
   19. PROCESS FRAME
========================================================= */

async function processVideoFrame() {
  if (
    !STATE.analysing ||
    STATE.sendingFrame ||
    !STATE.pose
  ) {
    return;
  }

  const video = $("analysisVideo");

  if (
    !video ||
    video.paused ||
    video.ended ||
    video.readyState < 2
  ) {
    return;
  }

  STATE.sendingFrame = true;

  try {
    await STATE.pose.send({
      image: video
    });
  } catch (error) {
    console.warn(
      "Pose frame error:",
      error
    );
  } finally {
    STATE.sendingFrame = false;
  }
}


/* =========================================================
   20. POSE RESULTS
========================================================= */

function handlePoseResults(results) {
  if (!STATE.analysing) return;

  const landmarks =
    results.poseLandmarks;

  if (!landmarks) {
    clearAnalysisCanvas();
    return;
  }

  STATE.frameCount++;

  STATE.lastLandmarks = landmarks;

  const angles =
    calculateAngles(landmarks);

  STATE.lastAngles = angles;

  const time =
    $("analysisVideo")?.currentTime || 0;

  const frame = {
    time,
    angles,
    center: getBodyCenter(landmarks)
  };

  STATE.frames.push(frame);

  updateLiveAngles(angles);

  updateTrajectory(landmarks);

  updateRepetitionCounter(
    landmarks,
    angles
  );

  updateSpecialMetrics(
    landmarks,
    angles
  );

  updatePerformanceMetrics(
    landmarks,
    angles
  );

  drawPose(landmarks, angles);

  updateAngleChart();

  maybeCaptureAutomaticKeyFrame(
    landmarks,
    angles
  );
}


/* =========================================================
   21. LANDMARK CONSTANTS
========================================================= */

const LM = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,

  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,

  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,

  LEFT_HIP: 23,
  RIGHT_HIP: 24,

  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,

  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,

  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,

  LEFT_FOOT: 31,
  RIGHT_FOOT: 32
};


/* =========================================================
   22. ANGLE MATH
========================================================= */

function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null;

  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle =
    Math.abs(radians * 180 / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}

function calculateTrunkAngle(landmarks) {
  const shoulder = midpoint(
    landmarks[LM.LEFT_SHOULDER],
    landmarks[LM.RIGHT_SHOULDER]
  );

  const hip = midpoint(
    landmarks[LM.LEFT_HIP],
    landmarks[LM.RIGHT_HIP]
  );

  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;

  const fromVertical =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    ) * 180 / Math.PI;

  return fromVertical;
}

function calculateAngles(lm) {
  return {
    leftKnee: calculateAngle(
      lm[LM.LEFT_HIP],
      lm[LM.LEFT_KNEE],
      lm[LM.LEFT_ANKLE]
    ),

    rightKnee: calculateAngle(
      lm[LM.RIGHT_HIP],
      lm[LM.RIGHT_KNEE],
      lm[LM.RIGHT_ANKLE]
    ),

    leftHip: calculateAngle(
      lm[LM.LEFT_SHOULDER],
      lm[LM.LEFT_HIP],
      lm[LM.LEFT_KNEE]
    ),

    rightHip: calculateAngle(
      lm[LM.RIGHT_SHOULDER],
      lm[LM.RIGHT_HIP],
      lm[LM.RIGHT_KNEE]
    ),

    leftAnkle: calculateAngle(
      lm[LM.LEFT_KNEE],
      lm[LM.LEFT_ANKLE],
      lm[LM.LEFT_FOOT]
    ),

    rightAnkle: calculateAngle(
      lm[LM.RIGHT_KNEE],
      lm[LM.RIGHT_ANKLE],
      lm[LM.RIGHT_FOOT]
    ),

    trunk: calculateTrunkAngle(lm)
  };
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}


/* =========================================================
   23. LIVE ANGLES
========================================================= */

function displayAngle(id, value) {
  const element = $(id);

  if (!element) return;

  element.textContent =
    Number.isFinite(value)
      ? `${Math.round(value)}°`
      : "--";
}

function updateLiveAngles(a) {
  displayAngle(
    "leftKneeAngle",
    a.leftKnee
  );

  displayAngle(
    "rightKneeAngle",
    a.rightKnee
  );

  displayAngle(
    "leftHipAngle",
    a.leftHip
  );

  displayAngle(
    "rightHipAngle",
    a.rightHip
  );

  displayAngle(
    "leftAnkleAngle",
    a.leftAnkle
  );

  displayAngle(
    "rightAnkleAngle",
    a.rightAnkle
  );

  displayAngle(
    "trunkAngle",
    a.trunk
  );
}


/* =========================================================
   24. DRAW SKELETON
========================================================= */

const CONNECTIONS = [
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

function drawPose(landmarks, angles) {
  const canvas = $("poseCanvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if ($("referenceLineOption")?.checked) {
    drawReferenceLines(ctx, canvas);
  }

  if ($("skeletonOption")?.checked) {
    drawSkeleton(
      ctx,
      canvas,
      landmarks
    );
  }

  if ($("centerOfMassOption")?.checked) {
    drawCenterOfMass(
      ctx,
      canvas,
      landmarks
    );
  }

  if ($("angleOption")?.checked) {
    drawAngleLabels(
      ctx,
      canvas,
      landmarks,
      angles
    );
  }

  drawTrajectory();
}

function pointOnCanvas(
  landmark,
  canvas
) {
  return {
    x: landmark.x * canvas.width,
    y: landmark.y * canvas.height
  };
}

function drawSkeleton(
  ctx,
  canvas,
  landmarks
) {
  ctx.save();

  ctx.lineWidth =
    Math.max(
      3,
      canvas.width / 300
    );

  ctx.strokeStyle =
    "rgba(0, 229, 255, .92)";

  ctx.fillStyle =
    "rgba(255,255,255,.96)";

  for (const [aIndex, bIndex] of CONNECTIONS) {
    const a = landmarks[aIndex];
    const b = landmarks[bIndex];

    if (
      (a.visibility ?? 1) < 0.35 ||
      (b.visibility ?? 1) < 0.35
    ) {
      continue;
    }

    const pa =
      pointOnCanvas(a, canvas);

    const pb =
      pointOnCanvas(b, canvas);

    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  landmarks.forEach(landmark => {
    if ((landmark.visibility ?? 1) < 0.35) {
      return;
    }

    const p =
      pointOnCanvas(
        landmark,
        canvas
      );

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      Math.max(
        3,
        canvas.width / 220
      ),
      0,
      Math.PI * 2
    );

    ctx.fill();
  });

  ctx.restore();
}


/* =========================================================
   25. REFERENCE LINE
========================================================= */

function drawReferenceLines(ctx, canvas) {
  ctx.save();

  ctx.strokeStyle =
    "rgba(255,255,255,.18)";

  ctx.lineWidth = 1;

  ctx.setLineDash([10, 10]);

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
    canvas.height * 0.85
  );

  ctx.lineTo(
    canvas.width,
    canvas.height * 0.85
  );

  ctx.stroke();

  ctx.restore();
}


/* =========================================================
   26. CENTER OF MASS
========================================================= */

function getBodyCenter(lm) {
  const hip =
    midpoint(
      lm[LM.LEFT_HIP],
      lm[LM.RIGHT_HIP]
    );

  const shoulder =
    midpoint(
      lm[LM.LEFT_SHOULDER],
      lm[LM.RIGHT_SHOULDER]
    );

  return {
    x:
      hip.x * 0.65 +
      shoulder.x * 0.35,

    y:
      hip.y * 0.65 +
      shoulder.y * 0.35
  };
}

function drawCenterOfMass(
  ctx,
  canvas,
  lm
) {
  const center =
    pointOnCanvas(
      getBodyCenter(lm),
      canvas
    );

  ctx.save();

  ctx.fillStyle =
    "rgba(255,215,0,.95)";

  ctx.strokeStyle =
    "rgba(0,0,0,.7)";

  ctx.lineWidth = 3;

  ctx.beginPath();

  ctx.arc(
    center.x,
    center.y,
    9,
    0,
    Math.PI * 2
  );

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}


/* =========================================================
   27. ANGLE LABELS
========================================================= */

function drawAngleLabels(
  ctx,
  canvas,
  lm,
  angles
) {
  const labels = [
    [
      LM.LEFT_KNEE,
      angles.leftKnee
    ],

    [
      LM.RIGHT_KNEE,
      angles.rightKnee
    ],

    [
      LM.LEFT_HIP,
      angles.leftHip
    ],

    [
      LM.RIGHT_HIP,
      angles.rightHip
    ],

    [
      LM.LEFT_ANKLE,
      angles.leftAnkle
    ],

    [
      LM.RIGHT_ANKLE,
      angles.rightAnkle
    ]
  ];

  ctx.save();

  ctx.font =
    `bold ${Math.max(
      14,
      canvas.width / 55
    )}px sans-serif`;

  ctx.textAlign = "center";

  labels.forEach(([index, angle]) => {
    if (!Number.isFinite(angle)) return;

    const p =
      pointOnCanvas(
        lm[index],
        canvas
      );

    const text =
      `${Math.round(angle)}°`;

    const width =
      ctx.measureText(text).width + 14;

    ctx.fillStyle =
      "rgba(5,12,24,.82)";

    ctx.fillRect(
      p.x - width / 2,
      p.y - 32,
      width,
      25
    );

    ctx.fillStyle = "#ffffff";

    ctx.fillText(
      text,
      p.x,
      p.y - 13
    );
  });

  ctx.restore();
}


/* =========================================================
   28. TRAJECTORY
========================================================= */

function updateTrajectory(lm) {
  if (!$("trajectoryOption")?.checked) {
    return;
  }

  const hip =
    midpoint(
      lm[LM.LEFT_HIP],
      lm[LM.RIGHT_HIP]
    );

  STATE.trajectories.hip.push(hip);

  STATE.trajectories.leftAnkle.push({
    x: lm[LM.LEFT_ANKLE].x,
    y: lm[LM.LEFT_ANKLE].y
  });

  STATE.trajectories.rightAnkle.push({
    x: lm[LM.RIGHT_ANKLE].x,
    y: lm[LM.RIGHT_ANKLE].y
  });

  const maxPoints = 120;

  Object.values(
    STATE.trajectories
  ).forEach(points => {
    if (points.length > maxPoints) {
      points.shift();
    }
  });
}

function drawTrajectory() {
  const canvas =
    $("trajectoryCanvas");

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (!$("trajectoryOption")?.checked) {
    return;
  }

  drawTrajectoryLine(
    ctx,
    canvas,
    STATE.trajectories.hip,
    "rgba(255,215,0,.9)"
  );

  drawTrajectoryLine(
    ctx,
    canvas,
    STATE.trajectories.leftAnkle,
    "rgba(0,229,255,.7)"
  );

  drawTrajectoryLine(
    ctx,
    canvas,
    STATE.trajectories.rightAnkle,
    "rgba(255,110,160,.7)"
  );
}

function drawTrajectoryLine(
  ctx,
  canvas,
  points,
  color
) {
  if (points.length < 2) return;

  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;

  ctx.beginPath();

  points.forEach((point, index) => {
    const x =
      point.x * canvas.width;

    const y =
      point.y * canvas.height;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  ctx.restore();
}


/* =========================================================
   29. REP COUNTER
========================================================= */

function updateRepetitionCounter(
  landmarks,
  angles
) {
  const event = getSelectedEvent();

  if (!event) return;

  const type = event.counterType;

  const knee =
    average([
      angles.leftKnee,
      angles.rightKnee
    ]);

  const hip =
    average([
      angles.leftHip,
      angles.rightHip
    ]);

  let phase = STATE.repetition.phase;

  if (
    type === "squat" ||
    type === "lunge"
  ) {
    if (
      knee < 105 &&
      STATE.repetition.armed
    ) {
      STATE.repetition.armed = false;
      phase = "BOTTOM";
    }

    if (
      knee > 155 &&
      !STATE.repetition.armed
    ) {
      STATE.repetition.count++;
      STATE.repetition.armed = true;
      phase = "COMPLETE";
    }
  }

  else if (type === "pushup") {
    const leftElbow =
      calculateAngle(
        landmarks[LM.LEFT_SHOULDER],
        landmarks[LM.LEFT_ELBOW],
        landmarks[LM.LEFT_WRIST]
      );

    const rightElbow =
      calculateAngle(
        landmarks[LM.RIGHT_SHOULDER],
        landmarks[LM.RIGHT_ELBOW],
        landmarks[LM.RIGHT_WRIST]
      );

    const elbow =
      average([
        leftElbow,
        rightElbow
      ]);

    if (
      elbow < 105 &&
      STATE.repetition.armed
    ) {
      STATE.repetition.armed = false;
      phase = "DOWN";
    }

    if (
      elbow > 155 &&
      !STATE.repetition.armed
    ) {
      STATE.repetition.count++;
      STATE.repetition.armed = true;
      phase = "COMPLETE";
    }
  }

  else if (
    type === "hinge" ||
    type === "bridge"
  ) {
    if (
      hip < 115 &&
      STATE.repetition.armed
    ) {
      STATE.repetition.armed = false;
      phase = "FLEXION";
    }

    if (
      hip > 155 &&
      !STATE.repetition.armed
    ) {
      STATE.repetition.count++;
      STATE.repetition.armed = true;
      phase = "COMPLETE";
    }
  }

  STATE.repetition.phase = phase;

  if ($("analysisPhaseText")) {
    $("analysisPhaseText").textContent =
      `${phase} · ${STATE.repetition.count}`;
  }
}


/* =========================================================
   30. SPECIAL METRICS
========================================================= */

function updateSpecialMetrics(
  landmarks,
  angles
) {
  const event = getSelectedEvent();

  if (!event) return;

  const frames = STATE.frames;

  const elapsed =
    Math.max(
      0.1,
      ($("analysisVideo")?.currentTime || 0)
    );

  if (
    event.analysisType === "sprint" ||
    event.analysisType === "agility"
  ) {
    const hipY =
      (
        landmarks[LM.LEFT_HIP].y +
        landmarks[LM.RIGHT_HIP].y
      ) / 2;

    const previous =
      frames[
        Math.max(
          0,
          frames.length - 4
        )
      ];

    if (previous) {
      const movement =
        Math.abs(
          hipY -
          previous.center.y
        );

      if (movement > 0.012) {
        STATE.special.stepCount =
          Math.max(
            STATE.special.stepCount,
            Math.floor(
              STATE.frameCount / 5
            )
          );
      }
    }

    STATE.special.cadence =
      round(
        STATE.special.stepCount /
        elapsed *
        60
      );
  }

  if (event.analysisType === "jump") {
    const hips =
      STATE.frames.map(
        frame => frame.center.y
      );

    if (hips.length > 4) {
      const maxY = Math.max(...hips);
      const minY = Math.min(...hips);

      const displacement =
        maxY - minY;

      STATE.special.jumpHeight =
        round(
          clamp(
            displacement * 180,
            0,
            100
          ),
          1
        );

      const velocityEstimate =
        frames.length > 1
          ? Math.abs(
              frames.at(-1).center.y -
              frames.at(-2).center.y
            )
          : 0;

      STATE.special.flightTime =
        round(
          clamp(
            velocityEstimate * 12,
            0,
            1.5
          ),
          2
        );

      STATE.special.takeoffAngle =
        round(
          clamp(
            90 - angles.trunk,
            0,
            90
          ),
          1
        );
    }
  }

  updateSpecialMetricUI();
}

function updateSpecialMetricUI() {
  $("jumpHeight").textContent =
    STATE.special.jumpHeight != null
      ? `${STATE.special.jumpHeight} cm*`
      : "--";

  $("jumpFlightTime").textContent =
    STATE.special.flightTime != null
      ? `${STATE.special.flightTime} s*`
      : "--";

  $("jumpTakeoffAngle").textContent =
    STATE.special.takeoffAngle != null
      ? `${STATE.special.takeoffAngle}°`
      : "--";

  $("sprintCadence").textContent =
    STATE.special.cadence != null
      ? `${STATE.special.cadence} spm*`
      : "--";

  $("sprintStepCount").textContent =
    STATE.special.stepCount || 0;
}


/* =========================================================
   31. PERFORMANCE METRICS
========================================================= */

function updatePerformanceMetrics(
  landmarks,
  angles
) {
  const kneeDifference =
    Math.abs(
      angles.leftKnee -
      angles.rightKnee
    );

  const hipDifference =
    Math.abs(
      angles.leftHip -
      angles.rightHip
    );

  const ankleDifference =
    Math.abs(
      angles.leftAnkle -
      angles.rightAnkle
    );

  const symmetry =
    clamp(
      100 -
      kneeDifference * 1.4 -
      hipDifference -
      ankleDifference * 0.6
    );

  const stability =
    clamp(
      100 -
      angles.trunk * 0.75 -
      Math.abs(
        angles.leftHip -
        angles.rightHip
      ) * 0.7
    );

  const previous =
    STATE.frames[
      STATE.frames.length - 2
    ];

  let movementSpeed = 0;

  if (previous) {
    const current =
      getBodyCenter(landmarks);

    const dx =
      current.x - previous.center.x;

    const dy =
      current.y - previous.center.y;

    movementSpeed =
      Math.sqrt(
        dx * dx + dy * dy
      );
  }

  const speed =
    clamp(
      45 + movementSpeed * 2200
    );

  const power =
    clamp(
      speed * 0.55 +
      (180 -
        average([
          angles.leftKnee,
          angles.rightKnee
        ])) *
        0.3 +
      25
    );

  const agility =
    clamp(
      speed * 0.45 +
      stability * 0.3 +
      symmetry * 0.25
    );

  const technique =
    clamp(
      symmetry * 0.35 +
      stability * 0.35 +
      30
    );

  STATE.metrics = {
    speed: round(speed),
    power: round(power),
    agility: round(agility),
    stability: round(stability),
    symmetry: round(symmetry),
    technique: round(technique)
  };

  updateMetricUI();
}

function updateMetricUI() {
  Object.entries(
    STATE.metrics
  ).forEach(([name, value]) => {
    const valueElement =
      $(`${name}MetricValue`);

    const bar =
      $(`${name}MetricBar`);

    if (valueElement) {
      valueElement.textContent =
        Math.round(value);
    }

    if (bar) {
      bar.style.width =
        `${clamp(value)}%`;
    }
  });
}


/* =========================================================
   32. ANGLE GRAPH
========================================================= */

function createAngleChart() {
  const canvas =
    $("angleGraphCanvas");

  if (
    !canvas ||
    typeof Chart === "undefined"
  ) {
    return;
  }

  STATE.angleChart?.destroy();

  STATE.angleChart =
    new Chart(canvas, {
      type: "line",

      data: {
        labels: [],

        datasets: [
          {
            label: "왼쪽 무릎",
            data: [],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: "오른쪽 무릎",
            data: [],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: "왼쪽 고관절",
            data: [],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: "오른쪽 고관절",
            data: [],
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: "몸통",
            data: [],
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },

      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            min: 0,
            max: 180
          }
        }
      }
    });
}

function updateAngleChart() {
  if (!STATE.angleChart) {
    createAngleChart();
  }

  const chart =
    STATE.angleChart;

  if (!chart) return;

  const recent =
    STATE.frames.slice(-150);

  chart.data.labels =
    recent.map(frame =>
      frame.time.toFixed(1)
    );

  const keys = [
    "leftKnee",
    "rightKnee",
    "leftHip",
    "rightHip",
    "trunk"
  ];

  chart.data.datasets.forEach(
    (dataset, index) => {
      dataset.data =
        recent.map(
          frame =>
            round(
              frame.angles[
                keys[index]
              ],
              1
            )
        );
    }
  );

  chart.update("none");
}


/* =========================================================
   33. KEY FRAMES
========================================================= */

function captureKeyFrame(label = "핵심 자세") {
  const video =
    $("analysisVideo");

  if (
    !video ||
    !STATE.videoFile ||
    !video.videoWidth
  ) {
    toast("캡처할 영상이 없어.");
    return;
  }

  const canvas =
    document.createElement("canvas");

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

  if (
    STATE.lastLandmarks &&
    $("skeletonOption")?.checked
  ) {
    drawSkeleton(
      ctx,
      canvas,
      STATE.lastLandmarks
    );

    if (
      $("angleOption")?.checked &&
      STATE.lastAngles
    ) {
      drawAngleLabels(
        ctx,
        canvas,
        STATE.lastLandmarks,
        STATE.lastAngles
      );
    }
  }

  const image =
    canvas.toDataURL(
      "image/jpeg",
      0.78
    );

  STATE.keyFrames.push({
    id: uid("frame"),
    time: video.currentTime,
    label,
    image,
    angles: STATE.lastAngles
      ? { ...STATE.lastAngles }
      : null
  });

  if (STATE.keyFrames.length > 8) {
    STATE.keyFrames.shift();
  }

  renderKeyFrames();

  toast("핵심 프레임 저장");
}

function maybeCaptureAutomaticKeyFrame(
  landmarks,
  angles
) {
  if (!$("autoKeyFrameOption")?.checked) {
    return;
  }

  const count =
    STATE.frames.length;

  if (
    count === 8 ||
    count === 30 ||
    count === 60 ||
    count === 100
  ) {
    captureKeyFrame(
      `자동 핵심 자세 ${STATE.keyFrames.length + 1}`
    );
  }
}

function renderKeyFrames() {
  const root =
    $("keyFrameList");

  if (!root) return;

  $("keyFrameCount").textContent =
    STATE.keyFrames.length;

  if (!STATE.keyFrames.length) {
    root.innerHTML = `
      <div class="empty-state">
        핵심 프레임이 없습니다.
      </div>
    `;

    return;
  }

  root.innerHTML =
    STATE.keyFrames.map(frame => `
      <article class="key-frame-card">

        <img
          src="${frame.image}"
          alt="핵심 자세"
        >

        <div>
          <strong>
            ${escapeHTML(frame.label)}
          </strong>

          <span>
            ${formatTime(frame.time)}
          </span>
        </div>

      </article>
    `).join("");
}


/* =========================================================
   34. STOP ANALYSIS
========================================================= */

function stopAnalysis(
  complete = true
) {
  if (STATE.analysisTimer) {
    clearInterval(
      STATE.analysisTimer
    );

    STATE.analysisTimer = null;
  }

  STATE.analysing = false;
  STATE.sendingFrame = false;

  if ($("startAnalysisButton")) {
    $("startAnalysisButton").disabled =
      false;
  }

  if ($("stopAnalysisButton")) {
    $("stopAnalysisButton").disabled =
      true;
  }

  $("analysisVideo")?.pause();

  if (!complete) {
    setAnalysisStatus("STANDBY");
    return;
  }

  if (!STATE.frames.length) {
    setAnalysisStatus("NO DATA");

    toast(
      "분석된 자세 프레임이 없어. 사람이 잘 보이는 영상인지 확인해줘."
    );

    return;
  }

  finaliseAnalysis();
}


/* =========================================================
   35. FINAL ANALYSIS
========================================================= */

function finaliseAnalysis() {
  const finalMetrics =
    calculateFinalMetrics();

  STATE.metrics =
    finalMetrics;

  updateMetricUI();

  const score =
    calculateFinalScore(
      finalMetrics
    );

  const feedback =
    generateFeedback(
      finalMetrics
    );

  renderAnalysisFeedback(
    feedback
  );

  const report =
    buildReport(
      score,
      finalMetrics,
      feedback
    );

  STATE.currentReport = report;

  STATE.analyses.unshift(report);

  saveAnalyses();

  $("analysisFinalScore").textContent =
    score;

  $("analysisSummaryPanel")
    ?.classList.remove("hidden");

  $("finishReportButton").disabled =
    false;

  setAnalysisStatus("COMPLETE");

  renderDashboard();
  renderRecords();

  toast(
    `분석 완료 · ${score}점`
  );
}

function calculateFinalMetrics() {
  const sample =
    STATE.frames.slice(
      Math.max(
        0,
        STATE.frames.length - 30
      )
    );

  if (!sample.length) {
    return { ...STATE.metrics };
  }

  const symmetryScores =
    sample.map(frame => {
      const a = frame.angles;

      return clamp(
        100 -
        Math.abs(
          a.leftKnee -
          a.rightKnee
        ) *
          1.3 -
        Math.abs(
          a.leftHip -
          a.rightHip
        )
      );
    });

  const stabilityScores =
    sample.map(frame =>
      clamp(
        100 -
        frame.angles.trunk * 0.7
      )
    );

  return {
    ...STATE.metrics,

    symmetry:
      round(
        average(symmetryScores)
      ),

    stability:
      round(
        average(stabilityScores)
      ),

    technique:
      round(
        average([
          average(symmetryScores),
          average(stabilityScores),
          STATE.metrics.technique
        ])
      )
  };
}

function calculateFinalScore(metrics) {
  const event =
    getSelectedEvent();

  const metricNames =
    event?.metrics || [
      "technique",
      "stability",
      "symmetry",
      "power",
      "speed"
    ];

  const values =
    metricNames
      .map(name => metrics[name])
      .filter(Number.isFinite);

  return Math.round(
    average(values)
  );
}


/* =========================================================
   36. FEEDBACK
========================================================= */

function generateFeedback(metrics) {
  const data =
    getEventData();

  const event =
    getSelectedEvent();

  const metricNames =
    event?.metrics || [
      "technique",
      "stability",
      "symmetry"
    ];

  const feedback = [];

  metricNames.forEach(name => {
    const value =
      metrics[name];

    if (!Number.isFinite(value)) {
      return;
    }

    const rule =
      data?.feedbackRules?.[name];

    if (!rule) return;

    feedback.push({
      metric: name,
      label:
        data.getMetricLabel(name),

      score:
        Math.round(value),

      type:
        value >= 75
          ? "good"
          : "warning",

      text:
        value >= 75
          ? rule.good
          : rule.warning
    });
  });

  return feedback;
}

function renderAnalysisFeedback(
  feedback
) {
  const root =
    $("analysisFeedbackList");

  if (!root) return;

  root.innerHTML =
    feedback.map(item => `
      <article class="feedback-item ${item.type}">
        <div>
          <strong>
            ${escapeHTML(item.label)}
          </strong>

          <span>
            ${item.score}/100
          </span>
        </div>

        <p>
          ${escapeHTML(item.text)}
        </p>
      </article>
    `).join("");
}


/* =========================================================
   37. BUILD REPORT
========================================================= */

function buildReport(
  score,
  metrics,
  feedback
) {
  const athleteId =
    $("analysisAthleteSelect")?.value || "";

  const athlete =
    STATE.athletes.find(
      item => item.id === athleteId
    ) || null;

  const event =
    getSelectedEvent();

  return {
    id: uid("analysis"),

    date:
      new Date().toISOString(),

    athleteId:
      athlete?.id || "",

    athlete: athlete
      ? { ...athlete }
      : {
          name: "미등록 선수",
          grade: "",
          height: null,
          weight: null
        },

    eventId:
      event?.id || "",

    event: event
      ? {
          id: event.id,
          name: event.name,
          ability: event.ability,
          categoryName:
            event.categoryName,
          training:
            event.training || []
        }
      : null,

    score,

    metrics: {
      ...metrics
    },

    special: {
      ...STATE.special,

      repetitionCount:
        STATE.repetition.count
    },

    feedback,

    frameCount:
      STATE.frameCount,

    frames:
      STATE.frames
        .filter(
          (_, index) =>
            index % 3 === 0
        )
        .slice(-200),

    keyFrames:
      STATE.keyFrames.map(
        item => ({ ...item })
      ),

    videoName:
      STATE.videoFile?.name ||
      "영상",

    goal:
      $("analysisGoalSelect")?.value ||
      "technique"
  };
}


/* =========================================================
   38. OPEN REPORT
========================================================= */

function openCurrentReport() {
  if (!STATE.currentReport) {
    toast("먼저 분석을 완료해줘.");
    return;
  }

  openPage("report");
}

function setupReportButtons() {
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

  $("printReportButton")
    ?.addEventListener(
      "click",
      () => window.print()
    );
}


/* =========================================================
   39. REPORT RENDER
========================================================= */

function renderReport() {
  const report =
    STATE.currentReport;

  const empty =
    $("reportEmptyState");

  const content =
    $("reportContent");

  if (!report) {
    empty?.classList.remove("hidden");
    content?.classList.add("hidden");
    return;
  }

  empty?.classList.add("hidden");
  content?.classList.remove("hidden");

  const athlete =
    report.athlete || {};

  const event =
    report.event || {};

  $("reportAthleteName").textContent =
    athlete.name || "-";

  $("reportGrade").textContent =
    athlete.grade || "-";

  $("reportHeight").textContent =
    athlete.height
      ? `${athlete.height} cm`
      : "-";

  $("reportWeight").textContent =
    athlete.weight
      ? `${athlete.weight} kg`
      : "-";

  $("reportEventName").textContent =
    event.name || "-";

  $("reportAbility").textContent =
    event.ability || "-";

  $("reportCategory").textContent =
    event.categoryName || "-";

  $("reportDate").textContent =
    new Date(
      report.date
    ).toLocaleString("ko-KR");

  $("reportTotalScore").textContent =
    report.score;

  $("reportGradeScore").textContent =
    scoreGrade(report.score);

  $("reportVideoName").textContent =
    report.videoName;

  $("reportFrameCount").textContent =
    report.frameCount;

  renderReportMetrics(report);
  renderReportKeyFrames(report);
  renderReportAngles(report);
  renderReportSpecial(report);
  renderReportFeedback(report);
  renderTraining(report);
  renderPEEvaluation(report);

  requestAnimationFrame(() => {
    renderReportRadar(report);
    renderReportAngleChart(report);
  });
}

function scoreGrade(score) {
  if (score >= 90) return "S";
  if (score >= 85) return "A+";
  if (score >= 80) return "A";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 60) return "C";

  return "D";
}


/* =========================================================
   40. REPORT METRICS
========================================================= */

function renderReportMetrics(report) {
  const root =
    $("reportMetricGrid");

  if (!root) return;

  const data =
    getEventData();

  root.innerHTML =
    Object.entries(
      report.metrics
    ).map(([name, value]) => `
      <div class="report-metric-card">

        <span>
          ${escapeHTML(
            data?.getMetricLabel(name) ||
            name
          )}
        </span>

        <strong>
          ${Math.round(value)}
        </strong>

        <div class="metric-track">
          <div
            class="metric-fill"
            style="width:${clamp(value)}%"
          ></div>
        </div>

      </div>
    `).join("");
}


/* =========================================================
   41. REPORT KEY FRAMES
========================================================= */

function renderReportKeyFrames(
  report
) {
  const root =
    $("reportKeyFrames");

  if (!root) return;

  if (!report.keyFrames.length) {
    root.innerHTML = `
      <div class="empty-state">
        저장된 핵심 자세 사진이 없습니다.
      </div>
    `;
    return;
  }

  root.innerHTML =
    report.keyFrames.map(
      (frame, index) => `
        <article class="report-key-frame">

          <img
            src="${frame.image}"
            alt="핵심 자세 ${index + 1}"
          >

          <div>
            <strong>
              ${escapeHTML(frame.label)}
            </strong>

            <span>
              ${formatTime(frame.time)}
            </span>

            <p>
              ${generateFrameFeedback(frame)}
            </p>
          </div>

        </article>
      `
    ).join("");
}

function generateFrameFeedback(frame) {
  if (!frame.angles) {
    return "핵심 동작 구간입니다.";
  }

  const knee =
    average([
      frame.angles.leftKnee,
      frame.angles.rightKnee
    ]);

  const difference =
    Math.abs(
      frame.angles.leftKnee -
      frame.angles.rightKnee
    );

  if (difference > 15) {
    return "좌우 무릎 각도 차이가 비교적 크게 나타난 구간입니다.";
  }

  if (knee < 100) {
    return "무릎 굴곡이 크게 나타나는 핵심 하강 구간입니다.";
  }

  return "좌우 관절 움직임이 비교적 안정적으로 나타나는 구간입니다.";
}


/* =========================================================
   42. REPORT ANGLE SUMMARY
========================================================= */

function renderReportAngles(report) {
  const root =
    $("reportAngleSummary");

  if (!root) return;

  const angleNames = {
    leftKnee: "왼쪽 무릎",
    rightKnee: "오른쪽 무릎",
    leftHip: "왼쪽 고관절",
    rightHip: "오른쪽 고관절",
    leftAnkle: "왼쪽 발목",
    rightAnkle: "오른쪽 발목",
    trunk: "몸통"
  };

  root.innerHTML =
    Object.entries(
      angleNames
    ).map(([key, label]) => {
      const values =
        report.frames
          .map(
            frame =>
              frame.angles?.[key]
          )
          .filter(Number.isFinite);

      const min =
        values.length
          ? Math.min(...values)
          : 0;

      const max =
        values.length
          ? Math.max(...values)
          : 0;

      const avg =
        values.length
          ? average(values)
          : 0;

      return `
        <div>
          <span>
            ${label}
          </span>

          <strong>
            ${round(avg)}°
          </strong>

          <small>
            ${round(min)}° ~
            ${round(max)}°
          </small>
        </div>
      `;
    }).join("");
}


/* =========================================================
   43. REPORT SPECIAL
========================================================= */

function renderReportSpecial(
  report
) {
  const root =
    $("reportSpecialMetrics");

  if (!root) return;

  const special =
    report.special || {};

  const values = [
    [
      "반복 횟수",
      special.repetitionCount ?? 0
    ],

    [
      "점프 높이",
      special.jumpHeight != null
        ? `${special.jumpHeight} cm*`
        : "-"
    ],

    [
      "비행시간",
      special.flightTime != null
        ? `${special.flightTime} s*`
        : "-"
    ],

    [
      "이륙각",
      special.takeoffAngle != null
        ? `${special.takeoffAngle}°`
        : "-"
    ],

    [
      "케이던스",
      special.cadence != null
        ? `${special.cadence} spm*`
        : "-"
    ],

    [
      "스텝",
      special.stepCount ?? 0
    ]
  ];

  root.innerHTML =
    values.map(([label, value]) => `
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join("");
}


/* =========================================================
   44. REPORT FEEDBACK
========================================================= */

function renderReportFeedback(
  report
) {
  const root =
    $("reportFeedbackList");

  if (!root) return;

  root.innerHTML =
    report.feedback.map(item => `
      <article class="report-feedback-item">
        <strong>
          ${escapeHTML(item.label)}
          ·
          ${item.score}/100
        </strong>

        <p>
          ${escapeHTML(item.text)}
        </p>
      </article>
    `).join("");
}


/* =========================================================
   45. TRAINING
========================================================= */

function renderTraining(report) {
  const root =
    $("trainingRecommendationList");

  if (!root) return;

  const data =
    getEventData();

  const names =
    report.event?.training || [];

  if (!names.length) {
    root.innerHTML = `
      <div class="empty-state">
        추천 훈련 데이터가 없습니다.
      </div>
    `;
    return;
  }

  root.innerHTML =
    names.slice(0, 6).map(
      (name, index) => {
        const info =
          data?.getTrainingInfo(name);

        return `
          <article class="training-card">

            <span>
              0${index + 1}
            </span>

            <div>
              <strong>
                ${escapeHTML(name)}
              </strong>

              <small>
                ${escapeHTML(
                  info?.focus ||
                  "보완 훈련"
                )}
              </small>

              <p>
                ${escapeHTML(
                  info?.description ||
                  ""
                )}
              </p>
            </div>

          </article>
        `;
      }
    ).join("");
}


/* =========================================================
   46. PE EVALUATION
========================================================= */

function renderPEEvaluation(
  report
) {
  const root =
    $("peEvaluation");

  if (!root) return;

  const score =
    report.score;

  let text;

  if (score >= 85) {
    text =
      "동작 안정성과 기술 수행 수준이 높게 나타났습니다. 기록 향상을 위해 폭발력과 종목 특화 속도 훈련을 병행해 볼 수 있습니다.";
  } else if (score >= 75) {
    text =
      "기본 동작 수행은 비교적 안정적입니다. 낮은 점수의 세부 지표를 중심으로 보완하면 실기 수행의 일관성을 높이는 데 도움이 됩니다.";
  } else {
    text =
      "기본 움직임 패턴을 먼저 안정화하는 것이 좋습니다. 좌우 대칭성과 자세 제어를 우선 확인한 뒤 속도와 파워 훈련으로 진행하세요.";
  }

  root.innerHTML = `
    <span class="section-label">
      PE PERFORMANCE EVALUATION
    </span>

    <h3>
      체대입시 퍼포먼스 평가
    </h3>

    <strong>
      ${report.score}/100 ·
      ${scoreGrade(report.score)}
    </strong>

    <p>
      ${text}
    </p>

    <small>
      * 본 분석은 영상 기반 움직임 분석이며
      대학별 공식 실기 기록이나 합격 판정을
      대신하지 않습니다.
    </small>
  `;
}


/* =========================================================
   47. RADAR CHART
========================================================= */

function renderReportRadar(
  report
) {
  const canvas =
    $("reportRadarCanvas");

  if (
    !canvas ||
    typeof Chart === "undefined"
  ) {
    return;
  }

  STATE.radarChart?.destroy();

  const metrics =
    report.metrics;

  STATE.radarChart =
    new Chart(canvas, {
      type: "radar",

      data: {
        labels: [
          "기술",
          "안정성",
          "대칭성",
          "파워",
          "스피드",
          "민첩성"
        ],

        datasets: [
          {
            label: "Performance",
            data: [
              metrics.technique || 0,
              metrics.stability || 0,
              metrics.symmetry || 0,
              metrics.power || 0,
              metrics.speed || 0,
              metrics.agility || 0
            ],
            borderWidth: 2
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
              display: false
            }
          }
        }
      }
    });
}


/* =========================================================
   48. REPORT ANGLE CHART
========================================================= */

function renderReportAngleChart(
  report
) {
  const canvas =
    $("reportAngleCanvas");

  if (
    !canvas ||
    typeof Chart === "undefined"
  ) {
    return;
  }

  STATE.reportAngleChart?.destroy();

  STATE.reportAngleChart =
    new Chart(canvas, {
      type: "line",

      data: {
        labels:
          report.frames.map(
            frame =>
              frame.time.toFixed(1)
          ),

        datasets: [
          {
            label: "왼쪽 무릎",
            data:
              report.frames.map(
                frame =>
                  frame.angles.leftKnee
              ),
            pointRadius: 0,
            borderWidth: 2
          },

          {
            label: "오른쪽 무릎",
            data:
              report.frames.map(
                frame =>
                  frame.angles.rightKnee
              ),
            pointRadius: 0,
            borderWidth: 2
          },

          {
            label: "왼쪽 고관절",
            data:
              report.frames.map(
                frame =>
                  frame.angles.leftHip
              ),
            pointRadius: 0,
            borderWidth: 2
          },

          {
            label: "오른쪽 고관절",
            data:
              report.frames.map(
                frame =>
                  frame.angles.rightHip
              ),
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            min: 0,
            max: 180
          }
        }
      }
    });
}


/* =========================================================
   49. RECORDS
========================================================= */

function renderRecords() {
  const root =
    $("recordList");

  if (!root) return;

  $("recordCount").textContent =
    STATE.analyses.length;

  renderRecordAthleteFilter();

  const filter =
    $("recordAthleteFilter")?.value || "";

  const records =
    filter
      ? STATE.analyses.filter(
          item =>
            item.athleteId === filter
        )
      : STATE.analyses;

  if (!records.length) {
    root.innerHTML = `
      <div class="empty-state">
        저장된 분석 기록이 없습니다.
      </div>
    `;

    return;
  }

  root.innerHTML =
    records.map(record => `
      <article class="record-item">

        <div>
          <strong>
            ${escapeHTML(
              record.athlete?.name ||
              "미등록 선수"
            )}
          </strong>

          <span>
            ${escapeHTML(
              record.event?.name ||
              "종목"
            )}
            ·
            ${new Date(
              record.date
            ).toLocaleDateString("ko-KR")}
          </span>
        </div>

        <strong class="record-score">
          ${record.score}
        </strong>

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

      </article>
    `).join("");

  root
    .querySelectorAll(
      "[data-open-record]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const record =
            STATE.analyses.find(
              item =>
                item.id ===
                button.dataset.openRecord
            );

          if (!record) return;

          STATE.currentReport =
            record;

          openPage("report");
        }
      );
    });

  root
    .querySelectorAll(
      "[data-delete-record]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const id =
            button.dataset.deleteRecord;

          STATE.analyses =
            STATE.analyses.filter(
              item => item.id !== id
            );

          saveAnalyses();

          renderRecords();
          renderDashboard();

          toast("분석 기록 삭제");
        }
      );
    });
}

function renderRecordAthleteFilter() {
  const select =
    $("recordAthleteFilter");

  if (!select) return;

  const current =
    select.value;

  select.innerHTML = `
    <option value="">
      전체 선수
    </option>

    ${STATE.athletes.map(
      athlete => `
        <option value="${athlete.id}">
          ${escapeHTML(athlete.name)}
        </option>
      `
    ).join("")}
  `;

  if (current) {
    select.value = current;
  }
}


/* =========================================================
   50. DASHBOARD
========================================================= */

function renderDashboard() {
  $("dashboardAthleteCount").textContent =
    STATE.athletes.length;

  $("dashboardAnalysisCount").textContent =
    STATE.analyses.length;

  const scores =
    STATE.analyses.map(
      item => item.score
    );

  $("dashboardAverageScore").textContent =
    scores.length
      ? Math.round(average(scores))
      : "--";

  $("dashboardRecentCount").textContent =
    STATE.analyses.slice(0, 7).length;

  const latest =
    STATE.analyses[0];

  updateDashboardMetric(
    "Stability",
    latest?.metrics?.stability
  );

  updateDashboardMetric(
    "Symmetry",
    latest?.metrics?.symmetry
  );

  updateDashboardMetric(
    "Technique",
    latest?.metrics?.technique
  );

  updateDashboardMetric(
    "Power",
    latest?.metrics?.power
  );

  const root =
    $("dashboardRecentList");

  if (!root) return;

  if (!STATE.analyses.length) {
    root.innerHTML = `
      <div class="empty-state">
        아직 분석 기록이 없습니다.
      </div>
    `;

    return;
  }

  root.innerHTML =
    STATE.analyses
      .slice(0, 5)
      .map(record => `
        <button
          type="button"
          class="recent-analysis-item"
          data-dashboard-record="${record.id}"
        >
          <div>
            <strong>
              ${escapeHTML(
                record.athlete?.name ||
                "미등록 선수"
              )}
            </strong>

            <span>
              ${escapeHTML(
                record.event?.name ||
                "-"
              )}
            </span>
          </div>

          <b>
            ${record.score}
          </b>
        </button>
      `).join("");

  root
    .querySelectorAll(
      "[data-dashboard-record]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const report =
            STATE.analyses.find(
              item =>
                item.id ===
                button.dataset.dashboardRecord
            );

          if (!report) return;

          STATE.currentReport =
            report;

          openPage("report");
        }
      );
    });
}

function updateDashboardMetric(
  name,
  value
) {
  const valueElement =
    $(`dashboard${name}Value`);

  const bar =
    $(`dashboard${name}Bar`);

  if (valueElement) {
    valueElement.textContent =
      Number.isFinite(value)
        ? Math.round(value)
        : "--";
  }

  if (bar) {
    bar.style.width =
      Number.isFinite(value)
        ? `${clamp(value)}%`
        : "0%";
  }
}


/* =========================================================
   51. RESET
========================================================= */

function resetAnalysisData(
  clearVideo = true
) {
  if (STATE.analysisTimer) {
    clearInterval(
      STATE.analysisTimer
    );
  }

  STATE.analysisTimer = null;
  STATE.analysing = false;
  STATE.sendingFrame = false;

  STATE.frameCount = 0;

  STATE.frames = [];
  STATE.keyFrames = [];

  STATE.trajectories = {
    hip: [],
    leftAnkle: [],
    rightAnkle: []
  };

  STATE.lastLandmarks = null;
  STATE.lastAngles = null;

  STATE.repetition = {
    count: 0,
    phase: "READY",
    armed: true
  };

  STATE.special = {
    jumpHeight: null,
    flightTime: null,
    takeoffAngle: null,
    cadence: null,
    stepCount: 0
  };

  STATE.metrics = {
    speed: 0,
    power: 0,
    agility: 0,
    stability: 0,
    symmetry: 0,
    technique: 0
  };

  clearAnalysisCanvas();

  renderKeyFrames();
  updateSpecialMetricUI();
  updateMetricUI();

  updateLiveAngles({
    leftKnee: null,
    rightKnee: null,
    leftHip: null,
    rightHip: null,
    leftAnkle: null,
    rightAnkle: null,
    trunk: null
  });

  $("analysisPhaseText").textContent =
    "READY";

  $("analysisFeedbackList").innerHTML = `
    <div class="empty-state">
      분석이 완료되면 피드백이 표시됩니다.
    </div>
  `;

  $("analysisSummaryPanel")
    ?.classList.add("hidden");

  $("finishReportButton").disabled =
    true;

  $("startAnalysisButton").disabled =
    false;

  $("stopAnalysisButton").disabled =
    true;

  createAngleChart();

  if (clearVideo) {
    const video =
      $("analysisVideo");

    video?.pause();

    if (STATE.videoURL) {
      URL.revokeObjectURL(
        STATE.videoURL
      );
    }

    STATE.videoFile = null;
    STATE.videoURL = null;

    if (video) {
      video.removeAttribute("src");
      video.load();
    }

    $("videoFileInput").value = "";

    $("videoEmptyState")
      ?.classList.remove("hidden");

    $("videoCurrentTime").textContent =
      "00:00.00";

    $("videoDuration").textContent =
      "00:00.00";

    $("videoTimeline").value = 0;
  }

  setAnalysisStatus("STANDBY");
}


/* =========================================================
   52. SETTINGS
========================================================= */

function setupSettings() {
  const pairs = [
    [
      "settingsSkeletonOption",
      "skeletonOption"
    ],

    [
      "settingsAngleOption",
      "angleOption"
    ],

    [
      "settingsTrajectoryOption",
      "trajectoryOption"
    ],

    [
      "settingsCenterOfMassOption",
      "centerOfMassOption"
    ]
  ];

  pairs.forEach(
    ([settingId, analysisId]) => {
      const setting =
        $(settingId);

      const analysis =
        $(analysisId);

      setting?.addEventListener(
        "change",
        () => {
          if (analysis) {
            analysis.checked =
              setting.checked;
          }
        }
      );

      analysis?.addEventListener(
        "change",
        () => {
          if (setting) {
            setting.checked =
              analysis.checked;
          }
        }
      );
    }
  );

  $("clearAnalysisDataButton")
    ?.addEventListener(
      "click",
      () => {
        if (
          !confirm(
            "저장된 분석 기록을 모두 삭제할까요?"
          )
        ) {
          return;
        }

        STATE.analyses = [];
        STATE.currentReport = null;

        saveAnalyses();

        renderRecords();
        renderDashboard();

        toast(
          "분석 기록을 모두 삭제했어."
        );
      }
    );
}


/* =========================================================
   53. STATUS
========================================================= */

function setAnalysisStatus(text) {
  if ($("analysisStatusText")) {
    $("analysisStatusText").textContent =
      text;
  }

  if ($("systemStatusText")) {
    $("systemStatusText").textContent =
      STATE.analysing
        ? "AI ANALYSIS RUNNING"
        : "SYSTEM READY";
  }

  $("analysisStatusDot")
    ?.classList.toggle(
      "active",
      STATE.analysing
    );
}


/* =========================================================
   54. BUTTON SETUP
========================================================= */

function setupAnalysisButtons() {
  $("startAnalysisButton")
    ?.addEventListener(
      "click",
      startAnalysis
    );

  $("stopAnalysisButton")
    ?.addEventListener(
      "click",
      () => stopAnalysis(true)
    );

  $("resetAnalysisButton")
    ?.addEventListener(
      "click",
      () => {
        resetAnalysisData(true);
        toast("분석 초기화 완료");
      }
    );

  $("analysisEventSelect")
    ?.addEventListener(
      "change",
      event => {
        STATE.selectedEventId =
          event.target.value;

        updateAnalysisEventTitle();
      }
    );

  $("analysisAthleteSelect")
    ?.addEventListener(
      "change",
      event => {
        STATE.selectedAthleteId =
          event.target.value;
      }
    );
}


/* =========================================================
   55. OTHER EVENTS
========================================================= */

function setupMiscEvents() {
  $("eventSearchInput")
    ?.addEventListener(
      "input",
      renderEvents
    );

  $("recordAthleteFilter")
    ?.addEventListener(
      "change",
      renderRecords
    );
}


/* =========================================================
   56. ERROR HANDLING
========================================================= */

window.addEventListener(
  "error",
  event => {
    console.error(
      "APP ERROR:",
      event.error || event.message
    );

    const boot =
      $("bootStatus");

    if (
      boot &&
      !boot.classList.contains("hidden")
    ) {
      boot.textContent =
        `ERROR: ${event.message}`;
    }
  }
);

window.addEventListener(
  "unhandledrejection",
  event => {
    console.error(
      "PROMISE ERROR:",
      event.reason
    );
  }
);


/* =========================================================
   57. BOOT
========================================================= */

function boot() {
  console.log(
    `[PE PERFORMANCE LAB] APP ${APP.version}`
  );

  STATE.athletes =
    loadJSON(
      APP.storage.athletes,
      []
    );

  STATE.analyses =
    loadJSON(
      APP.storage.analyses,
      []
    );

  if (!getEventData()) {
    console.error(
      "events.js가 로드되지 않았습니다."
    );

    $("bootStatus").textContent =
      "EVENT DATA LOAD ERROR";

    return;
  }

  setupNavigation();
  setupMobileMenu();

  setupAthleteForm();

  setupVideoUpload();
  setupVideoEvents();
  setupVideoControls();

  setupAnalysisButtons();
  setupReportButtons();

  setupSettings();
  setupMiscEvents();

  refreshAnalysisSelectors();

  renderAthletes();
  renderEvents();
  renderRecords();
  renderDashboard();

  createAngleChart();

  startClock();

  $("appVersion").textContent =
    APP.version;

  $("sidebarVersion").textContent =
    `PERFORMANCE SYSTEM v${APP.version}`;

  $("bootStatus")
    ?.classList.add("hidden");

  setAnalysisStatus("STANDBY");

  console.log(
    "[PE PERFORMANCE LAB] SYSTEM READY"
  );
}


/* =========================================================
   58. START
========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    boot
  );
} else {
  boot();
}


/* =========================================================
   END APP.JS
========================================================= */