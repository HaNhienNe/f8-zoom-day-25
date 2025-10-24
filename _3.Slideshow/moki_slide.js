const $ = (sel, doc = document) => doc.querySelector(sel);
const $$ = (sel, doc = document) => doc.querySelectorAll(sel);

const defaults = {
    autoPlay: true,
    autoPlayDelay: 3000,
    pauseOnHover: true,

    duration: 500,
    timingFunction: 'ease',

    slidesPerPage: 1,
    loop: true,
    direction: 'horizontal', // or vertical 
    gap: 0,

    prevText: '‹',
    nextText: '›',
    showArrows: true,
    showPagination: true,

    startIndex: 0,
    draggable: false,
    verticalThreshold: 0.3,
    horizontalThreshold: 0.3,

    onInit: null,
    onChange: null
};

const mokiRefs = {
    slide: { sel: '.moki-slide', value: 'moki-slide' },
    slideItems: { sel: '.moki-slide-item', value: 'moki-slide-item' },
    pagination: { sel: '.moki-pagination', value: 'moki-pagination' },
    paginationItems: { sel: '.moki-pagination-item', value: 'moki-pagination-item' },
    prevButton: { sel: '.moki-prev', value: 'moki-prev' },
    nextButton: { sel: '.moki-next', value: 'moki-next' },
    container: { sel: '.moki-slide-container', value: 'moki-slide-container' },
};

function MokiSlide(sel, opt = defaults) {
    this.sel = sel;
    this.opt = Object.assign({}, defaults, opt);
    this.opt = normalizeStringProps(this.opt);
    this.ignoreTargets = [];
    this._checkParams();
    this._init();

}

MokiSlide.prototype._checkParams = function () {
    if (this.totalSlideOrigin === 0) {
        console.warn("Slides cannot be empty!");
        return;
    }

    if (this.totalSlideOrigin < this.opt.slidesPerPage) {
        console.error("The number of slides per view must be less than the total number of slides.");
        return;
    }

    if (!$(this.sel)) {
        console.error("Slide container element not found!");
        return;
    }

    if (!$(mokiRefs.slide.sel)) {
        console.error("Slide element not found!");
        return;
    } else if (!$(mokiRefs.slideItems.sel)) {
        console.error("Slide items not found!");
        return;
    } else if ($(mokiRefs.slideItems.sel).length === 0) {
        console.error("No slide items found in the container!");
        return;
    }

    if (this.opt.onInit !== null && typeof this.opt.onInit !== 'function') {
        console.warn("Invalid 'onInit' callback: expected a function.");
        return;

    }

    if (this.opt.onInit !== null && typeof this.opt.onChange !== 'function') {
        console.warn("Invalid 'onChange' callback: expected a function.");
    }

    if (this.opt.showArrows && (!this.opt.nextText || !this.opt.prevText)) {
        console.warn('"nextText" or "prevText" is missing. Default arrows ‹ › will be used.');
    }
}

MokiSlide.prototype._init = function () {
    this._initElements();
    this._initSlideState();
    this._cloneSlide();
    this._initStyleSlide();
    this._createPagination();
    this._createControl();
    this._initAutoPlay();
    this._initDraggable();

    if (this.currentIndex !== 0) {
        this.gotoSlide(this.currentIndex, true);
    }

    window.addEventListener('resize', this._handlerResize.bind(this));
    this._runCallback(this.opt.onInit);
}

MokiSlide.prototype._initElements = function () {
    this.container = $(this.sel);
    this.container.classList.add(mokiRefs.container.value);
    this.isClicked = false;
    this.slide = $(mokiRefs.slide.sel, this.container);
    this.slideItems = $$(mokiRefs.slideItems.sel, this.slide);
}

