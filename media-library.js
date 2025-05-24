// Media library implementation
class MediaLibrary {
    constructor() {
        this.images = [];
        this.videos = [];
        this.documents = [];
    }

    // Load media from JSON file
    async loadMedia() {
        try {
            const response = await fetch('/content/media.json');
            const data = await response.json();
            this.images = data.images || [];
            this.videos = data.videos || [];
            this.documents = data.documents || [];
        } catch (error) {
            console.error('Error loading media:', error);
        }
    }

    // Save media to JSON file
    async saveMedia() {
        try {
            const response = await fetch('/content/media.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    images: this.images,
                    videos: this.videos,
                    documents: this.documents
                })
            });
            if (!response.ok) {
                throw new Error('Failed to save media');
            }
        } catch (error) {
            console.error('Error saving media:', error);
        }
    }

    // Add image
    addImage(image) {
        this.images.push(image);
        this.saveMedia();
    }

    // Add video
    addVideo(video) {
        this.videos.push(video);
        this.saveMedia();
    }

    // Add document
    addDocument(document) {
        this.documents.push(document);
        this.saveMedia();
    }

    // Remove image
    removeImage(imageId) {
        this.images = this.images.filter(image => image.id !== imageId);
        this.saveMedia();
    }

    // Remove video
    removeVideo(videoId) {
        this.videos = this.videos.filter(video => video.id !== videoId);
        this.saveMedia();
    }

    // Remove document
    removeDocument(documentId) {
        this.documents = this.documents.filter(document => document.id !== documentId);
        this.saveMedia();
    }

    // Get image by ID
    getImage(imageId) {
        return this.images.find(image => image.id === imageId);
    }

    // Get video by ID
    getVideo(videoId) {
        return this.videos.find(video => video.id === videoId);
    }

    // Get document by ID
    getDocument(documentId) {
        return this.documents.find(document => document.id === documentId);
    }

    // Get all images
    getAllImages() {
        return this.images;
    }

    // Get all videos
    getAllVideos() {
        return this.videos;
    }

    // Get all documents
    getAllDocuments() {
        return this.documents;
    }
}

// Create media library instance
const mediaLibrary = new MediaLibrary();

// Load media when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    mediaLibrary.loadMedia();
});

// Export media library instance
window.mediaLibrary = mediaLibrary; 