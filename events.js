/* =========================================================
   설천고 체대입시 PERFORMANCE LAB
   EVENTS.JS
   PART 3 / 4

   역할
   - 체대입시 실기 종목 DB
   - 종목 검색 / 카테고리 필터
   - 종목 카드 생성
   - 종목 상세 모달
   - 측정 페이지 연결
   - AI 자세분석 연결
   - 종목별 측정 단위
   - 종목별 카메라 방향
   - 종목별 AI 분석 항목
========================================================= */

"use strict";


/* =========================================================
   01. CATEGORY
========================================================= */

const EVENT_CATEGORIES = {

  all: "전체",

  jump: "점프",

  sprint: "스피드",

  agility: "민첩성",

  endurance: "지구력",

  strength: "근력",

  power: "파워",

  throw: "투척",

  flexibility: "유연성",

  core: "코어",

  bodyweight: "맨몸",

  ball: "구기",

  balance: "밸런스",

  special: "특수실기"

};


/* =========================================================
   02. EVENTS DATABASE
========================================================= */

const EVENTS = [

  /* =======================================================
     JUMP
  ======================================================= */

  {
    id: "standing-long-jump",

    name: "제자리멀리뛰기",

    category: "jump",

    icon: "🦘",

    unit: "cm",

    ability: "순발력",

    measurementType: "distance",

    description:
      "제자리에서 양발로 도약하여 수평 방향 폭발력을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "무릎 굴곡",
      "고관절 굴곡",
      "팔 스윙",
      "도약각",
      "체공시간",
      "착지 안정성"
    ],

    checkpoints: [
      "도약 전 충분한 카운터무브먼트",
      "팔 스윙과 하지 신전 타이밍",
      "고관절·무릎·발목의 연속 신전",
      "착지 시 중심 유지"
    ]
  },


  {
    id: "vertical-jump",

    name: "서전트 점프",

    category: "jump",

    icon: "⬆️",

    unit: "cm",

    ability: "수직 순발력",

    measurementType: "height",

    description:
      "수직 방향으로 최대한 높게 도약하여 하지 폭발력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "점프 높이",
      "무릎 각도",
      "고관절 각도",
      "팔 스윙",
      "체공시간"
    ],

    checkpoints: [
      "카운터무브먼트 깊이",
      "팔 스윙 타이밍",
      "하지 신전 속도",
      "공중 자세"
    ]
  },


  {
    id: "sargent-no-arm",

    name: "노암 서전트 점프",

    category: "jump",

    icon: "↟",

    unit: "cm",

    ability: "하지 파워",

    measurementType: "height",

    description:
      "팔 사용을 제한하여 하지 자체의 폭발적인 파워를 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "무릎 굴곡",
      "고관절 굴곡",
      "점프 높이",
      "체공시간"
    ]
  },


  {
    id: "single-leg-jump",

    name: "외발 제자리멀리뛰기",

    category: "jump",

    icon: "🦵",

    unit: "cm",

    ability: "편측 파워",

    measurementType: "distance",

    description:
      "한쪽 다리의 폭발력과 좌우 차이를 측정합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "좌우 거리 차이",
      "무릎 안정성",
      "골반 안정성",
      "착지 안정성"
    ]
  },


  {
    id: "triple-hop",

    name: "트리플 홉",

    category: "jump",

    icon: "➠",

    unit: "cm",

    ability: "반복 파워",

    measurementType: "distance",

    description:
      "연속 3회 도약으로 하지의 반복 파워와 안정성을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "총 거리",
      "도약 간 리듬",
      "접지시간",
      "착지 안정성"
    ]
  },


  /* =======================================================
     SPEED
  ======================================================= */

  {
    id: "10m-sprint",

    name: "10m 달리기",

    category: "sprint",

    icon: "🏃",

    unit: "sec",

    ability: "가속력",

    measurementType: "time",

    description:
      "10m 구간의 초기 가속 능력을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "반응시간",
      "첫 스텝",
      "상체 각도",
      "보폭",
      "케이던스"
    ]
  },


  {
    id: "20m-sprint",

    name: "20m 달리기",

    category: "sprint",

    icon: "🏃‍♂️",

    unit: "sec",

    ability: "스피드",

    measurementType: "time",

    description:
      "20m 단거리 가속과 최고 속도 접근 능력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "가속구간",
      "보폭",
      "케이던스",
      "몸통각",
      "접지시간"
    ]
  },


  {
    id: "30m-sprint",

    name: "30m 달리기",

    category: "sprint",

    icon: "⚡",

    unit: "sec",

    ability: "스피드",

    measurementType: "time",

    description:
      "30m 단거리 질주 기록을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "초기가속",
      "최고속도",
      "보폭",
      "접지시간"
    ]
  },


  {
    id: "50m-sprint",

    name: "50m 달리기",

    category: "sprint",

    icon: "🏁",

    unit: "sec",

    ability: "최대 스피드",

    measurementType: "time",

    description:
      "50m 전력질주 능력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "출발",
      "가속",
      "최고속도",
      "후반 속도 유지"
    ]
  },


  {
    id: "100m-sprint",

    name: "100m 달리기",

    category: "sprint",

    icon: "🏃",

    unit: "sec",

    ability: "스피드",

    measurementType: "time",

    description:
      "100m 전력질주 기록을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "스타트",
      "가속",
      "최고속도",
      "속도 유지"
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

    unit: "count",

    ability: "민첩성",

    measurementType: "count",

    description:
      "좌우 방향전환 속도와 반복 민첩성을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "좌우 이동속도",
      "중심 이동",
      "무릎 정렬",
      "접지시간",
      "방향전환 속도"
    ]
  },


  {
    id: "10m-shuttle",

    name: "10m 왕복달리기",

    category: "agility",

    icon: "🔁",

    unit: "sec",

    ability: "민첩성",

    measurementType: "time",

    description:
      "10m 구간 왕복을 통해 방향전환과 가속 능력을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "턴 속도",
      "감속",
      "재가속",
      "턴 시 중심높이"
    ]
  },


  {
    id: "20m-shuttle-run",

    name: "20m 왕복달리기",

    category: "endurance",

    icon: "🔄",

    unit: "count",

    ability: "심폐지구력",

    measurementType: "count",

    description:
      "20m 구간을 반복 왕복하여 심폐지구력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: false,

    metrics: [
      "총 횟수",
      "페이스",
      "구간 기록"
    ]
  },


  {
    id: "505-agility",

    name: "505 민첩성 테스트",

    category: "agility",

    icon: "↩️",

    unit: "sec",

    ability: "방향전환",

    measurementType: "time",

    description:
      "180도 방향전환 능력과 재가속 능력을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "감속 자세",
      "턴 스텝",
      "무릎 정렬",
      "재가속"
    ]
  },


  {
    id: "t-test",

    name: "T-테스트",

    category: "agility",

    icon: "T",

    unit: "sec",

    ability: "종합 민첩성",

    measurementType: "time",

    description:
      "전후·좌우 이동을 결합한 종합 민첩성 테스트입니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "전진 속도",
      "사이드스텝",
      "방향전환",
      "후진 이동"
    ]
  },


  {
    id: "pro-agility",

    name: "5-10-5 프로 애질리티",

    category: "agility",

    icon: "⇆",

    unit: "sec",

    ability: "민첩성",

    measurementType: "time",

    description:
      "짧은 거리의 급격한 방향전환과 가속 능력을 측정합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "첫 스텝",
      "턴 속도",
      "좌우 차이",
      "재가속"
    ]
  },


  /* =======================================================
     ENDURANCE
  ======================================================= */

  {
    id: "1000m-run",

    name: "1000m 달리기",

    category: "endurance",

    icon: "🏃‍♀️",

    unit: "sec",

    ability: "심폐지구력",

    measurementType: "time",

    description:
      "1000m 달리기를 통해 중거리 지구력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: false,

    metrics: [
      "총 기록",
      "랩 페이스",
      "후반 페이스 유지"
    ]
  },


  {
    id: "1500m-run",

    name: "1500m 달리기",

    category: "endurance",

    icon: "🏃",

    unit: "sec",

    ability: "심폐지구력",

    measurementType: "time",

    description:
      "1500m 달리기 기록을 측정합니다.",

    cameraView: "side",

    motionAnalysis: false,

    metrics: [
      "기록",
      "페이스",
      "구간별 속도"
    ]
  },


  {
    id: "beep-test",

    name: "셔틀런",

    category: "endurance",

    icon: "🔊",

    unit: "count",

    ability: "심폐지구력",

    measurementType: "count",

    description:
      "단계적으로 증가하는 속도에 맞춰 왕복 달리기를 수행합니다.",

    cameraView: "side",

    motionAnalysis: false,

    metrics: [
      "최종 단계",
      "총 횟수",
      "예상 유산소 능력"
    ]
  },


  /* =======================================================
     STRENGTH
  ======================================================= */

  {
    id: "grip-strength",

    name: "악력",

    category: "strength",

    icon: "✊",

    unit: "kg",

    ability: "근력",

    measurementType: "weight",

    description:
      "악력계를 이용하여 손과 전완의 최대 근력을 측정합니다.",

    cameraView: "front",

    motionAnalysis: false,

    metrics: [
      "좌측 악력",
      "우측 악력",
      "좌우 차이"
    ]
  },


  {
    id: "back-strength",

    name: "배근력",

    category: "strength",

    icon: "💪",

    unit: "kg",

    ability: "전신 근력",

    measurementType: "weight",

    description:
      "등과 하지의 등척성 최대 근력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "몸통각",
      "무릎각",
      "고관절각",
      "당김 자세"
    ]
  },


  {
    id: "pull-up",

    name: "턱걸이",

    category: "bodyweight",

    icon: "🧗",

    unit: "count",

    ability: "상체 근지구력",

    measurementType: "count",

    description:
      "상체 당기기 근력과 근지구력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "팔꿈치 각도",
      "어깨 움직임",
      "몸통 흔들림",
      "완전 반복 여부"
    ]
  },


  /* =======================================================
     BODYWEIGHT
  ======================================================= */

  {
    id: "push-up",

    name: "팔굽혀펴기",

    category: "bodyweight",

    icon: "💪",

    unit: "count",

    ability: "상체 근지구력",

    measurementType: "count",

    description:
      "가슴·삼두·코어의 반복 근지구력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "팔꿈치 각도",
      "몸통 정렬",
      "고관절 높이",
      "반복 템포"
    ]
  },


  {
    id: "sit-up",

    name: "윗몸일으키기",

    category: "core",

    icon: "🧍",

    unit: "count",

    ability: "코어 근지구력",

    measurementType: "count",

    description:
      "복부와 몸통의 반복 근지구력을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "몸통각",
      "반복 속도",
      "완전 반복",
      "좌우 흔들림"
    ]
  },


  {
    id: "squat",

    name: "맨몸 스쿼트",

    category: "bodyweight",

    icon: "🏋️",

    unit: "count",

    ability: "하지 기능",

    measurementType: "count",

    description:
      "하지 근력, 가동성, 좌우 대칭성과 기본 움직임 패턴을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "무릎 각도",
      "고관절 각도",
      "발목 각도",
      "몸통 기울기",
      "좌우 대칭성",
      "스쿼트 깊이"
    ],

    checkpoints: [
      "무릎과 발끝 방향",
      "골반 좌우 이동",
      "뒤꿈치 접지",
      "몸통 안정성",
      "최저점 깊이"
    ]
  },


  {
    id: "lunge",

    name: "런지",

    category: "bodyweight",

    icon: "🦵",

    unit: "count",

    ability: "하지 안정성",

    measurementType: "count",

    description:
      "편측 하지 근력과 골반·무릎 안정성을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "앞무릎 각도",
      "뒷무릎 각도",
      "골반 정렬",
      "좌우 균형",
      "몸통 기울기"
    ]
  },


  {
    id: "single-leg-squat",

    name: "싱글 레그 스쿼트",

    category: "bodyweight",

    icon: "🦵",

    unit: "count",

    ability: "편측 안정성",

    measurementType: "count",

    description:
      "한쪽 다리의 근력과 무릎·골반 안정성을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "무릎 내측 이동",
      "골반 기울기",
      "몸통 보상",
      "좌우 차이"
    ]
  },


  {
    id: "burpee",

    name: "버피 테스트",

    category: "bodyweight",

    icon: "🔥",

    unit: "count",

    ability: "전신 체력",

    measurementType: "count",

    description:
      "전신 움직임을 반복하여 파워와 근지구력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "반복 속도",
      "점프",
      "푸시업 자세",
      "전신 리듬"
    ]
  },


  {
    id: "plank",

    name: "플랭크",

    category: "core",

    icon: "━",

    unit: "sec",

    ability: "코어 안정성",

    measurementType: "time",

    description:
      "정적 자세 유지 능력과 몸통 안정성을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "몸통 정렬",
      "골반 높이",
      "어깨 정렬",
      "자세 유지시간"
    ]
  },


  /* =======================================================
     FLEXIBILITY
  ======================================================= */

  {
    id: "sit-and-reach",

    name: "좌전굴",

    category: "flexibility",

    icon: "🧘",

    unit: "cm",

    ability: "유연성",

    measurementType: "distance",

    description:
      "앉은 자세에서 상체를 앞으로 굽혀 후면사슬 유연성을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "도달 거리",
      "골반 굴곡",
      "척추 굴곡"
    ]
  },


  {
    id: "trunk-flexion",

    name: "체전굴",

    category: "flexibility",

    icon: "🤸",

    unit: "cm",

    ability: "유연성",

    measurementType: "distance",

    description:
      "몸통 전방 굴곡 가동범위를 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "몸통 굴곡",
      "고관절 굴곡",
      "도달 거리"
    ]
  },


  /* =======================================================
     THROW / POWER
  ======================================================= */

  {
    id: "medicine-ball-front",

    name: "메디신볼 던지기",

    category: "throw",

    icon: "⚫",

    unit: "m",

    ability: "전신 파워",

    measurementType: "distance",

    description:
      "메디신볼을 전방으로 던져 상·하지 협응과 전신 파워를 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "릴리스 각도",
      "몸통 회전",
      "하지 신전",
      "팔 스피드"
    ]
  },


  {
    id: "medicine-ball-back",

    name: "메디신볼 백드로우",

    category: "throw",

    icon: "💣",

    unit: "m",

    ability: "후면사슬 파워",

    measurementType: "distance",

    description:
      "후방 메디신볼 던지기로 전신 신전 파워를 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "고관절 신전",
      "무릎 신전",
      "릴리스 타이밍",
      "릴리스 각도"
    ]
  },


  {
    id: "medicine-ball-chest",

    name: "메디신볼 체스트 패스",

    category: "power",

    icon: "🏐",

    unit: "m",

    ability: "상체 파워",

    measurementType: "distance",

    description:
      "가슴 앞에서 메디신볼을 던져 상체 폭발력을 측정합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "팔 신전 속도",
      "몸통 사용",
      "릴리스 각도"
    ]
  },


  /* =======================================================
     BALL SPORTS
  ======================================================= */

  {
    id: "basketball-dribble",

    name: "농구 드리블",

    category: "ball",

    icon: "🏀",

    unit: "sec",

    ability: "볼 컨트롤",

    measurementType: "time",

    description:
      "코스 드리블 수행시간과 방향전환 능력을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "드리블 높이",
      "방향전환",
      "중심 이동",
      "볼 컨트롤"
    ]
  },


  {
    id: "basketball-layup",

    name: "농구 레이업",

    category: "ball",

    icon: "🏀",

    unit: "score",

    ability: "농구 기술",

    measurementType: "score",

    description:
      "스텝·도약·릴리스 연결을 분석합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "스텝 리듬",
      "도약",
      "무릎 드라이브",
      "릴리스"
    ]
  },


  {
    id: "soccer-dribble",

    name: "축구 드리블",

    category: "ball",

    icon: "⚽",

    unit: "sec",

    ability: "볼 컨트롤",

    measurementType: "time",

    description:
      "축구 드리블 코스의 수행시간과 볼 컨트롤을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "볼 터치",
      "방향전환",
      "스텝 빈도",
      "중심 이동"
    ]
  },


  {
    id: "soccer-kick",

    name: "축구 킥",

    category: "ball",

    icon: "⚽",

    unit: "score",

    ability: "킥 기술",

    measurementType: "score",

    description:
      "킥 동작의 접근·지지발·스윙·임팩트 동작을 분석합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "접근각",
      "지지발 위치",
      "고관절 회전",
      "무릎 신전",
      "팔로스루"
    ]
  },


  {
    id: "volleyball-spike",

    name: "배구 스파이크",

    category: "ball",

    icon: "🏐",

    unit: "score",

    ability: "점프·타격",

    measurementType: "score",

    description:
      "도약과 상지 스윙 타이밍을 분석합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "어프로치",
      "도약",
      "팔 스윙",
      "타점",
      "착지"
    ]
  },


  {
    id: "handball-throw",

    name: "핸드볼 던지기",

    category: "ball",

    icon: "🤾",

    unit: "m",

    ability: "투척 파워",

    measurementType: "distance",

    description:
      "핸드볼 투척 거리와 전신 협응을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "스텝",
      "몸통 회전",
      "어깨 회전",
      "릴리스"
    ]
  },


  /* =======================================================
     BALANCE
  ======================================================= */

  {
    id: "single-leg-balance",

    name: "외발서기",

    category: "balance",

    icon: "⚖️",

    unit: "sec",

    ability: "평형성",

    measurementType: "time",

    description:
      "한 발 지지 상태에서 자세 유지 능력을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "몸통 흔들림",
      "골반 흔들림",
      "무릎 안정성",
      "유지시간"
    ]
  },


  /* =======================================================
     SPECIAL
  ======================================================= */

  {
    id: "zigzag-run",

    name: "지그재그런",

    category: "special",

    icon: "⚡",

    unit: "sec",

    ability: "민첩성",

    measurementType: "time",

    description:
      "연속 방향전환 코스를 빠르게 통과하는 능력을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "턴 속도",
      "접지시간",
      "중심 이동",
      "재가속"
    ]
  },


  {
    id: "figure-eight-run",

    name: "8자 달리기",

    category: "special",

    icon: "∞",

    unit: "sec",

    ability: "민첩성",

    measurementType: "time",

    description:
      "8자 형태의 코스를 이동하며 방향전환 능력을 평가합니다.",

    cameraView: "front",

    motionAnalysis: true,

    metrics: [
      "턴 반경",
      "중심 이동",
      "속도 유지"
    ]
  },


  {
    id: "obstacle-run",

    name: "장애물 달리기",

    category: "special",

    icon: "🚧",

    unit: "sec",

    ability: "종합 운동능력",

    measurementType: "time",

    description:
      "다양한 장애물을 통과하며 스피드·민첩성·협응력을 평가합니다.",

    cameraView: "side",

    motionAnalysis: true,

    metrics: [
      "장애물 통과",
      "스텝",
      "점프",
      "방향전환"
    ]
  }

];


