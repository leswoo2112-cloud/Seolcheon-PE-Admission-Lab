/* =========================================================
   설천고 스포츠과학 분석센터 PRO
   ③ events.js
   체대입시 전용 데이터 / 기록 / 선수 / 목표대학
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE
========================================================= */

const EVENT_STORAGE =
  "seolcheon_event_records";

const ATHLETE_STORAGE =
  "seolcheon_athletes";

const GOAL_STORAGE =
  "seolcheon_college_goal";


function readStorage(
  key,
  fallback = []
) {

  try {

    const value =
      localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);

  } catch (error) {

    console.error(
      "Storage read error:",
      error
    );

    return fallback;
  }

}


function writeStorage(
  key,
  value
) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  } catch (error) {

    console.error(
      "Storage write error:",
      error
    );

  }

}


/* =========================================================
   체대입시 종목
========================================================= */

const COLLEGE_EVENTS = [

  {
    id: "standing_jump",
    name: "제자리멀리뛰기",
    icon: "🦘",
    category: "순발력",
    unit: "cm",

    description:
      "하체 폭발력과 수평 방향 순발력을 평가합니다.",

    excellent: 280,
    good: 250,
    average: 220,

    higherBetter: true,

    training: [

      {
        name: "브로드 점프",
        description:
          "최대거리 점프 4~5회 × 4세트",
        tag: "수평폭발력"
      },

      {
        name: "박스 점프",
        description:
          "5~6회 × 4세트",
        tag: "폭발력"
      },

      {
        name: "스쿼트 점프",
        description:
          "6~8회 × 4세트",
        tag: "하체파워"
      },

      {
        name: "힙쓰러스트",
        description:
          "8~12회 × 4세트",
        tag: "둔근"
      }

    ]
  },


  {
    id: "50m",
    name: "50m 달리기",
    icon: "🏃",
    category: "스피드",
    unit: "초",

    description:
      "단거리 가속 능력과 최고속도를 평가합니다.",

    excellent: 6.5,
    good: 7.0,
    average: 7.5,

    higherBetter: false,

    training: [

      {
        name: "10m 스타트",
        description:
          "10m 전력질주 × 6~8회",
        tag: "가속"
      },

      {
        name: "20m 가속주",
        description:
          "20m × 6회",
        tag: "초기속도"
      },

      {
        name: "플라잉 20m",
        description:
          "최고속도 구간 5회",
        tag: "최고속도"
      },

      {
        name: "A-Skip",
        description:
          "20m × 4회",
        tag: "주법"
      }

    ]
  },


  {
    id: "100m",
    name: "100m 달리기",
    icon: "⚡",
    category: "스피드",
    unit: "초",

    description:
      "가속과 최고속도 유지 능력을 평가합니다.",

    excellent: 12.5,
    good: 13.5,
    average: 14.5,

    higherBetter: false,

    training: [

      {
        name: "30m 스프린트",
        description:
          "30m × 6회",
        tag: "가속"
      },

      {
        name: "플라잉 30m",
        description:
          "30m × 5회",
        tag: "최고속도"
      },

      {
        name: "언덕 스프린트",
        description:
          "10~15초 × 6회",
        tag: "파워"
      },

      {
        name: "스프린트 드릴",
        description:
          "A-Skip / B-Skip 4세트",
        tag: "주법"
      }

    ]
  },


  {
    id: "shuttle",
    name: "10m 왕복달리기",
    icon: "🔄",
    category: "민첩성",
    unit: "회",

    description:
      "방향전환과 민첩성을 평가합니다.",

    excellent: 13,
    good: 11,
    average: 9,

    higherBetter: true,

    training: [

      {
        name: "5-10-5 드릴",
        description:
          "방향전환 5회 × 4세트",
        tag: "민첩성"
      },

      {
        name: "셔틀런",
        description:
          "20초 × 6세트",
        tag: "심폐"
      },

      {
        name: "사이드 셔플",
        description:
          "10m × 6회",
        tag: "측면이동"
      },

      {
        name: "반응 드릴",
        description:
          "랜덤 방향 10회 × 4세트",
        tag: "반응속도"
      }

    ]
  },


  {
    id: "situp",
    name: "윗몸일으키기",
    icon: "💪",
    category: "근지구력",
    unit: "회",

    description:
      "복근과 코어 근지구력을 평가합니다.",

    excellent: 60,
    good: 50,
    average: 40,

    higherBetter: true,

    training: [

      {
        name: "윗몸일으키기",
        description:
          "20회 × 4세트",
        tag: "복근"
      },

      {
        name: "크런치",
        description:
          "15~20회 × 4세트",
        tag: "복근"
      },

      {
        name: "리버스 크런치",
        description:
          "12~15회 × 4세트",
        tag: "하복부"
      },

      {
        name: "플랭크",
        description:
          "30~60초 × 4세트",
        tag: "코어"
      }

    ]
  },


  {
    id: "pushup",
    name: "팔굽혀펴기",
    icon: "🤸",
    category: "상체근지구력",
    unit: "회",

    description:
      "상체 근지구력과 체간 안정성을 평가합니다.",

    excellent: 55,
    good: 45,
    average: 35,

    higherBetter: true,

    training: [

      {
        name: "푸쉬업",
        description:
          "12~20회 × 4세트",
        tag: "상체"
      },

      {
        name: "클로즈그립 푸쉬업",
        description:
          "8~15회 × 3세트",
        tag: "삼두"
      },

      {
        name: "숄더탭",
        description:
          "좌우 10회 × 3세트",
        tag: "안정성"
      },

      {
        name: "플랭크",
        description:
          "45초 × 4세트",
        tag: "코어"
      }

    ]
  },


  {
    id: "pullup",
    name: "턱걸이",
    icon: "🧗",
    category: "상체근력",
    unit: "회",

    description:
      "등과 팔의 상대근력을 평가합니다.",

    excellent: 15,
    good: 10,
    average: 6,

    higherBetter: true,

    training: [

      {
        name: "풀업",
        description:
          "최대반복 × 4세트",
        tag: "등"
      },

      {
        name: "네거티브 풀업",
        description:
          "3~5회 × 4세트",
        tag: "등"
      },

      {
        name: "랫풀다운",
        description:
          "8~12회 × 4세트",
        tag: "광배"
      },

      {
        name: "데드행",
        description:
          "20~40초 × 4세트",
        tag: "악력"
      }

    ]
  },


  {
    id: "sit_reach",
    name: "좌전굴",
    icon: "🧘",
    category: "유연성",
    unit: "cm",

    description:
      "허리와 햄스트링 유연성을 평가합니다.",

    excellent: 25,
    good: 18,
    average: 10,

    higherBetter: true,

    training: [

      {
        name: "햄스트링 스트레칭",
        description:
          "30~40초 × 3세트",
        tag: "햄스트링"
      },

      {
        name: "90/90",
        description:
          "좌우 8회 × 3세트",
        tag: "고관절"
      },

      {
        name: "코사크 스쿼트",
        description:
          "좌우 8회 × 3세트",
        tag: "가동성"
      },

      {
        name: "월드그레이티스트",
        description:
          "좌우 5회 × 3세트",
        tag: "전신"
      }

    ]
  },


  {
    id: "medicine_ball",
    name: "메디신볼 던지기",
    icon: "🏐",
    category: "파워",
    unit: "m",

    description:
      "전신 폭발적인 힘을 평가합니다.",

    excellent: 12,
    good: 10,
    average: 8,

    higherBetter: true,

    training: [

      {
        name: "체스트 패스",
        description:
          "5회 × 5세트",
        tag: "상체파워"
      },

      {
        name: "오버헤드 던지기",
        description:
          "5회 × 5세트",
        tag: "전신"
      },

      {
        name: "로테이션 던지기",
        description:
          "좌우 5회 × 4세트",
        tag: "회전파워"
      },

      {
        name: "케틀벨 스윙",
        description:
          "10회 × 4세트",
        tag: "힙파워"
      }

    ]
  },


  {
    id: "1000m",
    name: "1000m 달리기",
    icon: "🏃‍♂️",
    category: "지구력",
    unit: "분",

    description:
      "심폐지구력과 페이스 유지 능력을 평가합니다.",

    excellent: 3.2,
    good: 3.6,
    average: 4.0,

    higherBetter: false,

    training: [

      {
        name: "400m 인터벌",
        description:
          "400m × 4~6회",
        tag: "심폐"
      },

      {
        name: "템포런",
        description:
          "10~20분 지속",
        tag: "지구력"
      },

      {
        name: "200m 인터벌",
        description:
          "200m × 8회",
        tag: "스피드지구력"
      },

      {
        name: "이지런",
        description:
          "20~30분",
        tag: "기초지구력"
      }

    ]
  },


  {
    id: "vertical_jump",
    name: "서전트 점프",
    icon: "⬆️",
    category: "순발력",
    unit: "cm",

    description:
      "수직 방향 폭발력을 평가합니다.",

    excellent: 70,
    good: 60,
    average: 50,

    higherBetter: true,

    training: [

      {
        name: "카운터무브먼트 점프",
        description:
          "5회 × 5세트",
        tag: "수직파워"
      },

      {
        name: "박스 점프",
        description:
          "5회 × 4세트",
        tag: "폭발력"
      },

      {
        name: "스쿼트",
        description:
          "5~8회 × 4세트",
        tag: "근력"
      },

      {
        name: "포고 점프",
        description:
          "15회 × 4세트",
        tag: "탄성"
      }

    ]
  },


  {
    id: "burpee",
    name: "버피 테스트",
    icon: "🔥",
    category: "전신체력",
    unit: "회",

    description:
      "전신 근지구력과 심폐능력을 평가합니다.",

    excellent: 20,
    good: 16,
    average: 12,

    higherBetter: true,

    training: [

      {
        name: "버피",
        description:
          "30초 × 5세트",
        tag: "전신"
      },

      {
        name: "마운틴클라이머",
        description:
          "30초 × 5세트",
        tag: "심폐"
      },

      {
        name: "스쿼트 스러스터",
        description:
          "10회 × 4세트",
        tag: "전신"
      },

      {
        name: "타바타",
        description:
          "20초 운동 / 10초 휴식 × 8",
        tag: "전신지구력"
      }

    ]
  }

];


