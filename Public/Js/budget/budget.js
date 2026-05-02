
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentMonthIndex = 3; 
let currentYear = 2026;
let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];
function saveTransactions() {
    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
}
let currentTransactionType = "expense";
//  NAVIGATION DES MOIS (Budget)
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");

if (btnNext) {
    btnNext.addEventListener("click", () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) { 
            currentMonthIndex = 0; 
            currentYear++; 
        }
        refreshBudgetUI(); 
    });
}

if (btnPrev) {
    btnPrev.addEventListener("click", () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) { 
            currentMonthIndex = 11; 
            currentYear--; 
        }
        refreshBudgetUI(); 
    });
}
//  GESTION DU TYPE (Income/Expense) 
const btnExp = document.getElementById("type-expense");
const btnInc = document.getElementById("type-income");

if (btnExp && btnInc) {
    btnExp.onclick = () => { 
        currentTransactionType = "expense"; 
        btnExp.classList.add('active'); 
        btnInc.classList.remove('active'); 
    };
    btnInc.onclick = () => { 
        currentTransactionType = "income"; 
        btnInc.classList.add('active'); 
        btnExp.classList.remove('active'); 
    };
}

//  AJOUT DE TRANSACTION 
const btnSubmit = document.getElementById("btn-submit");
if (btnSubmit) {
    btnSubmit.addEventListener("click", () => {
        const title = document.getElementById("input-libelle").value;
        const amount = parseFloat(document.getElementById("input-montant").value);
        const category = document.getElementById("input-categorie").value;
        const date = document.getElementById("input-date").value;

        if (title && !isNaN(amount) && amount > 0) {
            transactions.push({
                id: Date.now(),
                title, amount, category,
                type: currentTransactionType,
                monthIndex: currentMonthIndex,
                year: currentYear,
                date: date || new Date().toISOString().split('T')[0]
            });
            
            saveTransactions();

           
            refreshBudgetUI();
            document.getElementById("input-libelle").value = "";
            document.getElementById("input-montant").value = "";
        }
    });
}

//  MISE À JOUR DE LA TABLE 
function refreshBudgetUI() {
    const dateDisplay = document.getElementById("current-date");
    if (dateDisplay) dateDisplay.textContent = months[currentMonthIndex];

const tableBody = document.getElementById("transactions-list");
const monthlyData = transactions.filter(t => t.monthIndex === currentMonthIndex && t.year === currentYear);

const expenseTx = monthlyData.filter(t => t.type === "expense");

const incomeTx = monthlyData.filter(t => t.type === "income"); 

const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
const netBalance = totalIncome - totalExpense;

document.getElementById("transaction-count").textContent = `${expenseTx.length} Transactions`;
document.getElementById("solde-net").textContent = `${netBalance.toLocaleString()} AR`;
    if (tableBody) {
        tableBody.innerHTML = "";
        monthlyData.forEach(t => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${t.date}</td>
                <td>${t.title}</td>
                <td><span class="badge">${t.category}</span></td>
                <td class="${t.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} Ar
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}
refreshBudgetUI();