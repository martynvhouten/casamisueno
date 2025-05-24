// User behavior analytics implementation
document.addEventListener('DOMContentLoaded', () => {
    // Track clicks
    document.addEventListener('click', (e) => {
        const target = e.target;
        const data = {
            event_category: 'Click',
            event_label: target.tagName.toLowerCase(),
            value: 1
        };

        // Add more specific data based on element type
        if (target.tagName === 'A') {
            data.event_label = 'Link Click';
            data.link_text = target.textContent.trim();
            data.link_url = target.href;
        } else if (target.tagName === 'BUTTON') {
            data.event_label = 'Button Click';
            data.button_text = target.textContent.trim();
        } else if (target.tagName === 'INPUT' && target.type === 'submit') {
            data.event_label = 'Form Submit';
            data.form_id = target.form ? target.form.id : 'unknown';
        }

        // Send to analytics
        if (typeof gtag === 'function') {
            gtag('event', 'click', data);
        }
    });

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            if (typeof gtag === 'function') {
                gtag('event', 'form_submit', {
                    event_category: 'Form',
                    event_label: form.id || 'unknown',
                    value: 1
                });
            }
        });

        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('focus', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'form_field_focus', {
                        event_category: 'Form',
                        event_label: field.name || field.id || 'unknown',
                        value: 1
                    });
                }
            });
        });
    });

    // Track scroll depth
    let scrollDepthTriggered = new Set();
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        [25, 50, 75, 90].forEach(depth => {
            if (scrollPercent >= depth && !scrollDepthTriggered.has(depth)) {
                scrollDepthTriggered.add(depth);
                if (typeof gtag === 'function') {
                    gtag('event', 'scroll_depth', {
                        event_category: 'Scroll',
                        event_label: `${depth}%`,
                        value: 1
                    });
                }
            }
        });
    });

    // Track time on page
    let startTime = Date.now();
    setInterval(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        if (timeSpent % 30 === 0) { // Track every 30 seconds
            if (typeof gtag === 'function') {
                gtag('event', 'time_on_page', {
                    event_category: 'Engagement',
                    event_label: `${timeSpent} seconds`,
                    value: timeSpent
                });
            }
        }
    }, 1000);

    // Track mouse movement
    let lastMove = Date.now();
    let moveCount = 0;
    document.addEventListener('mousemove', () => {
        moveCount++;
        const now = Date.now();
        if (now - lastMove > 1000) { // Track every second
            if (typeof gtag === 'function') {
                gtag('event', 'mouse_movement', {
                    event_category: 'Engagement',
                    event_label: 'Mouse Movement',
                    value: moveCount
                });
            }
            moveCount = 0;
            lastMove = now;
        }
    });

    // Track copy events
    document.addEventListener('copy', () => {
        if (typeof gtag === 'function') {
            gtag('event', 'content_copy', {
                event_category: 'Engagement',
                event_label: 'Content Copy',
                value: 1
            });
        }
    });

    // Track print events
    window.addEventListener('beforeprint', () => {
        if (typeof gtag === 'function') {
            gtag('event', 'print_page', {
                event_category: 'Engagement',
                event_label: 'Print Page',
                value: 1
            });
        }
    });
}); 