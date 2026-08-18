/* =========================================================
   SEOLCHEON HIGH SCHOOL
   PE PERFORMANCE LAB — FINAL 3.0
   events.js

   역할
   1. 체대입시 종목 데이터
   2. 종목 카테고리
   3. 종목별 분석 능력
   4. 종목별 핵심 관절
   5. 종목별 분석 기준
   6. 영상 자세분석과 연결
========================================================= */

"use strict";


/* =========================================================
   01. EVENT CATEGORY
========================================================= */

const EVENT_CATEGORIES = [
  {
    id: "all",
    name: "전체"
  },
  {
    id: "jump",
    name: "점프"
  },
  {
    id: "speed",
    name: "스피드"
  },
  {
    id: "agility",
    name: "민첩성"
  },
  {
    id: "power",
    name: "근파워"
  },
  {
    id: "strength",
    name: "근력"
  },
  {
    id: "endurance",
    name: "지구력"
  },
  {
    id: "throw",
    name: "투척"
  },
  {
    id: "flexibility",
    name: "유연성"
  },
  {
    id: "coordination",
    name: "협응"
  }
];


/* =========================================================
   02. PE EVENT DATA
========================================================= */

const PE_EVENTS = [

  /* =======================================================
     JUMP
  ======================================================= */

  {
    id: "standing-long-jump",

    name: "제자리멀리뛰기",

    shortName: "제멀",

    category: "jump",

    categoryName: "점프",

    ability: "순발력 · 하체 파워",

    description:
      "준비자세부터 이륙, 비행, 착지까지 전 구간을 분석합니다.",

    icon: "↗",

    analysisType: "jump",

    mainMetrics: [
      "jumpPower",
      "takeoffAngle",
      "hipExtension",
      "kneeExtension",
      "armSwing",
      "landingStability"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee",
      "ankle"
    ],

    targetAngles: {
      preparationKnee: [85, 120],
      preparationHip: [70, 120],
      takeoffKnee: [150, 180],
      takeoffHip: [150, 180],
      takeoffAngle: [28, 45]
    },

    weights: {
      speed: 10,
      power: 30,
      agility: 5,
      stability: 15,
      symmetry: 15,
      technique: 25
    },

    phases: [
      "준비",
      "반동",
      "이륙",
      "비행",
      "착지"
    ],

    feedbackFocus: [
      "무릎 굴곡",
      "고관절 사용",
      "팔 스윙",
      "이륙각",
      "착지 안정성"
    ],

    training: [
      "스쿼트 점프",
      "브로드 점프",
      "박스 점프",
      "힙 익스텐션",
      "팔 스윙 점프"
    ]
  },


  {
    id: "vertical-jump",

    name: "서전트 점프",

    shortName: "서전트",

    category: "jump",

    categoryName: "점프",

    ability: "수직 점프력 · 순발력",

    description:
      "신체중심 상승과 하체 신전 타이밍을 분석합니다.",

    icon: "↑",

    analysisType: "jump",

    mainMetrics: [
      "jumpHeight",
      "flightTime",
      "kneeExtension",
      "hipExtension",
      "armSwing"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee",
      "ankle"
    ],

    targetAngles: {
      preparationKnee: [80, 120],
      takeoffKnee: [155, 180],
      takeoffHip: [155, 180]
    },

    weights: {
      speed: 5,
      power: 35,
      agility: 5,
      stability: 15,
      symmetry: 15,
      technique: 25
    },

    phases: [
      "준비",
      "하강",
      "전환",
      "이륙",
      "최고점",
      "착지"
    ],

    feedbackFocus: [
      "반동 깊이",
      "무릎 신전",
      "고관절 신전",
      "팔 스윙",
      "착지"
    ],

    training: [
      "CMJ",
      "스쿼트 점프",
      "박스 점프",
      "포고 점프",
      "카프 점프"
    ]
  },


  /* =======================================================
     SPEED
  ======================================================= */

  {
    id: "sprint-50",

    name: "50m 달리기",

    shortName: "50m",

    category: "speed",

    categoryName: "스피드",

    ability: "가속 · 최고속도",

    description:
      "출발 자세, 가속 구간, 케이던스와 몸통 각도를 분석합니다.",

    icon: "≫",

    analysisType: "sprint",

    mainMetrics: [
      "cadence",
      "stepCount",
      "trunkAngle",
      "kneeDrive",
      "groundContact",
      "symmetry"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee",
      "ankle"
    ],

    targetAngles: {
      accelerationTrunk: [35, 60],
      kneeDrive: [70, 110],
      supportKnee: [145, 180]
    },

    weights: {
      speed: 35,
      power: 20,
      agility: 10,
      stability: 5,
      symmetry: 10,
      technique: 20
    },

    phases: [
      "출발",
      "초기 가속",
      "가속",
      "최고속도",
      "피니시"
    ],

    feedbackFocus: [
      "출발각",
      "몸통 기울기",
      "무릎 드라이브",
      "발 접지",
      "팔 동작"
    ],

    training: [
      "10m 스타트",
      "20m 가속질주",
      "A-Skip",
      "바운딩",
      "스프린트 드릴"
    ]
  },


  {
    id: "sprint-100",

    name: "100m 달리기",

    shortName: "100m",

    category: "speed",

    categoryName: "스피드",

    ability: "스피드 · 가속 유지",

    description:
      "가속과 최고속도 구간의 자세 효율을 분석합니다.",

    icon: "➜",

    analysisType: "sprint",

    mainMetrics: [
      "cadence",
      "stride",
      "trunkAngle",
      "kneeDrive",
      "symmetry",
      "speed"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee",
      "ankle"
    ],

    weights: {
      speed: 40,
      power: 15,
      agility: 5,
      stability: 5,
      symmetry: 10,
      technique: 25
    },

    phases: [
      "스타트",
      "가속",
      "전환",
      "최고속도",
      "속도 유지",
      "피니시"
    ],

    feedbackFocus: [
      "가속 자세",
      "케이던스",
      "보폭",
      "상체 안정",
      "좌우 대칭"
    ],

    training: [
      "플라잉 스프린트",
      "30m 가속",
      "바운딩",
      "A-Skip",
      "힙 플렉서 드릴"
    ]
  },


  /* =======================================================
     AGILITY
  ======================================================= */

  {
    id: "side-step",

    name: "사이드스텝",

    shortName: "사이드스텝",

    category: "agility",

    categoryName: "민첩성",

    ability: "민첩성 · 방향전환",

    description:
      "좌우 이동 속도와 중심 이동, 방향전환 자세를 분석합니다.",

    icon: "↔",

    analysisType: "agility",

    mainMetrics: [
      "changeOfDirection",
      "centerOfMass",
      "kneeControl",
      "symmetry",
      "cadence"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    weights: {
      speed: 15,
      power: 10,
      agility: 35,
      stability: 15,
      symmetry: 15,
      technique: 10
    },

    phases: [
      "중앙",
      "좌측 이동",
      "좌측 전환",
      "우측 이동",
      "우측 전환"
    ],

    feedbackFocus: [
      "중심 높이",
      "발 간격",
      "무릎 정렬",
      "방향전환",
      "좌우 대칭"
    ],

    training: [
      "라인 사이드스텝",
      "콘 셔틀",
      "라테럴 바운드",
      "스케이터 점프",
      "반응 스텝"
    ]
  },


  {
    id: "shuttle-run",

    name: "왕복달리기",

    shortName: "왕복달리기",

    category: "agility",

    categoryName: "민첩성",

    ability: "방향전환 · 스피드",

    description:
      "가속, 감속, 터치, 재가속 동작을 분석합니다.",

    icon: "⇆",

    analysisType: "agility",

    mainMetrics: [
      "acceleration",
      "deceleration",
      "turnSpeed",
      "trunkControl",
      "kneeControl"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    weights: {
      speed: 25,
      power: 10,
      agility: 30,
      stability: 10,
      symmetry: 10,
      technique: 15
    },

    phases: [
      "가속",
      "감속",
      "터치",
      "회전",
      "재가속"
    ],

    feedbackFocus: [
      "감속 자세",
      "중심 이동",
      "터치 자세",
      "회전",
      "재가속"
    ],

    training: [
      "5-10-5 셔틀",
      "콘 턴",
      "감속 드릴",
      "스플릿 스텝",
      "반응 셔틀"
    ]
  },


  /* =======================================================
     POWER
  ======================================================= */

  {
    id: "medicine-ball",

    name: "메디신볼 던지기",

    shortName: "메디신볼",

    category: "power",

    categoryName: "근파워",

    ability: "전신 파워",

    description:
      "하체에서 몸통과 상체로 이어지는 힘 전달 순서를 분석합니다.",

    icon: "●",

    analysisType: "throw",

    mainMetrics: [
      "hipDrive",
      "trunkExtension",
      "shoulderSpeed",
      "releaseAngle",
      "powerSequence"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "hip",
      "knee"
    ],

    weights: {
      speed: 10,
      power: 35,
      agility: 5,
      stability: 10,
      symmetry: 10,
      technique: 30
    },

    phases: [
      "준비",
      "하강",
      "하체 신전",
      "몸통 전달",
      "릴리스"
    ],

    feedbackFocus: [
      "하체 사용",
      "고관절 신전",
      "몸통 연결",
      "팔 릴리스",
      "릴리스각"
    ],

    training: [
      "메디신볼 스쿱 스로우",
      "오버헤드 스로우",
      "스쿼트 투 스로우",
      "힙 익스텐션",
      "코어 파워 드릴"
    ]
  },


  /* =======================================================
     STRENGTH
  ======================================================= */

  {
    id: "sit-up",

    name: "윗몸일으키기",

    shortName: "윗몸",

    category: "strength",

    categoryName: "근력",

    ability: "코어 근지구력",

    description:
      "반복 속도와 몸통 움직임의 일관성을 분석합니다.",

    icon: "⌁",

    analysisType: "repetition",

    mainMetrics: [
      "repetition",
      "tempo",
      "trunkRange",
      "consistency"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee"
    ],

    weights: {
      speed: 10,
      power: 10,
      agility: 5,
      stability: 25,
      symmetry: 15,
      technique: 35
    },

    phases: [
      "하강",
      "최저점",
      "상승",
      "최고점"
    ],

    feedbackFocus: [
      "가동범위",
      "반복 리듬",
      "몸통 제어",
      "좌우 흔들림"
    ],

    training: [
      "크런치",
      "데드버그",
      "플랭크",
      "할로우 홀드",
      "코어 서킷"
    ]
  },


  {
    id: "push-up",

    name: "팔굽혀펴기",

    shortName: "푸시업",

    category: "strength",

    categoryName: "근력",

    ability: "상체 근지구력",

    description:
      "팔꿈치 각도와 몸통 정렬, 반복 자세를 분석합니다.",

    icon: "▬",

    analysisType: "repetition",

    mainMetrics: [
      "elbowAngle",
      "trunkAlignment",
      "repetition",
      "tempo",
      "symmetry"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "hip",
      "ankle"
    ],

    weights: {
      speed: 5,
      power: 10,
      agility: 5,
      stability: 25,
      symmetry: 20,
      technique: 35
    },

    phases: [
      "준비",
      "하강",
      "최저점",
      "상승",
      "완전 신전"
    ],

    feedbackFocus: [
      "팔꿈치 각도",
      "몸통 정렬",
      "골반 위치",
      "좌우 대칭",
      "반복 리듬"
    ],

    training: [
      "푸시업",
      "템포 푸시업",
      "플랭크",
      "스캐풀라 푸시업",
      "인클라인 푸시업"
    ]
  },


  /* =======================================================
     ENDURANCE
  ======================================================= */

  {
    id: "long-run",

    name: "장거리 달리기",

    shortName: "장거리",

    category: "endurance",

    categoryName: "지구력",

    ability: "심폐지구력 · 러닝 효율",

    description:
      "러닝 자세의 안정성과 반복 동작 효율을 분석합니다.",

    icon: "∞",

    analysisType: "running",

    mainMetrics: [
      "cadence",
      "trunkAngle",
      "kneeDrive",
      "symmetry",
      "runningEconomy"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee",
      "ankle"
    ],

    weights: {
      speed: 15,
      power: 5,
      agility: 5,
      stability: 20,
      symmetry: 20,
      technique: 35
    },

    phases: [
      "접지",
      "지지",
      "밀기",
      "회수",
      "스윙"
    ],

    feedbackFocus: [
      "몸통 자세",
      "케이던스",
      "접지 위치",
      "좌우 대칭",
      "상하 움직임"
    ],

    training: [
      "러닝 드릴",
      "A-Skip",
      "케이던스 러닝",
      "싱글레그 안정화",
      "코어 러닝 드릴"
    ]
  },


  /* =======================================================
     THROW
  ======================================================= */

  {
    id: "softball-throw",

    name: "소프트볼 던지기",

    shortName: "소프트볼",

    category: "throw",

    categoryName: "투척",

    ability: "투척 파워 · 협응력",

    description:
      "하체부터 몸통, 어깨, 팔까지 힘 전달 순서를 분석합니다.",

    icon: "◉",

    analysisType: "throw",

    mainMetrics: [
      "hipRotation",
      "trunkRotation",
      "shoulderAngle",
      "elbowAngle",
      "releaseAngle"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "wrist",
      "hip"
    ],

    weights: {
      speed: 10,
      power: 30,
      agility: 5,
      stability: 10,
      symmetry: 10,
      technique: 35
    },

    phases: [
      "준비",
      "백스윙",
      "체중 이동",
      "회전",
      "릴리스",
      "팔로스루"
    ],

    feedbackFocus: [
      "체중 이동",
      "골반 회전",
      "몸통 회전",
      "팔꿈치",
      "릴리스"
    ],

    training: [
      "메디신볼 회전 던지기",
      "밴드 로테이션",
      "스텝 스로우",
      "코어 회전",
      "어깨 안정화"
    ]
  },


  /* =======================================================
     FLEXIBILITY
  ======================================================= */

  {
    id: "sit-and-reach",

    name: "좌전굴",

    shortName: "좌전굴",

    category: "flexibility",

    categoryName: "유연성",

    ability: "후면사슬 유연성",

    description:
      "골반과 몸통의 움직임을 구분하여 분석합니다.",

    icon: "⌄",

    analysisType: "flexibility",

    mainMetrics: [
      "hipFlexion",
      "trunkFlexion",
      "kneeExtension",
      "symmetry"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee",
      "ankle"
    ],

    weights: {
      speed: 0,
      power: 0,
      agility: 5,
      stability: 20,
      symmetry: 20,
      technique: 55
    },

    phases: [
      "준비",
      "전굴",
      "최대 도달",
      "유지"
    ],

    feedbackFocus: [
      "골반 굴곡",
      "무릎 신전",
      "몸통 움직임",
      "좌우 대칭"
    ],

    training: [
      "햄스트링 스트레칭",
      "힙 힌지",
      "고관절 가동성",
      "종아리 스트레칭"
    ]
  },


  /* =======================================================
     COORDINATION
  ======================================================= */

  {
    id: "basketball-dribble",

    name: "농구 드리블",

    shortName: "드리블",

    category: "coordination",

    categoryName: "협응",

    ability: "협응력 · 민첩성",

    description:
      "상하체 협응과 중심 이동을 분석합니다.",

    icon: "◇",

    analysisType: "coordination",

    mainMetrics: [
      "centerOfMass",
      "rhythm",
      "changeOfDirection",
      "trunkControl",
      "symmetry"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "wrist",
      "hip",
      "knee"
    ],

    weights: {
      speed: 15,
      power: 5,
      agility: 25,
      stability: 15,
      symmetry: 15,
      technique: 25
    },

    phases: [
      "접근",
      "드리블",
      "방향전환",
      "가속"
    ],

    feedbackFocus: [
      "중심 높이",
      "몸통 제어",
      "방향전환",
      "좌우 협응"
    ],

    training: [
      "콘 드리블",
      "크로스오버",
      "사이드 스텝",
      "반응 드리블"
    ]
  }

];


/* =========================================================
   03. EVENT HELPERS
========================================================= */

function getEventById(eventId) {

  if (!eventId) {
    return null;
  }

  return (
    PE_EVENTS.find(
      event => event.id === eventId
    ) || null
  );
}


function getEventByName(eventName) {

  if (!eventName) {
    return null;
  }

  return (
    PE_EVENTS.find(
      event =>
        event.name === eventName ||
        event.shortName === eventName
    ) || null
  );
}


function getEventsByCategory(categoryId) {

  if (!categoryId || categoryId === "all") {
    return [...PE_EVENTS];
  }

  return PE_EVENTS.filter(
    event => event.category === categoryId
  );
}


function searchEvents(keyword = "") {

  const query =
    String(keyword)
      .trim()
      .toLowerCase();

  if (!query) {
    return [...PE_EVENTS];
  }

  return PE_EVENTS.filter(event => {

    const searchText = [
      event.name,
      event.shortName,
      event.categoryName,
      event.ability,
      event.description,
      ...(event.feedbackFocus || [])
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(query);
  });
}


/* =========================================================
   04. EVENT SCORE WEIGHT
========================================================= */

function getEventWeights(eventId) {

  const event = getEventById(eventId);

  if (!event) {

    return {
      speed: 16.67,
      power: 16.67,
      agility: 16.67,
      stability: 16.67,
      symmetry: 16.66,
      technique: 16.66
    };
  }

  return {
    ...event.weights
  };
}


/* =========================================================
   05. EVENT PHASE
========================================================= */

function getEventPhases(eventId) {

  const event = getEventById(eventId);

  if (!event) {
    return ["준비", "동작", "완료"];
  }

  return [...event.phases];
}


/* =========================================================
   06. TRAINING
========================================================= */

function getEventTraining(eventId) {

  const event = getEventById(eventId);

  if (!event) {
    return [];
  }

  return [...event.training];
}


/* =========================================================
   07. FEEDBACK FOCUS
========================================================= */

function getEventFeedbackFocus(eventId) {

  const event = getEventById(eventId);

  if (!event) {
    return [];
  }

  return [...event.feedbackFocus];
}


/* =========================================================
   08. EVENT METRICS
========================================================= */

function getEventMetrics(eventId) {

  const event = getEventById(eventId);

  if (!event) {
    return [];
  }

  return [...event.mainMetrics];
}


/* =========================================================
   09. KEY JOINTS
========================================================= */

function getEventKeyJoints(eventId) {

  const event = getEventById(eventId);

  if (!event) {
    return [];
  }

  return [...event.keyJoints];
}


/* =========================================================
   10. TARGET ANGLES
========================================================= */

function getEventTargetAngles(eventId) {

  const event = getEventById(eventId);

  if (!event || !event.targetAngles) {
    return {};
  }

  return {
    ...event.targetAngles
  };
}


/* =========================================================
   11. PERFORMANCE LABEL
========================================================= */

const PERFORMANCE_LABELS = {

  speed: "스피드",

  power: "파워",

  agility: "민첩성",

  stability: "안정성",

  symmetry: "대칭성",

  technique: "기술"

};


/* =========================================================
   12. JOINT LABEL
========================================================= */

const JOINT_LABELS = {

  shoulder: "어깨",

  elbow: "팔꿈치",

  wrist: "손목",

  hip: "고관절",

  knee: "무릎",

  ankle: "발목"

};


/* =========================================================
   13. ANALYSIS TYPE LABEL
========================================================= */

const ANALYSIS_TYPE_LABELS = {

  jump: "점프 분석",

  sprint: "스프린트 분석",

  agility: "민첩성 분석",

  throw: "투척 분석",

  repetition: "반복 동작 분석",

  running: "러닝 분석",

  flexibility: "유연성 분석",

  coordination: "협응 분석"

};


/* =========================================================
   14. EVENT CARD HTML
========================================================= */

function createEventCardHTML(event) {

  if (!event) {
    return "";
  }

  return `
    <article
      class="event-card"
      data-event-id="${event.id}"
    >

      <span class="section-label">
        ${event.categoryName}
      </span>

      <h3>
        ${event.icon} ${event.name}
      </h3>

      <p>
        ${event.description}
      </p>

      <div
        style="
          margin-top:10px;
          color:#7f9bb1;
          font-size:9px;
        "
      >
        ${event.ability}
      </div>

      <button
        type="button"
        class="event-analysis-button"
        data-event-id="${event.id}"
      >
        영상 분석
      </button>

    </article>
  `;
}


/* =========================================================
   15. EVENT SELECT OPTION
========================================================= */

function createEventOptionHTML(event) {

  return `
    <option value="${event.id}">
      ${event.name}
    </option>
  `;
}


/* =========================================================
   16. CATEGORY BUTTON HTML
========================================================= */

function createCategoryButtonHTML(
  category,
  activeCategory = "all"
) {

  const active =
    category.id === activeCategory
      ? "active"
      : "";

  return `
    <button
      type="button"
      class="${active}"
      data-event-category="${category.id}"
    >
      ${category.name}
    </button>
  `;
}


/* =========================================================
   17. EVENT SUMMARY
========================================================= */

function createEventSummary(eventId) {

  const event = getEventById(eventId);

  if (!event) {
    return null;
  }

  return {

    id: event.id,

    name: event.name,

    shortName: event.shortName,

    category: event.category,

    categoryName: event.categoryName,

    ability: event.ability,

    analysisType: event.analysisType,

    phases: [...event.phases],

    metrics: [...event.mainMetrics],

    keyJoints: [...event.keyJoints],

    weights: {
      ...event.weights
    },

    feedbackFocus: [
      ...event.feedbackFocus
    ],

    training: [
      ...event.training
    ]

  };
}


/* =========================================================
   18. SCORE CALCULATION

   app.js에서
   calculateWeightedEventScore(eventId, metrics)
   로 사용 가능
========================================================= */

function calculateWeightedEventScore(
  eventId,
  metrics = {}
) {

  const weights =
    getEventWeights(eventId);

  let total = 0;
  let totalWeight = 0;

  Object.keys(weights).forEach(key => {

    const value =
      Number(metrics[key]);

    const weight =
      Number(weights[key]);

    if (
      Number.isFinite(value) &&
      Number.isFinite(weight)
    ) {

      total +=
        Math.max(
          0,
          Math.min(100, value)
        ) * weight;

      totalWeight += weight;
    }

  });

  if (totalWeight <= 0) {
    return 0;
  }

  return Math.round(
    total / totalWeight
  );
}


/* =========================================================
   19. SCORE GRADE
========================================================= */

function getPerformanceGrade(score) {

  const value =
    Number(score) || 0;

  if (value >= 95) {
    return "S+";
  }

  if (value >= 90) {
    return "S";
  }

  if (value >= 85) {
    return "A+";
  }

  if (value >= 80) {
    return "A";
  }

  if (value >= 75) {
    return "B+";
  }

  if (value >= 70) {
    return "B";
  }

  if (value >= 60) {
    return "C";
  }

  return "D";
}


/* =========================================================
   20. EVENT FEEDBACK GENERATOR
========================================================= */

function generateEventFeedback(
  eventId,
  metrics = {}
) {

  const event =
    getEventById(eventId);

  if (!event) {
    return [];
  }

  const feedback = [];

  const speed =
    Number(metrics.speed) || 0;

  const power =
    Number(metrics.power) || 0;

  const agility =
    Number(metrics.agility) || 0;

  const stability =
    Number(metrics.stability) || 0;

  const symmetry =
    Number(metrics.symmetry) || 0;

  const technique =
    Number(metrics.technique) || 0;


  if (power < 70) {

    feedback.push({
      type: "power",
      title: "파워 개선",
      text:
        "하체와 고관절의 힘을 동작 전체로 전달하는 능력을 개선할 필요가 있습니다."
    });

  }


  if (speed < 70) {

    feedback.push({
      type: "speed",
      title: "동작 속도 개선",
      text:
        "동작 전환 속도와 가속 구간의 움직임을 확인해 보세요."
    });

  }


  if (agility < 70) {

    feedback.push({
      type: "agility",
      title: "민첩성 개선",
      text:
        "방향전환 시 신체중심을 안정적으로 유지하는 것이 중요합니다."
    });

  }


  if (stability < 70) {

    feedback.push({
      type: "stability",
      title: "안정성 개선",
      text:
        "몸통과 골반의 흔들림을 줄이고 동작 중심을 안정적으로 유지해 보세요."
    });

  }


  if (symmetry < 75) {

    feedback.push({
      type: "symmetry",
      title: "좌우 대칭 확인",
      text:
        "좌우 관절 움직임 차이가 확인될 수 있으므로 양쪽 움직임을 비교해 보세요."
    });

  }


  if (technique < 75) {

    feedback.push({
      type: "technique",
      title: "기술 자세 개선",
      text:
        `${event.name}의 핵심 동작 단계와 관절 타이밍을 다시 확인하는 것이 좋습니다.`
    });

  }


  if (feedback.length === 0) {

    feedback.push({
      type: "good",
      title: "좋은 움직임",
      text:
        "현재 영상에서 전체적인 자세 안정성과 동작 연결이 양호합니다."
    });

  }

  return feedback;
}


/* =========================================================
   21. TRAINING RECOMMENDATION
========================================================= */

function generateTrainingRecommendation(
  eventId,
  metrics = {}
) {

  const event =
    getEventById(eventId);

  if (!event) {
    return [];
  }

  const recommendations = [];

  const values = {

    speed:
      Number(metrics.speed) || 0,

    power:
      Number(metrics.power) || 0,

    agility:
      Number(metrics.agility) || 0,

    stability:
      Number(metrics.stability) || 0,

    symmetry:
      Number(metrics.symmetry) || 0,

    technique:
      Number(metrics.technique) || 0

  };


  const sorted =
    Object.entries(values)
      .sort(
        (a, b) => a[1] - b[1]
      );


  const weakPoints =
    sorted
      .slice(0, 3)
      .map(item => item[0]);


  weakPoints.forEach(
    (weakPoint, index) => {

      let reason = "";

      switch (weakPoint) {

        case "speed":

          reason =
            "동작 속도와 가속 능력 향상";

          break;


        case "power":

          reason =
            "순발력과 힘 전달 능력 향상";

          break;


        case "agility":

          reason =
            "방향전환과 반응 능력 향상";

          break;


        case "stability":

          reason =
            "몸통과 관절 안정성 향상";

          break;


        case "symmetry":

          reason =
            "좌우 움직임 균형 향상";

          break;


        case "technique":

          reason =
            "종목 기술 동작 개선";

          break;

      }


      const exercise =
        event.training[
          index % event.training.length
        ];


      recommendations.push({

        title: exercise,

        reason,

        priority:
          index === 0
            ? "HIGH"
            : index === 1
              ? "MEDIUM"
              : "NORMAL"

      });

    }
  );


  return recommendations;
}


/* =========================================================
   22. JUMP ANALYSIS CONFIG
========================================================= */

const JUMP_ANALYSIS_CONFIG = {

  minimumFlightTime: 0.08,

  landingWindow: 0.35,

  centerTrackingLength: 160,

  takeoffAngleMin: 20,

  takeoffAngleMax: 55,

  idealTakeoffAngle: 35

};


/* =========================================================
   23. SPRINT ANALYSIS CONFIG
========================================================= */

const SPRINT_ANALYSIS_CONFIG = {

  minimumStepInterval: 0.12,

  maximumStepInterval: 1.2,

  trajectoryLength: 180,

  accelerationTrunkMin: 30,

  accelerationTrunkMax: 65

};


/* =========================================================
   24. SYMMETRY CONFIG
========================================================= */

const SYMMETRY_CONFIG = {

  excellentDifference: 5,

  goodDifference: 10,

  warningDifference: 15,

  poorDifference: 20

};


/* =========================================================
   25. ANGLE QUALITY
========================================================= */

function getAngleQuality(
  value,
  range
) {

  if (
    !Number.isFinite(Number(value)) ||
    !Array.isArray(range) ||
    range.length < 2
  ) {
    return {
      score: 0,
      status: "unknown"
    };
  }

  const angle =
    Number(value);

  const min =
    Number(range[0]);

  const max =
    Number(range[1]);

  if (
    angle >= min &&
    angle <= max
  ) {

    return {
      score: 100,
      status: "excellent"
    };
  }


  const difference =
    angle < min
      ? min - angle
      : angle - max;


  if (difference <= 5) {

    return {
      score: 90,
      status: "good"
    };
  }


  if (difference <= 10) {

    return {
      score: 75,
      status: "warning"
    };
  }


  if (difference <= 20) {

    return {
      score: 60,
      status: "poor"
    };
  }


  return {
    score: 40,
    status: "very-poor"
  };
}


/* =========================================================
   26. EVENT VALIDATION
========================================================= */

function validateEventData() {

  const ids = new Set();

  const errors = [];

  PE_EVENTS.forEach(event => {

    if (!event.id) {
      errors.push(
        "종목 ID가 없습니다."
      );
    }

    if (ids.has(event.id)) {
      errors.push(
        `중복 종목 ID: ${event.id}`
      );
    }

    ids.add(event.id);


    if (!event.name) {
      errors.push(
        `${event.id}: 종목명이 없습니다.`
      );
    }


    if (!event.category) {
      errors.push(
        `${event.id}: 카테고리가 없습니다.`
      );
    }


    if (!event.analysisType) {
      errors.push(
        `${event.id}: 분석 타입이 없습니다.`
      );
    }

  });


  return {
    valid: errors.length === 0,
    errors
  };
}


/* =========================================================
   27. WINDOW EXPORT

   app.js에서 window.PE_EVENTS 등으로 접근 가능
========================================================= */

window.EVENT_CATEGORIES =
  EVENT_CATEGORIES;

window.PE_EVENTS =
  PE_EVENTS;

window.PERFORMANCE_LABELS =
  PERFORMANCE_LABELS;

window.JOINT_LABELS =
  JOINT_LABELS;

window.ANALYSIS_TYPE_LABELS =
  ANALYSIS_TYPE_LABELS;

window.JUMP_ANALYSIS_CONFIG =
  JUMP_ANALYSIS_CONFIG;

window.SPRINT_ANALYSIS_CONFIG =
  SPRINT_ANALYSIS_CONFIG;

window.SYMMETRY_CONFIG =
  SYMMETRY_CONFIG;


window.getEventById =
  getEventById;

window.getEventByName =
  getEventByName;

window.getEventsByCategory =
  getEventsByCategory;

window.searchEvents =
  searchEvents;

window.getEventWeights =
  getEventWeights;

window.getEventPhases =
  getEventPhases;

window.getEventTraining =
  getEventTraining;

window.getEventFeedbackFocus =
  getEventFeedbackFocus;

window.getEventMetrics =
  getEventMetrics;

window.getEventKeyJoints =
  getEventKeyJoints;

window.getEventTargetAngles =
  getEventTargetAngles;

window.createEventCardHTML =
  createEventCardHTML;

window.createEventOptionHTML =
  createEventOptionHTML;

window.createCategoryButtonHTML =
  createCategoryButtonHTML;

window.createEventSummary =
  createEventSummary;

window.calculateWeightedEventScore =
  calculateWeightedEventScore;

window.getPerformanceGrade =
  getPerformanceGrade;

window.generateEventFeedback =
  generateEventFeedback;

window.generateTrainingRecommendation =
  generateTrainingRecommendation;

window.getAngleQuality =
  getAngleQuality;

window.validateEventData =
  validateEventData;


/* =========================================================
   28. STARTUP CHECK
========================================================= */

const EVENT_VALIDATION =
  validateEventData();


if (!EVENT_VALIDATION.valid) {

  console.error(
    "[EVENTS] 데이터 오류",
    EVENT_VALIDATION.errors
  );

} else {

  console.log(
    `[EVENTS] ${PE_EVENTS.length}개 체대입시 종목 로드 완료`
  );

}