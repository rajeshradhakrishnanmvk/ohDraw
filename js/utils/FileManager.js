/**
 * FileManager.js - Professional File Management System
 * Handles save/load operations with JSON schema validation
 */

export class FileManager {
    static VERSION = '1.0.0';
    static FILE_EXTENSION = '.ohdraw';

    /**
     * Create a new project data structure
     */
    static createProject(title = 'Untitled Project') {
        return {
            version: this.VERSION,
            metadata: {
                title: title,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: '',
                description: ''
            },
            settings: {
                units: 'mm',
                gridSize: 10,
                snapEnabled: true,
                gridVisible: true,
                canvasWidth: 5000,
                canvasHeight: 5000
            },
            layers: [],
            objects: []
        };
    }

    /**
     * Serialize project to JSON
     */
    static serialize(app) {
        const project = this.createProject(app.projectTitle || 'Untitled Project');
        
        // Update metadata
        project.metadata.modified = new Date().toISOString();
        
        // Serialize settings
        project.settings.units = app.settings.units || 'mm';
        project.settings.gridSize = app.settings.gridSize || 10;
        project.settings.snapEnabled = app.settings.snapToGrid !== undefined ? app.settings.snapToGrid : true;
        project.settings.gridVisible = app.settings.gridVisible !== undefined ? app.settings.gridVisible : true;
        
        // Serialize layers
        if (app.layerManager) {
            project.layers = app.layerManager.toJSON().layers;
        }
        
        // Serialize objects
        project.objects = app.objects.map(obj => {
            if (obj.toJSON) {
                return obj.toJSON();
            }
            // Handle plain objects (like lines)
            return obj;
        });
        
        return project;
    }

    /**
     * Deserialize project from JSON
     */
    static deserialize(jsonData, app) {
        try {
            const project = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Validate schema
            if (!this.validateSchema(project)) {
                throw new Error('Invalid project file format');
            }
            
            // Check version compatibility
            if (project.version !== this.VERSION) {
                console.warn(`Project version ${project.version} may not be fully compatible with ${this.VERSION}`);
            }
            
            return project;
        } catch (error) {
            throw new Error(`Failed to load project: ${error.message}`);
        }
    }

    /**
     * Validate project schema
     */
    static validateSchema(project) {
        if (!project.version) return false;
        if (!project.metadata || !project.metadata.created) return false;
        if (!project.settings) return false;
        if (!Array.isArray(project.layers)) return false;
        if (!Array.isArray(project.objects)) return false;
        return true;
    }

    /**
     * Save project to file
     */
    static saveToFile(app, filename = null) {
        const project = this.serialize(app);
        const jsonString = JSON.stringify(project, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        const defaultFilename = filename || `${project.metadata.title}${this.FILE_EXTENSION}`;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = defaultFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
    }

    /**
     * Load project from file
     */
    static loadFromFile(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = `${this.FILE_EXTENSION},.json`;
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = event.target.result;
                    callback(null, jsonData);
                } catch (error) {
                    callback(error, null);
                }
            };
            reader.onerror = () => {
                callback(new Error('Failed to read file'), null);
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Export to SVG format
     */
    static exportToSVG(app, filename = 'drawing.svg') {
        const objects = app.objects;
        const viewport = app.viewport;
        
        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        objects.forEach(obj => {
            if (obj.type === 'line') {
                minX = Math.min(minX, obj.startX, obj.endX);
                minY = Math.min(minY, obj.startY, obj.endY);
                maxX = Math.max(maxX, obj.startX, obj.endX);
                maxY = Math.max(maxY, obj.startY, obj.endY);
            } else {
                minX = Math.min(minX, obj.x);
                minY = Math.min(minY, obj.y);
                maxX = Math.max(maxX, obj.x + obj.width);
                maxY = Math.max(maxY, obj.y + obj.height);
            }
        });
        
        const padding = 50;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;
        
        // Create SVG
        let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - padding} ${minY - padding} ${width} ${height}">\n`;
        svg += `  <title>CAD Drawing Export</title>\n`;
        svg += `  <desc>Exported from ohDraw CAD Engine</desc>\n`;
        
        // Add background
        svg += `  <rect x="${minX - padding}" y="${minY - padding}" width="${width}" height="${height}" fill="#ffffff"/>\n`;
        
        // Export objects
        objects.forEach(obj => {
            if (obj.type === 'line') {
                svg += `  <line x1="${obj.startX}" y1="${obj.startY}" x2="${obj.endX}" y2="${obj.endY}" stroke="${obj.color || '#000000'}" stroke-width="${obj.lineWidth || 2}"/>\n`;
            } else {
                svg += `  <rect x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" fill="none" stroke="#000000" stroke-width="2"/>\n`;
                svg += `  <text x="${obj.x + obj.width / 2}" y="${obj.y - 10}" text-anchor="middle" font-size="12">${obj.type}</text>\n`;
            }
        });
        
        svg += `</svg>`;
        
        // Download
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
    }

