/* =========================================================
   설천고 스포츠과학 분석센터 PRO
   events.js FINAL
   ========================================================= */

"use strict";


/* =========================================================
   전역 상태
========================================================= */

window.SC = window.SC || {};

SC.state = {

  currentPage: "dashboard",

  athletes: [],

  analyses: [],

  selectedAthlete: null,

  currentAnalysis: null,

  currentVideoURL: null,

  analysisRunning: false,

  frameNumber: 0,

  totalFrames: 0,

  fps: 30,

  playbackRate: 1,

  keyFrames: [],

  angleHistory: [],

  trajectory: [],

  lastPose: null,

  charts: {},

  settings: {
    skeleton: true,
    angles: true,
    baseline: true,
    keyframes: true
  }

};


/* =========================================================
   종목 데이터
========================================================= */

SC.sports = {

  체대입시: {

    category: "체대입시",

    icon: "◆",

    description:
      "체대입시 실기 종목별 자세와 기록을 분석합니다.",

    tests: [

      "20m 왕복달리기",
      "10m 왕복달리기",
      "50m 달리기",
      "100m 달리기",
      "제자리멀리뛰기",
      "서전트 점프",
      "메디신볼 던지기",
      "윗몸일으키기",
      "팔굽혀펴기",
      "좌전굴",
      "농구공 던지기",
      "농구 드리블",
      "배구",
      "축구 드리블"

    ],

    training: [

      {
        title: "하체 폭발력 강화",
        tag: "POWER",
        description:
          "스쿼트 점프와 박스 점프를 활용해 지면반력을 높입니다."
      },

      {
        title: "스프린트 가속 훈련",
        tag: "SPEED",
        description:
          "10~30m 구간의 초기 가속과 자세를 집중적으로 훈련합니다."
      },

      {
        title: "방향전환 훈련",
        tag: "AGILITY",
        description:
          "감속 → 방향전환 → 재가속 능력을 향상합니다."
      },

      {
        title: "코어 안정화",
        tag: "CORE",
        description:
          "몸통 흔들림을 줄이고 하체에서 발생한 힘을 효율적으로 전달합니다."
      },

      {
        title: "점프 착지 훈련",
        tag: "LANDING",
        description:
          "착지 시 무릎과 발목 정렬을 안정적으로 유지합니다."
      }

    ]

  },


  프리스키: {

    category: "동계종목",

    icon: "❄",

    description:
      "프리스타일 스키의 공중동작과 착지, 엣지 컨트롤을 분석합니다.",

    training: [

      {
        title: "싱글레그 밸런스",
        tag: "BALANCE",
        description:
          "한 발 지지 안정성과 엣지 컨트롤 능력을 향상합니다."
      },

      {
        title: "코어 회전 안정화",
        tag: "CORE",
        description:
          "회전 동작 중 상체와 골반의 분리를 안정화합니다."
      },

      {
        title: "착지 안정화",
        tag: "LANDING",
        description:
          "착지 순간 무릎·고관절 굴곡과 중심 위치를 개선합니다."
      },

      {
        title: "점프 파워",
        tag: "POWER",
        description:
          "하체 폭발력을 향상하여 도약 높이와 체공 안정성을 높입니다."
      }

    ]

  },


  롤러스키: {

    category: "동계종목",

    icon: "◈",

    description:
      "프리스타일 롤러스키의 스트라이드, 케이던스, 속도와 자세를 분석합니다.",

    metrics: [

      "속도",
      "거리",
      "케이던스",
      "스트라이드 길이",
      "좌우 스트라이드 균형",
      "상체 흔들림",
      "무릎각",
      "고관절각",
      "지면 접촉 시간",
      "추진 효율"

    ],

    training: [

      {
        title: "케이던스 인터벌",
        tag: "CADENCE",
        description:
          "높은 케이던스 구간과 회복 구간을 반복하여 리듬 유지 능력을 높입니다."
      },

      {
        title: "스트라이드 효율",
        tag: "TECHNIQUE",
        description:
          "한 번의 푸시에서 이동하는 거리와 체중이동을 개선합니다."
      },

      {
        title: "싱글레그 추진",
        tag: "BALANCE",
        description:
          "좌우 추진력 차이를 줄이고 한쪽 지지 안정성을 향상합니다."
      },

      {
        title: "폴링 타이밍",
        tag: "TIMING",
        description:
          "상체와 하체의 추진 타이밍을 동기화합니다."
      },

      {
        title: "업힐 더블폴",
        tag: "ENDURANCE",
        description:
          "오르막에서 상체와 코어를 이용한 추진 효율을 향상합니다."
      }

    ]

  },


  바이애슬론: {

    category: "동계종목",

    icon: "◎",

    description:
      "크로스컨트리 주행과 사격 구간을 분리하여 분석합니다.",

    metrics: [

      "주행 속도",
      "케이던스",
      "스트라이드",
      "심박 구간",
      "사격 진입 속도",
      "사격 준비 시간",
      "조준 안정성",
      "사격 소요 시간",
      "사격 후 이탈 시간",
      "전체 구간 시간"

    ],

    training: [

      {
        title: "사격 전 심박 안정화",
        tag: "SHOOTING",
        description:
          "주행 후 사격 구간에서 호흡과 자세를 빠르게 안정화하는 훈련입니다."
      },

      {
        title: "주행 → 사격 전환",
        tag: "TRANSITION",
        description:
          "주행 종료 후 사격 자세로 전환하는 시간을 줄입니다."
      },

      {
        title: "엎드린 자세 안정화",
        tag: "PRONE",
        description:
          "어깨·팔꿈치·몸통의 안정성과 조준 자세를 분석합니다."
      },

      {
        title: "입사 자세 안정화",
        tag: "STANDING",
        description:
          "입사격 자세에서 몸통 흔들림과 무게중심 이동을 개선합니다."
      },

      {
        title: "사격 후 재가속",
        tag: "TRANSITION",
        description:
          "사격 완료 후 빠르게 스키 동작으로 복귀하는 능력을 향상합니다."
      }

    ]

  },


  레이저공기총: {

    category: "사격",

    icon: "⊙",

    description:
      "레이저·공기총 영상에서 준비, 조준, 방아쇠 동작과 시간을 분석합니다.",

    metrics: [

      "준비 시간",
      "조준 시간",
      "조준 안정성",
      "방아쇠 동작",
      "사격 소요 시간",
      "발사 간격",
      "몸통 흔들림",
      "팔꿈치 안정성",
      "총구 흔들림",
      "회복 시간"

    ],

    training: [

      {
        title: "조준 안정화",
        tag: "AIM",
        description:
          "상체 흔들림과 조준 중 불필요한 움직임을 줄입니다."
      },

      {
        title: "방아쇠 컨트롤",
        tag: "TRIGGER",
        description:
          "방아쇠 동작 시 총기와 상체가 흔들리지 않도록 훈련합니다."
      },

      {
        title: "호흡 리듬",
        tag: "BREATH",
        description:
          "조준 구간의 호흡과 자세 안정성을 연계합니다."
      },

      {
        title: "사격 루틴 반복",
        tag: "ROUTINE",
        description:
          "준비 → 조준 → 발사 → 회복 루틴을 일정하게 유지합니다."
      }

    ]

  },


  화약총: {

    category: "사격",

    icon: "◉",

    description:
      "화약총 사격 동작의 자세·조준·발사 전후 움직임을 분석합니다.",

    metrics: [

      "준비 시간",
      "조준 안정화 시간",
      "사격 시간",
      "발사 간격",
      "총구 움직임",
      "상체 흔들림",
      "어깨 안정성",
      "팔꿈치 정렬",
      "사격 후 회복",
      "루틴 일관성"

    ],

    training: [

      {
        title: "사격 자세 안정화",
        tag: "STABILITY",
        description:
          "어깨와 몸통의 불필요한 움직임을 줄입니다."
      },

      {
        title: "조준 유지 훈련",
        tag: "AIM",
        description:
          "조준선 유지와 자세 안정성을 높입니다."
      },

      {
        title: "발사 루틴",
        tag: "ROUTINE",
        description:
          "준비부터 발사까지 일정한 루틴을 구축합니다."
      }

    ]

  },


  스켈레톤: {

    category: "동계종목",

    icon: "▰",

    description:
      "스타트와 주행 자세를 2D·3D 관점에서 분석합니다.",

    metrics: [

      "스타트 반응",
      "첫 5m",
      "10m",
      "20m",
      "가속도",
      "보폭",
      "케이던스",
      "상체 각도",
      "무릎각",
      "지면 접촉",
      "좌우 대칭",
      "스타트 자세"

    ],

    training: [

      {
        title: "스타트 폭발력",
        tag: "START",
        description:
          "초기 추진력과 첫 스텝의 지면반력을 향상합니다."
      },

      {
        title: "첫 10m 가속",
        tag: "ACCELERATION",
        description:
          "스타트 직후 신체각도와 보폭을 최적화합니다."
      },

      {
        title: "저중심 자세",
        tag: "POSITION",
        description:
          "가속 구간에서 몸통과 골반 위치를 안정화합니다."
      },

      {
        title: "푸시 동작",
        tag: "POWER",
        description:
          "하체 추진 방향과 지면반력 활용을 개선합니다."
      },

      {
        title: "좌우 균형",
        tag: "SYMMETRY",
        description:
          "좌우 추진 차이를 줄이고 직선 주행 효율을 높입니다."
      }

    ]

  },


  웨이트: {

    category: "웨이트",

    icon: "▣",

    description:
      "스쿼트·데드리프트·점프 등의 자세와 관절각을 분석합니다.",

    training: [

      {
        title: "스쿼트 패턴 교정",
        tag: "SQUAT",
        description:
          "무릎·고관절·발목의 협응과 기준선 정렬을 개선합니다."
      },

      {
        title: "힌지 패턴",
        tag: "HINGE",
        description:
          "고관절 중심의 움직임과 척추 안정성을 훈련합니다."
      },

      {
        title: "싱글레그 안정화",
        tag: "BALANCE",
        description:
          "좌우 하지 안정성과 골반 제어 능력을 높입니다."
      },

      {
        title: "코어 브레이싱",
        tag: "CORE",
        description:
          "중량 동작에서 몸통 안정성을 높입니다."
      }

    ]

  },


  농구: {

    category: "구기",

    icon: "●",

    description:
      "점프·착지·드리블·슈팅 동작을 분석합니다.",

    training: [

      {
        title: "점프 착지",
        tag: "LANDING",
        description:
          "착지 시 무릎과 발목 정렬을 개선합니다."
      },

      {
        title: "수직 점프",
        tag: "POWER",
        description:
          "도약 시 고관절과 무릎의 신전 타이밍을 개선합니다."
      },

      {
        title: "방향전환",
        tag: "AGILITY",
        description:
          "감속과 재가속 과정의 중심 이동을 최적화합니다."
      }

    ]

  },


  축구: {

    category: "구기",

    icon: "⚽",

    description:
      "달리기·킥·방향전환과 하체 움직임을 분석합니다.",

    training: [

      {
        title: "스프린트",
        tag: "SPEED",
        description:
          "가속과 최고속도 구간의 러닝 메커니즘을 개선합니다."
      },

      {
        title: "킥 메커니즘",
        tag: "KICK",
        description:
          "고관절 회전과 지지다리 정렬을 분석합니다."
      },

      {
        title: "컷팅",
        tag: "AGILITY",
        description:
          "방향전환 시 무릎·골반 정렬을 안정화합니다."
      }

    ]

  },


  육상: {

    category: "육상",

    icon: "↗",

    description:
      "스프린트 러닝의 보폭·케이던스·접지·자세를 분석합니다.",

    metrics: [

      "속도",
      "보폭",
      "케이던스",
      "접지 시간",
      "비행 시간",
      "수직 진동",
      "몸통각",
      "무릎각",
      "발목각",
      "좌우 대칭"

    ],

    training: [

      {
        title: "러닝 드릴",
        tag: "TECHNIQUE",
        description:
          "고관절과 발목의 협응을 개선합니다."
      },

      {
        title: "가속주",
        tag: "ACCELERATION",
        description:
          "초기 가속 구간의 전경각과 추진력을 향상합니다."
      },

      {
        title: "케이던스 훈련",
        tag: "CADENCE",
        description:
          "보폭과 케이던스의 균형을 최적화합니다."
      }

    ]

  }

};


