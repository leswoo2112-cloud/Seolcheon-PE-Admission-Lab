/* =========================================================
   설천고 PE PERFORMANCE LAB
   EVENTS.JS
   VERSION 2.0

   역할
   - 체대입시 종목 데이터
   - 맨몸 움직임 데이터
   - 종목별 분석 기준
   - 관절 분석 포인트
   - 핵심 프레임 기준
   - 훈련 추천 데이터

   주의
   - 분석 실행 로직은 app.js
========================================================= */

"use strict";


/* =========================================================
   01. CATEGORY
========================================================= */

const EVENT_CATEGORIES = [

  {
    id: "all",
    name: "전체",
    icon: "◉"
  },

  {
    id: "pe",
    name: "체대입시",
    icon: "◆"
  },

  {
    id: "bodyweight",
    name: "맨몸",
    icon: "◎"
  },

  {
    id: "jump",
    name: "점프",
    icon: "↑"
  },

  {
    id: "speed",
    name: "달리기",
    icon: "≫"
  },

  {
    id: "agility",
    name: "민첩성",
    icon: "↔"
  },

  {
    id: "strength",
    name: "근력",
    icon: "▰"
  }

];


/* =========================================================
   02. EVENT DATA
========================================================= */

const PE_EVENTS = [


/* =========================================================
   체대입시
========================================================= */

{
  id: "standing-long-jump",

  name: "제자리멀리뛰기",

  category: "pe",

  categoryName: "체대입시",

  ability: "순발력 · 폭발력",

  icon: "↗",

  description:
    "준비 자세부터 이륙, 비행, 착지까지 점프 동작을 분석합니다.",

  analysisType: "jump",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "shoulder"
  ],

  metrics: [
    "power",
    "stability",
    "symmetry",
    "technique",
    "speed"
  ],

  keyPhases: [
    "준비",
    "반동",
    "최저점",
    "이륙",
    "비행",
    "착지"
  ],

  angleTargets: {

    knee: {
      min: 75,
      max: 125
    },

    hip: {
      min: 70,
      max: 135
    },

    trunk: {
      min: 5,
      max: 45
    }

  },

  specialMetrics: [
    "jumpHeight",
    "flightTime",
    "takeoffAngle"
  ],

  training: [
    "스쿼트 점프",
    "브로드 점프",
    "포고 점프",
    "힙 익스텐션",
    "착지 안정화"
  ]

},


{
  id: "vertical-jump",

  name: "서전트 점프",

  category: "pe",

  categoryName: "체대입시",

  ability: "수직 순발력",

  icon: "↑",

  description:
    "반동 깊이와 하지 신전, 이륙 타이밍을 분석합니다.",

  analysisType: "jump",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "shoulder"
  ],

  metrics: [
    "power",
    "speed",
    "symmetry",
    "technique",
    "stability"
  ],

  keyPhases: [
    "준비",
    "하강",
    "최저점",
    "상승",
    "이륙",
    "최고점",
    "착지"
  ],

  angleTargets: {

    knee: {
      min: 70,
      max: 125
    },

    hip: {
      min: 65,
      max: 135
    },

    trunk: {
      min: 0,
      max: 30
    }

  },

  specialMetrics: [
    "jumpHeight",
    "flightTime"
  ],

  training: [
    "CMJ",
    "스쿼트 점프",
    "포고 점프",
    "카프 점프",
    "박스 점프"
  ]

},


{
  id: "medicine-ball-throw",

  name: "메디신볼 던지기",

  category: "pe",

  categoryName: "체대입시",

  ability: "상체 파워",

  icon: "●",

  description:
    "하지-몸통-상지로 이어지는 힘 전달 순서를 분석합니다.",

  analysisType: "throw",

  mainJoints: [
    "shoulder",
    "elbow",
    "hip",
    "knee"
  ],

  metrics: [
    "power",
    "technique",
    "speed",
    "stability",
    "symmetry"
  ],

  keyPhases: [
    "준비",
    "백스윙",
    "전환",
    "가속",
    "릴리스",
    "팔로스루"
  ],

  training: [
    "메디신볼 체스트패스",
    "오버헤드 스로우",
    "로테이션 스로우",
    "코어 브레이싱"
  ]

},