MokiSlide.prototype._initSlideState = function () {
    this.totalSlideOrigin = this.slideItems.length;
    this.currentIndex = this.opt.loop ? this.opt.startIndex + this.opt.slidesPerPage : this.opt.startIndex;
    this.oldIndex = this.currentIndex;
    this.shouldDisableAllControls = false;
    if (this.totalSlideOrigin === this.opt.slidesPerPage) {
        this.currentIndex = 0;
        this.shouldDisableAllControls = true;
    }
    this.dragState = { isDraging: false, start: 0, end: 0, range: 0, currentRange: 0 };
    this.isVertical = this.opt.direction === 'v' || this.opt.direction === 'vertical';
}

MokiSlide.prototype._initAutoPlay = function () {
    if (!this.opt.autoPlay) return;
    this.autoPlay = setInterval(this.nextSlide.bind(this), this.opt.autoPlayDelay);
    this.container.addEventListener('mouseover', (e) => {
        if (!this.opt.autoPlay || !this.opt.pauseOnHover) return;
        const notIgnore = !this.ignoreTargets.includes(e.target);
        if (notIgnore) {
            clearInterval(this.autoPlay);
            this.autoPlay = null;
            return;
        }

        if (this.autoPlay === null) {
            this.autoPlay = setInterval(this.nextSlide.bind(this), this.opt.autoPlayDelay);
        }
    });

    this.container.addEventListener('mouseleave', () => {
        if (this.autoPlay === null && this.opt.pauseOnHover) {
            this.autoPlay = setInterval(this.nextSlide.bind(this), this.opt.autoPlayDelay);
        }
    });
}

MokiSlide.prototype._initDraggable = function () {
    if (!this.opt.draggable) return;
    const isPositive = String(this.slide.style.transform).includes('-');
    const currentRange = this.isVertical
        ? this.offsetHeightOfSlide * this.currentIndex
        : this.offsetWidthOfSlide * this.currentIndex;
    this.dragState.currentRange = isPositive ? - (currentRange) : (currentRange);

    this.slide.addEventListener('pointerdown', (e) => {
        const isIgnore = this.ignoreTargets.includes(e.target);
        if (isIgnore) {
            return;
        }
        this.slide.setPointerCapture(e.pointerId);
        this.dragState.isDraging = true;
        this.dragState.start = this.isVertical ? e.clientY : e.clientX;
    });

    this.slide.addEventListener('pointermove', (e) => {
        if (!this.dragState.isDraging) return;
        this.dragState.end = this.isVertical ? e.clientY : e.clientX;
        this.dragState.range = this.dragState.end - this.dragState.start;
        this.slide.style.transition = 'none';
        this.container.style.userSelect = 'none';
        this.slide.style.transform = `translate${this.isVertical ? 'Y' : 'X'}(${this.dragState.currentRange + this.dragState.range}px)`;
    });

    this.slide.addEventListener('pointerup', (e) => {
        if (!this.dragState.isDraging) return;
        this.dragState.currentRange = this.dragState.currentRange + (this.dragState.end - this.dragState.start);
        this.container.style.userSelect = 'auto';
        this.slide.style.transition = `all ${this.opt.duration}ms ${this.opt.timingFunction}`;
        this.slide.releasePointerCapture(e.pointerId);
        const isNextSlide = this.dragState.range <= -this.dragDistance;
        const ispreveSlide = this.dragState.range >= this.dragDistance;
        this.oldIndex = this.currentIndex;

        if (isNextSlide) {
            this.currentIndex += this.opt.slidesPerPage;
            this._handlerMoveSlideTarget(true);
        } else if (ispreveSlide) {
            this.currentIndex -= this.opt.slidesPerPage;
            this._handlerMoveSlideTarget(false);
        } else if (this.dragState.range !== 0) {
            this.gotoSlide(this.currentIndex, false, true);
        }

        this.dragState.range = 0;
        this.dragState.isDraging = false;
    });

}

MokiSlide.prototype._initWidthSlide = function () {

}

