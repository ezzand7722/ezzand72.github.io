async function searchYouTubeVideo(searchQuery) {
    const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
    const maxResults = 1; // We only want the first result
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&key=${API_KEY}&maxResults=${maxResults}&type=video`
        );
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            return videoUrl;
        } else {
            throw new Error('No videos found');
        }
    } catch (error) {
        console.error('Error searching YouTube:', error);
        throw error;
    }
}

// Example usage:
// searchYouTubeVideo('never gonna give you up')
//     .then(url => console.log('Video URL:', url))
//     .catch(error => console.error('Error:', error)); 