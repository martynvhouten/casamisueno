const CACHE_NAME = 'casa-mi-sueno-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/contact-form.js',
    '/js/image-gallery.js',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'submit-form') {
        event.waitUntil(syncFormData());
    }
});

// Handle offline form submissions
async function syncFormData() {
    try {
        const formData = await getFormData();
        if (formData) {
            await submitFormData(formData);
            await clearFormData();
        }
    } catch (error) {
        console.error('Error syncing form data:', error);
    }
}

// Get stored form data
async function getFormData() {
    const cache = await caches.open('form-data');
    return cache.match('pending-submission');
}

// Submit form data to server
async function submitFormData(formData) {
    const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formData
    });
    return response.json();
}

// Clear stored form data
async function clearFormData() {
    const cache = await caches.open('form-data');
    return cache.delete('pending-submission');
}

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Bekijk details',
                icon: '/images/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Sluiten',
                icon: '/images/icons/xmark.png'
            },
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Casa Mi Sueño', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
}); 