// Create Pagination
MokiSlide.prototype._createPagination = function () {
    if (!this.opt.showPagination) return;
    const pagination = document.createElement('div');
    const countPagination = Math.ceil(this.totalSlideOrigin / this.opt.slidesPerPage);
    pagination.className = mokiRefs.pagination.value;

    for (let i = 1; i <= countPagination; i++) {
        const paginationItem = document.createElement('div');
        paginationItem.className = mokiRefs.paginationItems.value;
        paginationItem.style.transition = `all ${this.opt.duration}ms ${this.opt.timingFunction}`;
        if (!this.shouldDisableAllControls) {
            paginationItem.addEventListener('click', this._onPagination.bind(this, i * this.opt.slidesPerPage))
        }
        pagination.appendChild(paginationItem);
        this.ignoreTargets.push(paginationItem);
    }

    this.container.appendChild(pagination);
    this.pagination = $(mokiRefs.pagination.sel, this.container);
    this.paginationItems = $$(mokiRefs.paginationItems.sel, this.pagination);
    this._activePagination();
    this.ignoreTargets.push(pagination);
}

MokiSlide.prototype._onPagination = function (slideIndex) {
    this.currentIndex = slideIndex;
    this.gotoSlide(slideIndex);
    this._activePagination();
}

// Create Control
MokiSlide.prototype._createControl = function () {
    if (!this.opt.showArrows) return;
    const prevButton = createButton(mokiRefs.prevButton.value, this.opt.prevText);

    if (this.shouldDisableAllControls) {
        prevButton.disabled = true;
    } else {
        prevButton.addEventListener('click', this.prevSlide.bind(this));
    }

    const nextButton = createButton(mokiRefs.nextButton.value, this.opt.nextText);
    if (this.shouldDisableAllControls) {
        nextButton.disabled = true;
    } else {
        nextButton.addEventListener('click', this.nextSlide.bind(this));
    }

    this.container.appendChild(prevButton);
    this.container.appendChild(nextButton);
    this.controls = { prevButton, nextButton };
    this.ignoreTargets.push(prevButton, nextButton);
}

MokiSlide.prototype._handlerMoveSlideTarget = function (isNextSlide) {
    const slideLastIndex = this.slideItems.length - 1;
    const shouldWrap = this.currentIndex + this.opt.slidesPerPage >= slideLastIndex || this.currentIndex <= 0;
    if (!this.opt.loop) {
        if (this.currentIndex > slideLastIndex) {
            this.currentIndex -= this.opt.slidesPerPage;
        }
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        }
    }

    this.gotoSlide(this.currentIndex);
    this._activePagination();

    if (shouldWrap && this.opt.loop) {
        this.currentIndex = isNextSlide
            ? this.currentIndex - this.totalSlideOrigin
            : this.currentIndex + this.totalSlideOrigin;
        !isNextSlide && this._activePagination();
        this.isClicked = true;
        setTimeout(() => {
            this.gotoSlide(this.currentIndex, true);
        }, this.opt.duration);
    }
}

MokiSlide.prototype._activePagination = function () {
    if (!this.opt.showPagination) return;
    let paginationIndex = Math.floor((this.currentIndex - this.opt.slidesPerPage) / this.opt.slidesPerPage);

    if (!this.opt.loop) {
        paginationIndex += 1;
    } else {

        if (paginationIndex < 0) {
            paginationIndex = 0;
        }

        if (this.currentIndex - this.opt.slidesPerPage < 0) {
            paginationIndex = this.paginationItems.length - 1;
        }

        if (this.currentIndex > this.totalSlideOrigin - 1 + this.opt.slidesPerPage) {
            paginationIndex = 0;
        }

        if (this.opt.slidesPerPage === this.totalSlideOrigin) {
            paginationIndex = 0;
        }
    }

    removesClass(this.paginationItems, 'active');
    this.paginationItems[paginationIndex]?.classList.add('active');

}

MokiSlide.prototype.gotoSlide = function (index, noTransition = false, noWaitTransitionEnd = false) {
    const cWidth = this.isVertical ? this.offsetHeightOfSlide * index : this.offsetWidthOfSlide * index;
    this.slide.style.transition = noTransition ? 'none' : `all ${this.opt.duration}ms ${this.opt.timingFunction}`;
    this.slide.style.transform = `translate${this.isVertical ? 'Y' : 'X'}(-${cWidth}px)`;
    if (this.opt.draggable) {
        this.dragState.currentRange = -(cWidth);
    }

    if (!noTransition && !noWaitTransitionEnd) {
        setTimeout(() => {
            this.isClicked = false;
        }, this.opt.duration);
    } else {
        this.isClicked = false;
    }

    if (!noTransition && this.oldIndex !== this.currentIndex) {
        this._runCallback(this.opt.onChange);
    }
}

