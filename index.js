// --- Utilities ---
const fmt = (value) => {
    return (
        'R$ ' +
        Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
};

// --- Simulador ---
const expensesEl = document.getElementById('expenses');
const addBtn = document.getElementById('addExpense');
const newCat = document.getElementById('newCat');
const newVal = document.getElementById('newVal');
const incomeEl = document.getElementById('income');
const calcBtn = document.getElementById('calc');
const resetBtn = document.getElementById('reset');
const totalExpEl = document.getElementById('totalExp');
const balanceEl = document.getElementById('balance');
const pieCanvas = document.getElementById('pieChart');
const pieCtx = pieCanvas.getContext('2d');

// initial expenses example
const defaultExpenses = [
    { cat: 'Alimentação', val: 700 },
    { cat: 'Aluguel/Financiamento', val: 900 },
    { cat: 'Transporte', val: 250 },
    { cat: 'Contas (água, luz, internet)', val: 220 },
];

function renderExpenses(list) {
    expensesEl.innerHTML = '';
    list.forEach((e, idx) => {
        const row = document.createElement('div');
        row.className = 'expense-row';
        row.innerHTML = `
      <input data-idx="${idx}" class="cat" type="text" value="${e.cat}" aria-label="Categoria ${idx + 1}" />
      <input data-idx="${idx}" class="val" type="number" step="0.01" value="${e.val}" aria-label="Valor da despesa ${idx + 1}" />
      <button class="btn ghost remove" data-idx="${idx}" type="button">Remover</button>
    `;
        expensesEl.appendChild(row);
    });
}

let expenses = JSON.parse(JSON.stringify(defaultExpenses));
renderExpenses(expenses);

addBtn.addEventListener('click', () => {
    const cat = newCat.value.trim() || 'Outra';
    const val = Number(newVal.value) || 0;
    expenses.push({ cat, val });
    newCat.value = '';
    newVal.value = '';
    renderExpenses(expenses);
});

expensesEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
        const i = Number(e.target.dataset.idx);
        expenses.splice(i, 1);
        renderExpenses(expenses);
    }
});

expensesEl.addEventListener('input', (e) => {
    const idx = e.target.dataset.idx;
    if (idx == null) return;
    const row = expenses[idx];
    if (e.target.classList.contains('cat')) row.cat = e.target.value;
    if (e.target.classList.contains('val')) row.val = Number(e.target.value);
});

function calculate() {
    const income = Number(incomeEl.value) || 0;
    const totalExp = expenses.reduce((s, x) => s + (Number(x.val) || 0), 0);
    const balance = income - totalExp;
    totalExpEl.textContent = fmt(totalExp);
    balanceEl.textContent = fmt(balance);
    drawPie(expenses, totalExp);
}

calcBtn.addEventListener('click', calculate);

resetBtn.addEventListener('click', () => {
    incomeEl.value = '0';
    expenses = [];
    renderExpenses(expenses);
    totalExpEl.textContent = fmt(0);
    balanceEl.textContent = fmt(0);
    pieCtx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);
});

// --- Pie chart (simple) ---
function drawPie(items, total) {
    const ctx = pieCtx;
    const w = pieCanvas.width;
    const h = pieCanvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!items.length || total <= 0) return;

    const colors = ['#0b74da', '#1e90ff', '#4db6ff', '#82cfff', '#aee0ff', '#66b2ff', '#b3d9ff'];
    let start = -0.5 * Math.PI;
    items.forEach((it, i) => {
        const slice = (Number(it.val) || 0) / total;
        const end = start + slice * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 10, start, end);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        start = end;
    });

    ctx.font = '12px system-ui';
    ctx.fillStyle = '#111';
    let ly = 12;
    items.slice(0, 6).forEach((it, i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(10, h - 70 + ly, 10, 10);
        ctx.fillStyle = '#111';
        ctx.fillText(`${it.cat} — ${Math.round((it.val / total) * 100)}%`, 28, h - 60 + ly);
        ly += 16;
    });
}

// --- Infographic bars ---
const barsData = [2300, 1700, 4200, 3800, 3000];
const regions = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

function renderBars() {
    const container = document.getElementById('bars');
    const max = Math.max(...barsData);
    container.innerHTML = '';
    barsData.forEach((v, i) => {
        const b = document.createElement('div');
        b.className = 'bar';
        const heightPercent = Math.round((v / max) * 100);
        b.style.height = (heightPercent > 6 ? heightPercent : 6) + '%';
        const span = document.createElement('span');
        span.innerHTML = `<strong>${regions[i]}</strong><br>${fmt(v)}`;
        b.appendChild(span);
        container.appendChild(b);
    });
}

renderBars();
calculate();

newVal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
        e.preventDefault();
    }
});