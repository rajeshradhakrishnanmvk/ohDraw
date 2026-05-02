/**
 * Units.js - Professional Unit System for CAD Engine
 * Handles conversion between different measurement units
 */

export class Units {
    static UNITS = {
        MM: 'mm',
        CM: 'cm',
        M: 'm',
        INCH: 'in',
        FEET: 'ft'
    };

    static CONVERSIONS_TO_MM = {
        'mm': 1,
        'cm': 10,
        'm': 1000,
        'in': 25.4,
        'ft': 304.8
    };

    static currentUnit = Units.UNITS.MM;
    static precision = 2;

    /**
     * Convert from current unit to millimeters (internal representation)
     */
    static toMM(value) {
        return value * this.CONVERSIONS_TO_MM[this.currentUnit];
    }

    /**
     * Convert from millimeters to current unit
     */
    static fromMM(value) {
        return value / this.CONVERSIONS_TO_MM[this.currentUnit];
    }

    /**
     * Format value with current unit
     */
    static format(value, includeUnit = true) {
        const converted = this.fromMM(value);
        const formatted = converted.toFixed(this.precision);
        return includeUnit ? `${formatted} ${this.currentUnit}` : formatted;
    }

    /**
     * Parse value from string with unit
     */
    static parse(str) {
        const match = str.match(/^([\d.]+)\s*([a-z]+)?$/i);
        if (!match) return null;
        
        const value = parseFloat(match[1]);
        const unit = match[2] || this.currentUnit;
        
        if (!this.CONVERSIONS_TO_MM[unit]) return null;
        
        return value * this.CONVERSIONS_TO_MM[unit];
    }

    /**
     * Set current unit
     */
    static setUnit(unit) {
        if (this.CONVERSIONS_TO_MM[unit]) {
            this.currentUnit = unit;
        }
    }

    /**
     * Set precision
     */
    static setPrecision(precision) {
        this.precision = Math.max(0, Math.min(6, precision));
    }

    /**
     * Validate architectural dimensions
     */
    static validateDimension(value, min, max) {
        return value >= min && value <= max;
    }

    /**
     * Standard architectural dimensions for windows (in mm)
     */
    static STANDARD_WINDOWS = {
        'Small': { width: 600, height: 900 },
        'Medium': { width: 900, height: 1200 },
        'Large': { width: 1200, height: 1500 },
        'XLarge': { width: 1500, height: 1800 },
        'Bay': { width: 2400, height: 1500 }
    };

    /**
     * Standard architectural dimensions for doors (in mm)
     */
    static STANDARD_DOORS = {
        'Single': { width: 900, height: 2100 },
        'Wide Single': { width: 1000, height: 2100 },
        'Double': { width: 1800, height: 2100 },
        'Sliding': { width: 1600, height: 2100 },
        'French': { width: 1400, height: 2100 }
    };

    /**
     * Standard glass panel dimensions (in mm)
     */
    static STANDARD_GLASS = {
        'Shower': { width: 900, height: 2000 },
        'Partition': { width: 1200, height: 2400 },
        'Balustrade': { width: 1000, height: 1100 },
        'Skylight': { width: 1200, height: 1200 }
    };
}

// Made with Bob