{
  id: "sit-up",

  name: "윗몸일으키기",

  category: "pe",

  categoryName: "체대입시",

  ability: "근지구력",

  icon: "⌁",

  description:
    "반복 횟수와 동작 범위, 리듬을 분석합니다.",

  analysisType: "repetition",

  counterType: "situp",

  mainJoints: [
    "hip",
    "shoulder"
  ],

  metrics: [
    "technique",
    "stability",
    "speed",
    "symmetry"
  ],

  keyPhases: [
    "하강",
    "바닥",
    "상승",
    "완료"
  ],

  training: [
    "크런치",
    "데드버그",
    "플랭크",
    "할로우 홀드"
  ]

},


{
  id: "shuttle-run-10m",

  name: "10m 왕복달리기",

  category: "pe",

  categoryName: "체대입시",

  ability: "민첩성 · 스피드",

  icon: "↔",

  description:
    "가속, 감속, 방향전환과 재가속 동작을 분석합니다.",

  analysisType: "agility",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "trunk"
  ],

  metrics: [
    "agility",
    "speed",
    "stability",
    "technique",
    "power"
  ],

  keyPhases: [
    "출발",
    "가속",
    "감속",
    "턴 진입",
    "방향전환",
    "재가속"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "5-10-5 셔틀",
    "감속 드릴",
    "사이드 스텝",
    "턴 앤 스프린트"
  ]

},


{
  id: "side-step",

  name: "사이드스텝",

  category: "pe",

  categoryName: "체대입시",

  ability: "민첩성",

  icon: "⇆",

  description:
    "좌우 이동 폭과 리듬, 방향전환 안정성을 분석합니다.",

  analysisType: "agility",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "agility",
    "speed",
    "symmetry",
    "stability",
    "technique"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "라테랄 셔플",
    "스케이터 점프",
    "사이드 바운드",
    "라인 스텝"
  ]

},


{
  id: "20m-sprint",

  name: "20m 달리기",

  category: "pe",

  categoryName: "체대입시",

  ability: "스피드",

  icon: "≫",

  description:
    "출발 자세, 가속, 스텝 리듬과 몸통 각도를 분석합니다.",

  analysisType: "sprint",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "shoulder"
  ],

  metrics: [
    "speed",
    "power",
    "technique",
    "symmetry",
    "stability"
  ],

  keyPhases: [
    "준비",
    "출발",
    "초기 가속",
    "중간 가속",
    "최대속도"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "월 드라이브",
    "A스킵",
    "바운딩",
    "10m 가속주",
    "플라잉 스프린트"
  ]

},


/* =========================================================
   일반 맨몸
========================================================= */

{
  id: "bodyweight-squat",

  name: "스쿼트",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "하지 움직임",

  icon: "▼",

  description:
    "일반 맨몸 스쿼트의 깊이, 무릎, 고관절, 몸통 움직임을 분석합니다.",

  analysisType: "repetition",

  counterType: "squat",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "trunk"
  ],

  metrics: [
    "technique",
    "symmetry",
    "stability",
    "mobility",
    "control"
  ],

  keyPhases: [
    "서기",
    "하강",
    "최저점",
    "상승",
    "완료"
  ],

  angleTargets: {

    knee: {
      min: 60,
      max: 115
    },

    hip: {
      min: 55,
      max: 120
    },

    trunk: {
      min: 0,
      max: 45
    }

  },

  training: [
    "템포 스쿼트",
    "고블릿 스쿼트",
    "발목 가동성",
    "힙 모빌리티",
    "스쿼트 홀드"
  ]

},


{
  id: "bodyweight-lunge",

  name: "런지",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "편측 하지 안정성",

  icon: "◢",

  description:
    "앞뒤 다리의 무릎각과 골반 안정성, 좌우 차이를 분석합니다.",

  analysisType: "repetition",

  counterType: "lunge",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "trunk"
  ],

  metrics: [
    "symmetry",
    "stability",
    "technique",
    "mobility",
    "control"
  ],

  keyPhases: [
    "준비",
    "하강",
    "최저점",
    "상승",
    "완료"
  ],

  training: [
    "스플릿 스쿼트",
    "리버스 런지",
    "불가리안 스플릿 스쿼트",
    "싱글레그 밸런스"
  ]

},