/* =========================================================
   03. STATE
========================================================= */

let currentEventCategory = "all";

let currentEventSearch = "";

let selectedEventId = null;


/* =========================================================
   04. HELPERS
========================================================= */

function getEventById(id) {

  return EVENTS.find(event => event.id === id);

}


function getCategoryName(category) {

  return EVENT_CATEGORIES[category] || category;

}


function getEventUnitLabel(unit) {

  const map = {

    sec: "초",

    cm: "cm",

    m: "m",

    kg: "kg",

    count: "회",

    score: "점"

  };

  return map[unit] || unit;

}


function getCameraViewLabel(view) {

  const map = {

    front: "정면",

    side: "측면",

    rear: "후면",

    top: "상단"

  };

  return map[view] || "-";

}


/* =========================================================
   05. INITIALIZE
========================================================= */

function initEvents() {

  updateEventCount();

  renderEvents();

  bindEventSearch();

  bindCategoryTabs();

  bindEventModal();

}


/* =========================================================
   06. EVENT COUNT
========================================================= */

function updateEventCount() {

  const element =
    document.getElementById("eventTotalCount");

  if (!element) return;

  element.textContent = EVENTS.length;

}


/* =========================================================
   07. RENDER EVENTS
========================================================= */

function renderEvents() {

  const grid =
    document.getElementById("eventGrid");

  if (!grid) return;


  const keyword =
    currentEventSearch
      .trim()
      .toLowerCase();


  const filtered = EVENTS.filter(event => {

    const categoryMatch =
      currentEventCategory === "all" ||
      event.category === currentEventCategory;


    const searchText = [

      event.name,

      event.ability,

      event.description,

      getCategoryName(event.category),

      ...(event.metrics || [])

    ]
      .join(" ")
      .toLowerCase();


    const searchMatch =
      !keyword ||
      searchText.includes(keyword);


    return categoryMatch && searchMatch;

  });


  if (!filtered.length) {

    grid.innerHTML = `

      <div class="empty-state">

        조건에 맞는 실기 종목이 없습니다.

      </div>

    `;

    return;

  }


  grid.innerHTML =
    filtered
      .map(createEventCardHTML)
      .join("");


  grid
    .querySelectorAll(".event-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          openEventModal(
            card.dataset.eventId
          );

        }
      );

    });

}


