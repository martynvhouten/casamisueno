// Performance monitoring implementation
window.addEventListener('load', () => {
    // Get performance metrics
    const performance = window.performance;
    const timing = performance.timing;
    const navigation = performance.navigation;

    // Calculate key metrics
    const metrics = {
        // Navigation timing
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domProcessing: timing.domComplete - timing.domLoading,
        pageLoad: timing.loadEventEnd - timing.navigationStart,
        // Resource timing
        resourceCount: performance.getEntriesByType('resource').length,
        resourceSize: performance.getEntriesByType('resource').reduce((total, resource) => total + resource.transferSize, 0),
        // Navigation type
        navigationType: navigation.type === 0 ? 'navigate' : navigation.type === 1 ? 'reload' : 'back_forward'
    };

    // Log metrics to console
    console.log('Performance metrics:', metrics);

    // Send metrics to analytics
    if (typeof gtag === 'function') {
        gtag('event', 'performance', {
            event_category: 'Performance',
            event_label: 'Page Load',
            value: metrics.pageLoad,
            non_interaction: true
        });

        gtag('event', 'performance', {
            event_category: 'Performance',
            event_label: 'Resource Count',
            value: metrics.resourceCount,
            non_interaction: true
        });

        gtag('event', 'performance', {
            event_category: 'Performance',
            event_label: 'Resource Size',
            value: metrics.resourceSize,
            non_interaction: true
        });
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('Long task detected:', entry);

                if (typeof gtag === 'function') {
                    gtag('event', 'performance', {
                        event_category: 'Performance',
                        event_label: 'Long Task',
                        value: entry.duration,
                        non_interaction: true
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['longtask'] });
    }

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('Layout shift detected:', entry);

                if (typeof gtag === 'function') {
                    gtag('event', 'performance', {
                        event_category: 'Performance',
                        event_label: 'Layout Shift',
                        value: entry.value,
                        non_interaction: true
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor first input delay
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log('First input delay:', entry);

                if (typeof gtag === 'function') {
                    gtag('event', 'performance', {
                        event_category: 'Performance',
                        event_label: 'First Input Delay',
                        value: entry.processingStart - entry.startTime,
                        non_interaction: true
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['first-input'] });
    }
}); 