{
  id: "reverse-lunge",

  name: "리버스 런지",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "하지 안정성",

  icon: "◁",

  description:
    "뒤로 스텝하는 런지의 균형과 무릎 제어를 분석합니다.",

  analysisType: "repetition",

  counterType: "lunge",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "stability",
    "symmetry",
    "technique",
    "control"
  ],

  training: [
    "스플릿 스쿼트",
    "싱글레그 RDL",
    "스텝업",
    "힙 안정화"
  ]

},


{
  id: "split-squat",

  name: "스플릿 스쿼트",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "편측 근력",

  icon: "◫",

  description:
    "고정된 스탠스에서 좌우 하지 움직임을 비교합니다.",

  analysisType: "repetition",

  counterType: "lunge",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "symmetry",
    "stability",
    "technique",
    "control"
  ],

  training: [
    "스플릿 스쿼트 홀드",
    "불가리안 스플릿 스쿼트",
    "스텝업"
  ]

},


{
  id: "push-up",

  name: "푸시업",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "상체 근지구력",

  icon: "▬",

  description:
    "팔꿈치 각도, 몸통 정렬과 반복 리듬을 분석합니다.",

  analysisType: "repetition",

  counterType: "pushup",

  mainJoints: [
    "shoulder",
    "elbow",
    "hip"
  ],

  metrics: [
    "technique",
    "stability",
    "symmetry",
    "control"
  ],

  training: [
    "인클라인 푸시업",
    "템포 푸시업",
    "플랭크",
    "스캐풀라 푸시업"
  ]

},


{
  id: "burpee",

  name: "버피",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "전신 체력",

  icon: "↕",

  description:
    "하강-플랭크-복귀-점프의 연결 속도를 분석합니다.",

  analysisType: "repetition",

  counterType: "burpee",

  mainJoints: [
    "shoulder",
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "speed",
    "power",
    "technique",
    "stability"
  ],

  training: [
    "스쿼트 스러스트",
    "마운틴 클라이머",
    "스쿼트 점프",
    "플랭크"
  ]

},


{
  id: "single-leg-squat",

  name: "싱글레그 스쿼트",

  category: "bodyweight",

  categoryName: "맨몸",

  ability: "편측 안정성",

  icon: "◒",

  description:
    "한쪽 다리의 무릎 제어와 골반 안정성을 분석합니다.",

  analysisType: "balance",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "stability",
    "symmetry",
    "control",
    "mobility"
  ],

  training: [
    "싱글레그 밸런스",
    "스텝다운",
    "싱글레그 RDL",
    "스플릿 스쿼트"
  ]

},


/* =========================================================
   점프
========================================================= */

{
  id: "squat-jump",

  name: "스쿼트 점프",

  category: "jump",

  categoryName: "점프",

  ability: "폭발력",

  icon: "↑",

  description:
    "하지 신전 속도와 수직 점프 패턴을 분석합니다.",

  analysisType: "jump",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "power",
    "speed",
    "technique",
    "stability"
  ],

  specialMetrics: [
    "jumpHeight",
    "flightTime"
  ],

  training: [
    "스쿼트",
    "포고 점프",
    "박스 점프",
    "카프 레이즈"
  ]

},


{
  id: "countermovement-jump",

  name: "CMJ",

  category: "jump",

  categoryName: "점프",

  ability: "반동 점프",

  icon: "⇧",

  description:
    "하강 반동부터 이륙까지의 연결 효율을 분석합니다.",

  analysisType: "jump",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "power",
    "speed",
    "technique",
    "symmetry"
  ],

  specialMetrics: [
    "jumpHeight",
    "flightTime",
    "takeoffAngle"
  ],

  training: [
    "CMJ",
    "스쿼트 점프",
    "포고 점프",
    "드롭 점프"
  ]

},


{
  id: "box-jump",

  name: "박스 점프",

  category: "jump",

  categoryName: "점프",

  ability: "폭발력 · 착지",

  icon: "▟",

  description:
    "이륙과 착지 시 하지 정렬 및 안정성을 분석합니다.",

  analysisType: "jump",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "power",
    "stability",
    "technique"
  ],

  training: [
    "스쿼트 점프",
    "브로드 점프",
    "착지 드릴"
  ]

},


{
  id: "broad-jump",

  name: "브로드 점프",

  category: "jump",

  categoryName: "점프",

  ability: "수평 폭발력",

  icon: "↗",

  description:
    "수평 방향 추진과 이륙각, 착지 안정성을 분석합니다.",

  analysisType: "jump",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "trunk"
  ],

  metrics: [
    "power",
    "speed",
    "technique",
    "stability"
  ],

  specialMetrics: [
    "flightTime",
    "takeoffAngle"
  ],

  training: [
    "브로드 점프",
    "바운딩",
    "스쿼트 점프",
    "힙 익스텐션"
  ]

},


