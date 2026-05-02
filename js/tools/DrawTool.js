/**
 * DrawTool Class
 * Base class for all drawing tools (Window, Door, Glass, Line)
 */
import { Window } from '../models/Window.js';
import { Door } from '../models/Door.js';
import { Glass } from '../models/Glass.js';

export class DrawTool {
    constructor(canvas, viewport, grid) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.grid = grid;
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.previewShape = null;
        this.shapeType = null; // 'window', 'door', 'glass', 'line'
    }

    /**
     * Set the shape type to draw
     */
    setShapeType(type) {
        this.shapeType = type;
    }

    /**
     * Handle mouse down event
     */
    onMouseDown(worldX, worldY, event) {
        // Apply snap to grid if enabled
        if (this.grid.snapEnabled) {
            const snapped = this.grid.snapToGrid(worldX, worldY);
            worldX = snapped.x;
            worldY = snapped.y;
        }

        this.isDrawing = true;
        this.startPoint = { x: worldX, y: worldY };
        this.currentPoint = { x: worldX, y: worldY };
        
        // Create preview shape
        this.createPreviewShape();
    }

    /**
     * Handle mouse move event
     */
    onMouseMove(worldX, worldY, event) {
        if (!this.isDrawing) return;

        // Apply snap to grid if enabled
        if (this.grid.snapEnabled) {
            const snapped = this.grid.snapToGrid(worldX, worldY);
            worldX = snapped.x;
            worldY = snapped.y;
        }

        this.currentPoint = { x: worldX, y: worldY };
        
        // Update preview shape
        this.updatePreviewShape();
    }

    /**
     * Handle mouse up event
     */
    onMouseUp(worldX, worldY, event) {
        if (!this.isDrawing) return;

        // Apply snap to grid if enabled
        if (this.grid.snapEnabled) {
            const snapped = this.grid.snapToGrid(worldX, worldY);
            worldX = snapped.x;
            worldY = snapped.y;
        }

        this.currentPoint = { x: worldX, y: worldY };
        
        // Create final shape
        const shape = this.createFinalShape();
        
        // Reset drawing state
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.previewShape = null;
        
        return shape;
    }

    /**
     * Cancel current drawing operation
     */
    cancel() {
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        this.previewShape = null;
    }

    /**
     * Create preview shape
     */
    createPreviewShape() {
        const x = this.startPoint.x;
        const y = this.startPoint.y;
        const width = 0;
        const height = 0;

        switch (this.shapeType) {
            case 'window':
                this.previewShape = new Window(x, y, width, height);
                break;
            case 'door':
                this.previewShape = new Door(x, y, width, height);
                break;
            case 'glass':
                this.previewShape = new Glass(x, y, width, height);
                break;
            default:
                this.previewShape = null;
        }
    }

    /**
     * Update preview shape dimensions
     */
    updatePreviewShape() {
        if (!this.previewShape || !this.startPoint || !this.currentPoint) return;

        // Calculate dimensions
        const x = Math.min(this.startPoint.x, this.currentPoint.x);
        const y = Math.min(this.startPoint.y, this.currentPoint.y);
        const width = Math.abs(this.currentPoint.x - this.startPoint.x);
        const height = Math.abs(this.currentPoint.y - this.startPoint.y);

        // Update preview shape
        this.previewShape.x = x;
        this.previewShape.y = y;
        this.previewShape.width = width;
        this.previewShape.height = height;
    }

    /**
     * Create final shape
     */
    createFinalShape() {
        if (!this.startPoint || !this.currentPoint) return null;

        // Calculate dimensions
        const x = Math.min(this.startPoint.x, this.currentPoint.x);
        const y = Math.min(this.startPoint.y, this.currentPoint.y);
        const width = Math.abs(this.currentPoint.x - this.startPoint.x);
        const height = Math.abs(this.currentPoint.y - this.startPoint.y);

        // Don't create shapes that are too small
        if (width < 10 || height < 10) {
            return null;
        }

        let shape = null;
        switch (this.shapeType) {
            case 'window':
                shape = new Window(x, y, width, height);
                break;
            case 'door':
                shape = new Door(x, y, width, height);
                break;
            case 'glass':
                shape = new Glass(x, y, width, height);
                break;
        }

        return shape;
    }

    /**
     * Render preview shape
     */
    renderPreview(ctx) {
        if (!this.isDrawing || !this.previewShape) return;

        ctx.save();
        
        // Set preview style
        ctx.globalAlpha = 0.5;
        
        // Render the preview shape
        this.previewShape.render(ctx, this.viewport);
        
        // Draw dimensions
        this.renderDimensions(ctx);
        
        ctx.restore();
    }

    /**
     * Render dimensions during drawing
     */
    renderDimensions(ctx) {
        if (!this.startPoint || !this.currentPoint) return;

        const width = Math.abs(this.currentPoint.x - this.startPoint.x);
        const height = Math.abs(this.currentPoint.y - this.startPoint.y);

        const centerX = (this.startPoint.x + this.currentPoint.x) / 2;
        const centerY = (this.startPoint.y + this.currentPoint.y) / 2;

        const screenPos = this.viewport.worldToScreen(centerX, centerY);

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const dimensionText = `${Math.round(width)} × ${Math.round(height)}`;
        
        // Draw background for text
        const textWidth = ctx.measureText(dimensionText).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(screenPos.x - textWidth / 2 - 5, screenPos.y - 10, textWidth + 10, 20);
        
        // Draw text
        ctx.fillStyle = '#000000';
        ctx.fillText(dimensionText, screenPos.x, screenPos.y);
    }

    /**
     * Get cursor style for this tool
     */
    getCursor() {
        return 'crosshair';
    }
}

