/* =========================================================
   설천고 PE PERFORMANCE LAB
   FINAL BIOMECHANICS ENGINE
   app.js
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     1. GLOBAL STATE
  ======================================================= */

  const STORAGE_KEY = "seolcheon_pe_performance_final_v4";

  let state = {
    athletes: [],
    records: [],
    lastReport: null,

    currentAthleteId: null,
    currentEventId: null,

    collegeGoal: {
      university: "",
      major: "",
      admission: "",
      targetGrade: "",
      targetScores: {}
    }
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
    console.warn("데이터 불러오기 실패", error);
  }


  /* =======================================================
     2. ANALYSIS ENGINE STATE
  ======================================================= */

  let pose = null;

  let processing = false;
  let animationFrame = null;

  let currentVideo = null;
  let currentVideoURL = null;

  let currentAnalysisId = null;

  let lastPoseResults = null;

  let trajectory = [];
  let angleSeries = [];
  let keyFrames = [];

  let analysisStartTime = 0;
  let analysisFrame = 0;

  let angleChart = null;
  let dashboardRadar = null;
  let reportRadar = null;
  let reportAngleChart = null;
  let performanceChart = null;


  /* =======================================================
     3. DOM UTIL
  ======================================================= */

  const $ = (id) =>
    document.getElementById(id);


  function $$(
    selector
  ) {
    return [
      ...document.querySelectorAll(selector)
    ];
  }


  /* =======================================================
     4. STORAGE
  ======================================================= */

  function saveState() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );

    } catch (error) {

      console.error(
        "저장 실패",
        error
      );

      showToast(
        "데이터 저장에 실패했습니다."
      );

    }

  }


  /* =======================================================
     5. TOAST
  ======================================================= */

  function showToast(
    message
  ) {

    let toast =
      $("toast");

    if (!toast) {

      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "toast";

      toast.className =
        "toast";

      document.body.appendChild(
        toast
      );

    }

    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(
        () => {
          toast.classList.remove(
            "show"
          );
        },
        2200
      );

  }


  /* =======================================================
     6. ESCAPE HTML
  ======================================================= */

  function escapeHTML(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  /* =======================================================
     7. TIME
  ======================================================= */

  function formatTime(
    seconds
  ) {

    seconds =
      Number(seconds) || 0;

    const minutes =
      Math.floor(
        seconds / 60
      );

    const remain =
      seconds % 60;

    return (
      String(minutes)
        .padStart(2, "0") +
      ":" +
      remain
        .toFixed(2)
        .padStart(5, "0")
    );

  }


  function formatDate(
    iso
  ) {

    return new Date(
      iso || Date.now()
    ).toLocaleString(
      "ko-KR"
    );

  }


  /* =======================================================
     8. ID
  ======================================================= */

  function createId(
    prefix = "SC"
  ) {

    return (
      prefix +
      "_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );

  }


  /* =======================================================
     9. MATH
  ======================================================= */

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


  function average(
    values
  ) {

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
        (a, b) =>
          a + Number(b),
        0
      ) /
      valid.length
    );

  }


  function distance(
    a,
    b
  ) {

    if (!a || !b) {
      return 0;
    }

    return Math.sqrt(
      Math.pow(
        a.x - b.x,
        2
      ) +
      Math.pow(
        a.y - b.y,
        2
      )
    );

  }


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


  /* =======================================================
     10. JOINT ANGLE
  ======================================================= */

  function calculateAngle(
    a,
    b,
    c
  ) {

    if (!a || !b || !c) {
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

    const denominator =
      Math.hypot(
        ab.x,
        ab.y
      ) *
      Math.hypot(
        cb.x,
        cb.y
      );

    if (!denominator) {
      return null;
    }

    let cosine =
      (
        ab.x * cb.x +
        ab.y * cb.y
      ) /
      denominator;

    cosine =
      clamp(
        cosine,
        -1,
        1
      );

    return (
      Math.acos(
        cosine
      ) *
      180 /
      Math.PI
    );

  }


  /* =======================================================
     11. MEDIAPIPE LANDMARK INDEX
  ======================================================= */

  const LANDMARK = {

    NOSE: 0,

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
    RIGHT_ANKLE: 28

  };


  /* =======================================================
     12. LANDMARK SAFE GET
  ======================================================= */

  function landmark(
    landmarks,
    index
  ) {

    const point =
      landmarks?.[index];

    if (
      !point ||
      (
        point.visibility !== undefined &&
        point.visibility < 0.25
      )
    ) {

      return null;

    }

    return point;

  }


  /* =======================================================
     13. POSE METRICS
  ======================================================= */

  function calculatePoseMetrics(
    landmarks
  ) {

    const ls =
      landmark(
        landmarks,
        LANDMARK.LEFT_SHOULDER
      );

    const rs =
      landmark(
        landmarks,
        LANDMARK.RIGHT_SHOULDER
      );

    const le =
      landmark(
        landmarks,
        LANDMARK.LEFT_ELBOW
      );

    const re =
      landmark(
        landmarks,
        LANDMARK.RIGHT_ELBOW
      );

    const lw =
      landmark(
        landmarks,
        LANDMARK.LEFT_WRIST
      );

    const rw =
      landmark(
        landmarks,
        LANDMARK.RIGHT_WRIST
      );

    const lh =
      landmark(
        landmarks,
        LANDMARK.LEFT_HIP
      );

    const rh =
      landmark(
        landmarks,
        LANDMARK.RIGHT_HIP
      );

    const lk =
      landmark(
        landmarks,
        LANDMARK.LEFT_KNEE
      );

    const rk =
      landmark(
        landmarks,
        LANDMARK.RIGHT_KNEE
      );

    const la =
      landmark(
        landmarks,
        LANDMARK.LEFT_ANKLE
      );

    const ra =
      landmark(
        landmarks,
        LANDMARK.RIGHT_ANKLE
      );


    const shoulderCenter =
      midpoint(
        ls,
        rs
      );

    const hipCenter =
      midpoint(
        lh,
        rh
      );

    const kneeCenter =
      midpoint(
        lk,
        rk
      );

    const ankleCenter =
      midpoint(
        la,
        ra
      );


    const leftKnee =
      calculateAngle(
        lh,
        lk,
        la
      );

    const rightKnee =
      calculateAngle(
        rh,
        rk,
        ra
      );


    const leftHip =
      calculateAngle(
        ls,
        lh,
        lk
      );

    const rightHip =
      calculateAngle(
        rs,
        rh,
        rk
      );


    const leftElbow =
      calculateAngle(
        ls,
        le,
        lw
      );

    const rightElbow =
      calculateAngle(
        rs,
        re,
        rw
      );


    let trunkAngle =
      null;


    if (
      shoulderCenter &&
      hipCenter
    ) {

      const dx =
        hipCenter.x -
        shoulderCenter.x;

      const dy =
        hipCenter.y -
        shoulderCenter.y;

      trunkAngle =
        Math.abs(
          90 -
          Math.abs(
            Math.atan2(
              dy,
              dx
            ) *
            180 /
            Math.PI
          )
        );

    }


    const kneeSymmetry =
      Number.isFinite(leftKnee) &&
      Number.isFinite(rightKnee)

        ? clamp(
            100 -
            Math.abs(
              leftKnee -
              rightKnee
            ),
            0,
            100
          )

        : 75;


    const hipSymmetry =
      Number.isFinite(leftHip) &&
      Number.isFinite(rightHip)

        ? clamp(
            100 -
            Math.abs(
              leftHip -
              rightHip
            ),
            0,
            100
          )

        : 75;


    const elbowSymmetry =
      Number.isFinite(leftElbow) &&
      Number.isFinite(rightElbow)

        ? clamp(
            100 -
            Math.abs(
              leftElbow -
              rightElbow
            ),
            0,
            100
          )

        : 75;


    const symmetry =
      Math.round(
        average([
          kneeSymmetry,
          hipSymmetry,
          elbowSymmetry
        ])
      );


    let alignment = 75;


    if (
      shoulderCenter &&
      hipCenter
    ) {

      const centerOffset =
        Math.abs(
          shoulderCenter.x -
          hipCenter.x
        );

      alignment =
        clamp(
          100 -
          centerOffset * 160,
          0,
          100
        );

    }


    let stability = 75;


    if (
      angleSeries.length > 5
    ) {

      const recent =
        angleSeries
          .slice(-20)
          .map(
            item =>
              item.trunk
          )
          .filter(
            Number.isFinite
          );


      if (recent.length) {

        const mean =
          average(
            recent
          );

        const variance =
          average(
            recent.map(
              value =>
                Math.pow(
                  value - mean,
                  2
                )
            )
          );

        const standardDeviation =
          Math.sqrt(
            variance
          );

        stability =
          clamp(
            100 -
            standardDeviation * 5,
            0,
            100
          );

      }

    }


    const efficiency =
      Math.round(
        (
          alignment +
          symmetry
        ) / 2
      );


    const total =
      Math.round(
        stability * 0.28 +
        alignment * 0.25 +
        symmetry * 0.22 +
        efficiency * 0.25
      );


    return {

      leftKnee,
      rightKnee,

      leftHip,
      rightHip,

      leftElbow,
      rightElbow,

      trunkAngle,

      symmetry,

      alignment,

      stability,

      efficiency,

      total,

      shoulderCenter,
      hipCenter,
      kneeCenter,
      ankleCenter

    };

  }


  /* =======================================================
     14. PAGE SYSTEM
  ======================================================= */

  function openPage(
    pageName
  ) {

    $$(".page").forEach(
      page => {

        page.classList.toggle(
          "active",
          page.id ===
            `page-${pageName}`
        );

      }
    );


    $$(".nav-button").forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
            pageName
        );

      }
    );


    $$(".nav-btn").forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
            pageName
        );

      }
    );


    const titles = {

      dashboard:
        "대시보드",

      athletes:
        "선수 관리",

      events:
        "체대입시",

      analysis:
        "영상 자세분석",

      comparison:
        "영상 비교",

      records:
        "분석 기록",

      report:
        "리포트",

      settings:
        "설정"

    };


    if ($("pageTitle")) {

      $("pageTitle").textContent =
        titles[pageName] ||
        pageName;

    }


    if ($("page-title")) {

      $("page-title").textContent =
        titles[pageName] ||
        pageName;

    }


    if (
      pageName ===
      "comparison"
    ) {

      if (
        typeof renderComparisonOptions ===
        "function"
      ) {

        renderComparisonOptions();

      }

    }


    if (
      pageName ===
      "report"
    ) {

      if (
        typeof renderReportPage ===
        "function"
      ) {

        renderReportPage();

      }

    }


    if (
      pageName ===
      "events"
    ) {

      if (
        typeof renderEventsPage ===
        "function"
      ) {

        renderEventsPage();

      }

    }

  }


  /* =======================================================
     15. ATHLETE
  ======================================================= */

  function getAthlete(
    id
  ) {

    return state.athletes.find(
      athlete =>
        athlete.id === id
    );

  }


  function renderAthletes() {

    const list =
      $("athleteList") ||
      $("athlete-list");

    const count =
      $("athleteCountBadge");

    if (count) {

      count.textContent =
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

      updateAthleteSelect();

      return;

    }


    list.innerHTML =
      state.athletes
        .map(
          athlete => `

          <div class="athlete-item">

            <div>

              <strong>
                ${escapeHTML(
                  athlete.name
                )}
              </strong>

              <div class="muted">

                ${escapeHTML(
                  athlete.grade ||
                  "-"
                )}

                ·

                ${escapeHTML(
                  athlete.sport ||
                  "-"
                )}

                · 목표 대학

                ${escapeHTML(
                  athlete.university ||
                  athlete.targetUniversity ||
                  "-"
                )}

              </div>

            </div>

            <button
              class="secondary-button"
              data-delete-athlete="${athlete.id}"
            >
              삭제
            </button>

          </div>

        `
        )
        .join("");


    $$(
      "[data-delete-athlete]"
    ).forEach(
      button => {

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
                athlete =>
                  athlete.id !== id
              );

            state.records =
              state.records.filter(
                record =>
                  record.athleteId !==
                  id
              );

            saveState();

            renderAll();

            showToast(
              "선수가 삭제되었습니다."
            );

          }
        );

      }
    );


    updateAthleteSelect();

  }


  function updateAthleteSelect() {

    const selects =
      document.querySelectorAll(
        "#athleteSelect, #analysisAthlete, #comparisonAthlete, #reportAthlete, [data-athlete-select]"
      );


    selects.forEach(
      select => {

        const oldValue =
          select.value;

        const first =
          select.options?.[0];

        select.innerHTML = "";

        const placeholder =
          document.createElement(
            "option"
          );

        placeholder.value = "";

        placeholder.textContent =
          "선수 선택";

        select.appendChild(
          placeholder
        );


        state.athletes.forEach(
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
          [...select.options]
            .some(
              option =>
                option.value ===
                oldValue
            )
        ) {

          select.value =
            oldValue;

        }

      }
    );

  }


  /* =======================================================
     16. ANALYSIS SCORE
  ======================================================= */

  function getAnalysisScore(
    metrics
  ) {

    return {

      total:
        Math.round(
          metrics.total || 0
        ),

      stability:
        Math.round(
          metrics.stability || 0
        ),

      alignment:
        Math.round(
          metrics.alignment || 0
        ),

      symmetry:
        Math.round(
          metrics.symmetry || 0
        ),

      efficiency:
        Math.round(
          metrics.efficiency || 0
        )

    };

  }


  /* =======================================================
     17. FEEDBACK
  ======================================================= */

  function generateFeedback(
    score
  ) {

    const feedback = [];


    if (
      score.symmetry < 80
    ) {

      feedback.push({
        type: "warning",
        title:
          "좌우 대칭 개선",
        text:
          "좌우 관절 움직임의 차이가 확인됩니다. 싱글레그 안정화와 좌우 균형 훈련을 우선 추천합니다."
      });

    } else {

      feedback.push({
        type: "good",
        title:
          "좌우 대칭 양호",
        text:
          "주요 관절의 좌우 움직임이 비교적 안정적입니다."
      });

    }


    if (
      score.alignment < 80
    ) {

      feedback.push({
        type: "warning",
        title:
          "기준선 정렬 개선",
        text:
          "머리-몸통-골반 중심선의 정렬을 확인하고 중심 안정화 훈련을 실시하세요."
      });

    } else {

      feedback.push({
        type: "good",
        title:
          "기준선 정렬 양호",
        text:
          "주요 중심선이 비교적 안정적으로 유지됩니다."
      });

    }


    if (
      score.stability < 80
    ) {

      feedback.push({
        type: "warning",
        title:
          "자세 안정성 개선",
        text:
          "동작 중 몸통 흔들림을 줄이기 위한 코어 안정화 훈련이 필요합니다."
      });

    } else {

      feedback.push({
        type: "good",
        title:
          "자세 안정성 양호",
        text:
          "동작 중 중심 흔들림이 비교적 적습니다."
      });

    }


    if (
      score.efficiency < 80
    ) {

      feedback.push({
        type: "warning",
        title:
          "동작 효율 개선",
        text:
          "관절 정렬과 좌우 협응을 함께 개선하면 동작 효율을 높일 수 있습니다."
      });

    }


    return feedback;

  }


  /* =======================================================
     18. COLLEGE ADMISSION TRAINING
  ======================================================= */

  const TRAINING_DATABASE = {

    "제자리멀리뛰기": [

      {
        title:
          "스쿼트 점프",
        sets:
          "4세트",
        reps:
          "6회",
        rest:
          "90초",
        level:
          "중급",
        purpose:
          "하체 폭발력"
      },

      {
        title:
          "박스 점프",
        sets:
          "4세트",
        reps:
          "5회",
        rest:
          "90초",
        level:
          "중급",
        purpose:
          "수직·수평 폭발력"
      },

      {
        title:
          "싱글레그 바운드",
        sets:
          "3세트",
        reps:
          "8회",
        rest:
          "60초",
        level:
          "중급",
        purpose:
          "좌우 추진력"
      }

    ],


    "10m 달리기": [

      {
        title:
          "10m 스타트",
        sets:
          "6세트",
        reps:
          "1회",
        rest:
          "60초",
        level:
          "중급",
        purpose:
          "초기 가속"
      },

      {
        title:
          "벽 밀기 드릴",
        sets:
          "3세트",
        reps:
          "8회",
        rest:
          "45초",
        level:
          "초급",
        purpose:
          "가속 자세"
      }

    ],


    "20m 달리기": [

      {
        title:
          "20m 가속주",
        sets:
          "6세트",
        reps:
          "1회",
        rest:
          "90초",
        level:
          "중급",
        purpose:
          "가속 능력"
      },

      {
        title:
          "플라잉 20m",
        sets:
          "5세트",
        reps:
          "1회",
        rest:
          "120초",
        level:
          "중급",
        purpose:
          "최대속도"
      }

    ],


    "왕복달리기": [

      {
        title:
          "5-10-5 셔틀",
        sets:
          "5세트",
        reps:
          "1회",
        rest:
          "90초",
        level:
          "중급",
        purpose:
          "감속·재가속"
      },

      {
        title:
          "10m 왕복 인터벌",
        sets:
          "6세트",
        reps:
          "20초",
        rest:
          "60초",
        level:
          "중급",
        purpose:
          "반복 스피드"
      }

    ],


    "윗몸일으키기": [

      {
        title:
          "템포 싯업",
        sets:
          "3세트",
        reps:
          "15회",
        rest:
          "60초",
        level:
          "초급",
          purpose:
          "복근 반복능력"
      },

      {
        title:
          "데드버그",
        sets:
          "3세트",
        reps:
          "10회",
        rest:
          "45초",
        level:
          "초급",
        purpose:
          "코어 안정성"
      }

    ],


    "팔굽혀펴기": [

      {
        title:
          "푸시업",
        sets:
          "4세트",
        reps:
          "8~15회",
        rest:
          "60초",
        level:
          "초급",
        purpose:
          "상체 근지구력"
      },

      {
        title:
          "플랭크",
        sets:
          "3세트",
        reps:
          "40초",
        rest:
          "45초",
        level:
          "초급",
        purpose:
          "몸통 안정성"
      }

    ],


    "좌전굴": [

      {
        title:
          "햄스트링 스트레칭",
        sets:
          "3세트",
        reps:
          "30초",
        rest:
          "20초",
        level:
          "초급",
        purpose:
          "후면 유연성"
      },

      {
        title:
          "90/90 힙 모빌리티",
        sets:
          "3세트",
        reps:
          "8회",
        rest:
          "30초",
        level:
          "초급",
        purpose:
          "고관절 가동성"
      }

    ]

  };


  function getRecommendedTraining(
    eventName
  ) {

    return (
      TRAINING_DATABASE[
        eventName
      ] || [

        {
          title:
            "스쿼트",
          sets:
            "3세트",
          reps:
            "8~10회",
          rest:
            "90초",
          level:
            "초급",
          purpose:
            "하체 기본 근력"
        },

        {
          title:
            "코어 브레이싱",
          sets:
            "3세트",
          reps:
            "30~40초",
          rest:
            "45초",
          level:
            "초급",
          purpose:
            "중심 안정성"
        }

      ]
    );

  }


  /* =======================================================
     19. KEY FRAME DETECTION
  ======================================================= */

  function detectKeyFrame(
    metrics,
    time
  ) {

    if (!metrics) {
      return;
    }


    if (
      !state.settings?.autoKeyFrames &&
      state.settings?.autoKeyFrames !==
        undefined
    ) {

      return;

    }


    const previous =
      angleSeries[
        angleSeries.length - 1
      ];


    let movementChange =
      0;


    if (previous) {

      movementChange =
        Math.abs(
          (
            metrics.leftKnee ||
            0
          ) -
          (
            previous.leftKnee ||
            0
          )
        ) +

        Math.abs(
          (
            metrics.rightKnee ||
            0
          ) -
          (
            previous.rightKnee ||
            0
          )
        );

    }


    const importance =
      clamp(
        movementChange / 90,
        0,
        1
      );


    if (
      importance >= 0.18
    ) {

      keyFrames.push({

        time,

        frame:
          Math.round(
            time * 30
          ),

        importance,

        label:
          importance >= 0.65
            ? "핵심 동작"
            : importance >= 0.4
            ? "주요 변화"
            : "동작 변화",

        metrics

      });

    }


    keyFrames =
      keyFrames
        .sort(
          (a, b) =>
            b.importance -
            a.importance
        )
        .slice(
          0,
          8
        );

  }


  /* =======================================================
     20. TRAJECTORY
  ======================================================= */

  function addTrajectory(
    metrics,
    time
  ) {

    const center =
      metrics?.hipCenter;

    if (!center) {
      return;
    }

    trajectory.push({

      x:
        center.x,

      y:
        center.y,

      time

    });


    if (
      trajectory.length >
      1000
    ) {

      trajectory.shift();

    }

  }


  /* =======================================================
     21. POSE DRAW
  ======================================================= */

  function drawPose(
    results
  ) {

    const canvas =
      $("poseCanvas") ||
      $("pose-canvas");

    if (!canvas) {
      return;
    }


    const video =
      $("analysisVideo") ||
      $("analysis-video");

    if (!video) {
      return;
    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    canvas.width =
      video.videoWidth ||
      1280;

    canvas.height =
      video.videoHeight ||
      720;


    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    if (
      !results?.poseLandmarks
    ) {

      return;

    }


    const landmarks =
      results.poseLandmarks;


    if (
      state.settings
        .skeleton !== false
    ) {

      if (
        typeof drawConnectors ===
        "function" &&
        typeof POSE_CONNECTIONS !==
        "undefined"
      ) {

        drawConnectors(
          ctx,
          landmarks,
          POSE_CONNECTIONS,
          {
            color:
              "#20A7FF",
            lineWidth:
              3
          }
        );

      }


      if (
        typeof drawLandmarks ===
        "function"
      ) {

        drawLandmarks(
          ctx,
          landmarks,
          {
            color:
              "#6DE7FF",
            radius:
              4
          }
        );

      }

    }


    const metrics =
      calculatePoseMetrics(
        landmarks
      );


    drawBaseline(
      ctx,
      metrics,
      canvas
    );


    drawJointAngles(
      ctx,
      landmarks,
      metrics,
      canvas
    );


    updateAnalysisUI(
      metrics
    );


    if (
      processing
    ) {

      const time =
        video.currentTime ||
        0;


      angleSeries.push({

        time,

        leftKnee:
          metrics.leftKnee,

        rightKnee:
          metrics.rightKnee,

        leftHip:
          metrics.leftHip,

        rightHip:
          metrics.rightHip,

        leftElbow:
          metrics.leftElbow,

        rightElbow:
          metrics.rightElbow,

        trunk:
          metrics.trunkAngle,

        symmetry:
          metrics.symmetry

      });


      addTrajectory(
        metrics,
        time
      );


      detectKeyFrame(
        metrics,
        time
      );

    }

  }


  /* =======================================================
     22. BASELINE
  ======================================================= */

  function drawBaseline(
    ctx,
    metrics,
    canvas
  ) {

    if (
      state.settings
        .baseline === false
    ) {

      return;

    }


    if (
      !metrics.shoulderCenter ||
      !metrics.hipCenter
    ) {

      return;

    }


    const x =
      metrics.hipCenter.x *
      canvas.width;


    ctx.save();

    ctx.strokeStyle =
      "#FFD43B";

    ctx.lineWidth =
      2;

    ctx.setLineDash([
      8,
      7
    ]);


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


    ctx.setLineDash([]);


    ctx.strokeStyle =
      "#FF9F43";

    ctx.beginPath();

    ctx.moveTo(
      metrics.shoulderCenter.x *
        canvas.width,

      metrics.shoulderCenter.y *
        canvas.height
    );

    ctx.lineTo(
      metrics.hipCenter.x *
        canvas.width,

      metrics.hipCenter.y *
        canvas.height
    );

    ctx.stroke();


    ctx.restore();

  }


  /* =======================================================
     23. JOINT ANGLES DRAW
  ======================================================= */

  function drawJointAngles(
    ctx,
    landmarks,
    metrics,
    canvas
  ) {

    if (
      state.settings
        .angles === false
    ) {

      return;

    }


    const drawText =
      (
        text,
        point
      ) => {

        if (!point) {
          return;
        }

        ctx.save();

        ctx.font =
          "bold 16px Arial";

        ctx.fillStyle =
          "#FFFFFF";

        ctx.strokeStyle =
          "#07111F";

        ctx.lineWidth =
          4;

        ctx.strokeText(
          text,
          point.x *
            canvas.width +
            7,

          point.y *
            canvas.height -
            7
        );

        ctx.fillText(
          text,
          point.x *
            canvas.width +
            7,

          point.y *
            canvas.height -
            7
        );

        ctx.restore();

      };


    drawText(
      Number.isFinite(
        metrics.leftKnee
      )
        ? `${Math.round(
            metrics.leftKnee
          )}°`
        : "",
      landmark(
        landmarks,
        LANDMARK.LEFT_KNEE
      )
    );


    drawText(
      Number.isFinite(
        metrics.rightKnee
      )
        ? `${Math.round(
            metrics.rightKnee
          )}°`
        : "",
      landmark(
        landmarks,
        LANDMARK.RIGHT_KNEE
      )
    );

  }


  /* =======================================================
     24. ANALYSIS UI
  ======================================================= */

  function updateAnalysisUI(
    metrics
  ) {

    setText(
      "leftKneeAngle",
      formatAngle(
        metrics.leftKnee
      )
    );

    setText(
      "rightKneeAngle",
      formatAngle(
        metrics.rightKnee
      )
    );

    setText(
      "leftHipAngle",
      formatAngle(
        metrics.leftHip
      )
    );

    setText(
      "rightHipAngle",
      formatAngle(
        metrics.rightHip
      )
    );

    setText(
      "leftElbowAngle",
      formatAngle(
        metrics.leftElbow
      )
    );

    setText(
      "rightElbowAngle",
      formatAngle(
        metrics.rightElbow
      )
    );

    setText(
      "trunkAngle",
      formatAngle(
        metrics.trunkAngle
      )
    );

    setText(
      "symmetryScore",
      Math.round(
        metrics.symmetry
      ) +
      "%"
    );


    setText(
      "alignmentScore",
      Math.round(
        metrics.alignment
      )
    );


    setText(
      "stabilityScore",
      Math.round(
        metrics.stability
      )
    );


    setText(
      "efficiencyScore",
      Math.round(
        metrics.efficiency
      )
    );


    setText(
      "analysisTotalScore",
      Math.round(
        metrics.total
      ) +
      " / 100"
    );


    setBar(
      "stabilityBar",
      metrics.stability
    );

    setBar(
      "alignmentBar",
      metrics.alignment
    );

    setBar(
      "symmetryBar",
      metrics.symmetry
    );

    setBar(
      "efficiencyBar",
      metrics.efficiency
    );


    setText(
      "keyFrameCount",
      keyFrames.length
    );

  }


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

    if (!element) {
      return;
    }

    element.style.width =
      clamp(
        value,
        0,
        100
      ) +
      "%";

  }


  function formatAngle(
    value
  ) {

    return Number.isFinite(
      value
    )
      ? Math.round(
          value
        ) + "°"
      : "--°";

  }


  /* =======================================================
     25. VIDEO ANALYSIS
  ======================================================= */

  function initializePose() {

    if (
      typeof Pose ===
      "undefined"
    ) {

      showToast(
        "MediaPipe Pose를 불러오지 못했습니다."
      );

      return;

    }


    if (pose) {
      return;
    }


    pose =
      new Pose({

        locateFile:
          file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`

      });


    pose.setOptions({

      modelComplexity:
        2,

      smoothLandmarks:
        true,

      enableSegmentation:
        false,

      smoothSegmentation:
        false,

      minDetectionConfidence:
        0.5,

      minTrackingConfidence:
        0.5

    });


    pose.onResults(
      results => {

        lastPoseResults =
          results;

        drawPose(
          results
        );

      }
    );

  }


  function handleVideoFile(
    file
  ) {

    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "video/"
      )
    ) {

      showToast(
        "영상 파일을 선택해주세요."
      );

      return;

    }


    const video =
      $("analysisVideo") ||
      $("analysis-video");

    if (!video) {
      return;
    }


    if (
      currentVideoURL
    ) {

      URL.revokeObjectURL(
        currentVideoURL
      );

    }


    currentVideoURL =
      URL.createObjectURL(
        file
      );


    currentVideo =
      video;

    video.src =
      currentVideoURL;

    video.load();


    const placeholder =
      $("videoPlaceholder") ||
      $("video-placeholder");

    if (placeholder) {

      placeholder.style.display =
        "none";

    }


    video.addEventListener(
      "loadedmetadata",
      () => {

        showToast(
          "영상이 준비되었습니다."
        );

      },
      {
        once:
          true
      }
    );

  }


  async function processVideoFrame() {

    if (
      !processing ||
      !currentVideo ||
      currentVideo.paused ||
      currentVideo.ended
    ) {

      return;

    }


    initializePose();


    if (pose) {

      try {

        await pose.send({
          image:
            currentVideo
        });

      } catch (
        error
      ) {

        console.warn(
          "Pose 분석 오류",
          error
        );

      }

    }


    analysisFrame++;


    animationFrame =
      requestAnimationFrame(
        processVideoFrame
      );

  }


  function startVideoAnalysis() {

    const video =
      $("analysisVideo") ||
      $("analysis-video");

    if (!video) {
      return;
    }


    if (!video.src) {

      showToast(
        "먼저 영상을 업로드해주세요."
      );

      return;

    }


    const athleteSelect =
      $("analysisAthlete");

    if (
      athleteSelect &&
      !athleteSelect.value
    ) {

      showToast(
        "분석할 선수를 선택해주세요."
      );

      return;

    }


    currentVideo =
      video;

    processing =
      true;

    analysisFrame =
      0;

    trajectory =
      [];

    angleSeries =
      [];

    keyFrames =
      [];

    analysisStartTime =
      performance.now();


    currentAnalysisId =
      createId(
        "ANALYSIS"
      );


    video.play().catch(
      () => {}
    );


    setText(
      "analysisStatus",
      "ANALYZING"
    );

    setText(
      "analysisState",
      "ANALYZING"
    );

    setText(
      "systemStatus",
      "ANALYSIS RUNNING"
    );


    showToast(
      "영상 분석을 시작합니다."
    );


    cancelAnimationFrame(
      animationFrame
    );


    processVideoFrame();

  }


  function stopVideoAnalysis() {

    processing =
      false;


    cancelAnimationFrame(
      animationFrame
    );


    if (currentVideo) {

      currentVideo.pause();

    }


    setText(
      "analysisStatus",
      "COMPLETE"
    );

    setText(
      "analysisState",
      "COMPLETE"
    );

    setText(
      "systemStatus",
      "SYSTEM READY"
    );


    finishAnalysis();

  }


  /* =======================================================
     26. FINISH ANALYSIS
  ======================================================= */

  function finishAnalysis() {

    if (
      !lastPoseResults
        ?.poseLandmarks
    ) {

      showToast(
        "분석된 자세 데이터가 없습니다."
      );

      return;

    }


    const metrics =
      calculatePoseMetrics(
        lastPoseResults
          .poseLandmarks
      );


    const score =
      getAnalysisScore(
        metrics
      );


    const athleteSelect =
      $("analysisAthlete");


    const athleteId =
      athleteSelect?.value ||
      state.currentAthleteId ||
      "";


    const athlete =
      getAthlete(
        athleteId
      );


    const sportSelect =
      $("analysisSport") ||
      $("sportSelect");


    const eventName =
      sportSelect?.selectedOptions
        ? sportSelect
            .selectedOptions[0]
            ?.textContent
        : "체대입시";


    const record = {

      id:
        currentAnalysisId ||
        createId(
          "ANALYSIS"
        ),

      athleteId,

      athleteName:
        athlete?.name ||
        "미지정",

      event:
        eventName ||
        "체대입시",

      createdAt:
        new Date()
          .toISOString(),

      score,

      metrics,

      trajectory: [
        ...trajectory
      ],

      angleSeries: [
        ...angleSeries
      ],

      keyFrames: [
        ...keyFrames
      ],

      videoDuration:
        currentVideo?.duration ||
        0

    };


    record.feedback =
      generateFeedback(
        score
      );


    record.training =
      getRecommendedTraining(
        eventName
      );


    state.records.unshift(
      record
    );


    state.lastReport =
      record;


    saveState();


    renderAnalysisResult(
      record
    );


    renderRecords();

    updateDashboard();


    showToast(
      "분석 결과가 저장되었습니다."
    );

  }


  /* =======================================================
     27. ANALYSIS RESULT
  ======================================================= */

  function renderAnalysisResult(
    record
  ) {

    if (!record) {
      return;
    }


    renderFeedback(
      record.feedback ||
      []
    );


    renderTraining(
      record.training ||
      []
    );


    renderKeyFrames(
      record.keyFrames ||
      []
    );


    renderAngleChart(
      record.angleSeries ||
      []
    );


    renderTrajectory(
      record.trajectory ||
      []
    );

  }


  /* =======================================================
     28. FEEDBACK RENDER
  ======================================================= */

  function renderFeedback(
    feedback
  ) {

    const container =
      $("analysisFeedback") ||
      $("feedback") ||
      $("feedbackList");

    if (!container) {
      return;
    }


    container.innerHTML =
      feedback
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
        )
        .join("");

  }


  /* =======================================================
     29. TRAINING RENDER
  ======================================================= */

  function renderTraining(
    training
  ) {

    const container =
      $("trainingRecommendations") ||
      $("trainingList") ||
      $("recommendedTraining");

    if (!container) {
      return;
    }


    container.innerHTML =
      training
        .map(
          item => `

          <div class="training-card">

            <span class="training-tag">
              ${escapeHTML(
                item.level
              )}
            </span>

            <strong>
              ${escapeHTML(
                item.title
              )}
            </strong>

            <small>
              ${escapeHTML(
                item.purpose
              )}
            </small>

            <div class="training-meta">

              <span>
                ${escapeHTML(
                  item.sets
                )}
              </span>

              <span>
                ${escapeHTML(
                  item.reps
                )}
              </span>

              <span>
                휴식 ${escapeHTML(
                  item.rest
                )}
              </span>

            </div>

          </div>

        `
        )
        .join("");

  }


  /* =======================================================
     30. KEY FRAME RENDER
  ======================================================= */

  function renderKeyFrames(
    frames
  ) {

    const container =
      $("keyFrameList") ||
      $("keyFrames");


    if (!container) {
      return;
    }


    setText(
      "keyFrameCount",
      frames.length
    );


    if (!frames.length) {

      container.innerHTML =
        `
        <div class="empty-state">
          자동 핵심 프레임이 없습니다.
        </div>
        `;

      return;

    }


    container.innerHTML =
      frames
        .map(
          (frame, index) => `

          <div class="key-frame-item">

            <div class="key-frame-number">
              ${index + 1}
            </div>

            <div>

              <strong>
                ${escapeHTML(
                  frame.label ||
                  "핵심 동작"
                )}
              </strong>

              <span>
                ${formatTime(
                  frame.time
                )}
              </span>

            </div>

            <button
              class="secondary-button"
              data-key-time="${frame.time}"
            >
              이동
            </button>

          </div>

        `
        )
        .join("");


    $$(
      "[data-key-time]"
    ).forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const video =
              currentVideo;

            if (!video) {
              return;
            }

            video.currentTime =
              Number(
                button.dataset
                  .keyTime
              );

            video.pause();

          }
        );

      }
    );

  }


  /* =======================================================
     31. ANGLE CHART
  ======================================================= */

  function renderAngleChart(
    series
  ) {

    const canvas =
      $("angleChart") ||
      $("angle-chart");


    if (
      !canvas ||
      typeof Chart ===
        "undefined"
    ) {

      return;

    }


    if (angleChart) {

      angleChart.destroy();

    }


    angleChart =
      new Chart(
        canvas,
        {

          type:
            "line",

          data: {

            labels:
              series.map(
                item =>
                  formatTime(
                    item.time
                  )
              ),

            datasets: [

              {
                label:
                  "왼쪽 무릎",

                data:
                  series.map(
                    item =>
                      item.leftKnee
                  ),

                borderWidth:
                  2,

                tension:
                  0.25
              },


              {
                label:
                  "오른쪽 무릎",

                data:
                  series.map(
                    item =>
                      item.rightKnee
                  ),

                borderWidth:
                  2,

                tension:
                  0.25
              },


              {
                label:
                  "몸통",

                data:
                  series.map(
                    item =>
                      item.trunk
                  ),

                borderWidth:
                  2,

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

            animation:
              false,

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


  /* =======================================================
     32. TRAJECTORY CHART
  ======================================================= */

  function renderTrajectory(
    points
  ) {

    const canvas =
      $("trajectoryCanvas") ||
      $("trajectoryChart");


    if (!canvas) {
      return;
    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    const width =
      canvas.clientWidth ||
      600;

    const height =
      canvas.clientHeight ||
      280;


    canvas.width =
      width;

    canvas.height =
      height;


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    if (
      points.length < 2
    ) {

      return;

    }


    ctx.save();

    ctx.strokeStyle =
      "#20A7FF";

    ctx.lineWidth =
      3;

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

    ctx.restore();

  }


  /* =======================================================
     33. RECORDS
  ======================================================= */

  function renderRecords() {

    const list =
      $("recordList") ||
      $("recordsList");


    if (!list) {
      return;
    }


    if (!state.records.length) {

      list.innerHTML =
        `
        <div class="empty-state">
          저장된 분석 기록이 없습니다.
        </div>
        `;

      return;

    }


    list.innerHTML =
      state.records
        .map(
          record => `

          <div class="record-item">

            <div>

              <strong>
                ${escapeHTML(
                  record.athleteName
                )}
              </strong>

              <span>
                ${escapeHTML(
                  record.event
                )}
              </span>

              <small>
                ${formatDate(
                  record.createdAt
                )}
              </small>

            </div>

            <div class="record-score">

              ${record.score?.total ||
                0}

              <small>
                /100
              </small>

            </div>

            <button
              class="secondary-button"
              data-open-record="${record.id}"
            >
              열기
            </button>

          </div>

        `
        )
        .join("");


    $$(
      "[data-open-record]"
    ).forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const record =
              state.records.find(
                item =>
                  item.id ===
                  button.dataset
                    .openRecord
              );

            if (!record) {
              return;
            }

            state.lastReport =
              record;

            renderAnalysisResult(
              record
            );

            showToast(
              "분석 기록을 불러왔습니다."
            );

          }
        );

      }
    );

  }


  /* =======================================================
     34. DASHBOARD
  ======================================================= */

  function updateDashboard() {

    setText(
      "athleteCount",
      state.athletes.length
    );

    setText(
      "recordCount",
      state.records.length
    );


    const scores =
      state.records
        .map(
          record =>
            Number(
              record.score?.total
            )
        )
        .filter(
          Number.isFinite
        );


    const avg =
      scores.length
        ? Math.round(
            average(
              scores
            )
          )
        : 0;


    setText(
      "averageScore",
      avg
    );


    const recent =
      state.records
        .slice(
          0,
          10
        );


    const recentList =
      $("recentAnalysisList");


    if (recentList) {

      recentList.innerHTML =
        recent
          .map(
            record => `

            <div class="recent-item">

              <div>

                <strong>
                  ${escapeHTML(
                    record.athleteName
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    record.event
                  )}
                </small>

              </div>

              <b>
                ${record.score?.total ||
                  0}
              </b>

            </div>

          `
          )
          .join("");

    }


    renderDashboardCharts();

  }


  /* =======================================================
     35. DASHBOARD CHARTS
  ======================================================= */

  function renderDashboardCharts() {

    if (
      typeof Chart ===
      "undefined"
    ) {

      return;

    }


    const radar =
      $("dashboardRadar");


    if (
      radar
    ) {

      if (
        dashboardRadar
      ) {

        dashboardRadar.destroy();

      }


      const latest =
        state.records[0]
          ?.score ||
        {};


      dashboardRadar =
        new Chart(
          radar,
          {

            type:
              "radar",

            data: {

              labels: [

                "안정성",
                "정렬",
                "대칭",
                "효율",
                "폭발력",
                "기술"

              ],

              datasets: [

                {

                  label:
                    "현재 퍼포먼스",

                  data: [

                    latest.stability ||
                      0,

                    latest.alignment ||
                      0,

                    latest.symmetry ||
                      0,

                    latest.efficiency ||
                      0,

                    latest.power ||
                      0,

                    latest.technique ||
                      0

                  ],

                  borderWidth:
                    2,

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

                  min:
                    0,

                  max:
                    100

                }

              }

            }

          }
        );

    }


    const line =
      $("performanceChart");


    if (
      line
    ) {

      if (
        performanceChart
      ) {

        performanceChart.destroy();

      }


      const records =
        state.records
          .slice(
            0,
            12
          )
          .reverse();


      performanceChart =
        new Chart(
          line,
          {

            type:
              "line",

            data: {

              labels:
                records.map(
                  record =>
                    formatDate(
                      record.createdAt
                    )
                ),

              datasets: [

                {

                  label:
                    "종합 점수",

                  data:
                    records.map(
                      record =>
                        record.score
                          ?.total ||
                        0
                    ),

                  borderWidth:
                    3,

                  tension:
                    0.3

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

              }

            }

          }
        );

    }

  }


  /* =======================================================
     36. COLLEGE GOAL
  ======================================================= */

  function saveCollegeGoal(
    data
  ) {

    state.collegeGoal = {

      ...state.collegeGoal,

      ...data

    };


    saveState();


    showToast(
      "체대입시 목표가 저장되었습니다."
    );

  }


  function getCollegeGap(
    event,
    current,
    target
  ) {

    const c =
      Number(current);

    const t =
      Number(target);


    if (
      !Number.isFinite(c) ||
      !Number.isFinite(t)
    ) {

      return 0;

    }


    const eventConfig =
      window.PE_EVENTS?.find(
        item =>
          item.name ===
          event
      );


    if (
      eventConfig?.higherBetter
    ) {

      return c - t;

    }


    return t - c;

  }


  /* =======================================================
     37. REPORT
  ======================================================= */

  function renderReportPage() {

    const record =
      state.lastReport ||
      state.records[0];


    if (!record) {
      return;
    }


    const score =
      record.score ||
      {};


    setText(
      "reportTotalScore",
      `${score.total || 0}/100`
    );


    setText(
      "reportStability",
      score.stability ||
        0
    );


    setText(
      "reportAlignment",
      score.alignment ||
        0
    );


    setText(
      "reportSymmetry",
      score.symmetry ||
        0
    );


    setText(
      "reportEfficiency",
      score.efficiency ||
        0
    );


    renderFeedback(
      record.feedback ||
      generateFeedback(
        score
      )
    );


    renderTraining(
      record.training ||
      getRecommendedTraining(
        record.event
      )
    );


    renderReportRadar(
      score
    );


    renderReportAngleChart(
      record.angleSeries ||
      []
    );

  }


  /* =======================================================
     38. REPORT RADAR
  ======================================================= */

  function renderReportRadar(
    score
  ) {

    const canvas =
      $("reportRadar");


    if (
      !canvas ||
      typeof Chart ===
        "undefined"
    ) {

      return;

    }


    if (
      reportRadar
    ) {

      reportRadar.destroy();

    }


    reportRadar =
      new Chart(
        canvas,
        {

          type:
            "radar",

          data: {

            labels: [

              "안정성",
              "정렬",
              "대칭",
              "효율",
              "폭발력",
              "기술"

            ],

            datasets: [

              {

                label:
                  "분석 결과",

                data: [

                  score.stability ||
                    0,

                  score.alignment ||
                    0,

                  score.symmetry ||
                    0,

                  score.efficiency ||
                    0,

                  score.power ||
                    0,

                  score.technique ||
                    0

                ],

                borderWidth:
                  2,

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

                min:
                  0,

                max:
                  100

              }

            }

          }

        }
      );

  }


  /* =======================================================
     39. REPORT ANGLE CHART
  ======================================================= */

  function renderReportAngleChart(
    series
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
      reportAngleChart
    ) {

      reportAngleChart.destroy();

    }


    reportAngleChart =
      new Chart(
        canvas,
        {

          type:
            "line",

          data: {

            labels:
              series.map(
                item =>
                  formatTime(
                    item.time
                  )
              ),

            datasets: [

              {

                label:
                  "왼쪽 무릎",

                data:
                  series.map(
                    item =>
                      item.leftKnee
                  ),

                borderWidth:
                  2

              },

              {

                label:
                  "오른쪽 무릎",

                data:
                  series.map(
                    item =>
                      item.rightKnee
                  ),

                borderWidth:
                  2

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
     40. COMPARE
  ======================================================= */

  function compareRecords(
    recordA,
    recordB
  ) {

    if (
      !recordA ||
      !recordB
    ) {

      return null;

    }


    const fields = [

      "total",
      "stability",
      "alignment",
      "symmetry",
      "efficiency"

    ];


    const result = {};


    fields.forEach(
      field => {

        const a =
          Number(
            recordA.score?.[
              field
            ] || 0
          );

        const b =
          Number(
            recordB.score?.[
              field
            ] || 0
          );


        result[field] = {

          before:
            a,

          after:
            b,

          change:
            b - a

        };

      }
    );


    return result;

  }


  /* =======================================================
     41. INITIAL RENDER
  ======================================================= */

  function renderAll() {

    renderAthletes();

    renderRecords();

    updateAthleteSelect();

    updateDashboard();

    renderReportPage();

  }


  /* =======================================================
     42. EVENT FALLBACKS
  ======================================================= */

  window.SC_APP = {

    state,

    openPage,

    renderAll,

    saveState,

    createAthlete,

    deleteAthlete,

    getAthlete,

    startVideoAnalysis,

    stopVideoAnalysis,

    handleVideoFile,

    renderAnalysisResult,

    renderReportPage,

    compareRecords,

    saveCollegeGoal,

    calculatePoseMetrics,

    calculateAngle,

    getRecommendedTraining,

    showToast

  };


  /* =======================================================
     43. INITIALIZATION
  ======================================================= */

  function initialize() {

    loadSettings();

    initializePose();

    renderAll();

    bindBasicNavigation();

    startClock();

  }


  function loadSettings() {

    if (
      !state.settings
    ) {

      state.settings = {

        skeleton:
          true,

        angles:
          true,

        baseline:
          true,

        autoKeyFrames:
          true

      };

    }

  }


  function bindBasicNavigation() {

    $$(
      "[data-page]"
    ).forEach(
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


    $$(
      "[data-open-page]"
    ).forEach(
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


    const upload =
      $("videoInput") ||
      $("analysisVideoInput");


    const fileInput =
      $("videoFile");


    if (fileInput) {

      fileInput.addEventListener(
        "change",
        event => {

          handleVideoFile(
            event.target
              .files[0]
          );

        }
      );

    }


    if (upload) {

      upload.addEventListener(
        "change",
        event => {

          handleVideoFile(
            event.target
              .files[0]
          );

        }
      );

    }


    const start =
      $("startAnalysis") ||
      $("startAnalysisBtn");


    if (start) {

      start.addEventListener(
        "click",
        startVideoAnalysis
      );

    }


    const stop =
      $("stopAnalysis") ||
      $("stopAnalysisBtn");


    if (stop) {

      stop.addEventListener(
        "click",
        stopVideoAnalysis
      );

    }

  }


  function startClock() {

    const update =
      () => {

        const clock =
          $("clock");


        if (!clock) {
          return;
        }


        clock.textContent =
          new Date()
            .toLocaleTimeString(
              "ko-KR",
              {
                hour12:
                  false
              }
            );

      };


    update();

    setInterval(
      update,
      1000
    );

  }


  /* =======================================================
     44. BOOT
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

})();