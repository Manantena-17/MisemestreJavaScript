
const btnPrev = document.querySelector(".btn-prev");
const btnNext = document.querySelector(".btn-next");
const dateDisplay = document.getElementById("current-date");

const balanceValue = document.getElementById("balance-value");
const incomeValue = document.getElementById("income-value");
const expenseValue = document.getElementById("expense-value");
const incomeCount = document.getElementById("income-count");
const expenseCount = document.getElementById("expense-count");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentMonthIndex =0; 
let currentYear = 2026;

let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];


function refreshUI() {

    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));


    dateDisplay.textContent = `${months[currentMonthIndex]} ${currentYear}`;


    const monthlyData = transactions.filter(t => 
        t.monthIndex === currentMonthIndex && t.year === currentYear
    );

    const incomeTx = monthlyData.filter(t => t.type === "income");
    const expenseTx = monthlyData.filter(t => t.type === "expense");

    const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    if (balanceValue) balanceValue.textContent = `${balance.toLocaleString()} Ar`;
    if (incomeValue) incomeValue.textContent = `${totalIncome.toLocaleString()} Ar`;
    if (expenseValue) expenseValue.textContent = `${totalExpense.toLocaleString()} Ar`;

    if (incomeCount) incomeCount.textContent = `${incomeTx.length} entrée${incomeTx.length > 1 ? 's' : ''} ce mois`;
    if (expenseCount) expenseCount.textContent = `${expenseTx.length} transaction${expenseTx.length > 1 ? 's' : ''}`;
}

 
window.addIncome = function(title, amount) {
    if (title && amount) {
        transactions.push({
            id: Date.now(),
            title: title,
            amount: parseFloat(amount),
            type: "income",
            monthIndex: currentMonthIndex,
            year: currentYear
        });
        refreshUI();
    }
};

window.addExpense = function(title, amount) {
    if (title && amount) {
        transactions.push({
            id: Date.now(),
            title: title,
            amount: parseFloat(amount),
            type: "expense",
            monthIndex: currentMonthIndex,
            year: currentYear
        });
        refreshUI();
    }
};


if (btnNext) {
    btnNext.addEventListener("click", () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) { 
            currentMonthIndex = 0; 
            currentYear++; 
        }
        refreshUI();
    });
}

if (btnPrev) {
    btnPrev.addEventListener("click", () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) { 
            currentMonthIndex = 11; 
            currentYear--; 
        }
        refreshUI();
     
    });
}

refreshUI();

const btnAdd = document.querySelector(".btn-add");

if (btnAdd) {
    btnAdd.addEventListener("click", () => {

        const title = prompt("Nom de la transaction (ex: Salaire, Pizza, Loyer) :");
        if (!title) return;
        const amountStr = prompt("Montant en Ar :");
        const amount = parseFloat(amountStr);
        const type = confirm("Est-ce un REVENU ? \n(OK pour Revenu, Annuler pour Dépense)") 
                     ? "income" 
                     : "expense";
        if (!isNaN(amount) && amount > 0) {
            if (type === "income") {
                addIncome(title, amount);
            } else {
                addExpense(title, amount);
            }
            alert(`Ajouté : ${title} (${amount} Ar)`);
        } else {
            alert("Montant invalide ! Veuillez entrer un nombre.");
        }
    });
}
/*
localStorage.removeItem("ar_finance_data");*/