/* =========================================================
   08. EVENT CARD
========================================================= */

function createEventCardHTML(event) {

  const aiLabel =
    event.motionAnalysis
      ? "AI 분석 지원"
      : "기록 측정";


  return `

    <article
      class="event-card"
      data-event-id="${event.id}"
    >

      <div class="event-pictogram">

        ${event.icon}

      </div>


      <span class="eyebrow">

        ${getCategoryName(event.category)}

      </span>


      <h3>

        ${event.name}

      </h3>


      <p>

        ${event.description}

      </p>


      <div class="event-card-footer">

        <span class="event-ability-badge">

          ${event.ability}

        </span>


        <span class="event-ability-badge">

          ${aiLabel}

        </span>

      </div>

    </article>

  `;

}


/* =========================================================
   09. SEARCH
========================================================= */

function bindEventSearch() {

  const input =
    document.getElementById("eventSearch");

  if (!input) return;


  input.addEventListener(
    "input",
    event => {

      currentEventSearch =
        event.target.value || "";

      renderEvents();

    }
  );

}


/* =========================================================
   10. CATEGORY
========================================================= */

function bindCategoryTabs() {

  const container =
    document.getElementById(
      "eventCategoryTabs"
    );


  if (!container) return;


  container.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-category]"
        );


      if (!button) return;


      currentEventCategory =
        button.dataset.category || "all";


      container
        .querySelectorAll(
          "[data-category]"
        )
        .forEach(item => {

          item.classList.toggle(
            "active",
            item === button
          );

        });


      renderEvents();

    }
  );

}


