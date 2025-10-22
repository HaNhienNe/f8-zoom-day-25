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
    direction: 'horizontal',
    gap: 0,

    prevText: '‹',
    nextText: '›',
    showArrows: true,
    showPagination: true,

    startIndex: 0,
    draggable: false,

    onInit: null,
    onChange: null
};

const mokiRefs = {
    slide: '.moki-slide',
    slideItems: '.moki-slide-item',
    pagination: '.moki-pagination',
    paginationItems: '.moki-pagination-item',
    control: '.moki-control',
    prevButton: '.moki-prev',
    nextButton: '.moki-next',
}

function MokiSlide(sel, opt = defaults) {
    this.sel = sel;
    this.opt = Object.assign({}, defaults, opt);
    this._checkParams();
    this._init();
}

MokiSlide.prototype._checkParams = function () {
    // Count slide
    if (this.totalSlideOrigin === 0) {
        console.warn("Slide không được bỏ trống!");
        return;
    }

    if (this.totalSlideOrigin < this.opt.slidesPerPage) {
        console.error("Số lượng slide trên một view, phải nhỏ hơn số lượng slide");
        return;
    }
}

MokiSlide.prototype._init = function () {
    this.container = $(this.sel);
    if (!this.container) {
        console.error('Không tìm thấy phần tử chứa slide!');
        return;
    } else {
        this.container.classList.add('moki-slide-container');
    }

    this.isClicked = false;
    this.slide = $(mokiRefs.slide, this.container);
    this.slideItems = $$(mokiRefs.slideItems, this.slide);
    this.totalSlideOrigin = this.slideItems.length;
    this.currentIndex = this.opt.loop ? this.opt.startIndex + this.opt.slidesPerPage : this.opt.startIndex;

    this.shouldDisableAllControls = false;
    if (this.totalSlideOrigin === this.opt.slidesPerPage) {
        this.currentIndex = 0;
        this.shouldDisableAllControls = true;
    }

    this._cloneSlide();

    this._setBackGroundImage();
    this._setWidthSlide();


    if (this.opt.showPagination) {
        this._createPagination();
    }

    if (this.opt.showArrows) {
        this._createControl();
    }

    if (this.currentIndex !== 0) {
        this.gotoSlide(this.currentIndex, true);
    }

    if (this.opt.autoPlay) {
        this.autoPlay = setInterval(this.nextSlide.bind(this), this.opt.autoPlayDelay);
    }

    this.slide.addEventListener('mouseover', () => {
        if (this.opt.autoPlay && this.opt.pauseOnHover) {
            clearInterval(this.autoPlay);
        }
    })

    this.slide.addEventListener('mouseout', () => {
        if (this.autoPlay && this.opt.pauseOnHover) {
            this.autoPlay = setInterval(this.nextSlide.bind(this), this.opt.autoPlayDelay);
        }
    })

    if (this.opt.draggable) {
        // TODO
    }
}

MokiSlide.prototype._setWidthSlide = function () {
    this.slideItems.forEach(item => {
        item.style.width = `calc(100% / ${this.opt.slidesPerPage})`;
    });
    const gap = this.opt.slidesPerPage > 1 ? this.opt.gap : 0;
    this.slide.style.gap = `${gap}px`;
    this.offsetWidthOfSlide = this.slideItems[0].offsetWidth + (gap * (this.opt.slidesPerPage - 1));
}

// Create Pagination
MokiSlide.prototype._createPagination = function () {
    const pagination = document.createElement('div');
    const countPagination = Math.ceil(this.totalSlideOrigin / this.opt.slidesPerPage);
    pagination.className = 'moki-pagination';

    for (let i = 1; i <= countPagination; i++) {
        const paginationItem = document.createElement('div');
        paginationItem.className = 'moki-pagination-item';
        paginationItem.style.transition = `all ${this.opt.duration}ms ${this.opt.timingFunction}`;
        if (!this.shouldDisableAllControls) {
            paginationItem.addEventListener('click', this._onPagination.bind(this, i * this.opt.slidesPerPage))
        }
        pagination.appendChild(paginationItem);

    }

    this.container.appendChild(pagination);
    this.pagination = $(mokiRefs.pagination, this.container);
    this.paginationItems = $$(mokiRefs.paginationItems, this.pagination);
    this._activePagination();
}

MokiSlide.prototype._onPagination = function (slideIndex) {
    this.currentIndex = slideIndex;
    this.gotoSlide(slideIndex);
    this._activePagination();
}

// Create Control
MokiSlide.prototype._createControl = function () {
    const control = document.createElement('div');
    control.className = 'moki-control';

    const prevButton = createButton('moki-prev', this.opt.prevText);
    if (this.shouldDisableAllControls) {
        prevButton.disabled = true;
    } else {
        prevButton.addEventListener('click', this.prevSlide.bind(this));
    }
    control.appendChild(prevButton);

    const nextButton = createButton('moki-next', this.opt.nextText);
    if (this.shouldDisableAllControls) {
        nextButton.disabled = true;
    } else {
        nextButton.addEventListener('click', this.nextSlide.bind(this));
    }
    control.appendChild(nextButton);
    this.container.appendChild(control);
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
    if (this.opt.showPagination === false) return;
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

MokiSlide.prototype.gotoSlide = function (index, noTransition = false) {
    const cWidth = this.offsetWidthOfSlide * index;
    this.slide.style.transition = noTransition ? 'none' : `all ${this.opt.duration}ms ${this.opt.timingFunction}`;
    this.slide.style.transform = `translateX(-${cWidth}px)`;
    if (!noTransition) {
        setTimeout(() => {
            this.isClicked = false;
        }, this.opt.duration)
    } else {
        this.isClicked = false;
    }
}

MokiSlide.prototype.nextSlide = function () {
    if (this.isClicked) return;
    this.isClicked = true;
    this.currentIndex += this.opt.slidesPerPage;
    this._handlerMoveSlideTarget(true);
}

MokiSlide.prototype.prevSlide = function () {
    if (this.isClicked) return;
    this.isClicked = true;
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
    this.slideItems = $$(mokiRefs.slideItems, this.slide);
}

MokiSlide.prototype._setBackGroundImage = function () {
    this.slideItems.forEach(item => {
        const urlImage = item.dataset.image;
        urlImage && (item.style.backgroundImage = `url(${urlImage})`);
    });
}


// ---- Utils ----- 
function removesClass(els, className) {
    if (els && typeof className === 'string') {
        els.forEach(el => el.classList.remove(className));
    }
}

function createButton(className, innerText) {
    const newButton = document.createElement('button');
    newButton.className = className;
    newButton.innerText = innerText;
    newButton.type = "button";
    return newButton;
}

