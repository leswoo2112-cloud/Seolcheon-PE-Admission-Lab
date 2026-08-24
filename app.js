"use strict";

/* =========================================================
   설천고 스포츠과학 분석센터 PRO
   app.js FINAL

   핵심 기능
   - 페이지 전환
   - 선수 등록/검색/삭제
   - 영상 업로드
   - MediaPipe 33관절 분석
   - 측면/정면/후면 분석
   - 관절각 계산
   - 기준선 분석
   - 신체 중심
   - 좌우 대칭
   - 움직임 궤적
   - 자동 핵심 프레임
   - 슬로모션
   - 프레임 이동
   - 종목별 피드백
   - 종목별 추천훈련
   - 분석 기록 저장
   - 영상 비교
   - 리포트
   - 성장 그래프
   - 체대입시 관리
========================================================= */


/* =========================================================
   전역
========================================================= */

window.SC = window.SC || {};

const S = SC.state;
const U = SC.utils;


/* =========================================================
   DOM
========================================================= */

const $ = id => document.getElementById(id);

const qs = selector =>
  document.querySelector(selector);

const qsa = selector =>
  document.querySelectorAll(selector);


/* =========================================================
   LocalStorage
========================================================= */

const STORAGE = {
  athletes: "seolcheon_athletes_v4",
  analyses: "seolcheon_analyses_v4",
  college: "seolcheon_college_v4",
  settings: "seolcheon_settings_v4"
};


function loadJSON(key, fallback) {

  try {

    const value = localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : fallback;

  } catch {

    return fallback;

  }

}


function saveJSON(key, value) {

  localStorage.setItem(
    key,
    JSON.stringify(value)
  );

}


/* =========================================================
   초기 데이터
========================================================= */

function loadData() {

  S.athletes =
    loadJSON(STORAGE.athletes, []);

  S.analyses =
    loadJSON(STORAGE.analyses, []);

  S.settings =
    {
      ...S.settings,
      ...loadJSON(STORAGE.settings, {})
    };

}


function saveData() {

  saveJSON(
    STORAGE.athletes,
    S.athletes
  );

  saveJSON(
    STORAGE.analyses,
    S.analyses
  );

  saveJSON(
    STORAGE.settings,
    S.settings
  );

}


/* =========================================================
   페이지
========================================================= */

const pageNames = {

  dashboard: "대시보드",
  athletes: "선수 관리",
  college: "체대입시",
  analysis: "영상 자세분석",
  compare: "영상 비교",
  records: "분석 기록",
  growth: "성장 분석",
  report: "리포트",
  settings: "설정"

};


function showPage(page) {

  if(!pageNames[page])
    return;

  S.currentPage = page;

  qsa(".page").forEach(el => {

    el.classList.toggle(
      "active",
      el.id === `page-${page}`
    );

  });


  qsa(".nav-btn").forEach(btn => {

    btn.classList.toggle(
      "active",
      btn.dataset.page === page
    );

  });


  if($("pageTitle"))
    $("pageTitle").textContent =
      pageNames[page];


  if(page === "dashboard")
    updateDashboard();

  if(page === "athletes")
    renderAthletes();

  if(page === "analysis")
    refreshAthleteSelectors();

  if(page === "records")
    renderRecords();

  if(page === "growth")
    renderGrowth();

  if(page === "report")
    refreshReportSelectors();

  if(page === "compare")
    refreshCompareSelectors();

}


/* =========================================================
   페이지 이벤트
========================================================= */

qsa(".nav-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    showPage(
      btn.dataset.page
    );

  });

});


qsa("[data-page-link]").forEach(btn => {

  btn.addEventListener("click", () => {

    showPage(
      btn.dataset.pageLink
    );

  });

});


/* =========================================================
   시계
========================================================= */

function updateClock() {

  if(!$("systemTime"))
    return;

  const now = new Date();

  $("systemTime").textContent =
    now.toLocaleTimeString(
      "ko-KR",
      {
        hour12:false
      }
    );

}

setInterval(
  updateClock,
  1000
);

updateClock();


/* =========================================================
   선수 등록
========================================================= */