/* =========================================================
   11. OPEN MODAL
========================================================= */

function openEventModal(eventId) {

  const event =
    getEventById(eventId);


  if (!event) return;


  selectedEventId =
    event.id;


  setText(
    "modalEventPictogram",
    event.icon
  );


  setText(
    "modalEventCategory",
    getCategoryName(event.category)
  );


  setText(
    "modalEventName",
    event.name
  );


  setText(
    "modalEventDescription",
    event.description
  );


  setText(
    "modalEventAbility",
    event.ability
  );


  setText(
    "modalEventUnit",
    getEventUnitLabel(event.unit)
  );


  setText(
    "modalEventView",
    getCameraViewLabel(
      event.cameraView
    )
  );


  setText(
    "modalEventMetrics",
    (event.metrics || []).join(", ")
  );


  const modal =
    document.getElementById(
      "eventModal"
    );


  if (modal) {

    modal.classList.add("show");

  }

}


/* =========================================================
   12. CLOSE MODAL
========================================================= */

function closeEventModal() {

  const modal =
    document.getElementById(
      "eventModal"
    );


  if (!modal) return;


  modal.classList.remove("show");

}


/* =========================================================
   13. MODAL BUTTON
========================================================= */

function bindEventModal() {

  const closeButton =
    document.getElementById(
      "closeEventModal"
    );


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeEventModal
    );

  }


  const modal =
    document.getElementById(
      "eventModal"
    );


  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (event.target === modal) {

          closeEventModal();

        }

      }
    );

  }


  const measureButton =
    document.getElementById(
      "measureSelectedEventBtn"
    );


  if (measureButton) {

    measureButton.addEventListener(
      "click",
      () => {

        if (!selectedEventId) return;

        selectEventForMeasurement(
          selectedEventId
        );

      }
    );

  }


  const analysisButton =
    document.getElementById(
      "analyzeSelectedEventBtn"
    );


  if (analysisButton) {

    analysisButton.addEventListener(
      "click",
      () => {

        if (!selectedEventId) return;

        selectEventForAnalysis(
          selectedEventId
        );

      }
    );

  }

}


