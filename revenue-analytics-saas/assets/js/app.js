document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const isDark = html.getAttribute('data-theme') === 'dark';
            html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        });
    }
    if (window.lucide) window.lucide.createIcons();
});

// Global Helper Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
}

function updateKPIs(kpis) {
    if (!kpis) return;
    
    const elTotalRevenue = document.getElementById('totalRevenue');
    if (elTotalRevenue) elTotalRevenue.textContent = formatCurrency(kpis.total_revenue);

    const elAvgOrderValue = document.getElementById('avgOrderValue');
    if (elAvgOrderValue) elAvgOrderValue.textContent = formatCurrency(kpis.avg_order_value);

    const elTotalCustomers = document.getElementById('totalCustomers');
    if (elTotalCustomers) elTotalCustomers.textContent = new Intl.NumberFormat('en-US').format(kpis.total_customers || 0);

    const elDiscountRate = document.getElementById('discountRate');
    if (elDiscountRate) elDiscountRate.textContent = (kpis.discount_rate_pct || 0).toFixed(1) + '%';
}

function getChartLayout(title, overrides = {}) {
    const layout = {
        title: title || '',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { family: 'Inter, sans-serif', color: '#94a3b8' },
        margin: { t: 40, r: 20, b: 40, l: 40 },
        xaxis: { gridcolor: '#1e293b', zerolinecolor: '#1e293b' },
        yaxis: { gridcolor: '#1e293b', zerolinecolor: '#1e293b' },
        showlegend: false
    };
    return { ...layout, ...overrides };
}