/* =========================================================
   공통 유틸
========================================================= */

SC.utils = {

  uid(prefix = "id") {
    return (
      prefix +
      "_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 8)
    );
  },


  clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  },


  round(value, digits = 1) {

    const power =
      Math.pow(10, digits);

    return Math.round(
      value * power
    ) / power;

  },


  formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const mins =
      Math.floor(seconds / 60);

    const secs =
      Math.floor(seconds % 60);

    return (
      String(mins).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );

  },


  formatDate(timestamp) {

    const d =
      new Date(timestamp);

    return (
      d.getFullYear() +
      "." +
      String(
        d.getMonth() + 1
      ).padStart(2, "0") +
      "." +
      String(
        d.getDate()
      ).padStart(2, "0")
    );

  },


  distance(a, b) {

    if (!a || !b) {
      return 0;
    }

    return Math.sqrt(
      Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2)
    );

  },


  midpoint(a, b) {

    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    };

  },


  angle(a, b, c) {

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

    const dot =
      ab.x * cb.x +
      ab.y * cb.y;

    const magAB =
      Math.sqrt(
        ab.x * ab.x +
        ab.y * ab.y
      );

    const magCB =
      Math.sqrt(
        cb.x * cb.x +
        cb.y * cb.y
      );

    if (
      magAB === 0 ||
      magCB === 0
    ) {
      return null;
    }

    let cos =
      dot /
      (magAB * magCB);

    cos =
      Math.max(
        -1,
        Math.min(1, cos)
      );

    return (
      Math.acos(cos) *
      180 /
      Math.PI
    );

  },


  lineAngle(a, b) {

    if (!a || !b) {
      return null;
    }

    return (
      Math.atan2(
        b.y - a.y,
        b.x - a.x
      ) *
      180 /
      Math.PI
    );

  }

};