/* =========================================================
   14. SELECT FOR MEASUREMENT
========================================================= */

function selectEventForMeasurement(eventId) {

  const event =
    getEventById(eventId);


  if (!event) return;


  selectedEventId =
    event.id;


  localStorage.setItem(
    "pe_selected_event",
    event.id
  );


  const select =
    document.getElementById(
      "measurementEvent"
    );


  if (select) {

    select.value =
      event.id;

  }


  closeEventModal();


  navigateToPage(
    "measurement"
  );


  updateMeasurementEventUI(
    event
  );


  showToast(
    `${event.name} 측정을 준비했습니다.`
  );

}


/* =========================================================
   15. SELECT FOR AI ANALYSIS
========================================================= */

function selectEventForAnalysis(eventId) {

  const event =
    getEventById(eventId);


  if (!event) return;


  selectedEventId =
    event.id;


  localStorage.setItem(
    "pe_selected_analysis_event",
    event.id
  );


  const select =
    document.getElementById(
      "motionEvent"
    );


  if (select) {

    select.value =
      event.id;

  }


  closeEventModal();


  navigateToPage(
    "motion"
  );


  updateMotionEventUI(
    event
  );


  showToast(
    `${event.name} AI 자세분석 준비 완료`
  );

}


/* =========================================================
   16. MEASUREMENT UI
========================================================= */

