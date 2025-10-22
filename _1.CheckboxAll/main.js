const checkAllElement = document.querySelector('#checkAll');
const countChecked = document.querySelector('#count-checked');
const list = document.querySelector('#taskList');
const items = document.querySelectorAll('.item');

if (checkAllElement.checked) {
    handlerAllChecked({ target: checkAllElement });
}

// Update Count Checked
handlerSummary();

// Checkbox all
checkAllElement.addEventListener('change', handlerAllChecked);

// Checkbox item
items.forEach((item) => {
    item.addEventListener('change', handlerItemChecked);
});


function handlerItemChecked(event) {
    handlerSummary();
}

function handlerAllChecked(event) {
    const isChecked = event.target.checked;
    items.forEach((item) => {
        item.checked = isChecked;
    });
    handlerSummary();
}

function handlerSummary() {
    const result = { count: 0, isAllChecked: true };
    items.forEach((item) => {
        result.isAllChecked = result.isAllChecked && item.checked
        result.count += item.checked ? 1 : 0;
    });

    if (result.isAllChecked && result.count) {
        checkAllElement.indeterminate = false;
        checkAllElement.checked = true;
    } else if (result.count) {
        checkAllElement.indeterminate = true;
    }
    countChecked.innerHTML = `Checked: ${result.count}`;
}