/* =========================================================
   종목 선택 시 추천훈련 데이터
========================================================= */

SC.getTraining = function(sport) {

  const data =
    SC.sports[sport];

  if (!data) {
    return [];
  }

  return data.training || [];

};


/* =========================================================
   분석 피드백 기본 데이터
========================================================= */

SC.feedbackRules = {

  knee: {

    low:
      "무릎 굴곡이 크게 나타납니다. 종목 특성에 따라 하체 안정성과 중심 이동을 확인하세요.",

    high:
      "무릎 신전이 크게 나타납니다. 추진 구간에서 과도한 신전 여부를 확인하세요."

  },


  trunk: {

    forward:
      "몸통 전경이 크게 나타납니다. 종목별 기준 자세와 비교해 보세요.",

    upright:
      "몸통이 비교적 세워져 있습니다. 추진 동작에서 중심 이동을 함께 확인하세요."

  },


  symmetry:
    "좌우 움직임의 차이를 분석했습니다. 반복 동작에서 한쪽으로 치우치는지 확인하세요."

};


/* =========================================================
   사격 시간 분석 설정
========================================================= */

SC.shootingMetrics = {

  preparation: 0,

  aiming: 0,

  shot: 0,

  recovery: 0,

  total: 0

};


/* =========================================================
   롤러스키 / 스키 이동 분석
========================================================= */

