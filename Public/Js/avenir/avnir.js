const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
let currentMonthIndex = 3; 
let currentYear = 2026;
let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];
function saveTransactions() {
    localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
}
const btnSubmit=document.getElementById("btn-add-charge");
if(btnSubmit){
   let type="avenir";
    const title=prompt("Entrez le titre de l'avenir");
    const amount =prompt("entrez montant");
    const category=prompt("Entrez le categories");
     if (title && !isNaN(amount) && amount > 0) {
            transactions.push({
                id: Date.now(),
                title, amount, category,
                type: type,
                monthIndex: currentMonthIndex,
                year: currentYear,
                date: Date.now()
            });
            saveTransactions();
}
}
// up date display
function refresh() {
    const dateDisplay = document.getElementById("current-date");
    if (dateDisplay) dateDisplay.textContent = months[currentMonthIndex];

const tableBody = document.getElementById("transactions-list");
const monthlyData = transactions.filter(t => t.monthIndex === currentMonthIndex && t.year === currentYear);
const sumValuAvenir=monthlyData.filter(t => t.type === "avenir");
const aPayerMoi=sumValuAvenir.reduce((sum, t) => sum + t.amount, 0);
document.getElementById(total-to-pay).textContent=`${aPayerMoi.localString()} Ar`;

}