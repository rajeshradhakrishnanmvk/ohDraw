/**
 * DimensionManager.js - Professional Dimension Annotation System
 * Handles automatic and manual dimension annotations
 */

import { Units } from './Units.js';

export class Dimension {
    constructor(type, startPoint, endPoint, offset = 50) {
        this.id = `dim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.type = type; // 'linear', 'aligned', 'angular', 'radial', 'diameter'
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.offset = offset; // Distance from measured object
        this.textOverride = null; // Custom text
        this.precision = 2;
        this.visible = true;
        this.layer = 'Dimensions';
        this.style = {
            lineColor: '#FF0000',
            textColor: '#000000',
            arrowSize: 8,
            textSize: 12,
            lineWidth: 1
        };
    }

    /**
     * Calculate dimension value
     */
    getValue() {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        
        switch (this.type) {
            case 'linear':
            case 'aligned':
                return Math.sqrt(dx * dx + dy * dy);
            case 'horizontal':
                return Math.abs(dx);
            case 'vertical':
                return Math.abs(dy);
            case 'angular':
                return Math.atan2(dy, dx) * 180 / Math.PI;
            default:
                return 0;
        }
    }

    /**
     * Get formatted text
     */
    getText() {
        if (this.textOverride) {
            return this.textOverride;
        }
        
        const value = this.getValue();
        
        if (this.type === 'angular') {
            return `${value.toFixed(this.precision)}°`;
        }
        
        return Units.format(value, true);
    }

    /**
     * Render dimension
     */
    render(ctx, viewport) {
        if (!this.visible) return;
        
        ctx.save();
        
        const start = viewport.worldToScreen(this.startPoint.x, this.startPoint.y);
        const end = viewport.worldToScreen(this.endPoint.x, this.endPoint.y);
        
        // Calculate dimension line position
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length < 1) {
            ctx.restore();
            return;
        }
        
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;
        
        // Offset dimension line
        const offsetX = Math.cos(perpAngle) * this.offset;
        const offsetY = Math.sin(perpAngle) * this.offset;
        
        const dimStart = { x: start.x + offsetX, y: start.y + offsetY };
        const dimEnd = { x: end.x + offsetX, y: end.y + offsetY };
        
        // Draw extension lines
        ctx.strokeStyle = this.style.lineColor;
        ctx.lineWidth = this.style.lineWidth;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(dimStart.x, dimStart.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(dimEnd.x, dimEnd.y);
        ctx.stroke();
        
        // Draw dimension line
        ctx.beginPath();
        ctx.moveTo(dimStart.x, dimStart.y);
        ctx.lineTo(dimEnd.x, dimEnd.y);
        ctx.stroke();
        
        // Draw arrows
        this.drawArrow(ctx, dimStart, angle, this.style.arrowSize);
        this.drawArrow(ctx, dimEnd, angle + Math.PI, this.style.arrowSize);
        
        // Draw text
        const midX = (dimStart.x + dimEnd.x) / 2;
        const midY = (dimStart.y + dimEnd.y) / 2;
        
        ctx.save();
        ctx.translate(midX, midY);
        
        // Rotate text to be readable
        let textAngle = angle;
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
            textAngle += Math.PI;
        }
        ctx.rotate(textAngle);
        
        // Draw text background
        const text = this.getText();
        ctx.font = `${this.style.textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(-textWidth / 2 - 4, -this.style.textSize - 4, textWidth + 8, this.style.textSize + 4);
        
        // Draw text
        ctx.fillStyle = this.style.textColor;
        ctx.fillText(text, 0, -4);
        
        ctx.restore();
        ctx.restore();
    }

    /**
     * Draw arrow head
     */
    drawArrow(ctx, point, angle, size) {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(angle);
        
        ctx.fillStyle = this.style.lineColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            offset: this.offset,
            textOverride: this.textOverride,
            precision: this.precision,
            visible: this.visible,
            layer: this.layer,
            style: this.style
        };
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const dim = new Dimension(data.type, data.startPoint, data.endPoint, data.offset);
        dim.id = data.id;
        dim.textOverride = data.textOverride;
        dim.precision = data.precision || 2;
        dim.visible = data.visible !== undefined ? data.visible : true;
        dim.layer = data.layer || 'Dimensions';
        if (data.style) {
            dim.style = { ...dim.style, ...data.style };
        }
        return dim;
    }
}