/* =========================================================
   STATE
========================================================= */

let selectedEventId = null;


/* =========================================================
   DOM
========================================================= */

function eventElement(id) {
  return document.getElementById(id);
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   TOAST
========================================================= */

function eventToast(
  message
) {

  const toast =
    eventElement("toast");

  if (!toast) {
    return;
  }


  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  clearTimeout(
    eventToast.timer
  );


  eventToast.timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2300
    );

}


/* =========================================================
   EVENT CARDS
========================================================= */

function renderCollegeEvents() {

  const container =
    eventElement("eventList");

  if (!container) {
    return;
  }


  container.innerHTML = "";


  COLLEGE_EVENTS.forEach(
    event => {

      const card =
        document.createElement("button");


      card.type =
        "button";


      card.className =
        "event-card";


      card.dataset.eventId =
        event.id;


      card.innerHTML = `

        <div class="event-icon">
          ${event.icon}
        </div>

        <div class="event-info">

          <span>
            ${escapeHTML(event.category)}
          </span>

          <strong>
            ${escapeHTML(event.name)}
          </strong>

          <small>
            ${escapeHTML(event.description)}
          </small>

        </div>

        <div class="event-unit">
          ${escapeHTML(event.unit)}
        </div>

      `;


      card.addEventListener(
        "click",
        () => {

          selectCollegeEvent(
            event.id
          );

        }
      );


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   SELECT EVENT
========================================================= */

function selectCollegeEvent(
  eventId
) {

  const event =
    COLLEGE_EVENTS.find(
      item =>
        item.id === eventId
    );


  if (!event) {
    return;
  }


  selectedEventId =
    eventId;


  document
    .querySelectorAll(
      ".event-card"
    )
    .forEach(
      card => {

        card.classList.toggle(
          "selected",
          card.dataset.eventId ===
            eventId
        );

      }
    );


  setEventText(
    "selectedEventIcon",
    event.icon
  );


  setEventText(
    "selectedEventName",
    event.name
  );


  setEventText(
    "selectedEventDescription",
    event.description
  );


  setEventText(
    "selectedEventUnit",
    event.unit
  );


  setEventText(
    "eventExcellent",
    formatEventValue(
      event.excellent,
      event.unit
    )
  );


  setEventText(
    "eventGood",
    formatEventValue(
      event.good,
      event.unit
    )
  );


  setEventText(
    "eventAverage",
    formatEventValue(
      event.average,
      event.unit
    )
  );


  const input =
    eventElement(
      "eventValueInput"
    );


  if (input) {

    input.value = "";

    setTimeout(
      () => input.focus(),
      50
    );

  }


  renderEventTraining(
    event
  );


  resetEventResult();

}


/* =========================================================
   FORMAT
========================================================= */

function formatEventValue(
  value,
  unit
) {

  if (
    typeof value !==
    "number"
  ) {
    return "-";
  }


  return `${value}${unit}`;

}


/* =========================================================
   SET TEXT
========================================================= */

function setEventText(
  id,
  value
) {

  const element =
    eventElement(id);

  if (element) {
    element.textContent =
      value;
  }

}


/* =========================================================
   SCORE
========================================================= */

function calculateEventScore(
  event,
  value
) {

  if (
    !event ||
    !Number.isFinite(value)
  ) {
    return 0;
  }


  const excellent =
    Number(event.excellent);

  const average =
    Number(event.average);


  if (
    event.higherBetter
  ) {

    if (
      value >= excellent
    ) {
      return 100;
    }


    if (
      value <= average
    ) {

      return Math.max(
        0,
        Math.round(
          (
            value /
            average
          ) * 60
        )
      );

    }


    return Math.round(
      60 +
      (
        (
          value -
          average
        ) /
        (
          excellent -
          average
        )
      ) * 40
    );

  }


  /* 낮을수록 좋은 기록 */

  if (
    value <= excellent
  ) {
    return 100;
  }


  if (
    value >= average
  ) {

    const ratio =
      excellent /
      Math.max(
        value,
        .01
      );


    return Math.max(
      0,
      Math.min(
        59,
        Math.round(
          ratio * 60
        )
      )
    );

  }


  return Math.round(
    100 -
    (
      (
        value -
        excellent
      ) /
      (
        average -
        excellent
      )
    ) * 40
  );

}


/* =========================================================
   GRADE
========================================================= */

function calculateGrade(
  score
) {

  if (score >= 95) {
    return "S";
  }

  if (score >= 90) {
    return "A+";
  }

  if (score >= 85) {
    return "A";
  }

  if (score >= 80) {
    return "B+";
  }

  if (score >= 75) {
    return "B";
  }

  if (score >= 70) {
    return "C+";
  }

  if (score >= 60) {
    return "C";
  }

  if (score >= 50) {
    return "D";
  }

  return "E";

}


/* =========================================================
   ANALYZE EVENT
========================================================= */

function analyzeCollegeEvent() {

  if (!selectedEventId) {

    eventToast(
      "먼저 종목을 선택하세요."
    );

    return;

  }


  const event =
    COLLEGE_EVENTS.find(
      item =>
        item.id ===
        selectedEventId
    );


  const input =
    eventElement(
      "eventValueInput"
    );


  const value =
    Number(
      input?.value
    );


  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    eventToast(
      "올바른 측정 기록을 입력하세요."
    );

    input?.focus();

    return;

  }


  const athleteSelect =
    eventElement(
      "athleteSelect"
    );


  const athleteId =
    athleteSelect?.value ||
    "";


  const score =
    Math.max(
      0,
      Math.min(
        100,
        calculateEventScore(
          event,
          value
        )
      )
    );


  const grade =
    calculateGrade(
      score
    );


  setEventText(
    "eventValue",
    formatEventValue(
      value,
      event.unit
    )
  );


  setEventText(
    "eventScore",
    `${score}/100`
  );


  setEventText(
    "eventGrade",
    grade
  );


  const progress =
    eventElement(
      "eventScoreBar"
    );


  if (progress) {

    progress.style.width =
      `${score}%`;

  }


  const record = {

    id:
      `record_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    athleteId,

    athleteName:
      getAthleteName(
        athleteId
      ),

    eventId:
      event.id,

    eventName:
      event.name,

    icon:
      event.icon,

    category:
      event.category,

    value,

    unit:
      event.unit,

    score,

    grade,

    createdAt:
      new Date().toISOString()

  };


  const records =
    getEventRecords();


  records.unshift(
    record
  );


  writeStorage(
    EVENT_STORAGE,
    records.slice(
      0,
      500
    )
  );


  renderRecentEventRecords();

  renderAllEventRecords();

  updateEventDashboard();


  document.dispatchEvent(
    new CustomEvent(
      "eventAnalysisComplete",
      {
        detail: record
      }
    )
  );


  eventToast(
    `${event.name} · ${score}점 · ${grade}등급`
  );

}


/* =========================================================
   RESET
========================================================= */

function resetEventResult() {

  setEventText(
    "eventValue",
    "-"
  );

  setEventText(
    "eventScore",
    "0/100"
  );

  setEventText(
    "eventGrade",
    "-"
  );


  const progress =
    eventElement(
      "eventScoreBar"
    );


  if (progress) {
    progress.style.width =
      "0%";
  }

}


/* =========================================================
   TRAINING
========================================================= */

function renderEventTraining(
  event
) {

  const container =
    eventElement(
      "eventRecommendations"
    );


  if (!container) {
    return;
  }


  if (
    !event.training ||
    !event.training.length
  ) {

    container.innerHTML = `
      <div class="empty-state">
        추천 훈련이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    event.training.map(
      (item, index) => `

        <div class="recommendation-item">

          <div class="recommendation-type">
            ${index + 1}
          </div>

          <div>

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <p>
              ${escapeHTML(item.description)}
            </p>

            <span class="training-tag">
              ${escapeHTML(item.tag)}
            </span>

          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   ATHLETES
========================================================= */

function getAthletes() {

  return readStorage(
    ATHLETE_STORAGE,
    []
  );

}


function getAthleteName(
  athleteId
) {

  if (!athleteId) {
    return "선수 미지정";
  }


  const athlete =
    getAthletes().find(
      item =>
        String(item.id) ===
        String(athleteId)
    );


  return athlete
    ? athlete.name
    : "선수 미지정";

}


/* =========================================================
   ATHLETE SELECT
========================================================= */

function renderAthleteSelect() {

  const select =
    eventElement(
      "athleteSelect"
    );


  if (!select) {
    return;
  }


  const current =
    select.value;


  select.innerHTML = `
    <option value="">
      선수 선택
    </option>
  `;


  getAthletes().forEach(
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
    current &&
    getAthletes().some(
      athlete =>
        String(athlete.id) ===
        String(current)
    )
  ) {

    select.value =
      current;

  }

}


/* =========================================================
   ADD ATHLETE
========================================================= */

function addAthlete() {

  const name =
    eventElement(
      "athleteNameInput"
    )?.value.trim();


  const grade =
    eventElement(
      "athleteGradeInput"
    )?.value.trim();


  const university =
    eventElement(
      "athleteUniversityInput"
    )?.value.trim();


  const major =
    eventElement(
      "athleteMajorInput"
    )?.value.trim();


  if (!name) {

    eventToast(
      "선수 이름을 입력하세요."
    );

    return;

  }


  const athletes =
    getAthletes();


  const athlete = {

    id:
      `athlete_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`,

    name,

    grade,

    university,

    major,

    createdAt:
      new Date().toISOString()

  };


  athletes.push(
    athlete
  );


  writeStorage(
    ATHLETE_STORAGE,
    athletes
  );


  clearAthleteInputs();

  renderAthleteList();

  renderAthleteSelect();

  updateEventDashboard();


  eventToast(
    `${name} 선수 등록 완료`
  );

}


/* =========================================================
   CLEAR ATHLETE INPUT
========================================================= */

function clearAthleteInputs() {

  [
    "athleteNameInput",
    "athleteGradeInput",
    "athleteUniversityInput",
    "athleteMajorInput"

  ].forEach(
    id => {

      const element =
        eventElement(id);

      if (element) {
        element.value = "";
      }

    }
  );

}


/* =========================================================
   ATHLETE LIST
========================================================= */

function renderAthleteList() {

  const container =
    eventElement(
      "athleteList"
    );


  if (!container) {
    return;
  }


  const athletes =
    getAthletes();


  if (!athletes.length) {

    container.innerHTML = `
      <div class="empty-state">
        등록된 선수가 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    athletes.map(
      athlete => `

        <div class="athlete-item">

          <div>

            <strong>
              ${escapeHTML(athlete.name)}
            </strong>

            <span class="muted">
              ${escapeHTML(
                athlete.grade ||
                "학년 미입력"
              )}
            </span>

            <span class="muted">
              ${escapeHTML(
                athlete.university ||
                "목표 대학 미설정"
              )}
            </span>

            <span class="muted">
              ${escapeHTML(
                athlete.major ||
                ""
              )}
            </span>

          </div>


          <button
            class="secondary-button"
            type="button"
            data-delete-athlete="${athlete.id}"
          >
            삭제
          </button>

        </div>

      `
    ).join("");


  container
    .querySelectorAll(
      "[data-delete-athlete]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            deleteAthlete(
              button.dataset.deleteAthlete
            );

          }
        );

      }
    );

}