{
  id: "pogo-jump",

  name: "포고 점프",

  category: "jump",

  categoryName: "점프",

  ability: "반응성",

  icon: "⇅",

  description:
    "발목 탄성과 지면 접촉 리듬을 분석합니다.",

  analysisType: "repetition",

  counterType: "jump",

  mainJoints: [
    "ankle",
    "knee"
  ],

  metrics: [
    "speed",
    "stability",
    "technique"
  ],

  training: [
    "포고 점프",
    "줄넘기",
    "카프 레이즈",
    "발목 홉"
  ]

},


/* =========================================================
   달리기
========================================================= */

{
  id: "sprint-start",

  name: "스프린트 스타트",

  category: "speed",

  categoryName: "달리기",

  ability: "출발 · 가속",

  icon: "➤",

  description:
    "첫 스텝과 초기 가속 시 몸통 및 하지 각도를 분석합니다.",

  analysisType: "sprint",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "shoulder"
  ],

  metrics: [
    "speed",
    "power",
    "technique",
    "symmetry"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "월 드라이브",
    "3포인트 스타트",
    "10m 가속주",
    "슬레드 없는 저항 자세 드릴"
  ]

},


{
  id: "acceleration-run",

  name: "가속주",

  category: "speed",

  categoryName: "달리기",

  ability: "가속 능력",

  icon: "≫",

  description:
    "몸통 기울기와 스텝 변화, 가속 패턴을 분석합니다.",

  analysisType: "sprint",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "speed",
    "power",
    "technique"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "10m 가속",
    "20m 가속",
    "A스킵",
    "바운딩"
  ]

},


{
  id: "running-form",

  name: "러닝 자세",

  category: "speed",

  categoryName: "달리기",

  ability: "주행 효율",

  icon: "➜",

  description:
    "일반 달리기의 자세, 케이던스와 좌우 대칭성을 분석합니다.",

  analysisType: "sprint",

  mainJoints: [
    "shoulder",
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "technique",
    "symmetry",
    "speed",
    "stability"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "A스킵",
    "B스킵",
    "스트라이드",
    "러닝 드릴"
  ]

},


{
  id: "high-knees",

  name: "하이니",

  category: "speed",

  categoryName: "달리기",

  ability: "러닝 리듬",

  icon: "↟",

  description:
    "무릎 리프트 높이와 좌우 리듬을 분석합니다.",

  analysisType: "repetition",

  counterType: "step",

  mainJoints: [
    "hip",
    "knee"
  ],

  metrics: [
    "speed",
    "symmetry",
    "technique"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "A스킵",
    "하이니",
    "퀵스텝"
  ]

},


/* =========================================================
   민첩성
========================================================= */

{
  id: "lateral-shuffle",

  name: "라테랄 셔플",

  category: "agility",

  categoryName: "민첩성",

  ability: "측면 이동",

  icon: "⇆",

  description:
    "측면 이동 시 골반 높이와 좌우 스텝을 분석합니다.",

  analysisType: "agility",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "agility",
    "speed",
    "stability",
    "symmetry"
  ],

  specialMetrics: [
    "stepCount",
    "cadence"
  ],

  training: [
    "사이드 셔플",
    "라인 스텝",
    "스케이터 점프"
  ]

},


{
  id: "change-direction",

  name: "방향전환",

  category: "agility",

  categoryName: "민첩성",

  ability: "감속 · 재가속",

  icon: "↪",

  description:
    "감속 후 방향전환과 재가속 동작을 분석합니다.",

  analysisType: "agility",

  mainJoints: [
    "hip",
    "knee",
    "ankle",
    "trunk"
  ],

  metrics: [
    "agility",
    "stability",
    "speed",
    "technique"
  ],

  training: [
    "컷팅 드릴",
    "5-10-5",
    "감속 스텝",
    "턴 앤 고"
  ]

},


