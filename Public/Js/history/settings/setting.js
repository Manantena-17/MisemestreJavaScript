document.addEventListener('DOMContentLoaded', () => {
    let categories = JSON.parse(localStorage.getItem('financeCategories')) || [
        { id: 1, name: 'Logement', color: 'primary', subCats: ['Loyer', 'Charges'] },
        { id: 2, name: 'Transport', color: 'success', subCats: ['Carburant', 'Bus'] },
        { id: 3, name: 'Alimentation', color: 'purple', subCats: ['Courses'] },
        { id: 4, name: 'Loisirs', color: 'warning', subCats: ['Cinéma'] }
    ];

    let activeCategoryId = categories.length > 0 ? categories[0].id : null;

    const categoryListContainer = document.querySelector('.category-items');
    const editFormTitle = document.querySelector('.category-edit-card h2');
    const inputName = document.querySelector('.input-light');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const subCatListContainer = document.querySelector('.sub-cat-list');
    const btnSave = document.querySelector('.btn-save');

    const colorMapping = {
        'blue': 'primary', 'green': 'success', 'orange': 'warning',
        'purple': 'purple', 'red': 'danger', 'dark-gray': 'text-muted'
    };

    function renderCategoryList() {
        categoryListContainer.innerHTML = '';
        categories.forEach(cat => {
            const row = document.createElement('div');
            row.className = `category-row ${cat.id === activeCategoryId ? 'active' : ''}`;
            row.innerHTML = `
                <span class="dot bg-${cat.color}"></span>
                <span class="cat-name">${cat.name}</span>
                <span class="sub-count">${cat.subCats.length} sous-cat.</span>
            `;
            row.onclick = () => selectCategory(cat.id);
            categoryListContainer.appendChild(row);
        });
    }

    function selectCategory(id) {
        activeCategoryId = id;
        const cat = categories.find(c => c.id === id);
        if (!cat) return;
        editFormTitle.innerText = `Modifier : ${cat.name}`;
        inputName.value = cat.name;
        renderSubCategories(cat.subCats);
        renderCategoryList();
    }

    function renderSubCategories(subCats) {
        subCatListContainer.innerHTML = '';
        subCats.forEach((sub, index) => {
            const item = document.createElement('div');
            item.className = 'sub-cat-item';
            item.innerHTML = `<span>${sub}</span><button class="btn-delete-small" data-index="${index}">×</button>`;
            subCatListContainer.appendChild(item);
        });
    }

    btnSave.addEventListener('click', () => {
        if (!activeCategoryId) return;
        const cat = categories.find(c => c.id === activeCategoryId);
        const oldName = cat.name;
        const newName = inputName.value.trim();

        const selectedColorElement = document.querySelector('.color-swatch.active');
        if (selectedColorElement) {
            const rawColor = [...selectedColorElement.classList].find(c => c !== 'color-swatch' && c !== 'active');
            cat.color = colorMapping[rawColor] || rawColor;
        }

        cat.name = newName;
        localStorage.setItem('financeCategories', JSON.stringify(categories));

        if (oldName !== newName) {
            let transactions = JSON.parse(localStorage.getItem("ar_finance_data")) || [];
            transactions = transactions.map(t => {
                if (t.category === oldName) t.category = newName;
                return t;
            });
            localStorage.setItem("ar_finance_data", JSON.stringify(transactions));
        }

        alert('Paramètres sauvegardés !');
        renderCategoryList();
    });

    renderCategoryList();
    if (activeCategoryId) selectCategory(activeCategoryId);
});