function openAthleteModal() {

  $("athleteModal")?.classList.add(
    "open"
  );

  $("athleteModal")?.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeAthleteModal() {

  $("athleteModal")?.classList.remove(
    "open"
  );

  $("athleteModal")?.setAttribute(
    "aria-hidden",
    "true"
  );

}


$("addAthleteBtn")?.addEventListener(
  "click",
  openAthleteModal
);

$("closeAthleteModal")?.addEventListener(
  "click",
  closeAthleteModal
);

$("cancelAthleteBtn")?.addEventListener(
  "click",
  closeAthleteModal
);


$("saveAthleteBtn")?.addEventListener(
  "click",
  () => {

    const name =
      $("athleteName").value.trim();

    const grade =
      $("athleteGrade").value;

    const sport =
      $("athleteSport").value.trim();

    const event =
      $("athleteEvent").value.trim();


    if(!name){

      alert("선수 이름을 입력하세요.");

      return;

    }


    const athlete = {

      id: U.uid("athlete"),

      name,

      grade,

      sport: sport || "미지정",

      event: event || "",

      createdAt: Date.now()

    };


    S.athletes.push(
      athlete
    );

    saveData();

    $("athleteName").value = "";
    $("athleteSport").value = "";
    $("athleteEvent").value = "";

    closeAthleteModal();

    renderAthletes();

    refreshAthleteSelectors();

    updateDashboard();

  }

);


/* =========================================================
   선수 렌더
========================================================= */

function renderAthletes() {

  const container =
    $("athleteList");

  if(!container)
    return;


  const keyword =
    ($("athleteSearch")?.value || "")
      .trim()
      .toLowerCase();


  const list =
    S.athletes.filter(a =>
      !keyword ||
      a.name.toLowerCase()
        .includes(keyword)
    );


  if(!list.length){

    container.innerHTML = `
      <div class="empty-state">
        등록된 선수가 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    list.map(athlete => {

      const count =
        S.analyses.filter(
          x => x.athleteId === athlete.id
        ).length;


      const avg =
        S.analyses
          .filter(
            x => x.athleteId === athlete.id
          )
          .map(
            x => Number(x.score?.total || 0)
          );


      const average =
        avg.length
          ? Math.round(
              avg.reduce(
                (a,b)=>a+b,
                0
              ) / avg.length
            )
          : 0;


      return `

        <div class="athlete-card">

          <div class="athlete-card-header">

            <div>

              <h4>
                ${escapeHTML(athlete.name)}
              </h4>

              <p>
                ${escapeHTML(athlete.grade)}
                ·
                ${escapeHTML(athlete.sport)}
              </p>

            </div>

            <button
              class="ghost-btn"
              data-delete-athlete="${athlete.id}"
            >
              삭제
            </button>

          </div>


          <div class="athlete-meta">

            <div class="meta-box">
              <span>분석 횟수</span>
              <strong>${count}</strong>
            </div>

            <div class="meta-box">
              <span>평균 점수</span>
              <strong>${average}</strong>
            </div>

            <div class="meta-box">
              <span>세부종목</span>
              <strong>
                ${escapeHTML(
                  athlete.event || "-"
                )}
              </strong>
            </div>

            <div class="meta-box">
              <span>등록일</span>
              <strong>
                ${U.formatDate(
                  athlete.createdAt
                )}
              </strong>
            </div>

          </div>

        </div>
      `;

    }).join("");


  qsa(
    "[data-delete-athlete]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        const id =
          btn.dataset.deleteAthlete;

        if(
          !confirm(
            "선수와 관련된 분석 기록을 삭제할까요?"
          )
        )
          return;


        S.athletes =
          S.athletes.filter(
            a => a.id !== id
          );

        S.analyses =
          S.analyses.filter(
            a => a.athleteId !== id
          );

        saveData();

        renderAthletes();

        refreshAthleteSelectors();

        updateDashboard();

      }
    );

  });

}


/* =========================================================
   선수 검색
========================================================= */

$("athleteSearch")?.addEventListener(
  "input",
  renderAthletes
);


/* =========================================================
   선수 선택 SELECT
========================================================= */

function fillSelect(
  select,
  items,
  placeholder,
  getValue,
  getLabel
) {

  if(!select)
    return;

  const old =
    select.value;

  select.innerHTML =
    `<option value="">${placeholder}</option>`;


  items.forEach(item => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      getValue(item);

    option.textContent =
      getLabel(item);

    select.appendChild(
      option
    );

  });


  if(
    [...select.options]
      .some(o => o.value === old)
  ){

    select.value = old;

  }

}


function refreshAthleteSelectors() {

  const selects = [

    $("analysisAthlete"),
    $("compareAthlete"),
    $("reportAthlete"),
    $("recordAthleteFilter")

  ];


  selects.forEach(select => {

    fillSelect(
      select,
      S.athletes,
      select.id === "recordAthleteFilter"
        ? "전체 선수"
        : "선수 선택",

      a => a.id,

      a =>
        `${a.name} · ${a.grade} · ${a.sport}`

    );

  });

}


$("analysisAthlete")?.addEventListener(
  "change",
  e => {

    S.selectedAthlete =
      S.athletes.find(
        a => a.id === e.target.value
      ) || null;

  }
);


/* =========================================================
   비디오
========================================================= */

const video =
  $("analysisVideo");

const poseCanvas =
  $("poseCanvas");

const poseCtx =
  poseCanvas?.getContext("2d");


$("uploadVideoBtn")?.addEventListener(
  "click",
  () => {

    $("videoInput")?.click();

  }
);


$("videoInput")?.addEventListener(
  "change",
  handleVideoUpload
);


function handleVideoUpload(event) {

  const file =
    event.target.files?.[0];

  if(!file)
    return;


  if(
    !file.type.startsWith("video/")
  ){

    alert(
      "영상 파일만 선택할 수 있습니다."
    );

    return;

  }


  if(S.state?.currentVideoURL)
    URL.revokeObjectURL(
      S.state.currentVideoURL
    );


  S.currentVideoURL =
    URL.createObjectURL(file);


  video.src =
    S.currentVideoURL;

  video.load();


  $("videoPlaceholder")?.style.setProperty(
    "display",
    "none"
  );


  $("analysisState").textContent =
    "VIDEO READY";


  video.onloadedmetadata =
    () => {

      S.fps = 30;

      S.totalFrames =
        Math.round(
          video.duration * S.fps
        );

      resizePoseCanvas();

      drawCurrentFrame();

    };

}


/* =========================================================
   영상 재생
========================================================= */

$("playPauseBtn")?.addEventListener(
  "click",
  () => {

    if(!video?.src)
      return;


    if(video.paused){

      video.play();

      $("playPauseBtn").textContent =
        "Ⅱ 일시정지";

    }else{

      video.pause();

      $("playPauseBtn").textContent =
        "▶ 재생";

    }

  }
);


video?.addEventListener(
  "pause",
  () => {

    if($("playPauseBtn"))
      $("playPauseBtn").textContent =
        "▶ 재생";

  }
);


/* =========================================================
   슬로모션
========================================================= */

$("slowMotionBtn")?.addEventListener(
  "click",
  () => {

    if(!video)
      return;


    const rates =
      [1, .75, .5, .25];

    const current =
      rates.indexOf(
        video.playbackRate
      );

    const next =
      rates[
        (current+1) % rates.length
      ];


    video.playbackRate =
      next;


    $("slowMotionBtn").textContent =
      `${next}×`;

  }
);


/* =========================================================
   프레임 이동
========================================================= */

function stepFrame(direction) {

  if(!video?.src)
    return;


  video.pause();


  const fps =
    S.fps || 30;


  video.currentTime =
    Math.max(
      0,
      Math.min(
        video.duration,
        video.currentTime +
        direction / fps
      )
    );


  S.frameNumber =
    Math.round(
      video.currentTime * fps
    );


  drawCurrentFrame();

}


$("prevFrameBtn")?.addEventListener(
  "click",
  () => stepFrame(-1)
);


$("nextFrameBtn")?.addEventListener(
  "click",
  () => stepFrame(1)
);


video?.addEventListener(
  "timeupdate",
  () => {

    S.frameNumber =
      Math.round(
        video.currentTime *
        (S.fps || 30)
      );

    if($("angleFrame"))
      $("angleFrame").textContent =
        `FRAME ${S.frameNumber}`;

  }
);


/* =========================================================
   Canvas 크기
========================================================= */

function resizePoseCanvas() {

  if(!video || !poseCanvas)
    return;


  const rect =
    video.getBoundingClientRect();


  poseCanvas.width =
    video.videoWidth ||
    rect.width;

  poseCanvas.height =
    video.videoHeight ||
    rect.height;

}


/* =========================================================
   MediaPipe Pose
========================================================= */

let pose = null;


function setupPose() {

  if(
    typeof Pose === "undefined"
  ){

    console.warn(
      "MediaPipe Pose가 로드되지 않았습니다."
    );

    return;

  }


  pose = new Pose({

    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`

  });


  pose.setOptions({

    modelComplexity: 2,

    smoothLandmarks: true,

    enableSegmentation: false,

    smoothSegmentation: false,

    minDetectionConfidence: .55,

    minTrackingConfidence: .55

  });


  pose.onResults(
    handlePoseResults
  );

}


setupPose();


/* =========================================================
   영상 현재 프레임
========================================================= */

async function analyzeCurrentFrame() {

  if(
    !pose ||
    !video ||
    video.readyState < 2
  )
    return;


  try {

    await pose.send({
      image: video
    });

  } catch(error) {

    console.warn(
      "Pose 분석 오류",
      error
    );

  }

}


function drawCurrentFrame() {

  if(
    S.analysisRunning &&
    pose
  ){

    analyzeCurrentFrame();

  }

}


/* =========================================================
   Pose 결과
========================================================= */

function handlePoseResults(results) {

  if(!results?.poseLandmarks)
    return;


  const landmarks =
    results.poseLandmarks;


  if(poseCanvas){

    poseCanvas.width =
      video.videoWidth;

    poseCanvas.height =
      video.videoHeight;

  }


  drawPose(
    landmarks
  );


  const measurements =
    calculateMeasurements(
      landmarks
    );


  updateAngleUI(
    measurements
  );


  if(S.analysisRunning){

    S.lastPose =
      measurements;

    addHistory(
      measurements
    );

    updateTrajectory(
      measurements
    );

    calculateLiveScore();

  }

}


/* =========================================================
   Pose Draw
========================================================= */