    /**
     * Export to DXF format (basic implementation)
     */
    static exportToDXF(app, filename = 'drawing.dxf') {
        const objects = app.objects;
        
        let dxf = '0\nSECTION\n2\nHEADER\n';
        dxf += '9\n$ACADVER\n1\nAC1015\n';
        dxf += '0\nENDSEC\n';
        
        dxf += '0\nSECTION\n2\nENTITIES\n';
        
        objects.forEach(obj => {
            if (obj.type === 'line') {
                dxf += '0\nLINE\n';
                dxf += '8\n0\n'; // Layer
                dxf += `10\n${obj.startX}\n`;
                dxf += `20\n${obj.startY}\n`;
                dxf += `30\n0.0\n`;
                dxf += `11\n${obj.endX}\n`;
                dxf += `21\n${obj.endY}\n`;
                dxf += `31\n0.0\n`;
            } else {
                // Export as polyline rectangle
                dxf += '0\nLWPOLYLINE\n';
                dxf += '8\n0\n';
                dxf += '90\n5\n'; // 5 vertices (closed rectangle)
                dxf += '70\n1\n'; // Closed
                dxf += `10\n${obj.x}\n20\n${obj.y}\n`;
                dxf += `10\n${obj.x + obj.width}\n20\n${obj.y}\n`;
                dxf += `10\n${obj.x + obj.width}\n20\n${obj.y + obj.height}\n`;
                dxf += `10\n${obj.x}\n20\n${obj.y + obj.height}\n`;
                dxf += `10\n${obj.x}\n20\n${obj.y}\n`;
            }
        });
        
        dxf += '0\nENDSEC\n';
        dxf += '0\nEOF\n';
        
        // Download
        const blob = new Blob([dxf], { type: 'application/dxf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return true;
    }

    /**
     * Auto-save to localStorage
     */
    static autoSave(app) {
        try {
            const project = this.serialize(app);
            const jsonString = JSON.stringify(project);
            localStorage.setItem('ohDraw_autosave', jsonString);
            localStorage.setItem('ohDraw_autosave_timestamp', Date.now().toString());
            return true;
        } catch (error) {
            console.error('Auto-save failed:', error);
            return false;
        }
    }

    /**
     * Load from auto-save
     */
    static loadAutoSave() {
        try {
            const jsonString = localStorage.getItem('ohDraw_autosave');
            if (!jsonString) return null;
            
            const timestamp = localStorage.getItem('ohDraw_autosave_timestamp');
            const project = JSON.parse(jsonString);
            
            return {
                project: project,
                timestamp: timestamp ? parseInt(timestamp) : null
            };
        } catch (error) {
            console.error('Failed to load auto-save:', error);
            return null;
        }
    }

    /**
     * Clear auto-save
     */
    static clearAutoSave() {
        localStorage.removeItem('ohDraw_autosave');
        localStorage.removeItem('ohDraw_autosave_timestamp');
    }
}

// Made with Bob
