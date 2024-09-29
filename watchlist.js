const navigate = document.querySelector('.navigate');
const content = document.querySelector('#content');
let watchlist = localStorage.getItem("watchlist") ? JSON.parse(localStorage.getItem("watchlist")) : [];
let watchlistCount = localStorage.getItem("watchlist-count") ? parseInt(localStorage.getItem("watchlist-count")) : 0;

// Function to set mode based on user preference stored in local storage
const setMode = () => {
    const mode = localStorage.getItem('mode');
    const resultsText = document.querySelector('.results-text');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        navigate.classList.add('light-mode');
        content.classList.add('light-mode');
        if (resultsText) {
            resultsText.classList.add('light-mode');
        }
    } else {
        document.body.classList.remove('light-mode');
        navigate.classList.remove('light-mode');
        content.classList.remove('light-mode'); 
        if (resultsText) {
            resultsText.classList.remove('light-mode');
        }
    }
}

// Call setMode function when the page loads
window.addEventListener('load', setMode);

const updateWatchlist = (movieTitle) => {
    // Find the index of the movie to be removed from the watchlist
    const indexToRemove = watchlist.findIndex(movie => movie.Title === movieTitle);

    if (indexToRemove !== -1) {
        // Remove the movie from the watchlist array
        watchlist.splice(indexToRemove, 1);
        watchlistCount--;

        // Update local storage with the modified watchlist
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        localStorage.setItem("watchlist-count", watchlistCount);
        
        // Re-render the watchlist with the updated content
        renderWatchlist();
    }
}

const renderWatchlist = () => {
    // Clear the content of the watchlist section
    content.innerHTML = '';
    content.classList = '';

    if (watchlist.length === 0) {
        // If there are no movies in the watchlist, display default text
        content.classList.add('start-style');
        content.innerHTML = '<h3>No movies in watchlist!</h3>';
    } else {
        content.classList.add('search-style');
        // Iterate over each movie in the watchlist and display its details
        watchlist.forEach((movie, index) => {
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
    
        content.innerHTML += `<p class="results-text">Displaying ${watchlist.length} / ${watchlist.length} movies in watchlist`;
    }

    // Call setMode to ensure the mode remains consistent
    setMode();
}

// Call this function once when the page loads to render the watchlist
renderWatchlist();

// Add functionality to "Remove Watchlist" Button
document.addEventListener("click", (e) => {
    const removeButton = e.target.closest('.add-btn');

    if (removeButton) {
        const movieTitle = removeButton.getAttribute('id');
        updateWatchlist(movieTitle); // Call updateWatchlist with movie title to remove
    }
});

updateWatchlist();
