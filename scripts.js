document.addEventListener("DOMContentLoaded", () => {
    const pokemonForm = document.getElementById("pokemonForm");
    const pokemonList = document.getElementById("pokemonList");
    const toast = document.getElementById("toast");
    const tabs = document.querySelectorAll(".tab-link");
    const bottomNav = document.querySelector(".bottom-nav");
    const modal = document.getElementById("pokemonDetailModal");
    const closeButton = modal.querySelector(".close");
    let editMode = false;
    let editDexNumber = null;

    // Load Pokémon types and other dropdowns into form
    const loadPokemonTypes = () => {
        const types = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
        const typeSelectors = [document.getElementById("type1"), document.getElementById("type2"), document.getElementById("type3")];
        typeSelectors.forEach(selector => {
            types.forEach(type => {
                let option = document.createElement("option");
                option.value = type.toLowerCase();
                option.text = type;
                selector.appendChild(option);
            });
        });
    };

    const loadGrowthRates = () => {
        const growthRates = ["Erratic", "Fluctuating", "Medium Fast", "Medium Slow", "Slow"];
        const growthRateSelector = document.getElementById("growthRate");
        growthRates.forEach(rate => {
            let option = document.createElement("option");
            option.value = rate.toLowerCase().replace(/ /g, "-");
            option.text = rate;
            growthRateSelector.appendChild(option);
        });
    };

    const loadRarities = () => {
        const rarities = ["Common", "Uncommon", "Pseudo Legendary", "Legendary", "Mythical"];
        const raritySelector = document.getElementById("rarity");
        rarities.forEach(rarity => {
            let option = document.createElement("option");
            option.value = rarity.toLowerCase().replace(/ /g, "-");
            option.text = rarity;
            raritySelector.appendChild(option);
        });
    };

    // Load Pokémon from local storage and display
    const loadPokemons = () => {
        let pokemons = JSON.parse(localStorage.getItem("pokemons")) || [];
        pokemons = pokemons.filter(pokemon => pokemon.dexNumber > 0); // Filter out invalid Dex numbers
        pokemons.sort((a, b) => a.dexNumber - b.dexNumber); // Sort by Dex number
        pokemonList.innerHTML = "";
        pokemons.forEach(pokemon => createPokemonCard(pokemon));
    };

    // Create a Pokémon card and add it to the list
    const createPokemonCard = (pokemon) => {
        const card = document.createElement("div");
        card.classList.add("pokemon-card", `type-${pokemon.types[0]}`, `rarity-${pokemon.rarity.toLowerCase().replace(/ /g, "-")}`);
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h3 class="type-${pokemon.types[0]}">${pokemon.name}</h3>
            <p>Dex No: ${pokemon.dexNumber}</p>
        `;
        card.addEventListener("click", () => openPokemonDetailModal(pokemon));
        pokemonList.appendChild(card);
    };

    // Show toast notifications for success or error messages
    const showToast = (message, type) => {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.opacity = 1;
        setTimeout(() => {
            toast.style.opacity = 0;
        }, 3000);
    };

    // Save or update Pokémon information
   const savePokemon = (e) => {
    e.preventDefault();

    // Get the form elements
    const nameElem = document.getElementById("pokemonName");
    const dexNumberElem = document.getElementById("dexNumber");
    const imageElem = document.getElementById("pokemonImage");
    const type1Elem = document.getElementById("type1");
    const type2Elem = document.getElementById("type2");
    const type3Elem = document.getElementById("type3");
    const categoryElem = document.getElementById("category");
    const rarityElem = document.getElementById("rarity");
    const growthRateElem = document.getElementById("growthRate");
    const strongAgainstElem = document.getElementById("strongAgainst");
    const weakAgainstElem = document.getElementById("weakAgainst");
    const descriptionElem = document.getElementById("description");

    // Check if any element is missing
    if (!nameElem || !dexNumberElem || !imageElem || !type1Elem || !categoryElem || !rarityElem || !growthRateElem) {
        showToast("Form elements are missing.", "error");
        return;
    }

    const name = nameElem.value.trim();
    const dexNumber = parseInt(dexNumberElem.value.trim(), 10);
    const image = imageElem.value.trim();
    const type1 = type1Elem.value;
    const type2 = type2Elem.value;
    const type3 = type3Elem.value;
    const category = categoryElem.value.trim();
    const rarity = rarityElem.value;
    const growthRate = growthRateElem.value;
    const strongAgainst = strongAgainstElem ? strongAgainstElem.value.trim() : '';
    const weakAgainst = weakAgainstElem ? weakAgainstElem.value.trim() : '';
    const description = descriptionElem ? descriptionElem.value.trim() : '';

    if (!name || isNaN(dexNumber) || !image || !type1 || !rarity || !growthRate || !category) {
        showToast("Please fill in all required fields.", "error");
        return;
    }

    let pokemons = JSON.parse(localStorage.getItem("pokemons")) || [];
    if (editMode) {
        // Update existing Pokémon
        pokemons = pokemons.map(pokemon => {
            if (pokemon.dexNumber === editDexNumber) {
                return {
                    name,
                    dexNumber,
                    image,
                    types: [type1, type2, type3].filter(Boolean),
                    rarity,
                    growthRate,
                    category,
                    strongAgainst: strongAgainst.split(",").map(s => s.trim()),
                    weakAgainst: weakAgainst.split(",").map(w => w.trim()),
                    description // Update description
                };
            }
            return pokemon;
        });
        showToast("Pokémon updated successfully!", "success");
    } else {
        // Add new Pokémon
        if (pokemons.find(pokemon => pokemon.dexNumber === dexNumber)) {
            showToast("A Pokémon with this Dex Number already exists.", "error");
            return;
        }
        pokemons.push({
            name,
            dexNumber,
            image,
            types: [type1, type2, type3].filter(Boolean),
            rarity,
            growthRate,
            category,
            strongAgainst: strongAgainst.split(",").map(s => s.trim()),
            weakAgainst: weakAgainst.split(",").map(w => w.trim()),
            description // Add description
        });
        showToast("Pokémon added successfully!", "success");
    }

    localStorage.setItem("pokemons", JSON.stringify(pokemons));
    loadPokemons();  // Reload Pokémon list
    clearForm();  // Clear the form
};

    // Clear the form and reset state
    const clearForm = () => {
        pokemonForm.reset();
        editMode = false;
        editDexNumber = null;
        document.getElementById("formTitle").textContent = "Add Pokémon";
    };

    // Open the form to edit a Pokémon
    const editPokemon = (dexNumber) => {
        const pokemons = JSON.parse(localStorage.getItem("pokemons"));
        const pokemon = pokemons.find(p => p.dexNumber === dexNumber);
        if (pokemon) {
            document.getElementById("pokemonName").value = pokemon.name;
            document.getElementById("dexNumber").value = pokemon.dexNumber;
            document.getElementById("pokemonImage").value = pokemon.image;
            document.getElementById("type1").value = pokemon.types[0] || '';
            document.getElementById("type2").value = pokemon.types[1] || '';
            document.getElementById("type3").value = pokemon.types[2] || '';
            document.getElementById("category").value = pokemon.category || '';
            document.getElementById("rarity").value = pokemon.rarity;
            document.getElementById("growthRate").value = pokemon.growthRate;
            document.getElementById("strongAgainst").value = pokemon.strongAgainst.join(', ') || '';
            document.getElementById("weakAgainst").value = pokemon.weakAgainst.join(', ') || '';
            document.getElementById("description").value = pokemon.description || ''; // Load description
            editMode = true;
            editDexNumber = dexNumber;
            document.getElementById("formTitle").textContent = "Edit Pokémon";
            document.getElementById("pokemonForm").scrollIntoView(); // Scroll to the form
        }
    };

    // Open Pokémon detail modal
    const openPokemonDetailModal = (pokemon) => {
        const modalContent = document.getElementById("pokemonDetailContent");
        modalContent.innerHTML = `
            <span class="close">X</span>
            <img src="${pokemon.image}" alt="${pokemon.name}" style="width: 150px; height: 150px; object-fit: cover; margin-bottom: 1rem;">
            <h3>${pokemon.name}</h3>
            <p>Dex No: ${pokemon.dexNumber}</p>
            <p>Types: ${pokemon.types.map(type => `<span class="type-${type}">${type}</span>`).join(', ')}</p>
            <p>Category: ${pokemon.category}</p>
            <p>Rarity: <span class="rarity-${pokemon.rarity.toLowerCase().replace(/ /g, "-")}">${pokemon.rarity}</span></p>
            <p>Growth Rate: ${pokemon.growthRate}</p>
            <p>Strong Points: ${pokemon.strongAgainst.length > 0 ? pokemon.strongAgainst.join(', ') : 'None'}</p>
            <p>Weaknesses: ${pokemon.weakAgainst.length > 0 ? pokemon.weakAgainst.join(', ') : 'None'}</p>
            <p>Description: ${pokemon.description || 'No description available.'}</p>
            <button id="deleteBtn" class="btn delete-btn">Delete Pokémon</button>
        `;
        document.querySelector(".modal").style.display = "flex"; // Show the modal
        document.querySelector(".close").addEventListener("click", closePokemonDetailModal);
        document.getElementById("deleteBtn").addEventListener("click", () => deletePokemon(pokemon.dexNumber));
    };

    // Close the Pokémon detail modal
    const closePokemonDetailModal = () => {
        document.querySelector(".modal").style.display = "none"; // Hide the modal
    };

    // Delete a Pokémon
    const deletePokemon = (dexNumber) => {
        if (confirm("Are you sure you want to delete this Pokémon?")) {
            let pokemons = JSON.parse(localStorage.getItem("pokemons"));
            pokemons = pokemons.filter(pokemon => pokemon.dexNumber !== dexNumber);
            localStorage.setItem("pokemons", JSON.stringify(pokemons));
            showToast("Pokémon deleted successfully!", "success");
            loadPokemons();
            closePokemonDetailModal();
        }
    };

   // Initialize tabs
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");

        if (tab.dataset.tab === "viewPokemon") {
            loadPokemons(); // Load and display Pokémon cards only in the "View Pokémon" tab
        } else {
            pokemonList.innerHTML = ""; // Clear the Pokémon list when not in the "View Pokémon" tab
        }
    });
});

// Initialize bottom navigation similarly
bottomNav.addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-link")) {
        tabs.forEach(tab => tab.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
        document.getElementById(e.target.dataset.tab).classList.add("active");
        e.target.classList.add("active");

        if (e.target.dataset.tab === "viewPokemon") {
            loadPokemons(); // Load and display Pokémon cards only in the "View Pokémon" tab
        } else {
            pokemonList.innerHTML = ""; // Clear the Pokémon list when not in the "View Pokémon" tab
        }
    }
});


    // Form submission
    pokemonForm.addEventListener("submit", savePokemon);

    // Close modal when clicking the close button or outside the modal
    closeButton.addEventListener("click", closePokemonDetailModal);
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closePokemonDetailModal();
        }
    });

    // Load types, growth rates, rarities, and Pokémon data on page load
    loadPokemonTypes();
    loadGrowthRates();
    loadRarities();
    loadPokemons();
});

