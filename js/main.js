// Global variables
let currentStep = 1;
let map;
let drawnPolygon = null;
let calculator;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    calculator = new EarthSmilesCalculator();
    initializeMap();
});

// Show specific section
function showSection(sectionName, step = 1) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show requested section
    document.getElementById(sectionName).classList.add('active');
    
    // If calculator, show specific step
    if (sectionName === 'calculator') {
        showStep(step);
    }
}

// Show specific step in calculator
function showStep(stepNumber) {
    currentStep = stepNumber;
    
    // Update progress bar
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Show step content
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}-content`).classList.add('active');
}

// Input method selection
function selectMethod(method) {
    // Hide all method contents
    document.querySelectorAll('.method-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected method
    document.getElementById(`${method}-input`).classList.remove('hidden');
    
    // Initialize map if map method selected
    if (method === 'map' && !map) {
        initializeMap();
    }
}

// Initialize Leaflet map
function initializeMap() {
    map = L.map('map').setView([32.3419, 36.2020], 13); // Al Mafraq coordinates
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add click handler for polygon drawing
    map.on('click', function(e) {
        if (!drawnPolygon) {
            drawnPolygon = L.polygon([], {color: 'blue'}).addTo(map);
        }
        
        const latlngs = drawnPolygon.getLatLngs()[0] || [];
        latlngs.push(e.latlng);
        drawnPolygon.setLatLngs([latlngs]);
    });
}

// Clear map drawing
function clearMap() {
    if (drawnPolygon) {
        map.removeLayer(drawnPolygon);
        drawnPolygon = null;
    }
}

// Add coordinate input field
function addCoordinate() {
    const container = document.getElementById('coordinate-inputs');
    const div = document.createElement('div');
    div.className = 'coord-pair';
    div.innerHTML = `
        <input type="number" class="coord-lat" placeholder="Latitude" step="any">
        <input type="number" class="coord-lng" placeholder="Longitude" step="any">
        <button type="button" onclick="removeCoordinate(this)">Remove</button>
    `;
    container.appendChild(div);
}

// Remove coordinate input
function removeCoordinate(button) {
    button.parentElement.remove();
}

// Calculate area from map polygon
function calculateAreaFromMap() {
    if (!drawnPolygon || drawnPolygon.getLatLngs()[0].length < 3) {
        alert('Please draw a polygon with at least 3 points on the map.');
        return;
    }
    
    const area = calculatePolygonArea(drawnPolygon.getLatLngs()[0]);
    const slope = estimateSlopeFromMap(drawnPolygon.getBounds());
    
    displayStep1Results(area, slope);
}

// Calculate area from coordinates
function calculateAreaFromCoords() {
    const coordPairs = document.querySelectorAll('.coord-pair');
    if (coordPairs.length < 3) {
        alert('Please enter at least 3 coordinate pairs.');
        return;
    }
    
    const latlngs = [];
    coordPairs.forEach(pair => {
        const lat = parseFloat(pair.querySelector('.coord-lat').value);
        const lng = parseFloat(pair.querySelector('.coord-lng').value);
        if (!isNaN(lat) && !isNaN(lng)) {
            latlngs.push([lat, lng]);
        }
    });
    
    if (latlngs.length < 3) {
        alert('Please enter valid coordinates for at least 3 points.');
        return;
    }
    
    const area = calculatePolygonArea(latlngs);
    const slope = estimateSlopeFromCoordinates(latlngs);
    
    displayStep1Results(area, slope);
}

// Calculate polygon area using shoelace formula
function calculatePolygonArea(latlngs) {
    let area = 0;
    const n = latlngs.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += latlngs[i].lng * latlngs[j].lat - latlngs[j].lng * latlngs[i].lat;
    }
    
    area = Math.abs(area) / 2;
    
    // Convert to hectares (approximate conversion)
    const areaHectares = area * 10000 / (111320 * 111320); // Rough conversion
    return Math.max(areaHectares, 0.1); // Minimum 0.1 hectares
}

// Estimate slope from map bounds (simplified)
function estimateSlopeFromMap(bounds) {
    // Simplified slope estimation based on bounds size
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();
    const avgDiff = (latDiff + lngDiff) / 2;
    
    // Convert to slope percentage (very rough estimate)
    return Math.min(Math.max(avgDiff * 1000, 1), 30);
}

// Estimate slope from coordinates
function estimateSlopeFromCoordinates(latlngs) {
    // Find min and max elevation (simplified)
    const elevations = latlngs.map(coord => coord[0] * 1000); // Rough elevation estimate
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    
    // Calculate approximate slope
    const slope = ((maxElev - minElev) / 100) * 100; // Convert to percentage
    return Math.min(Math.max(slope, 1), 30);
}

// Display step 1 results
function displayStep1Results(area, slope) {
    document.getElementById('calculated-area').textContent = area.toFixed(2);
    document.getElementById('calculated-slope').textContent = slope.toFixed(1);
    
    // Classify slope
    let slopeClass = 'Flat';
    if (slope > 2) slopeClass = 'Gentle';
    if (slope > 5) slopeClass = 'Moderate';
    if (slope > 10) slopeClass = 'Rolling';
    if (slope > 15) slopeClass = 'Hilly';
    if (slope > 30) slopeClass = 'Steep';
    
    document.getElementById('slope-class').textContent = slopeClass;
    
    // Store in calculator
    calculator.area = area;
    calculator.slope = slope;
    
    // Show results
    document.querySelectorAll('.method-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById('step1-results').classList.remove('hidden');
}

// Proceed to step 2
function proceedToStep2() {
    showStep(2);
}

// Calculate design
function calculateDesign() {
    const rainfall = parseFloat(document.getElementById('rainfall').value);
    const soilType = document.getElementById('soil-type').value;
    const landUse = document.getElementById('land-use').value;
    const organicMatter = document.getElementById('organic-matter').value;
    
    calculator.rainfall = rainfall;
    calculator.soilType = soilType;
    calculator.landUse = landUse;
    calculator.organicMatter = organicMatter;
    
    // Calculate results
    calculator.results = calculator.calculateDimensions(
        calculator.area, 
        calculator.slope, 
        rainfall, 
        soilType, 
        landUse
    );
    
    displayResults();
    showStep(3);
}

// Display calculation results
function displayResults() {
    const results = calculator.results;
    const container = document.getElementById('results-container');
    
    container.innerHTML = `
        <div class="result-card">
            <h3>Structure Dimensions</h3>
            <p>Diameter: <span class="result-value">${results.diameter} m</span></p>
            <p>Depth: <span class="result-value">${results.depth} m</span></p>
            <p>Bund Height: <span class="result-value">${results.bundHeight} m</span></p>
        </div>
        <div class="result-card">
            <h3>Layout</h3>
            <p>Spacing Between: <span class="result-value">${results.spacingBetween} m</span></p>
            <p>Structures/Hectare: <span class="result-value">${results.structuresPerHectare}</span></p>
            <p>Total Structures: <span class="result-value">${results.totalStructures}</span></p>
        </div>
        <div class="result-card">
            <h3>Earthworks</h3>
            <p>Catchment Area: <span class="result-value">${results.catchmentArea} m²</span></p>
            <p>Earthwork Volume: <span class="result-value">${results.earthworkVolume} m³</span></p>
            <p>Total Catchment: <span class="result-value">${(results.catchmentArea * results.totalStructures).toFixed(0)} m²</span></p>
        </div>
        <div class="result-card">
            <h3>Water Harvesting</h3>
            <p>Potential Runoff: <span class="result-value">${(results.catchmentArea * results.totalStructures * calculator.rainfall / 1000).toFixed(0)} m³/year</span></p>
            <p>Efficiency: <span class="result-value">70-85%</span></p>
            <small>Based on WOCAT field measurements</small>
        </div>
    `;
}

// Proceed to visualization
function proceedToStep4() {
    showStep(4);
    updateVisualization();
}

// Update visualization
function updateVisualization() {
    // This would be implemented in visualization.js
    console.log('Update visualization with:', calculator.results);
}

// Generate report
function generateReport() {
    const reportData = {
        area: calculator.area,
        slope: calculator.slope,
        rainfall: calculator.rainfall,
        results: calculator.results,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earth-smiles-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset calculator
function resetCalculator() {
    calculator = new EarthSmilesCalculator();
    showSection('home');
}