/**
 * LineTool Class
 * Tool for drawing measurement lines and annotations
 */
export class LineTool {
    constructor(canvas, viewport, grid) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.grid = grid;
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
    }

    /**
     * Handle mouse down event
     */
    onMouseDown(worldX, worldY, event) {
        if (this.grid.snapEnabled) {
            const snapped = this.grid.snapToGrid(worldX, worldY);
            worldX = snapped.x;
            worldY = snapped.y;
        }

        this.isDrawing = true;
        this.startPoint = { x: worldX, y: worldY };
        this.currentPoint = { x: worldX, y: worldY };
    }

    /**
     * Handle mouse move event
     */
    onMouseMove(worldX, worldY, event) {
        if (!this.isDrawing) return;

        if (this.grid.snapEnabled) {
            const snapped = this.grid.snapToGrid(worldX, worldY);
            worldX = snapped.x;
            worldY = snapped.y;
        }

        this.currentPoint = { x: worldX, y: worldY };
    }

    /**
     * Handle mouse up event
     */
    onMouseUp(worldX, worldY, event) {
        if (!this.isDrawing) return;

        if (this.grid.snapEnabled) {
            const snapped = this.grid.snapToGrid(worldX, worldY);
            worldX = snapped.x;
            worldY = snapped.y;
        }

        this.currentPoint = { x: worldX, y: worldY };
        
        // Create line object
        const line = {
            type: 'line',
            id: `line-${Date.now()}`,
            startX: this.startPoint.x,
            startY: this.startPoint.y,
            endX: this.currentPoint.x,
            endY: this.currentPoint.y,
            color: '#FF0000',
            lineWidth: 2,
            selected: false
        };
        
        // Reset state
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
        
        return line;
    }

    /**
     * Cancel drawing
     */
    cancel() {
        this.isDrawing = false;
        this.startPoint = null;
        this.currentPoint = null;
    }

    /**
     * Render preview
     */
    renderPreview(ctx) {
        if (!this.isDrawing || !this.startPoint || !this.currentPoint) return;

        ctx.save();
        
        const start = this.viewport.worldToScreen(this.startPoint.x, this.startPoint.y);
        const end = this.viewport.worldToScreen(this.currentPoint.x, this.currentPoint.y);
        
        // Draw line
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw endpoints
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(end.x, end.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw distance
        const dx = this.currentPoint.x - this.startPoint.x;
        const dy = this.currentPoint.y - this.startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const distanceText = `${Math.round(distance)} mm`;
        const textWidth = ctx.measureText(distanceText).width;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(midX - textWidth / 2 - 5, midY - 20, textWidth + 10, 20);
        
        // Text
        ctx.fillStyle = '#000000';
        ctx.fillText(distanceText, midX, midY - 5);
        
        ctx.restore();
    }

    /**
     * Get cursor style
     */
    getCursor() {
        return 'crosshair';
    }
}

// Made with Bob