SC.motionMetrics = {

  distance: 0,

  speed: 0,

  cadence: 0,

  strideLength: 0,

  contactTime: 0,

  acceleration: 0

};


/* =========================================================
   핵심 프레임 판정 기준
========================================================= */

SC.keyFrameRules = {

  minimumGap: 0.8,

  maxFrames: 8,

  scoreThreshold: 0.35,

  priorities: [

    "maxFlexion",

    "maxExtension",

    "maxSpeed",

    "directionChange",

    "impact",

    "balanceChange",

    "transition"

  ]

};


/* =========================================================
   분석 상태 초기화
========================================================= */

SC.resetAnalysisState = function() {

  SC.state.frameNumber = 0;

  SC.state.totalFrames = 0;

  SC.state.keyFrames = [];

  SC.state.angleHistory = [];

  SC.state.trajectory = [];

  SC.state.lastPose = null;

  SC.state.currentAnalysis = null;

};


/* =========================================================
   종목별 분석 모드
========================================================= */

SC.getAnalysisMode = function(sport) {

  if (
    sport === "레이저공기총" ||
    sport === "화약총"
  ) {
    return "shooting";
  }

  if (
    sport === "롤러스키" ||
    sport === "바이애슬론"
  ) {
    return "ski";
  }

  if (
    sport === "스켈레톤"
  ) {
    return "skeleton";
  }

  if (
    sport === "웨이트" ||
    sport === "체대입시"
  ) {
    return "strength";
  }

  return "general";

};


