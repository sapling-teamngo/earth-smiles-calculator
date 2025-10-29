class EarthSmilesCalculator {
    constructor() {
        this.area = 0;
        this.slope = 0;
        this.rainfall = 0;
        this.soilType = 'loamy';
        this.landUse = 'orchard';
        this.organicMatter = 'medium';
        this.results = {};
    }

    calculateDimensions(area, slope, rainfall, soilType, landUse) {
        // Base dimensions from WOCAT Benin case study (Pages 1-2)
        const baseDiameter = 4.0; // meters
        const baseDepth = 0.15;   // meters
        const baseSpacing = 4.0;  // meters between rows
        
        // Slope adjustment factor (WOCAT principle: steeper slopes need smaller structures)
        let slopeFactor = 1.0;
        if (slope > 2) slopeFactor = 0.95;
        if (slope > 5) slopeFactor = 0.9;
        if (slope > 10) slopeFactor = 0.85;
        if (slope > 15) slopeFactor = 0.75;
        if (slope > 25) slopeFactor = 0.6;
        
        // Rainfall adjustment factor (WOCAT: higher rainfall can handle larger structures)
        let rainfallFactor = Math.min(rainfall / 1025.0, 1.2); // Normalize to Benin's 1025mm
        
        // Soil type adjustment
        let soilFactor = 1.0;
        if (soilType === 'sandy') soilFactor = 1.1;  // Sandy soils need larger catchment
        if (soilType === 'clay') soilFactor = 0.9;   // Clay soils need smaller catchment
        
        // Land use adjustment
        let landUseFactor = 1.0;
        if (landUse === 'pasture') landUseFactor = 1.2;  // Larger for pasture
        if (landUse === 'cropland') landUseFactor = 0.9; // Smaller for crops
        
        // Final dimensions calculation
        const diameter = baseDiameter * slopeFactor * rainfallFactor * soilFactor * landUseFactor;
        const depth = baseDepth * (1 + (rainfall / 2000)); // Deeper for higher rainfall
        const bundHeight = 0.3 + (slope * 0.008); // Higher bunds for steeper slopes (max 0.7m)
        
        // Calculate number of structures (WOCAT Page 2: 625 structures/hectare for 4m diameter)
        const semicircleArea = (Math.PI * Math.pow(diameter/2, 2)) / 2;
        const effectiveAreaPerStructure = semicircleArea + (baseSpacing * diameter * 0.5);
        const structuresPerHectare = Math.floor(10000 / effectiveAreaPerStructure);
        
        // Earthwork volume calculation (FAO methodology)
        const bundLength = (Math.PI * diameter) / 2; // Perimeter of semicircle
        const crossSectionalArea = 0.5 * bundHeight * (bundHeight / Math.tan(0.7)); // Triangular section
        const earthworkVolume = bundLength * crossSectionalArea;
        
        return {
            diameter: this.roundToDecimal(diameter, 2),
            depth: this.roundToDecimal(depth, 2),
            bundHeight: this.roundToDecimal(Math.min(bundHeight, 0.7), 2),
            spacingBetween: this.roundToDecimal(baseSpacing, 1),
            structuresPerHectare: structuresPerHectare,
            totalStructures: Math.floor(area * structuresPerHectare),
            catchmentArea: this.roundToDecimal(semicircleArea, 2),
            earthworkVolume: this.roundToDecimal(earthworkVolume, 2),
            slopeFactor: this.roundToDecimal(slopeFactor, 2),
            rainfallFactor: this.roundToDecimal(rainfallFactor, 2)
        };
    }

    getDesignEquations() {
        return [
            {
                parameter: "Structure Diameter",
                equation: "D = 4.0 × S_f × R_f × Soil_f × Land_f",
                variables: {
                    "S_f": "Slope factor (0.6-1.0)",
                    "R_f": "Rainfall factor (rainfall/1025)",
                    "Soil_f": "Soil type factor (0.9-1.1)",
                    "Land_f": "Land use factor (0.9-1.2)"
                },
                source: "Adapted from WOCAT Benin Case Study, Pages 1-2"
            },
            {
                parameter: "Bund Height",
                equation: "H = 0.3 + (slope × 0.008)",
                description: "Minimum 0.3m, maximum 0.7m based on slope",
                source: "WOCAT Technical Specifications, Page 2"
            },
            {
                parameter: "Structures per Hectare",
                equation: "N = 10000 / (A_semicircle + S × D × 0.5)",
                description: "Based on semicircle area and spacing efficiency",
                source: "FAO Water Harvesting Manual, Section 4.3"
            },
            {
                parameter: "Spacing Between Rows",
                equation: "S = 4.0 meters",
                description: "Standard spacing for optimal water distribution",
                source: "WOCAT Design Protocol, Page 2"
            },
            {
                parameter: "Earthwork Volume",
                equation: "V = L × A_cross",
                description: "Bund length × cross-sectional area",
                source: "Engineering calculations based on WOCAT dimensions"
            }
        ];
    }

    getWOCATReferences() {
        return {
            "Base Diameter": "4.0 meters - WOCAT Benin Case Study, Page 1",
            "Digging Depth": "15-20 cm - WOCAT Establishment Activities, Page 2", 
            "Ridge Height": "Up to 40 cm - WOCAT Technical Specifications, Page 2",
            "Spacing": "4 meters between rows - WOCAT Layout, Page 2",
            "Compost": "35 kg per structure - WOCAT Inputs, Page 2",
            "Structures/Ha": "625 for 4m diameter - WOCAT Calculations, Page 2"
        };
    }

    roundToDecimal(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
}
