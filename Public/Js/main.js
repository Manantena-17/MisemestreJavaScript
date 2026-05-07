const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentMonthIndex = 4; 
let currentYear = 2026;
let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];

// mois changement
const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");

if (btnNext) {
    btnNext.addEventListener("click", () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) { currentMonthIndex = 0; currentYear++; }
        refreshDashboardUI(); 
    });
}

if (btnPrev) {
    btnPrev.addEventListener("click", () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) { currentMonthIndex = 11; currentYear--; }
        refreshDashboardUI(); 
    });
}   

function saveTransactions() {
    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
}

function refreshDashboardUI() {
    saveTransactions();

    // date
    const dateDisplay = document.getElementById("current-date");
    if (dateDisplay) {
        dateDisplay.textContent = `${months[currentMonthIndex]} ${currentYear}`;
    }

    // filtrage de donne
    const monthlyData = transactions.filter(t => t.monthIndex === currentMonthIndex && t.year === currentYear);
    
    const incomeTx = monthlyData.filter(t => t.type === "income");
    const expenseTx = monthlyData.filter(t => t.type === "expense");
    const monthlyAvenir = monthlyData.filter(t => t.type === "avenir"); // On définit monthlyAvenir ici

    const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // stat par categories
    const categoryStats = { "Logement": 0, "Transport": 0, "Loisirs": 0, "Alimentation": 0 };
    expenseTx.forEach(t => {
        if (categoryStats.hasOwnProperty(t.category)) categoryStats[t.category] += t.amount;
    });

    // valeur html
    document.getElementById("balance-value").textContent = `${netBalance.toLocaleString()} Ar`;
    document.getElementById("income-value").textContent = `${totalIncome.toLocaleString()} Ar`;
    document.getElementById("expense-value").textContent = `${totalExpense.toLocaleString()} Ar`;
    document.getElementById("income-count").textContent = `${incomeTx.length} entrée${incomeTx.length > 1 ? 's' : ''} ce mois`;
    document.getElementById("expense-count").textContent = `${expenseTx.length + incomeTx.length} transaction${(expenseTx.length + incomeTx.length) > 1 ? 's' : ''}`;

    // mise a jour de a venir
    const listContainer = document.getElementById("upcoming-list");
    if (listContainer) {
        listContainer.innerHTML = ""; 
        if (monthlyAvenir.length === 0) {
            listContainer.innerHTML = '<div class="upcoming-item"><span>Aucun paiement prévu</span></div>';
        } else {
            monthlyAvenir.forEach(t => {
                const dateObj = new Date(t.id || Date.now());
                const jour = String(dateObj.getDate()).padStart(2, '0');
                const moisShort = months[currentMonthIndex].substring(0, 3).toUpperCase();

                const itemDiv = document.createElement("div");
                itemDiv.className = "upcoming-item";
                itemDiv.style.display = "flex";
                itemDiv.style.justifyContent = "space-between";
                itemDiv.style.marginBottom = "10px";
                itemDiv.innerHTML = `
                    <div>
                        <small style="color:gray">${jour} ${moisShort}</small><br>
                        <span>${t.title}</span>
                    </div>
                    <b class="text-danger">-${Number(t.amount).toLocaleString()} Ar</b>
                `;
                listContainer.appendChild(itemDiv);
            });
        }
    }

    // objectif 
    const goalNameLabel = document.getElementById('goal-name');
    const displayPercent = document.getElementById('goal-percentage');
    const goalFill = document.getElementById('goal-fill');
    const goalStatus = document.getElementById('goal-amount-status');

    const savedGoals = JSON.parse(localStorage.getItem("ar_goals_data")) || [];

    if (savedGoals.length > 0) {
        let totalSaved = 0, totalTarget = 0;
        savedGoals.forEach(g => {
            totalSaved += (parseFloat(g.current) || 0);
            totalTarget += (parseFloat(g.target) || 0);
        });
        const percent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
        
        if (goalNameLabel) goalNameLabel.textContent = "Progression Totale"; 
        if (displayPercent) displayPercent.textContent = `${percent}%`;
        if (goalStatus) goalStatus.textContent = `${totalSaved.toLocaleString()} Ar / ${totalTarget.toLocaleString()} Ar`;
        if (goalFill) goalFill.style.width = `${percent}%`;
    } else {
        if (goalStatus) goalStatus.textContent = "Aucun objectif défini";
    }

    
// categorie
    const savedCategories = JSON.parse(localStorage.getItem('financeCategories')) || [];
    
    
   const  categoryStat = {};
    savedCategories.forEach(cat => {
        categoryStat[cat.name] = 0;
    });

    expenseTx.forEach(t => {
        if (categoryStat.hasOwnProperty(t.category)) {
            categoryStat[t.category] += t.amount;
        }
    });

    const donut = document.getElementById("donut-gradient");
    const legendList = document.querySelector(".legend-list");

    if (legendList && savedCategories.length > 0) {
        legendList.innerHTML = ""; 
        let gradientParts = [];
        let currentPercent = 0;

        savedCategories.forEach(cat => {
            const amount = categoryStat[cat.name] || 0;
            const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;

            const li = document.createElement("li");
            li.className = "legend-item";
            li.innerHTML = `
                <span><span class="dot bg-${cat.color}"></span>${cat.name}</span> 
                <b>${amount.toLocaleString()} Ar</b>
            `;
            legendList.appendChild(li);

            if (totalExpense > 0 && percent > 0) {

                const colorValue = `var(--${cat.color})`; 
                gradientParts.push(`${colorValue} ${currentPercent}% ${currentPercent + percent}%`);
                currentPercent += percent;
            }
        });

        if (donut) {
            document.getElementById("total-donut").textContent = `${totalExpense.toLocaleString()} Ar`;
            donut.style.background = (totalExpense > 0 && gradientParts.length > 0)
                ? `conic-gradient(${gradientParts.join(", ")})`
                : "#edf2f7";
        }
    } else if (donut) {
        donut.style.background = `#edf2f7`;
    }

// donut mise a jour 
    // donut = document.getElementById("donut-gradient");
    if (donut && totalExpense > 0) {
        document.getElementById("total-donut").textContent = `${totalExpense.toLocaleString()} Ar`;
        document.getElementById("val-logement").textContent = `${categoryStats["Logement"].toLocaleString()} Ar`;
        document.getElementById("val-transport").textContent = `${categoryStats["Transport"].toLocaleString()} Ar`;
        document.getElementById("val-loisirs").textContent = `${categoryStats["Loisirs"].toLocaleString()} Ar`;
        document.getElementById("val-alimentation").textContent = `${categoryStats["Alimentation"].toLocaleString()} Ar`;
        
        const pLog = (categoryStats["Logement"] / totalExpense) * 100;
        const pTrans = (categoryStats["Transport"] / totalExpense) * 100;
        const pLois = (categoryStats["Loisirs"] / totalExpense) * 100;
        
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

refreshDashboardUI();