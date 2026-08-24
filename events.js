/* =========================================================
   설천고 스포츠과학 분석센터 PRO
   ② events.js
   체대입시 실기 데이터 / 픽토그램 / 추천훈련
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     STORAGE
  ======================================================= */

  const ATHLETE_KEY = "seolcheon_athletes";
  const RECORD_KEY = "seolcheon_event_records";
  const GOAL_KEY = "seolcheon_college_goal";


  function loadJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error("Storage load error:", error);
      return fallback;
    }
  }


  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage save error:", error);
    }
  }


  /* =======================================================
     체대입시 종목 데이터
  ======================================================= */

  const EVENTS = [

    {
      id: "standing_jump",
      name: "제자리멀리뛰기",
      icon: "🦘",
      category: "순발력",
      unit: "cm",
      description: "하체 폭발력과 순발력을 평가",
      excellent: 280,
      good: 250,
      average: 220,
      higherBetter: true,

      training: [
        ["박스점프", "40~60cm 박스에서 폭발적인 점프 4세트 × 6회", "순발력"],
        ["스쿼트 점프", "빠르게 내려갔다가 최대 높이로 4세트 × 8회", "폭발력"],
        ["브로드 점프", "최대거리 점프 5회 × 4세트", "수평폭발력"],
        ["싱글레그 바운드", "좌우 각 10회 × 3세트", "탄성"],
        ["힙쓰러스트", "8~12회 × 4세트", "둔근"],
        ["카프 점프", "20회 × 3세트", "발목탄성"]
      ]
    },


    {
      id: "50m",
      name: "50m 달리기",
      icon: "🏃",
      category: "스피드",
      unit: "초",
      description: "단거리 가속과 최고속도 평가",
      excellent: 6.5,
      good: 7.0,
      average: 7.5,
      higherBetter: false,

      training: [
        ["10m 스타트", "10m 전력질주 6~8회", "가속"],
        ["20m 가속주", "20m 전력질주 6회", "초기속도"],
        ["플라잉 20m", "20m 최고속도 구간 5회", "최고속도"],
        ["저항 스프린트", "가벼운 저항으로 10~15m × 6회", "파워"],
        ["A-Skip", "20m × 4회", "러닝폼"],
        ["스프린트 드릴", "10~20m 드릴 4세트", "주법"]
      ]
    },


    {
      id: "100m",
      name: "100m 달리기",
      icon: "⚡",
      category: "스피드",
      unit: "초",
      description: "가속과 최고속도 유지능력 평가",
      excellent: 12.5,
      good: 13.5,
      average: 14.5,
      higherBetter: false,

      training: [
        ["30m 스프린트", "30m × 6회", "가속"],
        ["플라잉 30m", "최고속도 30m × 5회", "최고속도"],
        ["언덕 달리기", "10~15초 × 6회", "파워"],
        ["스프린트 드릴", "A-Skip/B-Skip 4세트", "주법"],
        ["하체 웨이트", "스쿼트 5×5", "근력"],
        ["점프 훈련", "점프 5회 × 4세트", "폭발력"]
      ]
    },


    {
      id: "shuttle",
      name: "10m 왕복달리기",
      icon: "🔄",
      category: "민첩성",
      unit: "회",
      description: "민첩성과 방향전환 능력 평가",
      excellent: 13,
      good: 11,
      average: 9,
      higherBetter: true,

      training: [
        ["5-10-5", "5m-10m-5m 방향전환 × 5회", "민첩성"],
        ["셔틀런", "20초 × 6세트", "민첩성"],
        ["사이드 셔플", "10m × 6회", "측면이동"],
        ["코너 드릴", "방향전환 5회 × 4세트", "전환"],
        ["스플릿 스쿼트", "각 8~10회 × 4세트", "하체"],
        ["반응 드릴", "랜덤 방향 10회 × 4세트", "반응속도"]
      ]
    },


    {
      id: "situp",
      name: "윗몸일으키기",
      icon: "💪",
      category: "근지구력",
      unit: "회",
      description: "복근과 코어 근지구력 평가",
      excellent: 60,
      good: 50,
      average: 40,
      higherBetter: true,

      training: [
        ["윗몸일으키기", "20회 × 4세트", "복근"],
        ["크런치", "15~20회 × 4세트", "복근"],
        ["리버스 크런치", "12~15회 × 4세트", "하복부"],
        ["플랭크", "30~60초 × 4세트", "코어"],
        ["데드버그", "좌우 10회 × 3세트", "코어 안정성"],
        ["바이시클 크런치", "20회 × 3세트", "복근"]
      ]
    },


    {
      id: "pushup",
      name: "팔굽혀펴기",
      icon: "🤸",
      category: "상체근지구력",
      unit: "회",
      description: "상체 근지구력과 체간 안정성 평가",
      excellent: 55,
      good: 45,
      average: 35,
      higherBetter: true,

      training: [
        ["푸쉬업", "12~20회 × 4세트", "상체"],
        ["클로즈그립 푸쉬업", "8~15회 × 3세트", "삼두"],
        ["인클라인 푸쉬업", "15회 × 3세트", "기초근력"],
        ["플랭크", "45초 × 4세트", "코어"],
        ["숄더탭", "좌우 10회 × 3세트", "안정성"],
        ["벤치프레스", "6~10회 × 4세트", "상체근력"]
      ]
    },


    {
      id: "pullup",
      name: "턱걸이",
      icon: "🧗",
      category: "상체근력",
      unit: "회",
      description: "등과 팔의 상대근력 평가",
      excellent: 15,
      good: 10,
      average: 6,
      higherBetter: true,

      training: [
        ["풀업", "최대반복 × 4세트", "등"],
        ["네거티브 풀업", "3~5회 × 4세트", "등"],
        ["랫풀다운", "8~12회 × 4세트", "광배"],
        ["시티드 로우", "8~12회 × 4세트", "등"],
        ["행잉 니레이즈", "10~15회 × 3세트", "코어"],
        ["데드행", "20~40초 × 4세트", "악력"]
      ]
    },


    {
      id: "sit_reach",
      name: "좌전굴",
      icon: "🧘",
      category: "유연성",
      unit: "cm",
      description: "허리와 햄스트링 유연성 평가",
      excellent: 25,
      good: 18,
      average: 10,
      higherBetter: true,

      training: [
        ["햄스트링 스트레칭", "30~40초 × 3세트", "햄스트링"],
        ["고관절 스트레칭", "좌우 30초 × 3세트", "고관절"],
        ["90/90", "좌우 8회 × 3세트", "고관절"],
        ["햄스트링 플로싱", "좌우 10회 × 2세트", "가동성"],
        ["코사크 스쿼트", "좌우 8회 × 3세트", "하체가동성"],
        ["월드그레이티스트", "좌우 5회 × 3세트", "전신가동성"]
      ]
    },


    {
      id: "medicine_ball",
      name: "메디신볼 던지기",
      icon: "🏐",
      category: "파워",
      unit: "m",
      description: "전신 폭발적인 힘 평가",
      excellent: 12,
      good: 10,
      average: 8,
      higherBetter: true,

      training: [
        ["메디신볼 체스트패스", "5회 × 5세트", "상체파워"],
        ["오버헤드 던지기", "5회 × 5세트", "전신파워"],
        ["로테이션 던지기", "좌우 5회 × 4세트", "회전파워"],
        ["푸쉬프레스", "5~8회 × 4세트", "전신"],
        ["점프 스쿼트", "6회 × 4세트", "하체파워"],
        ["케틀벨 스윙", "10회 × 4세트", "힙파워"]
      ]
    },


    {
      id: "long_run",
      name: "1000m 달리기",
      icon: "🏃‍♂️",
      category: "지구력",
      unit: "분",
      description: "심폐지구력과 페이스 유지능력 평가",
      excellent: 3.2,
      good: 3.6,
      average: 4.0,
      higherBetter: false,

      training: [
        ["인터벌", "400m × 4~6회", "심폐"],
        ["템포런", "10~20분 지속", "지구력"],
        ["페이스런", "목표 페이스 800~1200m", "페이스"],
        ["짧은 인터벌", "200m × 8회", "스피드지구력"],
        ["이지런", "20~30분", "기초지구력"],
        ["언덕러닝", "30초 × 8회", "심폐+하체"]
      ]
    },


    {
      id: "vertical_jump",
      name: "서전트 점프",
      icon: "⬆️",
      category: "순발력",
      unit: "cm",
      description: "수직 점프 폭발력 평가",
      excellent: 70,
      good: 60,
      average: 50,
      higherBetter: true,

      training: [
        ["카운터무브먼트 점프", "5회 × 5세트", "수직파워"],
        ["박스점프", "5회 × 4세트", "폭발력"],
        ["스쿼트", "5~8회 × 4세트", "근력"],
        ["점프 런지", "좌우 6회 × 3세트", "하체"],
        ["포고 점프", "15회 × 4세트", "탄성"],
        ["카프레이즈", "15회 × 4세트", "발목파워"]
      ]
    },


    {
      id: "burpee",
      name: "버피 테스트",
      icon: "🔥",
      category: "전신체력",
      unit: "회",
      description: "전신 근지구력과 심폐능력 평가",
      excellent: 20,
      good: 16,
      average: 12,
      higherBetter: true,

      training: [
        ["버피", "30초 × 5세트", "전신"],
        ["마운틴클라이머", "30초 × 5세트", "심폐"],
        ["스쿼트 스러스터", "10회 × 4세트", "전신"],
        ["점핑잭", "40초 × 4세트", "심폐"],
        ["케틀벨 스윙", "15회 × 4세트", "파워"],
        ["타바타", "20초 운동/10초 휴식 × 8", "전신지구력"]
      ]
    }

  ];


  /* =======================================================
     DOM
  ======================================================= */

  let selectedEventId = null;


  function $(id) {
    return document.getElementById(id);
  }


  function getAthletes() {
    return loadJSON(ATHLETE_KEY, []);
  }


  function getRecords() {
    return loadJSON(RECORD_KEY, []);
  }


  /* =======================================================
     이벤트 카드 생성
  ======================================================= */

  function renderEventCards() {

    const container = $("eventList");

    if (!container) return;

    container.innerHTML = "";

    EVENTS.forEach(event => {

      const button = document.createElement("button");

      button.type = "button";

      button.className = "event-card";

      button.dataset.eventId = event.id;

      button.innerHTML = `
        <div class="event-icon">
          ${event.icon}
        </div>

        <div class="event-info">
          <span>${event.category}</span>

          <strong>${event.name}</strong>

          <small>
            ${event.description}
          </small>
        </div>

        <div class="event-unit">
          ${event.unit}
        </div>
      `;

      button.addEventListener("click", () => {
        selectEvent(event.id);
      });

      container.appendChild(button);

    });

  }


  /* =======================================================
     선수 SELECT
  ======================================================= */

  function renderAthleteSelects() {

    const athletes = getAthletes();

    const selects =
      document.querySelectorAll("[data-athlete-select]");

    selects.forEach(select => {

      const previous = select.value;

      select.innerHTML = "";

      const defaultOption =
        document.createElement("option");

      defaultOption.value = "";

      defaultOption.textContent =
        "선수 선택";

      select.appendChild(defaultOption);


      athletes.forEach(athlete => {

        const option =
          document.createElement("option");

        option.value = athlete.id;

        option.textContent =
          athlete.name;

        select.appendChild(option);

      });


      if (
        previous &&
        athletes.some(
          athlete => String(athlete.id) === String(previous)
        )
      ) {
        select.value = previous;
      }

    });

  }


  /* =======================================================
     종목 선택
  ======================================================= */

  function selectEvent(eventId) {

    const event =
      EVENTS.find(item => item.id === eventId);

    if (!event) return;

    selectedEventId = eventId;


    document
      .querySelectorAll(".event-card")
      .forEach(card => {

        card.classList.toggle(
          "selected",
          card.dataset.eventId === eventId
        );

      });


    if ($("selectedEventIcon")) {
      $("selectedEventIcon").textContent =
        event.icon;
    }

    if ($("selectedEventName")) {
      $("selectedEventName").textContent =
        event.name;
    }

    if ($("selectedEventDescription")) {
      $("selectedEventDescription").textContent =
        event.description;
    }

    if ($("selectedEventUnit")) {
      $("selectedEventUnit").textContent =
        event.unit;
    }


    if ($("eventExcellent")) {
      $("eventExcellent").textContent =
        formatValue(event.excellent, event.unit);
    }

    if ($("eventGood")) {
      $("eventGood").textContent =
        formatValue(event.good, event.unit);
    }

    if ($("eventAverage")) {
      $("eventAverage").textContent =
        formatValue(event.average, event.unit);
    }


    if ($("eventValueInput")) {
      $("eventValueInput").value = "";
      $("eventValueInput").focus();
    }


    resetEventResult();

    renderRecommendations(event);

  }


  /* =======================================================
     기록 포맷
  ======================================================= */

  function formatValue(value, unit) {

    if (typeof value !== "number") {
      return "-";
    }

    return `${value}${unit}`;

  }


  /* =======================================================
     점수 계산
  ======================================================= */

  function calculateScore(event, value) {

    const excellent = event.excellent;
    const average = event.average;

    if (event.higherBetter) {

      if (value >= excellent) {
        return 100;
      }

      if (value <= average) {
        return Math.max(
          0,
          Math.round(
            (value / average) * 60
          )
        );
      }

      const score =
        60 +
        (
          (value - average) /
          (excellent - average)
        ) * 40;

      return Math.max(
        0,
        Math.min(
          100,
          Math.round(score)
        )
      );

    }


    /* 낮을수록 좋은 종목 */

    if (value <= excellent) {
      return 100;
    }

    if (value >= average) {

      const ratio =
        excellent /
        Math.max(value, 0.01);

      return Math.max(
        0,
        Math.min(
          59,
          Math.round(ratio * 60)
        )
      );

    }


    const score =
      100 -
      (
        (value - excellent) /
        (average - excellent)
      ) * 40;

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );

  }


  /* =======================================================
     등급
  ======================================================= */

  function getGrade(score) {

    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "C+";
    if (score >= 60) return "C";
    if (score >= 50) return "D";

    return "E";

  }


  /* =======================================================
     기록 분석
  ======================================================= */

  function analyzeEvent() {

    if (!selectedEventId) {

      showToast(
        "먼저 체대입시 종목을 선택하세요."
      );

      return;

    }


    const event =
      EVENTS.find(
        item => item.id === selectedEventId
      );

    const valueInput =
      $("eventValueInput");

    const value =
      Number(valueInput?.value);


    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {

      showToast(
        "측정 기록을 입력하세요."
      );

      valueInput?.focus();

      return;

    }


    const athleteSelect =
      $("athleteSelect");

    const athleteId =
      athleteSelect?.value || "";


    const score =
      calculateScore(event, value);

    const grade =
      getGrade(score);


    if ($("eventScore")) {
      $("eventScore").textContent =
        `${score}/100`;
    }

    if ($("eventGrade")) {
      $("eventGrade").textContent =
        grade;
    }

    if ($("eventValue")) {
      $("eventValue").textContent =
        formatValue(value, event.unit);
    }

    if ($("eventScoreBar")) {
      $("eventScoreBar").style.width =
        `${score}%`;
    }


    const record = {

      id:
        Date.now(),

      athleteId,

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
      getRecords();

    records.unshift(record);

    saveJSON(
      RECORD_KEY,
      records.slice(0, 500)
    );


    renderRecommendations(event);

    updateDashboardStats();

    renderRecentRecords();

    renderRecords();


    showToast(
      `${event.name} 분석 완료 · ${score}점 ${grade}`
    );


    /* app.js에 이벤트 전달 */

    document.dispatchEvent(
      new CustomEvent(
        "eventAnalysisComplete",
        {
          detail: record
        }
      )
    );

  }


  /* =======================================================
     추천훈련
  ======================================================= */

  function renderRecommendations(event) {

    const containers = [

      $("eventRecommendations"),

      $("recommendedTraining"),

      $("trainingRecommendations")

    ].filter(Boolean);


    containers.forEach(container => {

      container.innerHTML = "";


      event.training.forEach(
        (training, index) => {

          const [name, description, tag] =
            training;

          const card =
            document.createElement("div");

          card.className =
            "training-card";

          card.innerHTML = `

            <span class="training-tag">
              ${tag}
            </span>

            <strong>
              ${name}
            </strong>

            <small>
              ${description}
            </small>

            <div class="training-meta">
              <span>
                ${event.category}
              </span>

              <span>
                ${index + 1}단계
              </span>
            </div>

          `;

          if (
            container.id ===
            "eventRecommendations"
          ) {

            card.classList.remove(
              "training-card"
            );

            card.classList.add(
              "recommendation-item"
            );

            card.innerHTML = `

              <div class="recommendation-type">
                ${index + 1}
              </div>

              <div>
                <strong>${name}</strong>

                <p>
                  ${description}
                </p>
              </div>

            `;

          }


          container.appendChild(card);

        }
      );

    });

  }


  /* =======================================================
     결과 초기화
  ======================================================= */

  function resetEventResult() {

    if ($("eventScore")) {
      $("eventScore").textContent =
        "0/100";
    }

    if ($("eventGrade")) {
      $("eventGrade").textContent =
        "-";
    }

    if ($("eventValue")) {
      $("eventValue").textContent =
        "-";
    }

    if ($("eventScoreBar")) {
      $("eventScoreBar").style.width =
        "0%";
    }

  }


  /* =======================================================
     선수 추가 이벤트
  ======================================================= */

  function setupAthleteForm() {

    const button =
      $("addAthleteButton");

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        const name =
          $("athleteNameInput")?.value.trim();

        const grade =
          $("athleteGradeInput")?.value.trim();

        const university =
          $("athleteUniversityInput")?.value.trim();

        const major =
          $("athleteMajorInput")?.value.trim();


        if (!name) {

          showToast(
            "선수 이름을 입력하세요."
          );

          return;

        }


        const athletes =
          getAthletes();


        const athlete = {

          id:
            `athlete_${Date.now()}`,

          name,

          grade,

          university,

          major,

          createdAt:
            new Date().toISOString()

        };


        athletes.push(athlete);

        saveJSON(
          ATHLETE_KEY,
          athletes
        );


        [
          "athleteNameInput",
          "athleteGradeInput",
          "athleteUniversityInput",
          "athleteMajorInput"

        ].forEach(id => {

          if ($(id)) {
            $(id).value = "";
          }

        });


        renderAthletes();

        renderAthleteSelects();

        updateDashboardStats();


        showToast(
          `${name} 선수가 등록되었습니다.`
        );

      }
    );

  }


  /* =======================================================
     선수 목록
  ======================================================= */

  function renderAthletes() {

    const container =
      $("athleteList");

    if (!container) return;


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


    container.innerHTML = "";


    athletes.forEach(
      athlete => {

        const item =
          document.createElement("div");

        item.className =
          "athlete-item";


        item.innerHTML = `

          <div>

            <strong>
              ${escapeHTML(athlete.name)}
            </strong>

            <span class="muted">
              ${escapeHTML(athlete.grade || "학년 미입력")}
            </span>

            <span class="muted">
              ${escapeHTML(athlete.university || "목표 대학 미설정")}
            </span>

            <span class="muted">
              ${escapeHTML(athlete.major || "")}
            </span>

          </div>

          <button
            class="secondary-button delete-athlete"
            data-id="${athlete.id}"
          >
            삭제
          </button>

        `;


        const deleteButton =
          item.querySelector(
            ".delete-athlete"
          );


        deleteButton.addEventListener(
          "click",
          () => {

            if (
              !confirm(
                `${athlete.name} 선수를 삭제할까요?`
              )
            ) {
              return;
            }


            const filtered =
              getAthletes()
                .filter(
                  item =>
                    String(item.id) !==
                    String(athlete.id)
                );


            saveJSON(
              ATHLETE_KEY,
              filtered
            );


            renderAthletes();

            renderAthleteSelects();

            updateDashboardStats();


            showToast(
              "선수 정보가 삭제되었습니다."
            );

          }
        );


        container.appendChild(item);

      }
    );

  }


  /* =======================================================
     최근 기록
  ======================================================= */

  function renderRecentRecords() {

    const container =
      $("recentAnalysisList");

    if (!container) return;


    const records =
      getRecords().slice(0, 5);


    if (!records.length) {

      container.innerHTML = `
        <div class="empty-state">
          아직 분석 기록이 없습니다.
        </div>
      `;

      return;

    }


    container.innerHTML =
      records.map(record => `

        <div class="record-item">

          <div>

            <strong>
              ${record.icon || "🎯"}
              ${escapeHTML(record.eventName)}
            </strong>

            <span>
              ${escapeHTML(
                getAthleteName(record.athleteId)
              )}
            </span>

            <small>
              ${formatDate(record.createdAt)}
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

      `).join("");

  }


  /* =======================================================
     전체 기록
  ======================================================= */

  function renderRecords() {

    const container =
      $("recordList");

    if (!container) return;


    const records =
      getRecords();


    if (!records.length) {

      container.innerHTML = `
        <div class="empty-state">
          아직 저장된 분석 기록이 없습니다.
        </div>
      `;

      return;

    }


    container.innerHTML =
      records.map(record => `

        <div class="record-item">

          <div>

            <strong>
              ${record.icon || "🎯"}
              ${escapeHTML(record.eventName)}
            </strong>

            <span>
              ${escapeHTML(
                getAthleteName(record.athleteId)
              )}
            </span>

            <small>
              ${formatDate(record.createdAt)}
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

      `).join("");

  }


  /* =======================================================
     선수 이름
  ======================================================= */

  function getAthleteName(id) {

    if (!id) {
      return "선수 미지정";
    }


    const athlete =
      getAthletes().find(
        item =>
          String(item.id) ===
          String(id)
      );


    return athlete
      ? athlete.name
      : "삭제된 선수";

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  function updateDashboardStats() {

    const athletes =
      getAthletes();

    const records =
      getRecords();


    if ($("athleteCount")) {
      $("athleteCount").textContent =
        athletes.length;
    }


    if ($("recordCount")) {
      $("recordCount").textContent =
        records.length;
    }


    const average =
      records.length
        ? Math.round(
            records.reduce(
              (sum, item) =>
                sum + Number(item.score || 0),
              0
            ) / records.length
          )
        : 0;


    if ($("averageScore")) {
      $("averageScore").textContent =
        average;
    }


    const goal =
      loadJSON(
        GOAL_KEY,
        {}
      );


    if ($("targetUniversity")) {

      $("targetUniversity").textContent =
        goal.university ||
        "-";

    }

  }


  /* =======================================================
     대학 목표 저장
  ======================================================= */

  function setupCollegeGoal() {

    const button =
      $("saveCollegeGoal");

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        const goal = {

          university:
            $("collegeUniversity")?.value.trim() || "",

          major:
            $("collegeMajor")?.value.trim() || "",

          admission:
            $("collegeAdmission")?.value.trim() || "",

          targetGrade:
            $("collegeTargetGrade")?.value.trim() || "",

          updatedAt:
            new Date().toISOString()

        };


        saveJSON(
          GOAL_KEY,
          goal
        );


        updateDashboardStats();


        showToast(
          "목표 대학이 저장되었습니다."
        );

      }
    );


    const goal =
      loadJSON(
        GOAL_KEY,
        {}
      );


    if ($("collegeUniversity")) {
      $("collegeUniversity").value =
        goal.university || "";
    }

    if ($("collegeMajor")) {
      $("collegeMajor").value =
        goal.major || "";
    }

    if ($("collegeAdmission")) {
      $("collegeAdmission").value =
        goal.admission || "";
    }

    if ($("collegeTargetGrade")) {
      $("collegeTargetGrade").value =
        goal.targetGrade || "";
    }

  }


  /* =======================================================
     종목 찾기 API
  ======================================================= */

  window.SeolcheonEvents = {

    getAll: () =>
      EVENTS.slice(),

    getById: id =>
      EVENTS.find(
        event =>
          event.id === id
      ),

    select: selectEvent,

    calculateScore,

    getGrade,

    getRecords,

    getAthletes,

    getAthleteName

  };


  /* =======================================================
     UTILITY
  ======================================================= */

  function escapeHTML(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function formatDate(dateString) {

    if (!dateString) {
      return "-";
    }


    const date =
      new Date(dateString);


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


  function showToast(message) {

    const toast =
      $("toast");

    if (!toast) return;


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
        2300
      );

  }


  /* =======================================================
     INIT
  ======================================================= */

  function init() {

    renderEventCards();

    renderAthletes();

    renderAthleteSelects();

    renderRecentRecords();

    renderRecords();

    updateDashboardStats();

    setupAthleteForm();

    setupCollegeGoal();


    const submit =
      $("submitEventMeasurement");


    if (submit) {

      submit.addEventListener(
        "click",
        analyzeEvent
      );

    }


    /* Enter 키로 기록 분석 */

    const valueInput =
      $("eventValueInput");


    if (valueInput) {

      valueInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter"
          ) {

            analyzeEvent();

          }

        }
      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();