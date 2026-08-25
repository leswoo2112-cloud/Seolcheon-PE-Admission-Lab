/* =========================================================
   설천고 스포츠과학 분석센터 PRO
   ④ app.js
   전체 시스템 / 영상분석 / 관절각 / 기준선 /
   핵심 프레임 / 차트 / 리포트
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const APP = {

  page: "dashboard",

  video: null,

  videoURL: null,

  pose: null,

  poseReady: false,

  analyzing: false,

  animationFrame: null,

  currentResults: null,

  lastPose: null,

  frameNumber: 0,

  totalFrames: 0,

  trajectory: [],

  keyFrames: [],

  angleHistory: [],

  analysisStartedAt: 0,

  charts: {},

  videoFPS: 30,

  lastVideoTime: 0,

  options: {

    skeleton: true,

    angles: true,

    trajectory: true,

    baseline: true,

    center: true,

    keyFrames: true

  }

};


/* =========================================================
   DOM
========================================================= */

const $ = id =>
  document.getElementById(id);

const qs = selector =>
  document.querySelector(selector);

const qsa = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   UTILITY
========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(max, value)
  );

}


function round(
  value,
  digits = 1
) {

  const power =
    10 ** digits;

  return Math.round(
    value * power
  ) / power;

}


function distance(
  a,
  b
) {

  if (!a || !b) {
    return 0;
  }

  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );

}


function angle(
  a,
  b,
  c
) {

  if (!a || !b || !c) {
    return 0;
  }


  const BA = {

    x: a.x - b.x,

    y: a.y - b.y

  };


  const BC = {

    x: c.x - b.x,

    y: c.y - b.y

  };


  const dot =
    BA.x * BC.x +
    BA.y * BC.y;


  const magBA =
    Math.hypot(
      BA.x,
      BA.y
    );


  const magBC =
    Math.hypot(
      BC.x,
      BC.y
    );


  if (
    magBA === 0 ||
    magBC === 0
  ) {

    return 0;

  }


  const cos =
    clamp(
      dot /
      (
        magBA *
        magBC
      ),
      -1,
      1
    );


  return (
    Math.acos(cos) *
    180 /
    Math.PI
  );

}


/* =========================================================
   TOAST
========================================================= */

function toast(
  message
) {

  const element =
    $("toast");

  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  clearTimeout(
    toast.timer
  );


  toast.timer =
    setTimeout(
      () => {

        element.classList.remove(
          "show"
        );

      },
      2300
    );

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

  const element =
    $("clock");

  if (!element) {
    return;
  }


  const now =
    new Date();


  element.textContent =
    now.toLocaleTimeString(
      "ko-KR",
      {
        hour12: false
      }
    );

}


setInterval(
  updateClock,
  1000
);


/* =========================================================
   PAGE NAVIGATION
========================================================= */

const PAGE_NAMES = {

  dashboard:
    "대시보드",

  athletes:
    "선수 관리",

  events:
    "체대입시",

  analysis:
    "자세분석",

  comparison:
    "비교분석",

  records:
    "분석기록",

  report:
    "리포트"

};


function openPage(
  pageName
) {

  if (
    !PAGE_NAMES[pageName]
  ) {

    return;

  }


  APP.page =
    pageName;


  qsa(".page")
    .forEach(
      page => {

        page.classList.toggle(
          "active",
          page.id ===
          `page-${pageName}`
        );

      }
    );


  qsa(".nav-button")
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
          pageName
        );

      }
    );


  const title =
    $("pageTitle");


  if (title) {

    title.textContent =
      PAGE_NAMES[pageName];

  }


  if (
    pageName ===
    "dashboard"
  ) {

    updateDashboardCharts();

  }


  if (
    pageName ===
    "comparison"
  ) {

    renderComparison();

  }


  if (
    pageName ===
    "report"
  ) {

    updateReport();

  }

}


/* =========================================================
   NAV EVENTS
========================================================= */

function initNavigation() {

  qsa(".nav-button")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            openPage(
              button.dataset.page
            );

          }
        );

      }
    );


  qsa("[data-open-page]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            openPage(
              button.dataset.openPage
            );

          }
        );

      }
    );

}


/* =========================================================
   VIDEO ELEMENT
========================================================= */

