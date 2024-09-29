const searchInput = document.querySelector('.search-bar');
const searchBar = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');
const navigate = document.querySelector('.navigate');
const content = document.querySelector('#content');
const addBtn = document.querySelector('.add-btn');
const watchlistCountDiv = document.querySelector('.watchlist-count');
let watchlist = localStorage.getItem("watchlist") ? JSON.parse(localStorage.getItem("watchlist")) : [];
let watchlistCount = localStorage.getItem("watchlist-count") ? parseInt(localStorage.getItem("watchlist-count")) : 0;
const main = document.getElementById('main');
const modeToggle = document.getElementById('modeToggle');

const getSearchResults = () => {
    // Fetch the initial search results
    return fetch(`http://www.omdbapi.com/?apikey=383f4ea0&s=${searchInput.value}`)
        .then(res => res.json())
        .then(data => {
            if (data.Search) {
                // Map each movie to a fetch Promise for its details
                const detailPromises = data.Search.map(movie => {
                    return fetch(`http://www.omdbapi.com/?apikey=383f4ea0&t=${movie.Title}`)
                        .then(res => res.json());
                });
                // Use Promise.all to wait for all detail fetches to complete
                return Promise.all(detailPromises);
            } else {
                // Handle the case where no movies were found
                return [];
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            return []; // Return an empty array as a fallback
        });
};

const handleSearch = () => {

    content.innerHTML = ''; // Clear previous search results
    content.classList = '';

    getSearchResults()
        .then(results => {
            if (results.length > 0) {
                content.classList.add('search-style');
                // Iterate over each movie and display its details
                results.forEach(movie => {

                    // Check if the movie is already in the watchlist
                    const isInWatchlist = watchlist.some(item => item.Title === movie.Title);

                    content.innerHTML += `
                    <section class="section">
                        <img class="poster" src="${movie.Poster}" alt="Movie Poster" />
                        <div class="details-flex-col">
                            <div class="details">
                                <h3 class="movie-title">${movie.Title}</h3>
                                <i class="fas fa-star star-icon"></i>
                                <h4>${movie.imdbRating}</h4>
                            </div>
                            <div class="details">
                                <p class="runtime">${movie.Runtime}</p>
                                <p class="genre">${movie.Genre}</p>
                                <div class="add-btn" id="${movie.Title}">
                                    ${isInWatchlist ? `
                                        <i class="fas fa-minus add-icon"></i>
                                        <h4 class="add-watchlist-text">Watchlist</h4>
                                    ` : `
                                        <i class="fas fa-plus add-icon"></i>
                                        <h4 class="add-watchlist-text">Watchlist</h4>
                                    `}
                                </div>
                            </div>
                            <div class="details">
                                <p class="plot">${movie.Plot}</p>
                            </div>
                        </div>
                    </section>
                    <hr />
                `;
                });

                // Add a horizontal rule
                content.innerHTML += `<p class="results-text">Displaying ${results.length}
            / ${results.length} results`;

                // Keep the mode updated when new elements are rendered
                setMode();

                // Attach event listeners to the "Add to Watchlist" buttons
                attachEventListeners(results);
            } else {
                content.classList.add('search-error-style');
                content.innerHTML = "No results found for that title :(";
            }
        })
        .catch(error => {
            console.error("Error in handleSearch:", error);
        });
}

 // Function to set mode based on user preference stored in local storage
const setMode = () => {
    const mode = localStorage.getItem('mode');
    const addIcons = document.querySelectorAll('.add-icon');
    const resultsText = document.querySelector('.results-text');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        searchBtn.classList.add('light-mode');
        searchBar.classList.add('light-mode');
        navigate.classList.add('light-mode');
        content.classList.add('light-mode');
        if (resultsText) {
            resultsText.classList.add('light-mode');
        }
        addIcons.forEach(icon => {
            icon.classList.add('light-mode');
        });
        modeToggle.checked = false;
    } else {
        document.body.classList.remove('light-mode');
        searchBtn.classList.remove('light-mode');
        searchBar.classList.remove('light-mode');
        navigate.classList.remove('light-mode');
        content.classList.remove('light-mode'); 
        if (resultsText) {
            resultsText.classList.remove('light-mode');
        }
        addIcons.forEach(icon => {
            icon.classList.remove('light-mode');
        });
        modeToggle.checked = true;
    }
}

// Call setMode function when the page loads
window.addEventListener('load', setMode);

// Update mode when the toggle is changed
modeToggle.addEventListener('change', () => {
    if (!modeToggle.checked) {
        localStorage.setItem('mode', 'light');
    } else {
        localStorage.setItem('mode', 'dark');
    }
    // Call setMode to update the mode immediately
    setMode();
});

// Function to attach event listeners for "Add to Watchlist" buttons
function attachEventListeners(results) {
    // Add event listener for clicks on the "Add to Watchlist" buttons using event delegation
    document.addEventListener("click", (event) => {
        const addButton = event.target.closest('.add-btn');
        if (addButton && results && Array.isArray(results)) {
            const icon = addButton.querySelector('.add-icon');
            const movieTitle = addButton.getAttribute('id');
            const movieIndex = results.findIndex(movie => movie.Title === movieTitle);
            if (movieIndex !== -1) {
                const movieAdded = results[movieIndex];
                if (icon.classList.contains('fa-plus')) {
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                    // Add the movie to the watchlist
                    watchlist.push(movieAdded);
                    watchlistCount++;
                    localStorage.setItem("watchlist", JSON.stringify(watchlist));
                    localStorage.setItem("watchlist-count", watchlistCount);
                } else {
                    icon.classList.remove('fa-minus');
                    icon.classList.add('fa-plus');
                    // Remove the movie from the watchlist
                    const indexToRemove = watchlist.findIndex(movie => movie.Title === movieTitle);
                    if (indexToRemove !== -1) {
                        watchlist.splice(indexToRemove, 1);
                        watchlistCount--;
                        localStorage.setItem("watchlist", JSON.stringify(watchlist));
                        localStorage.setItem("watchlist-count", watchlistCount);
                    }
                }

                // Update the watchlist count element with the current count
                if (watchlistCount > 0) {
                    watchlistCountDiv.hidden = false;
                    watchlistCountDiv.textContent = watchlistCount;
                } else {
                    watchlistCountDiv.hidden = true;
                }
            }
        }
    });
}

// Call this function once when the page loads to attach the event listeners
window.addEventListener('load', () => {
    attachEventListeners([]);
});

// Update the watchlist count element with the current count
if (watchlistCount > 0) {
    watchlistCountDiv.hidden = false;
    watchlistCountDiv.textContent = watchlistCount;
} else {
    watchlistCountDiv.hidden = true;
}

// Disable scroll restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    // Scroll to the top of the page
    window.scrollTo(0, 0);
});

searchBtn.addEventListener("click", handleSearch);

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});


