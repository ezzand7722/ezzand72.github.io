function searchYouTube(searchQuery) {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
} 