document.addEventListener('DOMContentLoaded', () => {
    const transactionsBody = document.getElementById('transactions-body');
    const filterCategory = document.getElementById('filter-category');
    const exporterCvs=document.getElementById('btn-export-csv');
    if(exporterCvs){
        exporterCvs.addEventListener("click",()=>{
            const displayData=localStorage.getItem("ar_finance_data");
            const exporter=JSON.parse(displayData) || [];
            if(exporter.length===0){
                alert("Aucune trasaction a exporter");
                return;
            }
            let entete="Date , Titre , Categorie, Montant \n";
                    exporter.forEach(t => {
                    const date = t.date || "05/05/2026";
                    const title = (t.title || "Sans titre").replace(/,/g, " "); 
                    const category = (t.category || "Autre").replace(/,/g, " ");
                    const amount = t.amount || 0;
                    entete += `${date},${title},${category},${amount}\n`;
         });
              const blob = new Blob(["\ufeff" + entete], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "export_finance_ar.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        });    
    }
    function renderTable() {

        const rawData = localStorage.getItem("ar_finance_data");
        const transactions = JSON.parse(rawData) || [];
        
        const selectedCat = filterCategory.value.toLowerCase();
        
        transactionsBody.innerHTML = "";
        let income = 0;
        let expense = 0;

        if (transactions.length === 0) {
            transactionsBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px;">Aucune donnée trouvée dans ar_finance_data</td></tr>';
            return;
        }

        transactions.forEach(t => {
            const title = t.title || "Sans titre";
            const catRaw = t.category || "Autre";
            const tCat = catRaw.toLowerCase().trim();
            const type = (t.type || "").toLowerCase();
            if (selectedCat !== 'all' && tCat !== selectedCat) return;
            let amt = parseFloat(t.amount) || 0;
            const isExpense = type === "expense" || type === "depense" || type === "avenir" || 
                              ["logement", "loisirs", "depense"].includes(tCat);
            
            if (isExpense && amt > 0) amt = -amt;

            if (amt > 0) income += amt;
            else expense += amt;


            const row = document.createElement('tr');
            const catClass = tCat.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            row.innerHTML = `
                <td>${t.date || "05/05/2026"}</td>
                <td>
                    <div style="font-weight:600">${title}</div>
                    <div style="font-size:0.7rem; color:#94a3b8">ID: ${t.id}</div>
                </td>
                <td><span class="cat-pill cat-${catClass}">${catRaw}</span></td>
                <td class="${amt > 0 ? 'amt-pos' : 'amt-neg'}" style="text-align:right">
                    ${amt > 0 ? '+' : ''}${amt.toLocaleString()} Ar
                </td>
            `;
            transactionsBody.appendChild(row);
        });

   
        document.getElementById('stat-total-income').textContent = `+${income.toLocaleString()} Ar`;
        document.getElementById('stat-total-expense').textContent = `${expense.toLocaleString()} Ar`;
        
        const net = income + expense;
        const netEl = document.getElementById('stat-net-balance');
        netEl.textContent = `${net > 0 ? '+' : ''}${net.toLocaleString()} Ar`;
        netEl.className = `stat-value ${net >= 0 ? 'val-income' : 'val-expense'}`;
        
        document.getElementById('pagination-info').textContent = `Total: ${transactionsBody.children.length} opérations`;
    }

    filterCategory.addEventListener('change', renderTable);


    renderTable();
});