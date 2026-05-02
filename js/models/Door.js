/**
 * Door Class
 * Represents a door element with frame, panel, and opening properties
 */
import { Shape } from './Shape.js';

export class Door extends Shape {
    constructor(x, y, width, height) {
        super('door', x, y, width, height);
        
        // Door-specific properties
        this.properties = {
            doorType: 'single', // 'single', 'double', 'sliding', 'folding'
            frameColor: '#654321', // Dark brown
            panelColor: '#8B7355', // Light brown
            frameWidth: 50, // Frame thickness in mm
            handleSide: 'right', // 'left', 'right'
            openingAngle: 90, // Degrees (for swing doors)
            openingDirection: 'inward', // 'inward', 'outward'
            panelStyle: 'solid', // 'solid', 'glass', 'paneled'
            threshold: true, // Door threshold/sill
            label: 'D1'
        };
    }

    /**
     * Render door on canvas
     */
    render(ctx, viewport) {
        ctx.save();
        
        const screenPos = viewport.worldToScreen(this.x, this.y);
        const screenWidth = this.width * viewport.zoom;
        const screenHeight = this.height * viewport.zoom;
        
        // Draw frame
        this.renderFrame(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw door panel(s)
        this.renderPanel(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw handle
        this.renderHandle(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw opening arc (for swing doors)
        if (this.properties.doorType === 'single' || this.properties.doorType === 'double') {
            this.renderOpeningArc(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        }
        
        // Draw threshold
        if (this.properties.threshold) {
            this.renderThreshold(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        }
        
        // Draw label
        this.renderLabel(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw selection handles if selected
        if (this.selected) {
            this.renderSelectionHandles(ctx, viewport);
        }
        
        ctx.restore();
    }

    /**
     * Render door frame
     */
    renderFrame(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        
        ctx.fillStyle = this.properties.frameColor;
        ctx.strokeStyle = this.selected ? '#0066ff' : '#000000';
        ctx.lineWidth = this.selected ? 2 : 1;
        
        // Outer frame
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
    }

    /**
     * Render door panel
     */
    renderPanel(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        
        switch (this.properties.doorType) {
            case 'single':
                this.renderSinglePanel(ctx, x, y, width, height, frameWidth);
                break;
            case 'double':
                this.renderDoublePanel(ctx, x, y, width, height, frameWidth);
                break;
            case 'sliding':
                this.renderSlidingPanel(ctx, x, y, width, height, frameWidth);
                break;
            case 'folding':
                this.renderFoldingPanel(ctx, x, y, width, height, frameWidth);
                break;
        }
    }

    /**
     * Render single door panel
     */
    renderSinglePanel(ctx, x, y, width, height, frameWidth) {
        const panelX = x + frameWidth;
        const panelY = y + frameWidth;
        const panelWidth = width - frameWidth * 2;
        const panelHeight = height - frameWidth * 2;
        
        // Panel background
        ctx.fillStyle = this.properties.panelColor;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Panel style details
        if (this.properties.panelStyle === 'glass') {
            ctx.fillStyle = 'rgba(173, 216, 230, 0.4)';
            ctx.fillRect(panelX + 10, panelY + 10, panelWidth - 20, panelHeight - 20);
        } else if (this.properties.panelStyle === 'paneled') {
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            const margin = 15;
            ctx.strokeRect(panelX + margin, panelY + margin, panelWidth - margin * 2, panelHeight / 2 - margin * 1.5);
            ctx.strokeRect(panelX + margin, panelY + height / 2 + margin / 2, panelWidth - margin * 2, panelHeight / 2 - margin * 1.5);
        }
        
        // Panel border
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    }

    /**
     * Render double door panels
     */
    renderDoublePanel(ctx, x, y, width, height, frameWidth) {
        const panelX = x + frameWidth;
        const panelY = y + frameWidth;
        const panelWidth = (width - frameWidth * 2) / 2;
        const panelHeight = height - frameWidth * 2;
        
        // Left panel
        ctx.fillStyle = this.properties.panelColor;
        ctx.fillRect(panelX, panelY, panelWidth - 2, panelHeight);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelWidth - 2, panelHeight);
        
        // Right panel
        ctx.fillRect(panelX + panelWidth + 2, panelY, panelWidth - 2, panelHeight);
        ctx.strokeRect(panelX + panelWidth + 2, panelY, panelWidth - 2, panelHeight);
        
        // Center divider
        ctx.strokeStyle = this.properties.frameColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(panelX + panelWidth, panelY);
        ctx.lineTo(panelX + panelWidth, panelY + panelHeight);
        ctx.stroke();
    }

    /**
     * Render sliding door panels
     */
    renderSlidingPanel(ctx, x, y, width, height, frameWidth) {
        const panelX = x + frameWidth;
        const panelY = y + frameWidth;
        const panelWidth = (width - frameWidth * 2) / 2;
        const panelHeight = height - frameWidth * 2;
        
        // Back panel (slightly offset)
        ctx.fillStyle = this.properties.panelColor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Front panel (overlapping)
        ctx.globalAlpha = 1.0;
        ctx.fillRect(panelX + panelWidth / 2, panelY, panelWidth, panelHeight);
        ctx.strokeRect(panelX + panelWidth / 2, panelY, panelWidth, panelHeight);
        
        // Sliding track indicator
        ctx.strokeStyle = '#999999';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(panelX, panelY + panelHeight + 5);
        ctx.lineTo(panelX + panelWidth * 2, panelY + panelHeight + 5);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Render folding door panels
     */
    renderFoldingPanel(ctx, x, y, width, height, frameWidth) {
        const panelX = x + frameWidth;
        const panelY = y + frameWidth;
        const panelWidth = (width - frameWidth * 2) / 3;
        const panelHeight = height - frameWidth * 2;
        
        ctx.fillStyle = this.properties.panelColor;
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        
        // Draw 3 folding panels
        for (let i = 0; i < 3; i++) {
            const px = panelX + i * panelWidth;
            ctx.fillRect(px, panelY, panelWidth - 2, panelHeight);
            ctx.strokeRect(px, panelY, panelWidth - 2, panelHeight);
        }
    }

    /**
     * Render door handle
     */
    renderHandle(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        const handleSize = 8;
        
        let handleX, handleY;
        
        if (this.properties.handleSide === 'right') {
            handleX = x + width - frameWidth - 20;
        } else {
            handleX = x + frameWidth + 20;
        }
        handleY = y + height / 2;
        
        // Draw handle
        ctx.fillStyle = '#C0C0C0'; // Silver
        ctx.beginPath();
        ctx.arc(handleX, handleY, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * Render opening arc for swing doors
     */
    renderOpeningArc(ctx, x, y, width, height) {
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        const radius = width - frameWidth * 2;
        
        if (this.properties.doorType === 'single') {
            const centerX = this.properties.handleSide === 'right' ? x + frameWidth : x + width - frameWidth;
            const centerY = y + height - frameWidth;
            const startAngle = this.properties.handleSide === 'right' ? Math.PI : 0;
            const endAngle = startAngle + (this.properties.openingAngle * Math.PI / 180) * 
                           (this.properties.openingDirection === 'inward' ? -1 : 1);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.stroke();
        } else if (this.properties.doorType === 'double') {
            // Left door arc
            ctx.beginPath();
            ctx.arc(x + frameWidth, y + height - frameWidth, radius / 2, Math.PI, Math.PI - Math.PI / 2);
            ctx.stroke();
            
            // Right door arc
            ctx.beginPath();
            ctx.arc(x + width - frameWidth, y + height - frameWidth, radius / 2, 0, Math.PI / 2);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }

    /**
     * Render door threshold
     */
    renderThreshold(ctx, x, y, width, height) {
        ctx.fillStyle = '#666666';
        ctx.fillRect(x, y + height - 5, width, 5);
    }

    /**
     * Render label
     */
    renderLabel(ctx, x, y, width, height) {
        if (!this.properties.label) return;
        
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const labelX = x + width / 2;
        const labelY = y - 15;
        
        ctx.fillText(this.properties.label, labelX, labelY);
    }

    /**
     * Clone door
     */
    clone() {
        const cloned = new Door(this.x + 20, this.y + 20, this.width, this.height);
        cloned.rotation = this.rotation;
        cloned.layer = this.layer;
        cloned.properties = { ...this.properties };
        return cloned;
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const door = new Door(data.x, data.y, data.width, data.height);
        door.id = data.id;
        door.rotation = data.rotation || 0;
        door.layer = data.layer || 'default';
        door.properties = { ...door.properties, ...data.properties };
        door.createdAt = data.createdAt || Date.now();
        door.modifiedAt = data.modifiedAt || Date.now();
        return door;
    }
}

// Made with Bob
