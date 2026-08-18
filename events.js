/* =========================================================
   설천고 PE PERFORMANCE LAB
   EVENTS.JS
   VERSION 3.0

   역할
   ---------------------------------------------------------
   1. 체대입시 종목 데이터
   2. 종목 카테고리
   3. 종목별 측정 능력
   4. 종목별 핵심 관절
   5. 종목별 분석 기준
   6. 추천 훈련 데이터

   ※ 버튼 이벤트는 app.js에서 처리
========================================================= */

"use strict";


/* =========================================================
   01. EVENT CATEGORIES
========================================================= */

window.PE_EVENT_CATEGORIES = [
  {
    id: "all",
    name: "전체"
  },
  {
    id: "jump",
    name: "점프"
  },
  {
    id: "run",
    name: "달리기"
  },
  {
    id: "throw",
    name: "던지기"
  },
  {
    id: "strength",
    name: "근력"
  },
  {
    id: "agility",
    name: "민첩성"
  },
  {
    id: "flexibility",
    name: "유연성"
  },
  {
    id: "endurance",
    name: "지구력"
  }
];


/* =========================================================
   02. EVENT DATA
========================================================= */

window.PE_EVENTS = [

  /* =======================================================
     JUMP
  ======================================================= */

  {
    id: "standing-long-jump",

    name: "제자리멀리뛰기",

    category: "jump",

    categoryName: "점프",

    icon: "↗",

    ability: "순발력 · 하체 파워",

    description:
      "도약 준비부터 착지까지의 움직임을 분석합니다.",

    mainMetrics: [
      "점프 높이",
      "수평 이동",
      "이륙각",
      "고관절 각도",
      "무릎 각도",
      "착지 안정성"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle",
      "shoulder"
    ],

    phases: [
      "준비",
      "반동",
      "이륙",
      "비행",
      "착지"
    ],

    ideal: {
      takeoffAngle: {
        min: 25,
        max: 45
      },

      kneePreparation: {
        min: 80,
        max: 130
      },

      symmetryTolerance: 12
    },

    training: [
      "박스 점프",
      "스쿼트 점프",
      "브로드 점프",
      "하체 반응성 점프",
      "착지 안정화 훈련"
    ]
  },


  {
    id: "vertical-jump",

    name: "서전트 점프",

    category: "jump",

    categoryName: "점프",

    icon: "↑",

    ability: "수직 점프 · 폭발적 파워",

    description:
      "수직 도약 높이와 이륙 자세를 분석합니다.",

    mainMetrics: [
      "점프 높이",
      "비행시간",
      "이륙 속도",
      "무릎 신전",
      "고관절 신전",
      "팔 스윙"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle",
      "shoulder"
    ],

    phases: [
      "준비",
      "카운터무브먼트",
      "이륙",
      "최고점",
      "착지"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "카운터무브먼트 점프",
      "박스 점프",
      "포고 점프",
      "스쿼트",
      "점프 착지 훈련"
    ]
  },


  {
    id: "running-long-jump",

    name: "도움닫기 멀리뛰기",

    category: "jump",

    categoryName: "점프",

    icon: "➜",

    ability: "스피드 · 도약력",

    description:
      "도움닫기 속도와 발구름 타이밍을 분석합니다.",

    mainMetrics: [
      "접근 속도",
      "발구름 각도",
      "이륙각",
      "비행시간",
      "착지"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    phases: [
      "접근",
      "마지막 스텝",
      "발구름",
      "비행",
      "착지"
    ],

    ideal: {
      takeoffAngle: {
        min: 15,
        max: 30
      }
    },

    training: [
      "20m 가속주",
      "바운딩",
      "싱글 레그 점프",
      "발구름 드릴",
      "착지 드릴"
    ]
  },


  /* =======================================================
     RUN
  ======================================================= */

  {
    id: "50m",

    name: "50m 달리기",

    category: "run",

    categoryName: "달리기",

    icon: "⚡",

    ability: "가속 · 최고속도",

    description:
      "스타트와 가속 구간의 움직임을 분석합니다.",

    mainMetrics: [
      "케이던스",
      "스텝 수",
      "몸통 각도",
      "무릎 드라이브",
      "접지 패턴",
      "좌우 대칭"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle",
      "shoulder"
    ],

    phases: [
      "스타트",
      "초기가속",
      "가속",
      "최고속도",
      "피니시"
    ],

    ideal: {
      symmetryTolerance: 8
    },

    training: [
      "10m 스타트",
      "20m 가속주",
      "A스킵",
      "하이니",
      "바운딩"
    ]
  },


  {
    id: "100m",

    name: "100m 달리기",

    category: "run",

    categoryName: "달리기",

    icon: "⚡",

    ability: "스피드 · 가속",

    description:
      "질주 자세와 케이던스, 좌우 움직임을 분석합니다.",

    mainMetrics: [
      "케이던스",
      "스텝 수",
      "몸통 기울기",
      "고관절 움직임",
      "무릎 드라이브",
      "좌우 대칭"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle",
      "shoulder"
    ],

    phases: [
      "스타트",
      "가속",
      "최고속도",
      "속도유지",
      "피니시"
    ],

    ideal: {
      symmetryTolerance: 8
    },

    training: [
      "30m 가속주",
      "플라잉 스프린트",
      "A스킵",
      "바운딩",
      "스프린트 자세 드릴"
    ]
  },


  {
    id: "20m-shuttle-run",

    name: "20m 왕복 오래달리기",

    category: "endurance",

    categoryName: "지구력",

    icon: "⇆",

    ability: "심폐지구력 · 방향전환",

    description:
      "반복 달리기와 방향전환 동작을 분석합니다.",

    mainMetrics: [
      "턴 시간",
      "스텝 수",
      "감속 자세",
      "방향전환",
      "몸통 안정성"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    phases: [
      "가속",
      "주행",
      "감속",
      "턴",
      "재가속"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "셔틀런",
      "인터벌 러닝",
      "턴 드릴",
      "감속 드릴",
      "코어 안정화"
    ]
  },


  /* =======================================================
     AGILITY
  ======================================================= */

  {
    id: "10m-shuttle",

    name: "10m 왕복달리기",

    category: "agility",

    categoryName: "민첩성",

    icon: "⇆",

    ability: "민첩성 · 가속 · 감속",

    description:
      "빠른 방향전환과 재가속 능력을 분석합니다.",

    mainMetrics: [
      "턴 시간",
      "감속",
      "재가속",
      "몸통 기울기",
      "무릎 안정성"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    phases: [
      "출발",
      "가속",
      "감속",
      "턴",
      "재가속"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "5-10-5 셔틀",
      "콘 터치",
      "사이드 셔플",
      "감속 훈련",
      "방향전환 드릴"
    ]
  },


  {
    id: "side-step",

    name: "사이드스텝",

    category: "agility",

    categoryName: "민첩성",

    icon: "↔",

    ability: "측면 민첩성",

    description:
      "좌우 이동 속도와 자세 안정성을 분석합니다.",

    mainMetrics: [
      "좌우 이동",
      "케이던스",
      "고관절 각도",
      "무릎 안정성",
      "몸통 흔들림"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    phases: [
      "중앙",
      "좌측 이동",
      "전환",
      "우측 이동",
      "전환"
    ],

    ideal: {
      symmetryTolerance: 8
    },

    training: [
      "사이드 셔플",
      "밴드 사이드 워크",
      "라테랄 홉",
      "코어 안정화",
      "콘 드릴"
    ]
  },


  {
    id: "zigzag-run",

    name: "지그재그 달리기",

    category: "agility",

    categoryName: "민첩성",

    icon: "〽",

    ability: "방향전환 · 민첩성",

    description:
      "연속 방향전환 시 신체 기울기와 감속 능력을 분석합니다.",

    mainMetrics: [
      "방향전환 각도",
      "감속",
      "재가속",
      "몸통 기울기",
      "좌우 대칭"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle"
    ],

    phases: [
      "접근",
      "감속",
      "컷",
      "재가속"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "콘 지그재그",
      "45도 컷",
      "90도 컷",
      "싱글 레그 밸런스",
      "감속 드릴"
    ]
  },


  /* =======================================================
     THROW
  ======================================================= */

  {
    id: "medicine-ball",

    name: "메디신볼 던지기",

    category: "throw",

    categoryName: "던지기",

    icon: "●",

    ability: "상체 파워 · 전신 협응",

    description:
      "하체에서 상체로 전달되는 힘과 릴리스 동작을 분석합니다.",

    mainMetrics: [
      "몸통 회전",
      "어깨 각도",
      "팔꿈치 각도",
      "릴리스 타이밍",
      "하체 사용"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "hip",
      "knee"
    ],

    phases: [
      "준비",
      "로딩",
      "가속",
      "릴리스",
      "팔로스루"
    ],

    ideal: {
      symmetryTolerance: 12
    },

    training: [
      "메디신볼 체스트 패스",
      "오버헤드 스로우",
      "로테이션 스로우",
      "코어 회전 운동",
      "푸시프레스"
    ]
  },


  {
    id: "softball-throw",

    name: "소프트볼 던지기",

    category: "throw",

    categoryName: "던지기",

    icon: "◉",

    ability: "투척력 · 협응",

    description:
      "팔과 몸통의 회전 및 릴리스 타이밍을 분석합니다.",

    mainMetrics: [
      "어깨 회전",
      "팔꿈치 각도",
      "몸통 회전",
      "릴리스",
      "팔로스루"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "hip"
    ],

    phases: [
      "준비",
      "백스윙",
      "가속",
      "릴리스",
      "팔로스루"
    ],

    ideal: {
      symmetryTolerance: 15
    },

    training: [
      "밴드 외회전",
      "메디신볼 스로우",
      "스텝 스로우",
      "코어 회전",
      "견갑 안정화"
    ]
  },


  /* =======================================================
     STRENGTH
  ======================================================= */

  {
    id: "sit-up",

    name: "윗몸일으키기",

    category: "strength",

    categoryName: "근력",

    icon: "⌁",

    ability: "복근 근지구력",

    description:
      "반복 횟수와 몸통 움직임 패턴을 분석합니다.",

    mainMetrics: [
      "반복 횟수",
      "반복 속도",
      "몸통 각도",
      "좌우 대칭",
      "리듬"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee"
    ],

    phases: [
      "하강",
      "바닥",
      "상승",
      "완료"
    ],

    ideal: {
      symmetryTolerance: 10
    },

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

    category: "strength",

    categoryName: "근력",

    icon: "━",

    ability: "상체 근지구력",

    description:
      "팔꿈치 굽힘과 몸통 정렬을 분석합니다.",

    mainMetrics: [
      "반복 횟수",
      "팔꿈치 각도",
      "몸통 정렬",
      "반복 속도",
      "좌우 대칭"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "hip"
    ],

    phases: [
      "상단",
      "하강",
      "하단",
      "상승"
    ],

    ideal: {
      elbowBottom: {
        min: 65,
        max: 100
      },

      symmetryTolerance: 10
    },

    training: [
      "푸시업",
      "템포 푸시업",
      "플랭크",
      "덤벨 프레스",
      "견갑 푸시업"
    ]
  },


  {
    id: "pull-up",

    name: "턱걸이",

    category: "strength",

    categoryName: "근력",

    icon: "↑",

    ability: "상체 당기기 근력",

    description:
      "팔꿈치와 어깨 움직임 및 반복 동작을 분석합니다.",

    mainMetrics: [
      "반복 횟수",
      "팔꿈치 각도",
      "어깨 움직임",
      "몸통 흔들림",
      "좌우 대칭"
    ],

    keyJoints: [
      "shoulder",
      "elbow",
      "hip"
    ],

    phases: [
      "하단",
      "상승",
      "상단",
      "하강"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "밴드 풀업",
      "랫풀다운",
      "인버티드 로우",
      "데드행",
      "스캡 풀업"
    ]
  },


  {
    id: "squat",

    name: "스쿼트",

    category: "strength",

    categoryName: "근력",

    icon: "⌄",

    ability: "하체 근력 · 움직임 평가",

    description:
      "고관절, 무릎, 발목의 움직임과 좌우 대칭을 분석합니다.",

    mainMetrics: [
      "스쿼트 깊이",
      "무릎 각도",
      "고관절 각도",
      "발목 각도",
      "몸통 기울기",
      "좌우 대칭"
    ],

    keyJoints: [
      "hip",
      "knee",
      "ankle",
      "shoulder"
    ],

    phases: [
      "시작",
      "하강",
      "최저점",
      "상승",
      "완료"
    ],

    ideal: {
      kneeBottom: {
        min: 65,
        max: 110
      },

      symmetryTolerance: 10
    },

    training: [
      "고블릿 스쿼트",
      "템포 스쿼트",
      "스플릿 스쿼트",
      "발목 가동성",
      "코어 안정화"
    ]
  },


  /* =======================================================
     FLEXIBILITY
  ======================================================= */

  {
    id: "sit-and-reach",

    name: "좌전굴",

    category: "flexibility",

    categoryName: "유연성",

    icon: "⌒",

    ability: "햄스트링 · 허리 유연성",

    description:
      "몸통 전굴과 고관절 움직임을 분석합니다.",

    mainMetrics: [
      "몸통 각도",
      "고관절 굴곡",
      "무릎 유지",
      "좌우 대칭"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee"
    ],

    phases: [
      "준비",
      "전굴",
      "최대 도달",
      "복귀"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "햄스트링 스트레칭",
      "고관절 힌지",
      "종아리 스트레칭",
      "동적 유연성",
      "고관절 가동성"
    ]
  },


  {
    id: "trunk-flexion",

    name: "체전굴",

    category: "flexibility",

    categoryName: "유연성",

    icon: "↓",

    ability: "후면사슬 유연성",

    description:
      "고관절과 몸통의 전굴 패턴을 분석합니다.",

    mainMetrics: [
      "고관절 굴곡",
      "몸통 각도",
      "무릎 각도",
      "좌우 대칭"
    ],

    keyJoints: [
      "shoulder",
      "hip",
      "knee"
    ],

    phases: [
      "준비",
      "하강",
      "최대 전굴",
      "복귀"
    ],

    ideal: {
      symmetryTolerance: 10
    },

    training: [
      "햄스트링 스트레칭",
      "제퍼슨 컬 가동성",
      "고관절 힌지 드릴",
      "종아리 스트레칭"
    ]
  }
];


/* =========================================================
   03. EVENT MAP
========================================================= */

window.PE_EVENT_MAP = {};

window.PE_EVENTS.forEach(function (event) {
  window.PE_EVENT_MAP[event.id] = event;
});


/* =========================================================
   04. EVENT HELPERS
========================================================= */

/**
 * ID로 종목 찾기
 */
window.getPEEventById = function (eventId) {

  if (!eventId) {
    return null;
  }

  return window.PE_EVENT_MAP[eventId] || null;
};


/**
 * 카테고리 이름 반환
 */
window.getPECategoryName = function (categoryId) {

  const category =
    window.PE_EVENT_CATEGORIES.find(function (item) {
      return item.id === categoryId;
    });

  return category
    ? category.name
    : "";
};


/**
 * 카테고리 필터
 */
window.getPEEventsByCategory = function (categoryId) {

  if (!categoryId || categoryId === "all") {
    return [...window.PE_EVENTS];
  }

  return window.PE_EVENTS.filter(function (event) {
    return event.category === categoryId;
  });
};


/**
 * 종목 검색
 */
window.searchPEEvents = function (keyword) {

  const search =
    String(keyword || "")
      .trim()
      .toLowerCase();

  if (!search) {
    return [...window.PE_EVENTS];
  }

  return window.PE_EVENTS.filter(function (event) {

    const searchableText = [
      event.name,
      event.categoryName,
      event.ability,
      event.description,
      ...(event.mainMetrics || [])
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  });
};


/* =========================================================
   05. ANALYSIS METRIC LABELS
========================================================= */

window.PE_METRIC_LABELS = {

  speed: "스피드",

  power: "파워",

  agility: "민첩성",

  stability: "안정성",

  symmetry: "대칭성",

  technique: "기술"
};


/* =========================================================
   06. JOINT LABELS
========================================================= */

window.PE_JOINT_LABELS = {

  shoulder: "어깨",

  elbow: "팔꿈치",

  wrist: "손목",

  hip: "고관절",

  knee: "무릎",

  ankle: "발목"
};


/* =========================================================
   07. SCORE GRADE
========================================================= */

window.getPerformanceGrade = function (score) {

  const value = Number(score) || 0;

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
};


/* =========================================================
   08. SCORE DESCRIPTION
========================================================= */

window.getPerformanceDescription = function (score) {

  const value = Number(score) || 0;

  if (value >= 90) {
    return "매우 우수한 움직임 패턴입니다.";
  }

  if (value >= 80) {
    return "전반적으로 우수하며 일부 세부 동작을 개선할 수 있습니다.";
  }

  if (value >= 70) {
    return "기본적인 수행은 안정적이며 기술적인 개선 여지가 있습니다.";
  }

  if (value >= 60) {
    return "일부 움직임에서 자세와 안정성 개선이 필요합니다.";
  }

  return "기초 움직임 패턴부터 단계적으로 교정하는 것이 좋습니다.";
};


/* =========================================================
   09. EVENT FEEDBACK GENERATOR
========================================================= */

window.createEventFeedback = function (
  event,
  metrics,
  angles
) {

  const feedback = [];

  if (!event) {
    return feedback;
  }


  const symmetry =
    Number(metrics?.symmetry || 0);

  const stability =
    Number(metrics?.stability || 0);

  const technique =
    Number(metrics?.technique || 0);

  const power =
    Number(metrics?.power || 0);


  if (symmetry >= 85) {

    feedback.push({
      type: "good",
      title: "좌우 대칭성이 좋습니다.",
      text:
        "좌우 관절 움직임의 차이가 비교적 작게 나타났습니다."
    });

  } else {

    feedback.push({
      type: "warning",
      title: "좌우 움직임 차이를 확인하세요.",
      text:
        "왼쪽과 오른쪽의 관절각 또는 움직임 타이밍 차이가 나타났습니다."
    });

  }


  if (stability >= 85) {

    feedback.push({
      type: "good",
      title: "자세 안정성이 좋습니다.",
      text:
        "동작 중 신체 중심의 흔들림이 비교적 안정적입니다."
    });

  } else {

    feedback.push({
      type: "warning",
      title: "신체 중심 안정성을 개선하세요.",
      text:
        "동작 중 몸통 또는 신체 중심 이동이 크게 나타날 수 있습니다."
    });

  }


  if (technique >= 85) {

    feedback.push({
      type: "good",
      title: "기술 수행이 안정적입니다.",
      text:
        event.name +
        "의 주요 동작 패턴이 비교적 안정적으로 나타났습니다."
    });

  } else {

    feedback.push({
      type: "info",
      title: "종목별 핵심 자세를 점검하세요.",
      text:
        event.name +
        "에서 중요한 관절 위치와 타이밍을 핵심 프레임에서 확인하세요."
    });

  }


  if (
    event.category === "jump" &&
    power < 80
  ) {

    feedback.push({
      type: "info",
      title: "도약 파워 개선",
      text:
        "하체의 빠른 신전과 팔 스윙 타이밍을 함께 개선하면 도약 효율을 높이는 데 도움이 됩니다."
    });
  }


  if (
    event.category === "run" ||
    event.category === "agility"
  ) {

    feedback.push({
      type: "info",
      title: "접지와 재가속 확인",
      text:
        "발이 몸에서 지나치게 멀리 떨어져 접지되는지와 방향전환 후 첫 스텝을 확인하세요."
    });
  }


  if (
    event.category === "strength"
  ) {

    feedback.push({
      type: "info",
      title: "반복 자세 유지",
      text:
        "횟수가 증가해도 초기 반복과 비슷한 관절각과 몸통 정렬을 유지하는 것이 중요합니다."
    });
  }


  return feedback;
};


/* =========================================================
   10. TRAINING GENERATOR
========================================================= */

window.getEventTrainingRecommendations =
function (event) {

  if (!event) {
    return [];
  }

  return (event.training || []).map(
    function (trainingName, index) {

      return {
        title:
          (index + 1) +
          ". " +
          trainingName,

        description:
          event.name +
          " 수행 능력 향상을 위한 추천 훈련입니다."
      };
    }
  );
};


/* =========================================================
   11. EVENT SELECT OPTIONS
========================================================= */

window.createPEEventOptions =
function () {

  return window.PE_EVENTS
    .map(function (event) {

      return (
        '<option value="' +
        event.id +
        '">' +
        event.name +
        "</option>"
      );

    })
    .join("");
};


/* =========================================================
   12. DEVELOPMENT CHECK
========================================================= */

console.log(
  "[PE PERFORMANCE LAB] events.js loaded:",
  window.PE_EVENTS.length,
  "events"
);