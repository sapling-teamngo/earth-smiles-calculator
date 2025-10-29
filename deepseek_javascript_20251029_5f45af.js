class EarthSmilesVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.results = null;
        this.currentView = 'single';
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Canvas pan and zoom
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    setResults(results) {
        this.results = results;
        this.resetView();
        this.draw();
    }

    setView(viewType) {
        this.currentView = viewType;
        this.resetView();
        this.draw();
    }

    resetView() {
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
    }

    draw() {
        if (!this.results) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.currentView) {
            case 'single':
                this.drawSingleStructure();
                break;
            case 'layout':
                this.drawFieldLayout();
                break;
            case 'cross-section':
                this.drawCrossSection();
                break;
        }
    }

    drawSingleStructure() {
        const { diameter, depth, bundHeight } = this.results;
        const centerX = this.canvas.width / 2 + this.offset.x;
        const centerY = this.canvas.height / 2 + this.offset.y;
        const scale = Math.min(this.canvas.width, this.canvas.height) / (diameter * 1.5) * this.scale;

        // Draw semicircle (the "smile")
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);

        // Draw the excavated area
        this.ctx.fillStyle = '#e8f4f8';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, diameter / 2, 0, Math.PI, true);
        this.ctx.fill();

        // Draw the bund
        this.ctx.fillStyle = '#8b4513';
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 0.1;

        // Bund cross-section (simplified)
        const bundWidth = bundHeight * 1.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, diameter / 2 + bundWidth / 2, 0, Math.PI, true);
        this.ctx.arc(0, 0, diameter / 2 - bundWidth / 2, Math.PI, 0, false);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Draw dimensions
        this.ctx.fillStyle = '#000';
        this.ctx.font = '0.8px Arial';
        this.ctx.textAlign = 'center';
        
        // Diameter dimension
        this.ctx.fillText(`${diameter}m`, 0, -diameter/2 - 1);
        
        // Depth dimension
        this.ctx.fillText(`Depth: ${depth}m`, diameter/4, depth/2);

        this.ctx.restore();

        // Draw legend
        this.drawLegend();
    }

    drawFieldLayout() {
        const { diameter, spacingBetween, structuresPerHectare } = this.results;
        const scale = Math.min(this.canvas.width, this.canvas.height) / (diameter * 6) * this.scale;
        const centerX = this.canvas.width / 2 + this.offset.x;
        const centerY = this.canvas.height / 2 + this.offset.y;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);

        // Draw multiple structures in staggered pattern
        const rows = 4;
        const cols = 4;
        const rowSpacing = diameter * 0.8 + spacingBetween;
        const colSpacing = diameter * 1.2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col - cols/2) * colSpacing + (row % 2) * (colSpacing / 2);
                const y = (row - rows/2) * rowSpacing;

                // Draw semicircle
                this.ctx.fillStyle = row % 2 === 0 ? '#e8f4f8' : '#d4eaf7';
                this.ctx.beginPath();
                this.ctx.arc(x, y, diameter / 2, 0, Math.PI, true);
                this.ctx.fill();

                // Draw bund outline
                this.ctx.strokeStyle = '#8b4513';
                this.ctx.lineWidth = 0.1;
                this.ctx.beginPath();
                this.ctx.arc(x, y, diameter / 2, 0, Math.PI, true);
                this.ctx.stroke();
            }
        }

        // Draw spacing indicators
        this.ctx.strokeStyle = '#666';
        this.ctx.setLineDash([0.2, 0.2]);
        this.ctx.lineWidth = 0.05;
        
        // Horizontal spacing
        this.ctx.beginPath();
        this.ctx.moveTo(-cols/2 * colSpacing, -rows/2 * rowSpacing + diameter/2);
        this.ctx.lineTo(cols/2 * colSpacing, -rows/2 * rowSpacing + diameter/2);
        this.ctx.stroke();

        this.ctx.fillStyle = '#000';
        this.ctx.font = '0.6px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${spacingBetween}m spacing`, 0, -rows/2 * rowSpacing + diameter/2 + 0.8);

        this.ctx.restore();

        // Draw layout info
        this.drawLayoutInfo();
    }

    drawCrossSection() {
        const { diameter, depth, bundHeight } = this.results;
        const centerX = this.canvas.width / 2 + this.offset.x;
        const centerY = this.canvas.height / 2 + this.offset.y;
        const scale = Math.min(this.canvas.width, this.canvas.height) / (diameter * 2) * this.scale;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);

        // Draw ground level
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 0.1;
        this.ctx.beginPath();
        this.ctx.moveTo(-diameter, 0);
        this.ctx.lineTo(diameter, 0);
        this.ctx.stroke();

        // Draw excavated area
        this.ctx.fillStyle = '#e8f4f8';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, diameter / 2, 0, Math.PI, true);
        this.ctx.fill();

        // Draw bund
        this.ctx.fillStyle = '#a0522d';
        this.ctx.beginPath();
        this.ctx.moveTo(-diameter/2, 0);
        this.ctx.lineTo(-diameter/2 - bundHeight * 1.5, -bundHeight);
        this.ctx.lineTo(diameter/2 + bundHeight * 1.5, -bundHeight);
        this.ctx.lineTo(diameter/2, 0);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw water level (if any)
        this.ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, diameter / 2, 0, Math.PI, true);
        this.ctx.fill();

        // Draw dimensions
        this.ctx.fillStyle = '#000';
        this.ctx.font = '0.6px Arial';
        this.ctx.textAlign = 'center';
        
        // Diameter
        this.ctx.fillText(`${diameter}m`, 0, diameter/4);
        
        // Depth
        this.drawDimensionLine(-diameter/2 - 0.5, 0, -diameter/2 - 0.5, -depth, `Depth: ${depth}m`);
        
        // Bund height
        this.drawDimensionLine(diameter/2 + 0.5, 0, diameter/2 + 0.5, -bundHeight, `Bund: ${bundHeight}m`);

        this.ctx.restore();

        // Draw cross-section legend
        this.drawCrossSectionLegend();
    }

    drawDimensionLine(x1, y1, x2, y2, label) {
        this.ctx.strokeStyle = '#000';
        this.ctx.setLineDash([0.1, 0.1]);
        this.ctx.lineWidth = 0.05;
        
        // Line
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        // Arrowheads
        this.drawArrowhead(x1, y1, Math.PI/2);
        this.drawArrowhead(x2, y2, -Math.PI/2);
        
        // Label
        this.ctx.fillStyle = '#000';
        this.ctx.font = '0.5px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, x1, (y1 + y2) / 2);
    }

    drawArrowhead(x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-0.1, -0.2);
        this.ctx.lineTo(0.1, -0.2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawLegend() {
        const legendX = 20;
        let legendY = 30;

        this.ctx.fillStyle = '#000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';

        this.ctx.fillText('Single Structure View', legendX, legendY);
        legendY += 20;

        // Legend items
        const legendItems = [
            { color: '#e8f4f8', label: 'Excavated Area' },
            { color: '#8b4513', label: 'Earth Bund' },
            { color: 'rgba(0, 100, 255, 0.3)', label: 'Water Retention' }
        ];

        legendItems.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, legendY, 15, 15);
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(item.label, legendX + 25, legendY + 12);
            legendY += 25;
        });
    }

    drawLayoutInfo() {
        const infoX = 20;
        let infoY = 30;

        this.ctx.fillStyle = '#000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';

        this.ctx.fillText('Field Layout View', infoX, infoY);
        infoY += 25;

        if (this.results) {
            const info = [
                `Structures per hectare: ${this.results.structuresPerHectare}`,
                `Total structures: ${this.results.totalStructures}`,
                `Spacing: ${this.results.spacingBetween}m`,
                `Layout: Staggered pattern`
            ];

            info.forEach(line => {
                this.ctx.fillText(line, infoX, infoY);
                infoY += 20;
            });
        }
    }

    drawCrossSectionLegend() {
        const legendX = 20;
        let legendY = 30;

        this.ctx.fillStyle = '#000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';

        this.ctx.fillText('Cross-Section View', legendX, legendY);
        legendY += 25;

        const legendItems = [
            { color: '#e8f4f8', label: 'Planting Area' },
            { color: '#a0522d', label: 'Earth Bund' },
            { color: 'rgba(0, 100, 255, 0.3)', label: 'Water Collection' }
        ];

        legendItems.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, legendY, 15, 15);
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(item.label, legendX + 25, legendY + 12);
            legendY += 25;
        });
    }

    // Interaction handlers
    handleWheel(event) {
        event.preventDefault();
        const zoomIntensity = 0.1;
        const wheel = event.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        this.scale *= zoom;
        this.draw();
    }

    handleMouseDown(event) {
        this.isDragging = true;
        this.lastMousePos = { x: event.offsetX, y: event.offsetY };
    }

    handleMouseMove(event) {
        if (!this.isDragging) return;
        
        const currentMousePos = { x: event.offsetX, y: event.offsetY };
        const delta = {
            x: currentMousePos.x - this.lastMousePos.x,
            y: currentMousePos.y - this.lastMousePos.y
        };
        
        this.offset.x += delta.x;
        this.offset.y += delta.y;
        this.lastMousePos = currentMousePos;
        
        this.draw();
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.lastMousePos = {
                x: event.touches[0].clientX - this.canvas.getBoundingClientRect().left,
                y: event.touches[0].clientY - this.canvas.getBoundingClientRect().top
            };
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.isDragging) {
            const currentMousePos = {
                x: event.touches[0].clientX - this.canvas.getBoundingClientRect().left,
                y: event.touches[0].clientY - this.canvas.getBoundingClientRect().top
            };
            
            const delta = {
                x: currentMousePos.x - this.lastMousePos.x,
                y: currentMousePos.y - this.lastMousePos.y
            };
            
            this.offset.x += delta.x;
            this.offset.y += delta.y;
            this.lastMousePos = currentMousePos;
            
            this.draw();
        }
    }

    handleTouchEnd() {
        this.isDragging = false;
    }

    exportAsImage() {
        return this.canvas.toDataURL('image/png');
    }

    generate3DView() {
        // This would integrate with a 3D library like Three.js
        // For now, return a message about 3D capabilities
        return {
            type: '3d_preview',
            message: '3D visualization requires Three.js integration',
            capabilities: [
                'Rotatable 3D model',
                'Multiple viewing angles',
                'Terrain integration',
                'Water flow simulation'
            ]
        };
    }
}