{
  id: "t-test",

  name: "T 테스트",

  category: "agility",

  categoryName: "민첩성",

  ability: "다방향 민첩성",

  icon: "T",

  description:
    "전후 및 좌우 이동의 연결 동작을 분석합니다.",

  analysisType: "agility",

  mainJoints: [
    "hip",
    "knee",
    "ankle"
  ],

  metrics: [
    "agility",
    "speed",
    "stability",
    "technique"
  ],

  training: [
    "T 드릴",
    "셔플",
    "백페달",
    "턴 스프린트"
  ]

},


/* =========================================================
   근력 움직임
========================================================= */

{
  id: "hip-hinge",

  name: "힙힌지",

  category: "strength",

  categoryName: "근력",

  ability: "고관절 패턴",

  icon: "⌞",

  description:
    "고관절 접힘과 몸통 정렬을 분석합니다.",

  analysisType: "repetition",

  counterType: "hinge",

  mainJoints: [
    "hip",
    "knee",
    "trunk"
  ],

  metrics: [
    "technique",
    "mobility",
    "stability",
    "control"
  ],

  training: [
    "벽 힙힌지",
    "굿모닝 패턴",
    "브릿지",
    "햄스트링 모빌리티"
  ]

},


{
  id: "calf-raise",

  name: "카프 레이즈",

  category: "strength",

  categoryName: "근력",

  ability: "발목 · 종아리",

  icon: "△",

  description:
    "발목 가동범위와 반복 리듬을 분석합니다.",

  analysisType: "repetition",

  counterType: "calf",

  mainJoints: [
    "ankle",
    "knee"
  ],

  metrics: [
    "control",
    "symmetry",
    "stability"
  ],

  training: [
    "카프 레이즈",
    "싱글레그 카프 레이즈",
    "포고 점프"
  ]

},


{
  id: "glute-bridge",

  name: "글루트 브릿지",

  category: "strength",

  categoryName: "근력",

  ability: "둔근",

  icon: "⌒",

  description:
    "고관절 신전과 골반 제어를 분석합니다.",

  analysisType: "repetition",

  counterType: "bridge",

  mainJoints: [
    "hip",
    "knee"
  ],

  metrics: [
    "technique",
    "symmetry",
    "control"
  ],

  training: [
    "글루트 브릿지",
    "싱글레그 브릿지",
    "힙 쓰러스트 패턴"
  ]

}

];


/* =========================================================
   03. DEFAULT METRICS

   종목에 metrics가 없을 때 사용
========================================================= */

const DEFAULT_EVENT_METRICS = [
  "technique",
  "stability",
  "symmetry",
  "power",
  "speed"
];


/* =========================================================
   04. METRIC LABEL
========================================================= */

const METRIC_LABELS = {

  technique: "기술",

  stability: "안정성",

  symmetry: "대칭성",

  power: "파워",

  speed: "스피드",

  agility: "민첩성",

  mobility: "가동성",

  control: "동작 제어"

};


/* =========================================================
   05. JOINT LABEL
========================================================= */

const JOINT_LABELS = {

  shoulder: "어깨",

  elbow: "팔꿈치",

  hip: "고관절",

  knee: "무릎",

  ankle: "발목",

  trunk: "몸통"

};


/* =========================================================
   06. ANALYSIS TYPE LABEL
========================================================= */

const ANALYSIS_TYPE_LABELS = {

  jump: "점프 분석",

  sprint: "달리기 분석",

  agility: "민첩성 분석",

  repetition: "반복 동작 분석",

  balance: "균형 분석",

  throw: "투척 분석"

};


/* =========================================================
   07. DEFAULT ANGLE TARGETS
========================================================= */

const DEFAULT_ANGLE_TARGETS = {

  knee: {
    min: 65,
    max: 125
  },

  hip: {
    min: 60,
    max: 135
  },

  ankle: {
    min: 65,
    max: 130
  },

  trunk: {
    min: 0,
    max: 45
  }

};


/* =========================================================
   08. EVENT HELPERS
========================================================= */

function getAllEvents() {

  return PE_EVENTS;

}


function getEventById(id) {

  if (!id) {
    return null;
  }

  return PE_EVENTS.find(
    event => event.id === id
  ) || null;

}


function getEventsByCategory(category) {

  if (!category || category === "all") {
    return PE_EVENTS;
  }

  return PE_EVENTS.filter(
    event => event.category === category
  );

}


