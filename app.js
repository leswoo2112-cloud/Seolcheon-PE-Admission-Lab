/* =========================================================
   설천고 PE PERFORMANCE LAB
   APP.JS — FINAL
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     기본 설정
  ======================================================= */

  const STORAGE_KEY = "seolcheon_pe_performance_final_v2";

  const $ = (id) => document.getElementById(id);

  let state = {
    athletes: [],
    records: [],
    lastReport: null
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      state = {
        ...state,
        ...JSON.parse(saved)
      };
    }
  } catch (error) {
    console.warn("저장 데이터 불러오기 실패", error);
  }


  /* =======================================================
     분석 상태
  ======================================================= */

  let pose = null;

  let processing = false;

  let animationFrame = null;

  let lastPoseResults = null;

  let trajectory = [];

  let angleSeries = [];

  let keyFrames = [];

  let currentEvent = "";

  let currentAnalysisId = null;

  let angleChart = null;

  let dashboardRadar = null;

  let reportRadar = null;

  let reportAngleChart = null;

  let mediaStream = null;


  /* =======================================================
     저장
  ======================================================= */

  function saveState() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );

    } catch (error) {

      console.error(error);

      showToast(
        "데이터 저장에 실패했습니다."
      );

    }

  }


  /* =======================================================
     공통
  ======================================================= */

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function showToast(message) {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {

      toast.classList.remove("show");

    }, 2300);

  }


  function formatTime(seconds) {

    seconds = Number(seconds) || 0;

    const minutes = Math.floor(
      seconds / 60
    );

    const remain = seconds % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      remain.toFixed(2).padStart(5, "0")
    );

  }


  function formatDate(date) {

    return new Date(date).toLocaleString(
      "ko-KR"
    );

  }


  function getEvent(id) {

    return (
      window.PE_EVENTS || []
    ).find(
      (event) => event.id === id
    );

  }


  function getAthlete(id) {

    return state.athletes.find(
      (athlete) => athlete.id === id
    );

  }


  /* =======================================================
     페이지 이동
  ======================================================= */

  function openPage(pageName) {

    document
      .querySelectorAll(".page")
      .forEach((page) => {

        page.classList.toggle(
          "active",
          page.id === `page-${pageName}`
        );

      });


    document
      .querySelectorAll(".nav-button")
      .forEach((button) => {

        button.classList.toggle(
          "active",
          button.dataset.page === pageName
        );

      });


    const titles = {

      dashboard: "대시보드",

      athletes: "선수 관리",

      events: "체대입시",

      analysis: "영상 자세분석",

      comparison: "영상 비교",

      records: "분석 기록",

      report: "리포트",

      settings: "설정"

    };


    if ($("pageTitle")) {

      $("pageTitle").textContent =
        titles[pageName] || pageName;

    }


    const sidebar =
      $("sidebar");

    if (sidebar) {

      sidebar.classList.remove(
        "open"
      );

    }


    if (pageName === "comparison") {

      renderComparisonOptions();

    }

  }


  /* =======================================================
     선수 관리
  ======================================================= */

  function renderAthletes() {

    const list =
      $("athleteList");

    const count =
      $("athleteCountBadge");

    const dashboardCount =
      $("dashboardAthleteCount");


    if (count) {

      count.textContent =
        state.athletes.length;

    }


    if (dashboardCount) {

      dashboardCount.textContent =
        state.athletes.length;

    }


    if (!list) return;


    if (!state.athletes.length) {

      list.innerHTML = `
        <div class="empty-state">
          등록된 선수가 없습니다.
        </div>
      `;

    } else {

      list.innerHTML =
        state.athletes
          .map((athlete) => {

            return `

              <div
                class="athlete-item"
                data-athlete-card="${athlete.id}">

                <div>

                  <strong>
                    ${escapeHTML(
                      athlete.name
                    )}
                  </strong>

                  <div class="muted">

                    ${escapeHTML(
                      athlete.grade || "-"
                    )}

                    ·

                    ${escapeHTML(
                      athlete.sport ||
                      "종목 미지정"
                    )}

                    · 목표

                    ${escapeHTML(
                      athlete.university ||
                      "-"
                    )}

                  </div>

                </div>

                <button
                  class="secondary-button"
                  data-delete-athlete="${athlete.id}">

                  삭제

                </button>

              </div>

            `;

          })
          .join("");

    }


    document
      .querySelectorAll(
        "[data-delete-athlete]"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset
                .deleteAthlete;

            if (
              !confirm(
                "이 선수를 삭제할까요?"
              )
            ) {
              return;
            }


            state.athletes =
              state.athletes.filter(
                (athlete) =>
                  athlete.id !== id
              );


            saveState();

            renderAll();

            showToast(
              "선수가 삭제되었습니다."
            );

          }
        );

      });


    updateAthleteSelect();

  }


  function updateAthleteSelect() {

    const select =
      $("analysisAthleteSelect");

    if (!select) return;


    const oldValue =
      select.value;


    select.innerHTML = `
      <option value="">
        선수 선택
      </option>
    `;


    state.athletes.forEach(
      (athlete) => {

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
      state.athletes.some(
        (athlete) =>
          athlete.id === oldValue
      )
    ) {

      select.value =
        oldValue;

    }

  }


  function createAthlete(event) {

    event.preventDefault();


    const name =
      $("athleteNameInput")
        .value
        .trim();


    if (!name) {

      showToast(
        "선수 이름을 입력하세요."
      );

      return;

    }


    const athlete = {

      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(),

      name,

      grade:
        $("athleteGradeInput").value,

      height:
        $("athleteHeightInput").value,

      weight:
        $("athleteWeightInput").value,

      sport:
        $("athleteSportInput")
          .value
          .trim(),

      university:
        $("athleteUniversityInput")
          .value
          .trim(),

      memo:
        $("athleteMemoInput")
          .value
          .trim(),

      createdAt:
        new Date().toISOString()

    };


    state.athletes.push(
      athlete
    );


    saveState();

    event.target.reset();

    renderAll();

    showToast(
      "선수가 등록되었습니다."
    );

  }


  /* =======================================================
     종목
  ======================================================= */

  function renderEvents() {

    const grid =
      $("eventGrid");

    if (!grid) return;


    grid.innerHTML =
      (window.PE_EVENTS || [])
        .map((event) => {

          return `

            <div
              class="event-card"
              data-event-id="${event.id}">

              <span class="event-icon">
                ${event.icon}
              </span>

              <strong>
                ${escapeHTML(
                  event.name
                )}
              </strong>

              <small>
                ${escapeHTML(
                  event.desc
                )}
              </small>

            </div>

          `;

        })
        .join("");


    document
      .querySelectorAll(
        "[data-event-id]"
      )
      .forEach((card) => {

        card.addEventListener(
          "click",
          () => {

            const eventId =
              card.dataset.eventId;

            selectEvent(eventId);

            openPage(
              "analysis"
            );

          }
        );

      });


    updateEventSelect();

  }


  function updateEventSelect() {

    const select =
      $("analysisEventSelect");

    if (!select) return;


    const oldValue =
      select.value;


    select.innerHTML = `
      <option value="">
        종목 선택
      </option>
    `;


    (
      window.PE_EVENTS || []
    ).forEach((event) => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        event.id;

      option.textContent =
        `${event.icon} ${event.name}`;

      select.appendChild(
        option
      );

    });


    if (
      window.PE_EVENTS.some(
        (event) =>
          event.id === oldValue
      )
    ) {

      select.value =
        oldValue;

    }

  }


  function selectEvent(eventId) {

    currentEvent =
      eventId;


    const select =
      $("analysisEventSelect");


    if (select) {

      select.value =
        eventId;

    }


    const event =
      getEvent(eventId);


    if (
      event &&
      $("analysisEventTitle")
    ) {

      $("analysisEventTitle")
        .textContent =
        `${event.icon} ${event.name}`;

    }


    showToast(
      `${event?.name || "종목"} 선택`
    );

  }


  /* =======================================================
     영상
  ======================================================= */

  function loadVideo(file) {

    if (!file) return;


    const video =
      $("analysisVideo");


    if (!video) return;


    if (
      video.src &&
      video.src.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        video.src
      );

    }


    const url =
      URL.createObjectURL(
        file
      );


    video.src =
      url;


    video.dataset.videoName =
      file.name;


    video.load();


    const empty =
      $("videoEmptyState");


    if (empty) {

      empty.style.display =
        "none";

    }


    trajectory = [];

    angleSeries = [];

    keyFrames = [];

    lastPoseResults = null;


    clearCanvas(
      "poseCanvas"
    );

    clearCanvas(
      "trajectoryCanvas"
    );


    setAnalysisStatus(
      "VIDEO READY"
    );


    writeAnalysisLog(
      `영상 로드 완료\n${file.name}`
    );


    showToast(
      "영상이 로드되었습니다."
    );

  }


  function setupVideo() {

    const video =
      $("analysisVideo");


    if (!video) return;


    video.addEventListener(
      "loadedmetadata",
      () => {

        const duration =
          video.duration || 0;


        $("videoDuration")
          .textContent =
          formatTime(
            duration
          );


        $("videoTimeline")
          .max =
          duration;


        resizeCanvases();

      }
    );


    video.addEventListener(
      "timeupdate",
      () => {

        $("videoCurrentTime")
          .textContent =
          formatTime(
            video.currentTime
          );


        if (
          $("videoTimeline")
        ) {

          $("videoTimeline")
            .value =
            video.currentTime;

        }

      }
    );


    video.addEventListener(
      "play",
      () => {

        if ($("playPauseButton")) {

          $("playPauseButton")
            .textContent =
            "❚❚";

        }


        if (processing) {

          processVideoLoop();

        }

      }
    );


    video.addEventListener(
      "pause",
      () => {

        if ($("playPauseButton")) {

          $("playPauseButton")
            .textContent =
            "▶";

        }

      }
    );

  }


  function seekVideo(amount) {

    const video =
      $("analysisVideo");


    if (!video.duration) return;


    video.currentTime =
      Math.max(
        0,
        Math.min(
          video.duration,
          video.currentTime +
            amount
        )
      );

  }


  /* =======================================================
     Canvas
  ======================================================= */

  function resizeCanvases() {

    const stage =
      $("videoStage");


    if (!stage) return;


    const rect =
      stage.getBoundingClientRect();


    [
      "poseCanvas",
      "trajectoryCanvas"
    ].forEach((id) => {

      const canvas =
        $(id);

      if (!canvas) return;


      const ratio =
        window.devicePixelRatio ||
        1;


      canvas.width =
        Math.max(
          1,
          Math.floor(
            rect.width *
              ratio
          )
        );


      canvas.height =
        Math.max(
          1,
          Math.floor(
            rect.height *
              ratio
          )
        );


      canvas.style.width =
        `${rect.width}px`;

      canvas.style.height =
        `${rect.height}px`;

    });

  }


  function clearCanvas(id) {

    const canvas =
      $(id);


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


  /* =======================================================
     MediaPipe Pose
  ======================================================= */

  function initializePose() {

    if (
      typeof window.Pose ===
      "undefined"
    ) {

      setTimeout(
        initializePose,
        500
      );

      return;

    }


    try {

      pose =
        new window.Pose({

          locateFile:
            (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`

        });


        pose.setOptions({

          modelComplexity: 1,

          smoothLandmarks: true,

          enableSegmentation: false,

          smoothSegmentation: false,

          minDetectionConfidence:
            0.55,

          minTrackingConfidence:
            0.55

        });


        pose.onResults(
          handlePoseResults
        );


        writeAnalysisLog(
          "MediaPipe Pose 준비 완료"
        );


    } catch (error) {

      console.error(error);

      writeAnalysisLog(
        "Pose 엔진 초기화 실패"
      );

    }

  }


  /* =======================================================
     Skeleton connections
  ======================================================= */

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
    [28, 30],

    [29, 31],
    [30, 32]

  ];


  /* =======================================================
     Pose drawing
  ======================================================= */

  function drawSkeleton(
    landmarks
  ) {

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


    if (
      !$("skeletonOption")
        ?.checked
    ) {

      return;

    }


    const width =
      canvas.width;

    const height =
      canvas.height;


    const dpr =
      window.devicePixelRatio ||
      1;


    ctx.lineWidth =
      3 * dpr;

    ctx.lineCap =
      "round";

    ctx.strokeStyle =
      "#20a7ff";


    POSE_CONNECTIONS
      .forEach(
        ([a, b]) => {

          const first =
            landmarks[a];

          const second =
            landmarks[b];


          if (
            !first ||
            !second
          ) {

            return;

          }


          if (
            (first.visibility ??
              1) <
              0.25 ||
            (second.visibility ??
              1) <
              0.25
          ) {

            return;

          }


          ctx.beginPath();

          ctx.moveTo(
            first.x * width,
            first.y * height
          );

          ctx.lineTo(
            second.x * width,
            second.y * height
          );

          ctx.stroke();

        }
      );


    ctx.fillStyle =
      "#ffffff";


    landmarks.forEach(
      (point) => {

        if (
          (point.visibility ??
            1) <
            0.3
        ) {

          return;

        }


        ctx.beginPath();

        ctx.arc(
          point.x * width,
          point.y * height,
          4 * dpr,
          0,
          Math.PI * 2
        );

        ctx.fill();

      }
    );

  }


  /* =======================================================
     신체 중심
  ======================================================= */

  function drawCenterOfMass(
    landmarks
  ) {

    if (
      !$("centerOfMassOption")
        ?.checked
    ) {

      return;

    }


    const canvas =
      $("poseCanvas");


    if (!canvas) return;


    const ctx =
      canvas.getContext(
        "2d"
      );


    const shoulder = {

      x:
        (
          landmarks[11].x +
          landmarks[12].x
        ) / 2,

      y:
        (
          landmarks[11].y +
          landmarks[12].y
        ) / 2

    };


    const hip = {

      x:
        (
          landmarks[23].x +
          landmarks[24].x
        ) / 2,

      y:
        (
          landmarks[23].y +
          landmarks[24].y
        ) / 2

    };


    const center = {

      x:
        (
          shoulder.x +
          hip.x
        ) / 2,

      y:
        (
          shoulder.y +
          hip.y
        ) / 2

    };


    const x =
      center.x *
      canvas.width;

    const y =
      center.y *
      canvas.height;


    ctx.save();

    ctx.fillStyle =
      "#ffcc33";

    ctx.strokeStyle =
      "#fff";

    ctx.lineWidth =
      2 *
      (window.devicePixelRatio ||
        1);


    ctx.beginPath();

    ctx.arc(
      x,
      y,
      7 *
        (window.devicePixelRatio ||
          1),
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();

    ctx.restore();

  }


  /* =======================================================
     궤적
  ======================================================= */

  function drawTrajectory(
    landmarks
  ) {

    const canvas =
      $("trajectoryCanvas");


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


    if (
      !$("trajectoryOption")
        ?.checked
    ) {

      return;

    }


    if (
      !landmarks[23] ||
      !landmarks[24]
    ) {

      return;

    }


    const center = {

      x:
        (
          landmarks[23].x +
          landmarks[24].x
        ) / 2,

      y:
        (
          landmarks[23].y +
          landmarks[24].y
        ) / 2

    };


    trajectory.push({

      x:
        center.x *
        canvas.width,

      y:
        center.y *
        canvas.height

    });


    if (
      trajectory.length >
      180
    ) {

      trajectory.shift();

    }


    if (
      trajectory.length <
      2
    ) {

      return;

    }


    ctx.save();

    ctx.strokeStyle =
      "#ffd43b";

    ctx.lineWidth =
      3 *
      (window.devicePixelRatio ||
        1);

    ctx.lineJoin =
      "round";

    ctx.lineCap =
      "round";


    ctx.beginPath();


    trajectory.forEach(
      (point, index) => {

        if (index === 0) {

          ctx.moveTo(
            point.x,
            point.y
          );

        } else {

          ctx.lineTo(
            point.x,
            point.y
          );

        }

      }
    );


    ctx.stroke();

    ctx.restore();

  }


  /* =======================================================
     각도
  ======================================================= */

  function calculateAngle(
    a,
    b,
    c
  ) {

    if (
      !a ||
      !b ||
      !c
    ) {

      return null;

    }


    const ab = {

      x:
        a.x - b.x,

      y:
        a.y - b.y

    };


    const cb = {

      x:
        c.x - b.x,

      y:
        c.y - b.y

    };


    const dot =
      ab.x * cb.x +
      ab.y * cb.y;


    const magnitude =
      Math.hypot(
        ab.x,
        ab.y
      ) *
      Math.hypot(
        cb.x,
        cb.y
      );


    if (!magnitude) {

      return null;

    }


    const cosine =
      Math.max(
        -1,
        Math.min(
          1,
          dot / magnitude
        )
      );


    return (
      Math.acos(
        cosine
      ) *
      180 /
      Math.PI
    );

  }


  function calculateAngles(
    landmarks
  ) {

    const values = {

      leftKnee:
        calculateAngle(
          landmarks[23],
          landmarks[25],
          landmarks[27]
        ),

      rightKnee:
        calculateAngle(
          landmarks[24],
          landmarks[26],
          landmarks[28]
        ),

      leftHip:
        calculateAngle(
          landmarks[11],
          landmarks[23],
          landmarks[25]
        ),

      rightHip:
        calculateAngle(
          landmarks[12],
          landmarks[24],
          landmarks[26]
        ),

      leftAnkle:
        calculateAngle(
          landmarks[25],
          landmarks[27],
          landmarks[31]
        ),

      rightAnkle:
        calculateAngle(
          landmarks[26],
          landmarks[28],
          landmarks[32]
        )

    };


    const shoulder = {

      x:
        (
          landmarks[11].x +
          landmarks[12].x
        ) / 2,

      y:
        (
          landmarks[11].y +
          landmarks[12].y
        ) / 2

    };


    const hip = {

      x:
        (
          landmarks[23].x +
          landmarks[24].x
        ) / 2,

      y:
        (
          landmarks[23].y +
          landmarks[24].y
        ) / 2

    };


    values.trunk =
      Math.atan2(
        shoulder.x -
          hip.x,
        -(shoulder.y -
          hip.y)
      ) *
      180 /
      Math.PI;


    return values;

  }


  function updateAngleUI(
    values
  ) {

    const setValue =
      (
        id,
        value
      ) => {

        const element =
          $(id);

        if (!element)
          return;


        element.textContent =
          value == null
            ? "--"
            : `${Math.round(
                value
              )}°`;

      };


    setValue(
      "leftKneeAngle",
      values.leftKnee
    );

    setValue(
      "rightKneeAngle",
      values.rightKnee
    );

    setValue(
      "leftHipAngle",
      values.leftHip
    );

    setValue(
      "rightHipAngle",
      values.rightHip
    );

    setValue(
      "leftAnkleAngle",
      values.leftAnkle
    );

    setValue(
      "rightAnkleAngle",
      values.rightAnkle
    );


    if ($("trunkAngle")) {

      $("trunkAngle")
        .textContent =
        Number.isFinite(
          values.trunk
        )
          ? `${Math.round(
              values.trunk
            )}°`
          : "--";

    }

  }


  /* =======================================================
     퍼포먼스
  ======================================================= */

  function calculateMetrics(
    values
  ) {

    const kneeDifference =
      Math.abs(
        (
          values.leftKnee ||
          0
        ) -
        (
          values.rightKnee ||
          0
        )
      );


    const symmetry =
      Math.max(
        0,
        Math.min(
          100,
          100 -
            kneeDifference *
              2
        )
      );


    const kneeDeviation =
      (
        Math.abs(
          (
            values.leftKnee ||
            160
          ) - 160
        ) +
        Math.abs(
          (
            values.rightKnee ||
            160
          ) - 160
        )
      ) / 2;


    const stability =
      Math.max(
        50,
        Math.min(
          100,
          100 -
            kneeDeviation *
              0.65
        )
      );


    const technique =
      (
        symmetry +
        stability
      ) / 2;


    const power =
      Math.max(
        50,
        Math.min(
          100,
          70 +
            Math.abs(
              (
                values.leftHip ||
                160
              ) -
              (
                values.rightHip ||
                160
              )
            ) *
              0.15
        )
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

    const map = {

      techniqueMetricValue:
        metrics.technique,

      stabilityMetricValue:
        metrics.stability,

      symmetryMetricValue:
        metrics.symmetry,

      powerMetricValue:
        metrics.power

    };


    Object.entries(
      map
    ).forEach(
      ([id, value]) => {

        if ($(id)) {

          $(id).textContent =
            value;

        }

      }
    );

  }


  /* =======================================================
     Pose 결과
  ======================================================= */

  function handlePoseResults(
    results
  ) {

    if (
      !results ||
      !results.poseLandmarks
    ) {

      return;

    }


    lastPoseResults =
      results;


    const landmarks =
      results.poseLandmarks;


    drawSkeleton(
      landmarks
    );


    drawCenterOfMass(
      landmarks
    );


    drawTrajectory(
      landmarks
    );


    const angles =
      calculateAngles(
        landmarks
      );


    updateAngleUI(
      angles
    );


    const metrics =
      calculateMetrics(
        angles
      );


    updateMetricUI(
      metrics
    );


    const confidence =
      Math.round(
        Math.min(
          ...landmarks.map(
            (point) =>
              point.visibility ??
              1
          )
        ) *
          100
      );


    if ($("poseConfidence")) {

      $("poseConfidence")
        .textContent =
        `${confidence}%`;

    }


    if (
      processing &&
      $("angleOption")?.checked
    ) {

      angleSeries.push({

        time:
          $("analysisVideo")
            .currentTime,

        leftKnee:
          angles.leftKnee || 0,

        rightKnee:
          angles.rightKnee || 0,

        leftHip:
          angles.leftHip || 0,

        rightHip:
          angles.rightHip || 0,

        leftAnkle:
          angles.leftAnkle || 0,

        rightAnkle:
          angles.rightAnkle || 0,

        trunk:
          angles.trunk || 0

      });

    }


    if (processing) {

      writeAnalysisLog(
        `분석 프레임 ${
          angleSeries.length
        } · Pose ${
          confidence
        }%`
      );

    }

  }


  /* =======================================================
     영상 분석 루프
  ======================================================= */

  async function processVideoLoop() {

    if (!processing) {
      return;
    }


    const video =
      $("analysisVideo");


    if (
      !video ||
      video.paused ||
      video.ended
    ) {

      return;

    }


    if (!pose) {

      writeAnalysisLog(
        "Pose 엔진 준비 중..."
      );

      return;

    }


    try {

      await pose.send({
        image: video
      });

    } catch (error) {

      console.error(error);

      writeAnalysisLog(
        `Pose 분석 오류\n${error.message}`
      );

    }


    animationFrame =
      requestAnimationFrame(
        processVideoLoop
      );

  }


  /* =======================================================
     분석 시작
  ======================================================= */

  function startAnalysis() {

    const video =
      $("analysisVideo");


    if (
      !video ||
      !video.src
    ) {

      showToast(
        "먼저 분석 영상을 선택하세요."
      );

      return;

    }


    if (!currentEvent) {

      currentEvent =
        $("analysisEventSelect")
          ?.value || "";

    }


    if (!currentEvent) {

      showToast(
        "분석 종목을 선택하세요."
      );

      openPage(
        "events"
      );

      return;

    }


    if (!pose) {

      showToast(
        "AI 분석 엔진을 준비하는 중입니다."
      );

      return;

    }


    processing = true;

    trajectory = [];

    angleSeries = [];

    keyFrames = [];

    currentAnalysisId =
      null;


    setAnalysisStatus(
      "ANALYZING"
    );


    $("startAnalysisButton")
      .disabled =
      true;


    $("stopAnalysisButton")
      .disabled =
      false;


    $("finishReportButton")
      .disabled =
      true;


    $("analysisSummaryPanel")
      .classList.add(
        "hidden"
      );


    writeAnalysisLog(
      "영상 분석 시작\n" +
      "Skeleton ✓\n" +
      "Joint Angle ✓\n" +
      "Trajectory ✓\n" +
      "Center of Mass ✓"
    );


    video
      .play()
      .catch(() => {});


    processVideoLoop();

  }


  /* =======================================================
     분석 종료
  ======================================================= */

  function stopAnalysis(
    automatic = false
  ) {

    if (!processing) {

      return;

    }


    processing = false;


    if (animationFrame) {

      cancelAnimationFrame(
        animationFrame
      );

      animationFrame =
        null;

    }


    const video =
      $("analysisVideo");


    if (video) {

      video.pause();

    }


    $("startAnalysisButton")
      .disabled =
      false;


    $("stopAnalysisButton")
      .disabled =
      true;


    setAnalysisStatus(
      "COMPLETE"
    );


    renderAngleChart();


    captureKeyFrame(
      false
    );


    generateFeedback();


    const score =
      calculateFinalScore();


    $("analysisFinalScore")
      .textContent =
      score;


    $("analysisSummaryPanel")
      .classList.remove(
        "hidden"
      );


    const record =
      saveAnalysisRecord(
        score
      );


    if (record) {

      state.lastReport =
        record;

      currentAnalysisId =
        record.id;

    }


    $("finishReportButton")
      .disabled =
      false;


    if (!automatic) {

      showToast(
        "분석이 완료되고 저장되었습니다."
      );

    }

  }


  /* =======================================================
     분석 점수
  ======================================================= */

  function calculateFinalScore() {

    if (!angleSeries.length) {

      return 0;

    }


    const differences =
      angleSeries.map(
        (frame) =>
          Math.abs(
            frame.leftKnee -
            frame.rightKnee
          )
      );


    const averageDifference =
      differences.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      differences.length;


    const symmetry =
      Math.max(
        0,
        Math.min(
          100,
          100 -
            averageDifference *
              2
        )
      );


    const score =
      Math.round(
        Math.max(
          50,
          Math.min(
            98,
            symmetry
          )
        )
      );


    return score;

  }


  /* =======================================================
     그래프
  ======================================================= */

  function renderAngleChart() {

    if (
      typeof window.Chart ===
      "undefined"
    ) {

      return;

    }


    const canvas =
      $("angleGraphCanvas");


    if (!canvas) return;


    if (angleChart) {

      angleChart.destroy();

    }


    angleChart =
      new Chart(
        canvas.getContext("2d"),
        {

          type: "line",

          data: {

            labels:
              angleSeries.map(
                (frame) =>
                  frame.time.toFixed(
                    2
                  )
              ),

            datasets: [

              {

                label:
                  "왼쪽 무릎",

                data:
                  angleSeries.map(
                    (frame) =>
                      frame.leftKnee
                  ),

                tension:
                  0.25

              },

              {

                label:
                  "오른쪽 무릎",

                data:
                  angleSeries.map(
                    (frame) =>
                      frame.rightKnee
                  ),

                tension:
                  0.25

              }

            ]

          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            interaction: {

              intersect:
                false,

              mode:
                "index"

            },

            plugins: {

              legend: {

                labels: {

                  color:
                    "#dce8f4"

                }

              }

            },

            scales: {

              x: {

                ticks: {

                  color:
                    "#71879c"

                },

                grid: {

                  color:
                    "#172d42"

                }

              },

              y: {

                min: 0,

                max: 190,

                ticks: {

                  color:
                    "#71879c"

                },

                grid: {

                  color:
                    "#172d42"

                }

              }

            }

          }

        }
      );

  }


  /* =======================================================
     핵심 프레임
  ======================================================= */

  function captureKeyFrame(
    showToastMessage = true
  ) {

    const video =
      $("analysisVideo");


    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {

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


    const context =
      canvas.getContext(
        "2d"
      );


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.82
      );


    const frame = {

      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString(),

      time:
        video.currentTime,

      image,

      label:
        "핵심 분석 프레임"

    };


    keyFrames.push(
      frame
    );


    if (
      keyFrames.length >
      8
    ) {

      keyFrames =
        keyFrames.slice(
          -8
        );

    }


    renderKeyFrames();


    if (showToastMessage) {

      showToast(
        "핵심 프레임이 저장되었습니다."
      );

    }


    return frame;

  }


  function renderKeyFrames() {

    const list =
      $("keyFrameList");


    const count =
      $("keyFrameCount");


    if (count) {

      count.textContent =
        keyFrames.length;

    }


    if (!list) return;


    if (!keyFrames.length) {

      list.innerHTML = `
        <div class="empty-state">
          분석 후 자동 생성됩니다.
        </div>
      `;

      return;

    }


    list.innerHTML =
      keyFrames
        .map(
          (frame) => {

            return `

              <div class="key-frame">

                <img
                  src="${frame.image}"
                  alt="핵심 분석 프레임">

                <strong>
                  ${formatTime(
                    frame.time
                  )}
                </strong>

                <span>
                  ${escapeHTML(
                    frame.label
                  )}
                </span>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     자동 피드백
  ======================================================= */

  function generateFeedback() {

    const list =
      $("analysisFeedbackList");


    if (!list) return;


    const score =
      calculateFinalScore();


    const event =
      getEvent(
        currentEvent
      );


    let averageDifference =
      0;


    if (
      angleSeries.length
    ) {

      averageDifference =
        angleSeries
          .map(
            (frame) =>
              Math.abs(
                frame.leftKnee -
                frame.rightKnee
              )
          )
          .reduce(
            (a, b) =>
              a + b,
            0
          ) /
          angleSeries.length;

    }


    const feedback = [];


    if (
      score >= 90
    ) {

      feedback.push({

        type:
          "good",

        title:
          "🟢 좌우 움직임이 매우 안정적입니다.",

        text:
          `평균 좌우 무릎각 차이 ${averageDifference.toFixed(
            1
          )}°로 비교적 안정적인 움직임이 확인됩니다.`

      });

    } else if (
      score >= 80
    ) {

      feedback.push({

        type:
          "info",

        title:
          "🔵 전반적인 움직임은 안정적입니다.",

        text:
          `평균 좌우 무릎각 차이는 ${averageDifference.toFixed(
            1
          )}°입니다. 세부적인 좌우 차이를 줄이면 더 안정적인 동작을 만들 수 있습니다.`

      });

    } else {

      feedback.push({

        type:
          "warn",

        title:
          "🔴 좌우 움직임 차이를 우선 확인하세요.",

        text:
          `평균 좌우 무릎각 차이가 ${averageDifference.toFixed(
            1
          )}°입니다. 단측 안정성과 움직임 패턴을 함께 확인하는 것을 권장합니다.`

      });

    }


    feedback.push({

      type:
        "info",

      title:
        "📌 촬영 조건을 일정하게 유지하세요.",

      text:
        "이전 영상과 같은 거리·높이·측면에서 촬영하면 전후 비교의 신뢰도를 높일 수 있습니다."

    });


    feedback.push({

      type:
        "info",

      title:
        "🎯 다음 분석에서 확인할 항목",

      text:
        `${event?.name || "선택 종목"}의 핵심 동작 구간에서 무릎·고관절·몸통 정렬을 함께 비교하세요.`

    });


    list.innerHTML =
      feedback
        .map(
          (item) => {

            return `

              <div class="feedback-item">

                <strong>
                  ${item.title}
                </strong>

                <p>
                  ${item.text}
                </p>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     기록 저장
  ======================================================= */

  function saveAnalysisRecord(
    score
  ) {

    const athlete =
      getAthlete(
        $("analysisAthleteSelect")
          ?.value
      );


    const event =
      getEvent(
        $("analysisEventSelect")
          ?.value ||
        currentEvent
      );


    const video =
      $("analysisVideo");


    const record = {

      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,

      date:
        new Date().toISOString(),

      athleteId:
        athlete?.id || "",

      athleteName:
        athlete?.name ||
        "미지정",

      grade:
        athlete?.grade ||
        "",

      university:
        athlete?.university ||
        "",

      eventId:
        event?.id ||
        "",

      eventName:
        event?.name ||
        "미지정",

      videoName:
        video?.dataset.videoName ||
        "영상",

      score,

      metrics:
        createReportMetrics(
          score
        ),

      angles:
        angleSeries
          .slice(-800),

      keyFrames:
        keyFrames
          .slice(-8),

      feedback:
        $("analysisFeedbackList")
          ?.innerText ||
        ""

    };


    state.records.push(
      record
    );


    if (
      state.records.length >
      100
    ) {

      state.records =
        state.records.slice(
          -100
        );

    }


    saveState();

    renderRecords();

    renderDashboard();


    return record;

  }


  function createReportMetrics(
    score
  ) {

    return {

      technique:
        score,

      stability:
        Math.max(
          50,
          score - 2
        ),

      symmetry:
        score,

      power:
        Math.max(
          50,
          score - 5
        ),

      agility:
        Math.max(
          50,
          score - 3
        ),

      efficiency:
        Math.max(
          50,
          score - 1
        )

    };

  }


  /* =======================================================
     분석 기록
  ======================================================= */

  function renderRecords() {

    const list =
      $("recordList");


    const count =
      $("recordCount");


    if (count) {

      count.textContent =
        state.records.length;

    }


    if (!list) return;


    if (!state.records.length) {

      list.innerHTML = `
        <div class="empty-state">
          저장된 분석 기록이 없습니다.
        </div>
      `;

      return;

    }


    list.innerHTML =
      state.records
        .slice()
        .reverse()
        .map(
          (record) => {

            return `

              <div class="record-item">

                <div>

                  <strong>
                    ${escapeHTML(
                      record.athleteName
                    )}
                  </strong>

                  <div class="muted">

                    ${escapeHTML(
                      record.eventName
                    )}

                    ·

                    ${record.score}
                    점

                    ·

                    ${formatDate(
                      record.date
                    )}

                  </div>

                </div>


                <button
                  class="secondary-button"
                  data-open-report="${record.id}">

                  리포트

                </button>

              </div>

            `;

          }
        )
        .join("");


    document
      .querySelectorAll(
        "[data-open-report]"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              openReport(
                button.dataset
                  .openReport
              );

            }
          );

        }
      );

  }


  /* =======================================================
     대시보드
  ======================================================= */

  function renderDashboard() {

    const records =
      state.records;


    if ($("dashboardAnalysisCount")) {

      $("dashboardAnalysisCount")
        .textContent =
        records.length;

    }


    if ($("dashboardRecentCount")) {

      $("dashboardRecentCount")
        .textContent =
        Math.min(
          records.length,
          5
        );

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
        : "--";


    if ($("dashboardAverageScore")) {

      $("dashboardAverageScore")
        .textContent =
        average;

    }


    const recent =
      $("dashboardRecentList");


    if (!recent) return;


    if (!records.length) {

      recent.innerHTML = `
        <div class="empty-state">
          아직 분석 기록이 없습니다.
        </div>
      `;

    } else {

      recent.innerHTML =
        records
          .slice(-5)
          .reverse()
          .map(
            (record) => {

              return `

                <div class="record-item">

                  <strong>
                    ${escapeHTML(
                      record.athleteName
                    )}
                  </strong>

                  <span>
                    ${escapeHTML(
                      record.eventName
                    )}

                    ·

                    ${record.score}점
                  </span>

                </div>

              `;

            }
          )
          .join("");

    }


    renderDashboardRadar();

  }


  function renderDashboardRadar() {

    if (
      typeof window.Chart ===
      "undefined"
    ) {

      return;

    }


    const canvas =
      $("dashboardRadarCanvas");


    if (!canvas) return;


    const latest =
      state.records[
        state.records.length -
          1
      ];


    const metrics =
      latest?.metrics ||
      createReportMetrics(
        0
      );


    if (dashboardRadar) {

      dashboardRadar.destroy();

    }


    dashboardRadar =
      new Chart(
        canvas.getContext("2d"),
        {

          type:
            "radar",

          data: {

            labels: [

              "기술",

              "안정성",

              "대칭성",

              "파워",

              "민첩성",

              "효율"

            ],

            datasets: [

              {

                label:
                  "현재",

                data: [

                  metrics.technique,

                  metrics.stability,

                  metrics.symmetry,

                  metrics.power,

                  metrics.agility,

                  metrics.efficiency

                ],

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

                min: 0,

                max: 100,

                ticks: {

                  display:
                    false

                },

                grid: {

                  color:
                    "#29435d"

                },

                angleLines: {

                  color:
                    "#29435d"

                },

                pointLabels: {

                  color:
                    "#dce8f4"

                }

              }

            },

            plugins: {

              legend: {

                labels: {

                  color:
                    "#dce8f4"

                }

              }

            }

          }

        }

      );

  }


  /* =======================================================
     리포트
  ======================================================= */

  function openReport(
    recordId
  ) {

    const record =
      state.records.find(
        (item) =>
          item.id ===
          recordId
      );


    if (!record) {

      showToast(
        "리포트를 찾을 수 없습니다."
      );

      return;

    }


    state.lastReport =
      record;


    saveState();


    fillReport(
      record
    );


    openPage(
      "report"
    );

  }


  function fillReport(
    record
  ) {

    $("reportEmptyState")
      ?.classList.add(
        "hidden"
      );


    $("reportContent")
      ?.classList.remove(
        "hidden"
      );


    const set =
      (
        id,
        value
      ) => {

        if ($(id)) {

          $(id).textContent =
            value ?? "-";

        }

      };


    set(
      "reportAthleteName",
      record.athleteName
    );

    set(
      "reportGrade",
      record.grade ||
        "-"
    );

    set(
      "reportEventName",
      record.eventName
    );

    set(
      "reportUniversity",
      record.university ||
        "-"
    );

    set(
      "reportDate",
      formatDate(
        record.date
      )
    );

    set(
      "reportVideoName",
      record.videoName
    );

    set(
      "reportTotalScore",
      record.score
    );


    let grade =
      "D";


    if (
      record.score >=
      90
    ) {

      grade =
        "A";

    } else if (
      record.score >=
      80
    ) {

      grade =
        "B";

    } else if (
      record.score >=
      70
    ) {

      grade =
        "C";

    }


    set(
      "reportGradeScore",
      grade
    );


    renderReportKeyFrames(
      record
    );


    renderReportFeedback(
      record
    );


    renderTrainingRecommendations(
      record
    );


    renderReportCharts(
      record
    );


    renderUniversityAdvice(
      record
    );

  }


  /* =======================================================
     리포트 핵심 프레임
  ======================================================= */

  function renderReportKeyFrames(
    record
  ) {

    const container =
      $("reportKeyFrames");


    if (!container) return;


    const frames =
      record.keyFrames ||
      [];


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
          (frame) => {

            return `

              <div class="report-frame">

                <img
                  src="${frame.image}"
                  alt="분석 프레임">

                <strong>

                  ${formatTime(
                    frame.time
                  )}

                  ·

                  ${escapeHTML(
                    frame.label
                  )}

                </strong>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     리포트 피드백
  ======================================================= */

  function renderReportFeedback(
    record
  ) {

    const container =
      $("reportFeedbackList");


    if (!container) return;


    const feedback =
      String(
        record.feedback ||
        ""
      )
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);


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
        .map(
          (item) => {

            return `

              <div class="feedback-item">

                <p>
                  ${escapeHTML(
                    item
                  )}
                </p>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     추천훈련
  ======================================================= */

  function renderTrainingRecommendations(
    record
  ) {

    const container =
      $("trainingRecommendationList");


    if (!container) return;


    const eventId =
      record.eventId;


    const trainingDatabase =
      window.PE_TRAINING ||
      {};


    const trainings =
      trainingDatabase[
        eventId
      ] ||
      [];


    if (!trainings.length) {

      container.innerHTML = `
        <div class="empty-state">
          해당 종목의 추천훈련 데이터가 없습니다.
        </div>
      `;

      return;

    }


    const score =
      Number(
        record.score || 0
      );


    let limit =
      6;


    if (score < 75) {

      limit =
        8;

    } else if (
      score >= 90
    ) {

      limit =
        4;

    }


    container.innerHTML =
      trainings
        .slice(
          0,
          limit
        )
        .map(
          (training) => {

            const [
              name,
              category,
              description
            ] = training;


            return `

              <div
                class="training-item">

                <span class="tag">
                  ${escapeHTML(
                    category
                  )}
                </span>

                <strong>
                  ${escapeHTML(
                    name
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    description
                  )}
                </p>

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     리포트 그래프
  ======================================================= */

  function renderReportCharts(
    record
  ) {

    if (
      typeof window.Chart ===
      "undefined"
    ) {

      return;

    }


    const metrics =
      record.metrics ||
      createReportMetrics(
        record.score
      );


    if (reportRadar) {

      reportRadar.destroy();

    }


    reportRadar =
      new Chart(
        $("reportRadarCanvas")
          .getContext("2d"),
        {

          type:
            "radar",

          data: {

            labels: [

              "기술",

              "안정성",

              "대칭성",

              "파워",

              "민첩성",

              "효율"

            ],

            datasets: [

              {

                label:
                  "현재 퍼포먼스",

                data: [

                  metrics.technique,

                  metrics.stability,

                  metrics.symmetry,

                  metrics.power,

                  metrics.agility,

                  metrics.efficiency

                ],

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

                min: 0,

                max: 100,

                ticks: {

                  display:
                    false

                },

                grid: {

                  color:
                    "#29435d"

                },

                angleLines: {

                  color:
                    "#29435d"

                },

                pointLabels: {

                  color:
                    "#dce8f4"

                }

              }

            },

            plugins: {

              legend: {

                labels: {

                  color:
                    "#fff"

                }

              }

            }

          }

        }

      );


    if (reportAngleChart) {

      reportAngleChart.destroy();

    }


    const angles =
      record.angles ||
      [];


    reportAngleChart =
      new Chart(
        $("reportAngleCanvas")
          .getContext("2d"),
        {

          type:
            "line",

          data: {

            labels:
              angles.map(
                (frame) =>
                  Number(
                    frame.time
                  ).toFixed(2)
              ),

            datasets: [

              {

                label:
                  "왼쪽 무릎",

                data:
                  angles.map(
                    (frame) =>
                      frame.leftKnee
                  ),

                tension:
                  0.2

              },

              {

                label:
                  "오른쪽 무릎",

                data:
                  angles.map(
                    (frame) =>
                      frame.rightKnee
                  ),

                tension:
                  0.2

              }

            ]

          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false

          }

        }

      );

  }


  /* =======================================================
     대학 / 전형
  ======================================================= */

  function renderUniversityAdvice(
    record
  ) {

    const container =
      $("reportUniversityAdvice");


    if (!container) return;


    const athlete =
      getAthlete(
        record.athleteId
      );


    const university =
      record.university ||
      athlete?.university ||
      "";


    container.innerHTML = `

      <div class="feedback-item">

        <strong>
          목표 대학
        </strong>

        <p>
          ${
            university
              ? escapeHTML(
                  university
                )
              : "선수 프로필에서 목표 대학을 입력하세요."
          }
        </p>

      </div>


      <div class="feedback-item">

        <strong>
          실기 목표 관리
        </strong>

        <p>
          현재 기록과 목표 기록을 함께 입력하면
          종목별 부족한 영역을 추적할 수 있습니다.
        </p>

      </div>


      <div class="feedback-item">

        <strong>
          모집요강 확인
        </strong>

        <p>
          대학별 전형과 실기 반영 방식은
          해당 연도 공식 모집요강을 최종 확인하세요.
        </p>

      </div>

    `;

  }


  /* =======================================================
     비교
  ======================================================= */

  function renderComparisonOptions() {

    const selectA =
      $("compareA");

    const selectB =
      $("compareB");


    if (
      !selectA ||
      !selectB
    ) {

      return;

    }


    const options =
      state.records
        .map(
          (record) => {

            return `

              <option
                value="${record.id}">

                ${escapeHTML(
                  record.athleteName
                )}

                ·

                ${escapeHTML(
                  record.eventName
                )}

                ·

                ${record.score}점

                ·

                ${formatDate(
                  record.date
                )}

              </option>

            `;

          }
        )
        .join("");


    selectA.innerHTML =
      options;

    selectB.innerHTML =
      options;


    if (
      state.records.length >
      1
    ) {

      selectA.value =
        state.records[
          state.records.length -
            2
        ].id;

      selectB.value =
        state.records[
          state.records.length -
            1
        ].id;

    }

  }


  function compareRecords() {

    const idA =
      $("compareA")
        ?.value;


    const idB =
      $("compareB")
        ?.value;


    const recordA =
      state.records.find(
        (record) =>
          record.id ===
          idA
      );


    const recordB =
      state.records.find(
        (record) =>
          record.id ===
          idB
      );


    if (
      !recordA ||
      !recordB
    ) {

      showToast(
        "비교할 분석 기록 2개를 선택하세요."
      );

      return;

    }


    renderComparisonCanvas(
      "compareCanvasA",
      recordA
    );


    renderComparisonCanvas(
      "compareCanvasB",
      recordB
    );


    $("compareTitleA")
      .textContent =
      `A · ${recordA.athleteName} · ${recordA.score}점`;


    $("compareTitleB")
      .textContent =
      `B · ${recordB.athleteName} · ${recordB.score}점`;


    const difference =
      recordA.score -
      recordB.score;


    $("compareResult")
      .innerHTML = [

        [
          "점수 차이",
          `${Math.abs(
            difference
          )}점`
        ],

        [
          "A 점수",
          recordA.score
        ],

        [
          "B 점수",
          recordB.score
        ],

        [
          "판정",
          difference > 0
            ? "A 우세"
            : difference < 0
              ? "B 우세"
              : "동일"
        ]

      ]
      .map(
        ([label, value]) => {

          return `

            <div>

              <span>
                ${label}
              </span>

              <strong>
                ${value}
              </strong>

            </div>

          `;

        }
      )
      .join("");

  }


  function renderComparisonCanvas(
    canvasId,
    record
  ) {

    const canvas =
      $(canvasId);


    if (!canvas) return;


    const width =
      900;

    const height =
      450;


    canvas.width =
      width;

    canvas.height =
      height;


    const context =
      canvas.getContext(
        "2d"
      );


    context.fillStyle =
      "#02070d";

    context.fillRect(
      0,
      0,
      width,
      height
    );


    const data =
      record.angles ||
      [];


    if (
      data.length <
      2
    ) {

      context.fillStyle =
        "#71879c";

      context.font =
        "18px sans-serif";

      context.fillText(
        "관절각 데이터가 부족합니다.",
        30,
        50
      );

      return;

    }


    const drawLine =
      (
        key,
        stroke
      ) => {

        context.strokeStyle =
          stroke;

        context.lineWidth =
          4;

        context.beginPath();


        data.forEach(
          (
            frame,
            index
          ) => {

            const x =
              index /
              (data.length - 1) *
              width;


            const value =
              Number(
                frame[key]
              ) || 0;


            const y =
              height -
              (
                value /
                190
              ) *
              height;


            if (
              index === 0
            ) {

              context.moveTo(
                x,
                y
              );

            } else {

              context.lineTo(
                x,
                y
              );

            }

          }
        );


        context.stroke();

      };


    drawLine(
      "leftKnee",
      "#20a7ff"
    );


    drawLine(
      "rightKnee",
      "#ffd43b"
    );

  }


  /* =======================================================
     상태
  ======================================================= */

  function setAnalysisStatus(
    status
  ) {

    const element =
      $("analysisStatusText");


    if (element) {

      element.textContent =
        status;

    }


    const system =
      $("systemStatusText");


    if (system) {

      system.textContent =
        status ===
        "ANALYZING"
          ? "AI ANALYZING"
          : "SYSTEM READY";

    }

  }


  function writeAnalysisLog(
    message
  ) {

    const log =
      $("analysisLog");


    if (!log) return;


    log.textContent =
      message;

  }


  /* =======================================================
     데이터 백업
  ======================================================= */

  function exportData() {

    const data =
      JSON.stringify(
        state,
        null,
        2
      );


    const blob =
      new Blob(
        [data],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;

    link.download =
      "seolcheon_pe_backup.json";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );


    showToast(
      "백업 파일을 생성했습니다."
    );

  }


  /* =======================================================
     전체 데이터 삭제
  ======================================================= */

  function clearAnalysisData() {

    if (
      !confirm(
        "모든 분석 기록을 삭제할까요?\n선수 정보는 삭제되지 않습니다."
      )
    ) {

      return;

    }


    state.records = [];

    state.lastReport =
      null;


    saveState();

    renderAll();

    renderComparisonOptions();


    $("reportEmptyState")
      ?.classList.remove(
        "hidden"
      );


    $("reportContent")
      ?.classList.add(
        "hidden"
      );


    showToast(
      "분석 기록을 삭제했습니다."
    );

  }


  /* =======================================================
     설정
  ======================================================= */

  function setupSettings() {

    const skeleton =
      $("settingsSkeletonOption");


    const angle =
      $("settingsAngleOption");


    const trajectoryOption =
      $("settingsTrajectoryOption");


    if (skeleton) {

      skeleton.addEventListener(
        "change",
        () => {

          if ($("skeletonOption")) {

            $("skeletonOption")
              .checked =
              skeleton.checked;

          }

        }
      );

    }


    if (angle) {

      angle.addEventListener(
        "change",
        () => {

          if ($("angleOption")) {

            $("angleOption")
              .checked =
              angle.checked;

          }

        }
      );

    }


    if (
      trajectoryOption
    ) {

      trajectoryOption
        .addEventListener(
          "change",
          () => {

            if (
              $("trajectoryOption")
            ) {

              $("trajectoryOption")
                .checked =
                trajectoryOption.checked;

            }

          }
        );

    }

  }


  /* =======================================================
     이벤트 연결
  ======================================================= */

  function bindEvents() {

    /* 페이지 */

    document
      .querySelectorAll(
        ".nav-button"
      )
      .forEach(
        (button) => {

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


    /* 모바일 메뉴 */

    $("mobileMenuButton")
      ?.addEventListener(
        "click",
        () => {

          $("sidebar")
            ?.classList.toggle(
              "open"
            );

        }
      );


    /* 선수 */

    $("athleteForm")
      ?.addEventListener(
        "submit",
        createAthlete
      );


    /* 새 분석 */

    $("dashboardStartAnalysisButton")
      ?.addEventListener(
        "click",
        () => {

          openPage(
            "analysis"
          );

        }
      );


    $("reportEmptyAnalysisButton")
      ?.addEventListener(
        "click",
        () => {

          openPage(
            "analysis"
          );

        }
      );


    /* 종목 */

    $("analysisEventSelect")
      ?.addEventListener(
        "change",
        (event) => {

          selectEvent(
            event.target.value
          );

        }
      );


    /* 영상 선택 */

    $("selectVideoButton")
      ?.addEventListener(
        "click",
        () => {

          $("videoFileInput")
            ?.click();

        }
      );


    $("videoFileInput")
      ?.addEventListener(
        "change",
        (event) => {

          const file =
            event.target
              .files?.[0];

          if (file) {

            loadVideo(
              file
            );

          }

        }
      );


    /* 영상 재생 */

    $("playPauseButton")
      ?.addEventListener(
        "click",
        () => {

          const video =
            $("analysisVideo");


          if (!video) return;


          if (
            video.paused
          ) {

            video
              .play()
              .catch(
                () => {}
              );

          } else {

            video.pause();

          }

        }
      );


    /* 프레임 */

    $("previousFrameButton")
      ?.addEventListener(
        "click",
        () => {

          seekVideo(
            -1 / 30
          );

        }
      );


    $("nextFrameButton")
      ?.addEventListener(
        "click",
        () => {

          seekVideo(
            1 / 30
          );

        }
      );


    /* 타임라인 */

    $("videoTimeline")
      ?.addEventListener(
        "input",
        (event) => {

          const video =
            $("analysisVideo");


          if (video) {

            video.currentTime =
              Number(
                event.target
                  .value
              );

          }

        }
      );


    /* 속도 */

    $("playbackSpeedSelect")
      ?.addEventListener(
        "change",
        (event) => {

          const video =
            $("analysisVideo");


          if (video) {

            video.playbackRate =
              Number(
                event.target
                  .value
              );

          }

        }
      );


    /* 분석 */

    $("startAnalysisButton")
      ?.addEventListener(
        "click",
        startAnalysis
      );


    $("stopAnalysisButton")
      ?.addEventListener(
        "click",
        () =>
          stopAnalysis(
            false
          )
      );


    $("captureFrameButton")
      ?.addEventListener(
        "click",
        () =>
          captureKeyFrame(
            true
          )
      );


    $("resetAnalysisButton")
      ?.addEventListener(
        "click",
        () => {

          if (
            processing
          ) {

            stopAnalysis(
              true
            );

          }


          const video =
            $("analysisVideo");


          if (video) {

            video.pause();

            video.removeAttribute(
              "src"
            );

            video.load();

          }


          $("videoEmptyState")
            ?.style.setProperty(
              "display",
              "grid"
            );


          trajectory = [];

          angleSeries = [];

          keyFrames = [];

          lastPoseResults =
            null;


          clearCanvas(
            "poseCanvas"
          );

          clearCanvas(
            "trajectoryCanvas"
          );


          renderKeyFrames();

          setAnalysisStatus(
            "STANDBY"
          );

          writeAnalysisLog(
            "대기 중"
          );


          if ($("finishReportButton")) {

            $("finishReportButton")
              .disabled =
              true;

          }


          $("analysisSummaryPanel")
            ?.classList.add(
              "hidden"
            );


          showToast(
            "분석 화면을 초기화했습니다."
          );

        }
      );


    /* 리포트 */

    $("finishReportButton")
      ?.addEventListener(
        "click",
        () => {

          if (
            currentAnalysisId
          ) {

            openReport(
              currentAnalysisId
            );

          } else if (
            state.lastReport
          ) {

            openReport(
              state.lastReport.id
            );

          } else {

            showToast(
              "리포트가 없습니다."
            );

          }

        }
      );


    $("printReportButton")
      ?.addEventListener(
        "click",
        () => {

          window.print();

        }
      );


    /* 비교 */

    $("compareButton")
      ?.addEventListener(
        "click",
        compareRecords
      );


    /* 백업 */

    $("exportDataButton")
      ?.addEventListener(
        "click",
        exportData
      );


    /* 삭제 */

    $("clearAnalysisDataButton")
      ?.addEventListener(
        "click",
        clearAnalysisData
      );

  }


  /* =======================================================
     전체 렌더링
  ======================================================= */

  function renderAll() {

    renderAthletes();

    renderEvents();

    renderRecords();

    renderDashboard();

    renderComparisonOptions();

  }


  /* =======================================================
     시계
  ======================================================= */

  function startClock() {

    const clock =
      $("clock");


    if (!clock) return;


    const update =
      () => {

        clock.textContent =
          new Date()
            .toLocaleTimeString(
              "ko-KR"
            );

      };


    update();

    setInterval(
      update,
      500
    );

  }


  /* =======================================================
     캔버스 resize
  ======================================================= */

  function setupResize() {

    window.addEventListener(
      "resize",
      () => {

        resizeCanvases();

      }
    );

  }


  /* =======================================================
     초기화
  ======================================================= */

  function initializeApp() {

    bindEvents();

    setupSettings();

    setupVideo();

    initializePose();

    renderAll();

    startClock();

    resizeCanvases();


    if (
      state.lastReport
    ) {

      currentAnalysisId =
        state.lastReport.id;

    }


    console.log(
      "설천고 PE PERFORMANCE LAB READY"
    );

  }


  /* =======================================================
     DOM READY
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeApp
    );

  } else {

    initializeApp();

  }

})();