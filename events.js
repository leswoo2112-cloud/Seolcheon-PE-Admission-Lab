/* =========================================================
   설천고 PE PERFORMANCE LAB PRO
   events.js
   VERSION 3.0

   운동 / 체대입시 종목 데이터베이스

   IMPORTANT
   ---------------------------------------------------------
   app.js 에서 아래 전역변수를 사용한다.

   window.SC_EVENT_CATEGORIES
   window.SC_EVENTS
   window.SC_EVENT_UTILS
========================================================= */

"use strict";


/* =========================================================
   01. CATEGORY DATABASE
========================================================= */

window.SC_EVENT_CATEGORIES = [

  {
    id: "all",
    name: "전체",
    icon: "◈"
  },

  {
    id: "bodyweight",
    name: "맨몸",
    icon: "◎"
  },

  {
    id: "lower",
    name: "하체",
    icon: "▽"
  },

  {
    id: "upper",
    name: "상체",
    icon: "△"
  },

  {
    id: "core",
    name: "코어",
    icon: "◇"
  },

  {
    id: "jump",
    name: "점프",
    icon: "↑"
  },

  {
    id: "running",
    name: "달리기",
    icon: "➜"
  },

  {
    id: "agility",
    name: "민첩성",
    icon: "↯"
  },

  {
    id: "pe",
    name: "체대입시",
    icon: "◆"
  }

];


/* =========================================================
   02. EVENT DATABASE
========================================================= */

