/* =========================================================
   설천고 PE PERFORMANCE LAB
   EVENTS.JS

   체대입시 실기 종목 데이터베이스
   ========================================================= */

"use strict";


/* =========================================================
   CATEGORY
========================================================= */

const EVENT_CATEGORIES = {

  all: {
    name: "전체",
    icon: "◎"
  },

  jump: {
    name: "점프",
    icon: "↗"
  },

  sprint: {
    name: "스피드",
    icon: "⚡"
  },

  agility: {
    name: "민첩성",
    icon: "◇"
  },

  throw: {
    name: "던지기",
    icon: "◉"
  },

  strength: {
    name: "근력",
    icon: "◆"
  },

  endurance: {
    name: "지구력",
    icon: "∞"
  },

  special: {
    name: "기타",
    icon: "✦"
  }

};


/* =========================================================
   EVENT DATABASE

   view
   side  = 측면
   front = 정면
   rear  = 후면

   higherIsBetter
   true  = 기록이 높을수록 좋음
   false = 기록이 낮을수록 좋음
========================================================= */

const PE_EVENTS = [

  /* =======================================================
     JUMP
  ======================================================= */

  {
    id: "standing-long-jump",

    name: "제자리멀리뛰기",

    category: "jump",

    icon: "🏃‍♂️",

    ability: "순발력 · 하지 폭발력",

    description:
      "양발 이륙을 이용해 수평 방향으로 최대 거리를 확보하는 대표적인 체대입시 실기 종목입니다.",

    unit: "cm",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "준비자세",
      "무릎각",
      "고관절각",
      "몸통각",
      "팔스윙",
      "이륙각",
      "신체중심 궤적",
      "최고점",
      "착지"
    ],

    phases: [
      "준비",
      "카운터무브먼트",
      "추진",
      "이륙",
      "비행",
      "착지"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: true,
    sprintAnalysis: false,

    tips: [
      "팔 스윙과 하지 신전을 연결합니다.",
      "이륙 직전 무릎과 고관절의 빠른 신전이 중요합니다.",
      "착지에서 발을 앞으로 보내면서 중심을 유지합니다."
    ]
  },


  {
    id: "vertical-jump",

    name: "서전트 점프",

    category: "jump",

    icon: "⬆️",

    ability: "수직 순발력 · 하지 파워",

    description:
      "제자리에서 최대한 높게 점프하여 수직 폭발력을 평가하는 종목입니다.",

    unit: "cm",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "무릎 굴곡",
      "고관절 굴곡",
      "팔스윙",
      "이륙",
      "비행시간",
      "최고점",
      "착지"
    ],

    phases: [
      "준비",
      "하강",
      "전환",
      "추진",
      "이륙",
      "최고점",
      "착지"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: true,
    sprintAnalysis: false,

    tips: [
      "하강 동작을 지나치게 깊게 만들지 않습니다.",
      "팔 스윙과 하지 신전을 동시에 연결합니다.",
      "이륙 순간 발목까지 빠르게 신전합니다."
    ]
  },


  {
    id: "standing-triple-jump",

    name: "제자리 세단뛰기",

    category: "jump",

    icon: "↗️",

    ability: "순발력 · 연속 점프 능력",

    description:
      "연속적인 도약을 통해 폭발력과 착지 후 재추진 능력을 평가합니다.",

    unit: "cm",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "첫 이륙",
      "착지 위치",
      "접지시간",
      "재추진",
      "신체중심",
      "착지 안정성"
    ],

    phases: [
      "준비",
      "1차 이륙",
      "1차 착지",
      "2차 추진",
      "2차 착지",
      "최종 도약",
      "착지"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: true,
    sprintAnalysis: false,

    tips: [
      "각 도약 사이 속도 손실을 줄입니다.",
      "착지 직후 빠르게 다음 추진으로 연결합니다.",
      "상체가 과도하게 뒤로 넘어가지 않게 유지합니다."
    ]
  },


  {
    id: "standing-high-jump",

    name: "제자리 높이뛰기",

    category: "jump",

    icon: "🔝",

    ability: "수직 파워 · 점프 능력",

    description:
      "제자리에서 수직 방향 폭발력을 평가하는 점프 계열 종목입니다.",

    unit: "cm",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "무릎각",
      "고관절각",
      "이륙",
      "최고점",
      "신체중심"
    ],

    phases: [
      "준비",
      "하강",
      "추진",
      "이륙",
      "비행",
      "착지"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: true,
    sprintAnalysis: false,

    tips: [
      "수직 방향으로 힘을 전달합니다.",
      "이륙 시 발목까지 완전히 연결합니다."
    ]
  },


  /* =======================================================
     SPRINT
  ======================================================= */

  {
    id: "10m-sprint",

    name: "10m 달리기",

    category: "sprint",

    icon: "⚡",

    ability: "초기 가속",

    description:
      "짧은 거리에서 출발 반응과 초기 가속 능력을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "출발 자세",
      "첫 스텝",
      "몸통 기울기",
      "보폭",
      "케이던스",
      "가속"
    ],

    phases: [
      "준비",
      "출발",
      "초기 가속",
      "가속"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "첫 스텝에서 몸을 너무 빨리 세우지 않습니다.",
      "초기 구간에서는 전방 추진에 집중합니다.",
      "팔 동작과 다리 동작의 리듬을 맞춥니다."
    ]
  },


  {
    id: "20m-sprint",

    name: "20m 달리기",

    category: "sprint",

    icon: "🏃",

    ability: "가속력 · 스피드",

    description:
      "출발 이후 가속 과정과 짧은 거리 스피드를 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "출발",
      "가속",
      "보폭",
      "케이던스",
      "몸통각",
      "접지 위치"
    ],

    phases: [
      "출발",
      "초기 가속",
      "중간 가속",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "초반 가속 구간에서 전방 추진을 유지합니다.",
      "발이 신체 중심보다 지나치게 앞에서 닿지 않도록 합니다."
    ]
  },


  {
    id: "30m-sprint",

    name: "30m 달리기",

    category: "sprint",

    icon: "💨",

    ability: "가속력 · 질주 능력",

    description:
      "가속에서 높은 질주 속도로 전환되는 과정을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "출발",
      "가속",
      "보폭",
      "케이던스",
      "접지",
      "상체 자세"
    ],

    phases: [
      "출발",
      "가속",
      "전환",
      "질주",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "가속 후 상체를 자연스럽게 세웁니다.",
      "보폭을 억지로 늘리기보다 빠른 지면 반발을 사용합니다."
    ]
  },


  {
    id: "50m-sprint",

    name: "50m 달리기",

    category: "sprint",

    icon: "🏁",

    ability: "스피드",

    description:
      "가속과 최고 속도 유지 능력을 함께 평가하는 단거리 종목입니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "출발",
      "가속",
      "최고속도",
      "보폭",
      "케이던스",
      "피니시"
    ],

    phases: [
      "출발",
      "가속",
      "최고속도",
      "속도 유지",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "가속과 최고속도 구간을 구분합니다.",
      "최고속도에서 불필요한 상체 긴장을 줄입니다."
    ]
  },


  {
    id: "100m-sprint",

    name: "100m 달리기",

    category: "sprint",

    icon: "🏃‍♂️",

    ability: "스피드 · 속도 유지",

    description:
      "출발, 가속, 최고속도 및 후반 속도 유지 능력을 종합 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "출발",
      "가속",
      "최고속도",
      "질주 자세",
      "피니시"
    ],

    phases: [
      "스타트",
      "가속",
      "최고속도",
      "속도 유지",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "구간별 달리기 전략을 구분합니다.",
      "후반부에도 팔 동작과 자세를 유지합니다."
    ]
  },


  /* =======================================================
     AGILITY
  ======================================================= */

  {
    id: "side-step",

    name: "사이드스텝",

    category: "agility",

    icon: "↔️",

    ability: "민첩성 · 방향전환",

    description:
      "좌우 반복 이동을 통해 측면 이동 속도와 방향전환 능력을 평가합니다.",

    unit: "count",

    higherIsBetter: true,

    view: "front",

    metrics: [
      "좌우 이동",
      "무릎 굴곡",
      "골반 높이",
      "신체중심",
      "방향전환",
      "좌우 대칭"
    ],

    phases: [
      "중앙",
      "좌측 이동",
      "좌측 전환",
      "중앙",
      "우측 이동",
      "우측 전환"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "신체 중심을 지나치게 높이지 않습니다.",
      "방향전환 직전 감속을 최소화합니다.",
      "좌우 움직임의 차이를 줄입니다."
    ]
  },


  {
    id: "shuttle-run",

    name: "왕복달리기",

    category: "agility",

    icon: "🔁",

    ability: "민첩성 · 가속 · 감속",

    description:
      "직선 가속과 급격한 방향전환 능력을 동시에 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "가속",
      "감속",
      "방향전환",
      "접지",
      "재가속"
    ],

    phases: [
      "출발",
      "가속",
      "감속",
      "턴",
      "재가속",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "턴 직전 보폭을 조절해 중심을 낮춥니다.",
      "방향전환 후 첫 스텝을 빠르게 연결합니다."
    ]
  },


  {
    id: "10m-shuttle",

    name: "10m 왕복달리기",

    category: "agility",

    icon: "↔",

    ability: "가속 · 감속 · 민첩성",

    description:
      "10m 구간을 반복 이동하며 가속과 방향전환 능력을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "출발",
      "가속",
      "감속",
      "턴",
      "재가속"
    ],

    phases: [
      "출발",
      "가속",
      "턴 준비",
      "턴",
      "재가속"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "턴 전에 중심을 낮춥니다.",
      "턴 이후 몸을 진행 방향으로 빠르게 기울입니다."
    ]
  },


  {
    id: "zigzag-run",

    name: "지그재그런",

    category: "agility",

    icon: "〽️",

    ability: "민첩성 · 방향전환",

    description:
      "여러 방향으로 연속 이동하며 방향전환 능력을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "front",

    metrics: [
      "방향전환",
      "몸통 기울기",
      "무릎 안정성",
      "좌우 대칭",
      "이동 궤적"
    ],

    phases: [
      "출발",
      "진입",
      "방향전환",
      "재가속",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "방향전환 때 무릎과 발의 진행 방향을 맞춥니다.",
      "상체와 골반이 지나치게 흔들리지 않게 합니다."
    ]
  },


  {
    id: "pro-agility",

    name: "프로 어질리티",

    category: "agility",

    icon: "⚡",

    ability: "민첩성 · 방향전환",

    description:
      "좌우 방향전환과 재가속 능력을 측정하는 민첩성 테스트입니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "front",

    metrics: [
      "첫 방향",
      "턴",
      "감속",
      "재가속",
      "좌우 차이"
    ],

    phases: [
      "스타트",
      "1차 이동",
      "1차 턴",
      "2차 이동",
      "2차 턴",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "첫 스텝에서 중심 이동을 빠르게 만듭니다.",
      "좌우 턴의 시간 차이를 확인합니다."
    ]
  },


  /* =======================================================
     THROW
  ======================================================= */

  {
    id: "medicine-ball-forward",

    name: "메디신볼 던지기",

    category: "throw",

    icon: "🏐",

    ability: "전신 파워 · 상체 폭발력",

    description:
      "하지와 몸통, 상지의 힘 전달을 이용해 공을 전방으로 던지는 종목입니다.",

    unit: "m",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "하지 신전",
      "고관절",
      "몸통",
      "어깨",
      "팔꿈치",
      "릴리스"
    ],

    phases: [
      "준비",
      "로딩",
      "하지 추진",
      "몸통 신전",
      "릴리스",
      "팔로스루"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "팔 힘만 사용하지 않고 하지부터 힘을 전달합니다.",
      "몸통 신전과 팔 동작의 타이밍을 연결합니다.",
      "릴리스 이후에도 동작을 자연스럽게 이어갑니다."
    ]
  },


  {
    id: "medicine-ball-backward",

    name: "메디신볼 후방던지기",

    category: "throw",

    icon: "💥",

    ability: "전신 폭발력",

    description:
      "전신 신전력을 이용하여 메디신볼을 후방으로 던지는 파워 테스트입니다.",

    unit: "m",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "무릎",
      "고관절",
      "몸통",
      "팔스윙",
      "릴리스각"
    ],

    phases: [
      "준비",
      "로딩",
      "신전",
      "릴리스",
      "팔로스루"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "하지-고관절-몸통 순으로 힘을 연결합니다.",
      "릴리스 시점을 일정하게 유지합니다."
    ]
  },


  {
    id: "softball-throw",

    name: "소프트볼 던지기",

    category: "throw",

    icon: "🥎",

    ability: "투척 파워 · 협응력",

    description:
      "전신 회전과 상지 움직임을 이용하여 투척 거리를 평가합니다.",

    unit: "m",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "스텝",
      "골반 회전",
      "몸통 회전",
      "어깨",
      "팔꿈치",
      "릴리스"
    ],

    phases: [
      "준비",
      "스텝",
      "골반 회전",
      "몸통 회전",
      "릴리스",
      "팔로스루"
    ],

    keyAngles: {
      knee: false,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "하체와 골반 회전을 먼저 사용합니다.",
      "몸통과 팔의 순차적인 회전을 연결합니다."
    ]
  },


  /* =======================================================
     STRENGTH
  ======================================================= */

  {
    id: "back-strength",

    name: "배근력",

    category: "strength",

    icon: "💪",

    ability: "등 · 하지 · 전신 근력",

    description:
      "배근력계를 이용하여 몸통과 하지의 최대 등척성 근력을 평가합니다.",

    unit: "kg",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "무릎각",
      "고관절각",
      "몸통각",
      "척추 자세",
      "좌우 안정성"
    ],

    phases: [
      "준비",
      "세팅",
      "힘 발휘",
      "최대 힘",
      "종료"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: false
    },

    trajectory: false,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "측정 규정에 맞는 시작 자세를 유지합니다.",
      "측정 중 몸통 자세가 크게 변하지 않게 합니다."
    ]
  },


  {
    id: "grip-strength",

    name: "악력",

    category: "strength",

    icon: "✊",

    ability: "전완 · 손 근력",

    description:
      "악력계를 이용하여 손과 전완의 최대 근력을 평가합니다.",

    unit: "kg",

    higherIsBetter: true,

    view: "front",

    metrics: [
      "어깨 높이",
      "팔 위치",
      "몸통 기울기",
      "좌우 차이"
    ],

    phases: [
      "준비",
      "세팅",
      "최대 수축",
      "종료"
    ],

    keyAngles: {
      knee: false,
      hip: false,
      ankle: false,
      trunk: true,
      elbow: true
    },

    trajectory: false,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "측정 규정에 맞는 팔 위치를 유지합니다.",
      "몸통 반동을 최소화합니다."
    ]
  },


  {
    id: "sit-up",

    name: "윗몸일으키기",

    category: "strength",

    icon: "🔄",

    ability: "복근 지구력",

    description:
      "정해진 시간 동안 반복 수행하여 몸통 근지구력을 평가합니다.",

    unit: "count",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "몸통각",
      "고관절",
      "반복수",
      "반복 속도",
      "동작 범위"
    ],

    phases: [
      "하강",
      "최저점",
      "상승",
      "완료"
    ],

    keyAngles: {
      knee: false,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: false
    },

    trajectory: false,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "반복마다 동일한 동작 범위를 유지합니다.",
      "후반부 동작 범위 감소를 확인합니다."
    ]
  },


  {
    id: "push-up",

    name: "팔굽혀펴기",

    category: "strength",

    icon: "⬇️",

    ability: "상체 근지구력",

    description:
      "상체와 몸통의 안정성을 유지하며 반복 수행 능력을 평가합니다.",

    unit: "count",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "팔꿈치각",
      "몸통 정렬",
      "고관절",
      "반복수",
      "반복 속도"
    ],

    phases: [
      "상단",
      "하강",
      "최저점",
      "상승"
    ],

    keyAngles: {
      knee: false,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: true
    },

    trajectory: false,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "머리부터 발까지 정렬을 유지합니다.",
      "반복마다 비슷한 팔꿈치 굴곡을 유지합니다."
    ]
  },


  {
    id: "pull-up",

    name: "턱걸이",

    category: "strength",

    icon: "⬆",

    ability: "상체 근력 · 근지구력",

    description:
      "상체 당기기 능력과 반복 수행 능력을 평가합니다.",

    unit: "count",

    higherIsBetter: true,

    view: "front",

    metrics: [
      "팔꿈치",
      "어깨",
      "몸통 흔들림",
      "좌우 대칭",
      "반복수"
    ],

    phases: [
      "하단",
      "상승",
      "상단",
      "하강"
    ],

    keyAngles: {
      knee: false,
      hip: false,
      ankle: false,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "좌우 팔의 움직임 차이를 확인합니다.",
      "불필요한 몸통 반동을 줄입니다."
    ]
  },


  /* =======================================================
     ENDURANCE
  ======================================================= */

  {
    id: "20m-shuttle-run",

    name: "20m 왕복 오래달리기",

    category: "endurance",

    icon: "🔁",

    ability: "심폐지구력",

    description:
      "20m 구간을 반복하여 달리며 심폐지구력을 평가합니다.",

    unit: "count",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "러닝 자세",
      "턴",
      "케이던스",
      "후반 자세 변화"
    ],

    phases: [
      "초반",
      "중반",
      "후반",
      "종료"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "턴에서 불필요한 에너지 소모를 줄입니다.",
      "후반에도 상체 자세와 팔 동작을 유지합니다."
    ]
  },


  {
    id: "1000m-run",

    name: "1000m 달리기",

    category: "endurance",

    icon: "🏃",

    ability: "심폐지구력 · 스피드 지구력",

    description:
      "중거리 달리기를 통해 심폐지구력과 페이스 유지 능력을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "러닝 자세",
      "케이던스",
      "보폭",
      "몸통각",
      "후반 자세 변화"
    ],

    phases: [
      "초반",
      "중반",
      "후반",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "초반 오버페이스를 피합니다.",
      "후반에도 자세가 무너지지 않게 합니다."
    ]
  },


  {
    id: "1200m-run",

    name: "1200m 달리기",

    category: "endurance",

    icon: "🏃‍♂️",

    ability: "심폐지구력",

    description:
      "중거리 주행에서 페이스 유지와 달리기 효율을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "보폭",
      "케이던스",
      "몸통",
      "접지",
      "후반 변화"
    ],

    phases: [
      "초반",
      "중반",
      "후반",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "구간별 페이스를 일정하게 관리합니다.",
      "피로 시 보폭과 케이던스 변화를 확인합니다."
    ]
  },


  {
    id: "1500m-run",

    name: "1500m 달리기",

    category: "endurance",

    icon: "🏃",

    ability: "심폐지구력 · 페이스 유지",

    description:
      "중장거리 주행 능력과 후반 자세 유지 능력을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "side",

    metrics: [
      "러닝 자세",
      "케이던스",
      "보폭",
      "접지",
      "피로 변화"
    ],

    phases: [
      "초반",
      "중반",
      "후반",
      "라스트",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "페이스 변화에 따른 자세 변화를 확인합니다.",
      "후반부 상체 긴장을 줄입니다."
    ]
  },


  /* =======================================================
     SPECIAL / FLEXIBILITY / COORDINATION
  ======================================================= */

  {
    id: "sit-and-reach",

    name: "좌전굴",

    category: "special",

    icon: "🧘",

    ability: "유연성",

    description:
      "앉은 자세에서 상체를 앞으로 굽혀 햄스트링과 허리 주변의 유연성을 평가합니다.",

    unit: "cm",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "고관절 굴곡",
      "몸통 굴곡",
      "무릎 유지",
      "좌우 대칭"
    ],

    phases: [
      "준비",
      "전방 이동",
      "최대 도달",
      "복귀"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "무릎이 과도하게 굽혀지지 않도록 합니다.",
      "반동보다 일정한 움직임으로 최대 지점에 도달합니다."
    ]
  },


  {
    id: "trunk-flexion",

    name: "체전굴",

    category: "special",

    icon: "↘️",

    ability: "유연성",

    description:
      "몸통과 고관절의 전방 굴곡 범위를 평가합니다.",

    unit: "cm",

    higherIsBetter: true,

    view: "side",

    metrics: [
      "몸통각",
      "고관절",
      "무릎",
      "최대 도달"
    ],

    phases: [
      "준비",
      "굴곡",
      "최대 도달",
      "복귀"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: false,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: false,

    tips: [
      "고관절과 몸통의 움직임을 구분해서 확인합니다.",
      "좌우 비대칭을 확인합니다."
    ]
  },


  {
    id: "basketball-dribble",

    name: "농구 드리블",

    category: "special",

    icon: "🏀",

    ability: "협응력 · 민첩성",

    description:
      "드리블과 방향전환을 포함한 복합 움직임의 수행 능력을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "front",

    metrics: [
      "중심 이동",
      "방향전환",
      "무릎",
      "몸통",
      "좌우 대칭"
    ],

    phases: [
      "출발",
      "드리블",
      "방향전환",
      "재가속",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: true
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "방향전환에서 신체 중심을 낮게 유지합니다.",
      "좌우 방향의 수행 차이를 확인합니다."
    ]
  },


  {
    id: "soccer-dribble",

    name: "축구 드리블",

    category: "special",

    icon: "⚽",

    ability: "협응력 · 민첩성",

    description:
      "볼 컨트롤과 방향전환을 포함한 복합 민첩성을 평가합니다.",

    unit: "sec",

    higherIsBetter: false,

    view: "front",

    metrics: [
      "이동 궤적",
      "방향전환",
      "골반",
      "무릎",
      "좌우 대칭"
    ],

    phases: [
      "출발",
      "드리블",
      "턴",
      "재가속",
      "피니시"
    ],

    keyAngles: {
      knee: true,
      hip: true,
      ankle: true,
      trunk: true,
      elbow: false
    },

    trajectory: true,
    jumpAnalysis: false,
    sprintAnalysis: true,

    tips: [
      "방향전환 시 중심 이동을 확인합니다.",
      "좌우 발 사용 차이를 비교합니다."
    ]
  }

];


