/*
 * @author: Jose Alvarado
 */


const pokemonInput = document.getElementById('pokemonInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const loader = document.getElementById('loader');
const pokemonCard = document.getElementById('pokemonCard');
const errorDiv = document.getElementById('error');


searchBtn.addEventListener('click', handleSearch);
randomBtn.addEventListener('click', getRandomPokemon);
pokemonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const query = pokemonInput.value.trim().toLowerCase();
    if (!query) {
        showError('Por favor ingresa el nombre o número de un Pokémon');
        return;
    }
    
    await searchPokemon(query);
}


async function searchPokemon(query) {
    showLoader();
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        
        if (!response.ok) {
            throw new Error('Pokémon no encontrado');
        }
        
        const pokemonData = await response.json();
        
        if (validatePokemonData(pokemonData)) {
            const pokemon = new Pokemon(pokemonData);
            displayPokemon(pokemon);
        } else {
            throw new Error('Datos del Pokémon inválidos');
        }
        
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}


function displayPokemon(pokemon) {

    document.getElementById('pokemonImg').src = pokemon.getMainImage();
    document.getElementById('pokemonImg').alt = pokemon.name;
    document.getElementById('pokemonName').textContent = pokemon.name;
    document.getElementById('pokemonId').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    

    const typesContainer = document.getElementById('pokemonTypes');
    typesContainer.innerHTML = '';
    pokemon.getTypeNames().forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = `type-badge type-${type}`;
        typeSpan.textContent = type;
        typesContainer.appendChild(typeSpan);
    });
    

    document.getElementById('pokemonHeight').textContent = pokemon.getFormattedHeight();
    document.getElementById('pokemonWeight').textContent = pokemon.getFormattedWeight();
    
    // Mostrar estadísticas básicas
    const statsContainer = document.getElementById('pokemonStats');
    statsContainer.innerHTML = '<h3>Estadísticas Base</h3>';
    
    const mainStats = ['hp', 'attack', 'defense', 'speed'];
    mainStats.forEach(statName => {
        const statValue = pokemon.getStatValue(statName);
        const statDiv = createStatElement(statName, statValue);
        statsContainer.appendChild(statDiv);
    });
    

    pokemonInput.value = '';
    showPokemonCard();
}


function createStatElement(name, value) {
    const statDiv = document.createElement('div');
    statDiv.className = 'stat-item';
    
    statDiv.innerHTML = `
        <span class="stat-name">${name}</span>
        <div class="stat-bar">
            <div class="stat-fill" style="width: ${Math.min(value/2, 100)}%"></div>
        </div>
        <span class="stat-value">${value}</span>
    `;
    
    return statDiv;
}


function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    searchPokemon(randomId.toString());
}


function showLoader() {
    hideAll();
    loader.classList.remove('hidden');
}

function showPokemonCard() {
    hideAll();
    pokemonCard.classList.remove('hidden');
}

function showError(message) {
    hideAll();
    errorDiv.innerHTML = `<p>${message} 😞</p>`;
    errorDiv.classList.remove('hidden');
}

function hideAll() {
    loader.classList.add('hidden');
    pokemonCard.classList.add('hidden');
    errorDiv.classList.add('hidden');
}

// Funciones auxiliares (importar de pokemon.js si es posible)
class Pokemon {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.height = data.height;
        this.weight = data.weight;
        this.types = data.types;
        this.sprites = data.sprites;
        this.stats = data.stats;
    }

    getFormattedHeight() {
        return (this.height / 10).toFixed(1) + ' m';
    }

    getFormattedWeight() {
        return (this.weight / 10).toFixed(1) + ' kg';
    }

    getTypeNames() {
        return this.types.map(type => type.type.name);
    }

    getMainImage() {
        return this.sprites.other['official-artwork'].front_default || 
               this.sprites.front_default;
    }

    getStatValue(statName) {
        const stat = this.stats.find(s => s.stat.name === statName);
        return stat ? stat.base_stat : 0;
    }
}

function validatePokemonData(data) {
    return data && data.name && data.id && data.sprites;


let searchHistory = JSON.parse(localStorage.getItem('pokemonHistory')) || [];


const originalDisplayPokemon = displayPokemon;
displayPokemon = function(pokemon) {
    originalDisplayPokemon(pokemon);
    

    addToHistory(pokemon);
    

    displayAdvancedStats(pokemon);
    
  
    showStatComparison(pokemon);
};


function addToHistory(pokemon) {
    const historyItem = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.getMainImage(),
        timestamp: new Date().toLocaleString(),
        types: pokemon.getTypeNames()
    };
    

    searchHistory = searchHistory.filter(item => item.id !== pokemon.id);
    

    searchHistory.unshift(historyItem);
    

    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }

    localStorage.setItem('pokemonHistory', JSON.stringify(searchHistory));
    

    updateHistoryUI();
}


function displayAdvancedStats(pokemon) {
    const statsContainer = document.getElementById('pokemonStats');
    statsContainer.innerHTML = '<h3>Estadísticas Completas</h3>';
    
    const allStats = [
        { name: 'hp', label: 'HP' },
        { name: 'attack', label: 'Ataque' },
        { name: 'defense', label: 'Defensa' },
        { name: 'special-attack', label: 'At. Especial' },
        { name: 'special-defense', label: 'Def. Especial' },
        { name: 'speed', label: 'Velocidad' }
    ];
    
    allStats.forEach(stat => {
        const statValue = pokemon.getStatValue(stat.name);
        const statDiv = createAdvancedStatElement(stat.label, statValue, stat.name);
        statsContainer.appendChild(statDiv);
    });
    

    const totalStats = allStats.reduce((sum, stat) => sum + pokemon.getStatValue(stat.name), 0);
    const totalDiv = createTotalStatsElement(totalStats);
    statsContainer.appendChild(totalDiv);

    setTimeout(animateStatBars, 300);
}