function updateMeasurementEventUI(event) {

  if (!event) return;


  setText(
    "measurementEventName",
    event.name
  );


  setText(
    "measurementEventAbility",
    event.ability
  );


  setText(
    "measurementEventUnit",
    getEventUnitLabel(
      event.unit
    )
  );


  setText(
    "measurementPictogram",
    event.icon
  );


  const info =
    document.getElementById(
      "selectedEventInfo"
    );


  if (info) {

    info.innerHTML = `

      <strong>
        ${event.name}
      </strong>

      <br>

      ${event.description}

      <br><br>

      <span>
        측정 단위 :
        ${getEventUnitLabel(event.unit)}
      </span>

      <br>

      <span>
        주요 능력 :
        ${event.ability}
      </span>

    `;

  }

}


/* =========================================================
   17. MOTION ANALYSIS UI
========================================================= */

function updateMotionEventUI(event) {

  if (!event) return;


  setText(
    "motionEventName",
    event.name
  );


  setText(
    "motionEventAbility",
    event.ability
  );


  setText(
    "motionRecommendedView",
    getCameraViewLabel(
      event.cameraView
    )
  );


  setText(
    "motionPictogram",
    event.icon
  );


  const checkpoint =
    document.getElementById(
      "motionCheckpointList"
    );


  if (checkpoint) {

    const points =
      event.checkpoints ||
      event.metrics ||
      [];


    checkpoint.innerHTML =
      points
        .map(
          item => `

            <div class="checkpoint-row">

              <span>
                ${item}
              </span>

              <strong>
                READY
              </strong>

            </div>

          `
        )
        .join("");

  }


  /* 자동 권장 카메라 방향 */

  document
    .querySelectorAll(
      "[data-motion-view]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.motionView ===
          event.cameraView
      );

    });

}


