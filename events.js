/* =========================================================
   설천고 체대입시 분석센터 PRO
   ② events.js
   체대입시 실기 종목 / 점수 / 대학 / 추천훈련 데이터
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     1. 체대입시 실기 종목
     ======================================================= */

  const ADMISSION_EVENTS = [

    {
      id: "10m",
      name: "10m 달리기",
      icon: "⚡",
      category: "스피드",
      unit: "초",
      lowerBetter: true,

      description:
        "짧은 거리의 초기 가속 능력을 평가합니다.",

      target: {
        elite: 1.70,
        excellent: 1.80,
        good: 1.90,
        average: 2.05
      },

      training: [
        {
          name: "10m 스타트 대시",
          purpose: "초기 가속력",
          sets: "6세트",
          reps: "10m × 1회",
          rest: "60~90초",
          level: "중급"
        },
        {
          name: "저항 스프린트",
          purpose: "폭발적 추진력",
          sets: "5세트",
          reps: "10m × 1회",
          rest: "90초",
          level: "중상급"
        },
        {
          name: "벽 밀기 스타트",
          purpose: "첫 3스텝 개선",
          sets: "4세트",
          reps: "5회",
          rest: "60초",
          level: "초급"
        },
        {
          name: "스프린트 드릴",
          purpose: "러닝 기술",
          sets: "4세트",
          reps: "15초",
          rest: "45초",
          level: "초급"
        }
      ]
    },


    {
      id: "20m",
      name: "20m 달리기",
      icon: "🏃",
      category: "스피드",
      unit: "초",
      lowerBetter: true,

      description:
        "가속 이후의 단거리 스피드 능력을 평가합니다.",

      target: {
        elite: 2.90,
        excellent: 3.05,
        good: 3.20,
        average: 3.40
      },

      training: [
        {
          name: "20m 전력질주",
          purpose: "최대 스피드",
          sets: "6세트",
          reps: "20m × 1회",
          rest: "90초",
          level: "중급"
        },
        {
          name: "플라잉 20m",
          purpose: "최고속도 향상",
          sets: "5세트",
          reps: "20m × 1회",
          rest: "2분",
          level: "상급"
        },
        {
          name: "A-스킵",
          purpose: "러닝 자세",
          sets: "4세트",
          reps: "20m",
          rest: "45초",
          level: "초급"
        }
      ]
    },


    {
      id: "30m",
      name: "30m 달리기",
      icon: "🏃‍♂️",
      category: "스피드",
      unit: "초",
      lowerBetter: true,

      description:
        "가속과 최고속도 능력을 함께 평가합니다.",

      target: {
        elite: 4.00,
        excellent: 4.20,
        good: 4.40,
        average: 4.70
      },

      training: [
        {
          name: "30m 전력질주",
          purpose: "가속 및 최고속도",
          sets: "5세트",
          reps: "30m × 1회",
          rest: "2~3분",
          level: "중급"
        },
        {
          name: "언덕 스프린트",
          purpose: "추진력",
          sets: "6세트",
          reps: "15~20m",
          rest: "90초",
          level: "중상급"
        },
        {
          name: "스프린트 스타트",
          purpose: "초기 가속",
          sets: "5세트",
          reps: "10m",
          rest: "60초",
          level: "초급"
        }
      ]
    },


    {
      id: "shuttle",
      name: "왕복달리기",
      icon: "🔄",
      category: "민첩성",
      unit: "회",
      lowerBetter: false,

      description:
        "가속·감속·방향전환 능력을 평가합니다.",

      target: {
        elite: 60,
        excellent: 55,
        good: 50,
        average: 45
      },

      training: [
        {
          name: "5-10-5 셔틀",
          purpose: "방향전환",
          sets: "5세트",
          reps: "1회",
          rest: "90초",
          level: "중급"
        },
        {
          name: "사이드 셔플",
          purpose: "측면 민첩성",
          sets: "4세트",
          reps: "20초",
          rest: "60초",
          level: "초급"
        },
        {
          name: "감속 드릴",
          purpose: "브레이킹 능력",
          sets: "5세트",
          reps: "3회",
          rest: "60초",
          level: "중급"
        }
      ]
    },


    {
      id: "standing_jump",
      name: "제자리멀리뛰기",
      icon: "💥",
      category: "순발력",
      unit: "cm",
      lowerBetter: false,

      description:
        "하체의 폭발적인 수평 추진력을 평가합니다.",

      target: {
        elite: 280,
        excellent: 265,
        good: 245,
        average: 220
      },

      training: [
        {
          name: "브로드 점프",
          purpose: "수평 폭발력",
          sets: "5세트",
          reps: "5회",
          rest: "90초",
          level: "중급"
        },
        {
          name: "스쿼트 점프",
          purpose: "하체 파워",
          sets: "4세트",
          reps: "6회",
          rest: "90초",
          level: "중급"
        },
        {
          name: "싱글 레그 바운드",
          purpose: "추진력 및 균형",
          sets: "3세트",
          reps: "10m",
          rest: "90초",
          level: "상급"
        },
        {
          name: "착지 안정화",
          purpose: "착지 기술",
          sets: "4세트",
          reps: "5회",
          rest: "60초",
          level: "초급"
        }
      ]
    },


    {
      id: "vertical_jump",
      name: "서전트 점프",
      icon: "⬆️",
      category: "순발력",
      unit: "cm",
      lowerBetter: false,

      description:
        "수직 방향의 하체 폭발력을 평가합니다.",

      target: {
        elite: 75,
        excellent: 70,
        good: 63,
        average: 55
      },

      training: [
        {
          name: "카운터무브먼트 점프",
          purpose: "수직 점프력",
          sets: "5세트",
          reps: "5회",
          rest: "90초",
          level: "중급"
        },
        {
          name: "박스 점프",
          purpose: "폭발력",
          sets: "4세트",
          reps: "5회",
          rest: "90초",
          level: "중급"
        },
        {
          name: "점프 스쿼트",
          purpose: "하체 파워",
          sets: "4세트",
          reps: "6회",
          rest: "90초",
          level: "중급"
        }
      ]
    },


    {
      id: "situp",
      name: "윗몸일으키기",
      icon: "🔥",
      category: "근지구력",
      unit: "회",
      lowerBetter: false,

      description:
        "복부 및 몸통 근지구력을 평가합니다.",

      target: {
        elite: 65,
        excellent: 58,
        good: 52,
        average: 45
      },

      training: [
        {
          name: "윗몸일으키기 인터벌",
          purpose: "실기 특이적 근지구력",
          sets: "5세트",
          reps: "30초",
          rest: "60초",
          level: "중급"
        },
        {
          name: "크런치",
          purpose: "복근 지구력",
          sets: "4세트",
          reps: "20회",
          rest: "45초",
          level: "초급"
        },
        {
          name: "플랭크",
          purpose: "코어 안정성",
          sets: "4세트",
          reps: "40~60초",
          rest: "45초",
          level: "초급"
        },
        {
          name: "데드버그",
          purpose: "몸통 제어",
          sets: "3세트",
          reps: "10회",
          rest: "45초",
          level: "초급"
        }
      ]
    },


    {
      id: "pushup",
      name: "팔굽혀펴기",
      icon: "💪",
      category: "근지구력",
      unit: "회",
      lowerBetter: false,

      description:
        "상체의 근지구력과 몸통 안정성을 평가합니다.",

      target: {
        elite: 65,
        excellent: 58,
        good: 50,
        average: 40
      },

      training: [
        {
          name: "팔굽혀펴기 인터벌",
          purpose: "상체 근지구력",
          sets: "5세트",
          reps: "최대반복의 60~70%",
          rest: "60초",
          level: "중급"
        },
        {
          name: "템포 푸시업",
          purpose: "자세 안정성",
          sets: "4세트",
          reps: "8~12회",
          rest: "60초",
          level: "중급"
        },
        {
          name: "플랭크 푸시업",
          purpose: "코어 연계",
          sets: "3세트",
          reps: "8회",
          rest: "60초",
          level: "중급"
        }
      ]
    },


    {
      id: "sit_reach",
      name: "좌전굴",
      icon: "🧘",
      category: "유연성",
      unit: "cm",
      lowerBetter: false,

      description:
        "하지 후면 및 허리의 유연성을 평가합니다.",

      target: {
        elite: 30,
        excellent: 25,
        good: 20,
        average: 15
      },

      training: [
        {
          name: "햄스트링 스트레칭",
          purpose: "하지 후면 유연성",
          sets: "3세트",
          reps: "30초",
          rest: "20초",
          level: "초급"
        },
        {
          name: "90/90 힙 스트레칭",
          purpose: "고관절 가동성",
          sets: "3세트",
          reps: "30초",
          rest: "20초",
          level: "초급"
        },
        {
          name: "동적 레그스윙",
          purpose: "동적 유연성",
          sets: "3세트",
          reps: "각 15회",
          rest: "30초",
          level: "초급"
        }
      ]
    },


    {
      id: "beep",
      name: "왕복오래달리기",
      icon: "❤️",
      category: "지구력",
      unit: "단계",
      lowerBetter: false,

      description:
        "심폐지구력과 반복 달리기 능력을 평가합니다.",

      target: {
        elite: 13,
        excellent: 12,
        good: 11,
        average: 9
      },

      training: [
        {
          name: "인터벌 러닝",
          purpose: "심폐지구력",
          sets: "6세트",
          reps: "1분 달리기",
          rest: "1분",
          level: "중급"
        },
        {
          name: "템포런",
          purpose: "유산소 능력",
          sets: "1세트",
          reps: "15~20분",
          rest: "회복",
          level: "중급"
        },
        {
          name: "셔틀런 인터벌",
          purpose: "실기 특이적 지구력",
          sets: "6세트",
          reps: "30초",
          rest: "30초",
          level: "중급"
        }
      ]
    }

  ];


  /* =======================================================
     2. 대학 데이터
     ======================================================= */

  const COLLEGES = [

    {
      id: "college_01",
      name: "체육계열 대학 A",
      type: "4년제",
      department: "체육학과",
      admission: "실기 중심",
      events: [
        "10m",
        "20m",
        "standing_jump",
        "situp"
      ]
    },

    {
      id: "college_02",
      name: "체육계열 대학 B",
      type: "4년제",
      department: "스포츠과학과",
      admission: "실기 중심",
      events: [
        "20m",
        "vertical_jump",
        "sit_reach",
        "beep"
      ]
    },

    {
      id: "college_03",
      name: "체육계열 대학 C",
      type: "4년제",
      department: "스포츠지도학과",
      admission: "학생부+실기",
      events: [
        "shuttle",
        "standing_jump",
        "situp",
        "pushup"
      ]
    }

  ];


  /* =======================================================
     3. 이벤트 찾기
     ======================================================= */

  function getEvent(id) {

    return ADMISSION_EVENTS.find(
      event =>
        event.id === id
    );

  }


  function getEventByName(name) {

    return ADMISSION_EVENTS.find(
      event =>
        event.name === name
    );

  }


  /* =======================================================
     4. 점수 계산
     ======================================================= */

  function calculateScore(
    eventId,
    value
  ) {

    const event =
      getEvent(eventId);

    if (!event) {
      return 0;
    }

    const result =
      Number(value);

    if (
      !Number.isFinite(result)
    ) {
      return 0;
    }

    const target =
      event.target;


    if (
      event.lowerBetter
    ) {

      if (
        result <= target.elite
      ) {
        return 100;
      }

      if (
        result <= target.excellent
      ) {
        return interpolate(
          result,
          target.elite,
          target.excellent,
          95,
          100
        );
      }

      if (
        result <= target.good
      ) {
        return interpolate(
          result,
          target.excellent,
          target.good,
          85,
          95
        );
      }

      if (
        result <= target.average
      ) {
        return interpolate(
          result,
          target.good,
          target.average,
          70,
          85
        );
      }

      return Math.max(
        0,
        interpolate(
          result,
          target.average,
          target.average * 1.35,
          70,
          0
        )
      );

    }


    if (
      result >= target.elite
    ) {
      return 100;
    }

    if (
      result >= target.excellent
    ) {
      return interpolate(
        result,
        target.excellent,
        target.elite,
        95,
        100
      );
    }

    if (
      result >= target.good
    ) {
      return interpolate(
        result,
        target.good,
        target.excellent,
        85,
        95
      );
    }

    if (
      result >= target.average
    ) {
      return interpolate(
        result,
        target.average,
        target.good,
        70,
        85
      );
    }

    return Math.max(
      0,
      interpolate(
        result,
        0,
        target.average,
        0,
        70
      )
    );

  }


  function interpolate(
    value,
    min,
    max,
    scoreMin,
    scoreMax
  ) {

    if (
      max === min
    ) {
      return scoreMax;
    }

    const ratio =
      (
        value - min
      ) /
      (
        max - min
      );

    return Math.round(
      scoreMin +
      ratio *
      (
        scoreMax -
        scoreMin
      )
    );

  }


  /* =======================================================
     5. 등급
     ======================================================= */

  function getGrade(score) {

    const value =
      Number(score) || 0;

    if (value >= 95) {
      return {
        grade: "S",
        text: "최상위",
        className: "grade-s"
      };
    }

    if (value >= 90) {
      return {
        grade: "A+",
        text: "매우 우수",
        className: "grade-aplus"
      };
    }

    if (value >= 85) {
      return {
        grade: "A",
        text: "우수",
        className: "grade-a"
      };
    }

    if (value >= 80) {
      return {
        grade: "B+",
        text: "양호",
        className: "grade-bplus"
      };
    }

    if (value >= 70) {
      return {
        grade: "B",
        text: "보통",
        className: "grade-b"
      };
    }

    if (value >= 60) {
      return {
        grade: "C",
        text: "개선 필요",
        className: "grade-c"
      };
    }

    return {
      grade: "D",
      text: "집중 개선",
      className: "grade-d"
    };

  }


  /* =======================================================
     6. 기록 생성
     ======================================================= */

  function createRecord(
    eventId,
    value,
    athleteId = ""
  ) {

    const event =
      getEvent(eventId);

    if (!event) {
      return null;
    }

    const score =
      calculateScore(
        eventId,
        value
      );

    const grade =
      getGrade(score);

    return {

      id:
        `REC_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      athleteId,

      eventId,

      eventName:
        event.name,

      icon:
        event.icon,

      value:
        Number(value),

      unit:
        event.unit,

      score,

      grade:
        grade.grade,

      gradeText:
        grade.text,

      createdAt:
        new Date()
          .toISOString()

    };

  }


  /* =======================================================
     7. 이벤트 카드 렌더링
     ======================================================= */

  function renderEventList() {

    const container =
      document.getElementById(
        "eventList"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      ADMISSION_EVENTS
        .map(
          event => `

            <button
              class="event-card"
              data-event-id="${event.id}"
            >

              <div class="event-icon">
                ${event.icon}
              </div>

              <div class="event-info">

                <strong>
                  ${escapeHTML(
                    event.name
                  )}
                </strong>

                <span>
                  ${escapeHTML(
                    event.category
                  )}
                </span>

                <small>
                  ${escapeHTML(
                    event.description
                  )}
                </small>

              </div>

              <div class="event-unit">
                ${escapeHTML(
                  event.unit
                )}
              </div>

            </button>

          `
        )
        .join("");


    container
      .querySelectorAll(
        "[data-event-id]"
      )
      .forEach(
        card => {

          card.addEventListener(
            "click",
            () => {

              selectEvent(
                card.dataset.eventId
              );

            }
          );

        }
      );

  }


  /* =======================================================
     8. 종목 선택
     ======================================================= */

  function selectEvent(
    eventId
  ) {

    const event =
      getEvent(eventId);

    if (!event) {
      return;
    }

    window.SC_SELECTED_EVENT =
      event;


    setText(
      "selectedEventName",
      event.name
    );

    setText(
      "selectedEventDescription",
      event.description
    );

    setText(
      "selectedEventUnit",
      event.unit
    );

    setText(
      "eventExcellent",
      `${event.target.excellent}${event.unit}`
    );

    setText(
      "eventGood",
      `${event.target.good}${event.unit}`
    );

    setText(
      "eventAverage",
      `${event.target.average}${event.unit}`
    );


    const icon =
      document.getElementById(
        "selectedEventIcon"
      );

    if (icon) {
      icon.textContent =
        event.icon;
    }


    const panel =
      document.getElementById(
        "eventMeasurementPanel"
      );

    if (panel) {

      panel.classList.add(
        "active"
      );

      panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }


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

  }


  /* =======================================================
     9. 측정값 저장
     ======================================================= */

  function submitMeasurement() {

    const event =
      window.SC_SELECTED_EVENT;

    if (!event) {

      showToast(
        "먼저 실기 종목을 선택하세요."
      );

      return;

    }


    const input =
      document.getElementById(
        "eventValueInput"
      );

    if (!input) {
      return;
    }


    const value =
      Number(input.value);


    if (
      !Number.isFinite(value)
    ) {

      showToast(
        "측정 기록을 입력하세요."
      );

      return;

    }


    const athlete =
      document.getElementById(
        "athleteSelect"
      );


    const athleteId =
      athlete?.value || "";


    const record =
      createRecord(
        event.id,
        value,
        athleteId
      );


    if (!record) {
      return;
    }


    saveRecord(
      record
    );


    renderResult(
      record
    );


    renderRecommendations(
      event,
      record.score
    );


    input.value =
      "";


    showToast(
      `${event.name} 기록이 저장되었습니다.`
    );

  }


  /* =======================================================
     10. 결과 렌더링
     ======================================================= */

  function renderResult(
    record
  ) {

    setText(
      "eventScore",
      `${record.score}/100`
    );

    setText(
      "eventGrade",
      record.grade
    );

    setText(
      "eventValue",
      `${record.value}${record.unit}`
    );


    const bar =
      document.getElementById(
        "eventScoreBar"
      );

    if (bar) {

      bar.style.width =
        `${record.score}%`;

    }

  }


  /* =======================================================
     11. 추천훈련
     ======================================================= */

  function renderRecommendations(
    event,
    score
  ) {

    const container =
      document.getElementById(
        "eventRecommendations"
      );

    if (!container) {
      return;
    }


    let list =
      event.training || [];


    if (
      score >= 90
    ) {

      list =
        list.slice(0, 3);

    }


    container.innerHTML =
      list
        .map(
          training => `

            <div
              class="recommendation-item"
            >

              <div
                class="recommendation-type"
              >
                +
              </div>

              <div>

                <strong>
                  ${escapeHTML(
                    training.name
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    training.purpose
                  )}
                  ·
                  ${escapeHTML(
                    training.sets
                  )}
                  ·
                  ${escapeHTML(
                    training.reps
                  )}
                  ·
                  휴식
                  ${escapeHTML(
                    training.rest
                  )}
                </p>

              </div>

            </div>

          `
        )
        .join("");

  }


  /* =======================================================
     12. 대학 데이터
     ======================================================= */

  function getCollege(
    id
  ) {

    return COLLEGES.find(
      college =>
        college.id === id
    );

  }


  function getCollegesForEvent(
    eventId
  ) {

    return COLLEGES.filter(
      college =>
        college.events
          .includes(eventId)
    );

  }


  /* =======================================================
     13. 목표 기록
     ======================================================= */

  function getTargetDifference(
    eventId,
    currentValue
  ) {

    const event =
      getEvent(eventId);

    if (!event) {
      return null;
    }


    const target =
      event.target.excellent;


    const current =
      Number(currentValue);


    if (
      !Number.isFinite(current)
    ) {
      return null;
    }


    const difference =
      event.lowerBetter
        ? current - target
        : target - current;


    return {

      target,

      current,

      difference,

      achieved:
        difference <= 0

    };

  }


  /* =======================================================
     14. 종목별 자동 피드백
     ======================================================= */

  function getFeedback(
    eventId,
    score
  ) {

    const event =
      getEvent(eventId);

    if (!event) {
      return [];
    }


    if (score >= 95) {

      return [

        {
          title: "최상위 수행 수준",
          text:
            "현재 기록이 매우 우수합니다. 기록 자체보다 재현성과 기술 안정성을 유지하는 훈련을 우선하세요."
        },

        {
          title: "상위 기록 도전",
          text:
            "훈련량을 무작정 늘리기보다 세부 기술과 폭발적인 수행 품질을 높이는 방향이 좋습니다."
        }

      ];

    }


    if (score >= 85) {

      return [

        {
          title: "상위권 진입 단계",
          text:
            "기본 능력은 충분합니다. 기록을 크게 흔드는 약점 한두 가지를 찾아 집중적으로 개선하세요."
        }

      ];

    }


    if (score >= 70) {

      return [

        {
          title: "기초 능력 보완",
          text:
            "기본 체력은 형성되어 있습니다. 실기 특이적 반복훈련과 기술 연습을 함께 진행하세요."
        },

        {
          title: "반복 측정 권장",
          text:
            "동일한 조건에서 주기적으로 측정하여 실제 향상 추이를 확인하세요."
        }

      ];

    }


    return [

      {
        title: "우선 개선 종목",
        text:
          "현재는 기록 향상보다 기초 체력과 동작 패턴을 안정화하는 것이 우선입니다."
      },

      {
        title: "단계적 훈련 권장",
        text:
          "낮은 강도에서 정확한 동작을 익힌 뒤 점진적으로 강도를 높이세요."
      }

    ];

  }


  /* =======================================================
     15. 저장
     ======================================================= */

  function saveRecord(
    record
  ) {

    const key =
      "SC_PE_ADMISSION_RECORDS";


    let records =
      getStored(
        key,
        []
      );


    records.unshift(
      record
    );


    records =
      records.slice(
        0,
        500
      );


    localStorage.setItem(
      key,
      JSON.stringify(
        records
      )
    );


    if (
      window.SC_APP &&
      typeof window.SC_APP
        .renderAll ===
      "function"
    ) {

      window.SC_APP
        .renderAll();

    }

  }


  function getRecords() {

    return getStored(
      "SC_PE_ADMISSION_RECORDS",
      []
    );

  }


  /* =======================================================
     16. 유틸
     ======================================================= */

  function getStored(
    key,
    fallback
  ) {

    try {

      const value =
        localStorage.getItem(
          key
        );

      return value
        ? JSON.parse(value)
        : fallback;

    } catch {

      return fallback;

    }

  }


  function setText(
    id,
    value
  ) {

    const element =
      document.getElementById(
        id
      );

    if (element) {
      element.textContent =
        value;
    }

  }


  function escapeHTML(
    value
  ) {

    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }


  function showToast(
    message
  ) {

    const toast =
      document.getElementById(
        "toast"
      );

    if (!toast) {
      return;
    }


    toast.textContent =
      message;

    toast.classList.add(
      "show"
    );


    clearTimeout(
      window.SC_TOAST_TIMER
    );


    window.SC_TOAST_TIMER =
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
     17. GLOBAL
  ======================================================= */

  window.ADMISSION_EVENTS =
    ADMISSION_EVENTS;

  window.COLLEGES =
    COLLEGES;


  window.PE_ADMISSION =
    {

      events:
        ADMISSION_EVENTS,

      colleges:
        COLLEGES,

      getEvent,

      getEventByName,

      calculateScore,

      getGrade,

      createRecord,

      getRecords,

      saveRecord,

      getCollege,

      getCollegesForEvent,

      getTargetDifference,

      getFeedback,

      renderEventList,

      selectEvent,

      submitMeasurement,

      renderRecommendations

    };


  /* =======================================================
     18. INITIALIZE
  ======================================================= */

  function initialize() {

    renderEventList();


    const submit =
      document.getElementById(
        "submitEventMeasurement"
      );


    if (submit) {

      submit.addEventListener(
        "click",
        submitMeasurement
      );

    }


    const input =
      document.getElementById(
        "eventValueInput"
      );


    if (input) {

      input.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            submitMeasurement();

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
      initialize
    );

  } else {

    initialize();

  }

})();