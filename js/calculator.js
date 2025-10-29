class EarthSmilesCalculator {
    constructor() {
        this.area = 0;
        this.slope = 0;
        this.rainfall = 0;
        this.results = {};
    }

    // Calculate semicircular bund dimensions based on WOCAT data
    calculateDimensions(area, slope, rainfall, soilType, landUse) {
        // Base dimensions from WOCAT Benin case study
        const baseDiameter = 4.0; // meters
        const baseDepth = 0.15;   // meters
        const baseSpacing = 4.0;  // meters between rows
        
        // Adjust for slope (WOCAT principle: steeper slopes need smaller structures)
        let slopeFactor = 1.0;
        if (slope > 15) slopeFactor = 0.8;
        if (slope > 25) slopeFactor = 0.6;
        
        // Adjust for rainfall (WOCAT: higher rainfall can handle larger structures)
        let rainfallFactor = rainfall / 1025.0; // Normalize to Benin's 1025mm
        
        // Final dimensions
        const diameter = baseDiameter * slopeFactor * Math.min(rainfallFactor, 1.2);
        const depth = baseDepth * (1 + (rainfall / 2000)); // Deeper for higher rainfall
        const bundHeight = 0.3 + (slope * 0.01); // Higher bunds for steeper slopes
        
        // Calculate number of structures per hectare
        const areaPerStructure = Math.PI * Math.pow(diameter/2, 2) / 2; // Half circle area
        const structuresPerHectare = Math.floor(10000 / (areaPerStructure + (baseSpacing * diameter)));
        
        return {
            diameter: this.roundToDecimal(diameter, 2),
            depth: this.roundToDecimal(depth, 2),
            bundHeight: this.roundToDecimal(bundHeight, 2),
            spacingBetween: this.roundToDecimal(baseSpacing, 1),
            structuresPerHectare: structuresPerHectare,
            totalStructures: Math.floor(area * structuresPerHectare),
            catchmentArea: this.roundToDecimal(areaPerStructure, 2),
            earthworkVolume: this.roundToDecimal(this.calculateEarthwork(diameter, bundHeight), 2)
        };
    }

    calculateEarthwork(diameter, height) {
        // Volume of semicircular bund (simplified calculation)
        const length = (Math.PI * diameter) / 2; // Perimeter of semicircle
        const crossSection = 0.5 * height * (height / 0.7); // Triangular cross-section approx
        return length * crossSection;
    }

    roundToDecimal(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    // Generate equations used with sources
    getEquations() {
        return [
            {
                parameter: "Diameter",
                equation: "D = D_base × S_f × R_f",
                description: "Base diameter adjusted for slope and rainfall factors",
                source: "WOCAT Benin Case Study (2023), Adapted from page 1-2"
            },
            {
                parameter: "Spacing",
                equation: "S = 4.0 m (between rows)",
                description: "Standard spacing for optimal water catchment",
                source: "WOCAT Technical Drawing, Page 2"
            },
            {
                parameter: "Structures per Hectare",
                equation: "N = 10000 / (A_structure + S × D)",
                description: "Based on area efficiency and spacing requirements",
                source: "FAO Water Harvesting Manual, Chapter 4"
            }
        ];
    }
}
