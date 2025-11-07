const slideRef = "#demo-slide";
const DEFAULTS = {
  autoPlay: true,
  autoPlayDelay: 3000,
  pauseOnHover: true,
  duration: 300,
  timingFunction: "ease",
  slidesPerPage: 1,
  loop: true,
  direction: "horizontal",
  gap: 0,
  prevText: "←",
  nextText: "→",
  showArrows: true,
  showPagination: true,
  isPaginationInside: false,
  startIndex: 0,
  draggable: true,
};
let slideIntance = null;
let originalContainerHeight = 0;

const _SLIDES_HTML = `<div class="moki-slide">
                    <div class="moki-slide-item" data-image="./images/img7.png"></div>
                    <div class="moki-slide-item" data-image="./images/img8.png"></div>
                    <div class="moki-slide-item" data-image="./images/img9.png"></div>
                    <div class="moki-slide-item" data-image="./images/img10.png"></div>
                    <div class="moki-slide-item" data-image="./images/img11.png"></div>
                    <div class="moki-slide-item" data-image="./images/img12.png"></div>
                </div>`;

function getOptions() {
  return {
    autoPlay: document.getElementById("autoPlay").checked,
    autoPlayDelay: +document.getElementById("autoPlayDelay").value,
    pauseOnHover: document.getElementById("pauseOnHover").checked,

    duration: +document.getElementById("duration").value,
    timingFunction: document.getElementById("timingFunction").value,

    slidesPerPage: +document.getElementById("slidesPerPage").value,
    loop: document.getElementById("loop").checked,
    direction: document.getElementById("direction").value,
    gap: +document.getElementById("gap").value,

    prevText: document.getElementById("prevText").value || "←",
    nextText: document.getElementById("nextText").value || "→",
    showArrows: document.getElementById("showArrows").checked,
    showPagination: document.getElementById("showPagination").checked,
    isPaginationInside: document.getElementById("isPaginationInside").checked,

    startIndex: +document.getElementById("startIndex").value,
    draggable: document.getElementById("draggable").checked,
  };
}

function setOptions(options) {
  document.getElementById("autoPlay").checked = options.autoPlay;
  document.getElementById("autoPlayDelay").value = options.autoPlayDelay;
  document.getElementById("pauseOnHover").checked = options.pauseOnHover;

  document.getElementById("duration").value = options.duration;
  document.getElementById("timingFunction").value = options.timingFunction;

  document.getElementById("slidesPerPage").value = options.slidesPerPage;
  document.getElementById("loop").checked = options.loop;
  document.getElementById("direction").value = options.direction;
  document.getElementById("gap").value = options.gap;

  document.getElementById("prevText").value = options.prevText;
  document.getElementById("nextText").value = options.nextText;
  document.getElementById("showArrows").checked = options.showArrows;
  document.getElementById("showPagination").checked = options.showPagination;
  document.getElementById("isPaginationInside").checked =
    options.isPaginationInside;

  document.getElementById("startIndex").value = options.startIndex;
  document.getElementById("draggable").checked = options.draggable;
}

function resetOptions() {
  $("#autoPlay").checked = DEFAULTS.autoPlay;
  $("#autoPlayDelay").value = DEFAULTS.autoPlayDelay;
  $("#pauseOnHover").checked = DEFAULTS.pauseOnHover;
  $("#duration").value = DEFAULTS.duration;
  $("#timingFunction").value = DEFAULTS.timingFunction;
  $("#slidesPerPage").value = DEFAULTS.slidesPerPage;
  $("#loop").checked = DEFAULTS.loop;
  $("#direction").value = DEFAULTS.direction;
  $("#gap").value = DEFAULTS.gap;
  $("#prevText").value = DEFAULTS.prevText;
  $("#nextText").value = DEFAULTS.nextText;
  $("#showArrows").checked = DEFAULTS.showArrows;
  $("#showPagination").checked = DEFAULTS.showPagination;
  $("#isPaginationInside").checked = DEFAULTS.isPaginationInside;
  $("#startIndex").value = DEFAULTS.startIndex;
  $("#draggable").checked = DEFAULTS.draggable;
}

function initSlide(sel, option) {
  slideIntance = new MokiSlide(sel, option);
  return slideIntance;
}

function resetSlide(mokiSlide, updateOptionDOM = false) {
  if (!mokiSlide) return;
  mokiSlide.container.innerHTML = _SLIDES_HTML;
  mokiSlide?.pagination?.remove();
  mokiSlide.controls?.prevButton?.remove();
  mokiSlide.controls?.nextButton?.remove();
  if (updateOptionDOM) {
    resetOptions();
  }
  if (window.matchMedia("(max-width: 460px)").matches) {
    closeSetting();
  }
}

function applySlide() {
  const option = getOptions();
  resetSlide(slideIntance);
  initSlide(slideRef, option);
  if (window.matchMedia("(max-width: 460px)").matches) {
    closeSetting();
  }
}

function openSetting() {
  $(".app").style.transform = "translateX(-100%)";
}

function closeSetting() {
  $(".app").style.transform = "translateX(0%)";
}

function copyCode(events) {
  const txt = $("#codebox").textContent;
  navigator.clipboard.writeText(txt);
  const btn = events.currentTarget;
  const old = btn.innerHTML;
  btn.textContent = "✓";
  setTimeout(() => (btn.innerHTML = old), 1200);
}

function handlerGenerateCode() {
  const opts = getOptions();
  const diff = {};
  Object.keys(opts).forEach((k) => {
    if (opts[k] !== DEFAULTS[k]) diff[k] = opts[k];
  });
  const pretty = JSON.stringify(diff, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"([^"]*)"/g, `'$1'`);
  const codeHTML = `const slide = new MokiSlide('#demo-slide', ${pretty});`;
  $("#codebox").innerHTML = codeHTML;
  $(".btn-copy").style.display = "block";
}

function start() {
  if (!slideIntance) {
    initSlide(slideRef, DEFAULTS);
    originalContainerHeight = slideIntance.container.offsetHeight;
  }
  $("#apply").onclick = applySlide;
  $("#reset").onclick = () => {
    resetSlide(slideIntance, true);
    initSlide(slideRef, DEFAULTS);
    handlerGenerateCode();
  };

  $("#optionBtn").onclick = () => {
    $(".btn-copy").style.display = "none";
  };

  $("#codeBtn").onclick = handlerGenerateCode;
  $("#copyBtn").onclick = copyCode;

  $(".btn-close-setting").onclick = closeSetting;

  $(".btn-open-setting").onclick = () => {
    setOptions(slideIntance.opt);
    openSetting();
  };
}

start();