/* =========================================================
   COMMON ANALYSIS CONFIG
========================================================= */

const MOTION_ANALYSIS_CONFIG = {

  /* MediaPipe Pose landmark count */
  landmarkCount: 33,

  visibilityThreshold: 0.45,

  /* 그래프 최대 저장 포인트 */
  maxGraphPoints: 300,

  /* 궤적 최대 포인트 */
  maxTrajectoryPoints: 250,

  /* 자동 핵심 프레임 */
  maxKeyFrames: 8,

  /* 자세 점수 */
  scoreMax: 100,

  /* 프레임 이동 */
  estimatedFPS: 30,

  playbackSpeeds: [
    0.1,
    0.25,
    0.5,
    1,
    1.5,
    2
  ],

  overlay: {
    skeleton: true,
    angles: true,
    trajectory: true,
    reference: true,
    centerOfMass: true
  }

};


/* =========================================================
   LANDMARK INDEX

   MediaPipe Pose 33 landmarks
========================================================= */

const POSE_LANDMARKS = {

  nose: 0,

  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,

  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,

  leftEar: 7,
  rightEar: 8,

  mouthLeft: 9,
  mouthRight: 10,

  leftShoulder: 11,
  rightShoulder: 12,

  leftElbow: 13,
  rightElbow: 14,

  leftWrist: 15,
  rightWrist: 16,

  leftPinky: 17,
  rightPinky: 18,

  leftIndex: 19,
  rightIndex: 20,

  leftThumb: 21,
  rightThumb: 22,

  leftHip: 23,
  rightHip: 24,

  leftKnee: 25,
  rightKnee: 26,

  leftAnkle: 27,
  rightAnkle: 28,

  leftHeel: 29,
  rightHeel: 30,

  leftFootIndex: 31,
  rightFootIndex: 32

};


