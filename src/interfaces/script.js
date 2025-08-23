/*
 * Pokemon Search Logic
 * @author: Jeisson Estuardo Garcia Avila
 * @email: jeissonestuardogarciaavila6@gmail.com
 * @description: Lógica para buscar y mostrar Pokemon usando PokeAPI
 * @date: 23/08/2025
 */

// Elementos del DOM
const pokemonInput = document.getElementById('pokemonInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const loader = document.getElementById('loader');
const pokemonCard = document.getElementById('pokemonCard');
const errorDiv = document.getElementById('error');

// Event listeners
searchBtn.addEventListener('click', handleSearch);
randomBtn.addEventListener('click', getRandomPokemon);
pokemonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Función principal de búsqueda
async function handleSearch() {
    const query = pokemonInput.value.trim().toLowerCase();
    if (!query) {
        showError('Por favor ingresa el nombre o número de un Pokémon');
        return;
    }
    
    await searchPokemon(query);
}

// Conectar con PokeAPI
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

// Mostrar Pokemon en la interfaz
function displayPokemon(pokemon) {
    // Llenar información básica
    document.getElementById('pokemonImg').src = pokemon.getMainImage();
    document.getElementById('pokemonImg').alt = pokemon.name;
    document.getElementById('pokemonName').textContent = pokemon.name;
    document.getElementById('pokemonId').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    
    // Mostrar tipos
    const typesContainer = document.getElementById('pokemonTypes');
    typesContainer.innerHTML = '';
    pokemon.getTypeNames().forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = `type-badge type-${type}`;
        typeSpan.textContent = type;
        typesContainer.appendChild(typeSpan);
    });
    
    // Mostrar detalles
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
    
    // Limpiar input y mostrar tarjeta
    pokemonInput.value = '';
    showPokemonCard();
}

// Crear elemento de estadística
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

// Pokémon aleatorio
function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    searchPokemon(randomId.toString());
}

// Funciones de interfaz
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
}