/* =========================================================
   종목 픽토그램
========================================================= */

SC.getSportIcon = function(sport) {

  return (
    SC.sports[sport]?.icon ||
    "◆"
  );

};


/* =========================================================
   종목 표시명
========================================================= */

SC.getSportName = function(sport) {

  return sport || "종목 미지정";

};


/* =========================================================
   사격 분석 데이터 계산
========================================================= */

SC.calculateShootingTime = function(events) {

  if (!events || !events.length) {

    return {
      preparation: 0,
      aiming: 0,
      shot: 0,
      recovery: 0,
      total: 0
    };

  }

  const result = {

    preparation: 0,

    aiming: 0,

    shot: 0,

    recovery: 0,

    total: 0

  };


  events.forEach(event => {

    const duration =
      Number(event.duration) || 0;

    switch (event.type) {

      case "preparation":
        result.preparation += duration;
        break;

      case "aiming":
        result.aiming += duration;
        break;

      case "shot":
        result.shot += duration;
        break;

      case "recovery":
        result.recovery += duration;
        break;

    }

  });


  result.total =
    result.preparation +
    result.aiming +
    result.shot +
    result.recovery;


  return result;

};


/* =========================================================
   롤러스키 케이던스 계산
========================================================= */

SC.calculateCadence = function(
  timestamps,
  stepCount
) {

  if (
    !timestamps ||
    timestamps.length < 2 ||
    !stepCount
  ) {
    return 0;
  }

  const first =
    timestamps[0];

  const last =
    timestamps[
      timestamps.length - 1
    ];

  const duration =
    last - first;

  if (duration <= 0) {
    return 0;
  }

  return (
    stepCount /
    duration
  ) * 60;

};


/* =========================================================
   자동 피드백 생성
========================================================= */

SC.generateFeedback = function(result) {

  const feedback = [];

  if (!result) {
    return feedback;
  }


  if (
    Number(result.symmetry) < 80
  ) {

    feedback.push({

      type: "warning",

      title: "좌우 움직임 차이",

      text:
        "좌우 관절 움직임의 차이가 비교적 크게 나타났습니다. 반복 동작에서 좌우 추진과 체중 이동을 확인하세요."

    });

  } else {

    feedback.push({

      type: "positive",

      title: "좌우 균형",

      text:
        "좌우 움직임이 비교적 균형적으로 나타납니다."

    });

  }


  if (
    Number(result.alignment) >= 80
  ) {

    feedback.push({

      type: "positive",

      title: "기준선 정렬",

      text:
        "주요 관절의 기준선 정렬이 안정적으로 나타납니다."

    });

  } else {

    feedback.push({

      type: "warning",

      title: "기준선 확인",

      text:
        "일부 구간에서 기준선에서 벗어나는 움직임이 나타났습니다."

    });

  }


  if (
    Number(result.stability) >= 80
  ) {

    feedback.push({

      type: "positive",

      title: "자세 안정성",

      text:
        "분석 구간에서 몸통과 중심의 흔들림이 비교적 안정적입니다."

    });

  } else {

    feedback.push({

      type: "warning",

      title: "자세 안정성",

      text:
        "동작 중 중심 이동과 몸통 흔들림을 추가적으로 확인할 필요가 있습니다."

    });

  }


  return feedback;

};


/* =========================================================
   종목별 추천훈련 생성
========================================================= */

