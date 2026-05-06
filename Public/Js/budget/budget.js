const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentMonthIndex = new Date().getMonth(); 
let currentYear = 2026;
let currentTransactionType = "expense";
// Charger les données
let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];

function saveTransactions() {
    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
}

// Sélecteurs d'éléments
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const btnExp = document.getElementById("type-expense");
const btnInc = document.getElementById("type-income");
const btnSubmit = document.getElementById("btn-submit");

// NAVIGATION DES MOIS
btnNext.onclick = () => {
    currentMonthIndex++;
    if (currentMonthIndex > 11) { currentMonthIndex = 0; currentYear++; }
    refreshBudgetUI();
};

btnPrev.onclick = () => {
    currentMonthIndex--;
    if (currentMonthIndex < 0) { currentMonthIndex = 11; currentYear--; }
    refreshBudgetUI();
};

// GESTION DU TYPE (Dépense / Revenu)
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

// AJOUTER OU MODIFIER UNE TRANSACTION
btnSubmit.onclick = () => {
    const title = document.getElementById("input-libelle").value;
    const amount = parseFloat(document.getElementById("input-montant").value);
    const category = document.getElementById("input-categorie").value;
    const date = document.getElementById("input-date").value;
    const editId = document.getElementById("edit-id").value;

    if (title && !isNaN(amount) && amount > 0) {
        if (editId) {
            // Mode Edition : On remplace l'existante
            const index = transactions.findIndex(t => t.id == editId);
            transactions[index] = { ...transactions[index], title, amount, category, date, type: currentTransactionType };
        } else {
            // Mode Ajout
            transactions.push({
                id: Date.now(),
                title, amount, category,
                type: currentTransactionType,
                monthIndex: currentMonthIndex,
                year: currentYear,
                date: date || new Date().toISOString().split('T')[0]
            });
        }
        
        resetForm();
        saveTransactions();
        refreshBudgetUI();
    } else {
        alert("Veuillez remplir correctement les champs.");
    }
};

// SUPPRIMER
function deleteTransaction(id) {
    if (confirm("Supprimer cette transaction ?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        refreshBudgetUI();
    }
}


function editTransaction(id) {
    const t = transactions.find(tx => tx.id === id);
    if (!t) return;

    document.getElementById("input-libelle").value = t.title;
    document.getElementById("input-montant").value = t.amount;
    document.getElementById("input-categorie").value = t.category;
    document.getElementById("input-date").value = t.date;
    document.getElementById("edit-id").value = t.id;
    
    currentTransactionType = t.type;
    if (t.type === "income") {
        btnInc.click();
    } else {
        btnExp.click();
    }

    document.getElementById("form-title").textContent = "Modifier la transaction";
    btnSubmit.textContent = "Mettre à jour";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function resetForm() {
    document.getElementById("input-libelle").value = "";
    document.getElementById("input-montant").value = "";
    document.getElementById("edit-id").value = "";
    document.getElementById("form-title").textContent = "Nouvelle transaction";
    btnSubmit.textContent = "Ajouter la transaction";
}

// MISE À JOUR DE L'INTERFACE
function refreshBudgetUI() {
    document.getElementById("current-date").textContent = `${months[currentMonthIndex]} ${currentYear}`;
    const tableBody = document.getElementById("transactions-list");
    
    const monthlyData = transactions.filter(t => t.monthIndex === currentMonthIndex && t.year === currentYear);

    let totalIncome = 0;
    let totalExpense = 0;

    if (tableBody) {
        tableBody.innerHTML = "";
        monthlyData.forEach(t => {
            if (t.type === "income") totalIncome += t.amount;
            else totalExpense += t.amount;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${t.date}</td>
                <td>${t.title}</td>
                <td><span class="badge">${t.category}</span></td>
                <td class="${t.type === 'income' ? 'text-success' : 'text-danger'} text-right">
                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} Ar
                </td>
                <td class="text-right">
                    <button onclick="editTransaction(${t.id})" class="btn-edit">✏️</button>
                    <button onclick="deleteTransaction(${t.id})" class="btn-delete">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    const netBalance = totalIncome - totalExpense;
    document.getElementById("transaction-count").textContent = `${monthlyData.length} Transactions`;
    const soldeEl = document.getElementById("solde-net");
    soldeEl.textContent = `${netBalance.toLocaleString()} Ar`;
    soldeEl.className = netBalance >= 0 ? "value text-success" : "value text-danger";
}

refreshBudgetUI();