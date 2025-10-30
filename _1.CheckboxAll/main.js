const $ = (sel, doc = document) => doc.querySelector(sel);
const $$ = (sel, doc = document) => doc.querySelectorAll(sel);

const mokiRefs = {
    checkboxAll: { sel: '.check-all', val: 'moki-check' },
    checkboxsItem: { sel: '.check-item', val: 'check-item' },
    count: { sel: '.count-checked', val: 'count-checked' },
    main: { sel: '.moki-check', val: 'moki-check' },
}

$$(mokiRefs.main.sel).forEach(mCheckbox => {
    const cAll = $(mokiRefs.checkboxAll.sel, mCheckbox);
    const cCount = $(mokiRefs.count.sel, mCheckbox);
    let cItems = $$(mokiRefs.checkboxsItem.sel, mCheckbox);
    const idFillter = cAll.dataset.id;
    cItems = Array.from(cItems).filter(checkbox => checkbox.dataset.for === idFillter);

    if (cAll.checked) {
        checkedAll(true, cItems);
    }

    cAll.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        cItems.forEach((item) => {
            item.checked = isChecked;
        });
        handlerSummary(cAll, cItems, cCount);
    });

    cItems.forEach((item) => {
        item.addEventListener('change', () => {
            handlerSummary(cAll, cItems, cCount);
        });
    });

    handlerSummary(cAll, cItems, cCount);
});

function checkedAll(isChecked, cItems) {
    cItems.forEach((item) => {
        item.checked = isChecked;
    });
}

function handlerSummary(cAll, citems, cCount) {
    const result = { count: 0, isAllChecked: true };
    citems.forEach((item) => {
        result.isAllChecked = result.isAllChecked && item.checked
        result.count += item.checked ? 1 : 0;
    });

    if (result.isAllChecked && result.count) {
        cAll.indeterminate = false;
        cAll.checked = true;
    } else if (result.count) {
        cAll.indeterminate = true;
    } else {
        cAll.checked = false;
        cAll.indeterminate = false;
    }
    cCount.textContent = `Checked: ${result.count}`;
}
