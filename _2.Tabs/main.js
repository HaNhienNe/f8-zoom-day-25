const $ = (sel, doc = document) => doc.querySelector(sel);
const $$ = (sel, doc = document) => doc.querySelectorAll(sel);
const mokiTabs = $$('.moki-tabs');

mokiTabs.forEach(mokiTab => {
    mokiTab.addEventListener('click', (e) => {
        e.stopPropagation();
        removesClass(mokiTabs, 'active')
        mokiTab.classList.add('active');
    });

    const mokiTabList = $('.moki-tab-list', mokiTab);
    const mokiTabPanel = $('.moki-tab-panels', mokiTab);
    const tabs = $$('.moki-tab', mokiTabList);
    const panels = $$('.moki-tab-panel', mokiTabPanel);

    if (tabs.length !== panels.length) {
        console.error("The number of tabs does not match the number of panels.")
        return;
    }

    tabs.forEach(tab => tab.addEventListener('click', handlerTab));

    function handlerTab(e) {
        // active tab
        removesClass(tabs, 'active');
        const curentTab = e.target;
        curentTab.classList.add('active');

        // active panel
        const activePanel = getMatchedPanel(curentTab.dataset.for, mokiTabPanel);
        if (activePanel) {
            removesClass(panels, 'active');
            activePanel.classList.add('active');
        }
    }


});

document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    const isTyping = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable;
    if (isTyping) return;

    const charCode = e.key.charCodeAt();
    if (mokiTabs.length < 1) return;
    const isKeyNumber = charCode >= 49 && charCode <= 57;
    if (!isKeyNumber) return;

    const curentMokiTab = getMokiTabActive();

    // active Tabs
    const indexTab = Number(e.key) - 1;
    const tabs = $$('.moki-tab', curentMokiTab)
    const tabActive = tabs[indexTab];
    if (!tabActive) return;

    removesClass(tabs, 'active');
    tabActive.classList.add('active');
    const tabFor = tabActive.dataset.for;

    // active panel
    const panels = $$('.moki-tab-panel', curentMokiTab);
    const activePanel = getMatchedPanel(tabFor, curentMokiTab);
    if (activePanel) {
        removesClass(panels, 'active');
        activePanel.classList.add('active');
    }
});

function getMatchedPanel(panelFor, el) {
    return $(`[data-id="${panelFor}"]`, el);
}

function removesClass(els, className) {
    if (els && typeof className === 'string') {
        els.forEach(el => el.classList.remove(className));
    }
}

function getMokiTabActive() {
    let curentMokiTab = null;
    mokiTabs.forEach((mokitab) => {
        if (mokitab.classList.contains('active')) {
            curentMokiTab = curentMokiTab || mokitab;
        }
    })
    return curentMokiTab ?? mokiTabs[0];
}

