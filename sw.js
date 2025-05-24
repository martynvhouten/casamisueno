const CACHE_NAME = 'casa-mi-sueno-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/huis.html',
    '/omgeving.html',
    '/fotos.html',
    '/reserveren.html',
    '/contact.html',
    '/faq.html',
    '/huisregels.html',
    '/wegbeschrijving.html',
    '/css/style.css',
    '/js/script.js',
    '/manifest.json',
    '/images/favicon.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
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
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
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