function drawPose(landmarks) {

  if(!poseCtx)
    return;


  poseCtx.clearRect(
    0,
    0,
    poseCanvas.width,
    poseCanvas.height
  );


  if(
    !$("optSkeleton")?.checked &&
    !S.settings.skeleton
  )
    return;


  const connections =
    typeof POSE_CONNECTIONS !==
      "undefined"
      ? POSE_CONNECTIONS
      : [];


  poseCtx.lineWidth = 3;

  poseCtx.strokeStyle =
    "#20a7ff";


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


      if(
        !a ||
        !b ||
        a.visibility < .45 ||
        b.visibility < .45
      )
        return;


      poseCtx.beginPath();

      poseCtx.moveTo(
        a.x * poseCanvas.width,
        a.y * poseCanvas.height
      );

      poseCtx.lineTo(
        b.x * poseCanvas.width,
        b.y * poseCanvas.height
      );

      poseCtx.stroke();

    }
  );


  poseCtx.fillStyle =
    "#48d8ff";


  landmarks.forEach(
    point => {

      if(
        point.visibility < .45
      )
        return;


      poseCtx.beginPath();

      poseCtx.arc(
        point.x * poseCanvas.width,
        point.y * poseCanvas.height,
        4,
        0,
        Math.PI*2
      );

      poseCtx.fill();

    }
  );


  drawBaseline(
    landmarks
  );

}


/* =========================================================
   관절 인덱스
========================================================= */

const LM = {

  NOSE:0,

  LEFT_SHOULDER:11,
  RIGHT_SHOULDER:12,

  LEFT_ELBOW:13,
  RIGHT_ELBOW:14,

  LEFT_WRIST:15,
  RIGHT_WRIST:16,

  LEFT_HIP:23,
  RIGHT_HIP:24,

  LEFT_KNEE:25,
  RIGHT_KNEE:26,

  LEFT_ANKLE:27,
  RIGHT_ANKLE:28,

  LEFT_HEEL:29,
  RIGHT_HEEL:30,

  LEFT_FOOT:31,
  RIGHT_FOOT:32

};


/* =========================================================
   측정
========================================================= */

function getPoint(
  landmarks,
  index
) {

  const p =
    landmarks[index];

  if(
    !p ||
    p.visibility < .35
  )
    return null;

  return p;

}


function calculateMeasurements(
  landmarks
) {

  const L={
    shoulder:getPoint(
      landmarks,
      LM.LEFT_SHOULDER
    ),

    elbow:getPoint(
      landmarks,
      LM.LEFT_ELBOW
    ),

    wrist:getPoint(
      landmarks,
      LM.LEFT_WRIST
    ),

    hip:getPoint(
      landmarks,
      LM.LEFT_HIP
    ),

    knee:getPoint(
      landmarks,
      LM.LEFT_KNEE
    ),

    ankle:getPoint(
      landmarks,
      LM.LEFT_ANKLE
    )

  };


  const R={

    shoulder:getPoint(
      landmarks,
      LM.RIGHT_SHOULDER
    ),

    elbow:getPoint(
      landmarks,
      LM.RIGHT_ELBOW
    ),

    wrist:getPoint(
      landmarks,
      LM.RIGHT_WRIST
    ),

    hip:getPoint(
      landmarks,
      LM.RIGHT_HIP
    ),

    knee:getPoint(
      landmarks,
      LM.RIGHT_KNEE
    ),

    ankle:getPoint(
      landmarks,
      LM.RIGHT_ANKLE
    )

  };


  const nose =
    getPoint(
      landmarks,
      LM.NOSE
    );


  const shoulderCenter =
    L.shoulder &&
    R.shoulder
      ? U.midpoint(
          L.shoulder,
          R.shoulder
        )
      : null;


  const hipCenter =
    L.hip &&
    R.hip
      ? U.midpoint(
          L.hip,
          R.hip
        )
      : null;


  const kneeCenter =
    L.knee &&
    R.knee
      ? U.midpoint(
          L.knee,
          R.knee
        )
      : null;


  const ankleCenter =
    L.ankle &&
    R.ankle
      ? U.midpoint(
          L.ankle,
          R.ankle
        )
      : null;


  const measurements={

    leftKnee:
      U.angle(
        L.hip,
        L.knee,
        L.ankle
      ),

    rightKnee:
      U.angle(
        R.hip,
        R.knee,
        R.ankle
      ),

    leftHip:
      U.angle(
        L.shoulder,
        L.hip,
        L.knee
      ),

    rightHip:
      U.angle(
        R.shoulder,
        R.hip,
        R.knee
      ),

    leftElbow:
      U.angle(
        L.shoulder,
        L.elbow,
        L.wrist
      ),

    rightElbow:
      U.angle(
        R.shoulder,
        R.elbow,
        R.wrist
      ),

    shoulderAngle:
      shoulderCenter &&
      hipCenter
        ? U.lineAngle(
            shoulderCenter,
            hipCenter
          )
        : null,

    trunkAngle:
      shoulderCenter &&
      hipCenter
        ? Math.abs(
            90 -
            Math.abs(
              U.lineAngle(
                shoulderCenter,
                hipCenter
              )
            )
          )
        : null,

    headPelvis:
      nose &&
      hipCenter
        ? Math.abs(
            nose.x -
            hipCenter.x
          )
        : null,

    hipKnee:
      hipCenter &&
      kneeCenter
        ? Math.abs(
            hipCenter.x -
            kneeCenter.x
          )
        : null,

    kneeAnkle:
      kneeCenter &&
      ankleCenter
        ? Math.abs(
            kneeCenter.x -
            ankleCenter.x
          )
        : null,

    center:
      hipCenter,

    shoulderCenter,
    hipCenter,
    kneeCenter,
    ankleCenter,

    leftHipPoint:L.hip,
    rightHipPoint:R.hip,

    leftKneePoint:L.knee,
    rightKneePoint:R.knee,

    leftAnklePoint:L.ankle,
    rightAnklePoint:R.ankle

  };


  measurements.symmetry =
    calculateSymmetry(
      measurements
    );


  measurements.alignment =
    calculateAlignment(
      measurements
    );


  measurements.stability =
    calculateStability(
      measurements
    );


  measurements.efficiency =
    calculateEfficiency(
      measurements
    );


  return measurements;

}


/* =========================================================
   좌우 대칭
========================================================= */

function calculateSymmetry(m) {

  const pairs=[
    [m.leftKnee,m.rightKnee],
    [m.leftHip,m.rightHip],
    [m.leftElbow,m.rightElbow]
  ];


  const values=[];


  pairs.forEach(
    ([a,b]) => {

      if(
        Number.isFinite(a) &&
        Number.isFinite(b)
      ){

        const max =
          Math.max(a,b,1);

        const difference =
          Math.abs(a-b)/max;

        values.push(
          100 -
          difference*100
        );

      }

    }
  );


  if(!values.length)
    return 75;


  return U.clamp(
    values.reduce(
      (a,b)=>a+b,
      0
    ) / values.length,
    0,
    100
  );

}


/* =========================================================
   기준선
========================================================= */

function calculateAlignment(m) {

  const values=[];


  [
    m.headPelvis,
    m.hipKnee,
    m.kneeAnkle
  ].forEach(v => {

    if(
      Number.isFinite(v)
    ){

      values.push(
        Math.max(
          0,
          100-v*300
        )
      );

    }

  });


  return values.length
    ? U.clamp(
        values.reduce(
          (a,b)=>a+b,
          0
        ) / values.length,
        0,
        100
      )
    : 75;

}


/* =========================================================
   안정성
========================================================= */

