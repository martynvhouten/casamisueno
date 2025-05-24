// Google Analytics 4 implementation
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace with your actual GA4 measurement ID

// Track page views
document.addEventListener('DOMContentLoaded', () => {
    gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
});

// Track outbound links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.hostname !== window.location.hostname) {
        gtag('event', 'click', {
            event_category: 'Outbound Link',
            event_label: link.href,
            transport_type: 'beacon'
        });
    }
});

// Track form submissions
document.addEventListener('submit', (e) => {
    if (e.target.tagName === 'FORM') {
        gtag('event', 'form_submit', {
            event_category: 'Form',
            event_label: e.target.id || e.target.className
        });
    }
});

// Track scroll depth
let scrollDepthTriggered = new Set();
window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    [25, 50, 75, 90].forEach(depth => {
        if (scrollPercent >= depth && !scrollDepthTriggered.has(depth)) {
            scrollDepthTriggered.add(depth);
            gtag('event', 'scroll_depth', {
                event_category: 'Scroll',
                event_label: `${depth}%`
            });
        }
    });
}); 