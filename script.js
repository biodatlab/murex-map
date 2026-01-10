let isObsOpen = false;

/**
 * Toggles the Sidebar and loads CSV only when needed
 */
function toggleObservations() {
    isObsOpen = !isObsOpen;
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('obsToggle');
    
    if (isObsOpen) {
        sidebar.classList.add('active');
        toggleBtn.classList.add('active');
        loadCSVData();
    } else {
        sidebar.classList.remove('active');
        toggleBtn.classList.remove('active');
    }
}

/**
 * Ensures the Pan tool is active in the map automatically
 */
document.getElementById('plotFrame').addEventListener('load', function() {
    const frame = this;
    frame.classList.remove('loading');
    document.getElementById('loader').style.display = 'none';

    let attempts = 0;
    const forcePanMode = setInterval(() => {
        try {
            const frameDoc = frame.contentWindow.document;
            const panBtn = frameDoc.querySelector('.bk-tool-icon-pan');
            if (panBtn) {
                panBtn.click();
                clearInterval(forcePanMode);
            }
        } catch (e) {
            clearInterval(forcePanMode);
        }
        if (++attempts > 15) clearInterval(forcePanMode);
    }, 200);
});

/**
 * Load and Parse CSV
 */
function loadCSVData() {
    // Note: Ensure this path matches your folder exactly on GitHub
    const csvPath = 'Observation Data/layer2_topic_analysis_final.csv';
    
    Papa.parse(csvPath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) { 
            displayObservations(results.data); 
        },
        error: function() { 
            document.getElementById('csv-content').innerHTML = '<p style="color:red;">Error loading CSV data.</p>';
        }
    });
}

/**
 * Render CSV data into Sidebar
 */
function displayObservations(data) {
    const container = document.getElementById('csv-content');
    container.innerHTML = ''; 

    data.forEach(row => {
        if (!row.topic_layer_2_name) return; 

        const item = document.createElement('div');
        item.className = 'topic-block';
        item.innerHTML = `
            <div class="topic-header"><h4>${row.topic_layer_2_name}</h4></div>
            <div class="comparison-group">
                ${createDetail('2021 → 2022', row.compare_2022_2021)}
                ${createDetail('2022 → 2023', row.compare_2023_2022)}
                ${createDetail('2023 → 2024', row.compare_2024_2023)}
                ${createDetail('2024 → 2025', row.compare_2025_2024)}
            </div>
            <details class="prediction-toggle">
                <summary>Future Prediction</summary>
                <div class="prediction-text">${row.future_prediction || 'No data available.'}</div>
            </details>
        `;
        container.appendChild(item);
    });
}

function createDetail(title, text) {
    return `<details><summary>Trend: ${title}</summary><div class="compare-text">${text || 'No data.'}</div></details>`;
}
