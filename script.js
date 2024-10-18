document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('search');
    const modal = document.getElementById('previewModal');
    const modalImg = document.getElementById('modalImg');
    const modalVideo = document.getElementById('modalVideo');
    const downloadBtn = document.getElementById('downloadBtn');
    const closePreview = document.getElementById('closePreview');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    const API_KEY = 'XJZvXgwY7inF8m2rBUVTPWx3wgDCF3dm6NudAuoGAGYtBKtnPlmm59sq';  // Replace with your Pexels API key
    const GIPHY_API_KEY = 'HIHkMLUGfhnfLAa17fhqPyti2mYtTXiz'; // Replace with your Giphy API key

    let query = '';  // Keeps track of the current search query
    let page = 1;  // Current page for loading more items
    let loading = false;  // Prevents multiple requests at the same time
    let currentType = 'wallpapers'; // Current type of media being displayed
    let currentDownloadUrl = ''; // Stores the current download URL for the modal

    // Load 100 default wallpapers on page load (5 pages x 20 items)
    loadWallpapers(page, 5); // Load 100 items (5 pages)

    // Search functionality
    searchBtn.addEventListener('click', () => {
        query = searchInput.value.trim();  // Trim input
        page = 1;  // Reset to first page when searching
        gallery.innerHTML = '';  // Clear the gallery for new search results
        
        // Check the current type and load accordingly
        if (currentType === 'wallpapers') {
            loadWallpapers(page, 1);  // Load only 20 wallpapers for searches
        } else if (currentType === 'videos') {
            loadVideos(page, 1);  // Load only 20 videos for searches
        } else {
            loadGifs(query, page, 1);  // Load only 20 GIFs for searches
        }
    });

    // Handle "Enter" key press in search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            query = searchInput.value.trim();  // Trim input
            page = 1;  // Reset to first page when searching
            gallery.innerHTML = '';  // Clear the gallery for new search results
            
            // Check the current type and load accordingly
            if (currentType === 'wallpapers') {
                loadWallpapers(page, 1);  // Load only 20 wallpapers for searches
            } else if (currentType === 'videos') {
                loadVideos(page, 1);  // Load only 20 videos for searches
            } else {
                loadGifs(query, page, 1);  // Load only 20 GIFs for searches
            }
        }
    });

    // Tab functionality
    document.getElementById('wallpapersTab').addEventListener('click', () => {
        currentType = 'wallpapers';  // Set current type to wallpapers
        page = 1;  // Reset page for new search
        gallery.innerHTML = '';  // Clear the gallery
        loadWallpapers(page, 5);  // Load wallpapers
        setActiveTab('wallpapersTab');
    });

    document.getElementById('videosTab').addEventListener('click', () => {
        currentType = 'videos';  // Set current type to videos
        page = 1;  // Reset page for new search
        gallery.innerHTML = '';  // Clear the gallery
        loadVideos(page, 5);  // Load videos
        setActiveTab('videosTab');
    });

    // Add event listener for GIF tab
    document.getElementById('gifsTab').addEventListener('click', () => {
        currentType = 'gifs';  // Set current type to GIFs
        page = 1;  // Reset page for new search
        gallery.innerHTML = '';  // Clear the gallery
        loadGifs(query, page, 5);  // Load GIFs (initially load trending)
        setActiveTab('gifsTab');
    });

    // Function to load wallpapers
    function loadWallpapers(page, numPages) {
        loading = true;  // Prevent multiple requests
        // Add shimmer placeholders while loading content
        addShimmerPlaceholders(numPages);
        
        // Loop through the required number of pages and fetch data
        for (let p = 0; p < numPages; p++) {
            const searchUrl = query
                ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page + p}&per_page=20`
                : `https://api.pexels.com/v1/curated?page=${page + p}&per_page=20`;  // Default mix of images
            
            fetch(searchUrl, {
                headers: {
                    Authorization: API_KEY
                }
            })
            .then(response => response.json())
            .then(data => {
                removeShimmerPlaceholders();
                data.photos.forEach(photo => {
                    const item = document.createElement('div');
                    item.classList.add('item');
                    item.innerHTML = `<img src="${photo.src.medium}" alt="${photo.alt}">`;
                    item.addEventListener('click', () => showPreview(photo.src.original, 'image', photo.src.original));
                    gallery.appendChild(item);
                });
                loading = false;  // Allow new content to load when scrolling
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                loading = false;  // Reset loading state on error
            });
        }
    }

    // Function to load videos
    function loadVideos(page, numPages) {
        loading = true;  // Prevent multiple requests
        // Add shimmer placeholders while loading content
        addShimmerPlaceholders(numPages);
        
        // Loop through the required number of pages and fetch data
        for (let p = 0; p < numPages; p++) {
            const searchUrl = query
                ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page + p}&per_page=20`
                : `https://api.pexels.com/videos/popular?page=${page + p}&per_page=20`;  // Default videos
            
            fetch(searchUrl, {
                headers: {
                    Authorization: API_KEY
                }
            })
            .then(response => response.json())
            .then(data => {
                removeShimmerPlaceholders();
                if (data.videos) {
                    data.videos.forEach(video => {
                        const item = document.createElement('div');
                        item.classList.add('item');
                        item.innerHTML = `
                            <video muted preload="metadata" onmouseover="this.play()" onmouseout="this.pause()">
                                <source src="${video.video_files[0].link}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            <div class="play-button">▶</div>`;
                        
                        // Show play button on hover
                        item.addEventListener('mouseover', () => {
                            item.querySelector('.play-button').style.display = 'block';
                        });
                        item.addEventListener('mouseout', () => {
                            item.querySelector('.play-button').style.display = 'none';
                        });
                        
                        // Handle video click
                        item.querySelector('.play-button').addEventListener('click', (event) => {
                            event.stopPropagation();  // Prevent the item click event
                            showPreview(video.video_files[0].link, 'video', video.video_files[0].link);
                        });
                        
                        // Handle item click for video
                        item.addEventListener('click', () => {
                            showPreview(video.video_files[0].link, 'video', video.video_files[0].link);
                        });

                        // Handle video load error
                        item.addEventListener('error', () => {
                            item.innerHTML = '<img src="error-image.jpg" class="error-image" alt="Video failed to load">';
                        });
                        
                        gallery.appendChild(item);
                    });
                } else {
                    console.error('No videos found in response.');
                }
                loading = false;  // Allow new content to load when scrolling
            })
            .catch(err => {
                console.error('Error fetching data:', err);
                loading = false;  // Reset loading state on error
            });
        }
    }

    // Function to load GIFs
    function loadGifs(query, page, numPages) {
        loading = true;  // Prevent multiple requests
        addShimmerPlaceholders(numPages);

        for (let p = 0; p < numPages; p++) {
            const searchUrl = query
                ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&offset=${(page + p - 1) * 20}`
                : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&offset=${(page + p - 1) * 20}`;  // Default trending GIFs
            
            fetch(searchUrl)
                .then(response => response.json())
                .then(data => {
                    removeShimmerPlaceholders();
                    data.data.forEach(gif => {
                        const item = document.createElement('div');
                        item.classList.add('item');
                        item.innerHTML = `<img src="${gif.images.fixed_height.url}" alt="${gif.title}">`;
                        item.addEventListener('click', () => showPreview(gif.images.original.url, 'gif', gif.images.original.url));
                        gallery.appendChild(item);
                    });
                    loading = false;  // Allow new content to load when scrolling
                })
                .catch(err => {
                    console.error('Error fetching GIFs:', err);
                    loading = false;  // Reset loading state on error
                });
        }
    }

    // Show image/video preview in a modal
    function showPreview(src, type, downloadUrl) {
        modal.style.display = 'flex'; // Center modal
        currentDownloadUrl = downloadUrl; // Store the current download URL
        downloadBtn.href = currentDownloadUrl; // Update download button link

        if (type === 'image') {
            modalImg.src = src;
            modalImg.style.display = 'block';
            modalVideo.style.display = 'none';
        } else if (type === 'video') {
            modalVideo.src = src;
            modalVideo.style.display = 'block';
            modalImg.style.display = 'none';
        } else if (type === 'gif') {
            modalImg.src = src;
            modalImg.style.display = 'block';
            modalVideo.style.display = 'none';
        }
    }

    // Copy current download URL to clipboard
    copyUrlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentDownloadUrl).then(() => {
            alert('URL copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    // Close the modal when user clicks the close button
    closePreview.addEventListener('click', () => {
        modal.style.display = 'none';
        modalVideo.pause();
        modalVideo.currentTime = 0; // Reset video to the start
    });

    // Add shimmer placeholders while loading
    function addShimmerPlaceholders(numPages) {
        for (let i = 0; i < numPages * 20; i++) {
            const shimmer = document.createElement('div');
            shimmer.classList.add('shimmer');
            gallery.appendChild(shimmer);
        }
    }

    // Remove shimmer placeholders
    function removeShimmerPlaceholders() {
        const shimmerItems = document.querySelectorAll('.shimmer');
        shimmerItems.forEach(item => {
            item.remove();
        });
    }

    // Set active tab
    function setActiveTab(activeTabId) {
        const tabs = document.querySelectorAll('.tabs button');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(activeTabId).classList.add('active');
    }
});