function calculateStability(m) {

  if(
    !S.angleHistory.length
  )
    return 75;


  const recent =
    S.angleHistory.slice(-15);


  const values =
    recent.map(
      x => Number(x.trunkAngle)
    ).filter(
      Number.isFinite
    );


  if(!values.length)
    return 75;


  const avg =
    values.reduce(
      (a,b)=>a+b,
      0
    ) / values.length;


  const variance =
    values.reduce(
      (sum,v) =>
        sum +
        Math.pow(v-avg,2),
      0
    ) / values.length;


  const sd =
    Math.sqrt(variance);


  return U.clamp(
    100-sd*4,
    0,
    100
  );

}


/* =========================================================
   효율
========================================================= */

function calculateEfficiency(m) {

  const angles=[
    m.leftKnee,
    m.rightKnee,
    m.leftHip,
    m.rightHip
  ].filter(
    Number.isFinite
  );


  if(!angles.length)
    return 75;


  const usable =
    angles.filter(
      angle =>
        angle >= 50 &&
        angle <= 175
    );


  return U.clamp(
    usable.length /
    angles.length *
    100,
    0,
    100
  );

}


/* =========================================================
   기준선 그리기
========================================================= */

function drawBaseline(
  landmarks
) {

  if(
    !$("optBaseline")?.checked
  )
    return;


  const shoulderL =
    getPoint(
      landmarks,
      LM.LEFT_SHOULDER
    );

  const shoulderR =
    getPoint(
      landmarks,
      LM.RIGHT_SHOULDER
    );

  const hipL =
    getPoint(
      landmarks,
      LM.LEFT_HIP
    );

  const hipR =
    getPoint(
      landmarks,
      LM.RIGHT_HIP
    );


  if(
    !shoulderL ||
    !shoulderR ||
    !hipL ||
    !hipR
  )
    return;


  const shoulder =
    U.midpoint(
      shoulderL,
      shoulderR
    );

  const hip =
    U.midpoint(
      hipL,
      hipR
    );


  const x1 =
    shoulder.x*
    poseCanvas.width;

  const y1 =
    shoulder.y*
    poseCanvas.height;

  const x2 =
    hip.x*
    poseCanvas.width;

  const y2 =
    hip.y*
    poseCanvas.height;


  poseCtx.save();

  poseCtx.lineWidth=2;

  poseCtx.setLineDash(
    [8,6]
  );

  poseCtx.strokeStyle =
    "#ffd43b";


  poseCtx.beginPath();

  poseCtx.moveTo(
    x1,
    y1
  );

  poseCtx.lineTo(
    x2,
    y2
  );

  poseCtx.stroke();


  /* 수직 기준선 */

  poseCtx.strokeStyle =
    "#ffae42";


  poseCtx.beginPath();

  poseCtx.moveTo(
    x2,
    0
  );

  poseCtx.lineTo(
    x2,
    poseCanvas.height
  );

  poseCtx.stroke();


  poseCtx.restore();

}


/* =========================================================
   관절각 UI
========================================================= */

function angleText(value) {

  return Number.isFinite(value)
    ? `${Math.round(value)}°`
    : "--°";

}


function updateAngleUI(m) {

  const map={

    angleLknee:m.leftKnee,
    angleRknee:m.rightKnee,

    angleLhip:m.leftHip,
    angleRhip:m.rightHip,

    angleLelbow:m.leftElbow,
    angleRelbow:m.rightElbow,

    trunkAngle:m.trunkAngle,

    symmetryValue:m.symmetry

  };


  Object.entries(map)
    .forEach(
      ([id,value]) => {

        const el=$(id);

        if(!el)
          return;


        el.textContent =
          id === "symmetryValue"
            ? `${Math.round(value || 0)}%`
            : angleText(value);

      }
    );


  setText(
    "baselineHeadPelvis",
    baselineStatus(
      m.headPelvis
    )
  );

  setText(
    "baselineHipKnee",
    baselineStatus(
      m.hipKnee
    )
  );

  setText(
    "baselineKneeAnkle",
    baselineStatus(
      m.kneeAnkle
    )
  );

  setText(
    "baselineCenter",
    Number.isFinite(m.center?.x)
      ? `${Math.round(m.center.x*100)}%`
      : "--"
  );

}


function baselineStatus(value) {

  if(!Number.isFinite(value))
    return "--";

  if(value < .025)
    return "정상";

  if(value < .06)
    return "주의";

  return "교정 필요";

}


/* =========================================================
   분석 히스토리
========================================================= */

function addHistory(m) {

  const time =
    video.currentTime;


  const previous =
    S.angleHistory[
      S.angleHistory.length-1
    ];


  const frame={

    time,

    frame:S.frameNumber,

    ...m

  };


  if(previous){

    frame.angleChange =
      Number.isFinite(m.leftKnee) &&
      Number.isFinite(previous.leftKnee)
        ? m.leftKnee -
          previous.leftKnee
        : 0;


    frame.balanceChange =
      Math.abs(
        (m.symmetry||0) -
        (previous.symmetry||0)
      )/100;

  }


  S.angleHistory.push(
    frame
  );


  if(
    m.center
  ){

    S.trajectory.push({

      x:m.center.x,

      y:m.center.y,

      time

    });

  }


  if(
    $("optKeyframes")?.checked
  ){

    SC.addKeyFrame(
      frame
    );

  }


  if(
    S.angleHistory.length >
    500
  ){

    S.angleHistory.shift();

  }

}


/* =========================================================
   궤적
========================================================= */

function updateTrajectory() {

  const canvas =
    $("trajectoryCanvas");

  if(!canvas)
    return;


  const ctx =
    canvas.getContext("2d");


  const rect =
    canvas.getBoundingClientRect();


  const width =
    canvas.width =
      Math.max(
        300,
        rect.width
      );


  const height =
    canvas.height =
      Math.max(
        200,
        rect.height
      );


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  drawTrajectoryGrid(
    ctx,
    width,
    height
  );


  if(
    S.trajectory.length<2
  )
    return;


  ctx.beginPath();

  ctx.lineWidth=3;

  ctx.strokeStyle =
    "#20a7ff";


  S.trajectory.forEach(
    (p,index) => {

      const x =
        p.x*width;

      const y =
        p.y*height;


      if(index===0)
        ctx.moveTo(x,y);
      else
        ctx.lineTo(x,y);

    }
  );


  ctx.stroke();


  const last =
    S.trajectory[
      S.trajectory.length-1
    ];


  ctx.fillStyle =
    "#48d8ff";


  ctx.beginPath();

  ctx.arc(
    last.x*width,
    last.y*height,
    6,
    0,
    Math.PI*2
  );

  ctx.fill();

}


function drawTrajectoryGrid(
  ctx,
  width,
  height
) {

  ctx.strokeStyle =
    "rgba(255,255,255,.05)";

  ctx.lineWidth=1;


  for(
    let x=0;
    x<=width;
    x+=width/10
  ){

    ctx.beginPath();

    ctx.moveTo(x,0);

    ctx.lineTo(x,height);

    ctx.stroke();

  }


  for(
    let y=0;
    y<=height;
    y+=height/10
  ){

    ctx.beginPath();

    ctx.moveTo(0,y);

    ctx.lineTo(width,y);

    ctx.stroke();

  }

}


/* =========================================================
   분석 시작
========================================================= */

$("startAnalysisBtn")?.addEventListener(
  "click",
  startAnalysis
);


