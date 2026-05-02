/**
 * Window Class
 * Represents a window element with frame and glass properties
 */
import { Shape } from './Shape.js';

export class Window extends Shape {
    constructor(x, y, width, height) {
        super('window', x, y, width, height);
        
        // Window-specific properties
        this.properties = {
            frameType: 'double', // 'single', 'double', 'sliding'
            frameColor: '#8B4513', // Brown
            frameWidth: 50, // Frame thickness in mm
            glassType: 'clear', // 'clear', 'frosted', 'tinted'
            openingDirection: 'right', // 'left', 'right', 'top', 'bottom', 'none'
            mullions: false, // Vertical dividers
            transoms: false, // Horizontal dividers
            sillHeight: 900, // Height from floor in mm
            label: 'W1'
        };
    }

    /**
     * Render window on canvas
     */
    render(ctx, viewport) {
        ctx.save();
        
        const screenPos = viewport.worldToScreen(this.x, this.y);
        const screenWidth = this.width * viewport.zoom;
        const screenHeight = this.height * viewport.zoom;
        
        // Draw frame
        this.renderFrame(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw glass
        this.renderGlass(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw opening direction indicator
        if (this.properties.openingDirection !== 'none') {
            this.renderOpeningIndicator(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        }
        
        // Draw mullions and transoms if enabled
        if (this.properties.mullions) {
            this.renderMullions(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
        }
        if (this.properties.transoms) {
            this.renderTransoms(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight);
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
     * Render window frame
     */
    renderFrame(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        
        ctx.fillStyle = this.properties.frameColor;
        ctx.strokeStyle = this.selected ? '#0066ff' : '#000000';
        ctx.lineWidth = this.selected ? 2 : 1;
        
        // Outer frame
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Inner frame (for double frame)
        if (this.properties.frameType === 'double') {
            const innerX = x + frameWidth;
            const innerY = y + frameWidth;
            const innerWidth = width - frameWidth * 2;
            const innerHeight = height - frameWidth * 2;
            
            ctx.strokeRect(innerX, innerY, innerWidth, innerHeight);
        }
    }

    /**
     * Render glass area
     */
    renderGlass(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        const glassX = x + frameWidth;
        const glassY = y + frameWidth;
        const glassWidth = width - frameWidth * 2;
        const glassHeight = height - frameWidth * 2;
        
        // Glass fill based on type
        switch (this.properties.glassType) {
            case 'clear':
                ctx.fillStyle = 'rgba(173, 216, 230, 0.3)'; // Light blue
                break;
            case 'frosted':
                ctx.fillStyle = 'rgba(220, 220, 220, 0.5)'; // Light gray
                break;
            case 'tinted':
                ctx.fillStyle = 'rgba(100, 100, 100, 0.4)'; // Dark gray
                break;
        }
        
        ctx.fillRect(glassX, glassY, glassWidth, glassHeight);
        
        // Glass reflection effect (diagonal lines)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(glassX, glassY);
        ctx.lineTo(glassX + glassWidth * 0.3, glassY);
        ctx.lineTo(glassX, glassY + glassHeight * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Render opening direction indicator
     */
    renderOpeningIndicator(ctx, x, y, width, height) {
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const arrowSize = Math.min(width, height) * 0.2;
        
        ctx.beginPath();
        switch (this.properties.openingDirection) {
            case 'left':
                ctx.moveTo(centerX + arrowSize, centerY);
                ctx.lineTo(centerX - arrowSize, centerY);
                ctx.lineTo(centerX - arrowSize / 2, centerY - arrowSize / 2);
                ctx.moveTo(centerX - arrowSize, centerY);
                ctx.lineTo(centerX - arrowSize / 2, centerY + arrowSize / 2);
                break;
            case 'right':
                ctx.moveTo(centerX - arrowSize, centerY);
                ctx.lineTo(centerX + arrowSize, centerY);
                ctx.lineTo(centerX + arrowSize / 2, centerY - arrowSize / 2);
                ctx.moveTo(centerX + arrowSize, centerY);
                ctx.lineTo(centerX + arrowSize / 2, centerY + arrowSize / 2);
                break;
            case 'top':
                ctx.moveTo(centerX, centerY + arrowSize);
                ctx.lineTo(centerX, centerY - arrowSize);
                ctx.lineTo(centerX - arrowSize / 2, centerY - arrowSize / 2);
                ctx.moveTo(centerX, centerY - arrowSize);
                ctx.lineTo(centerX + arrowSize / 2, centerY - arrowSize / 2);
                break;
            case 'bottom':
                ctx.moveTo(centerX, centerY - arrowSize);
                ctx.lineTo(centerX, centerY + arrowSize);
                ctx.lineTo(centerX - arrowSize / 2, centerY + arrowSize / 2);
                ctx.moveTo(centerX, centerY + arrowSize);
                ctx.lineTo(centerX + arrowSize / 2, centerY + arrowSize / 2);
                break;
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Render mullions (vertical dividers)
     */
    renderMullions(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        const glassX = x + frameWidth;
        const glassY = y + frameWidth;
        const glassWidth = width - frameWidth * 2;
        const glassHeight = height - frameWidth * 2;
        
        ctx.strokeStyle = this.properties.frameColor;
        ctx.lineWidth = 2;
        
        // Draw vertical divider in the middle
        ctx.beginPath();
        ctx.moveTo(glassX + glassWidth / 2, glassY);
        ctx.lineTo(glassX + glassWidth / 2, glassY + glassHeight);
        ctx.stroke();
    }

    /**
     * Render transoms (horizontal dividers)
     */
    renderTransoms(ctx, x, y, width, height) {
        const frameWidth = Math.max(2, this.properties.frameWidth * viewport.zoom / 10);
        const glassX = x + frameWidth;
        const glassY = y + frameWidth;
        const glassWidth = width - frameWidth * 2;
        const glassHeight = height - frameWidth * 2;
        
        ctx.strokeStyle = this.properties.frameColor;
        ctx.lineWidth = 2;
        
        // Draw horizontal divider in the middle
        ctx.beginPath();
        ctx.moveTo(glassX, glassY + glassHeight / 2);
        ctx.lineTo(glassX + glassWidth, glassY + glassHeight / 2);
        ctx.stroke();
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
     * Clone window
     */
    clone() {
        const cloned = new Window(this.x + 20, this.y + 20, this.width, this.height);
        cloned.rotation = this.rotation;
        cloned.layer = this.layer;
        cloned.properties = { ...this.properties };
        return cloned;
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const window = new Window(data.x, data.y, data.width, data.height);
        window.id = data.id;
        window.rotation = data.rotation || 0;
        window.layer = data.layer || 'default';
        window.properties = { ...window.properties, ...data.properties };
        window.createdAt = data.createdAt || Date.now();
        window.modifiedAt = data.modifiedAt || Date.now();
        return window;
    }
}

// Made with Bob