/* =========================================================
   18. POPULATE SELECTS
========================================================= */

function populateEventSelects() {

  const ids = [

    "measurementEvent",

    "motionEvent",

    "recordEventFilter"

  ];


  ids.forEach(id => {

    const select =
      document.getElementById(id);


    if (!select) return;


    const firstOption =
      id === "recordEventFilter"
        ? `<option value="all">전체 종목</option>`
        : `<option value="">종목 선택</option>`;


    select.innerHTML =
      firstOption +
      EVENTS
        .map(
          event => `

            <option value="${event.id}">

              ${event.name}

            </option>

          `
        )
        .join("");

  });

}


/* =========================================================
   19. QUICK EVENT LIST
========================================================= */

function renderQuickEvents() {

  const container =
    document.getElementById(
      "eventQuickList"
    );


  if (!container) return;


  const quickIds = [

    "standing-long-jump",

    "vertical-jump",

    "side-step",

    "20m-sprint",

    "medicine-ball-front",

    "sit-up"

  ];


  const quickEvents =
    quickIds
      .map(getEventById)
      .filter(Boolean);


  container.innerHTML =
    quickEvents
      .map(
        event => `

          <button
            class="event-quick-item"
            data-quick-event="${event.id}"
          >

            <div style="
              font-size:28px;
              margin-bottom:10px;
            ">

              ${event.icon}

            </div>

            <strong>

              ${event.name}

            </strong>

            <div style="
              margin-top:6px;
              color:#718995;
              font-size:9px;
            ">

              ${event.ability}

            </div>

          </button>

        `
      )
      .join("");


  container
    .querySelectorAll(
      "[data-quick-event]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openEventModal(
            button.dataset.quickEvent
          );

        }
      );

    });

}


