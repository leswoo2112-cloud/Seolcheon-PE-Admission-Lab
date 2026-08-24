/* =========================================================
   설천고 체대입시 분석센터 PRO
   ① app.js
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     GLOBAL STATE
  ======================================================= */

  const STATE_KEY = "SC_PE_FINAL_STATE";

  const state = {
    athletes: [],
    records: [],
    videos: [],
    analysis: {
      running: false,
      poseReady: false,
      lastLandmarks: null,
      frames: [],
      trajectory: [],
      angleHistory: [],
      currentScore: 0,
      stability: 0,
      alignment: 0,
      symmetry: 0,
      efficiency: 0
    },
    target: {
      university: "",
      major: "",
      admission: "",
      grade: ""
    }
  };


  /* =======================================================
     CHARTS
     ======================================================= */

  const charts = {
    performance: null,
    radar: null,
    reportRadar: null,
    angle: null,
    reportAngle: null
  };


  /* =======================================================
     DOM
     ======================================================= */

  const $ = id =>
    document.getElementById(id);


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function init() {

    loadState();

    bindNavigation();

    bindButtons();

    bindAthleteForm();

    bindVideoControls();

    bindReport();

    updateClock();

    setInterval(
      updateClock,
      1000
    );

    renderAll();

    initializeCharts();

    setupVideo();

  }


  /* =======================================================
     LOAD / SAVE
     ======================================================= */

  function loadState() {

    try {

      const saved =
        localStorage.getItem(
          STATE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(
          parsed.athletes
        )
      ) {

        state.athletes =
          parsed.athletes;

      }

      if (
        Array.isArray(
          parsed.records
        )
      ) {

        state.records =
          parsed.records;

      }

      if (
        Array.isArray(
          parsed.videos
        )
      ) {

        state.videos =
          parsed.videos;

      }

      if (
        parsed.target
      ) {

        state.target =
          {
            ...state.target,
            ...parsed.target
          };

      }

    } catch (error) {

      console.warn(
        "STATE LOAD ERROR",
        error
      );

    }

  }


  function saveState() {

    try {

      localStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          athletes:
            state.athletes,

          records:
            state.records,

          videos:
            state.videos,

          target:
            state.target
        })
      );

    } catch (error) {

      console.warn(
        "STATE SAVE ERROR",
        error
      );

    }

  }


  /* =======================================================
     NAVIGATION
     ======================================================= */

  function bindNavigation() {

    document
      .querySelectorAll(
        ".nav-button"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const page =
                button.dataset.page;

              openPage(
                page
              );

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-open-page]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              openPage(
                button.dataset
                  .openPage
              );

            }
          );

        }
      );

  }


  function openPage(
    page
  ) {

    document
      .querySelectorAll(
        ".page"
      )
      .forEach(
        section => {

          section.classList.toggle(
            "active",
            section.id ===
              `page-${page}`
          );

        }
      );


    document
      .querySelectorAll(
        ".nav-button"
      )
      .forEach(
        button => {

          button.classList.toggle(
            "active",
            button.dataset.page ===
              page
          );

        }
      );


    const titles = {

      dashboard:
        "대시보드",

      athletes:
        "선수 관리",

      events:
        "체대입시 실기",

      analysis:
        "영상 자세분석",

      comparison:
        "영상 비교",

      records:
        "분석 기록",

      report:
        "체대입시 분석 리포트"

    };


    if (
      $("pageTitle")
    ) {

      $("pageTitle")
        .textContent =
        titles[page] ||
        "설천고 체대입시 분석센터";

    }


    if (
      page === "dashboard"
    ) {

      updateDashboard();

    }


    if (
      page === "report"
    ) {

      updateReport();

    }


    if (
      page === "records"
    ) {

      renderRecords();

    }


    if (
      page === "comparison"
    ) {

      renderComparison();

    }

  }


  /* =======================================================
     BUTTONS
     ======================================================= */

  function bindButtons() {

    const add =
      $("addAthleteButton");

    if (add) {

      add.addEventListener(
        "click",
        addAthlete
      );

    }


    const upload =
      $("uploadVideoButton");

    const input =
      $("videoInput");

    if (
      upload &&
      input
    ) {

      upload.addEventListener(
        "click",
        () =>
          input.click()
      );

      input.addEventListener(
        "change",
        handleVideoFile
      );

    }


    const start =
      $("startAnalysis");

    if (start) {

      start.addEventListener(
        "click",
        startPoseAnalysis
      );

    }


    const stop =
      $("stopAnalysis");

    if (stop) {

      stop.addEventListener(
        "click",
        stopPoseAnalysis
      );

    }


    const play =
      $("videoPlayPause");

    if (play) {

      play.addEventListener(
        "click",
        toggleVideo
      );

    }


    const slow =
      $("videoSlow");

    if (slow) {

      slow.addEventListener(
        "click",
        () => {

          const video =
            $("analysisVideo");

          if (video) {

            video.playbackRate =
              0.5;

          }

        }
      );

    }


    const normal =
      $("videoNormal");

    if (normal) {

      normal.addEventListener(
        "click",
        () => {

          const video =
            $("analysisVideo");

          if (video) {

            video.playbackRate =
              1;

          }

        }
      );

    }


    const prev =
      $("videoPrevFrame");

    if (prev) {

      prev.addEventListener(
        "click",
        () =>
          moveFrame(-1)
      );

    }


    const next =
      $("videoNextFrame");

    if (next) {

      next.addEventListener(
        "click",
        () =>
          moveFrame(1)
      );

    }


    const collegeSave =
      $("saveCollegeGoal");

    if (collegeSave) {

      collegeSave.addEventListener(
        "click",
        saveCollegeGoal
      );

    }


    const print =
      $("printReportButton");

    if (print) {

      print.addEventListener(
        "click",
        () =>
          window.print()
      );

    }

  }


  /* =======================================================
     ATHLETES
     ======================================================= */

  function bindAthleteForm() {

    const name =
      $("athleteNameInput");

    if (name) {

      name.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            addAthlete();

          }

        }
      );

    }

  }


  function addAthlete() {

    const name =
      $("athleteNameInput")
        ?.value
        .trim();

    if (!name) {

      showToast(
        "선수명을 입력하세요."
      );

      return;

    }


    const grade =
      $("athleteGradeInput")
        ?.value ||
      "";


    const university =
      $("athleteUniversityInput")
        ?.value
        .trim() ||
      "";


    const major =
      $("athleteMajorInput")
        ?.value
        .trim() ||
      "";


    const athlete = {

      id:
        `ATH_${Date.now()}`,

      name,

      grade,

      university,

      major,

      createdAt:
        new Date()
          .toISOString()

    };


    state.athletes.push(
      athlete
    );


    saveState();

    clearAthleteForm();

    renderAll();

    showToast(
      `${name} 선수가 등록되었습니다.`
    );

  }


  function clearAthleteForm() {

    [
      "athleteNameInput",
      "athleteUniversityInput",
      "athleteMajorInput"
    ]
      .forEach(
        id => {

          if ($(id)) {

            $(id).value =
              "";

          }

        }
      );


    if (
      $("athleteGradeInput")
    ) {

      $("athleteGradeInput")
        .value =
        "";

    }

  }


  function renderAthletes() {

    const container =
      $("athleteList");

    if (!container) {
      return;
    }


    if (
      state.athletes.length ===
      0
    ) {

      container.innerHTML =
        `
        <div class="empty-state">
          등록된 선수가 없습니다.
        </div>
        `;

      updateAthleteSelects();

      return;

    }


    container.innerHTML =
      state.athletes
        .map(
          athlete => {

            const records =
              state.records.filter(
                record =>
                  record.athleteId ===
                  athlete.id
              );


            const average =
              records.length
                ? Math.round(
                    records.reduce(
                      (
                        sum,
                        record
                      ) =>
                        sum +
                        Number(
                          record.score ||
                          0
                        ),
                      0
                    ) /
                    records.length
                  )
                : 0;


            return `

              <div
                class="athlete-item"
              >

                <div>

                  <strong>
                    ${escapeHTML(
                      athlete.name
                    )}
                  </strong>

                  <span
                    class="muted"
                  >
                    ${
                      escapeHTML(
                        athlete.grade ||
                        "-"
                      )
                    }
                    ·
                    ${
                      escapeHTML(
                        athlete.university ||
                        "목표 대학 미설정"
                      )
                    }
                  </span>

                  <span
                    class="muted"
                  >
                    평균 실기점수:
                    ${average}/100
                  </span>

                </div>


                <button
                  class="secondary-button"
                  data-delete-athlete="${athlete.id}"
                >
                  삭제
                </button>

              </div>

            `;

          }
        )
        .join("");


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
                button.dataset
                  .deleteAthlete
              );

            }
          );

        }
      );


    updateAthleteSelects();

  }


  function deleteAthlete(
    athleteId
  ) {

    const athlete =
      state.athletes.find(
        item =>
          item.id ===
          athleteId
      );

    if (!athlete) {
      return;
    }


    state.athletes =
      state.athletes.filter(
        item =>
          item.id !==
          athleteId
      );


    state.records =
      state.records.filter(
        record =>
          record.athleteId !==
          athleteId
      );


    saveState();

    renderAll();

    showToast(
      "선수와 관련 기록이 삭제되었습니다."
    );

  }


  function updateAthleteSelects() {

    document
      .querySelectorAll(
        "[data-athlete-select]"
      )
      .forEach(
        select => {

          const current =
            select.value;


          select.innerHTML =
            `
              <option value="">
                선수 선택
              </option>
            ` +
            state.athletes
              .map(
                athlete =>
                  `
                  <option
                    value="${athlete.id}"
                  >
                    ${escapeHTML(
                      athlete.name
                    )}
                  </option>
                  `
              )
              .join("");


          if (
            state.athletes.some(
              athlete =>
                athlete.id ===
                current
            )
          ) {

            select.value =
              current;

          }

        }
      );

  }


  /* =======================================================
     RECORDS
     ======================================================= */

  function syncEventRecords() {

    if (
      window.PE_ADMISSION
    ) {

      const external =
        window.PE_ADMISSION
          .getRecords();


      if (
        Array.isArray(
          external
        )
      ) {

        state.records =
          external;

      }

    }

  }


  function renderRecords() {

    syncEventRecords();

    const container =
      $("recordList");

    if (!container) {
      return;
    }


    if (
      state.records.length ===
      0
    ) {

      container.innerHTML =
        `
        <div class="empty-state">
          저장된 분석 기록이 없습니다.
        </div>
        `;

      return;

    }


    container.innerHTML =
      state.records
        .slice(0, 100)
        .map(
          record =>
            `

            <div
              class="record-item"
            >

              <div>

                <strong>
                  ${
                    escapeHTML(
                      record.icon ||
                      "🏆"
                    )
                  }
                  ${
                    escapeHTML(
                      record.eventName ||
                      "실기"
                    )
                  }
                </strong>

                <span>
                  기록:
                  ${
                    escapeHTML(
                      record.value
                    )
                  }
                  ${
                    escapeHTML(
                      record.unit ||
                      ""
                    )
                  }
                </span>

                <small>
                  ${
                    formatDate(
                      record.createdAt
                    )
                  }
                </small>

              </div>


              <div>

                <span>
                  등급
                </span>

                <strong>
                  ${
                    escapeHTML(
                      record.grade ||
                      "-"
                    )
                  }
                </strong>

              </div>


              <div
                class="record-score"
              >
                ${
                  Number(
                    record.score ||
                    0
                  )
                }
              </div>

            </div>

            `
        )
        .join("");

  }


  /* =======================================================
     DASHBOARD
     ======================================================= */

  function updateDashboard() {

    syncEventRecords();

    setText(
      "athleteCount",
      state.athletes.length
    );

    setText(
      "recordCount",
      state.records.length
    );


    const average =
      state.records.length
        ? Math.round(
            state.records.reduce(
              (
                sum,
                record
              ) =>
                sum +
                Number(
                  record.score ||
                  0
                ),
              0
            ) /
            state.records.length
          )
        : 0;


    setText(
      "averageScore",
      average
    );


    setText(
      "targetUniversity",
      state.target.university ||
      "-"
    );


    renderRecent();

    updateCharts();

  }


  function renderRecent() {

    const container =
      $("recentAnalysisList");

    if (!container) {
      return;
    }


    if (
      state.records.length ===
      0
    ) {

      container.innerHTML =
        `
        <div class="empty-state">
          아직 분석 기록이 없습니다.
        </div>
        `;

      return;

    }


    container.innerHTML =
      state.records
        .slice(0, 7)
        .map(
          record =>
            `

            <div
              class="recent-item"
            >

              <div>

                <strong>
                  ${
                    escapeHTML(
                      record.icon ||
                      "🏆"
                    )
                  }
                  ${
                    escapeHTML(
                      record.eventName ||
                      "실기"
                    )
                  }
                </strong>

                <small>
                  ${
                    formatDate(
                      record.createdAt
                    )
                  }
                </small>

              </div>

              <b>
                ${
                  Number(
                    record.score ||
                    0
                  )
                }
              </b>

            </div>

            `
        )
        .join("");

  }


  /* =======================================================
     CHARTS
     ======================================================= */

  function initializeCharts() {

    if (
      typeof Chart ===
      "undefined"
    ) {

      return;

    }


    createPerformanceChart();

    createRadarChart();

    createReportCharts();

  }


  function createPerformanceChart() {

    const canvas =
      $("performanceChart");

    if (!canvas) {
      return;
    }


    if (
      charts.performance
    ) {

      charts.performance
        .destroy();

    }


    charts.performance =
      new Chart(
        canvas,
        {

          type:
            "line",

          data: {

            labels: [],

            datasets: [

              {
                label:
                  "실기 점수",

                data: [],

                borderWidth: 2,

                tension: 0.35,

                pointRadius: 4
              }

            ]

          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {

              legend: {
                display: false
              }

            },

            scales: {

              y: {

                min: 0,

                max: 100,

                ticks: {
                  color:
                    "#8fa1b6"
                },

                grid: {
                  color:
                    "rgba(255,255,255,.06)"
                }

              },

              x: {

                ticks: {
                  color:
                    "#8fa1b6"
                },

                grid: {
                  display:
                    false
                }

              }

            }

          }

        }
      );

  }


  function createRadarChart() {

    const canvas =
      $("dashboardRadar");

    if (!canvas) {
      return;
    }


    if (
      charts.radar
    ) {

      charts.radar.destroy();

    }


    charts.radar =
      new Chart(
        canvas,
        {

          type:
            "radar",

          data: {

            labels: [
              "스피드",
              "민첩성",
              "순발력",
              "근지구력",
              "유연성",
              "지구력"
            ],

            datasets: [

              {
                label:
                  "Performance",

                data:
                  [0, 0, 0, 0, 0, 0],

                borderWidth:
                  2,

                pointRadius:
                  3
              }

            ]

          },

          options: {

            responsive:
              true,

            maintainAspectRatio:
              false,

            scales: {

              r: {

                min: 0,

                max: 100,

                ticks: {
                  display:
                    false
                },

                grid: {
                  color:
                    "rgba(255,255,255,.09)"
                },

                angleLines: {
                  color:
                    "rgba(255,255,255,.08)"
                },

                pointLabels: {
                  color:
                    "#8fa1b6",

                  font: {
                    size: 10
                  }
                }

              }

            },

            plugins: {

              legend: {
                display:
                  false
              }

            }

          }

        }
      );

  }


  function createReportCharts() {

    const radar =
      $("reportRadar");

    if (radar) {

      charts.reportRadar =
        new Chart(
          radar,
          {

            type:
              "radar",

            data: {

              labels: [
                "스피드",
                "민첩성",
                "순발력",
                "근지구력",
                "유연성",
                "지구력"
              ],

              datasets: [

                {
                  label:
                    "Report",

                  data:
                    [0, 0, 0, 0, 0, 0],

                  borderWidth:
                    2
                }

              ]

            },

            options: {

              responsive:
                true,

              maintainAspectRatio:
                false,

              scales: {

                r: {

                  min: 0,

                  max: 100,

                  ticks: {
                    display:
                      false
                  },

                  pointLabels: {
                    color:
                      "#8fa1b6"
                  },

                  grid: {
                    color:
                      "rgba(255,255,255,.09)"
                  }

                }

              },

              plugins: {

                legend: {
                  display:
                    false
                }

              }

            }

          }
        );

    }


    const angle =
      $("reportAngleChart");

    if (angle) {

      charts.reportAngle =
        new Chart(
          angle,
          {

            type:
              "line",

            data: {

              labels: [],

              datasets: []

            },

            options: {

              responsive:
                true,

              maintainAspectRatio:
                false,

              plugins: {

                legend: {
                  labels: {
                    color:
                      "#8fa1b6"
                  }
                }

              }

            }

          }
        );

    }

  }


  function updateCharts() {

    if (
      charts.performance
    ) {

      const records =
        state.records
          .slice()
          .reverse()
          .slice(-12);


      charts.performance.data
        .labels =
        records.map(
          record =>
            record.eventName
              ?.slice(0, 7) ||
            "실기"
        );


      charts.performance.data
        .datasets[0]
        .data =
        records.map(
          record =>
            Number(
              record.score ||
              0
            )
        );


      charts.performance.update();

    }


    const categoryScores =
      calculateCategoryScores();


    if (
      charts.radar
    ) {

      charts.radar.data
        .datasets[0]
        .data =
        categoryScores;

      charts.radar.update();

    }


    if (
      charts.reportRadar
    ) {

      charts.reportRadar.data
        .datasets[0]
        .data =
        categoryScores;

      charts.reportRadar.update();

    }

  }


  function calculateCategoryScores() {

    const categories = {

      "스피드": [],

      "민첩성": [],

      "순발력": [],

      "근지구력": [],

      "유연성": [],

      "지구력": []

    };


    state.records.forEach(
      record => {

        const event =
          window.PE_ADMISSION
            ?.getEvent(
              record.eventId
            );


        if (
          event &&
          categories[
            event.category
          ]
        ) {

          categories[
            event.category
          ].push(
            Number(
              record.score ||
              0
            )
          );

        }

      }
    );


    return Object.values(
      categories
    )
      .map(
        values => {

          if (
            values.length ===
            0
          ) {

            return 0;

          }

          return Math.round(
            values.reduce(
              (
                sum,
                value
              ) =>
                sum + value,
              0
            ) /
            values.length
          );

        }
      );

  }


  /* =======================================================
     VIDEO
     ======================================================= */

  function setupVideo() {

    const video =
      $("analysisVideo");

    if (!video) {
      return;
    }


    video.addEventListener(
      "loadedmetadata",
      () => {

        hide(
          "videoPlaceholder"
        );

        drawBaseline();

      }
    );


    video.addEventListener(
      "timeupdate",
      () => {

        if (
          state.analysis.running
        ) {

          capturePoseFrame();

        }

      }
    );

  }


  function handleVideoFile(
    event
  ) {

    const file =
      event.target
        ?.files?.[0];

    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "video/"
      )
    ) {

      showToast(
        "영상 파일만 선택할 수 있습니다."
      );

      return;

    }


    const video =
      $("analysisVideo");

    if (!video) {
      return;
    }


    if (
      video.src &&
      video.src.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        video.src
      );

    }


    video.src =
      URL.createObjectURL(
        file
      );


    video.load();


    state.videos.push({

      id:
        `VID_${Date.now()}`,

      name:
        file.name,

      size:
        file.size,

      createdAt:
        new Date()
          .toISOString()

    });


    saveState();

    showToast(
      "영상이 불러와졌습니다."
    );

  }


  function toggleVideo() {

    const video =
      $("analysisVideo");

    if (!video) {
      return;
    }


    if (
      video.paused
    ) {

      video.play();

    } else {

      video.pause();

    }

  }


  function moveFrame(
    direction
  ) {

    const video =
      $("analysisVideo");

    if (!video) {
      return;
    }


    const frameRate =
      30;


    video.pause();


    video.currentTime =
      Math.max(
        0,
        Math.min(
          video.duration ||
            Infinity,

          video.currentTime +
            (
              direction /
              frameRate
            )
        )
      );


    capturePoseFrame();

  }


  /* =======================================================
     MEDIAPIPE POSE
     ======================================================= */

  let poseInstance =
    null;


  function initializePose() {

    if (
      typeof Pose ===
      "undefined"
    ) {

      showToast(
        "자세분석 라이브러리를 불러오지 못했습니다."
      );

      return false;

    }


    if (
      poseInstance
    ) {

      return true;

    }


    poseInstance =
      new Pose({

        locateFile:
          file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`

      });


    poseInstance.setOptions({

      modelComplexity:
        1,

      smoothLandmarks:
        true,

      enableSegmentation:
        false,

      smoothSegmentation:
        false,

      minDetectionConfidence:
        0.5,

      minTrackingConfidence:
        0.5

    });


    poseInstance.onResults(
      handlePoseResults
    );


    state.analysis.poseReady =
      true;


    return true;

  }


  async function startPoseAnalysis() {

    const video =
      $("analysisVideo");

    if (
      !video ||
      !video.src
    ) {

      showToast(
        "먼저 분석 영상을 업로드하세요."
      );

      return;

    }


    if (
      !initializePose()
    ) {

      return;

    }


    state.analysis.running =
      true;

    state.analysis.frames =
      [];

    state.analysis.trajectory =
      [];

    state.analysis.angleHistory =
      [];


    try {

      await video.play();

    } catch {

      // 자동재생 제한은 무시
    }


    showToast(
      "자세분석을 시작했습니다."
    );

  }


  function stopPoseAnalysis() {

    state.analysis.running =
      false;


    const video =
      $("analysisVideo");

    if (video) {

      video.pause();

    }


    calculateFinalAnalysis();

    generateAutomaticKeyFrames();

    generateFeedback();

    generateTrainingRecommendations();


    showToast(
      "자세분석이 완료되었습니다."
    );

  }


  async function capturePoseFrame() {

    if (
      !state.analysis.running ||
      !poseInstance
    ) {

      return;

    }


    const video =
      $("analysisVideo");

    if (
      !video ||
      video.readyState <
        2
    ) {

      return;

    }


    try {

      await poseInstance
        .send({
          image:
            video
        });

    } catch (error) {

      console.warn(
        "POSE FRAME ERROR",
        error
      );

    }

  }


  /* =======================================================
     POSE RESULTS
     ======================================================= */

  function handlePoseResults(
    results
  ) {

    if (
      !results ||
      !results.poseLandmarks
    ) {

      return;

    }


    const landmarks =
      results.poseLandmarks;


    state.analysis.lastLandmarks =
      landmarks;


    drawPose(
      landmarks
    );


    const angles =
      calculateAngles(
        landmarks
      );


    updateAngleUI(
      angles
    );


    state.analysis.angleHistory
      .push({

        time:
          $("analysisVideo")
            ?.currentTime ||
          0,

        ...angles

      });


    const center =
      getBodyCenter(
        landmarks
      );


    if (center) {

      state.analysis.trajectory
        .push(center);

      drawTrajectory();

    }


    calculateLiveScore(
      angles,
      landmarks
    );

  }


  /* =======================================================
     SKELETON
     ======================================================= */

  function drawPose(
    landmarks
  ) {

    const canvas =
      $("poseCanvas");

    const video =
      $("analysisVideo");

    if (
      !canvas ||
      !video
    ) {

      return;

    }


    const ctx =
      canvas.getContext(
        "2d"
      );


    canvas.width =
      video.videoWidth ||
      1280;

    canvas.height =
      video.videoHeight ||
      720;


    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    const connections = [

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

      [28, 30],
      [30, 32]

    ];


    ctx.lineWidth =
      4;

    ctx.lineCap =
      "round";

    ctx.strokeStyle =
      "#65e7ff";


    connections.forEach(
      ([a, b]) => {

        const p1 =
          landmarks[a];

        const p2 =
          landmarks[b];

        if (
          !p1 ||
          !p2
        ) {

          return;

        }


        ctx.beginPath();

        ctx.moveTo(
          p1.x *
            canvas.width,

          p1.y *
            canvas.height
        );

        ctx.lineTo(
          p2.x *
            canvas.width,

          p2.y *
            canvas.height
        );

        ctx.stroke();

      }
    );


    landmarks.forEach(
      point => {

        if (
          point.visibility <
          0.4
        ) {

          return;

        }


        ctx.beginPath();

        ctx.arc(
          point.x *
            canvas.width,

          point.y *
            canvas.height,

          5,

          0,

          Math.PI * 2
        );


        ctx.fillStyle =
          "#20a7ff";

        ctx.fill();

      }
    );


    drawReferenceLines(
      ctx,
      canvas
    );

  }


  /* =======================================================
     기준선
     ======================================================= */

  function drawReferenceLines(
    ctx,
    canvas
  ) {

    const centerX =
      canvas.width / 2;


    ctx.save();

    ctx.strokeStyle =
      "rgba(255,255,255,.35)";

    ctx.lineWidth =
      2;

    ctx.setLineDash([
      8,
      8
    ]);


    ctx.beginPath();

    ctx.moveTo(
      centerX,
      0
    );

    ctx.lineTo(
      centerX,
      canvas.height
    );

    ctx.stroke();


    ctx.restore();

  }


  function drawBaseline() {

    const canvas =
      $("poseCanvas");

    const video =
      $("analysisVideo");

    if (
      !canvas ||
      !video
    ) {

      return;

    }


    canvas.width =
      video.videoWidth ||
      1280;

    canvas.height =
      video.videoHeight ||
      720;


    const ctx =
      canvas.getContext(
        "2d"
      );


    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    drawReferenceLines(
      ctx,
      canvas
    );

  }


  /* =======================================================
     JOINT ANGLES
     ======================================================= */

  function calculateAngles(
    p
  ) {

    return {

      leftKnee:
        angle(
          p[23],
          p[25],
          p[27]
        ),

      rightKnee:
        angle(
          p[24],
          p[26],
          p[28]
        ),

      leftHip:
        angle(
          p[11],
          p[23],
          p[25]
        ),

      rightHip:
        angle(
          p[12],
          p[24],
          p[26]
        ),

      leftElbow:
        angle(
          p[11],
          p[13],
          p[15]
        ),

      rightElbow:
        angle(
          p[12],
          p[14],
          p[16]
        ),

      trunk:
        trunkAngle(
          p
        ),

      symmetry:
        calculateSymmetry(
          p
        )

    };

  }


  function angle(
    a,
    b,
    c
  ) {

    if (
      !a ||
      !b ||
      !c
    ) {

      return 0;

    }


    const ab = {

      x:
        a.x - b.x,

      y:
        a.y - b.y

    };


    const cb = {

      x:
        c.x - b.x,

      y:
        c.y - b.y

    };


    const dot =
      ab.x * cb.x +
      ab.y * cb.y;


    const magAB =
      Math.hypot(
        ab.x,
        ab.y
      );


    const magCB =
      Math.hypot(
        cb.x,
        cb.y
      );


    if (
      !magAB ||
      !magCB
    ) {

      return 0;

    }


    let cosine =
      dot /
      (
        magAB *
        magCB
      );


    cosine =
      Math.max(
        -1,
        Math.min(
          1,
          cosine
        )
      );


    return Math.round(
      Math.acos(
        cosine
      ) *
      180 /
      Math.PI
    );

  }


  function trunkAngle(
    p
  ) {

    if (
      !p[11] ||
      !p[12] ||
      !p[23] ||
      !p[24]
    ) {

      return 0;

    }


    const shoulder = {

      x:
        (
          p[11].x +
          p[12].x
        ) / 2,

      y:
        (
          p[11].y +
          p[12].y
        ) / 2

    };


    const hip = {

      x:
        (
          p[23].x +
          p[24].x
        ) / 2,

      y:
        (
          p[23].y +
          p[24].y
        ) / 2

    };


    const dx =
      shoulder.x -
      hip.x;


    const dy =
      shoulder.y -
      hip.y;


    return Math.round(
      Math.abs(
        Math.atan2(
          dx,
          -dy
        ) *
        180 /
        Math.PI
      )
    );

  }


  function calculateSymmetry(
    p
  ) {

    const pairs = [

      [11, 12],
      [13, 14],
      [15, 16],
      [23, 24],
      [25, 26],
      [27, 28]

    ];


    let total =
      0;

    let count =
      0;


    pairs.forEach(
      ([a, b]) => {

        if (
          !p[a] ||
          !p[b]
        ) {

          return;

        }


        const diff =
          Math.abs(
            p[a].y -
            p[b].y
          );


        total +=
          Math.max(
            0,
            100 -
              diff *
                250
          );

        count++;

      }
    );


    return count
      ? Math.round(
          total / count
        )
      : 0;

  }


  /* =======================================================
     ANGLE UI
     ======================================================= */

  function updateAngleUI(
    angles
  ) {

    setText(
      "leftKneeAngle",
      `${angles.leftKnee}°`
    );

    setText(
      "rightKneeAngle",
      `${angles.rightKnee}°`
    );

    setText(
      "leftHipAngle",
      `${angles.leftHip}°`
    );

    setText(
      "rightHipAngle",
      `${angles.rightHip}°`
    );

    setText(
      "leftElbowAngle",
      `${angles.leftElbow}°`
    );

    setText(
      "rightElbowAngle",
      `${angles.rightElbow}°`
    );

    setText(
      "trunkAngle",
      `${angles.trunk}°`
    );

    setText(
      "symmetryScore",
      `${angles.symmetry}%`
    );


    updateAngleChart();

  }


  function updateAngleChart() {

    const canvas =
      $("angleChart");

    if (!canvas) {
      return;
    }


    const history =
      state.analysis
        .angleHistory;


    const labels =
      history
        .slice(-60)
        .map(
          item =>
            Number(
              item.time ||
              0
            ).toFixed(1)
        );


    const knee =
      history
        .slice(-60)
        .map(
          item =>
            item.leftKnee
        );


    if (
      !charts.angle
    ) {

      charts.angle =
        new Chart(
          canvas,
          {

            type:
              "line",

            data: {

              labels,

              datasets: [

                {
                  label:
                    "왼쪽 무릎",

                  data:
                    knee,

                  borderWidth:
                    2,

                  tension:
                    0.3,

                  pointRadius:
                    0
                }

              ]

            },

            options: {

              responsive:
                true,

              maintainAspectRatio:
                false

            }

          }
        );

    } else {

      charts.angle.data
        .labels =
        labels;

      charts.angle.data
        .datasets[0]
        .data =
        knee;

      charts.angle.update(
        "none"
      );

    }

  }


  /* =======================================================
     LIVE SCORE
     ======================================================= */

  function calculateLiveScore(
    angles,
    landmarks
  ) {

    const stability =
      calculateStability();

    const alignment =
      calculateAlignment(
        landmarks
      );

    const symmetry =
      angles.symmetry;


    const efficiency =
      Math.round(
        (
          stability +
          alignment +
          symmetry
        ) / 3
      );


    const total =
      Math.round(
        (
          stability +
          alignment +
          symmetry +
          efficiency
        ) / 4
      );


    state.analysis.stability =
      stability;

    state.analysis.alignment =
      alignment;

    state.analysis.symmetry =
      symmetry;

    state.analysis.efficiency =
      efficiency;

    state.analysis.currentScore =
      total;


    setText(
      "analysisTotalScore",
      `${total} / 100`
    );


    updateMetric(
      "stability",
      stability
    );

    updateMetric(
      "alignment",
      alignment
    );

    updateMetric(
      "symmetry",
      symmetry
    );

    updateMetric(
      "efficiency",
      efficiency
    );

  }


  function calculateStability() {

    const points =
      state.analysis
        .trajectory;


    if (
      points.length <
      5
    ) {

      return 0;

    }


    const recent =
      points.slice(
        -20
      );


    let movement =
      0;


    for (
      let i = 1;
      i < recent.length;
      i++
    ) {

      movement +=
        Math.hypot(
          recent[i].x -
            recent[i - 1].x,

          recent[i].y -
            recent[i - 1].y
        );

    }


    const average =
      movement /
      Math.max(
        1,
        recent.length - 1
      );


    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          100 -
            average *
              180
        )
      )
    );

  }


  function calculateAlignment(
    p
  ) {

    if (
      !p[11] ||
      !p[12] ||
      !p[23] ||
      !p[24]
    ) {

      return 0;

    }


    const shoulderDiff =
      Math.abs(
        p[11].y -
        p[12].y
      );


    const hipDiff =
      Math.abs(
        p[23].y -
        p[24].y
      );


    const score =
      100 -
      (
        shoulderDiff +
        hipDiff
      ) *
        180;


    return Math.round(
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      )
    );

  }


  function updateMetric(
    name,
    value
  ) {

    setText(
      `${name}Score`,
      value
    );


    const bar =
      $(`${name}Bar`);

    if (bar) {

      bar.style.width =
        `${value}%`;

    }

  }


  /* =======================================================
     TRAJECTORY
     ======================================================= */

  function getBodyCenter(
    p
  ) {

    const points =
      [
        p[11],
        p[12],
        p[23],
        p[24]
      ]
      .filter(Boolean);


    if (
      points.length ===
      0
    ) {

      return null;

    }


    return {

      x:
        points.reduce(
          (
            sum,
            point
          ) =>
            sum +
            point.x,
          0
        ) /
        points.length,

      y:
        points.reduce(
          (
            sum,
            point
          ) =>
            sum +
            point.y,
          0
        ) /
        points.length

    };

  }


  function drawTrajectory() {

    const canvas =
      $("trajectoryCanvas");

    if (!canvas) {
      return;
    }


    const rect =
      canvas.getBoundingClientRect();


    const width =
      Math.max(
        300,
        Math.round(
          rect.width
        )
      );


    const height =
      300;


    canvas.width =
      width;

    canvas.height =
      height;


    const ctx =
      canvas.getContext(
        "2d"
      );


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    drawGrid(
      ctx,
      width,
      height
    );


    const points =
      state.analysis
        .trajectory
        .slice(-200);


    if (
      points.length <
      2
    ) {

      return;

    }


    ctx.beginPath();


    points.forEach(
      (
        point,
        index
      ) => {

        const x =
          point.x *
          width;


        const y =
          point.y *
          height;


        if (
          index ===
          0
        ) {

          ctx.moveTo(
            x,
            y
          );

        } else {

          ctx.lineTo(
            x,
            y
          );

        }

      }
    );


    ctx.strokeStyle =
      "#20a7ff";

    ctx.lineWidth =
      3;

    ctx.stroke();

  }


  function drawGrid(
    ctx,
    width,
    height
  ) {

    ctx.strokeStyle =
      "rgba(255,255,255,.05)";

    ctx.lineWidth =
      1;


    for (
      let x = 0;
      x <= width;
      x += width / 6
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        0
      );

      ctx.lineTo(
        x,
        height
      );

      ctx.stroke();

    }


    for (
      let y = 0;
      y <= height;
      y += height / 6
    ) {

      ctx.beginPath();

      ctx.moveTo(
        0,
        y
      );

      ctx.lineTo(
        width,
        y
      );

      ctx.stroke();

    }

  }


  /* =======================================================
     FINAL ANALYSIS
     ======================================================= */

  function calculateFinalAnalysis() {

    const history =
      state.analysis
        .angleHistory;


    if (
      history.length ===
      0
    ) {

      return;

    }


    const latest =
      history
        .slice(-1)[0];


    if (latest) {

      calculateLiveScore(
        latest,
        state.analysis
          .lastLandmarks ||
          []
      );

    }


    updateReport();

  }


  /* =======================================================
     AUTOMATIC KEY FRAMES
     ======================================================= */

  function generateAutomaticKeyFrames() {

    const history =
      state.analysis
        .angleHistory;


    const container =
      $("keyFrameList");


    if (!container) {
      return;
    }


    if (
      history.length ===
      0
    ) {

      container.innerHTML =
        `
        <div class="empty-state">
          분석 후 핵심 프레임이 자동으로 생성됩니다.
        </div>
        `;

      return;

    }


    const selected = [];


    const indexes = [

      0,

      Math.floor(
        history.length *
        0.25
      ),

      Math.floor(
        history.length *
        0.5
      ),

      Math.floor(
        history.length *
        0.75
      ),

      history.length - 1

    ];


    indexes.forEach(
      index => {

        const item =
          history[index];

        if (
          item &&
          !selected.includes(
            item
          )
        ) {

          selected.push(
            item
          );

        }

      }
    );


    setText(
      "keyFrameCount",
      selected.length
    );


    container.innerHTML =
      selected
        .map(
          (
            frame,
            index
          ) =>
            `

            <div
              class="key-frame-item"
            >

              <div
                class="key-frame-number"
              >
                ${index + 1}
              </div>

              <div>

                <strong>
                  핵심 프레임
                  ${index + 1}
                </strong>

                <span>
                  ${Number(
                    frame.time ||
                    0
                  ).toFixed(2)}초
                  ·
                  무릎
                  ${frame.leftKnee || 0}°
                </span>

              </div>

              <button
                class="secondary-button"
                data-key-time="${frame.time || 0}"
              >
                이동
              </button>

            </div>

            `
        )
        .join("");


    container
      .querySelectorAll(
        "[data-key-time]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const video =
                $("analysisVideo");

              if (video) {

                video.currentTime =
                  Number(
                    button.dataset
                      .keyTime
                  );

                video.pause();

                capturePoseFrame();

              }

            }
          );

        }
      );

  }


  /* =======================================================
     FEEDBACK
     ======================================================= */

  function generateFeedback() {

    const container =
      $("analysisFeedback");

    if (!container) {
      return;
    }


    const feedback = [];


    if (
      state.analysis.symmetry <
      80
    ) {

      feedback.push({

        title:
          "좌우 대칭 개선",

        text:
          "동작 중 좌우 움직임의 차이가 확인됩니다. 좌우 단측 동작과 안정화 훈련을 활용하세요."

      });

    }


    if (
      state.analysis.alignment <
      80
    ) {

      feedback.push({

        title:
          "신체 정렬 확인",

        text:
          "어깨와 골반의 정렬이 흔들리는 구간이 있습니다. 동작 속도를 낮춰 정확한 자세를 먼저 확보하세요."

      });

    }


    if (
      state.analysis.stability <
      80
    ) {

      feedback.push({

        title:
          "동작 안정성 개선",

        text:
          "동작 중 중심 이동이 크게 나타납니다. 코어 안정성과 착지·감속 능력을 함께 훈련하는 것이 좋습니다."

      });

    }


    if (
      state.analysis.efficiency <
      80
    ) {

      feedback.push({

        title:
          "동작 효율 개선",

        text:
          "불필요한 움직임을 줄이고 힘을 실제 추진 방향으로 전달하는 기술 연습이 필요합니다."

      });

    }


    if (
      feedback.length ===
      0
    ) {

      feedback.push({

        title:
          "전체적인 자세 양호",

        text:
          "현재 분석 기준에서 큰 문제가 확인되지 않았습니다. 동일한 동작을 안정적으로 재현하는 것을 목표로 하세요."

      });

    }


    container.innerHTML =
      feedback
        .map(
          item =>
            `

            <div
              class="feedback-item"
            >

              <strong>
                ${escapeHTML(
                  item.title
                )}
              </strong>

              <p>
                ${escapeHTML(
                  item.text
                )}
              </p>

            </div>

            `
        )
        .join("");


    const report =
      $("feedbackList");

    if (report) {

      report.innerHTML =
        container.innerHTML;

    }

  }


  /* =======================================================
     TRAINING RECOMMENDATIONS
     ======================================================= */

  function generateTrainingRecommendations() {

    const containers = [

      $("trainingRecommendations"),

      $("recommendedTraining")

    ];


    const eventName =
      $("analysisSport")
        ?.value;


    const event =
      window.PE_ADMISSION
        ?.getEventByName(
          eventName
        );


    let training = [];


    if (
      event
    ) {

      training =
        event.training ||
        [];

    }


    if (
      training.length ===
      0 &&
      window.PE_ADMISSION
    ) {

      training =
        window.PE_ADMISSION
          .events
          .flatMap(
            item =>
              item.training ||
              []
          )
          .slice(
            0,
            9
          );

    }


    containers.forEach(
      container => {

        if (!container) {
          return;
        }


        container.innerHTML =
          training
            .slice(
              0,
              9
            )
            .map(
              item =>
                `

                <div
                  class="training-card"
                >

                  <span
                    class="training-tag"
                  >
                    ${escapeHTML(
                      item.level ||
                      "추천"
                    )}
                  </span>

                  <strong>
                    ${escapeHTML(
                      item.name
                    )}
                  </strong>

                  <small>
                    ${escapeHTML(
                      item.purpose
                    )}
                  </small>

                  <div
                    class="training-meta"
                  >

                    <span>
                      ${escapeHTML(
                        item.sets
                      )}
                    </span>

                    <span>
                      ${escapeHTML(
                        item.reps
                      )}
                    </span>

                    <span>
                      ${escapeHTML(
                        item.rest
                      )}
                    </span>

                  </div>

                </div>

                `
            )
            .join("");

      }
    );

  }


  /* =======================================================
     COMPARISON
     ======================================================= */

  function renderComparison() {

    const athleteId =
      $("comparisonAthlete")
        ?.value;


    const records =
      athleteId
        ? state.records.filter(
            record =>
              record.athleteId ===
              athleteId
          )
        : state.records;


    const before =
      records[1];

    const after =
      records[0];


    renderComparisonCard(
      "comparisonBefore",
      before
    );

    renderComparisonCard(
      "comparisonAfter",
      after
    );


    const container =
      $("comparisonMetrics");


    if (!container) {
      return;
    }


    if (
      !before ||
      !after
    ) {

      container.innerHTML =
        `
        <div class="empty-state">
          비교를 위해 최소 2개의 기록이 필요합니다.
        </div>
        `;

      return;

    }


    const change =
      Number(
        after.score || 0
      ) -
      Number(
        before.score || 0
      );


    const direction =
      change >= 0
        ? "change-up"
        : "change-down";


    container.innerHTML =
      `

      <div
        class="comparison-metric"
      >

        <span>
          점수 변화
        </span>

        <strong
          class="${direction}"
        >
          ${
            change >= 0
              ? "+"
              : ""
          }${change}
        </strong>

      </div>


      <div
        class="comparison-metric"
      >

        <span>
          이전 점수
        </span>

        <strong>
          ${before.score || 0}
        </strong>

      </div>


      <div
        class="comparison-metric"
      >

        <span>
          현재 점수
        </span>

        <strong>
          ${after.score || 0}
        </strong>

      </div>


      <div
        class="comparison-metric"
      >

        <span>
          이전 기록
        </span>

        <strong>
          ${before.value || "-"}
        </strong>

      </div>


      <div
        class="comparison-metric"
      >

        <span>
          현재 기록
        </span>

        <strong>
          ${after.value || "-"}
        </strong>

      </div>

      `;

  }


  function renderComparisonCard(
    id,
    record
  ) {

    const container =
      $(id);

    if (!container) {
      return;
    }


    if (!record) {

      container.innerHTML =
        `
        <span>
          비교할 기록이 없습니다.
        </span>
        `;

      return;

    }


    container.innerHTML =
      `

      <div>

        <strong>
          ${escapeHTML(
            record.eventName ||
            "실기"
          )}
        </strong>

        <p>
          기록:
          ${escapeHTML(
            record.value
          )}
          ${escapeHTML(
            record.unit ||
            ""
          )}
        </p>

        <b>
          ${record.score || 0}/100
        </b>

      </div>

      `;

  }


  /* =======================================================
     REPORT
     ======================================================= */

  function bindReport() {

    const save =
      $("saveCollegeGoal");

    if (!save) {
      return;
    }

  }


  function saveCollegeGoal() {

    state.target = {

      university:
        $("collegeUniversity")
          ?.value
          .trim() ||
        "",

      major:
        $("collegeMajor")
          ?.value
          .trim() ||
        "",

      admission:
        $("collegeAdmission")
          ?.value
          .trim() ||
        "",

      grade:
        $("collegeTargetGrade")
          ?.value
          .trim() ||
        ""

    };


    saveState();

    updateDashboard();

    showToast(
      "목표 대학이 저장되었습니다."
    );

  }


  function updateReport() {

    const score =
      state.analysis.currentScore;


    setText(
      "reportTotalScore",
      `${score}/100`
    );

    setText(
      "reportStability",
      state.analysis.stability
    );

    setText(
      "reportAlignment",
      state.analysis.alignment
    );

    setText(
      "reportSymmetry",
      state.analysis.symmetry
    );

    setText(
      "reportEfficiency",
      state.analysis.efficiency
    );


    const university =
      $("collegeUniversity");

    if (
      university &&
      state.target.university
    ) {

      university.value =
        state.target.university;

    }


    const major =
      $("collegeMajor");

    if (
      major &&
      state.target.major
    ) {

      major.value =
        state.target.major;

    }


    const admission =
      $("collegeAdmission");

    if (
      admission &&
      state.target.admission
    ) {

      admission.value =
        state.target.admission;

    }


    const grade =
      $("collegeTargetGrade");

    if (
      grade &&
      state.target.grade
    ) {

      grade.value =
        state.target.grade;

    }


    generateFeedback();

    generateTrainingRecommendations();

    updateCharts();

  }


  /* =======================================================
     RENDER ALL
     ======================================================= */

  function renderAll() {

    syncEventRecords();

    renderAthletes();

    renderRecords();

    updateDashboard();

    updateAthleteSelects();

    generateTrainingRecommendations();

  }


  /* =======================================================
     CLOCK
     ======================================================= */

  function updateClock() {

    const clock =
      $("clock");

    if (!clock) {
      return;
    }


    const now =
      new Date();


    clock.textContent =
      now.toLocaleTimeString(
        "ko-KR",
        {
          hour:
            "2-digit",

          minute:
            "2-digit",

          second:
            "2-digit"
        }
      );

  }


  /* =======================================================
     HELPERS
     ======================================================= */

  function setText(
    id,
    value
  ) {

    const element =
      $(id);

    if (element) {

      element.textContent =
        value;

    }

  }


  function hide(
    id
  ) {

    const element =
      $(id);

    if (element) {

      element.style.display =
        "none";

    }

  }


  function show(
    id
  ) {

    const element =
      $(id);

    if (element) {

      element.style.display =
        "";

    }

  }


  function formatDate(
    date
  ) {

    if (!date) {
      return "-";
    }


    const value =
      new Date(date);


    if (
      Number.isNaN(
        value.getTime()
      )
    ) {

      return "-";

    }


    return value.toLocaleString(
      "ko-KR",
      {
        month:
          "numeric",

        day:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit"
      }
    );

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
      $("toast");

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
        2300
      );

  }


  /* =======================================================
     GLOBAL API
     ======================================================= */

  window.SC_APP = {

    state,

    saveState,

    renderAll,

    openPage,

    showToast,

    updateDashboard,

    updateReport,

    startPoseAnalysis,

    stopPoseAnalysis

  };


  /* =======================================================
     START
     ======================================================= */

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