let isObsOpen = false;

/**
 * Toggles the Observation Sidebar and adjusts the layout
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
 * Changes the Plot
 */
function loadPlot(url, btn) {
    const frame = document.getElementById('plotFrame');
    frame.src = url;

    // Update button UI
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

/**
 * AUTO-FIX FOR PANNING:
 * Forces the Pan tool to be active and deactivates Box Zoom.
 */
document.getElementById('plotFrame').addEventListener('load', function() {
    const frame = this;

    // We use a small interval because the Bokeh toolbar often loads 
    // slightly after the main iframe 'load' event.
    let attempts = 0;
    const maxAttempts = 10;

    const forcePanMode = setInterval(() => {
        try {
            const frameContent = frame.contentWindow.document;
            const panButton = frameContent.querySelector('.bk-tool-icon-pan');
            const boxZoomButton = frameContent.querySelector('.bk-tool-icon-box-zoom');

            if (panButton) {
                // Click the Pan button
                panButton.click();
                
                // If Box Zoom has the 'bk-active' class, remove it
                if (boxZoomButton && boxZoomButton.classList.contains('bk-active')) {
                    boxZoomButton.classList.remove('bk-active');
                }

                console.log("Pan tool forced as default.");
                clearInterval(forcePanMode); // Stop trying once successful
            }
        } catch (e) {
            // This usually happens if not using a Live Server
            console.warn("Access denied to iframe. Use Live Server to fix panning.");
            clearInterval(forcePanMode);
        }

        attempts++;
        if (attempts >= maxAttempts) clearInterval(forcePanMode);
    }, 200); // Check every 200ms
});

/**
 * CSV Data Loading
 */
function loadCSVData() {
    const csvPath = 'Observation Data/layer2_topic_analysis_final.csv';
    Papa.parse(csvPath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) { displayObservations(results.data); },
        error: function(err) { 
            document.getElementById('csv-content').innerHTML = '<p style="color:red;">CSV Error. Ensure file is in folder.</p>';
        }
    });
}

function displayObservations(data) {
    const container = document.getElementById('csv-content');
    container.innerHTML = ''; 

    data.forEach(row => {
        if (!row.topic_layer_2_name) return; 

        const item = document.createElement('div');
        item.className = 'topic-block';
        item.innerHTML = `
            <div class="topic-header">
                <h4>${row.topic_layer_2_name}</h4>
            </div>
            
            <div class="comparison-group">
                <details>
                    <summary>Trend: 2021 → 2022</summary>
                    <div class="compare-text">${row.compare_2022_2021 || 'No data.'}</div>
                </details>
                <details>
                    <summary>Trend: 2022 → 2023</summary>
                    <div class="compare-text">${row.compare_2023_2022 || 'No data.'}</div>
                </details>
                <details>
                    <summary>Trend: 2023 → 2024</summary>
                    <div class="compare-text">${row.compare_2024_2023 || 'No data.'}</div>
                </details>
                <details>
                    <summary>Trend: 2024 → 2025</summary>
                    <div class="compare-text">${row.compare_2025_2024 || 'No data.'}</div>
                </details>
            </div>

            <details class="prediction-toggle">
                <summary>Future Prediction</summary>
                <div class="prediction-text">${row.future_prediction || 'No forecast data available.'}</div>
            </details>
        `;
        container.appendChild(item);
    });
}

function loadPlot(url, btn) {
    const frame = document.getElementById('plotFrame');
    
    frame.classList.add('loading');

    frame.src = url;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

document.getElementById('plotFrame').addEventListener('load', function() {
    this.classList.remove('loading');
});