MokiSlide.prototype.nextSlide = function () {
    if (this.isClicked) return;
    this.isClicked = true;
    this.oldIndex = this.currentIndex;
    this.currentIndex += this.opt.slidesPerPage;
    this._handlerMoveSlideTarget(true);
}

MokiSlide.prototype.prevSlide = function () {
    if (this.isClicked) return;
    this.isClicked = true;
    this.oldIndex = this.currentIndex;
    this.currentIndex -= this.opt.slidesPerPage;
    this._handlerMoveSlideTarget(false);
}

MokiSlide.prototype._cloneSlide = function () {
    if (this.slideItems.length < 2 || !this.opt.loop) return;
    if (this.slideItems.length === this.opt.slidesPerPage) return;
    const slideArr = Array.from(this.slideItems);
    const slidesCloneFirst = slideArr.slice(0, this.opt.slidesPerPage);
    const slidesLastClone = slideArr.slice(-this.opt.slidesPerPage);

    slidesCloneFirst.forEach(item => {
        this.slide.appendChild(item.cloneNode(true));
    });
    slidesLastClone.reverse().forEach(item => {
        this.slide.prepend(item.cloneNode(true));
    });
    this.slideItems = $$(mokiRefs.slideItems.sel, this.slide);
}

MokiSlide.prototype._initStyleSlide = function () {
    // Set back ground images
    this.slideItems.forEach(item => {
        const urlImage = item.dataset.image;
        urlImage && (item.style.backgroundImage = `url(${urlImage})`);
    });

    // Set Width
    this.slideItems.forEach(item => {
        item.style.width = `calc(100% / ${this.opt.slidesPerPage})`;
    });
    const gap = this.opt.slidesPerPage > 1 ? this.opt.gap : 0;
    this.slide.style.gap = `${gap}px`;
    this.offsetWidthOfSlide = this.slideItems[0].offsetWidth + (gap * (this.opt.slidesPerPage - 1));
    this.offsetHeightOfSlide = this.slideItems[0].offsetHeight + (gap * (this.opt.slidesPerPage - 1));
    this.dragDistance = this.isVertical
        ? this.offsetHeightOfSlide * this.opt.verticalThreshold
        : this.offsetWidthOfSlide * this.opt.horizontalThreshold;
    // Set Style
    if (this.isVertical) {
        this.slide.style = 'flex-direction: column;';
    }
}

MokiSlide.prototype._runCallback = function (callback) {
    typeof callback === 'function' && callback();
}

MokiSlide.prototype._handlerResize = function () {
    this.offsetWidthOfSlide = this.slideItems[0].offsetWidth + (this.opt.gap * (this.opt.slidesPerPage - 1));
    this.offsetHeightOfSlide = this.slideItems[0].offsetHeight + (this.opt.gap * (this.opt.slidesPerPage - 1));
    this.dragDistance = this.isVertical
        ? this.offsetHeightOfSlide * this.opt.verticalThreshold
        : this.offsetWidthOfSlide * this.opt.horizontalThreshold;
    this.gotoSlide(this.currentIndex, true);
}

// ---- Utils ----- 
function removesClass(els, className) {
    if (els && typeof className === 'string') {
        els.forEach(el => el.classList.remove(className));
    }
}

function normalizeStringProps(target) {
    Object.keys(target).forEach(key => {
        if (typeof target[key] === 'string') {
            target[key] = target[key].trim().toLowerCase();
        }
    });
    return target;
}

function createButton(className, innerText) {
    const newButton = document.createElement('button');
    newButton.className = className;
    newButton.innerText = innerText;
    newButton.type = "button";
    return newButton;
}