/* =========================================================
   SKELETON CONNECTIONS

   app.js에서 직접 사용할 수 있음
========================================================= */

const CUSTOM_POSE_CONNECTIONS = [

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
  [27, 31],

  [28, 30],
  [30, 32],
  [28, 32]

];


/* =========================================================
   ANGLE DEFINITIONS
========================================================= */

const ANGLE_DEFINITIONS = {

  leftKnee: {
    name: "왼쪽 무릎",
    points: [23, 25, 27]
  },

  rightKnee: {
    name: "오른쪽 무릎",
    points: [24, 26, 28]
  },

  leftHip: {
    name: "왼쪽 고관절",
    points: [11, 23, 25]
  },

  rightHip: {
    name: "오른쪽 고관절",
    points: [12, 24, 26]
  },

  leftAnkle: {
    name: "왼쪽 발목",
    points: [25, 27, 31]
  },

  rightAnkle: {
    name: "오른쪽 발목",
    points: [26, 28, 32]
  },

  leftElbow: {
    name: "왼쪽 팔꿈치",
    points: [11, 13, 15]
  },

  rightElbow: {
    name: "오른쪽 팔꿈치",
    points: [12, 14, 16]
  }

};


/* =========================================================
   PERFORMANCE METRICS
========================================================= */

const PERFORMANCE_METRICS = {

  speed: {
    name: "스피드",
    icon: "⚡"
  },

  power: {
    name: "파워",
    icon: "◆"
  },

  agility: {
    name: "민첩성",
    icon: "◇"
  },

  stability: {
    name: "안정성",
    icon: "◎"
  },

  symmetry: {
    name: "대칭성",
    icon: "↔"
  },

  technique: {
    name: "기술",
    icon: "✦"
  }

};


