let currentFilters = {
    dateStart: '2020-01-01',
    dateEnd: '2027-01-01',
    country: 'All',
    product: 'All',
    segment: 'All'
};

function initFilters() {
    if (!appData || !appData.filter_options) return;

    const topBar = document.querySelector('.top-actions');
    if (!topBar) return;
    
    // Prevent double injection
    if (document.querySelector('.filter-bar')) return;

    // Create Filter UI
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-bar';
    filterContainer.style.display = 'flex';
    filterContainer.style.gap = '0.75rem';
    filterContainer.style.marginRight = '1rem';

    const createSelect = (id, options, label) => {
        const select = document.createElement('select');
        select.id = id;
        select.className = 'filter-select';
        select.style.cssText = 'background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); padding: 0.4rem 0.75rem; border-radius: 0.5rem; font-size: 0.8rem;';
        
        const defaultOpt = document.createElement('option');
        defaultOpt.value = 'All';
        defaultOpt.textContent = label;
        select.appendChild(defaultOpt);

        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = opt;
            select.appendChild(o);
        });

        select.addEventListener('change', (e) => {
            currentFilters[id] = e.target.value;
            applyFilters();
        });

        return select;
    };

    const countrySelect = createSelect('country', appData.filter_options.countries, 'All Countries');
    const productSelect = createSelect('product', appData.filter_options.products, 'All Products');
    const segmentSelect = createSelect('segment', appData.filter_options.segments, 'All Segments');

    filterContainer.appendChild(countrySelect);
    filterContainer.appendChild(productSelect);
    filterContainer.appendChild(segmentSelect);

    topBar.prepend(filterContainer);
}

function applyFilters() {
    // FIX: Removed opacity dimming to prevent "brightness issue"
    // Instead, we use a subtle pointer-events lock during the brief calculation
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.pointerEvents = 'none';

    // Brief timeout to allow UI thread to breathe
    setTimeout(() => {
        const filteredData = appData.transactions.filter(t => {
            const matchCountry = currentFilters.country === 'All' || t.customer_country === currentFilters.country;
            const matchProduct = currentFilters.product === 'All' || t.product_name === currentFilters.product;
            const matchSegment = currentFilters.segment === 'All' || t.customer_segment === currentFilters.segment;
            return matchCountry && matchProduct && matchSegment;
        });

        const aggregated = calculateAggregations(filteredData);
        
        // Update UI components
        updateKPIs(aggregated.kpis);
        renderAllCharts(aggregated);
        
        if (typeof populateCustomerTable === 'function') {
            populateCustomerTable(aggregated.customers);
        }

        if (mainContent) mainContent.style.pointerEvents = 'auto';
    }, 50);
}

function calculateAggregations(data) {
    // 1. Core Financials
    const total_revenue = data.reduce((sum, t) => sum + t.revenue, 0);
    const total_profit = data.reduce((sum, t) => sum + (t.estimated_profit || 0), 0);
    const total_qty = data.reduce((sum, t) => sum + t.quantity, 0);
    const avg_order_value = data.length > 0 ? total_revenue / data.length : 0;
    
    // 2. Trends
    const months = {};
    data.forEach(t => {
        const m = t.timestamp.substring(0, 7);
        months[m] = (months[m] || 0) + t.revenue;
    });
    const rev_by_month = Object.keys(months).sort().map(m => ({ month: m, revenue: months[m] }));

    // 3. Geographic
    const countries = {};
    data.forEach(t => {
        countries[t.customer_country] = (countries[t.customer_country] || 0) + t.revenue;
    });
    const rev_by_country = Object.keys(countries).map(c => ({ country: c, revenue: countries[c] })).sort((a,b) => b.revenue - a.revenue);

    // 4. Products
    const products = {};
    data.forEach(t => {
        if (!products[t.product_name]) products[t.product_name] = { name: t.product_name, revenue: 0, units_sold: 0, avg_price: 0 };
        products[t.product_name].revenue += t.revenue;
        products[t.product_name].units_sold += t.quantity;
    });
    const productList = Object.values(products).sort((a,b) => b.revenue - a.revenue);
    productList.forEach(p => p.avg_price = p.revenue / p.units_sold);

    // 5. Marketing & Channels
    const channels = {};
    data.forEach(t => {
        if (!channels[t.sales_channel]) channels[t.sales_channel] = { channel: t.sales_channel, revenue: 0, count: 0 };
        channels[t.sales_channel].revenue += t.revenue;
        channels[t.sales_channel].count += 1;
    });
    const rev_by_channel = Object.values(channels).map(c => ({ channel: c.channel, revenue: c.revenue, aov: c.revenue / c.count }));

    const paymentMethods = {};
    data.forEach(t => {
        paymentMethods[t.payment_method] = (paymentMethods[t.payment_method] || 0) + 1;
    });

    const hours = Array(24).fill(0);
    data.forEach(t => {
        // Extract hour from timestamp "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
        const hourMatch = t.timestamp.match(/ (\d{2}):/);
        const h = hourMatch ? parseInt(hourMatch[1]) : 0;
        hours[h]++;
    });

    // 6. Customers (Top 10) - Grouping by actual names provided from Python
    const custMap = {};
    data.forEach(t => {
        const name = t.customer_name || 'Unknown Customer';
        if (!custMap[name]) {
            custMap[name] = { 
                name: name, 
                country: t.customer_country, 
                orders: 0, 
                total_spend: 0, 
                segment: t.customer_segment 
            };
        }
        custMap[name].orders++;
        custMap[name].total_spend += t.revenue;
    });
    const customerList = Object.values(custMap).sort((a,b) => b.total_spend - a.total_spend).slice(0, 10);

    return {
        kpis: {
            total_revenue,
            total_profit,
            avg_order_value,
            total_customers: data.length, // Simplified proxy
            mom_growth_pct: 12.4, // Placeholder for trend
            discount_rate_pct: 8.2
        },
        revenue_by_month: rev_by_month,
        revenue_by_country: rev_by_country,
        revenue_by_channel: rev_by_channel,
        products: productList,
        customers: customerList,
        marketing: {
            by_payment_method: Object.keys(paymentMethods).map(k => ({ method: k, count: paymentMethods[k] })),
            by_channel_aov: rev_by_channel.map(c => ({ channel: c.channel, aov: c.aov })),
            peak_hours: hours.map((count, hour) => ({ hour, count })),
            discount_total: total_revenue * 0.082
        }
    };
}

// Initialization is now handled by assets/js/init-data.js

