/**
 * Viewport.js - Viewport Management for CAD Drawing Engine
 * Handles zoom, pan, and coordinate transformations
 */

export class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Viewport state
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1.0;
        
        // Zoom limits
        this.minZoom = 0.1;
        this.maxZoom = 10.0;
        this.zoomStep = 1.1;
        
        // Pan state
        this.isPanning = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Center the viewport initially
        this.centerView();
    }

    /**
     * Center the viewport on the canvas
     */
    centerView() {
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
    }

    /**
     * Pan the viewport by a delta amount
     * @param {number} dx - Delta X in screen coordinates
     * @param {number} dy - Delta Y in screen coordinates
     */
    pan(dx, dy) {
        this.offsetX += dx;
        this.offsetY += dy;
    }

    /**
     * Zoom the viewport
     * @param {number} factor - Zoom factor (>1 to zoom in, <1 to zoom out)
     * @param {number} centerX - X coordinate of zoom center in screen coordinates
     * @param {number} centerY - Y coordinate of zoom center in screen coordinates
     */
    zoom(factor, centerX, centerY) {
        const newScale = this.scale * factor;
        
        // Clamp zoom level
        if (newScale < this.minZoom || newScale > this.maxZoom) {
            return;
        }
        
        // Convert center point to world coordinates before zoom
        const worldPoint = this.screenToWorld(centerX, centerY);
        
        // Apply zoom
        this.scale = newScale;
        
        // Convert world point back to screen coordinates
        const newScreenPoint = this.worldToScreen(worldPoint.x, worldPoint.y);
        
        // Adjust offset to keep the zoom center point fixed
        this.offsetX += centerX - newScreenPoint.x;
        this.offsetY += centerY - newScreenPoint.y;
    }

    /**
     * Zoom in by one step
     * @param {number} centerX - X coordinate of zoom center
     * @param {number} centerY - Y coordinate of zoom center
     */
    zoomIn(centerX, centerY) {
        this.zoom(this.zoomStep, centerX, centerY);
    }

    /**
     * Zoom out by one step
     * @param {number} centerX - X coordinate of zoom center
     * @param {number} centerY - Y coordinate of zoom center
     */
    zoomOut(centerX, centerY) {
        this.zoom(1 / this.zoomStep, centerX, centerY);
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - X coordinate in screen space
     * @param {number} screenY - Y coordinate in screen space
     * @returns {Object} World coordinates {x, y}
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - X coordinate in world space
     * @param {number} worldY - Y coordinate in world space
     * @returns {Object} Screen coordinates {x, y}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    }

    /**
     * Apply viewport transformation to canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    applyTransform(ctx) {
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);
    }

    /**
     * Reset viewport transformation on canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    /**
     * Get current zoom level
     * @returns {number} Current zoom level
     */
    getZoomLevel() {
        return this.scale;
    }

    /**
     * Get zoom percentage
     * @returns {number} Zoom percentage (100 = 100%)
     */
    getZoomPercentage() {
        return Math.round(this.scale * 100);
    }

    /**
     * Set zoom level
     * @param {number} zoom - New zoom level
     * @param {number} centerX - X coordinate of zoom center (optional)
     * @param {number} centerY - Y coordinate of zoom center (optional)
     */
    setZoom(zoom, centerX = this.canvas.width / 2, centerY = this.canvas.height / 2) {
        const factor = zoom / this.scale;
        this.zoom(factor, centerX, centerY);
    }

    /**
     * Fit content to screen (placeholder for future use)
     */
    fitToScreen() {
        // Reset to default view
        this.scale = 1.0;
        this.centerView();
    }

    /**
     * Start panning operation
     * @param {number} mouseX - Mouse X coordinate
     * @param {number} mouseY - Mouse Y coordinate
     */
    startPan(mouseX, mouseY) {
        this.isPanning = true;
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
    }

    /**
     * Update pan during mouse move
     * @param {number} mouseX - Mouse X coordinate
     * @param {number} mouseY - Mouse Y coordinate
     */
    updatePan(mouseX, mouseY) {
        if (this.isPanning) {
            const dx = mouseX - this.lastMouseX;
            const dy = mouseY - this.lastMouseY;
            this.pan(dx, dy);
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
        }
    }

    /**
     * End panning operation
     */
    endPan() {
        this.isPanning = false;
    }

    /**
     * Check if currently panning
     * @returns {boolean} True if panning
     */
    isPanningActive() {
        return this.isPanning;
    }

    /**
     * Get viewport bounds in world coordinates
     * @returns {Object} Bounds {minX, minY, maxX, maxY}
     */
    getWorldBounds() {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.canvas.width, this.canvas.height);
        
        return {
            minX: topLeft.x,
            minY: topLeft.y,
            maxX: bottomRight.x,
            maxY: bottomRight.y
        };
    }

    /**
     * Reset viewport to default state
     */
    reset() {
        this.scale = 1.0;
        this.centerView();
    }
}

// Made with Bob
