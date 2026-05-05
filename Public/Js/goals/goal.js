document.addEventListener('DOMContentLoaded', () => {
 
    const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    

    const modal = document.getElementById('modal-goal');
    const btnOpen = document.getElementById('btn-new-goal');
    const btnClose = document.querySelector('.close-btn');
    const btnCancel = document.getElementById('btn-cancel');
    const goalForm = document.getElementById('form-goal');
    const goalsContainer = document.getElementById('goals-container');


    const toggleModal = (show) => {
        if (modal) {
            modal.style.display = show ? 'flex' : 'none';
        }
    };

    if (btnOpen) btnOpen.onclick = () => toggleModal(true);
    if (btnClose) btnClose.onclick = () => toggleModal(false);
    if (btnCancel) btnCancel.onclick = () => toggleModal(false);

    window.onclick = (e) => {
        if (e.target === modal) toggleModal(false);
    };


    function updateGlobalStats() {
        const cards = document.querySelectorAll('.goal-card');
        let totalSaved = 0;
        let activeGoals = 0;
        let totalTarget = 0;

        cards.forEach(card => {
            // Extraction des montants depuis le texte (méthode robuste)
            const amountText = card.querySelector('.amount').textContent.replace(/\s/g, '').replace('Ar', '');
            const targetText = card.querySelector('.target').textContent.match(/(\d[\d\s]*)\s?Ar/);
            
            const current = parseFloat(amountText);
            const target = targetText ? parseFloat(targetText[1].replace(/\s/g, '')) : 0;

            totalSaved += current;
            totalTarget += target;
            
            if (!card.classList.contains('status-attaint')) {
                activeGoals++;
            }
        });

     
        const displayTotal = document.getElementById('global-total-saved');
        const displayCount = document.getElementById('active-goals-count');
        const displayPercent = document.getElementById('global-progress-percent');

        if (displayTotal) displayTotal.textContent = `${totalSaved.toLocaleString()} Ar`;
        if (displayCount) displayCount.textContent = `${activeGoals} / ${cards.length}`;
        if (displayPercent && totalTarget > 0) {
            const globalProgress = Math.round((totalSaved / totalTarget) * 100);
            displayPercent.textContent = `${globalProgress} %`;
        }
    }

    if (goalsContainer) {
        goalsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-money')) {
                const card = e.target.closest('.goal-card');
                const amountEl = card.querySelector('.amount');
                const percentEl = card.querySelector('.percent');
                const ringBar = card.querySelector('.progress-ring-bar');
                
    
                const targetMatch = card.querySelector('.target').textContent.match(/(\d[\d\s]*)\s?Ar/);
                const target = parseFloat(targetMatch[1].replace(/\s/g, ''));

                let current = parseFloat(amountEl.textContent.replace(/\s/g, '').replace('Ar', ''));
                current += 100000;

                if (current >= target) {
                    current = target;
                    card.classList.add('status-attaint');
                    e.target.textContent = "Archiver";
                    e.target.className = "btn-archive";
                }

           
                amountEl.textContent = `${current.toLocaleString()} Ar`;
                const newPercent = Math.round((current / target) * 100);
                percentEl.textContent = `${newPercent}%`;
                
        
                const offset = 201 - (newPercent / 100) * 201;
                ringBar.style.strokeDashoffset = offset;

                updateGlobalStats();
            }
        });
    }

    if (goalForm) {
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('goal-name').value;
            const targetValue = document.getElementById('goal-target-amount').value;
            const dateValue = document.getElementById('goal-date').value;

            if (!name || !targetValue) return;

            const target = parseFloat(targetValue);
            
            const newCard = document.createElement('div');
            newCard.className = 'goal-card';
            newCard.innerHTML = `
                <div class="goal-header">
                    <h3>${name}</h3>
                    <span class="deadline">Échéance : ${dateValue}</span>
                </div>
                <div class="goal-body">
                    <div class="progress-circle-container">
                        <svg class="progress-ring" width="80" height="80">
                            <circle class="progress-ring-bg" stroke="#f1f5f9" stroke-width="8" fill="transparent" r="32" cx="40" cy="40"/>
                            <circle class="progress-ring-bar" stroke="#4361ee" stroke-width="8" stroke-dasharray="201" stroke-dashoffset="201" fill="transparent" r="32" cx="40" cy="40"/>
                        </svg>
                        <span class="percent">0%</span>
                    </div>
                    <div class="goal-details">
                        <span class="label">ÉPARGNÉ</span>
                        <div class="amount">0 Ar</div>
                        <span class="target">sur ${target.toLocaleString()} Ar (objectif)</span>
                        <span class="monthly-add text-success">+ 0 Ar ce mois</span>
                    </div>
                    <button class="btn-add-money">+ 100 000 Ar</button>
                </div>
            `;

            goalsContainer.appendChild(newCard);
            updateGlobalStats();
            toggleModal(false);
            goalForm.reset();
        });
    }

  
    updateGlobalStats();
});