/* =========================================================
   DELETE ATHLETE
========================================================= */

function deleteAthlete(
  athleteId
) {

  const athletes =
    getAthletes();


  const athlete =
    athletes.find(
      item =>
        String(item.id) ===
        String(athleteId)
    );


  if (!athlete) {
    return;
  }


  const confirmed =
    window.confirm(
      `${athlete.name} 선수를 삭제할까요?`
    );


  if (!confirmed) {
    return;
  }


  const filtered =
    athletes.filter(
      item =>
        String(item.id) !==
        String(athleteId)
    );


  writeStorage(
    ATHLETE_STORAGE,
    filtered
  );


  renderAthleteList();

  renderAthleteSelect();

  eventToast(
    "선수 정보가 삭제되었습니다."
  );

}


/* =========================================================
   GOAL
========================================================= */

function saveCollegeGoal() {

  const goal = {

    university:
      eventElement(
        "collegeUniversity"
      )?.value.trim() || "",

    major:
      eventElement(
        "collegeMajor"
      )?.value.trim() || "",

    targetGrade:
      eventElement(
        "collegeTargetGrade"
      )?.value.trim() || "",

    updatedAt:
      new Date().toISOString()

  };


  writeStorage(
    GOAL_STORAGE,
    goal
  );


  updateEventDashboard();


  eventToast(
    "목표 대학 정보가 저장되었습니다."
  );

}


