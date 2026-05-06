document.addEventListener('DOMContentLoaded', () => {
    const goalsContainer = document.getElementById('goals-container');
    const goalForm = document.getElementById('form-goal');
    const modal = document.getElementById('modal-goal');

    let goals = JSON.parse(localStorage.getItem("ar_goals_data")) || [];


    const toggleModal = (show) => {
        if (modal) modal.style.display = show ? 'flex' : 'none';
    };

    document.getElementById('btn-new-goal')?.addEventListener('click', () => toggleModal(true));
    document.querySelector('.close-btn')?.addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancel')?.addEventListener('click', () => toggleModal(false));

    function saveGoals() {
        localStorage.setItem("ar_goals_data", JSON.stringify(goals));

        if (typeof refreshDashboardUI === "function") refreshDashboardUI();
    }

    function updateGlobalStats() {
        const displayTotal = document.getElementById('global-total-saved');
        const displayCount = document.getElementById('active-goals-count');
        const displayPercent = document.getElementById('global-progress-percent');
        const mainProgressBar = document.getElementById('goal-fill');

        let totalSaved = 0;
        let totalTarget = 0;
        let activeGoals = 0;

        goals.forEach(goal => {
            totalSaved += goal.current;
            totalTarget += goal.target;
            if (goal.current < goal.target) activeGoals++;
        });

        if (displayTotal) displayTotal.textContent = `${totalSaved.toLocaleString()} Ar`;
        if (displayCount) displayCount.textContent = `${activeGoals} / ${goals.length}`;
        
        if (totalTarget > 0) {
            const globalProgress = Math.round((totalSaved / totalTarget) * 100);
            if (displayPercent) displayPercent.textContent = `${globalProgress}%`;
            if (mainProgressBar) mainProgressBar.style.width = `${globalProgress}%`;
        }
    }
// affichage
    function renderGoals() {
        if (!goalsContainer) return;
        goalsContainer.innerHTML = '';

        goals.forEach((goal, index) => {
            const isAttaint = goal.current >= goal.target;
            const percent = Math.round((goal.current / goal.target) * 100);
            const offset = 201 - (percent / 100) * 201;

            const card = document.createElement('div');
            card.className = `goal-card ${isAttaint ? 'status-attaint' : ''}`;
            card.innerHTML = `
                <div class="goal-header">
                    <h3>${goal.name}</h3>
                    <span class="deadline">Échéance : ${goal.deadline}</span>
                </div>
                <div class="goal-body">
                    <div class="progress-circle-container">
                        <svg class="progress-ring" width="80" height="80">
                            <circle class="progress-ring-bg" stroke="#f1f5f9" stroke-width="8" fill="transparent" r="32" cx="40" cy="40"/>
                            <circle class="progress-ring-bar" stroke="#4361ee" stroke-width="8" stroke-dasharray="201" 
                                    style="stroke-dashoffset: ${offset}" fill="transparent" r="32" cx="40" cy="40"/>
                        </svg>
                        <span class="percent">${percent}%</span>
                    </div>
                    <div class="goal-details">
                        <span class="label">ÉPARGNÉ</span>
                        <div class="amount">${goal.current.toLocaleString()} Ar</div>
                        <span class="target">sur ${goal.target.toLocaleString()} Ar</span>
                    </div>
                    <button class="${isAttaint ? 'btn-archive' : 'btn-add-money'}" data-index="${index}">
                        ${isAttaint ? 'Archiver' : '+ 100 000 Ar'}
                    </button>
                </div>
            `;
            goalsContainer.appendChild(card);
        });
        updateGlobalStats();
    }
    // Ajouter de nouvelle objectif
    goalForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('goal-name').value;
        const target = parseFloat(document.getElementById('goal-target-amount').value);
        const deadline = document.getElementById('goal-date').value;

        if (!name || isNaN(target)) return;

        goals.push({
            name: name,
            target: target,
            current: 0,
            deadline: deadline || "Non définie"
        });

        saveGoals();
        renderGoals();
        toggleModal(false);
        goalForm.reset();
    });


    goalsContainer?.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (index === null) return;

        if (e.target.classList.contains('btn-add-money')) {
            goals[index].current += 100000;
            if (goals[index].current > goals[index].target) {
                goals[index].current = goals[index].target;
            }
        } else if (e.target.classList.contains('btn-archive')) {
           
            goals.splice(index, 1);
        }

        saveGoals();
        renderGoals();
    });

    // premier rendu 
    renderGoals();
});