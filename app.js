/* =========================================================
   설천고 스포츠과학 분석센터 PRO
   ① app.js
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL
========================================================= */

const APP = {
  page: "dashboard",
  video: null,
  pose: null,
  poseReady: false,
  analyzing: false,

  animationId: null,

  charts: {},

  frameData: [],
  keyFrames: [],

  currentFrame: 0,

  options: {
    skeleton: true,
    angles: true,
    trajectory: true,
    baseline: true,
    center: true,
    keyFrames: true
  },

  angles: {
    leftHip: 0,
    rightHip: 0,
    leftKnee: 0,
    rightKnee: 0,
    leftAnkle: 0,
    rightAnkle: 0,
    leftElbow: 0,
    rightElbow: 0,
    trunk: 0
  },

  scores: {
    total: 0,
    stability: 0,
    alignment: 0,
    symmetry: 0,
    efficiency: 0
  }
};


/* =========================================================
   DOM SHORTCUT
========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   STORAGE
========================================================= */

function getRecords() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "seolcheon_event_records"
      ) || "[]"
    );
  } catch {
    return [];
  }
}


function getAthletes() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "seolcheon_athletes"
      ) || "[]"
    );
  } catch {
    return [];
  }
}


function getGoal() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "seolcheon_college_goal"
      ) || "{}"
    );
  } catch {
    return {};
  }
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(pageName) {

  const pages =
    document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active");
  });


  const target =
    $(`page-${pageName}`);

  if (!target) {
    console.warn(
      "Page not found:",
      pageName
    );
    return;
  }


  target.classList.add("active");


  document
    .querySelectorAll(".nav-button")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );

    });


  APP.page = pageName;


  const titles = {
    dashboard: "대시보드",
    athletes: "선수 관리",
    events: "체대입시",
    analysis: "영상 자세분석",
    comparison: "비교 분석",
    records: "분석 기록",
    report: "체대입시 리포트"
  };


  if ($("pageTitle")) {
    $("pageTitle").textContent =
      titles[pageName] || "분석센터";
  }


  if (pageName === "dashboard") {
    updateDashboard();
  }


  if (pageName === "report") {
    updateReport();
  }


  if (pageName === "comparison") {
    updateComparison();
  }

}


window.openPage = openPage;


/* =========================================================
   NAV EVENTS
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openPage(
            button.dataset.page
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-open-page]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openPage(
            button.dataset.openPage
          );

        }
      );

    });

}


/* =========================================================
   CLOCK
========================================================= */

function startClock() {

  function update() {

    const now =
      new Date();

    if ($("clock")) {

      $("clock").textContent =
        now.toLocaleTimeString(
          "ko-KR",
          {
            hour12: false
          }
        );

    }

  }

  update();

  setInterval(
    update,
    1000
  );

}


/* =========================================================
   CHART DEFAULT
========================================================= */

function chartDefaults() {

  if (
    typeof Chart ===
    "undefined"
  ) {
    return;
  }


  Chart.defaults.color =
    "#8da0b5";

  Chart.defaults.borderColor =
    "rgba(255,255,255,.07)";

  Chart.defaults.font.family =
    "Pretendard, Noto Sans KR, sans-serif";

}


/* =========================================================
   PERFORMANCE CHART
========================================================= */

function createPerformanceChart() {

  const canvas =
    $("performanceChart");

  if (!canvas ||
      typeof Chart === "undefined") {
    return;
  }


  const records =
    getRecords()
      .slice()
      .reverse();


  const labels =
    records.length
      ? records.map(
          (_, index) =>
            `${index + 1}`
        )
      : [
          "1",
          "2",
          "3",
          "4",
          "5"
        ];


  const data =
    records.length
      ? records.map(
          record =>
            Number(record.score || 0)
        )
      : [0, 0, 0, 0, 0];


  destroyChart(
    "performance"
  );


  APP.charts.performance =
    new Chart(
      canvas,
      {
        type: "line",

        data: {

          labels,

          datasets: [
            {
              label: "실기점수",

              data,

              borderWidth: 2,

              tension: .35,

              fill: false,

              pointRadius: 3
            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: false
            }
          },

          scales: {

            y: {
              min: 0,
              max: 100
            }

          }

        }

      }
    );

}


/* =========================================================
   RADAR
========================================================= */