export class DimensionManager {
    constructor() {
        this.dimensions = [];
        this.autoDimension = false;
        this.dimensionStyle = {
            lineColor: '#FF0000',
            textColor: '#000000',
            arrowSize: 8,
            textSize: 12,
            lineWidth: 1
        };
    }

    /**
     * Add dimension
     */
    addDimension(dimension) {
        this.dimensions.push(dimension);
        return dimension;
    }

    /**
     * Remove dimension
     */
    removeDimension(dimension) {
        const index = this.dimensions.indexOf(dimension);
        if (index > -1) {
            this.dimensions.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Create linear dimension
     */
    createLinearDimension(startPoint, endPoint, offset = 50) {
        const dim = new Dimension('linear', startPoint, endPoint, offset);
        dim.style = { ...this.dimensionStyle };
        return this.addDimension(dim);
    }

    /**
     * Create horizontal dimension
     */
    createHorizontalDimension(startPoint, endPoint, offset = 50) {
        const dim = new Dimension('horizontal', startPoint, endPoint, offset);
        dim.style = { ...this.dimensionStyle };
        return this.addDimension(dim);
    }

    /**
     * Create vertical dimension
     */
    createVerticalDimension(startPoint, endPoint, offset = 50) {
        const dim = new Dimension('vertical', startPoint, endPoint, offset);
        dim.style = { ...this.dimensionStyle };
        return this.addDimension(dim);
    }

    /**
     * Auto-dimension object
     */
    autoDimensionObject(obj, offset = 50) {
        const dimensions = [];
        
        if (obj.type === 'line') {
            // Single dimension for line
            const dim = this.createLinearDimension(
                { x: obj.startX, y: obj.startY },
                { x: obj.endX, y: obj.endY },
                offset
            );
            dimensions.push(dim);
        } else {
            // Width dimension
            const widthDim = this.createHorizontalDimension(
                { x: obj.x, y: obj.y + obj.height },
                { x: obj.x + obj.width, y: obj.y + obj.height },
                offset
            );
            dimensions.push(widthDim);
            
            // Height dimension
            const heightDim = this.createVerticalDimension(
                { x: obj.x + obj.width, y: obj.y },
                { x: obj.x + obj.width, y: obj.y + obj.height },
                offset
            );
            dimensions.push(heightDim);
        }
        
        return dimensions;
    }

    /**
     * Clear all dimensions
     */
    clearAll() {
        this.dimensions = [];
    }

    /**
     * Get dimensions for layer
     */
    getDimensionsForLayer(layerId) {
        return this.dimensions.filter(dim => dim.layer === layerId);
    }

    /**
     * Render all dimensions
     */
    renderAll(ctx, viewport) {
        this.dimensions.forEach(dim => {
            dim.render(ctx, viewport);
        });
    }

    /**
     * Find dimension at position
     */
    findDimensionAt(worldX, worldY, viewport, threshold = 10) {
        for (let i = this.dimensions.length - 1; i >= 0; i--) {
            const dim = this.dimensions[i];
            if (!dim.visible) continue;
            
            // Check if point is near dimension line
            const start = viewport.worldToScreen(dim.startPoint.x, dim.startPoint.y);
            const end = viewport.worldToScreen(dim.endPoint.x, dim.endPoint.y);
            const point = viewport.worldToScreen(worldX, worldY);
            
            const distance = this.pointToLineDistance(
                point.x, point.y,
                start.x, start.y,
                end.x, end.y
            );
            
            if (distance < threshold) {
                return dim;
            }
        }
        
        return null;
    }

    /**
     * Calculate distance from point to line
     */
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        
        if (lengthSquared === 0) {
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            dimensions: this.dimensions.map(dim => dim.toJSON()),
            autoDimension: this.autoDimension,
            dimensionStyle: this.dimensionStyle
        };
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const manager = new DimensionManager();
        manager.autoDimension = data.autoDimension || false;
        manager.dimensionStyle = data.dimensionStyle || manager.dimensionStyle;
        
        if (data.dimensions) {
            data.dimensions.forEach(dimData => {
                const dim = Dimension.fromJSON(dimData);
                manager.dimensions.push(dim);
            });
        }
        
        return manager;
    }
}

// Made with Bob