/* =========================================================
   EVENT HELPERS
========================================================= */

/**
 * ID로 종목 찾기
 */
function getEventById(id) {

  return PE_EVENTS.find(
    event => event.id === id
  ) || null;

}


/**
 * 카테고리별 종목
 */
function getEventsByCategory(category) {

  if (
    !category ||
    category === "all"
  ) {
    return [...PE_EVENTS];
  }

  return PE_EVENTS.filter(
    event => event.category === category
  );

}


/**
 * 검색
 */
function searchEvents(keyword) {

  const query = String(
    keyword || ""
  )
    .trim()
    .toLowerCase();

  if (!query) {
    return [...PE_EVENTS];
  }

  return PE_EVENTS.filter(event => {

    const searchable = [
      event.name,
      event.ability,
      event.description,
      EVENT_CATEGORIES[event.category]?.name,
      ...(event.metrics || [])
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(query);

  });

}


/**
 * 종목 카테고리 이름
 */
function getEventCategoryName(event) {

  if (!event) {
    return "-";
  }

  return (
    EVENT_CATEGORIES[event.category]?.name ||
    event.category ||
    "-"
  );

}


/**
 * 촬영 방향 이름
 */
function getViewName(view) {

  const names = {
    side: "측면",
    front: "정면",
    rear: "후면"
  };

  return names[view] || view || "-";

}


/**
 * 기록 단위 표시
 */
function getEventUnit(eventId) {

  const event = getEventById(eventId);

  return event?.unit || "-";

}


/**
 * 점프 분석 가능 여부
 */
function isJumpEvent(eventId) {

  const event = getEventById(eventId);

  return Boolean(
    event?.jumpAnalysis
  );

}


/**
 * 스프린트 분석 가능 여부
 */
function isSprintEvent(eventId) {

  const event = getEventById(eventId);

  return Boolean(
    event?.sprintAnalysis
  );

}


/**
 * 궤적 분석 가능 여부
 */
function supportsTrajectory(eventId) {

  const event = getEventById(eventId);

  return Boolean(
    event?.trajectory
  );

}


/* =========================================================
   EVENT SPECIFIC FEEDBACK
========================================================= */

const EVENT_FEEDBACK_RULES = {

  "standing-long-jump": [

    {
      metric: "symmetry",
      threshold: 80,
      type: "min",
      title: "좌우 균형",
      good:
        "좌우 하지 움직임이 비교적 안정적입니다.",
      bad:
        "좌우 무릎 또는 고관절 움직임 차이를 줄이는 훈련이 필요합니다."
    },

    {
      metric: "stability",
      threshold: 75,
      type: "min",
      title: "착지 안정성",
      good:
        "착지 구간의 중심 제어가 안정적입니다.",
      bad:
        "착지 시 중심 이동과 무릎 정렬을 확인하세요."
    }

  ],


  "vertical-jump": [

    {
      metric: "symmetry",
      threshold: 80,
      type: "min",
      title: "양측 추진",
      good:
        "좌우 하지 추진이 비교적 균형적입니다.",
      bad:
        "이륙 시 좌우 하지의 신전 타이밍 차이를 확인하세요."
    }

  ],


  "side-step": [

    {
      metric: "symmetry",
      threshold: 85,
      type: "min",
      title: "좌우 방향전환",
      good:
        "좌우 방향전환 패턴이 안정적입니다.",
      bad:
        "좌우 이동 속도와 중심 높이 차이를 확인하세요."
    }

  ],


  "medicine-ball-forward": [

    {
      metric: "technique",
      threshold: 75,
      type: "min",
      title: "힘 전달",
      good:
        "하지에서 상지로 이어지는 동작 연결이 양호합니다.",
      bad:
        "하지 → 몸통 → 상지 순서의 힘 전달을 개선하세요."
    }

  ]

};


/* =========================================================
   TRAINING DATABASE

   분석 결과에 따라 app.js가 골라서 표시
========================================================= */

const TRAINING_LIBRARY = {

  power: [

    {
      name: "스쿼트 점프",
      category: "POWER",
      description:
        "하지의 빠른 신전과 수직 폭발력 향상"
    },

    {
      name: "바운딩",
      category: "POWER",
      description:
        "수평 추진력과 연속 도약 능력 향상"
    },

    {
      name: "박스 점프",
      category: "POWER",
      description:
        "하지 폭발력과 이륙 타이밍 훈련"
    }

  ],


  landing: [

    {
      name: "스틱 랜딩",
      category: "LANDING",
      description:
        "착지 후 자세를 정지하여 중심 제어 능력 향상"
    },

    {
      name: "싱글 레그 랜딩",
      category: "LANDING",
      description:
        "한쪽 하지의 착지 안정성과 균형 향상"
    }

  ],


  sprint: [

    {
      name: "월 드라이브",
      category: "SPRINT",
      description:
        "가속 구간의 몸통 기울기와 하지 드라이브 연습"
    },

    {
      name: "A-March",
      category: "SPRINT",
      description:
        "러닝 자세와 하지 리듬 훈련"
    },

    {
      name: "A-Skip",
      category: "SPRINT",
      description:
        "러닝 탄성과 리듬 향상"
    }

  ],


  agility: [

    {
      name: "사이드 셔플",
      category: "AGILITY",
      description:
        "측면 이동과 중심 제어 능력 향상"
    },

    {
      name: "디셀러레이션 드릴",
      category: "AGILITY",
      description:
        "감속 후 방향전환 자세 훈련"
    },

    {
      name: "5-10-5 드릴",
      category: "AGILITY",
      description:
        "좌우 방향전환과 재가속 능력 향상"
    }

  ],


  core: [

    {
      name: "데드버그",
      category: "CORE",
      description:
        "몸통 안정성과 사지 움직임 제어"
    },

    {
      name: "플랭크",
      category: "CORE",
      description:
        "몸통 정렬과 코어 지구력 향상"
    },

    {
      name: "팔로프 프레스",
      category: "CORE",
      description:
        "회전 저항과 몸통 안정성 향상"
    }

  ],


  symmetry: [

    {
      name: "스플릿 스쿼트",
      category: "SYMMETRY",
      description:
        "좌우 하지 근력과 자세 차이 개선"
    },

    {
      name: "스텝업",
      category: "SYMMETRY",
      description:
        "한쪽 하지 추진력과 안정성 향상"
    },

    {
      name: "싱글 레그 RDL",
      category: "SYMMETRY",
      description:
        "편측 고관절 안정성과 균형 향상"
    }

  ],


  mobility: [

    {
      name: "발목 가동성 드릴",
      category: "MOBILITY",
      description:
        "발목 배측굴곡 가동범위 개선"
    },

    {
      name: "고관절 모빌리티",
      category: "MOBILITY",
      description:
        "고관절 움직임 범위 개선"
    }

  ]

};


/* =========================================================
   EVENT → TRAINING MAP
========================================================= */

const EVENT_TRAINING_MAP = {

  "standing-long-jump": [
    "power",
    "landing",
    "symmetry",
    "core"
  ],

  "vertical-jump": [
    "power",
    "landing",
    "mobility"
  ],

  "standing-triple-jump": [
    "power",
    "landing",
    "symmetry"
  ],

  "standing-high-jump": [
    "power",
    "landing"
  ],

  "10m-sprint": [
    "sprint",
    "power",
    "core"
  ],

  "20m-sprint": [
    "sprint",
    "power"
  ],

  "30m-sprint": [
    "sprint",
    "power"
  ],

  "50m-sprint": [
    "sprint",
    "core"
  ],

  "100m-sprint": [
    "sprint",
    "core"
  ],

  "side-step": [
    "agility",
    "symmetry",
    "core"
  ],

  "shuttle-run": [
    "agility",
    "sprint",
    "landing"
  ],

  "10m-shuttle": [
    "agility",
    "sprint"
  ],

  "zigzag-run": [
    "agility",
    "symmetry"
  ],

  "pro-agility": [
    "agility",
    "sprint",
    "symmetry"
  ],

  "medicine-ball-forward": [
    "power",
    "core"
  ],

  "medicine-ball-backward": [
    "power",
    "core"
  ],

  "softball-throw": [
    "power",
    "core"
  ],

  "back-strength": [
    "core",
    "symmetry"
  ],

  "sit-up": [
    "core"
  ],

  "push-up": [
    "core",
    "symmetry"
  ],

  "pull-up": [
    "symmetry",
    "core"
  ],

  "20m-shuttle-run": [
    "sprint",
    "agility"
  ],

  "1000m-run": [
    "sprint",
    "core"
  ],

  "1200m-run": [
    "sprint",
    "core"
  ],

  "1500m-run": [
    "sprint",
    "core"
  ],

  "sit-and-reach": [
    "mobility"
  ],

  "trunk-flexion": [
    "mobility"
  ],

  "basketball-dribble": [
    "agility",
    "symmetry",
    "core"
  ],

  "soccer-dribble": [
    "agility",
    "symmetry"
  ]

};


/* =========================================================
   GET TRAINING RECOMMENDATIONS
========================================================= */

function getTrainingRecommendations(
  eventId,
  maxItems = 6
) {

  const categories =
    EVENT_TRAINING_MAP[eventId] ||
    [
      "core",
      "symmetry"
    ];

  const result = [];

  categories.forEach(category => {

    const exercises =
      TRAINING_LIBRARY[category] || [];

    exercises.forEach(exercise => {

      result.push({
        ...exercise,
        sourceCategory: category
      });

    });

  });

  return result.slice(
    0,
    maxItems
  );

}


/* =========================================================
   DEFAULT RADAR PROFILE BY CATEGORY

   분석 전 기본 표시용.
   실제 분석 후에는 app.js에서 실제 계산값으로 교체.
========================================================= */

const CATEGORY_RADAR_BASE = {

  jump: {
    speed: 65,
    power: 90,
    agility: 60,
    stability: 70,
    symmetry: 75,
    technique: 80
  },

  sprint: {
    speed: 95,
    power: 80,
    agility: 65,
    stability: 65,
    symmetry: 70,
    technique: 80
  },

  agility: {
    speed: 80,
    power: 70,
    agility: 95,
    stability: 85,
    symmetry: 85,
    technique: 85
  },

  throw: {
    speed: 65,
    power: 95,
    agility: 55,
    stability: 75,
    symmetry: 70,
    technique: 90
  },

  strength: {
    speed: 40,
    power: 85,
    agility: 40,
    stability: 85,
    symmetry: 80,
    technique: 75
  },

  endurance: {
    speed: 70,
    power: 55,
    agility: 55,
    stability: 75,
    symmetry: 75,
    technique: 75
  },

  special: {
    speed: 60,
    power: 55,
    agility: 70,
    stability: 80,
    symmetry: 80,
    technique: 80
  }

};


/* =========================================================
   GET RADAR BASE
========================================================= */

function getCategoryRadarBase(category) {

  return {
    ...(
      CATEGORY_RADAR_BASE[category] ||
      CATEGORY_RADAR_BASE.special
    )
  };

}


/* =========================================================
   GLOBAL EXPORT

   일반 script 방식이므로 window에도 노출
========================================================= */

window.EVENT_CATEGORIES =
  EVENT_CATEGORIES;

window.PE_EVENTS =
  PE_EVENTS;

window.MOTION_ANALYSIS_CONFIG =
  MOTION_ANALYSIS_CONFIG;

window.POSE_LANDMARKS =
  POSE_LANDMARKS;

window.CUSTOM_POSE_CONNECTIONS =
  CUSTOM_POSE_CONNECTIONS;

window.ANGLE_DEFINITIONS =
  ANGLE_DEFINITIONS;

window.PERFORMANCE_METRICS =
  PERFORMANCE_METRICS;

window.EVENT_FEEDBACK_RULES =
  EVENT_FEEDBACK_RULES;

window.TRAINING_LIBRARY =
  TRAINING_LIBRARY;

window.EVENT_TRAINING_MAP =
  EVENT_TRAINING_MAP;

window.CATEGORY_RADAR_BASE =
  CATEGORY_RADAR_BASE;

window.getEventById =
  getEventById;

window.getEventsByCategory =
  getEventsByCategory;

window.searchEvents =
  searchEvents;

window.getEventCategoryName =
  getEventCategoryName;

window.getViewName =
  getViewName;

window.getEventUnit =
  getEventUnit;

window.isJumpEvent =
  isJumpEvent;

window.isSprintEvent =
  isSprintEvent;

window.supportsTrajectory =
  supportsTrajectory;

window.getTrainingRecommendations =
  getTrainingRecommendations;

window.getCategoryRadarBase =
  getCategoryRadarBase;


/* =========================================================
   DEBUG
========================================================= */

console.log(
  `[EVENTS] 체대입시 종목 ${PE_EVENTS.length}개 로드 완료`
);