async function startAnalysis() {

  if(!video?.src){

    alert(
      "먼저 분석할 영상을 업로드하세요."
    );

    return;

  }


  if(
    !$("analysisAthlete")?.value
  ){

    alert(
      "분석할 선수를 선택하세요."
    );

    return;

  }


  SC.resetAnalysisState();

  S.analysisRunning=true;


  $("analysisState").textContent =
    "ANALYZING";


  $("systemStatus").textContent =
    "ANALYSIS RUNNING";


  video.play();


  await analyzeCurrentFrame();

}


/* =========================================================
   분석 종료
========================================================= */

$("stopAnalysisBtn")?.addEventListener(
  "click",
  stopAnalysis
);


function stopAnalysis() {

  S.analysisRunning=false;

  video?.pause();


  $("analysisState").textContent =
    "ANALYSIS COMPLETE";


  $("systemStatus").textContent =
    "SYSTEM READY";


  finishAnalysis();

}


/* =========================================================
   영상 프레임 분석
========================================================= */

video?.addEventListener(
  "timeupdate",
  () => {

    if(
      S.analysisRunning
    ){

      analyzeCurrentFrame();

    }

  }
);


/* =========================================================
   실시간 점수
========================================================= */

function calculateLiveScore() {

  const m =
    S.lastPose;

  if(!m)
    return;


  const score =
    SC.calculateScore({

      stability:m.stability,

      alignment:m.alignment,

      symmetry:m.symmetry,

      efficiency:m.efficiency

    });


  updateScoreUI(
    score
  );

}


/* =========================================================
   점수 UI
========================================================= */

function updateScoreUI(score) {

  setText(
    "analysisScore",
    `${score.total} / 100`
  );


  setText(
    "scoreStability",
    score.stability
  );

  setText(
    "scoreAlignment",
    score.alignment
  );

  setText(
    "scoreSymmetry",
    score.symmetry
  );

  setText(
    "scoreEfficiency",
    score.efficiency
  );


  setWidth(
    "barStability",
    score.stability
  );

  setWidth(
    "barAlignment",
    score.alignment
  );

  setWidth(
    "barSymmetry",
    score.symmetry
  );

  setWidth(
    "barEfficiency",
    score.efficiency
  );

}


/* =========================================================
   분석 종료 처리
========================================================= */

function finishAnalysis() {

  const last =
    S.lastPose;


  if(!last){

    alert(
      "인식된 자세 데이터가 없습니다."
    );

    return;

  }


  const score =
    SC.calculateScore({

      stability:last.stability,

      alignment:last.alignment,

      symmetry:last.symmetry,

      efficiency:last.efficiency

    });


  const sport =
    $("sportSelect")?.value ||
    "체대입시";


  const feedback =
    SC.generateFeedback({
      ...score
    });


  const training =
    SC.generateTraining(
      sport,
      score
    );


  const record={

    id:U.uid("analysis"),

    athleteId:
      $("analysisAthlete").value,

    athleteName:
      getAthleteName(
        $("analysisAthlete").value
      ),

    sport,

    viewAngle:
      $("viewAngle").value,

    score,

    feedback,

    training,

    keyFrames:
      [...S.keyFrames],

    angleHistory:
      [...S.angleHistory].slice(-200),

    trajectory:
      [...S.trajectory].slice(-300),

    duration:
      video.duration || 0,

    createdAt:
      Date.now(),

    fileName:
      $("videoInput")?.files?.[0]?.name ||
      "video"

  };


  S.analyses.unshift(
    record
  );


  saveData();


  renderFeedback(
    feedback
  );

  renderTraining(
    training
  );

  renderKeyFrames();

  renderAngleChart();

  updateDashboard();

  renderRecords();

  refreshCompareSelectors();

  refreshReportSelectors();

  updateScoreUI(
    score
  );

}


/* =========================================================
   핵심 프레임 버튼
========================================================= */

$("bestFrameBtn")?.addEventListener(
  "click",
  () => {

    renderKeyFrames();

    const best =
      [...S.keyFrames]
        .sort(
          (a,b) =>
            b.importance -
            a.importance
        )[0];


    if(best && video){

      video.currentTime =
        best.time;

      setText(
        "angleFrame",
        `FRAME ${best.frame}`
      );

      analyzeCurrentFrame();

    }

  }
);


/* =========================================================
   핵심 프레임 렌더
========================================================= */

function renderKeyFrames() {

  const container =
    $("keyFrameList");

  if(!container)
    return;


  if(
    !S.keyFrames.length
  ){

    container.innerHTML = `
      <div class="empty-state">
        분석 중 움직임 변화가 큰 프레임을 자동으로 찾습니다.
      </div>
    `;

    setText(
      "keyFrameCount",
      0
    );

    return;

  }


  const frames =
    [...S.keyFrames]
      .sort(
        (a,b) =>
          a.time-b.time
      );


  container.innerHTML =
    frames.map(
      (frame,index) => `

        <div class="keyframe-card">

          <div
            class="keyframe-image"
            data-keyframe="${index}"
          >
            <canvas
              width="320"
              height="180"
            ></canvas>
          </div>

          <div class="keyframe-info">

            <strong>
              핵심 프레임 ${index+1}
            </strong>

            <span>
              ${U.formatTime(frame.time)}
              · FRAME ${frame.frame}
            </span>

            <div class="keyframe-angle">
              중요도
              ${Math.round(
                frame.importance*100
              )}%
            </div>

          </div>

        </div>

      `
    ).join("");


  setText(
    "keyFrameCount",
    frames.length
  );


  frames.forEach(
    (frame,index) => {

      const canvas =
        container.querySelectorAll(
          "canvas"
        )[index];

      if(!canvas)
        return;


      createVideoThumbnail(
        frame.time,
        canvas
      );

    }
  );

}


function createVideoThumbnail(
  time,
  targetCanvas
) {

  if(!video?.src)
    return;


  const temp =
    document.createElement(
      "video"
    );


  temp.src =
    video.currentSrc ||
    video.src;

  temp.muted=true;

  temp.preload="metadata";


  temp.addEventListener(
    "loadedmetadata",
    () => {

      temp.currentTime =
        Math.min(
          time,
          temp.duration
        );

    }
  );


  temp.addEventListener(
    "seeked",
    () => {

      const ctx =
        targetCanvas.getContext("2d");


      ctx.drawImage(
        temp,
        0,
        0,
        targetCanvas.width,
        targetCanvas.height
      );

    }
  );

}


/* =========================================================
   피드백
========================================================= */

function renderFeedback(
  feedback
) {

  const container =
    $("analysisFeedback");

  if(!container)
    return;


  if(!feedback?.length){

    container.innerHTML =
      `<div class="empty-state">
        피드백이 없습니다.
      </div>`;

    return;

  }


  container.innerHTML =
    feedback.map(
      item => `

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

      `
    ).join("");

}


/* =========================================================
   추천훈련
========================================================= */

function renderTraining(
  training
) {

  const container =
    $("trainingRecommendations");

  if(!container)
    return;


  if(!training?.length){

    container.innerHTML =
      `<div class="empty-state">
        추천훈련이 없습니다.
      </div>`;

    return;

  }


  container.innerHTML =
    training.map(
      item => `

        <div class="training-card">

          <span class="tag">
            ${escapeHTML(
              item.tag
            )}
          </span>

          <strong>
            ${escapeHTML(
              item.title
            )}
          </strong>

          <p>
            ${escapeHTML(
              item.description
            )}
          </p>

        </div>

      `
    ).join("");

}


/* =========================================================
   관절각 차트
========================================================= */