function searchEvents(keyword) {

  const text =
    String(keyword || "")
      .trim()
      .toLowerCase();

  if (!text) {
    return PE_EVENTS;
  }

  return PE_EVENTS.filter(event => {

    const source = [

      event.name,

      event.categoryName,

      event.ability,

      event.description

    ]
      .join(" ")
      .toLowerCase();

    return source.includes(text);

  });

}


function getCategoryById(id) {

  return EVENT_CATEGORIES.find(
    category => category.id === id
  ) || null;

}


function getMetricLabel(metric) {

  return METRIC_LABELS[metric] || metric;

}


function getJointLabel(joint) {

  return JOINT_LABELS[joint] || joint;

}


function getAnalysisTypeLabel(type) {

  return ANALYSIS_TYPE_LABELS[type] || "동작 분석";

}


/* =========================================================
   09. EVENT ANALYSIS CONFIG
========================================================= */

function getEventAnalysisConfig(eventId) {

  const event = getEventById(eventId);

  if (!event) {

    return {

      analysisType: "repetition",

      metrics: DEFAULT_EVENT_METRICS,

      mainJoints: [
        "hip",
        "knee",
        "ankle"
      ],

      angleTargets: DEFAULT_ANGLE_TARGETS,

      keyPhases: [
        "준비",
        "수행",
        "완료"
      ],

      training: []

    };

  }


  return {

    analysisType:
      event.analysisType || "repetition",

    counterType:
      event.counterType || null,

    metrics:
      event.metrics || DEFAULT_EVENT_METRICS,

    mainJoints:
      event.mainJoints || [
        "hip",
        "knee",
        "ankle"
      ],

    angleTargets: {
      ...DEFAULT_ANGLE_TARGETS,
      ...(event.angleTargets || {})
    },

    keyPhases:
      event.keyPhases || [
        "준비",
        "수행",
        "완료"
      ],

    specialMetrics:
      event.specialMetrics || [],

    training:
      event.training || []

  };

}


/* =========================================================
   10. FEEDBACK GENERATOR DATA
========================================================= */

const FEEDBACK_RULES = {

  symmetry: {

    good:
      "좌우 움직임 차이가 작고 대칭성이 안정적입니다.",

    warning:
      "좌우 관절 움직임 차이가 관찰됩니다. 좌우 동작을 비교해 보세요."

  },


  stability: {

    good:
      "동작 중 신체 중심이 비교적 안정적으로 유지됩니다.",

    warning:
      "동작 중 신체 중심 이동이 큽니다. 안정화 능력을 확인해 보세요."

  },


  technique: {

    good:
      "주요 관절 움직임이 비교적 일정하게 유지됩니다.",

    warning:
      "동작 구간별 관절각 변화가 크게 나타납니다."

  },


  power: {

    good:
      "가속 구간에서 빠른 신전 움직임이 나타납니다.",

    warning:
      "추진 구간의 움직임 속도를 높이는 훈련이 도움이 될 수 있습니다."

  },


  speed: {

    good:
      "동작 전환과 반복 리듬이 비교적 빠르게 유지됩니다.",

    warning:
      "동작 전환 시간이 길게 나타나는 구간이 있습니다."

  },


  agility: {

    good:
      "방향전환 과정이 비교적 빠르고 안정적입니다.",

    warning:
      "감속 후 재가속 구간에서 시간이 길어지는 경향이 있습니다."

  },


  mobility: {

    good:
      "필요한 관절 가동범위를 비교적 잘 활용하고 있습니다.",

    warning:
      "일부 구간에서 관절 가동범위가 제한적으로 나타납니다."

  },


  control: {

    good:
      "동작 속도와 관절 움직임을 안정적으로 제어하고 있습니다.",

    warning:
      "동작 속도 변화가 커서 움직임 제어를 확인할 필요가 있습니다."

  }

};


/* =========================================================
   11. TRAINING LIBRARY
========================================================= */

