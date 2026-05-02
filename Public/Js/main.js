
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "October", "Novembre", "Décembre"];
let currentMonthIndex = 3; 
let currentYear = 2026;
let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];
//  NAVIGATION DES MOIS (Dashboard) 
const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");

if (btnNext) {
    btnNext.addEventListener("click", () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) { 
            currentMonthIndex = 0; 
            currentYear++; 
        }
        refreshDashboardUI(); 
    });
}

if (btnPrev) {
    btnPrev.addEventListener("click", () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) { 
            currentMonthIndex = 11; 
            currentYear--; 
        }
        refreshDashboardUI(); 
    });
}   
// Fonction de sauvegarde globale
function saveTransactions() {
    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
}
function refreshDashboardUI() {
    saveTransactions();

    //  Affichage de la date
    const dateDisplay = document.getElementById("current-date");
    if (dateDisplay) {
        dateDisplay.textContent = `${months[currentMonthIndex]} ${currentYear}`;
    }
    //  Filtrage des données
    const monthlyData = transactions.filter(t => t.monthIndex === currentMonthIndex && t.year === currentYear);
    const incomeTx = monthlyData.filter(t => t.type === "income");
    const expenseTx = monthlyData.filter(t => t.type === "expense");
    const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    //  Stats par catégories (pour le Donut)
    const categoryStats = { "Logement": 0, "Transport": 0, "Loisirs": 0, "Alimentation": 0 };
    expenseTx.forEach(t => {
        if (categoryStats.hasOwnProperty(t.category)) categoryStats[t.category] += t.amount;
    });
    //  Mise à jour des valeurs HTML
    document.getElementById("balance-value").textContent = `${netBalance.toLocaleString()} Ar`;
    document.getElementById("income-value").textContent = `${totalIncome.toLocaleString()} Ar`;
    document.getElementById("expense-value").textContent = `${totalExpense.toLocaleString()} Ar`;
    document.getElementById("expense-value").textContent = `${totalExpense.toLocaleString()} Ar`;
    document.getElementById("income-count").textContent = `${incomeTx.length} entrée${incomeTx.length > 1 ? 's' : ''} ce mois`;
    document.getElementById("expense-count").textContent = `${expenseTx.length} transaction${expenseTx.length > 1 ? 's' : ''}`;
    
    //  Mise à jour du graphique Donut
    const donut = document.getElementById("donut-gradient");
    if (donut && totalExpense > 0) {
         document.getElementById("total-donut").textContent =`${totalExpense.toLocaleString()} Ar`;
         document.getElementById("val-logement").textContent = `${categoryStats["Logement"].toLocaleString()} Ar`;
         document.getElementById("val-transport").textContent = `${categoryStats["Transport"].toLocaleString()} Ar`;
         document.getElementById("val-loisirs").textContent = `${categoryStats["Loisirs"].toLocaleString()} Ar`;
         document.getElementById("val-alimentation").textContent = `${categoryStats["Alimentation"].toLocaleString()} Ar`;
        
        
        const pLog = (categoryStats["Logement"] / totalExpense) * 100;
        const pTrans = (categoryStats["Transport"] / totalExpense) * 100;
        const pLois = (categoryStats["Loisirs"] / totalExpense) * 100;
        const pAlim= (categoryStats["Alimentation"]/totalExpense)*100;
        donut.style.background = `conic-gradient(
            var(--primary) 0% ${pLog}%, 
            var(--success) ${pLog}% ${pLog + pTrans}%, 
            var(--warning) ${pLog + pTrans}% ${pLog + pTrans + pLois}%, 
            var(--purple) ${pLog + pTrans + pLois}% 100%
        )`;
    } else if (donut) {
        donut.style.background = `#edf2f7`;
    }
}

// Initialisation au chargement
refreshDashboardUI();