function renderAngleChart() {

  if(
    typeof Chart === "undefined"
  )
    return;


  const canvas =
    $("angleChart");

  if(!canvas)
    return;


  if(
    S.charts.angle
  ){

    S.charts.angle.destroy();

  }


  const history =
    S.angleHistory;


  S.charts.angle =
    new Chart(
      canvas,
      {

        type:"line",

        data:{

          labels:
            history.map(
              x =>
                U.round(
                  x.time,
                  1
                )
            ),

          datasets:[

            {
              label:"왼쪽 무릎",
              data:
                history.map(
                  x =>
                    x.leftKnee
                ),

              borderWidth:2,

              tension:.25
            },

            {
              label:"오른쪽 무릎",
              data:
                history.map(
                  x =>
                    x.rightKnee
                ),

              borderWidth:2,

              tension:.25
            },

            {
              label:"몸통",
              data:
                history.map(
                  x =>
                    x.trunkAngle
                ),

              borderWidth:2,

              tension:.25
            }

          ]

        },

        options:{

          responsive:true,

          maintainAspectRatio:false,

          plugins:{

            legend:{
              labels:{
                color:"#9db0c2"
              }
            }

          },

          scales:{

            x:{
              ticks:{
                color:"#60758b"
              },

              grid:{
                color:
                  "rgba(255,255,255,.05)"
              }
            },

            y:{
              ticks:{
                color:"#60758b"
              },

              grid:{
                color:
                  "rgba(255,255,255,.05)"
              }
            }

          }

        }

      }
    );

}


/* =========================================================
   대시보드
========================================================= */

function updateDashboard() {

  setText(
    "dashAthletes",
    S.athletes.length
  );

  setText(
    "dashAnalyses",
    S.analyses.length
  );


  const scores =
    S.analyses.map(
      x =>
        Number(
          x.score?.total || 0
        )
    );


  const average =
    scores.length
      ? Math.round(
          scores.reduce(
            (a,b)=>a+b,
            0
          ) /
          scores.length
        )
      : 0;


  setText(
    "dashAverage",
    average
  );


  const growth =
    calculateGrowthPercent();


  setText(
    "dashGrowth",
    `${growth}%`
  );


  renderRecentAnalyses();

  renderDashboardCharts();

}


/* =========================================================
   최근 분석
========================================================= */

function renderRecentAnalyses() {

  const container =
    $("recentAnalyses");

  if(!container)
    return;


  const recent =
    S.analyses.slice(0,5);


  if(!recent.length){

    container.innerHTML =
      `<div class="empty-state">
        아직 분석 기록이 없습니다.
      </div>`;

    return;

  }


  container.innerHTML =
    recent.map(
      record => `

        <div class="record-card">

          <div>

            <strong>
              ${escapeHTML(
                record.athleteName ||
                getAthleteName(
                  record.athleteId
                )
              )}
            </strong>

            <small>
              ${escapeHTML(
                record.sport
              )}
              ·
              ${escapeHTML(
                record.viewAngle
              )}
              ·
              ${U.formatDate(
                record.createdAt
              )}
            </small>

          </div>

          <span>
            ${record.score.total}/100
          </span>

          <button
            class="ghost-btn"
            data-open-record="${record.id}"
          >
            보기
          </button>

        </div>

      `
    ).join("");


  qsa(
    "[data-open-record]"
  ).forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        openRecord(
          btn.dataset.openRecord
        );

      }
    );

  });

}


/* =========================================================
   대시보드 차트
========================================================= */

function renderDashboardCharts() {

  if(
    typeof Chart === "undefined"
  )
    return;


  const performance =
    $("performanceChart");


  if(performance){

    if(S.charts.performance)
      S.charts.performance.destroy();


    const records =
      [...S.analyses]
        .reverse()
        .slice(-12);


    S.charts.performance =
      new Chart(
        performance,
        {

          type:"line",

          data:{

            labels:
              records.map(
                x =>
                  U.formatDate(
                    x.createdAt
                  )
              ),

            datasets:[

              {
                label:"퍼포먼스",
                data:
                  records.map(
                    x =>
                      x.score?.total || 0
                  ),

                borderWidth:3,

                tension:.3,

                fill:false
              }

            ]

          },

          options:chartOptions()

        }

      );

  }


  const radar =
    $("profileRadar");


  if(radar){

    if(S.charts.radar)
      S.charts.radar.destroy();


    const latest =
      S.analyses[0]?.score || {};


    S.charts.radar =
      new Chart(
        radar,
        {

          type:"radar",

          data:{

            labels:[
              "안정성",
              "정렬",
              "대칭",
              "효율",
              "종합"
            ],

            datasets:[

              {
                label:"현재 프로파일",

                data:[
                  latest.stability || 0,
                  latest.alignment || 0,
                  latest.symmetry || 0,
                  latest.efficiency || 0,
                  latest.total || 0
                ],

                borderWidth:2,

                fill:true
              }

            ]

          },

          options:{

            responsive:true,

            maintainAspectRatio:false,

            scales:{
              r:{
                min:0,
                max:100,

                ticks:{
                  display:false
                },

                grid:{
                  color:
                    "rgba(255,255,255,.08)"
                },

                angleLines:{
                  color:
                    "rgba(255,255,255,.08)"
                },

                pointLabels:{
                  color:"#9db0c2",
                  font:{
                    size:10
                  }
                }

              }

            },

            plugins:{
              legend:{
                display:false
              }
            }

          }

        }
      );

  }

}


function chartOptions() {

  return {

    responsive:true,

    maintainAspectRatio:false,

    plugins:{
      legend:{
        labels:{
          color:"#9db0c2"
        }
      }
    },

    scales:{

      x:{
        ticks:{
          color:"#60758b"
        },

        grid:{
          color:
            "rgba(255,255,255,.05)"
        }

      },

      y:{
        min:0,
        max:100,

        ticks:{
          color:"#60758b"
        },

        grid:{
          color:
            "rgba(255,255,255,.05)"
        }

      }

    }

  };

}


/* =========================================================
   기록
========================================================= */

function renderRecords() {

  const container =
    $("recordList");

  if(!container)
    return;


  const athleteFilter =
    $("recordAthleteFilter")?.value ||
    "";


  const sportFilter =
    $("recordSportFilter")?.value ||
    "";


  const records =
    S.analyses.filter(
      record => {

        if(
          athleteFilter &&
          record.athleteId !==
          athleteFilter
        )
          return false;

        if(
          sportFilter &&
          record.sport !==
          sportFilter
        )
          return false;

        return true;

      }
    );


  if(!records.length){

    container.innerHTML =
      `<div class="empty-state">
        분석 기록이 없습니다.
      </div>`;

    return;

  }


  container.innerHTML =
    records.map(
      record => `

        <div class="record-card">

          <div>

            <strong>
              ${escapeHTML(
                record.athleteName
              )}
            </strong>

            <small>
              ${escapeHTML(
                record.sport
              )}
              ·
              ${escapeHTML(
                record.viewAngle
              )}
              ·
              ${U.formatDate(
                record.createdAt
              )}
            </small>

          </div>

          <div class="record-score">
            ${record.score?.total || 0}
          </div>

          <div>

            <button
              class="ghost-btn"
              data-open-record="${record.id}"
            >
              열기
            </button>

            <button
              class="danger-btn"
              data-delete-record="${record.id}"
            >
              삭제
            </button>

          </div>

        </div>

      `
    ).join("");


  bindRecordButtons();

}