/* =========================================================
   LOAD GOAL
========================================================= */

function loadCollegeGoal() {

  const goal =
    readStorage(
      GOAL_STORAGE,
      {}
    );


  const university =
    eventElement(
      "collegeUniversity"
    );

  const major =
    eventElement(
      "collegeMajor"
    );

  const targetGrade =
    eventElement(
      "collegeTargetGrade"
    );


  if (university) {
    university.value =
      goal.university || "";
  }

  if (major) {
    major.value =
      goal.major || "";
  }

  if (targetGrade) {
    targetGrade.value =
      goal.targetGrade || "";
  }

}


/* =========================================================
   RECORDS
========================================================= */

function getEventRecords() {

  return readStorage(
    EVENT_STORAGE,
    []
  );

}


/* =========================================================
   RECENT RECORDS
========================================================= */

function renderRecentEventRecords() {

  const container =
    eventElement(
      "recentAnalysisList"
    );


  if (!container) {
    return;
  }


  const records =
    getEventRecords()
      .slice(
        0,
        5
      );


  if (!records.length) {

    container.innerHTML = `
      <div class="empty-state">
        아직 체대입시 분석 기록이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    records.map(
      record => `

        <div class="record-item">

          <div>

            <strong>
              ${record.icon || "🎯"}
              ${escapeHTML(record.eventName)}
            </strong>

            <span>
              ${escapeHTML(
                record.athleteName ||
                getAthleteName(
                  record.athleteId
                )
              )}
            </span>

            <small>
              ${formatRecordDate(
                record.createdAt
              )}
            </small>

          </div>


          <div>

            <span>
              기록
            </span>

            <strong>
              ${record.value}${record.unit}
            </strong>

          </div>


          <div class="record-score">
            ${record.score}
          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   ALL RECORDS
========================================================= */

function renderAllEventRecords() {

  const container =
    eventElement(
      "recordList"
    );


  if (!container) {
    return;
  }


  const records =
    getEventRecords();


  if (!records.length) {

    container.innerHTML = `
      <div class="empty-state">
        아직 저장된 기록이 없습니다.
      </div>
    `;

    return;

  }


  container.innerHTML =
    records.map(
      record => `

        <div class="record-item">

          <div>

            <strong>
              ${record.icon || "🎯"}
              ${escapeHTML(record.eventName)}
            </strong>

            <span>
              ${escapeHTML(
                record.athleteName ||
                getAthleteName(
                  record.athleteId
                )
              )}
            </span>

            <small>
              ${formatRecordDate(
                record.createdAt
              )}
            </small>

          </div>


          <div>

            <span>
              ${record.value}${record.unit}
            </span>

            <strong>
              ${record.grade}
            </strong>

          </div>


          <div class="record-score">
            ${record.score}
          </div>

        </div>

      `
    ).join("");

}


/* =========================================================
   DATE
========================================================= */

function formatRecordDate(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }


  return date.toLocaleString(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateEventDashboard() {

  const athletes =
    getAthletes();


  const records =
    getEventRecords();


  setEventText(
    "athleteCount",
    athletes.length
  );


  setEventText(
    "recordCount",
    records.length
  );


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
      : 0;


  setEventText(
    "averageScore",
    average
  );


  const goal =
    readStorage(
      GOAL_STORAGE,
      {}
    );


  setEventText(
    "targetUniversity",
    goal.university || "-"
  );


  renderRecentEventRecords();

  renderAllEventRecords();

}


/* =========================================================
   ENTER KEY
========================================================= */

function setupEventEnterKey() {

  const input =
    eventElement(
      "eventValueInput"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        analyzeCollegeEvent();

      }

    }
  );

}


/* =========================================================
   EVENTS INIT
========================================================= */

function initEventsModule() {

  renderCollegeEvents();

  renderAthleteList();

  renderAthleteSelect();

  loadCollegeGoal();

  renderRecentEventRecords();

  renderAllEventRecords();

  updateEventDashboard();

  setupEventEnterKey();


  eventElement(
    "submitEventMeasurement"
  )?.addEventListener(
    "click",
    analyzeCollegeEvent
  );


  eventElement(
    "addAthleteButton"
  )?.addEventListener(
    "click",
    addAthlete
  );


  eventElement(
    "saveCollegeGoal"
  )?.addEventListener(
    "click",
    saveCollegeGoal
  );


  console.log(
    "College entrance module ready."
  );

}


/* =========================================================
   GLOBAL API
========================================================= */

window.SeolcheonEvents = {

  getAll:
    () =>
      COLLEGE_EVENTS.slice(),

  getById:
    id =>
      COLLEGE_EVENTS.find(
        event =>
          event.id === id
      ),

  select:
    selectCollegeEvent,

  analyze:
    analyzeCollegeEvent,

  calculateScore:
    calculateEventScore,

  calculateGrade,

  getRecords:
    getEventRecords,

  getAthletes,

  getAthleteName,

  getGoal:
    () =>
      readStorage(
        GOAL_STORAGE,
        {}
      )

};


/* =========================================================
   READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initEventsModule
  );

} else {

  initEventsModule();

}