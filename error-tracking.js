// Error tracking implementation
window.onerror = function(msg, url, lineNo, columnNo, error) {
    // Log error to console
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));

    // Send error to analytics
    if (typeof gtag === 'function') {
        gtag('event', 'error', {
            event_category: 'JavaScript Error',
            event_label: msg,
            value: 1
        });
    }

    // Return false to prevent default error handling
    return false;
};

// Track unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);

    if (typeof gtag === 'function') {
        gtag('event', 'error', {
            event_category: 'Unhandled Promise Rejection',
            event_label: event.reason.toString(),
            value: 1
        });
    }
});

// Track resource loading errors
window.addEventListener('error', function(event) {
    if (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK') {
        console.error('Resource loading error:', event.target.src || event.target.href);

        if (typeof gtag === 'function') {
            gtag('event', 'error', {
                event_category: 'Resource Loading Error',
                event_label: event.target.src || event.target.href,
                value: 1
            });
        }
    }
}, true);

// Track AJAX errors
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;

    xhr.open = function() {
        this._url = arguments[1];
        return originalOpen.apply(this, arguments);
    };

    xhr.send = function() {
        this.addEventListener('error', function() {
            console.error('XHR Error:', this._url);

            if (typeof gtag === 'function') {
                gtag('event', 'error', {
                    event_category: 'XHR Error',
                    event_label: this._url,
                    value: 1
                });
            }
        });

        return originalSend.apply(this, arguments);
    };

    return xhr;
}; 