window.SC_EVENTS = [

  /* =======================================================
     BODYWEIGHT
  ======================================================= */

  {
    id: "squat",

    name: "스쿼트",

    category: "bodyweight",

    icon: "◎",

    description:
      "고관절·무릎·발목과 몸통 정렬을 분석합니다.",

    movementType: "squat",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "ankleAngle",
      "trunkAngle",
      "symmetry",
      "depth",
      "trajectory"
    ],

    phases: [
      "READY",
      "DESCENT",
      "BOTTOM",
      "ASCENT",
      "COMPLETE"
    ],

    ideal: {
      kneeMin: 65,
      kneeMax: 175,
      trunkMax: 45,
      symmetryMax: 12
    }
  },


  {
    id: "bodyweight_deep_squat",

    name: "딥 스쿼트",

    category: "bodyweight",

    icon: "◎",

    description:
      "깊은 스쿼트의 가동범위와 좌우 안정성을 분석합니다.",

    movementType: "squat",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "ankleAngle",
      "trunkAngle",
      "symmetry",
      "depth"
    ],

    phases: [
      "READY",
      "DESCENT",
      "BOTTOM",
      "ASCENT",
      "COMPLETE"
    ],

    ideal: {
      kneeMin: 50,
      kneeMax: 175,
      trunkMax: 50,
      symmetryMax: 12
    }
  },


  {
    id: "forward_lunge",

    name: "포워드 런지",

    category: "bodyweight",

    icon: "◒",

    description:
      "앞쪽 무릎 정렬과 골반 안정성을 분석합니다.",

    movementType: "lunge",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "ankleAngle",
      "trunkAngle",
      "symmetry",
      "balance"
    ],

    phases: [
      "READY",
      "STEP",
      "DESCENT",
      "BOTTOM",
      "RETURN"
    ],

    ideal: {
      kneeMin: 70,
      kneeMax: 175,
      trunkMax: 25,
      symmetryMax: 15
    }
  },


  {
    id: "reverse_lunge",

    name: "리버스 런지",

    category: "bodyweight",

    icon: "◐",

    description:
      "뒤로 이동하는 런지 동작의 안정성과 관절각을 분석합니다.",

    movementType: "lunge",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "symmetry",
      "balance"
    ],

    phases: [
      "READY",
      "STEP BACK",
      "DESCENT",
      "BOTTOM",
      "RETURN"
    ],

    ideal: {
      kneeMin: 70,
      kneeMax: 175,
      trunkMax: 25,
      symmetryMax: 15
    }
  },


  {
    id: "split_squat",

    name: "스플릿 스쿼트",

    category: "bodyweight",

    icon: "◑",

    description:
      "좌우 다리의 독립적인 안정성과 움직임을 분석합니다.",

    movementType: "lunge",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "ankleAngle",
      "symmetry",
      "balance"
    ],

    phases: [
      "READY",
      "DESCENT",
      "BOTTOM",
      "ASCENT",
      "COMPLETE"
    ],

    ideal: {
      kneeMin: 65,
      kneeMax: 175,
      trunkMax: 25,
      symmetryMax: 15
    }
  },


  {
    id: "pushup",

    name: "푸시업",

    category: "bodyweight",

    icon: "▬",

    description:
      "팔꿈치 각도와 몸통 정렬을 분석합니다.",

    movementType: "pushup",

    primaryJoint: "elbow",

    repCounter: true,

    analysis: [
      "elbowAngle",
      "shoulderAngle",
      "trunkAlignment",
      "symmetry"
    ],

    phases: [
      "TOP",
      "DESCENT",
      "BOTTOM",
      "ASCENT",
      "COMPLETE"
    ],

    ideal: {
      elbowMin: 70,
      elbowMax: 170,
      symmetryMax: 12
    }
  },


  {
    id: "burpee",

    name: "버피",

    category: "bodyweight",

    icon: "↕",

    description:
      "전신 움직임의 속도·안정성·동작 연결을 분석합니다.",

    movementType: "burpee",

    primaryJoint: "hip",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "speed",
      "coordination"
    ],

    phases: [
      "STAND",
      "DOWN",
      "PLANK",
      "RETURN",
      "JUMP"
    ]
  },


  /* =======================================================
     LOWER BODY
  ======================================================= */

  {
    id: "single_leg_squat",

    name: "싱글 레그 스쿼트",

    category: "lower",

    icon: "◉",

    description:
      "한쪽 다리의 무릎 안정성과 골반 균형을 분석합니다.",

    movementType: "singleLegSquat",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "pelvisStability",
      "balance"
    ],

    phases: [
      "READY",
      "DESCENT",
      "BOTTOM",
      "ASCENT"
    ]
  },


  {
    id: "step_up",

    name: "스텝업",

    category: "lower",

    icon: "▟",

    description:
      "한쪽 다리의 추진력과 골반 안정성을 분석합니다.",

    movementType: "step",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "balance",
      "power"
    ],

    phases: [
      "READY",
      "STEP",
      "PUSH",
      "TOP",
      "RETURN"
    ]
  },


  {
    id: "calf_raise",

    name: "카프레이즈",

    category: "lower",

    icon: "↑",

    description:
      "발목 가동범위와 반복 동작을 분석합니다.",

    movementType: "calfRaise",

    primaryJoint: "ankle",

    repCounter: true,

    analysis: [
      "ankleAngle",
      "balance",
      "range"
    ],

    phases: [
      "BOTTOM",
      "ASCENT",
      "TOP",
      "DESCENT"
    ]
  },


  {
    id: "wall_sit",

    name: "월싯",

    category: "lower",

    icon: "□",

    description:
      "정적 스쿼트 자세의 무릎각과 몸통 안정성을 분석합니다.",

    movementType: "hold",

    primaryJoint: "knee",

    repCounter: false,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "stability"
    ],

    phases: [
      "HOLD"
    ]
  },


  /* =======================================================
     UPPER BODY
  ======================================================= */

  {
    id: "shoulder_flexion",

    name: "어깨 굴곡",

    category: "upper",

    icon: "↑",

    description:
      "팔을 들어 올릴 때 어깨 가동범위를 분석합니다.",

    movementType: "mobility",

    primaryJoint: "shoulder",

    repCounter: false,

    analysis: [
      "shoulderAngle",
      "symmetry",
      "range"
    ],

    phases: [
      "START",
      "RAISE",
      "TOP"
    ]
  },


  {
    id: "arm_raise",

    name: "양팔 올리기",

    category: "upper",

    icon: "Y",

    description:
      "양쪽 어깨 움직임과 좌우 대칭성을 분석합니다.",

    movementType: "mobility",

    primaryJoint: "shoulder",

    repCounter: true,

    analysis: [
      "shoulderAngle",
      "elbowAngle",
      "symmetry"
    ],

    phases: [
      "DOWN",
      "RAISE",
      "TOP",
      "LOWER"
    ]
  },


  {
    id: "dip",

    name: "딥스",

    category: "upper",

    icon: "↓",

    description:
      "팔꿈치와 어깨의 움직임 및 좌우 균형을 분석합니다.",

    movementType: "dip",

    primaryJoint: "elbow",

    repCounter: true,

    analysis: [
      "elbowAngle",
      "shoulderAngle",
      "symmetry"
    ],

    phases: [
      "TOP",
      "DESCENT",
      "BOTTOM",
      "ASCENT"
    ]
  },


  /* =======================================================
     CORE
  ======================================================= */

  {
    id: "plank",

    name: "플랭크",

    category: "core",

    icon: "━",

    description:
      "어깨·골반·발목의 정렬과 몸통 안정성을 분석합니다.",

    movementType: "hold",

    primaryJoint: "trunk",

    repCounter: false,

    analysis: [
      "trunkAlignment",
      "hipAlignment",
      "stability"
    ],

    phases: [
      "HOLD"
    ]
  },


  {
    id: "side_plank",

    name: "사이드 플랭크",

    category: "core",

    icon: "╱",

    description:
      "측면 코어 안정성과 몸통 정렬을 분석합니다.",

    movementType: "hold",

    primaryJoint: "trunk",

    repCounter: false,

    analysis: [
      "trunkAlignment",
      "shoulderAlignment",
      "stability"
    ],

    phases: [
      "HOLD"
    ]
  },


  {
    id: "situp",

    name: "윗몸일으키기",

    category: "core",

    icon: "⌒",

    description:
      "체대입시 윗몸일으키기 동작과 반복 횟수를 분석합니다.",

    movementType: "situp",

    primaryJoint: "hip",

    repCounter: true,

    analysis: [
      "hipAngle",
      "trunkAngle",
      "tempo",
      "repSpeed"
    ],

    phases: [
      "DOWN",
      "ASCENT",
      "TOP",
      "DESCENT"
    ]
  },


  {
    id: "crunch",

    name: "크런치",

    category: "core",

    icon: "⌒",

    description:
      "몸통 굴곡 범위와 반복 리듬을 분석합니다.",

    movementType: "situp",

    primaryJoint: "trunk",

    repCounter: true,

    analysis: [
      "trunkAngle",
      "tempo"
    ],

    phases: [
      "DOWN",
      "UP",
      "DOWN"
    ]
  },


  /* =======================================================
     JUMP
  ======================================================= */

  {
    id: "vertical_jump",

    name: "서전트 점프",

    category: "jump",

    icon: "↑",

    description:
      "점프 준비·이륙·비행·착지 동작을 분석합니다.",

    movementType: "jump",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "ankleAngle",
      "takeoffAngle",
      "flightTime",
      "relativeJump",
      "landing"
    ],

    phases: [
      "READY",
      "COUNTER MOVEMENT",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ],

    ideal: {
      trunkMax: 35,
      symmetryMax: 12
    }
  },


  {
    id: "countermovement_jump",

    name: "CMJ",

    category: "jump",

    icon: "↑",

    description:
      "카운터무브먼트 점프의 하강·이륙·비행을 분석합니다.",

    movementType: "jump",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "takeoff",
      "flightTime",
      "relativeJump"
    ],

    phases: [
      "READY",
      "DESCENT",
      "BOTTOM",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  {
    id: "squat_jump",

    name: "스쿼트 점프",

    category: "jump",

    icon: "↥",

    description:
      "정지 스쿼트 자세에서의 점프 추진 동작을 분석합니다.",

    movementType: "jump",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "takeoff",
      "flightTime",
      "landing"
    ],

    phases: [
      "READY",
      "SQUAT",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  {
    id: "broad_jump",

    name: "제자리멀리뛰기",

    category: "jump",

    icon: "➜",

    description:
      "체대입시 제자리멀리뛰기의 이륙각·비행·착지를 분석합니다.",

    movementType: "horizontalJump",

    primaryJoint: "hip",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "takeoffAngle",
      "trajectory",
      "landing"
    ],

    phases: [
      "READY",
      "COUNTER MOVEMENT",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  {
    id: "box_jump",

    name: "박스 점프",

    category: "jump",

    icon: "▟",

    description:
      "이륙과 착지 자세 및 무릎 안정성을 분석합니다.",

    movementType: "jump",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "takeoff",
      "landing",
      "symmetry"
    ],

    phases: [
      "READY",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  {
    id: "single_leg_jump",

    name: "싱글 레그 점프",

    category: "jump",

    icon: "↑",

    description:
      "한발 점프의 추진과 착지 안정성을 분석합니다.",

    movementType: "jump",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "balance",
      "landing"
    ],

    phases: [
      "READY",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  /* =======================================================
     RUNNING
  ======================================================= */

  {
    id: "sprint",

    name: "스프린트",

    category: "running",

    icon: "➜",

    description:
      "달리기 자세·케이던스·상체 기울기·보폭 패턴을 분석합니다.",

    movementType: "running",

    primaryJoint: "knee",

    repCounter: false,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "cadence",
      "stride",
      "symmetry"
    ],

    phases: [
      "CONTACT",
      "MID STANCE",
      "TOE OFF",
      "FLIGHT"
    ]
  },


  {
    id: "sprint_start",

    name: "스프린트 스타트",

    category: "running",

    icon: "↗",

    description:
      "출발 자세와 초기 가속 동작을 분석합니다.",

    movementType: "sprintStart",

    primaryJoint: "hip",

    repCounter: false,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "acceleration",
      "firstStep"
    ],

    phases: [
      "SET",
      "PUSH",
      "FIRST STEP",
      "ACCELERATION"
    ]
  },


  {
    id: "high_knee",

    name: "하이니",

    category: "running",

    icon: "↟",

    description:
      "무릎 상승 높이와 좌우 리듬을 분석합니다.",

    movementType: "runningDrill",

    primaryJoint: "hip",

    repCounter: true,

    analysis: [
      "hipAngle",
      "kneeAngle",
      "cadence",
      "symmetry"
    ],

    phases: [
      "CONTACT",
      "DRIVE",
      "TOP",
      "RETURN"
    ]
  },


  {
    id: "a_skip",

    name: "A-Skip",

    category: "running",

    icon: "↗",

    description:
      "러닝 드릴의 무릎 드라이브와 리듬을 분석합니다.",

    movementType: "runningDrill",

    primaryJoint: "hip",

    repCounter: true,

    analysis: [
      "hipAngle",
      "kneeAngle",
      "cadence",
      "coordination"
    ],

    phases: [
      "CONTACT",
      "DRIVE",
      "FLIGHT",
      "CONTACT"
    ]
  },


  /* =======================================================
     AGILITY
  ======================================================= */

  {
    id: "side_shuffle",

    name: "사이드 셔플",

    category: "agility",

    icon: "↔",

    description:
      "좌우 이동과 무릎·골반 안정성을 분석합니다.",

    movementType: "agility",

    primaryJoint: "knee",

    repCounter: false,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "lateralMovement",
      "balance"
    ],

    phases: [
      "READY",
      "PUSH",
      "MOVE",
      "BRAKE"
    ]
  },


  {
    id: "change_direction",

    name: "방향전환",

    category: "agility",

    icon: "↯",

    description:
      "감속·방향전환·재가속 동작을 분석합니다.",

    movementType: "agility",

    primaryJoint: "knee",

    repCounter: false,

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "braking",
      "acceleration"
    ],

    phases: [
      "APPROACH",
      "BRAKING",
      "CUT",
      "ACCELERATION"
    ]
  },


  {
    id: "shuttle_run",

    name: "왕복달리기",

    category: "agility",

    icon: "⇆",

    description:
      "왕복 구간의 감속·턴·재가속 움직임을 분석합니다.",

    movementType: "agility",

    primaryJoint: "knee",

    repCounter: true,

    analysis: [
      "turn",
      "kneeAngle",
      "trunkAngle",
      "acceleration"
    ],

    phases: [
      "RUN",
      "BRAKE",
      "TURN",
      "ACCELERATE"
    ]
  },


  /* =======================================================
     PE ENTRANCE EXAM
  ======================================================= */

  {
    id: "pe_vertical_jump",

    name: "체대입시 서전트 점프",

    category: "pe",

    icon: "◆",

    description:
      "체대입시 서전트 점프의 준비·이륙·착지를 분석합니다.",

    movementType: "jump",

    primaryJoint: "knee",

    repCounter: true,

    peTest: true,

    ability: "순발력",

    analysis: [
      "kneeAngle",
      "hipAngle",
      "takeoffAngle",
      "flightTime",
      "relativeJump"
    ],

    phases: [
      "READY",
      "COUNTER MOVEMENT",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  {
    id: "pe_broad_jump",

    name: "체대입시 제자리멀리뛰기",

    category: "pe",

    icon: "◆",

    description:
      "이륙각과 신체중심 궤적, 착지 자세를 분석합니다.",

    movementType: "horizontalJump",

    primaryJoint: "hip",

    repCounter: true,

    peTest: true,

    ability: "순발력",

    analysis: [
      "kneeAngle",
      "hipAngle",
      "trunkAngle",
      "takeoffAngle",
      "trajectory",
      "landing"
    ],

    phases: [
      "READY",
      "LOAD",
      "TAKEOFF",
      "FLIGHT",
      "LANDING"
    ]
  },


  {
    id: "pe_situp",

    name: "체대입시 윗몸일으키기",

    category: "pe",

    icon: "◆",

    description:
      "반복 횟수·리듬·몸통 움직임을 분석합니다.",

    movementType: "situp",

    primaryJoint: "hip",

    repCounter: true,

    peTest: true,

    ability: "근지구력",

    analysis: [
      "hipAngle",
      "trunkAngle",
      "repSpeed",
      "tempo"
    ],

    phases: [
      "DOWN",
      "ASCENT",
      "TOP",
      "DESCENT"
    ]
  },


  {
    id: "pe_shuttle",

    name: "체대입시 10m 왕복달리기",

    category: "pe",

    icon: "◆",

    description:
      "턴 동작·감속·재가속 패턴을 분석합니다.",

    movementType: "agility",

    primaryJoint: "knee",

    repCounter: true,

    peTest: true,

    ability: "민첩성",

    analysis: [
      "turn",
      "kneeAngle",
      "trunkAngle",
      "acceleration"
    ],

    phases: [
      "RUN",
      "BRAKE",
      "TURN",
      "ACCELERATE"
    ]
  },


  {
    id: "pe_side_step",

    name: "사이드스텝",

    category: "pe",

    icon: "◆",

    description:
      "좌우 이동 속도와 신체중심 이동을 분석합니다.",

    movementType: "agility",

    primaryJoint: "knee",

    repCounter: true,

    peTest: true,

    ability: "민첩성",

    analysis: [
      "lateralMovement",
      "kneeAngle",
      "centerMovement",
      "cadence"
    ],

    phases: [
      "CENTER",
      "LEFT",
      "CENTER",
      "RIGHT"
    ]
  },


  {
    id: "pe_medicine_ball",

    name: "메디신볼 던지기",

    category: "pe",

    icon: "◆",

    description:
      "하체-몸통-상체로 이어지는 힘 전달 동작을 분석합니다.",

    movementType: "throw",

    primaryJoint: "shoulder",

    repCounter: true,

    peTest: true,

    ability: "파워",

    analysis: [
      "shoulderAngle",
      "elbowAngle",
      "hipAngle",
      "trunkAngle",
      "sequence"
    ],

    phases: [
      "READY",
      "LOAD",
      "DRIVE",
      "RELEASE",
      "FOLLOW THROUGH"
    ]
  },


  {
    id: "pe_20m_sprint",

    name: "20m 스프린트",

    category: "pe",

    icon: "◆",

    description:
      "출발과 초기 가속, 러닝 자세를 분석합니다.",

    movementType: "running",

    primaryJoint: "hip",

    repCounter: false,

    peTest: true,

    ability: "스피드",

    analysis: [
      "trunkAngle",
      "hipAngle",
      "kneeAngle",
      "cadence",
      "acceleration"
    ],

    phases: [
      "START",
      "DRIVE",
      "ACCELERATION",
      "SPRINT"
    ]
  }

];


/* =========================================================
   03. EVENT UTILITIES
========================================================= */

window.SC_EVENT_UTILS = {


  /* -------------------------------------------------------
     GET EVENT
  ------------------------------------------------------- */

  getEvent(id) {

    return window.SC_EVENTS.find(
      event => event.id === id
    ) || null;

  },


  /* -------------------------------------------------------
     GET CATEGORY
  ------------------------------------------------------- */

  getCategory(id) {

    return window.SC_EVENT_CATEGORIES.find(
      category => category.id === id
    ) || null;

  },


  /* -------------------------------------------------------
     EVENTS BY CATEGORY
  ------------------------------------------------------- */

  getEventsByCategory(category) {

    if (!category || category === "all") {

      return [...window.SC_EVENTS];

    }

    return window.SC_EVENTS.filter(
      event => event.category === category
    );

  },


  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  searchEvents(keyword) {

    const query =
      String(keyword || "")
        .trim()
        .toLowerCase();

    if (!query) {

      return [...window.SC_EVENTS];

    }

    return window.SC_EVENTS.filter(event => {

      const text = [
        event.name,
        event.category,
        event.description,
        event.ability || "",
        ...(event.analysis || [])
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);

    });

  },


  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  filterEvents(category, keyword) {

    let result =
      this.getEventsByCategory(category);

    const query =
      String(keyword || "")
        .trim()
        .toLowerCase();

    if (!query) {

      return result;

    }

    return result.filter(event => {

      const text = [
        event.name,
        event.description,
        event.ability || ""
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);

    });

  },


  /* -------------------------------------------------------
     REP SUPPORT
  ------------------------------------------------------- */

  supportsRepCounter(eventId) {

    const event =
      this.getEvent(eventId);

    return Boolean(
      event &&
      event.repCounter
    );

  },


  /* -------------------------------------------------------
     PE TEST
  ------------------------------------------------------- */

  isPETest(eventId) {

    const event =
      this.getEvent(eventId);

    return Boolean(
      event &&
      event.peTest
    );

  },


  /* -------------------------------------------------------
     MOVEMENT TYPE
  ------------------------------------------------------- */

  getMovementType(eventId) {

    const event =
      this.getEvent(eventId);

    return event
      ? event.movementType
      : "general";

  },


  /* -------------------------------------------------------
     PHASES
  ------------------------------------------------------- */

  getPhases(eventId) {

    const event =
      this.getEvent(eventId);

    if (!event) {

      return [
        "READY",
        "MOVING",
        "COMPLETE"
      ];

    }

    return event.phases || [
      "READY",
      "MOVING",
      "COMPLETE"
    ];

  },


  /* -------------------------------------------------------
     PRIMARY JOINT
  ------------------------------------------------------- */

  getPrimaryJoint(eventId) {

    const event =
      this.getEvent(eventId);

    return event
      ? event.primaryJoint
      : "knee";

  },


  /* -------------------------------------------------------
     IDEAL RANGE
  ------------------------------------------------------- */

  getIdealRange(eventId) {

    const event =
      this.getEvent(eventId);

    if (!event) {

      return {};

    }

    return event.ideal || {};

  },


  /* -------------------------------------------------------
     RANDOM / DEFAULT EVENT
  ------------------------------------------------------- */

  getDefaultEvent() {

    return this.getEvent("squat");

  },


  /* -------------------------------------------------------
     EVENT COUNT
  ------------------------------------------------------- */

  getCount() {

    return window.SC_EVENTS.length;

  }

};


/* =========================================================
   04. DEVELOPMENT VALIDATION

   같은 ID가 두 개 들어가면 콘솔에 오류 표시.
========================================================= */

(function validateEventDatabase() {

  const ids = new Set();

  window.SC_EVENTS.forEach(event => {

    if (!event.id) {

      console.error(
        "[EVENT DATABASE] ID가 없는 종목:",
        event
      );

      return;

    }

    if (ids.has(event.id)) {

      console.error(
        "[EVENT DATABASE] 중복 ID:",
        event.id
      );

      return;

    }

    ids.add(event.id);

  });


  console.log(
    `%c[SC EVENTS] ${window.SC_EVENTS.length}개 종목 로드 완료`,
    "color:#39c6ff;font-weight:bold;"
  );

})();