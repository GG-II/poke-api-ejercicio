/*
 * Pokemon Entity
 * @author: Jeisson Estuardo Garcia Avila
 * @email: jeissonestuardogarciaavila6@gmail.com
 * @description: Modelo de datos y validaciones para Pokemon
 * @date: 23/08/2025
 */

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

// Para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pokemon, validatePokemonData };
}