function bindRecordButtons() {

  qsa(
    "[data-open-record]"
  ).forEach(
    btn => {

      btn.onclick=() =>
        openRecord(
          btn.dataset.openRecord
        );

    }
  );


  qsa(
    "[data-delete-record]"
  ).forEach(
    btn => {

      btn.onclick=() => {

        if(
          !confirm(
            "이 분석 기록을 삭제할까요?"
          )
        )
          return;


        S.analyses =
          S.analyses.filter(
            x =>
              x.id !==
              btn.dataset.deleteRecord
          );


        saveData();

        renderRecords();

        updateDashboard();

      };

    }
  );

}


$("recordAthleteFilter")
  ?.addEventListener(
    "change",
    renderRecords
  );


$("recordSportFilter")
  ?.addEventListener(
    "change",
    renderRecords
  );


function refreshRecordSportFilter() {

  const select =
    $("recordSportFilter");

  if(!select)
    return;


  const sports =
    [...new Set(
      S.analyses.map(
        x=>x.sport
      )
    )];


  select.innerHTML =
    `<option value="">
      전체 종목
    </option>`;


  sports.forEach(
    sport => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        sport;

      option.textContent =
        sport;

      select.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   기록 열기
========================================================= */

function openRecord(id) {

  const record =
    S.analyses.find(
      x=>x.id===id
    );


  if(!record)
    return;


  S.currentAnalysis =
    record;


  renderFeedback(
    record.feedback
  );

  renderTraining(
    record.training
  );


  S.keyFrames =
    record.keyFrames || [];

  S.angleHistory =
    record.angleHistory || [];

  S.trajectory =
    record.trajectory || [];


  renderKeyFrames();

  renderAngleChart();

  showPage("analysis");

}


/* =========================================================
   비교
========================================================= */

function refreshCompareSelectors() {

  fillSelect(
    $("compareAthlete"),
    S.athletes,
    "선수 선택",
    a=>a.id,
    a=>`${a.name} · ${a.sport}`
  );


  updateCompareRecordOptions();

}


$("compareAthlete")
  ?.addEventListener(
    "change",
    updateCompareRecordOptions
  );


function updateCompareRecordOptions() {

  const athleteId =
    $("compareAthlete")?.value ||
    "";


  const records =
    S.analyses.filter(
      r =>
        !athleteId ||
        r.athleteId===athleteId
    );


  [
    $("compareA"),
    $("compareB")
  ].forEach(
    select => {

      if(!select)
        return;


      select.innerHTML =
        `<option value="">
          분석 기록 선택
        </option>`;


      records.forEach(
        record => {

          const option =
            document.createElement(
              "option"
            );

          option.value =
            record.id;

          option.textContent =
            `${record.sport} · ${
              U.formatDate(
                record.createdAt
              )
            } · ${
              record.score?.total || 0
            }점`;

          select.appendChild(
            option
          );

        }
      );

    }
  );

}


$("compareBtn")
  ?.addEventListener(
    "click",
    compareRecords
  );


function compareRecords() {

  const a =
    S.analyses.find(
      x =>
        x.id ===
        $("compareA").value
    );


  const b =
    S.analyses.find(
      x =>
        x.id ===
        $("compareB").value
    );


  if(!a || !b){

    alert(
      "비교할 두 분석 기록을 선택하세요."
    );

    return;

  }


  renderComparison(
    a,
    b
  );

}


function renderComparison(a,b) {

  const result =
    $("compareResult");

  if(!result)
    return;


  const metrics=[

    ["종합점수","total"],
    ["姿勢 안정성","stability"],
    ["정렬","alignment"],
    ["좌우 대칭","symmetry"],
    ["움직임 효율","efficiency"]

  ];


  result.innerHTML =
    metrics.map(
      ([name,key]) => {

        const av =
          Number(
            a.score?.[key] || 0
          );

        const bv =
          Number(
            b.score?.[key] || 0
          );

        const diff =
          bv-av;


        return `

          <div>

            <span>
              ${name}
            </span>

            <strong>
              ${av}
              →
              ${bv}
            </strong>

            <small style="
              color:${diff>=0
                ? "#35e07f"
                : "#ff5d6c"};
            ">
              ${
                diff>=0
                  ? "+"
                  : ""
              }${diff}
            </small>

          </div>

        `;

      }
    ).join("");


  const ghost =
    $("ghostMode");


  if(ghost){

    ghost.innerHTML = `

      <div style="
        text-align:center;
        padding:40px;
      ">

        <strong>
          ${escapeHTML(
            a.athleteName
          )}
        </strong>

        <span style="
          margin:0 10px;
          color:#20a7ff;
        ">
          VS
        </span>

        <strong>
          ${escapeHTML(
            b.athleteName
          )}
        </strong>

        <p style="
          color:#71869b;
          margin-top:10px;
        ">
          동일 선수의 이전/현재 영상이라면
          동작 변화와 관절각 차이를 함께 비교할 수 있습니다.
        </p>

      </div>

    `;

  }

}


/* =========================================================
   리포트
========================================================= */

function refreshReportSelectors() {

  fillSelect(
    $("reportAthlete"),
    S.athletes,
    "선수 선택",
    a=>a.id,
    a=>`${a.name} · ${a.sport}`
  );


  updateReportRecordOptions();

}


$("reportAthlete")
  ?.addEventListener(
    "change",
    updateReportRecordOptions
  );


function updateReportRecordOptions() {

  const athleteId =
    $("reportAthlete")?.value ||
    "";


  const records =
    S.analyses.filter(
      r =>
        !athleteId ||
        r.athleteId===athleteId
    );


  const select =
    $("reportRecord");

  if(!select)
    return;


  select.innerHTML =
    `<option value="">
      분석 기록 선택
    </option>`;


  records.forEach(
    record => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        record.id;

      option.textContent =
        `${record.sport} · ${
          U.formatDate(
            record.createdAt
          )
        } · ${
          record.score?.total || 0
        }점`;

      select.appendChild(
        option
      );

    }
  );

}


$("generateReportBtn")
  ?.addEventListener(
    "click",
    generateReport
  );


function generateReport() {

  const record =
    S.analyses.find(
      x =>
        x.id ===
        $("reportRecord")?.value
    );


  if(!record){

    alert(
      "리포트로 만들 분석 기록을 선택하세요."
    );

    return;

  }


  setText(
    "reportScore",
    `${record.score.total}/100`
  );

  setText(
    "reportStability",
    record.score.stability
  );

  setText(
    "reportAlignment",
    record.score.alignment
  );

  setText(
    "reportSymmetry",
    record.score.symmetry
  );


  if($("reportFeedback")){

    $("reportFeedback").innerHTML =
      (record.feedback || [])
        .map(
          item => `

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

          `
        ).join("");

  }


  if($("reportTraining")){

    $("reportTraining").innerHTML =
      (record.training || [])
        .map(
          item => `

            <div class="training-card">

              <span class="tag">
                ${escapeHTML(
                  item.tag
                )}
              </span>

              <strong>
                ${escapeHTML(
                  item.title
                )}
              </strong>

              <p>
                ${escapeHTML(
                  item.description
                )}
              </p>

            </div>

          `
        ).join("");

  }

}


/* =========================================================
   성장 분석
========================================================= */

function calculateGrowthPercent() {

  const records =
    [...S.analyses]
      .sort(
        (a,b)=>
          a.createdAt-b.createdAt
      );


  if(records.length<2)
    return 0;


  const first =
    Number(
      records[0].score?.total || 0
    );


  const last =
    Number(
      records[
        records.length-1
      ].score?.total || 0
    );


  if(first<=0)
    return 0;


  return Math.round(
    (last-first)/first*100
  );

}


function renderGrowth() {

  const records =
    [...S.analyses]
      .sort(
        (a,b)=>
          a.createdAt-b.createdAt
      );


  if(!records.length){

    setText(
      "growthStart",
      0
    );

    setText(
      "growthCurrent",
      0
    );

    setText(
      "growthPercent",
      "0%"
    );

    setText(
      "growthBest",
      0
    );

    return;

  }


  const scores =
    records.map(
      x =>
        Number(
          x.score?.total || 0
        )
    );


  setText(
    "growthStart",
    scores[0]
  );

  setText(
    "growthCurrent",
    scores[scores.length-1]
  );

  setText(
    "growthPercent",
    `${calculateGrowthPercent()}%`
  );

  setText(
    "growthBest",
    Math.max(...scores)
  );


  if(
    typeof Chart === "undefined"
  )
    return;


  const canvas =
    $("growthChart");

  if(!canvas)
    return;


  if(S.charts.growth)
    S.charts.growth.destroy();


  S.charts.growth =
    new Chart(
      canvas,
      {

        type:"line",

        data:{

          labels:
            records.map(
              x =>
                U.formatDate(
                  x.createdAt
                )
            ),

          datasets:[

            {
              label:"성장 점수",

              data:scores,

              borderWidth:3,

              tension:.3

            }

          ]

        },

        options:chartOptions()

      }
    );

}


/* =========================================================
   체대입시
========================================================= */

$("saveCollegeBtn")
  ?.addEventListener(
    "click",
    saveCollege
  );


function saveCollege() {

  const data={

    name:
      $("collegeName")?.value
        .trim(),

    major:
      $("collegeMajor")?.value
        .trim(),

    type:
      $("collegeType")?.value,

    grade:
      Number(
        $("collegeGrade")?.value
      )

  };


  saveJSON(
    STORAGE.college,
    data
  );


  renderCollegeComparison();


  alert(
    "목표 대학이 저장되었습니다."
  );

}


function renderCollegeComparison() {

  const data =
    loadJSON(
      STORAGE.college,
      null
    );


  const container =
    $("collegeComparison");

  if(!container)
    return;


  if(!data?.name){

    container.textContent =
      "목표 대학을 등록하면 현재 퍼포먼스와 비교합니다.";

    return;

  }


  const currentGrade =
    data.grade || 0;


  const averageScore =
    S.analyses.length
      ? Math.round(
          S.analyses.reduce(
            (sum,r)=>
              sum+
              Number(
                r.score?.total || 0
              ),
            0
          ) /
          S.analyses.length
        )
      : 0;


  container.innerHTML = `

    <strong>
      ${escapeHTML(data.name)}
    </strong>

    <p>
      ${escapeHTML(data.major || "-")}
      ·
      ${escapeHTML(data.type || "-")}
    </p>

    <hr style="
      border:0;
      border-top:1px solid rgba(255,255,255,.08);
      margin:15px 0;
    ">

    <div>
      현재 평균 퍼포먼스:
      <strong>
        ${averageScore}/100
      </strong>
    </div>

    <div style="margin-top:8px;">
      목표 내신:
      <strong>
        ${currentGrade || "-"}
      </strong>
    </div>

    <p style="
      color:#71869b;
      margin-top:15px;
      font-size:10px;
    ">
      대학별 실제 합격선은 연도·전형·대학별로 달라질 수 있으므로
      별도 입시 자료와 함께 확인해야 합니다.
    </p>

  `;

}


/* =========================================================
   설정
========================================================= */

function applySettings() {

  const skeleton =
    $("settingSkeleton");

  const angles =
    $("settingAngles");

  const baseline =
    $("settingBaseline");

  const keyframes =
    $("settingKeyframes");


  if(skeleton)
    skeleton.checked =
      S.settings.skeleton;

  if(angles)
    angles.checked =
      S.settings.angles;

  if(baseline)
    baseline.checked =
      S.settings.baseline;

  if(keyframes)
    keyframes.checked =
      S.settings.keyframes;


  S.settings.skeleton =
    skeleton?.checked ??
    S.settings.skeleton;

  S.settings.angles =
    angles?.checked ??
    S.settings.angles;

  S.settings.baseline =
    baseline?.checked ??
    S.settings.baseline;

  S.settings.keyframes =
    keyframes?.checked ??
    S.settings.keyframes;

}


[
  "settingSkeleton",
  "settingAngles",
  "settingBaseline",
  "settingKeyframes"
].forEach(id => {

  $(id)?.addEventListener(
    "change",
    () => {

      S.settings.skeleton =
        $("settingSkeleton").checked;

      S.settings.angles =
        $("settingAngles").checked;

      S.settings.baseline =
        $("settingBaseline").checked;

      S.settings.keyframes =
        $("settingKeyframes").checked;

      saveData();

    }
  );

});


/* =========================================================
   유틸 UI
========================================================= */

function setText(id,value) {

  const el=$(id);

  if(el)
    el.textContent =
      value ?? "--";

}


function setWidth(id,value) {

  const el=$(id);

  if(el)
    el.style.width =
      `${U.clamp(
        Number(value)||0,
        0,
        100
      )}%`;

}


function getAthleteName(id) {

  const athlete =
    S.athletes.find(
      a=>a.id===id
    );

  return athlete?.name ||
    "선수 미지정";

}


function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================================
   리사이즈
========================================================= */

window.addEventListener(
  "resize",
  () => {

    resizePoseCanvas();

    if(S.trajectory.length)
      updateTrajectory();

  }
);


/* =========================================================
   초기화
========================================================= */

function initializeApp() {

  loadData();

  applySettings();

  refreshAthleteSelectors();

  refreshRecordSportFilter();

  refreshCompareSelectors();

  refreshReportSelectors();

  renderAthletes();

  renderRecords();

  renderGrowth();

  renderCollegeComparison();

  updateDashboard();

  showPage(
    "dashboard"
  );


  console.log(
    "%c설천고 스포츠과학 분석센터 PRO",
    "font-size:18px;font-weight:bold"
  );

  console.log(
    "System initialized."
  );

}


initializeApp();


/* =========================================================
   분석 종료 후 보조 갱신
========================================================= */

const originalFinishAnalysis =
  finishAnalysis;


/*
 * 분석 기록이 추가된 뒤 필터/셀렉터를
 * 다시 갱신하기 위한 래퍼.
 */
function refreshAfterAnalysis() {

  refreshRecordSportFilter();

  refreshCompareSelectors();

  refreshReportSelectors();

  renderGrowth();

  updateDashboard();

}


/* =========================================================
   주기적인 UI 업데이트
========================================================= */

setInterval(
  () => {

    if(
      S.analysisRunning &&
      video &&
      !video.paused
    ){

      if(
        S.lastPose
      ){

        calculateLiveScore();

      }

    }

  },
  250
);


/* =========================================================
   비디오 종료
========================================================= */

video?.addEventListener(
  "ended",
  () => {

    if(
      S.analysisRunning
    ){

      stopAnalysis();

    }

  }
);


/* =========================================================
   페이지 이탈 방지
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if(
      S.currentVideoURL
    ){

      try{

        URL.revokeObjectURL(
          S.currentVideoURL
        );

      }catch{}

    }

  }
);