function createRadarChart(
  canvasId,
  chartKey
) {

  const canvas =
    $(canvasId);

  if (!canvas ||
      typeof Chart === "undefined") {
    return;
  }


  destroyChart(
    chartKey
  );


  APP.charts[chartKey] =
    new Chart(
      canvas,
      {
        type: "radar",

        data: {

          labels: [
            "순발력",
            "스피드",
            "근력",
            "지구력",
            "유연성",
            "코어"
          ],

          datasets: [
            {
              label: "현재",
              data: [
                0,
                0,
                0,
                0,
                0,
                0
              ],

              borderWidth: 2,

              pointRadius: 3,

              fill: true
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
   UPDATE RADAR
========================================================= */

function updateRadar(
  chartKey
) {

  const chart =
    APP.charts[chartKey];

  if (!chart) return;


  const records =
    getRecords();


  if (!records.length) {

    chart.data.datasets[0].data =
      [0, 0, 0, 0, 0, 0];

    chart.update();

    return;

  }


  const scores =
    records.map(
      record =>
        Number(record.score || 0)
    );


  const average =
    scores.reduce(
      (a, b) => a + b,
      0
    ) / scores.length;


  chart.data.datasets[0].data = [

    Math.min(
      100,
      average + 4
    ),

    Math.min(
      100,
      average
    ),

    Math.min(
      100,
      average - 2
    ),

    Math.min(
      100,
      average + 1
    ),

    Math.min(
      100,
      average - 5
    ),

    Math.min(
      100,
      average + 2
    )

  ].map(
    value =>
      Math.max(
        0,
        Math.round(value)
      )
  );


  chart.update();

}


/* =========================================================
   DESTROY CHART
========================================================= */

function destroyChart(
  key
) {

  if (
    APP.charts[key]
  ) {

    APP.charts[key].destroy();

    APP.charts[key] =
      null;

  }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const athletes =
    getAthletes();

  const records =
    getRecords();

  const goal =
    getGoal();


  if ($("athleteCount")) {
    $("athleteCount").textContent =
      athletes.length;
  }


  if ($("recordCount")) {
    $("recordCount").textContent =
      records.length;
  }


  const average =
    records.length
      ? Math.round(
          records.reduce(
            (sum, record) =>
              sum +
              Number(
                record.score || 0
              ),
            0
          ) /
          records.length
        )
      : 0;


  if ($("averageScore")) {
    $("averageScore").textContent =
      average;
  }


  if ($("targetUniversity")) {
    $("targetUniversity").textContent =
      goal.university ||
      "-";
  }


  createPerformanceChart();

  createRadarChart(
    "dashboardRadar",
    "dashboardRadar"
  );

  updateRadar(
    "dashboardRadar"
  );

}


/* =========================================================
   VIDEO
========================================================= */

function setupVideo() {

  APP.video =
    $("analysisVideo");

  if (!APP.video) return;


  const input =
    $("videoInput");

  const uploadButton =
    $("uploadVideoButton");


  uploadButton?.addEventListener(
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

      if (!file) return;


      const url =
        URL.createObjectURL(
          file
        );


      APP.video.src =
        url;

      APP.video.load();


      APP.video.onloadedmetadata =
        () => {

          const placeholder =
            $("videoPlaceholder");

          if (placeholder) {
            placeholder.style.display =
              "none";
          }


          resizePoseCanvas();


          showToast(
            "영상이 준비되었습니다."
          );

        };

    }
  );


  $("videoPlayPause")
    ?.addEventListener(
      "click",
      toggleVideo
    );


  $("videoSlow")
    ?.addEventListener(
      "click",
      () => {

        APP.video.playbackRate =
          .5;

        setSpeedActive(
          "videoSlow"
        );

      }
    );


  $("videoNormal")
    ?.addEventListener(
      "click",
      () => {

        APP.video.playbackRate =
          1;

        setSpeedActive(
          "videoNormal"
        );

      }
    );


  $("videoPrevFrame")
    ?.addEventListener(
      "click",
      previousFrame
    );


  $("videoNextFrame")
    ?.addEventListener(
      "click",
      nextFrame
    );


  $("startAnalysis")
    ?.addEventListener(
      "click",
      startAnalysis
    );


  $("stopAnalysis")
    ?.addEventListener(
      "click",
      stopAnalysis
    );


  APP.video.addEventListener(
    "loadedmetadata",
    resizePoseCanvas
  );


  window.addEventListener(
    "resize",
    resizePoseCanvas
  );

}


/* =========================================================
   VIDEO CONTROLS
========================================================= */

function toggleVideo() {

  if (!APP.video) return;


  if (APP.video.paused) {

    APP.video.play();

  } else {

    APP.video.pause();

  }

}


function setSpeedActive(
  id
) {

  document
    .querySelectorAll(
      ".speed-button"
    )
    .forEach(
      button =>
        button.classList.remove(
          "active"
        )
    );


  $(id)?.classList.add(
    "active"
  );

}


function previousFrame() {

  if (!APP.video) return;


  APP.video.pause();

  APP.video.currentTime =
    Math.max(
      0,
      APP.video.currentTime -
      1 / 30
    );

}


function nextFrame() {

  if (!APP.video) return;


  APP.video.pause();

  APP.video.currentTime =
    Math.min(
      APP.video.duration || 0,
      APP.video.currentTime +
      1 / 30
    );

}


/* =========================================================
   CANVAS
========================================================= */

function resizePoseCanvas() {

  const video =
    $("analysisVideo");

  const canvas =
    $("poseCanvas");

  if (!video ||
      !canvas) {
    return;
  }


  const rect =
    video.getBoundingClientRect();


  canvas.width =
    Math.max(
      1,
      Math.round(rect.width)
    );

  canvas.height =
    Math.max(
      1,
      Math.round(rect.height)
    );

}


/* =========================================================
   MEDIAPIPE
========================================================= */

function setupPose() {

  if (
    typeof Pose ===
    "undefined"
  ) {

    console.warn(
      "MediaPipe Pose library not loaded."
    );

    return;

  }


  try {

    APP.pose =
      new Pose({
        locateFile: file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });


    APP.pose.setOptions({

      modelComplexity: 1,

      smoothLandmarks: true,

      enableSegmentation: false,

      smoothSegmentation: true,

      minDetectionConfidence: .5,

      minTrackingConfidence: .5

    });


    APP.pose.onResults(
      handlePoseResults
    );


    APP.poseReady =
      true;

  } catch (error) {

    console.error(
      "Pose setup error:",
      error
    );

  }

}


/* =========================================================
   ANALYSIS
========================================================= */

function startAnalysis() {

  if (!APP.video) {

    showToast(
      "영상을 먼저 업로드하세요."
    );

    return;

  }


  if (
    !APP.video.src
  ) {

    showToast(
      "영상을 먼저 업로드하세요."
    );

    return;

  }


  APP.analyzing =
    true;

  APP.frameData =
    [];

  APP.keyFrames =
    [];


  showToast(
    "자세분석을 시작합니다."
  );


  analyzeLoop();

}


function stopAnalysis() {

  APP.analyzing =
    false;


  if (
    APP.animationId
  ) {

    cancelAnimationFrame(
      APP.animationId
    );

    APP.animationId =
      null;

  }


  findKeyFrames();

  calculatePerformanceScores();

  renderKeyFrames();

  renderFeedback();

  renderTrainingRecommendations();

  updateReport();


  showToast(
    "자세분석이 종료되었습니다."
  );

}


/* =========================================================
   ANALYSIS LOOP
========================================================= */

async function analyzeLoop() {

  if (!APP.analyzing) {
    return;
  }


  if (
    APP.video.readyState >= 2
  ) {

    if (
      APP.poseReady &&
      APP.pose
    ) {

      try {

        await APP.pose.send({
          image: APP.video
        });

      } catch (error) {

        console.warn(
          "Pose frame error:",
          error
        );

      }

    } else {

      drawAnalysisPlaceholder();

    }

  }


  APP.animationId =
    requestAnimationFrame(
      analyzeLoop
    );

}


/* =========================================================
   POSE RESULTS
========================================================= */

function handlePoseResults(
  results
) {

  const canvas =
    $("poseCanvas");

  if (!canvas) return;


  const ctx =
    canvas.getContext(
      "2d"
    );


  resizePoseCanvas();


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  if (
    !results ||
    !results.poseLandmarks
  ) {

    drawAnalysisPlaceholder();

    return;

  }


  const landmarks =
    results.poseLandmarks;


  drawSkeleton(
    ctx,
    landmarks
  );


  calculateAngles(
    landmarks
  );


  drawReferenceLines(
    ctx,
    landmarks
  );


  drawCenterOfMass(
    ctx,
    landmarks
  );


  drawJointAngles(
    ctx,
    landmarks
  );


  updateAngleUI();


  saveFrameData(
    landmarks
  );

}


/* =========================================================
   DRAW SKELETON
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

  [24, 26],
  [26, 28],

  [27, 29],
  [29, 31],

  [28, 30],
  [30, 32]

];


function drawSkeleton(
  ctx,
  landmarks
) {

  if (
    !APP.options.skeleton
  ) {
    return;
  }


  const canvas =
    ctx.canvas;


  ctx.lineWidth =
    3;

  ctx.strokeStyle =
    "#65e7ff";


  CONNECTIONS.forEach(
    ([a, b]) => {

      const p1 =
        landmarks[a];

      const p2 =
        landmarks[b];


      if (
        !p1 ||
        !p2 ||
        p1.visibility < .4 ||
        p2.visibility < .4
      ) {
        return;
      }


      ctx.beginPath();

      ctx.moveTo(
        p1.x * canvas.width,
        p1.y * canvas.height
      );

      ctx.lineTo(
        p2.x * canvas.width,
        p2.y * canvas.height
      );

      ctx.stroke();

    }
  );


  landmarks.forEach(
    point => {

      if (
        point.visibility < .4
      ) {
        return;
      }


      ctx.beginPath();

      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        4,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "#20a7ff";

      ctx.fill();

    }
  );

}


/* =========================================================
   ANGLES
========================================================= */

function calculateAngle(
  a,
  b,
  c
) {

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


  const mag1 =
    Math.hypot(
      ab.x,
      ab.y
    );


  const mag2 =
    Math.hypot(
      cb.x,
      cb.y
    );


  if (
    mag1 === 0 ||
    mag2 === 0
  ) {
    return 0;
  }


  const cos =
    Math.max(
      -1,
      Math.min(
        1,
        dot /
        (mag1 * mag2)
      )
    );


  return Math.round(
    Math.acos(cos) *
    180 /
    Math.PI
  );

}


function calculateAngles(
  p
) {

  if (!p) return;


  APP.angles.leftHip =
    calculateAngle(
      p[11],
      p[23],
      p[25]
    );


  APP.angles.rightHip =
    calculateAngle(
      p[12],
      p[24],
      p[26]
    );


  APP.angles.leftKnee =
    calculateAngle(
      p[23],
      p[25],
      p[27]
    );


  APP.angles.rightKnee =
    calculateAngle(
      p[24],
      p[26],
      p[28]
    );


  APP.angles.leftAnkle =
    calculateAngle(
      p[25],
      p[27],
      p[31]
    );


  APP.angles.rightAnkle =
    calculateAngle(
      p[26],
      p[28],
      p[32]
    );


  APP.angles.leftElbow =
    calculateAngle(
      p[11],
      p[13],
      p[15]
    );


  APP.angles.rightElbow =
    calculateAngle(
      p[12],
      p[14],
      p[16]
    );


  const shoulderMid = midpoint(
    p[11],
    p[12]
  );


  const hipMid = midpoint(
    p[23],
    p[24]
  );


  if (
    shoulderMid &&
    hipMid
  ) {

    const dx =
      shoulderMid.x -
      hipMid.x;

    const dy =
      shoulderMid.y -
      hipMid.y;


    APP.angles.trunk =
      Math.round(
        Math.abs(
          Math.atan2(
            dx,
            -dy
          ) *
          180 /
          Math.PI
        )
      );

  }

}


/* =========================================================
   DRAW ANGLES
========================================================= */

function drawJointAngles(
  ctx,
  p
) {

  if (
    !APP.options.angles
  ) {
    return;
  }


  const canvas =
    ctx.canvas;


  const labels = [

    {
      point: p[23],
      value: APP.angles.leftHip
    },

    {
      point: p[24],
      value: APP.angles.rightHip
    },

    {
      point: p[25],
      value: APP.angles.leftKnee
    },

    {
      point: p[26],
      value: APP.angles.rightKnee
    },

    {
      point: p[27],
      value: APP.angles.leftAnkle
    },

    {
      point: p[28],
      value: APP.angles.rightAnkle
    }

  ];


  ctx.font =
    "bold 12px Arial";

  ctx.textAlign =
    "center";


  labels.forEach(
    item => {

      if (
        !item.point ||
        item.point.visibility < .4
      ) {
        return;
      }


      const x =
        item.point.x *
        canvas.width;

      const y =
        item.point.y *
        canvas.height;


      ctx.fillStyle =
        "#ffffff";

      ctx.fillText(
        `${item.value}°`,
        x,
        y - 10
      );

    }
  );

}


/* =========================================================
   REFERENCE LINES
========================================================= */

function drawReferenceLines(
  ctx,
  p
) {

  if (
    !APP.options.baseline
  ) {
    return;
  }


  const canvas =
    ctx.canvas;


  const hip =
    midpoint(
      p[23],
      p[24]
    );


  const shoulder =
    midpoint(
      p[11],
      p[12]
    );


  if (
    !hip ||
    !shoulder
  ) {
    return;
  }


  /* 수직 기준선 */

  ctx.save();

  ctx.setLineDash(
    [7, 6]
  );

  ctx.lineWidth =
    2;

  ctx.strokeStyle =
    "#ffd34d";


  const x =
    hip.x *
    canvas.width;


  ctx.beginPath();

  ctx.moveTo(
    x,
    0
  );

  ctx.lineTo(
    x,
    canvas.height
  );

  ctx.stroke();


  /* 몸통 기준선 */

  ctx.setLineDash([]);

  ctx.strokeStyle =
    "#a778ff";


  ctx.beginPath();

  ctx.moveTo(
    shoulder.x *
      canvas.width,
    shoulder.y *
      canvas.height
  );

  ctx.lineTo(
    hip.x *
      canvas.width,
    hip.y *
      canvas.height
  );

  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   CENTER OF MASS
========================================================= */

function drawCenterOfMass(
  ctx,
  p
) {

  if (
    !APP.options.center
  ) {
    return;
  }


  const points = [

    p[11],
    p[12],
    p[23],
    p[24],
    p[25],
    p[26]

  ].filter(
    point =>
      point &&
      point.visibility >= .4
  );


  if (!points.length) {
    return;
  }


  const center =
    points.reduce(
      (sum, point) => ({
        x:
          sum.x +
          point.x,

        y:
          sum.y +
          point.y
      }),
      {
        x: 0,
        y: 0
      }
    );


  center.x /=
    points.length;

  center.y /=
    points.length;


  const x =
    center.x *
    ctx.canvas.width;

  const y =
    center.y *
    ctx.canvas.height;


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    7,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    "#ff5f73";

  ctx.fill();


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    13,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    "rgba(255,95,115,.5)";

  ctx.stroke();

}


/* =========================================================
   PLACEHOLDER
========================================================= */

function drawAnalysisPlaceholder() {

  const canvas =
    $("poseCanvas");

  if (!canvas) return;


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

}


/* =========================================================
   MIDPOINT
========================================================= */

function midpoint(
  a,
  b
) {

  if (!a || !b) {
    return null;
  }


  return {
    x:
      (a.x + b.x) / 2,

    y:
      (a.y + b.y) / 2
  };

}


/* =========================================================
   FRAME DATA
========================================================= */

function saveFrameData(
  landmarks
) {

  if (!APP.analyzing) {
    return;
  }


  const frame = {

    time:
      APP.video?.currentTime || 0,

    angles:
      {
        ...APP.angles
      },

    center:
      calculateCenter(
        landmarks
      ),

    score:
      calculateFrameScore(
        landmarks
      )

  };


  APP.frameData.push(
    frame
  );


  if (
    APP.frameData.length >
    1000
  ) {

    APP.frameData.shift();

  }

}


/* =========================================================
   CENTER
========================================================= */

function calculateCenter(
  p
) {

  const points = [

    p[11],
    p[12],
    p[23],
    p[24]

  ].filter(Boolean);


  if (!points.length) {
    return {
      x: 0,
      y: 0
    };
  }


  return {

    x:
      points.reduce(
        (sum, item) =>
          sum + item.x,
        0
      ) /
      points.length,

    y:
      points.reduce(
        (sum, item) =>
          sum + item.y,
        0
      ) /
      points.length

  };

}


/* =========================================================
   FRAME SCORE
========================================================= */

function calculateFrameScore(
  p
) {

  let score = 75;


  const kneeLeft =
    APP.angles.leftKnee;

  const kneeRight =
    APP.angles.rightKnee;


  if (
    kneeLeft > 60 &&
    kneeLeft < 175
  ) {
    score += 8;
  }


  if (
    kneeRight > 60 &&
    kneeRight < 175
  ) {
    score += 8;
  }


  const difference =
    Math.abs(
      kneeLeft -
      kneeRight
    );


  if (
    difference < 10
  ) {
    score += 7;
  } else if (
    difference > 30
  ) {
    score -= 15;
  }


  return Math.max(
    0,
    Math.min(
      100,
      score
    )
  );

}


/* =========================================================
   KEY FRAMES
========================================================= */

function findKeyFrames() {

  if (
    !APP.frameData.length
  ) {

    APP.keyFrames =
      [];

    renderKeyFrames();

    return;

  }


  const sorted =
    APP.frameData
      .map(
        (frame, index) => ({
          ...frame,
          index
        })
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );


  const selected = [];


  for (
    const frame of sorted
  ) {

    const tooClose =
      selected.some(
        selectedFrame =>
          Math.abs(
            selectedFrame.time -
            frame.time
          ) < .35
      );


    if (
      !tooClose
    ) {

      selected.push(
        frame
      );

    }


    if (
      selected.length >= 5
    ) {
      break;
    }

  }


  APP.keyFrames =
    selected.sort(
      (a, b) =>
        a.time -
        b.time
    );


  renderKeyFrames();

}


/* =========================================================
   RENDER KEY FRAMES
========================================================= */

function renderKeyFrames() {

  const container =
    $("keyFrameList");

  if (!container) {
    return;
  }


  if (
    !APP.keyFrames.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        분석 후 자동으로 핵심 프레임이 추출됩니다.
      </div>
    `;

    if ($("keyFrameCount")) {
      $("keyFrameCount").textContent =
        "0";
    }

    return;

  }


  if ($("keyFrameCount")) {
    $("keyFrameCount").textContent =
      APP.keyFrames.length;
  }


  container.innerHTML =
    APP.keyFrames.map(
      (frame, index) => `

        <button
          class="key-frame-item"
          data-key-time="${frame.time}"
          type="button"
        >

          <span class="key-frame-number">
            ${index + 1}
          </span>

          <span>

            <strong>
              핵심 프레임 ${index + 1}
            </strong>

            <span>
              ${formatTime(frame.time)}
              · 안정성 ${Math.round(frame.score)}
            </span>

          </span>

          <span>
            →
          </span>

        </button>

      `
    ).join("");


  container
    .querySelectorAll(
      "[data-key-time]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          if (!APP.video) {
            return;
          }


          APP.video.pause();

          APP.video.currentTime =
            Number(
              button.dataset.keyTime
            );

        }
      );

    });

}


/* =========================================================
   PERFORMANCE SCORE
========================================================= */

function calculatePerformanceScores() {

  if (
    !APP.frameData.length
  ) {

    APP.scores = {
      total: 0,
      stability: 0,
      alignment: 0,
      symmetry: 0,
      efficiency: 0
    };

    updateScoreUI();

    return;

  }


  const frames =
    APP.frameData;


  const averageFrameScore =
    frames.reduce(
      (sum, frame) =>
        sum +
        frame.score,
      0
    ) /
    frames.length;


  const kneeDiff =
    frames.reduce(
      (sum, frame) =>
        sum +
        Math.abs(
          frame.angles.leftKnee -
          frame.angles.rightKnee
        ),
      0
    ) /
    frames.length;


  const symmetry =
    Math.max(
      0,
      Math.min(
        100,
        100 -
        kneeDiff * 2
      )
    );


  const stability =
    Math.max(
      0,
      Math.min(
        100,
        averageFrameScore
      )
    );


  const alignment =
    Math.max(
      0,
      Math.min(
        100,
        averageFrameScore -
        Math.abs(
          frames.reduce(
            (sum, frame) =>
              sum +
              Math.abs(
                frame.angles.trunk
              ),
            0
          ) /
          frames.length
        ) *
        .25
      )
    );


  const efficiency =
    Math.round(
      (
        stability +
        alignment +
        symmetry
      ) / 3
    );


  const total =
    Math.round(
      (
        stability +
        alignment +
        symmetry +
        efficiency
      ) / 4
    );


  APP.scores = {

    total,

    stability:
      Math.round(stability),

    alignment:
      Math.round(alignment),

    symmetry:
      Math.round(symmetry),

    efficiency

  };


  updateScoreUI();

}


/* =========================================================
   SCORE UI
========================================================= */

function updateScoreUI() {

  const s =
    APP.scores;


  setText(
    "analysisTotalScore",
    `${s.total} / 100`
  );


  setText(
    "stabilityScore",
    s.stability
  );

  setText(
    "alignmentScore",
    s.alignment
  );

  setText(
    "symmetryScore",
    s.symmetry
  );

  setText(
    "efficiencyScore",
    s.efficiency
  );


  setBar(
    "stabilityBar",
    s.stability
  );

  setBar(
    "alignmentBar",
    s.alignment
  );

  setBar(
    "symmetryBar",
    s.symmetry
  );

  setBar(
    "efficiencyBar",
    s.efficiency
  );

}


/* =========================================================
   ANGLE UI
========================================================= */

function updateAngleUI() {

  const a =
    APP.angles;


  setText(
    "leftHipAngle",
    `${a.leftHip}°`
  );

  setText(
    "rightHipAngle",
    `${a.rightHip}°`
  );

  setText(
    "leftKneeAngle",
    `${a.leftKnee}°`
  );

  setText(
    "rightKneeAngle",
    `${a.rightKnee}°`
  );

  setText(
    "rightKneeAngle2",
    `${a.rightKnee}°`
  );

  setText(
    "leftElbowAngle",
    `${a.leftElbow}°`
  );

  setText(
    "rightElbowAngle",
    `${a.rightElbow}°`
  );

  setText(
    "trunkAngle",
    `${a.trunk}°`
  );

}


/* =========================================================
   FEEDBACK
========================================================= */

function renderFeedback() {

  const containers = [
    $("analysisFeedback"),
    $("feedbackList")
  ].filter(Boolean);


  const s =
    APP.scores;


  const feedback = [];


  if (
    s.symmetry < 70
  ) {

    feedback.push({
      title: "좌우 대칭성 개선",
      text:
        "좌우 무릎 각도 차이가 크게 나타나는 구간이 있습니다. 한쪽에 체중이 과도하게 실리지 않도록 동작을 천천히 반복해보세요."
    });

  } else {

    feedback.push({
      title: "좌우 밸런스 양호",
      text:
        "좌우 하지 움직임의 차이가 비교적 작습니다. 현재의 움직임 패턴을 유지하면서 속도를 높이는 훈련을 권장합니다."
    });

  }


  if (
    s.alignment < 70
  ) {

    feedback.push({
      title: "신체 정렬 개선",
      text:
        "몸통과 하지의 정렬이 흔들리는 구간이 확인됩니다. 코어 안정성과 고관절 조절 능력을 함께 훈련하세요."
    });

  } else {

    feedback.push({
      title: "정렬 상태 양호",
      text:
        "분석 구간에서 중심축을 비교적 안정적으로 유지하고 있습니다."
    });

  }


  if (
    s.stability < 70
  ) {

    feedback.push({
      title: "동작 안정성 개선",
      text:
        "착지 및 방향전환 구간에서 안정성을 높이는 훈련이 필요합니다."
    });

  } else {

    feedback.push({
      title: "동작 안정성 양호",
      text:
        "전체 동작에서 중심 이동이 비교적 안정적입니다."
    });

  }


  containers.forEach(
    container => {

      container.innerHTML =
        feedback.map(
          item => `

            <div class="feedback-item">

              <strong>
                ${item.title}
              </strong>

              <p>
                ${item.text}
              </p>

            </div>

          `
        ).join("");

    }
  );

}


/* =========================================================
   TRAINING RECOMMENDATION
========================================================= */

function renderTrainingRecommendations() {

  const container =
    $("trainingRecommendations");


  if (!container) {
    return;
  }


  const training = [];


  if (
    APP.scores.stability < 80
  ) {

    training.push(
      [
        "싱글레그 밸런스",
        "한발 서기 30초 × 3세트",
        "안정성"
      ]
    );

    training.push(
      [
        "스플릿 스쿼트",
        "좌우 8~10회 × 4세트",
        "하지"
      ]
    );

  }


  if (
    APP.scores.symmetry < 80
  ) {

    training.push(
      [
        "싱글레그 스쿼트",
        "좌우 6~8회 × 3세트",
        "대칭성"
      ]
    );

  }


  if (
    APP.scores.alignment < 80
  ) {

    training.push(
      [
        "데드버그",
        "좌우 10회 × 3세트",
        "코어"
      ]
    );

    training.push(
      [
        "사이드 플랭크",
        "좌우 30초 × 3세트",
        "정렬"
      ]
    );

  }


  training.push(
    [
      "점프 착지 드릴",
      "5회 × 4세트",
      "체대입시"
    ]
  );


  training.push(
    [
      "고관절 가동성",
      "좌우 30초 × 3세트",
      "가동성"
    ]
  );


  container.innerHTML =
    training.map(
      item => `

        <div class="training-card">

          <span class="training-tag">
            ${item[2]}
          </span>

          <strong>
            ${item[0]}
          </strong>

          <small>
            ${item[1]}
          </small>

          <div class="training-meta">
            <span>
              맞춤 추천
            </span>
          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   REPORT
========================================================= */

function updateReport() {

  setText(
    "reportTotalScore",
    `${APP.scores.total}/100`
  );

  setText(
    "reportStability",
    APP.scores.stability
  );

  setText(
    "reportAlignment",
    APP.scores.alignment
  );

  setText(
    "reportSymmetry",
    APP.scores.symmetry
  );

  setText(
    "reportEfficiency",
    APP.scores.efficiency
  );


  createRadarChart(
    "reportRadar",
    "reportRadar"
  );

  updateRadar(
    "reportRadar"
  );


  renderFeedback();

}


/* =========================================================
   COMPARISON
========================================================= */

function updateComparison() {

  const records =
    getRecords();


  const before =
    records[
      records.length - 2
    ];

  const after =
    records[
      records.length - 1
    ];


  const beforeBox =
    $("comparisonBefore");

  const afterBox =
    $("comparisonAfter");


  if (
    beforeBox &&
    before
  ) {

    beforeBox.innerHTML = `

      <div>

        <strong>
          ${before.eventName}
        </strong>

        <p>
          이전 기록
        </p>

        <b>
          ${before.score}점
        </b>

      </div>

    `;

  }


  if (
    afterBox &&
    after
  ) {

    afterBox.innerHTML = `

      <div>

        <strong>
          ${after.eventName}
        </strong>

        <p>
          최근 기록
        </p>

        <b>
          ${after.score}점
        </b>

      </div>

    `;

  }


  const metrics =
    $("comparisonMetrics");


  if (
    !metrics ||
    !before ||
    !after
  ) {
    return;
  }


  const change =
    Number(after.score || 0) -
    Number(before.score || 0);


  metrics.innerHTML = `

    <div class="comparison-metric">

      <span>
        이전
      </span>

      <strong>
        ${before.score}
      </strong>

    </div>


    <div class="comparison-metric">

      <span>
        현재
      </span>

      <strong>
        ${after.score}
      </strong>

    </div>


    <div class="comparison-metric">

      <span>
        변화
      </span>

      <strong class="${
        change >= 0
          ? "change-up"
          : "change-down"
      }">

        ${
          change >= 0
            ? "+"
            : ""
        }${change}

      </strong>

    </div>

  `;

}


/* =========================================================
   PRINT
========================================================= */

function setupPrint() {

  $("printReportButton")
    ?.addEventListener(
      "click",
      () => {

        updateReport();

        window.print();

      }
    );

}


/* =========================================================
   TOGGLES
========================================================= */

function setupAnalysisToggles() {

  const labels =
    document.querySelectorAll(
      ".analysis-toggles label"
    );


  labels.forEach(
    label => {

      const checkbox =
        label.querySelector(
          "input"
        );


      if (!checkbox) {
        return;
      }


      checkbox.addEventListener(
        "change",
        () => {

          const text =
            label
              .innerText
              .trim();


          if (
            text.includes(
              "스켈레톤"
            )
          ) {

            APP.options.skeleton =
              checkbox.checked;

          }

          else if (
            text.includes(
              "관절각"
            )
          ) {

            APP.options.angles =
              checkbox.checked;

          }

          else if (
            text.includes(
              "관절 궤적"
            )
          ) {

            APP.options.trajectory =
              checkbox.checked;

          }

          else if (
            text.includes(
              "기준선"
            )
          ) {

            APP.options.baseline =
              checkbox.checked;

          }

          else if (
            text.includes(
              "신체 중심"
            )
          ) {

            APP.options.center =
              checkbox.checked;

          }

          else if (
            text.includes(
              "자동 핵심프레임"
            )
          ) {

            APP.options.keyFrames =
              checkbox.checked;

          }

        }
      );

    }
  );

}


/* =========================================================
   ANGLE CHART
========================================================= */

function createAngleChart() {

  const canvas =
    $("angleChart");

  if (
    !canvas ||
    typeof Chart ===
    "undefined"
  ) {
    return;
  }


  destroyChart(
    "angle"
  );


  APP.charts.angle =
    new Chart(
      canvas,
      {
        type: "line",

        data: {

          labels: [],

          datasets: [

            {
              label: "좌측 무릎",
              data: [],
              borderWidth: 2,
              tension: .3,
              pointRadius: 0
            },

            {
              label: "우측 무릎",
              data: [],
              borderWidth: 2,
              tension: .3,
              pointRadius: 0
            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: true
            }
          },

          scales: {

            y: {
              min: 0,
              max: 190
            }

          }

        }

      }
    );

}


/* =========================================================
   UPDATE ANGLE CHART
========================================================= */

function updateAngleChart() {

  const chart =
    APP.charts.angle;

  if (!chart) return;


  chart.data.labels =
    APP.frameData.map(
      (_, index) =>
        index + 1
    );


  chart.data.datasets[0].data =
    APP.frameData.map(
      frame =>
        frame.angles.leftKnee
    );


  chart.data.datasets[1].data =
    APP.frameData.map(
      frame =>
        frame.angles.rightKnee
    );


  chart.update();

}


/* =========================================================
   TRAJECTORY
========================================================= */

function drawTrajectory() {

  const canvas =
    $("trajectoryCanvas");

  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  const width =
    canvas.clientWidth || 600;

  const height =
    canvas.clientHeight || 300;


  canvas.width =
    width * devicePixelRatio;

  canvas.height =
    height * devicePixelRatio;


  ctx.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  if (
    !APP.frameData.length
  ) {
    return;
  }


  const points =
    APP.frameData.map(
      frame =>
        frame.center
    );


  ctx.strokeStyle =
    "#65e7ff";

  ctx.lineWidth =
    2;

  ctx.beginPath();


  points.forEach(
    (point, index) => {

      const x =
        point.x *
        width;

      const y =
        point.y *
        height;


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

}


/* =========================================================
   TIME
========================================================= */

function formatTime(
  seconds
) {

  if (
    !Number.isFinite(
      seconds
    )
  ) {
    return "00:00";
  }


  const min =
    Math.floor(
      seconds / 60
    );

  const sec =
    Math.floor(
      seconds % 60
    );


  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

}


/* =========================================================
   TEXT
========================================================= */

function setText(
  id,
  value
) {

  const element =
    $(id);

  if (element) {
    element.textContent =
      value;
  }

}


function setBar(
  id,
  value
) {

  const element =
    $(id);

  if (element) {

    element.style.width =
      `${Math.max(
        0,
        Math.min(
          100,
          Number(value) || 0
        )
      )}%`;

  }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  message
) {

  const toast =
    $("toast");

  if (!toast) {
    return;
  }


  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.timer
  );


  showToast.timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2300
    );

}


/* =========================================================
   EVENT ANALYSIS CONNECTION
========================================================= */

document.addEventListener(
  "eventAnalysisComplete",
  event => {

    const record =
      event.detail;


    if (!record) {
      return;
    }


    updateDashboard();

  }
);


/* =========================================================
   INIT
========================================================= */

function initApp() {

  chartDefaults();

  setupNavigation();

  startClock();

  setupVideo();

  setupPose();

  setupAnalysisToggles();

  setupPrint();

  createAngleChart();

  updateDashboard();

  updateScoreUI();

  updateAngleUI();

  renderFeedback();

  renderTrainingRecommendations();


  console.log(
    "Seolcheon Sports Science PRO initialized."
  );

}


/* =========================================================
   DOM READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initApp
  );

} else {

  initApp();

}