/* =========================================================
   20. SELECT CHANGE
========================================================= */

function bindEventSelectChanges() {

  const measurement =
    document.getElementById(
      "measurementEvent"
    );


  if (measurement) {

    measurement.addEventListener(
      "change",
      () => {

        const event =
          getEventById(
            measurement.value
          );


        if (!event) return;


        selectedEventId =
          event.id;


        updateMeasurementEventUI(
          event
        );

      }
    );

  }


  const motion =
    document.getElementById(
      "motionEvent"
    );


  if (motion) {

    motion.addEventListener(
      "change",
      () => {

        const event =
          getEventById(
            motion.value
          );


        if (!event) return;


        selectedEventId =
          event.id;


        updateMotionEventUI(
          event
        );

      }
    );

  }

}


/* =========================================================
   21. RESTORE SELECTED EVENT
========================================================= */

function restoreSelectedEvents() {

  const measurementId =
    localStorage.getItem(
      "pe_selected_event"
    );


  if (measurementId) {

    const event =
      getEventById(
        measurementId
      );


    const select =
      document.getElementById(
        "measurementEvent"
      );


    if (event && select) {

      select.value =
        event.id;


      updateMeasurementEventUI(
        event
      );

    }

  }


  const analysisId =
    localStorage.getItem(
      "pe_selected_analysis_event"
    );


  if (analysisId) {

    const event =
      getEventById(
        analysisId
      );


    const select =
      document.getElementById(
        "motionEvent"
      );


    if (event && select) {

      select.value =
        event.id;


      updateMotionEventUI(
        event
      );

    }

  }

}


/* =========================================================
   22. SAFE TEXT
========================================================= */

function setText(id, value) {

  const element =
    document.getElementById(id);


  if (!element) return;


  element.textContent =
    value ?? "-";

}


/* =========================================================
   23. SAFE PAGE NAVIGATION

   app.js에 navigateToPage가 있으면 사용.
   없어도 먹통이 되지 않도록 fallback 제공.
========================================================= */

function navigateToPage(pageName) {

  if (
    typeof window.showPage ===
    "function"
  ) {

    window.showPage(pageName);

    return;

  }


  const target =
    document.getElementById(
      `page-${pageName}`
    );


  if (!target) {

    console.warn(
      `[EVENTS] page-${pageName} 페이지가 없습니다.`
    );

    return;

  }


  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove(
        "active"
      );

    });


  target.classList.add(
    "active"
  );


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.page ===
          pageName
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   24. TOAST FALLBACK
========================================================= */

function showToast(message) {

  if (
    typeof window.appToast ===
    "function"
  ) {

    window.appToast(message);

    return;

  }


  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) {

    console.log(message);

    return;

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.timer
  );


  showToast.timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================================================
   25. PUBLIC API
========================================================= */

window.PE_EVENTS =
  EVENTS;


window.getPEEvent =
  getEventById;


window.openPEEvent =
  openEventModal;


window.selectPEEventForMeasurement =
  selectEventForMeasurement;


window.selectPEEventForAnalysis =
  selectEventForAnalysis;


/* =========================================================
   26. START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initEvents();

    populateEventSelects();

    renderQuickEvents();

    bindEventSelectChanges();

    restoreSelectedEvents();

  }
);