const TRAINING_LIBRARY = {

  "템포 스쿼트": {
    focus: "하지 제어",
    description:
      "천천히 하강하고 안정적으로 상승하여 스쿼트 제어 능력을 향상합니다."
  },

  "고블릿 스쿼트": {
    focus: "스쿼트 패턴",
    description:
      "몸통과 하지 정렬을 유지하며 스쿼트 패턴을 연습합니다."
  },

  "발목 가동성": {
    focus: "발목",
    description:
      "스쿼트와 착지에 필요한 발목 움직임을 준비합니다."
  },

  "힙 모빌리티": {
    focus: "고관절",
    description:
      "고관절 움직임을 부드럽게 만들어 하지 동작 범위를 확보합니다."
  },

  "스쿼트 점프": {
    focus: "폭발력",
    description:
      "하지를 빠르게 신전하며 수직 방향 파워를 향상합니다."
  },

  "브로드 점프": {
    focus: "수평 파워",
    description:
      "앞 방향으로 강하게 추진하며 수평 폭발력을 훈련합니다."
  },

  "포고 점프": {
    focus: "발목 탄성",
    description:
      "짧고 빠른 지면 접촉을 이용해 발목 반응성을 훈련합니다."
  },

  "박스 점프": {
    focus: "점프",
    description:
      "폭발적인 이륙과 안정적인 착지 패턴을 연습합니다."
  },

  "착지 안정화": {
    focus: "착지",
    description:
      "점프 후 무릎과 골반 정렬을 유지하며 안정적으로 착지합니다."
  },

  "스플릿 스쿼트": {
    focus: "편측 하지",
    description:
      "한쪽 다리 중심의 근력과 골반 안정성을 향상합니다."
  },

  "리버스 런지": {
    focus: "하지 안정성",
    description:
      "뒤로 스텝하며 무릎과 골반을 안정적으로 제어합니다."
  },

  "싱글레그 밸런스": {
    focus: "균형",
    description:
      "한발 지지 상태에서 골반과 발목의 안정성을 훈련합니다."
  },

  "A스킵": {
    focus: "러닝 기술",
    description:
      "무릎 리프트와 지면 접촉 리듬을 연습합니다."
  },

  "바운딩": {
    focus: "러닝 파워",
    description:
      "긴 추진 동작을 이용해 수평 방향 파워를 향상합니다."
  },

  "10m 가속주": {
    focus: "가속",
    description:
      "짧은 거리에서 첫 스텝과 초기 가속 능력을 훈련합니다."
  },

  "감속 드릴": {
    focus: "감속",
    description:
      "빠른 이동 후 안정적으로 속도를 줄이는 기술을 연습합니다."
  },

  "사이드 셔플": {
    focus: "측면 민첩성",
    description:
      "낮은 자세를 유지하며 좌우 방향 이동 속도를 훈련합니다."
  },

  "스케이터 점프": {
    focus: "측면 파워",
    description:
      "좌우 방향으로 점프하며 편측 파워와 착지 안정성을 훈련합니다."
  },

  "플랭크": {
    focus: "코어",
    description:
      "몸통 정렬을 유지하며 코어 안정성을 향상합니다."
  },

  "데드버그": {
    focus: "코어 제어",
    description:
      "몸통을 안정적으로 유지하며 팔다리 움직임을 제어합니다."
  },

  "스캐풀라 푸시업": {
    focus: "견갑 안정성",
    description:
      "팔을 편 상태에서 견갑 움직임을 제어합니다."
  },

  "벽 힙힌지": {
    focus: "힙힌지",
    description:
      "고관절을 뒤로 보내는 기본 힙힌지 패턴을 연습합니다."
  }

};


/* =========================================================
   12. TRAINING HELPER
========================================================= */

function getTrainingInfo(name) {

  return TRAINING_LIBRARY[name] || {

    focus: "보완 훈련",

    description:
      `${name} 동작을 정확한 자세로 수행하며 부족한 능력을 보완합니다.`

  };

}


/* =========================================================
   13. EXPOSE GLOBAL

   app.js에서 window.PE_EVENT_DATA 로 사용 가능
========================================================= */

window.PE_EVENT_DATA = {

  categories:
    EVENT_CATEGORIES,

  events:
    PE_EVENTS,

  metricLabels:
    METRIC_LABELS,

  jointLabels:
    JOINT_LABELS,

  feedbackRules:
    FEEDBACK_RULES,

  trainingLibrary:
    TRAINING_LIBRARY,

  getAllEvents,

  getEventById,

  getEventsByCategory,

  searchEvents,

  getCategoryById,

  getMetricLabel,

  getJointLabel,

  getAnalysisTypeLabel,

  getEventAnalysisConfig,

  getTrainingInfo

};


/* =========================================================
   14. LOAD CHECK
========================================================= */

console.log(
  `[PE PERFORMANCE LAB] events.js loaded: ${PE_EVENTS.length} events`
);


/* =========================================================
   END EVENTS.JS
========================================================= */