// Global visualization instance
let visualizer;

// Initialize visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    visualizer = new EarthSmilesVisualizer('design-canvas');
});

// Update visualization based on view type
function updateVisualization() {
    if (!visualizer) return;
    
    const viewType = document.getElementById('view-type').value;
    visualizer.setView(viewType);
    
    // Update layout info
    updateLayoutInfo();
}

// Update layout information display
function updateLayoutInfo() {
    const container = document.getElementById('layout-info');
    if (!calculator || !calculator.results) return;
    
    const { structuresPerHectare, totalStructures, spacingBetween, diameter } = calculator.results;
    
    container.innerHTML = `
        <div class="layout-details">
            <h3>Layout Information</h3>
            <p><strong>Structures per Hectare:</strong> ${structuresPerHectare}</p>
            <p><strong>Total Structures:</strong> ${totalStructures}</p>
            <p><strong>Spacing Between Rows:</strong> ${spacingBetween} m</p>
            <p><strong>Structure Diameter:</strong> ${diameter} m</p>
            <p><strong>Layout Pattern:</strong> Staggered (following contours)</p>
            <p><strong>Earthwork Volume:</strong> ${calculator.results.earthworkVolume} m³ per structure</p>
        </div>
    `;
}

// Generate comprehensive project report
function generateProjectReport() {
    if (!calculator || !calculator.results) {
        alert('Please complete the calculation first.');
        return;
    }
    
    const report = {
        project: 'Earth Smiles Water Harvesting Project',
        timestamp: new Date().toISOString(),
        location: 'Al Mafraq, Jordan',
        designParameters: calculator.results,
        inputData: {
            area: calculator.area,
            slope: calculator.slope,
            rainfall: calculator.rainfall,
            soilType: calculator.soilType,
            landUse: calculator.landUse
        },
        visualization: visualizer ? visualizer.exportAsImage() : null,
        recommendations: generateRecommendations()
    };
    
    // Download as JSON
    downloadJSON(report, 'earth-smiles-project-report.json');
}

function generateRecommendations() {
    return {
        implementation: [
            'Construct bunds following natural contour lines',
            'Use local soil and materials for construction',
            'Apply organic mulch after installation',
            'Plant drought-resistant species in the catchment area'
        ],
        maintenance: [
            'Inspect bunds after heavy rainfall events',
            'Replenish organic matter annually',
            'Clear sediment accumulation as needed',
            'Monitor plant growth and soil moisture'
        ],
        monitoring: [
            'Track soil moisture levels monthly',
            'Measure plant survival and growth rates',
            'Document rainfall and runoff patterns',
            'Assess soil health improvements annually'
        ]
    };
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}