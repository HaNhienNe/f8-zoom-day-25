console.log('Hello! F8');
const slideRef = '#demo-slide';
const DEFAULTS = {
    autoPlay: true,
    autoPlayDelay: 3000,
    pauseOnHover: true,
    duration: 300,
    timingFunction: 'ease',
    slidesPerPage: 1,
    loop: true,
    direction: 'horizontal',
    gap: 0,
    prevText: '←',
    nextText: '→',
    showArrows: true,
    showPagination: true,
    isPaginationInside: false,
    startIndex: 0,
    draggable: true,
};
let slideIntance = null;

const _SLIDES_HTML = `<div class="moki-slide">
                    <div class="moki-slide-item" data-image="./images/img7.png"></div>
                    <div class="moki-slide-item" data-image="./images/img8.png"></div>
                    <div class="moki-slide-item" data-image="./images/img9.png"></div>
                    <div class="moki-slide-item" data-image="./images/img10.png"></div>
                    <div class="moki-slide-item" data-image="./images/img11.png"></div>
                    <div class="moki-slide-item" data-image="./images/img12.png"></div>
                </div>`;

function initSlide(sel, option) {
    slideIntance = new MokiSlide(sel, option);
    return slideIntance;
}

function getOptions() {
    return {
        autoPlay: document.getElementById('autoPlay').checked,
        autoPlayDelay: +document.getElementById('autoPlayDelay').value,
        pauseOnHover: document.getElementById('pauseOnHover').checked,

        duration: +document.getElementById('duration').value,
        timingFunction: document.getElementById('timingFunction').value,

        slidesPerPage: +document.getElementById('slidesPerPage').value,
        loop: document.getElementById('loop').checked,
        direction: document.getElementById('direction').value,
        gap: +document.getElementById('gap').value,

        prevText: document.getElementById('prevText').value || '←',
        nextText: document.getElementById('nextText').value || '→',
        showArrows: document.getElementById('showArrows').checked,
        showPagination: document.getElementById('showPagination').checked,
        isPaginationInside: document.getElementById('isPaginationInside').checked,

        startIndex: +document.getElementById('startIndex').value,
        draggable: document.getElementById('draggable').checked,
    };
}

function resetOptions() {
    $('#autoPlay').checked = DEFAULTS.autoPlay;
    $('#autoPlayDelay').value = DEFAULTS.autoPlayDelay;
    $('#pauseOnHover').checked = DEFAULTS.pauseOnHover;
    $('#duration').value = DEFAULTS.duration;
    $('#timingFunction').value = DEFAULTS.timingFunction;
    $('#slidesPerPage').value = DEFAULTS.slidesPerPage;
    $('#loop').checked = DEFAULTS.loop;
    $('#direction').value = DEFAULTS.direction;
    $('#gap').value = DEFAULTS.gap;
    $('#prevText').value = DEFAULTS.prevText;
    $('#nextText').value = DEFAULTS.nextText;
    $('#showArrows').checked = DEFAULTS.showArrows;
    $('#showPagination').checked = DEFAULTS.showPagination;
    $('#isPaginationInside').checked = DEFAULTS.isPaginationInside;
    $('#startIndex').value = DEFAULTS.startIndex;
    $('#draggable').checked = DEFAULTS.draggable;
}

function reset(mokiSlide, updateOptionDOM = false) {
    if (!mokiSlide) return;
    mokiSlide.container.innerHTML = _SLIDES_HTML;
    mokiSlide?.pagination?.remove();
    mokiSlide.controls?.prevButton?.remove();
    mokiSlide.controls?.nextButton?.remove();
    if (updateOptionDOM) {
        resetOptions();
    }
}

function apply() {
    const option = getOptions();
    option.startIndex = slideIntance.currentIndex - 1;
    reset(slideIntance);
    initSlide(slideRef, option);
}


function start() {
    if (!slideIntance) {
        initSlide(slideRef, DEFAULTS);
    }
    $('#apply').onclick = apply;
    $('#reset').onclick = () => {
        reset(slideIntance, true);
        initSlide(slideRef, DEFAULTS);
    };

    $('#codeBtn').onclick = handlerGenerateCode;
    $('#copyBtn').onclick = copyCode;

    $('.mini-size').onclick = () => {
        resizeSetting(true);
    };

    $('.max-size').onclick = () => {
        resizeSetting(false);
    };

}

function resizeSetting(isMax = false) {
    const setting = $('.setting');
    setting.style.width = `${isMax ? 0 : 500}px`;
    $('.max-size').style.display = `${isMax ? 'flex' : 'none'}`;

    setTimeout(() => {
        reset(slideIntance);
        slideIntance = initSlide(slideRef, slideIntance.opt);
    }, 0);
}

function copyCode(events) {
    const txt = document.getElementById('codebox').textContent;
    navigator.clipboard.writeText(txt);
    const btn = events.currentTarget;
    const old = btn.innerHTML;
    btn.textContent = 'copied ✓';
    setTimeout(() => btn.innerHTML = old, 1200);
};

function handlerGenerateCode() {
    const opts = getOptions();
    const diff = {};
    Object.keys(opts).forEach(k => {
        if (opts[k] !== DEFAULTS[k]) diff[k] = opts[k];
    });
    const pretty = JSON.stringify(diff, null, 2)
        .replace(/"([^"]+)":/g, '$1:')
        .replace(/"([^"]*)"/g, `'$1'`);

    $('#codebox').innerHTML = `const slide = new MokiSlide('#demo-slide', ${pretty});`;
}

start();