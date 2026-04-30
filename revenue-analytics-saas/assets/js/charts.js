const nullSafe = window.null || { responsive: true, displayModeBar: false };
function renderAllCharts(data) {
    const source = data || appData;
    if (!source) return;

    const accentColors = ['#38bdf8', '#8b5cf6', '#22c55e', '#f59e0b', '#fb7185'];

    // --- OVERVIEW PAGE ---
    if (document.getElementById('revenueTrendChart')) {
        const months = source.revenue_by_month.map(d => d.month);
        const revenues = source.revenue_by_month.map(d => d.revenue);
        Plotly.newPlot('revenueTrendChart', [{
            x: months, y: revenues, type: 'scatter', mode: 'lines',
            fill: 'tozeroy', line: { color: '#38bdf8', width: 3 }
        }], getChartLayout('', { height: 350 }));
    }

    if (document.getElementById('channelDonutChart')) {
        const labels = source.revenue_by_channel.map(d => d.channel);
        const values = source.revenue_by_channel.map(d => d.revenue);
        Plotly.newPlot('channelDonutChart', [{
            labels: labels, values: values, type: 'pie', hole: 0.6,
            marker: { colors: accentColors }
        }], getChartLayout('', { showlegend: true, height: 350, margin: {t:0, b:0, l:0, r:0} }));
    }

    if (document.getElementById('topProductsChart')) {
        const top5 = source.products.slice(0, 5);
        Plotly.newPlot('topProductsChart', [{
            x: top5.map(p => p.name), y: top5.map(p => p.revenue),
            type: 'bar', marker: { color: accentColors[1] }
        }], getChartLayout('', { height: 250 }));
    }

    // --- REVENUE PAGE ---
    if (document.getElementById('revenueGrowthChart')) {
        const months = source.revenue_by_month.map(d => d.month);
        const revenues = source.revenue_by_month.map(d => d.revenue);
        Plotly.newPlot('revenueGrowthChart', [{
            x: months, y: revenues, type: 'scatter', mode: 'lines+markers',
            line: { color: '#22c55e', width: 4 }, marker: { size: 8 }
        }], getChartLayout('', { height: 400 }));
    }

    if (document.getElementById('countryRevenueChart')) {
        const countries = source.revenue_by_country.map(d => d.country);
        const revenues = source.revenue_by_country.map(d => d.revenue);
        Plotly.newPlot('countryRevenueChart', [{
            y: countries, x: revenues, type: 'bar', orientation: 'h',
            marker: { color: '#38bdf8' }
        }], getChartLayout('', { height: 400, margin: { l: 100 } }));
    }

    if (document.getElementById('financeBreakdownChart')) {
        const m = source.marketing;
        Plotly.newPlot('financeBreakdownChart', [{
            labels: ['Net Revenue', 'Discounts', 'Taxes'],
            values: [source.kpis.total_revenue, m.discount_total || 0, source.kpis.total_revenue * 0.15],
            type: 'pie', marker: { colors: ['#22c55e', '#fb7185', '#f59e0b'] }
        }], getChartLayout('', { showlegend: true }));
    }

    // --- CUSTOMERS PAGE ---
    if (document.getElementById('customerSegmentChart')) {
        const segments = { 'High Value': 0, 'Mid Value': 0, 'Low Value': 0 };
        if (source.customers && source.customers.length > 0) {
            source.customers.forEach(c => segments[c.segment] = (segments[c.segment] || 0) + 1);
        }
        
        Plotly.newPlot('customerSegmentChart', [{
            labels: Object.keys(segments),
            values: Object.values(segments),
            type: 'pie', hole: 0.5, marker: { colors: ['#22c55e', '#38bdf8', '#6b7280'] }
        }], getChartLayout('', { showlegend: true }));
    }

    if (document.getElementById('countryMapChart')) {
        const countries = source.revenue_by_country.map(d => d.country);
        const revenues = source.revenue_by_country.map(d => d.revenue);
        Plotly.newPlot('countryMapChart', [{
            type: 'choropleth', locations: countries, locationmode: 'country names',
            z: revenues, colorscale: 'Blues', showscale: true,
            colorbar: { title: 'Revenue', thickness: 15 },
            hovertemplate: '<b>%{location}</b><br>Revenue: $%{z:,.2f}<extra></extra>'
        }], getChartLayout('', { 
            height: 500,
            margin: { t: 10, b: 10, l: 10, r: 10 },
            geo: { 
                bgcolor: 'transparent', 
                showframe: false, 
                showcoastlines: true, 
                coastlinecolor: '#475569',
                showland: true,
                landcolor: '#1e293b',
                showcountries: true,
                countrycolor: '#475569',
                projection: { type: 'robinson', scale: 1.4 },
                lataxis: { range: [-50, 80] }
            } 
        }));
    }

    // --- PRODUCTS PAGE ---
    if (document.getElementById('productRankingChart')) {
        const prods = source.products.slice(0, 10);
        Plotly.newPlot('productRankingChart', [{
            y: prods.map(p => p.name).reverse(), x: prods.map(p => p.revenue).reverse(),
            type: 'bar', orientation: 'h', marker: { color: '#8b5cf6' }
        }], getChartLayout('', { height: 450, margin: { l: 150 } }));
    }

    if (document.getElementById('productUnitsChart')) {
        const prods = source.products.slice(0, 8);
        Plotly.newPlot('productUnitsChart', [{
            x: prods.map(p => p.name), y: prods.map(p => p.units_sold),
            type: 'bar', marker: { color: '#38bdf8' }
        }], getChartLayout(''));
    }

    if (document.getElementById('productPriceChart')) {
        const prods = source.products.slice(0, 8);
        Plotly.newPlot('productPriceChart', [{
            x: prods.map(p => p.name), y: prods.map(p => p.avg_price),
            type: 'scatter', mode: 'markers', marker: { size: 12, color: '#f59e0b' }
        }], getChartLayout(''));
    }

    // --- MARKETING PAGE ---
    if (document.getElementById('channelRevenueBarChart')) {
        const channels = source.revenue_by_channel.map(d => d.channel);
        const revenues = source.revenue_by_channel.map(d => d.revenue);
        Plotly.newPlot('channelRevenueBarChart', [{
            x: channels, y: revenues, type: 'bar',
            marker: { color: '#38bdf8' },
            hovertemplate: 'Channel: %{x}<br>Revenue: $%{y:,.2f}<extra></extra>'
        }], getChartLayout('Revenue by Channel'));
    }

    if (document.getElementById('paymentMixChart')) {
        const m = source.marketing.by_payment_method;
        Plotly.newPlot('paymentMixChart', [{
            labels: m.map(d => d.method), values: m.map(d => d.count),
            type: 'pie', marker: { colors: accentColors }
        }], getChartLayout('Payment Mix', { showlegend: true }));
    }

    if (document.getElementById('channelAovChart')) {
        const m = source.marketing.by_channel_aov;
        Plotly.newPlot('channelAovChart', [{
            y: m.map(d => d.channel), x: m.map(d => d.aov),
            type: 'bar', orientation: 'h', marker: { color: '#8b5cf6' }
        }], getChartLayout('AOV by Channel', { margin: {l: 120} }));
    }

    if (document.getElementById('peakHoursChart')) {
        const m = source.marketing.peak_hours;
        Plotly.newPlot('peakHoursChart', [{
            x: m.map(d => d.hour + ':00'), y: m.map(d => d.count),
            type: 'scatter', fill: 'tozeroy', line: { color: '#f59e0b' }
        }], getChartLayout('Traffic by Hour'));
    }
}

function populateCustomerTable(customers) {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    customers.slice(0, 10).forEach(c => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--border)';
        row.innerHTML = `
            <td style="padding: 1rem; font-weight: 500;">${c.name}</td>
            <td style="padding: 1rem; color: var(--text-muted);">${c.country}</td>
            <td style="padding: 1rem;">${c.orders}</td>
            <td style="padding: 1rem; font-weight: 600;">${formatCurrency(c.total_spend)}</td>
            <td style="padding: 1rem;">
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: ${getSegmentColor(c.segment)}20; color: ${getSegmentColor(c.segment)}">
                    ${c.segment}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getSegmentColor(segment) {
    if (segment === 'High Value') return '#22c55e';
    if (segment === 'Mid Value') return '#38bdf8';
    return '#6b7280';
}