function initVideo() {

  APP.video =
    $("analysisVideo");


  if (!APP.video) {
    return;
  }


  APP.video.addEventListener(
    "loadedmetadata",
    () => {

      const placeholder =
        $("videoPlaceholder");

      if (placeholder) {

        placeholder.style.display =
          "none";

      }


      APP.videoFPS =
        30;


      APP.totalFrames =
        Math.floor(
          APP.video.duration *
          APP.videoFPS
        );


      drawVideoCanvas();

      toast(
        "영상이 준비되었습니다."
      );

    }
  );


  APP.video.addEventListener(
    "timeupdate",
    () => {

      if (
        !APP.analyzing
      ) {

        drawVideoCanvas();

      }

    }
  );


  APP.video.addEventListener(
    "ended",
    () => {

      if (
        APP.analyzing
      ) {

        stopAnalysis();

      }

    }
  );


  $("uploadVideoButton")
    ?.addEventListener(
      "click",
      () => {

        $("videoInput")?.click();

      }
    );


  $("videoInput")
    ?.addEventListener(
      "change",
      handleVideoUpload
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

        setVideoSpeed(
          .5
        );

      }
    );


  $("videoNormal")
    ?.addEventListener(
      "click",
      () => {

        setVideoSpeed(
          1
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


  initAnalysisToggles();

}


/* =========================================================
   VIDEO UPLOAD
========================================================= */

function handleVideoUpload(
  event
) {

  const file =
    event.target.files?.[0];


  if (!file) {
    return;
  }


  if (
    !file.type.startsWith(
      "video/"
    )
  ) {

    toast(
      "영상 파일만 선택할 수 있습니다."
    );

    return;

  }


  if (
    APP.videoURL
  ) {

    URL.revokeObjectURL(
      APP.videoURL
    );

  }


  APP.videoURL =
    URL.createObjectURL(
      file
    );


  APP.video.src =
    APP.videoURL;


  APP.video.load();


  APP.trajectory = [];

  APP.keyFrames = [];

  APP.angleHistory = [];

  APP.currentResults = null;

}


/* =========================================================
   VIDEO CONTROL
========================================================= */

function toggleVideo() {

  if (!APP.video) {
    return;
  }


  if (
    APP.video.paused
  ) {

    APP.video.play();

    if (
      $("videoPlayPause")
    ) {

      $("videoPlayPause")
        .textContent =
        "Ⅱ";

    }

  } else {

    APP.video.pause();

    if (
      $("videoPlayPause")
    ) {

      $("videoPlayPause")
        .textContent =
        "▶";

    }

  }

}


function setVideoSpeed(
  speed
) {

  if (!APP.video) {
    return;
  }


  APP.video.playbackRate =
    speed;


  $("videoSlow")
    ?.classList.toggle(
      "active",
      speed === .5
    );


  $("videoNormal")
    ?.classList.toggle(
      "active",
      speed === 1
    );

}


function previousFrame() {

  if (!APP.video) {
    return;
  }


  APP.video.pause();


  APP.video.currentTime =
    Math.max(
      0,
      APP.video.currentTime -
      (
        1 /
        APP.videoFPS
      )
    );


  drawVideoCanvas();

}


function nextFrame() {

  if (!APP.video) {
    return;
  }


  APP.video.pause();


  APP.video.currentTime =
    Math.min(
      APP.video.duration || 0,
      APP.video.currentTime +
      (
        1 /
        APP.videoFPS
      )
    );


  drawVideoCanvas();

}


/* =========================================================
   CANVAS
========================================================= */

const POSE_CONNECTIONS = [

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


function setupPoseCanvas() {

  const canvas =
    $("poseCanvas");

  if (!canvas) {
    return;
  }


  resizeCanvasToDisplaySize(
    canvas
  );

}


function resizeCanvasToDisplaySize(
  canvas
) {

  const rect =
    canvas.getBoundingClientRect();


  const ratio =
    window.devicePixelRatio ||
    1;


  const width =
    Math.max(
      1,
      Math.floor(
        rect.width *
        ratio
      )
    );


  const height =
    Math.max(
      1,
      Math.floor(
        rect.height *
        ratio
      )
    );


  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {

    canvas.width =
      width;

    canvas.height =
      height;

  }

}


function drawVideoCanvas() {

  const canvas =
    $("poseCanvas");


  if (!canvas) {
    return;
  }


  resizeCanvasToDisplaySize(
    canvas
  );


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
    APP.currentResults
  ) {

    drawPoseResults(
      ctx,
      canvas,
      APP.currentResults
    );

  }

}


/* =========================================================
   DRAW POSE
========================================================= */

function drawPoseResults(
  ctx,
  canvas,
  results
) {

  const landmarks =
    results.poseLandmarks;


  if (
    !landmarks ||
    landmarks.length <
    33
  ) {

    return;

  }


  const sx =
    canvas.width;

  const sy =
    canvas.height;


  /* 기준선 */

  if (
    APP.options.baseline
  ) {

    drawBaseline(
      ctx,
      landmarks,
      sx,
      sy
    );

  }


  /* 궤적 */

  if (
    APP.options.trajectory
  ) {

    drawTrajectory(
      ctx,
      sx,
      sy
    );

  }


  /* skeleton */

  if (
    APP.options.skeleton
  ) {

    ctx.lineWidth =
      Math.max(
        2,
        sx / 500
      );

    ctx.lineCap =
      "round";

    ctx.strokeStyle =
      "#65e7ff";


    POSE_CONNECTIONS
      .forEach(
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
            !a ||
            !b ||
            (a.visibility ?? 1) <
              .35 ||
            (b.visibility ?? 1) <
              .35
          ) {

            return;

          }


          ctx.beginPath();

          ctx.moveTo(
            a.x * sx,
            a.y * sy
          );

          ctx.lineTo(
            b.x * sx,
            b.y * sy
          );

          ctx.stroke();

        }
      );

  }


  /* joints */

  landmarks.forEach(
    landmark => {

      if (
        (landmark.visibility ?? 1) <
        .35
      ) {

        return;

      }


      ctx.beginPath();

      ctx.arc(
        landmark.x * sx,
        landmark.y * sy,
        Math.max(
          3,
          sx / 180
        ),
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.fill();

    }
  );


  /* center */

  if (
    APP.options.center
  ) {

    const center =
      getBodyCenter(
        landmarks
      );


    if (center) {

      ctx.beginPath();

      ctx.arc(
        center.x * sx,
        center.y * sy,
        7,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "#ffd34d";

      ctx.fill();

    }

  }


  /* angles */

  if (
    APP.options.angles
  ) {

    drawAngleLabels(
      ctx,
      landmarks,
      sx,
      sy
    );

  }

}


/* =========================================================
   BASELINE
========================================================= */

function drawBaseline(
  ctx,
  lm,
  sx,
  sy
) {

  const shoulder =
    midpoint(
      lm[11],
      lm[12]
    );


  const hip =
    midpoint(
      lm[23],
      lm[24]
    );


  if (
    !shoulder ||
    !hip
  ) {

    return;

  }


  ctx.save();

  ctx.lineWidth =
    Math.max(
      2,
      sx / 600
    );

  ctx.setLineDash([
    10,
    7
  ]);


  /* trunk axis */

  ctx.strokeStyle =
    "#a778ff";

  ctx.beginPath();

  ctx.moveTo(
    shoulder.x * sx,
    shoulder.y * sy
  );

  ctx.lineTo(
    hip.x * sx,
    hip.y * sy
  );

  ctx.stroke();


  /* vertical */

  ctx.strokeStyle =
    "#ffd34d";

  ctx.beginPath();

  ctx.moveTo(
    hip.x * sx,
    0
  );

  ctx.lineTo(
    hip.x * sx,
    sy
  );

  ctx.stroke();


  /* horizontal shoulder */

  ctx.setLineDash([
    5,
    5
  ]);

  ctx.strokeStyle =
    "#55e6a5";

  ctx.beginPath();

  ctx.moveTo(
    lm[11].x * sx,
    lm[11].y * sy
  );

  ctx.lineTo(
    lm[12].x * sx,
    lm[12].y * sy
  );

  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   TRAJECTORY
========================================================= */

function drawTrajectory(
  ctx,
  sx,
  sy
) {

  if (
    APP.trajectory.length <
    2
  ) {

    return;

  }


  ctx.save();

  ctx.strokeStyle =
    "#55e6a5";

  ctx.lineWidth =
    Math.max(
      2,
      sx / 700
    );

  ctx.beginPath();


  APP.trajectory.forEach(
    (point, index) => {

      if (index === 0) {

        ctx.moveTo(
          point.x * sx,
          point.y * sy
        );

      } else {

        ctx.lineTo(
          point.x * sx,
          point.y * sy
        );

      }

    }
  );


  ctx.stroke();

  ctx.restore();

}


/* =========================================================
   ANGLE LABELS
========================================================= */

function drawAngleLabels(
  ctx,
  lm,
  sx,
  sy
) {

  const joints = [

    {
      name: "L KNEE",
      points: [23,25,27]
    },

    {
      name: "R KNEE",
      points: [24,26,28]
    },

    {
      name: "L HIP",
      points: [11,23,25]
    },

    {
      name: "R HIP",
      points: [12,24,26]
    },

    {
      name: "L ELBOW",
      points: [11,13,15]
    },

    {
      name: "R ELBOW",
      points: [12,14,16]
    }

  ];


  ctx.save();

  ctx.font =
    `${Math.max(
      10,
      sx / 95
    )}px sans-serif`;

  ctx.textBaseline =
    "middle";


  joints.forEach(
    item => {

      const a =
        lm[item.points[0]];

      const b =
        lm[item.points[1]];

      const c =
        lm[item.points[2]];


      if (
        !a ||
        !b ||
        !c
      ) {

        return;

      }


      const value =
        angle(
          a,
          b,
          c
        );


      const x =
        b.x * sx;


      const y =
        b.y * sy;


      ctx.fillStyle =
        "rgba(3,10,18,.8)";

      const text =
        `${Math.round(value)}°`;


      const width =
        ctx.measureText(
          text
        ).width +
        10;


      ctx.fillRect(
        x - width / 2,
        y - 18,
        width,
        18
      );


      ctx.fillStyle =
        "#ffffff";


      ctx.textAlign =
        "center";


      ctx.fillText(
        text,
        x,
        y - 9
      );

    }
  );


  ctx.restore();

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
      (a.y + b.y) / 2,

    visibility:
      Math.min(
        a.visibility ?? 1,
        b.visibility ?? 1
      )

  };

}


/* =========================================================
   BODY CENTER
========================================================= */

function getBodyCenter(
  lm
) {

  const shoulder =
    midpoint(
      lm[11],
      lm[12]
    );


  const hip =
    midpoint(
      lm[23],
      lm[24]
    );


  if (
    !shoulder ||
    !hip
  ) {

    return null;

  }


  return {

    x:
      (shoulder.x +
       hip.x) /
      2,

    y:
      (shoulder.y +
       hip.y) /
      2

  };

}


/* =========================================================
   ANGLE CALCULATION
========================================================= */

function calculateAllAngles(
  lm
) {

  return {

    leftHip:
      angle(
        lm[11],
        lm[23],
        lm[25]
      ),

    rightHip:
      angle(
        lm[12],
        lm[24],
        lm[26]
      ),

    leftKnee:
      angle(
        lm[23],
        lm[25],
        lm[27]
      ),

    rightKnee:
      angle(
        lm[24],
        lm[26],
        lm[28]
      ),

    leftAnkle:
      angle(
        lm[25],
        lm[27],
        lm[31]
      ),

    rightAnkle:
      angle(
        lm[26],
        lm[28],
        lm[32]
      ),

    leftElbow:
      angle(
        lm[11],
        lm[13],
        lm[15]
      ),

    rightElbow:
      angle(
        lm[12],
        lm[14],
        lm[16]
      )

  };

}


/* =========================================================
   TRUNK ANGLE
========================================================= */

function calculateTrunkAngle(
  lm
) {

  const shoulder =
    midpoint(
      lm[11],
      lm[12]
    );


  const hip =
    midpoint(
      lm[23],
      lm[24]
    );


  if (
    !shoulder ||
    !hip
  ) {

    return 0;

  }


  const dx =
    shoulder.x -
    hip.x;


  const dy =
    shoulder.y -
    hip.y;


  const radians =
    Math.atan2(
      Math.abs(dx),
      Math.abs(dy)
    );


  return (
    radians *
    180 /
    Math.PI
  );

}


/* =========================================================
   UPDATE ANGLE UI
========================================================= */

function updateAngleUI(
  angles,
  trunk
) {

  setText(
    "leftHipAngle",
    `${Math.round(
      angles.leftHip
    )}°`
  );


  setText(
    "rightHipAngle",
    `${Math.round(
      angles.rightHip
    )}°`
  );


  setText(
    "leftKneeAngle",
    `${Math.round(
      angles.leftKnee
    )}°`
  );


  setText(
    "rightKneeAngle",
    `${Math.round(
      angles.rightKnee
    )}°`
  );


  setText(
    "leftAnkleAngle",
    `${Math.round(
      angles.leftAnkle
    )}°`
  );


  setText(
    "rightAnkleAngle",
    `${Math.round(
      angles.rightAnkle
    )}°`
  );


  setText(
    "leftElbowAngle",
    `${Math.round(
      angles.leftElbow
    )}°`
  );


  setText(
    "rightElbowAngle",
    `${Math.round(
      angles.rightElbow
    )}°`
  );


  setText(
    "trunkAngle",
    `${Math.round(
      trunk
    )}°`
  );

}


/* =========================================================
   POSE SETUP
========================================================= */

function initPose() {

  if (
    typeof Pose ===
    "undefined"
  ) {

    console.warn(
      "MediaPipe Pose not loaded yet."
    );

    return false;

  }


  const pose =
    new Pose({

      locateFile:
        file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`

    });


  pose.setOptions({

    modelComplexity: 1,

    smoothLandmarks: true,

    enableSegmentation: false,

    smoothSegmentation: false,

    minDetectionConfidence: .5,

    minTrackingConfidence: .5

  });


  pose.onResults(
    handlePoseResults
  );


  APP.pose =
    pose;

  APP.poseReady =
    true;


  return true;

}


/* =========================================================
   POSE RESULTS
========================================================= */

function handlePoseResults(
  results
) {

  APP.currentResults =
    results;


  const lm =
    results.poseLandmarks;


  if (
    !lm ||
    lm.length <
    33
  ) {

    drawVideoCanvas();

    return;

  }


  const angles =
    calculateAllAngles(
      lm
    );


  const trunk =
    calculateTrunkAngle(
      lm
    );


  updateAngleUI(
    angles,
    trunk
  );


  const center =
    getBodyCenter(
      lm
    );


  if (center) {

    APP.trajectory.push({

      x: center.x,

      y: center.y,

      time:
        APP.video?.currentTime ||
        0

    });


    if (
      APP.trajectory.length >
      250
    ) {

      APP.trajectory.shift();

    }

  }


  APP.angleHistory.push({

    time:
      APP.video?.currentTime ||
      0,

    ...angles,

    trunk

  });


  if (
    APP.angleHistory.length >
    500
  ) {

    APP.angleHistory.shift();

  }


  updatePerformanceMetrics(
    lm,
    angles,
    trunk
  );


  if (
    APP.options.keyFrames
  ) {

    detectKeyFrame(
      lm,
      angles,
      trunk
    );

  }


  drawVideoCanvas();

}


/* =========================================================
   SEND FRAME
========================================================= */

async function analyzeCurrentFrame() {

  if (
    !APP.pose ||
    !APP.video ||
    APP.video.readyState <
    2
  ) {

    return;

  }


  try {

    await APP.pose.send({

      image:
        APP.video

    });

  } catch (error) {

    console.error(
      "Pose analysis error:",
      error
    );

  }

}


/* =========================================================
   START ANALYSIS
========================================================= */

async function startAnalysis() {

  if (!APP.video) {

    toast(
      "먼저 분석할 영상을 불러오세요."
    );

    return;

  }


  if (
    APP.video.readyState <
    2
  ) {

    toast(
      "영상이 아직 준비되지 않았습니다."
    );

    return;

  }


  if (
    !APP.poseReady
  ) {

    initPose();

  }


  if (
    !APP.pose
  ) {

    toast(
      "자세분석 모듈을 불러오는 중입니다."
    );

    return;

  }


  APP.analyzing =
    true;

  APP.trajectory = [];

  APP.keyFrames = [];

  APP.angleHistory = [];

  APP.lastPose = null;

  APP.analysisStartedAt =
    performance.now();


  APP.video.playbackRate =
    1;


  try {

    await APP.video.play();

  } catch {

    /* autoplay restriction */

  }


  analysisLoop();

  toast(
    "자세분석을 시작했습니다."
  );

}


/* =========================================================
   ANALYSIS LOOP
========================================================= */

async function analysisLoop() {

  if (
    !APP.analyzing
  ) {

    return;

  }


  await analyzeCurrentFrame();


  APP.animationFrame =
    requestAnimationFrame(
      analysisLoop
    );

}


/* =========================================================
   STOP
========================================================= */

function stopAnalysis() {

  APP.analyzing =
    false;


  if (
    APP.animationFrame
  ) {

    cancelAnimationFrame(
      APP.animationFrame
    );

  }


  APP.animationFrame =
    null;


  APP.video?.pause();


  calculateFinalAnalysis();

  renderKeyFrames();

  renderFeedback();

  renderTraining();

  updateAngleChart();

  updateTrajectoryChart();

  updateReport();


  toast(
    "자세분석이 완료되었습니다."
  );

}


/* =========================================================
   PERFORMANCE METRICS
========================================================= */

function updatePerformanceMetrics(
  lm,
  angles,
  trunk
) {

  const kneeLeft =
    angles.leftKnee;


  const kneeRight =
    angles.rightKnee;


  const symmetry =
    100 -
    Math.min(
      100,
      Math.abs(
        kneeLeft -
        kneeRight
      )
    );


  const alignment =
    clamp(
      100 -
      trunk * 2.2,
      0,
      100
    );


  const stability =
    calculateStability();


  const efficiency =
    clamp(
      (
        symmetry +
        alignment +
        stability
      ) / 3,
      0,
      100
    );


  updateMetric(
    "stability",
    stability
  );


  updateMetric(
    "alignment",
    alignment
  );


  updateMetric(
    "symmetry",
    symmetry
  );


  updateMetric(
    "efficiency",
    efficiency
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


  setText(
    "analysisTotalScore",
    `${total} / 100`
  );

}


/* =========================================================
   STABILITY
========================================================= */

function calculateStability() {

  if (
    APP.trajectory.length <
    3
  ) {

    return 0;

  }


  let movement = 0;


  for (
    let i = 1;
    i <
    APP.trajectory.length;
    i++
  ) {

    movement +=
      distance(
        APP.trajectory[i],
        APP.trajectory[i - 1]
      );

  }


  const average =
    movement /
    (
      APP.trajectory.length -
      1
    );


  return clamp(
    100 -
    average * 500,
    0,
    100
  );

}


/* =========================================================
   UPDATE METRIC
========================================================= */

function updateMetric(
  name,
  value
) {

  const safe =
    Math.round(
      clamp(
        value,
        0,
        100
      )
    );


  setText(
    `${name}Score`,
    safe
  );


  const bar =
    $(`${name}Bar`);


  if (bar) {

    bar.style.width =
      `${safe}%`;

  }

}


/* =========================================================
   KEY FRAME DETECTION
========================================================= */

function detectKeyFrame(
  lm,
  angles,
  trunk
) {

  const time =
    APP.video?.currentTime ||
    0;


  const kneeAverage =
    (
      angles.leftKnee +
      angles.rightKnee
    ) / 2;


  const velocity =
    calculateCenterVelocity();


  const previous =
    APP.keyFrames[
      APP.keyFrames.length - 1
    ];


  if (
    previous &&
    time -
    previous.time <
    .45
  ) {

    return;

  }


  let type =
    "";


  let score =
    0;


  if (
    kneeAverage <
    100
  ) {

    type =
      "최저점";

    score =
      92;

  } else if (
    velocity >
    .012
  ) {

    type =
      "폭발구간";

    score =
      95;

  } else if (
    Math.abs(
      trunk
    ) >
    12
  ) {

    type =
      "자세변화";

    score =
      88;

  }


  if (!type) {
    return;
  }


  APP.keyFrames.push({

    time,

    type,

    score,

    frame:
      Math.round(
        time *
        APP.videoFPS
      ),

    knee:
      Math.round(
        kneeAverage
      ),

    trunk:
      Math.round(
        trunk
      )

  });


  if (
    APP.keyFrames.length >
    12
  ) {

    APP.keyFrames.shift();

  }


  renderKeyFrames();

}


/* =========================================================
   CENTER VELOCITY
========================================================= */

function calculateCenterVelocity() {

  if (
    APP.trajectory.length <
    2
  ) {

    return 0;

  }


  const a =
    APP.trajectory[
      APP.trajectory.length - 2
    ];


  const b =
    APP.trajectory[
      APP.trajectory.length - 1
    ];


  return distance(
    a,
    b
  );

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


  setText(
    "keyFrameCount",
    APP.keyFrames.length
  );


  if (
    !APP.keyFrames.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        분석 후 자동 추출됩니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    APP.keyFrames
      .map(
        (frame, index) => `

          <button
            type="button"
            class="key-frame-item"
            data-key-time="${frame.time}"
          >

            <span
              class="key-frame-number"
            >
              ${index + 1}
            </span>

            <span>

              <strong>
                ${frame.type}
              </strong>

              <span>
                ${frame.time.toFixed(2)}초
              </span>

            </span>

            <span>
              ${frame.score}
            </span>

          </button>

        `
      )
      .join("");


  container
    .querySelectorAll(
      "[data-key-time]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            if (
              APP.video
            ) {

              APP.video.currentTime =
                Number(
                  button.dataset.keyTime
                );

              APP.video.pause();

              analyzeCurrentFrame();

            }

          }
        );

      }
    );

}


/* =========================================================
   FINAL ANALYSIS
========================================================= */

function calculateFinalAnalysis() {

  const stability =
    getMetricValue(
      "stabilityScore"
    );


  const alignment =
    getMetricValue(
      "alignmentScore"
    );


  const symmetry =
    getMetricValue(
      "symmetryScore"
    );


  const efficiency =
    getMetricValue(
      "efficiencyScore"
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


  APP.finalMetrics = {

    stability,

    alignment,

    symmetry,

    efficiency,

    total

  };

}


/* =========================================================
   FEEDBACK
========================================================= */

function renderFeedback() {

  const container =
    $("analysisFeedback");


  if (!container) {
    return;
  }


  const metrics =
    APP.finalMetrics ||
    {

      stability: 0,

      alignment: 0,

      symmetry: 0,

      efficiency: 0,

      total: 0

    };


  const feedback = [];


  if (
    metrics.alignment <
    75
  ) {

    feedback.push({

      title:
        "몸통 정렬",

      text:
        "동작 중 몸통축의 흔들림이 크게 나타났습니다. 골반과 흉곽을 안정적으로 유지하는 훈련이 필요합니다."

    });

  } else {

    feedback.push({

      title:
        "몸통 정렬 양호",

      text:
        "분석 구간에서 몸통축이 비교적 안정적으로 유지되었습니다."

    });

  }


  if (
    metrics.symmetry <
    75
  ) {

    feedback.push({

      title:
        "좌우 대칭성",

      text:
        "좌우 무릎 관절각 차이가 나타났습니다. 한쪽에 체중이 몰리지 않는지 확인하세요."

    });

  } else {

    feedback.push({

      title:
        "좌우 대칭성 양호",

      text:
        "좌우 관절 움직임의 차이가 비교적 작게 나타났습니다."

    });

  }


  if (
    metrics.stability <
    75
  ) {

    feedback.push({

      title:
        "중심 안정성",

      text:
        "신체 중심의 이동 폭이 크게 나타났습니다. 코어 안정성과 착지 제어를 함께 훈련하세요."

    });

  } else {

    feedback.push({

      title:
        "중심 안정성 양호",

      text:
        "신체 중심의 움직임이 비교적 안정적으로 유지되었습니다."

    });

  }


  container.innerHTML =
    feedback
      .map(
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
      )
      .join("");


  const report =
    $("feedbackList");


  if (report) {

    report.innerHTML =
      container.innerHTML;

  }

}


/* =========================================================
   TRAINING
========================================================= */

function renderTraining() {

  const container =
    $("trainingRecommendations");


  if (!container) {
    return;
  }


  const metrics =
    APP.finalMetrics ||
    {};


  const recommendations = [];


  if (
    Number(
      metrics.stability
    ) < 80
  ) {

    recommendations.push({

      tag: "STABILITY",

      title:
        "코어 안정성",

      description:
        "플랭크와 데드버그를 이용해 몸통 흔들림을 줄이는 훈련",

      meta:
        "30~45초 × 4세트"

    });

  }


  if (
    Number(
      metrics.alignment
    ) < 80
  ) {

    recommendations.push({

      tag: "ALIGNMENT",

      title:
        "하체 정렬",

      description:
        "스쿼트와 싱글레그 동작에서 무릎과 발끝 방향을 맞추는 훈련",

      meta:
        "8~12회 × 4세트"

    });

  }


  if (
    Number(
      metrics.symmetry
    ) < 80
  ) {

    recommendations.push({

      tag: "SYMMETRY",

      title:
        "좌우 밸런스",

      description:
        "싱글레그 스쿼트와 런지를 활용한 좌우 균형 훈련",

      meta:
        "좌우 8~10회 × 3세트"

    });

  }


  recommendations.push({

    tag: "POWER",

    title:
      "폭발력",

    description:
      "동작의 추진력을 높이기 위한 점프 및 빠른 지면반력 훈련",

    meta:
      "5회 × 4세트"

  });


  container.innerHTML =
    recommendations
      .slice(
        0,
        4
      )
      .map(
        item => `

          <div class="training-card">

            <span class="training-tag">
              ${item.tag}
            </span>

            <strong>
              ${item.title}
            </strong>

            <small>
              ${item.description}
            </small>

            <div class="training-meta">
              <span>
                RECOMMENDED
              </span>

              <span>
                ${item.meta}
              </span>
            </div>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   CHARTS
========================================================= */

function destroyChart(
  name
) {

  if (
    APP.charts[name]
  ) {

    APP.charts[name].destroy();

    APP.charts[name] =
      null;

  }

}


/* =========================================================
   PERFORMANCE CHART
========================================================= */

function updateDashboardCharts() {

  if (
    typeof Chart ===
    "undefined"
  ) {

    return;

  }


  const canvas =
    $("performanceChart");


  if (!canvas) {
    return;
  }


  const records =
    window.SeolcheonEvents
      ?.getRecords?.() ||
    [];


  const recent =
    records
      .slice()
      .reverse()
      .slice(
        -10
      );


  destroyChart(
    "performance"
  );


  APP.charts.performance =
    new Chart(
      canvas,
      {

        type:
          "line",

        data: {

          labels:
            recent.map(
              (_, index) =>
                `${index + 1}`
            ),

          datasets: [

            {

              label:
                "실기 점수",

              data:
                recent.map(
                  record =>
                    record.score
                ),

              tension:
                .35,

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

          plugins: {

            legend: {
              display:
                false
            }

          },

          scales: {

            y: {

              min:
                0,

              max:
                100,

              grid: {

                color:
                  "rgba(255,255,255,.05)"

              },

              ticks: {

                color:
                  "#71859a"

              }

            },

            x: {

              grid: {

                display:
                  false

              },

              ticks: {

                color:
                  "#71859a"

              }

            }

          }

        }

      }
    );


  renderDashboardRadar();

}


/* =========================================================
   RADAR
========================================================= */

function renderDashboardRadar() {

  const canvas =
    $("dashboardRadar");


  if (
    !canvas ||
    typeof Chart ===
    "undefined"
  ) {

    return;

  }


  destroyChart(
    "dashboardRadar"
  );


  APP.charts.dashboardRadar =
    new Chart(
      canvas,
      {

        type:
          "radar",

        data: {

          labels: [

            "스피드",

            "순발력",

            "근력",

            "근지구력",

            "유연성",

            "지구력"

          ],

          datasets: [

            {

              label:
                "현재 프로파일",

              data: [

                78,
                84,
                72,
                80,
                68,
                76

              ],

              borderWidth:
                2,

              backgroundColor:
                "rgba(101,231,255,.08)"

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

                display:
                  false

              },

              grid: {

                color:
                  "rgba(255,255,255,.07)"

              },

              angleLines: {

                color:
                  "rgba(255,255,255,.07)"

              },

              pointLabels: {

                color:
                  "#8da0b5",

                font: {

                  size:
                    9

                }

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
   ANGLE CHART
========================================================= */

function updateAngleChart() {

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
    "angles"
  );


  const history =
    APP.angleHistory
      .slice(
        -80
      );


  APP.charts.angles =
    new Chart(
      canvas,
      {

        type:
          "line",

        data: {

          labels:
            history.map(
              item =>
                item.time.toFixed(1)
            ),

          datasets: [

            {

              label:
                "좌측 무릎",

              data:
                history.map(
                  item =>
                    item.leftKnee
                ),

              tension:
                .25,

              borderWidth:
                2,

              pointRadius:
                0

            },

            {

              label:
                "우측 무릎",

              data:
                history.map(
                  item =>
                    item.rightKnee
                ),

              tension:
                .25,

              borderWidth:
                2,

              pointRadius:
                0

            },

            {

              label:
                "몸통 기울기",

              data:
                history.map(
                  item =>
                    item.trunk
                ),

              tension:
                .25,

              borderWidth:
                2,

              pointRadius:
                0

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

            x: {

              ticks: {

                color:
                  "#71859a",

                maxTicksLimit:
                  8

              },

              grid: {

                color:
                  "rgba(255,255,255,.04)"

              }

            },

            y: {

              min:
                0,

              max:
                190,

              ticks: {

                color:
                  "#71859a"

              },

              grid: {

                color:
                  "rgba(255,255,255,.04)"

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   TRAJECTORY CHART
========================================================= */

function updateTrajectoryChart() {

  const canvas =
    $("trajectoryCanvas");


  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  const rect =
    canvas.getBoundingClientRect();


  const ratio =
    window.devicePixelRatio ||
    1;


  canvas.width =
    rect.width *
    ratio;


  canvas.height =
    rect.height *
    ratio;


  ctx.scale(
    ratio,
    ratio
  );


  const width =
    rect.width;


  const height =
    rect.height;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  /* grid */

  ctx.strokeStyle =
    "rgba(255,255,255,.05)";

  ctx.lineWidth =
    1;


  for (
    let x = 0;
    x < width;
    x += 40
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      0
    );

    ctx.lineTo(
      x,
      height
    );

    ctx.stroke();

  }


  for (
    let y = 0;
    y < height;
    y += 40
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      width,
      y
    );

    ctx.stroke();

  }


  if (
    APP.trajectory.length <
    2
  ) {

    return;

  }


  const xs =
    APP.trajectory.map(
      p => p.x
    );


  const ys =
    APP.trajectory.map(
      p => p.y
    );


  const minX =
    Math.min(...xs);


  const maxX =
    Math.max(...xs);


  const minY =
    Math.min(...ys);


  const maxY =
    Math.max(...ys);


  const rangeX =
    Math.max(
      .001,
      maxX - minX
    );


  const rangeY =
    Math.max(
      .001,
      maxY - minY
    );


  ctx.strokeStyle =
    "#55e6a5";

  ctx.lineWidth =
    2.5;

  ctx.beginPath();


  APP.trajectory.forEach(
    (point, index) => {

      const x =
        (
          (
            point.x -
            minX
          ) /
          rangeX
        ) *
        (
          width -
          30
        ) +
        15;


      const y =
        (
          (
            point.y -
            minY
          ) /
          rangeY
        ) *
        (
          height -
          30
        ) +
        15;


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
   COMPARISON
========================================================= */

function renderComparison() {

  const records =
    window.SeolcheonEvents
      ?.getRecords?.() ||
    [];


  const before =
    records[1];


  const after =
    records[0];


  const beforeBox =
    $("comparisonBefore");


  const afterBox =
    $("comparisonAfter");


  if (
    beforeBox
  ) {

    beforeBox.innerHTML =
      comparisonHTML(
        "이전 기록",
        before
      );

  }


  if (
    afterBox
  ) {

    afterBox.innerHTML =
      comparisonHTML(
        "최근 기록",
        after
      );

  }


  const metrics =
    $("comparisonMetrics");


  if (
    !metrics ||
    !before ||
    !after
  ) {

    if (metrics) {

      metrics.innerHTML =
        "";

    }

    return;

  }


  const difference =
    Number(after.score) -
    Number(before.score);


  const cls =
    difference >= 0
      ? "change-up"
      : "change-down";


  metrics.innerHTML = `

    <div class="comparison-metric">

      <span>
        점수 변화
      </span>

      <strong class="${cls}">
        ${difference >= 0 ? "+" : ""}
        ${difference}
      </strong>

    </div>

    <div class="comparison-metric">

      <span>
        이전 기록
      </span>

      <strong>
        ${before.score}
      </strong>

    </div>

    <div class="comparison-metric">

      <span>
        최근 기록
      </span>

      <strong>
        ${after.score}
      </strong>

    </div>

  `;

}


function comparisonHTML(
  title,
  record
) {

  if (!record) {

    return `

      <div>

        <strong>
          ${title}
        </strong>

        <p>
          비교할 기록이 없습니다.
        </p>

      </div>

    `;

  }


  return `

    <div>

      <strong>
        ${title}
      </strong>

      <p>
        ${record.eventName}
      </p>

      <b>
        ${record.score}
      </b>

      <p>
        ${record.value}${record.unit}
      </p>

    </div>

  `;

}


/* =========================================================
   REPORT
========================================================= */

function updateReport() {

  const metrics =
    APP.finalMetrics ||
    {

      total: 0,

      stability: 0,

      alignment: 0,

      symmetry: 0,

      efficiency: 0

    };


  setText(
    "reportTotalScore",
    `${metrics.total}/100`
  );


  setText(
    "reportStability",
    metrics.stability
  );


  setText(
    "reportAlignment",
    metrics.alignment
  );


  setText(
    "reportSymmetry",
    metrics.symmetry
  );


  setText(
    "reportEfficiency",
    metrics.efficiency
  );


  renderReportRadar();

}


/* =========================================================
   REPORT RADAR
========================================================= */

function renderReportRadar() {

  const canvas =
    $("reportRadar");


  if (
    !canvas ||
    typeof Chart ===
    "undefined"
  ) {

    return;

  }


  destroyChart(
    "reportRadar"
  );


  const metrics =
    APP.finalMetrics ||
    {

      stability: 0,

      alignment: 0,

      symmetry: 0,

      efficiency: 0

    };


  APP.charts.reportRadar =
    new Chart(
      canvas,
      {

        type:
          "radar",

        data: {

          labels: [

            "안정성",

            "정렬",

            "대칭성",

            "효율",

            "파워",

            "제어"

          ],

          datasets: [

            {

              label:
                "분석 결과",

              data: [

                metrics.stability,

                metrics.alignment,

                metrics.symmetry,

                metrics.efficiency,

                Math.max(
                  0,
                  metrics.total - 5
                ),

                Math.min(
                  100,
                  metrics.total + 3
                )

              ],

              borderWidth:
                2,

              backgroundColor:
                "rgba(101,231,255,.08)"

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

                display:
                  false

              },

              grid: {

                color:
                  "rgba(255,255,255,.07)"

              },

              angleLines: {

                color:
                  "rgba(255,255,255,.07)"

              },

              pointLabels: {

                color:
                  "#8da0b5",

                font: {

                  size:
                    9

                }

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
   PRINT
========================================================= */

function initReportPrint() {

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

function initAnalysisToggles() {

  const toggles =
    qsa(
      ".analysis-toggles input"
    );


  toggles.forEach(
    (input, index) => {

      input.addEventListener(
        "change",
        () => {

          const keys = [

            "skeleton",

            "angles",

            "trajectory",

            "baseline",

            "center",

            "keyFrames"

          ];


          APP.options[
            keys[index]
          ] =
            input.checked;


          if (
            !input.checked &&
            keys[index] ===
              "keyFrames"
          ) {

            APP.keyFrames = [];

            renderKeyFrames();

          }


          drawVideoCanvas();

        }
      );

    }
  );

}


/* =========================================================
   SET TEXT
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


/* =========================================================
   GET METRIC
========================================================= */

function getMetricValue(
  id
) {

  const element =
    $(id);


  if (!element) {
    return 0;
  }


  return Number(
    element.textContent
  ) || 0;

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    setupPoseCanvas();

    drawVideoCanvas();

  }
);


/* =========================================================
   GLOBAL EVENTS
========================================================= */

document.addEventListener(
  "eventAnalysisComplete",
  event => {

    updateDashboardCharts();

    renderComparison();

  }
);


/* =========================================================
   INIT
========================================================= */

function initApp() {

  updateClock();

  initNavigation();

  initVideo();

  initReportPrint();

  setupPoseCanvas();


  /*
     MediaPipe CDN이 defer로 로드되기 때문에
     바로 없을 경우 조금 기다렸다가 초기화
  */

  let attempts = 0;


  const poseTimer =
    setInterval(
      () => {

        attempts++;


        if (
          typeof Pose !==
          "undefined"
        ) {

          clearInterval(
            poseTimer
          );

          initPose();

        }


        if (
          attempts >= 30
        ) {

          clearInterval(
            poseTimer
          );

        }

      },
      300
    );


  updateDashboardCharts();

  renderComparison();

  updateReport();


  console.log(
    "================================"
  );

  console.log(
    "SEOLCHEON SPORTS SCIENCE PRO"
  );

  console.log(
    "SYSTEM READY"
  );

  console.log(
    "================================"
  );

}


/* =========================================================
   START
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