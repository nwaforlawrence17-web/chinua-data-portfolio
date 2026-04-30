function runDashboardInit() {
    if (!window.appData) {
        console.error("Dashboard Error: window.appData is missing.");
        return;
    }

    console.log("Dashboard Data Found. Initializing modules...");

    // Initialize UI components
    if (typeof initFilters === 'function') {
        initFilters();
    }
    
    if (typeof applyFilters === 'function') {
        applyFilters();
    }

    if (typeof renderAllCharts === 'function') {
        renderAllCharts(window.appData);
    }
    
    console.log("Initialization Complete.");
}

// Run after all scripts are loaded
window.addEventListener('load', runDashboardInit);