function createAdvancedStatElement(label, value, statName) {
    const statDiv = document.createElement('div');
    statDiv.className = 'stat-item';
    

    let barColor = '#ff6b6b';
    if (value >= 70) barColor = '#48dbfb'; 
    else if (value >= 50) barColor = '#feca57'; 
    
    statDiv.innerHTML = `
        <span class="stat-name">${label}</span>
        <div class="stat-bar">
            <div class="stat-fill" data-width="${Math.min((value/200)*100, 100)}" 
                 style="background: ${barColor}; width: 0%;"></div>
        </div>
        <span class="stat-value">${value}</span>
        <span class="stat-rank">${getStatRank(value)}</span>
    `;
    
    return statDiv;
}


function createTotalStatsElement(total) {
    const totalDiv = document.createElement('div');
    totalDiv.className = 'stat-total';
    totalDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; 
                    padding: 15px; background: #667eea; color: white; border-radius: 8px; 
                    margin-top: 15px; font-weight: bold;">
            <span>TOTAL BASE</span>
            <span style="font-size: 1.3em;">${total}</span>
            <span>${getTotalRank(total)}</span>
        </div>
    `;
    return totalDiv;
}


function animateStatBars() {
    const statFills = document.querySelectorAll('.stat-fill');
    statFills.forEach((fill, index) => {
        setTimeout(() => {
            const targetWidth = fill.getAttribute('data-width');
            fill.style.width = targetWidth + '%';
        }, index * 100);
    });
}


function getStatRank(value) {
    if (value >= 150) return '🌟 Legendario';
    if (value >= 120) return '🔥 Excelente';
    if (value >= 90) return '💪 Muy Bueno';
    if (value >= 60) return '👍 Bueno';
    if (value >= 30) return '📈 Regular';
    return '📉 Bajo';
}

function getTotalRank(total) {
    if (total >= 600) return '🏆 Elite';
    if (total >= 500) return '⭐ Fuerte';
    if (total >= 400) return '💎 Sólido';
    if (total >= 300) return '🎯 Decente';
    return '🌱 Básico';
}

function showStatComparison(pokemon) {
    const avgStats = { hp: 70, attack: 80, defense: 75, speed: 70 }; // Promedios aproximados
    
    const comparisonDiv = document.createElement('div');
    comparisonDiv.className = 'stat-comparison';
    comparisonDiv.innerHTML = '<h4>Comparación vs Promedio</h4>';
    
    Object.keys(avgStats).forEach(statName => {
        const pokemonStat = pokemon.getStatValue(statName);
        const avgStat = avgStats[statName];
        const difference = pokemonStat - avgStat;
        const percentage = ((difference / avgStat) * 100).toFixed(1);
        
        const compItem = document.createElement('div');
        compItem.className = 'comparison-item';
        compItem.innerHTML = `
            <span>${statName.toUpperCase()}: ${pokemonStat}</span>
            <span class="${difference >= 0 ? 'positive' : 'negative'}">
                ${difference >= 0 ? '+' : ''}${difference} (${percentage}%)
                ${difference >= 0 ? '📈' : '📉'}
            </span>
        `;
        comparisonDiv.appendChild(compItem);
    });
    
    document.getElementById('pokemonStats').appendChild(comparisonDiv);
}


function updateHistoryUI() {
    let historyContainer = document.getElementById('historyContainer');
    

    if (!historyContainer) {
        historyContainer = document.createElement('div');
        historyContainer.id = 'historyContainer';
        historyContainer.className = 'history-container hidden';
        historyContainer.innerHTML = '<h3>Historial de Búsquedas</h3><div id="historyList"></div>';
        document.querySelector('.container').appendChild(historyContainer);
l
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggleHistoryBtn';
        toggleBtn.className = 'toggle-history-btn';
        toggleBtn.textContent = 'Ver Historial 📋';
        toggleBtn.onclick = toggleHistory;
        document.querySelector('.search-section').appendChild(toggleBtn);
    }
    
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        historyList.innerHTML = '<p>No hay búsquedas recientes</p>';
        return;
    }
    
    searchHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" width="50" height="50">
            <div class="history-info">
                <strong>${item.name}</strong> #${item.id.toString().padStart(3, '0')}
                <div class="history-types">
                    ${item.types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                </div>
                <small>${item.timestamp}</small>
            </div>
            <button onclick="searchPokemon('${item.name}')" class="search-again-btn">Buscar</button>
        `;
        historyList.appendChild(historyItem);
    });
}


function toggleHistory() {
    const historyContainer = document.getElementById('historyContainer');
    const toggleBtn = document.getElementById('toggleHistoryBtn');
    
    if (historyContainer.classList.contains('hidden')) {
        historyContainer.classList.remove('hidden');
        toggleBtn.textContent = 'Ocultar Historial ❌';
    } else {
        historyContainer.classList.add('hidden');
        toggleBtn.textContent = 'Ver Historial 📋';
    }
}

function clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
        searchHistory = [];
        localStorage.removeItem('pokemonHistory');
        updateHistoryUI();
        alert('Historial limpiado');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateHistoryUI();
    
    if (searchHistory.length > 0) {
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Limpiar Historial 🗑️';
        clearBtn.className = 'clear-history-btn';
        clearBtn.onclick = clearHistory;
        clearBtn.style.marginLeft = '10px';
        clearBtn.style.background = '#ff6b6b';
        clearBtn.style.color = 'white';
        
        const toggleBtn = document.getElementById('toggleHistoryBtn');
        if (toggleBtn) {
            toggleBtn.parentNode.insertBefore(clearBtn, toggleBtn.nextSibling);
        }
    }
});
