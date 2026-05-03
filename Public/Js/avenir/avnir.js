const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentMonthIndex = 4; // Mai
let currentYear = 2026;
let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];

// DOM Elements
const modal = document.getElementById('modal-container');
const btnOpen = document.getElementById('btn-add-charge');
const btnClose = document.getElementById('btn-modal-close');
const btnSave = document.getElementById('btn-modal-save');

// Modal Logic
if (btnOpen) btnOpen.onclick = () => modal.style.display = 'flex';
if (btnClose) btnClose.onclick = () => { modal.style.display = 'none'; clearInputs(); };

function clearInputs() {
    document.getElementById('in-title').value = '';
    document.getElementById('in-amount').value = '';
    document.getElementById('in-category').value = '';
}

function saveTransactions() {
    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
}

// Enregistrer
if (btnSave) {
    btnSave.addEventListener("click", function() {
        const title = document.getElementById('in-title').value;
        const amount = document.getElementById('in-amount').value;
        const category = document.getElementById('in-category').value;

        if (title && !isNaN(amount) && amount > 0) {
            transactions.push({
                id: Date.now(),
                title: title, 
                amount: parseFloat(amount),
                category: category || "Général",
                type: "avenir",
                monthIndex: currentMonthIndex,
                year: currentYear,
                date: Date.now()
            });

            saveTransactions();
            refresh(); 
            modal.style.display = 'none';
            clearInputs();
        } else {
            alert("Informations invalides.");
        }
    });
}

function refresh() {
    const dateDisplay = document.getElementById("current-date");
    if (dateDisplay) dateDisplay.textContent = months[currentMonthIndex];

    const monthlyAvenir = transactions.filter(t => 
        t.monthIndex === currentMonthIndex && 
        t.year === currentYear && 
        t.type === "avenir"
    );

    const aPayerMoi = monthlyAvenir.reduce((sum, t) => sum + Number(t.amount), 0);
    const endCount = (1500000 - aPayerMoi);

    document.getElementById("total-to-pay").textContent = `${aPayerMoi.toLocaleString()} Ar`;
    document.getElementById("projected-balance").textContent = `${endCount.toLocaleString()} Ar`;

    const paymentDisplay = document.getElementById("next-payment-name");
    const dateDisplayAvenir = document.getElementById("next-payment-date");

    if (monthlyAvenir.length > 0) {
        paymentDisplay.textContent = monthlyAvenir[0].title;
        const d = new Date(monthlyAvenir[0].id);
        dateDisplayAvenir.textContent = `${d.getDate()} ${months[currentMonthIndex]}`;
    }

    const listContainer = document.getElementById("upcoming-list");
    if (listContainer) {
        listContainer.innerHTML = ""; 
        monthlyAvenir.forEach(t => {
            const dateObj = new Date(t.id);
            const jour = String(dateObj.getDate()).padStart(2, '0');
            const mois = months[t.monthIndex].substring(0, 3).toUpperCase();

            const itemDiv = document.createElement("div");
            itemDiv.className = "timeline-item"; 
            itemDiv.innerHTML = `
                <div class="date">${jour} ${mois}</div>
                <div class="dot bg-red"></div>
                <div class="item-info">
                    <h4>${t.title}</h4>
                    <p>${t.category} • Prélèvement</p>
                </div>
                <div class="item-amount danger">-${Number(t.amount).toLocaleString()} Ar</div>
            `;
            listContainer.appendChild(itemDiv);
        });
    }
}

refresh();