SC.generateTraining = function(
  sport,
  result
) {

  const training =
    SC.getTraining(sport);

  if (!training.length) {
    return [];
  }


  if (!result) {
    return training.slice(0, 6);
  }


  const selected = [];


  if (
    Number(result.symmetry) < 80
  ) {

    const symmetryTraining =
      training.find(item =>
        /균형|대칭|싱글|좌우|밸런스|symmetry/i
          .test(item.title + item.tag)
      );

    if (symmetryTraining) {
      selected.push(symmetryTraining);
    }

  }


  if (
    Number(result.stability) < 80
  ) {

    const stabilityTraining =
      training.find(item =>
        /안정|코어|자세|stability|core/i
          .test(item.title + item.tag)
      );

    if (stabilityTraining) {
      selected.push(stabilityTraining);
    }

  }


  if (
    Number(result.efficiency) < 80
  ) {

    const efficiencyTraining =
      training.find(item =>
        /효율|기술|추진|케이던스|스트라이드|technique|cadence/i
          .test(item.title + item.tag)
      );

    if (efficiencyTraining) {
      selected.push(efficiencyTraining);
    }

  }


  training.forEach(item => {

    if (
      selected.length < 6 &&
      !selected.includes(item)
    ) {
      selected.push(item);
    }

  });


  return selected.slice(0, 6);

};


/* =========================================================
   분석 점수 계산
========================================================= */

SC.calculateScore = function(metrics = {}) {

  const stability =
    SC.utils.clamp(
      Number(metrics.stability ?? 75),
      0,
      100
    );

  const alignment =
    SC.utils.clamp(
      Number(metrics.alignment ?? 75),
      0,
      100
    );

  const symmetry =
    SC.utils.clamp(
      Number(metrics.symmetry ?? 75),
      0,
      100
    );

  const efficiency =
    SC.utils.clamp(
      Number(metrics.efficiency ?? 75),
      0,
      100
    );


  const total =
    stability * .28 +
    alignment * .25 +
    symmetry * .22 +
    efficiency * .25;


  return {

    stability:
      Math.round(stability),

    alignment:
      Math.round(alignment),

    symmetry:
      Math.round(symmetry),

    efficiency:
      Math.round(efficiency),

    total:
      Math.round(total)

  };

};


/* =========================================================
   자동 핵심 프레임 점수
========================================================= */

SC.calculateKeyFrameImportance = function(frame) {

  if (!frame) {
    return 0;
  }


  let score = 0;


  if (
    Number.isFinite(frame.angleChange)
  ) {

    score +=
      Math.min(
        Math.abs(frame.angleChange) / 90,
        1
      ) * .30;

  }


  if (
    Number.isFinite(frame.speed)
  ) {

    score +=
      Math.min(
        Math.abs(frame.speed),
        1
      ) * .25;

  }


  if (
    Number.isFinite(frame.balanceChange)
  ) {

    score +=
      Math.min(
        Math.abs(frame.balanceChange),
        1
      ) * .25;

  }


  if (
    frame.event
  ) {
    score += .20;
  }


  return SC.utils.clamp(
    score,
    0,
    1
  );

};


/* =========================================================
   자동 핵심 프레임 추가
========================================================= */

SC.addKeyFrame = function(frame) {

  if (!frame) {
    return;
  }


  const importance =
    SC.calculateKeyFrameImportance(
      frame
    );


  if (
    importance <
    SC.keyFrameRules.scoreThreshold
  ) {
    return;
  }


  const last =
    SC.state.keyFrames[
      SC.state.keyFrames.length - 1
    ];


  if (
    last &&
    Math.abs(
      Number(frame.time) -
      Number(last.time)
    ) <
    SC.keyFrameRules.minimumGap
  ) {

    if (
      importance >
      Number(last.importance)
    ) {

      SC.state.keyFrames[
        SC.state.keyFrames.length - 1
      ] = {
        ...frame,
        importance
      };

    }

    return;
  }


  SC.state.keyFrames.push({

    ...frame,

    importance

  });


  SC.state.keyFrames.sort(
    (a, b) =>
      b.importance -
      a.importance
  );


  SC.state.keyFrames =
    SC.state.keyFrames.slice(
      0,
      SC.keyFrameRules.maxFrames
    );

};


/* =========================================================
   이벤트 헬퍼
========================================================= */

SC.events = {

  on(element, event, handler) {

    if (!element) {
      return;
    }

    element.addEventListener(
      event,
      handler
    );

  },


  byId(id) {

    return document.getElementById(id);

  },


  all(selector) {

    return document.querySelectorAll(
      selector
    );

  }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "[SC PRO] events.js loaded"
    );

  }
);