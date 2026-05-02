/**
 * Grid.js - Grid System for CAD Drawing Engine
 * Handles grid rendering and snap-to-grid functionality
 */

export class Grid {
    constructor(gridSize = 10) {
        this.gridSize = gridSize;
        this.visible = true;
        this.majorGridInterval = 5; // Major grid lines every 5 units
        this.minorLineColor = 'rgba(0, 0, 0, 0.1)';
        this.majorLineColor = 'rgba(0, 0, 0, 0.2)';
        this.lineWidth = 1;
    }

    /**
     * Draw the grid on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Viewport} viewport - Viewport instance for transformations
     */
    draw(ctx, viewport) {
        if (!this.visible) return;

        const canvas = ctx.canvas;
        const scale = viewport.getZoomLevel();
        
        // Calculate visible area in world coordinates
        const topLeft = viewport.screenToWorld(0, 0);
        const bottomRight = viewport.screenToWorld(canvas.width, canvas.height);
        
        // Calculate grid boundaries (snap to grid)
        const startX = Math.floor(topLeft.x / this.gridSize) * this.gridSize;
        const startY = Math.floor(topLeft.y / this.gridSize) * this.gridSize;
        const endX = Math.ceil(bottomRight.x / this.gridSize) * this.gridSize;
        const endY = Math.ceil(bottomRight.y / this.gridSize) * this.gridSize;

        ctx.save();
        
        // Don't apply viewport transform - we'll transform individual lines
        ctx.lineWidth = this.lineWidth / scale;

        // Draw vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            const isMajor = (x / this.gridSize) % this.majorGridInterval === 0;
            ctx.strokeStyle = isMajor ? this.majorLineColor : this.minorLineColor;
            
            const screenStart = viewport.worldToScreen(x, startY);
            const screenEnd = viewport.worldToScreen(x, endY);
            
            ctx.beginPath();
            ctx.moveTo(screenStart.x, screenStart.y);
            ctx.lineTo(screenEnd.x, screenEnd.y);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            const isMajor = (y / this.gridSize) % this.majorGridInterval === 0;
            ctx.strokeStyle = isMajor ? this.majorLineColor : this.minorLineColor;
            
            const screenStart = viewport.worldToScreen(startX, y);
            const screenEnd = viewport.worldToScreen(endX, y);
            
            ctx.beginPath();
            ctx.moveTo(screenStart.x, screenStart.y);
            ctx.lineTo(screenEnd.x, screenEnd.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Snap coordinates to the nearest grid point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Snapped coordinates {x, y}
     */
    snapToGrid(x, y) {
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }

    /**
     * Set the grid size
     * @param {number} size - New grid size
     */
    setGridSize(size) {
        if (size > 0) {
            this.gridSize = size;
        }
    }

    /**
     * Get the current grid size
     * @returns {number} Current grid size
     */
    getGridSize() {
        return this.gridSize;
    }

    /**
     * Toggle grid visibility
     */
    toggleVisibility() {
        this.visible = !this.visible;
    }

    /**
     * Set grid visibility
     * @param {boolean} visible - Visibility state
     */
    setVisibility(visible) {
        this.visible = visible;
    }

    /**
     * Check if grid is visible
     * @returns {boolean} Visibility state
     */
    isVisible() {
        return this.visible;
    }

    /**
     * Set major grid interval
     * @param {number} interval - Number of minor grid lines between major lines
     */
    setMajorGridInterval(interval) {
        if (interval > 0) {
            this.majorGridInterval = interval;
        }
    }

    /**
     * Set grid colors
     * @param {string} minorColor - Color for minor grid lines
     * @param {string} majorColor - Color for major grid lines
     */
    setColors(minorColor, majorColor) {
        this.minorLineColor = minorColor;
        this.majorLineColor = majorColor;
    }
}

// Made with Bob
