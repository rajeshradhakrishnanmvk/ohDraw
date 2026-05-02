/**
 * Glass Class
 * Represents a glass panel element (partitions, shower enclosures, etc.)
 */
import { Shape } from './Shape.js';

export class Glass extends Shape {
    constructor(x, y, width, height) {
        super('glass', x, y, width, height);
        
        // Glass-specific properties
        this.properties = {
            glassType: 'clear', // 'clear', 'frosted', 'tinted', 'tempered', 'laminated'
            thickness: 10, // Glass thickness in mm (6, 8, 10, 12, 15, 19)
            frameType: 'frameless', // 'frameless', 'framed', 'semi-framed'
            frameColor: '#C0C0C0', // Silver/aluminum
            edgeType: 'polished', // 'polished', 'beveled', 'seamed'
            tintColor: '#808080', // For tinted glass
            pattern: 'none', // 'none', 'rain', 'frosted', 'textured'
            safety: false, // Safety film applied
            label: 'G1'
        };
    }

    /**
     * Render glass panel on canvas
     */
    render(ctx, viewport) {
        ctx.save();
        
        const screenPos = viewport.worldToScreen(this.x, this.y);
        const screenWidth = this.width * viewport.scale;
        const screenHeight = this.height * viewport.scale;
        
        // Draw frame (if applicable)
        if (this.properties.frameType !== 'frameless') {
            this.renderFrame(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight, viewport);
        }
        
        // Draw glass panel
        this.renderGlassPanel(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight, viewport);
        
        // Draw edge details
        this.renderEdge(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight, viewport);
        
        // Draw pattern/texture
        if (this.properties.pattern !== 'none') {
            this.renderPattern(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight, viewport);
        }
        
        // Draw safety indicators
        if (this.properties.safety) {
            this.renderSafetyIndicators(ctx, screenPos.x, screenPos.y, screenWidth, screenHeight, viewport);
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
     * Render frame (for framed or semi-framed glass)
     */
    renderFrame(ctx, x, y, width, height, viewport) {
        const frameWidth = this.properties.frameType === 'framed' ? 20 : 10;
        
        ctx.strokeStyle = this.properties.frameColor;
        ctx.lineWidth = frameWidth;
        
        if (this.properties.frameType === 'framed') {
            // Full frame around glass
            ctx.strokeRect(x, y, width, height);
        } else if (this.properties.frameType === 'semi-framed') {
            // Frame on top and bottom only
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.moveTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.stroke();
        }
        
        // Add frame highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
    }

    /**
     * Render glass panel
     */
    renderGlassPanel(ctx, x, y, width, height, viewport) {
        const inset = this.properties.frameType === 'frameless' ? 0 : 
                     this.properties.frameType === 'framed' ? 10 : 5;
        
        const glassX = x + inset;
        const glassY = y + inset;
        const glassWidth = width - inset * 2;
        const glassHeight = height - inset * 2;
        
        // Base glass color based on type
        let glassColor;
        switch (this.properties.glassType) {
            case 'clear':
                glassColor = 'rgba(173, 216, 230, 0.2)'; // Very light blue
                break;
            case 'frosted':
                glassColor = 'rgba(220, 220, 220, 0.6)'; // Light gray
                break;
            case 'tinted':
                const tint = this.hexToRgb(this.properties.tintColor);
                glassColor = `rgba(${tint.r}, ${tint.g}, ${tint.b}, 0.4)`;
                break;
            case 'tempered':
                glassColor = 'rgba(173, 216, 230, 0.25)'; // Slightly blue
                break;
            case 'laminated':
                glassColor = 'rgba(200, 220, 230, 0.3)'; // Slightly greenish
                break;
            default:
                glassColor = 'rgba(173, 216, 230, 0.2)';
        }
        
        // Fill glass area
        ctx.fillStyle = glassColor;
        ctx.fillRect(glassX, glassY, glassWidth, glassHeight);
        
        // Add glass reflection effect
        this.renderReflection(ctx, glassX, glassY, glassWidth, glassHeight);
        
        // Border
        ctx.strokeStyle = this.selected ? '#0066ff' : 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = this.selected ? 2 : 1;
        ctx.strokeRect(glassX, glassY, glassWidth, glassHeight);
    }

    /**
     * Render glass reflection effect
     */
    renderReflection(ctx, x, y, width, height) {
        // Skip if dimensions are too small or invalid
        if (width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
            return;
        }
        
        // Diagonal gradient for reflection
        const gradientEndX = x + width * 0.3;
        const gradientEndY = y + height * 0.3;
        
        // Ensure gradient coordinates are valid
        if (!isFinite(gradientEndX) || !isFinite(gradientEndY)) {
            return;
        }
        
        const gradient = ctx.createLinearGradient(x, y, gradientEndX, gradientEndY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width * 0.3, y);
        ctx.lineTo(x, y + height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Add subtle shine lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const offset = i * 20;
            ctx.beginPath();
            ctx.moveTo(x + offset, y);
            ctx.lineTo(x, y + offset);
            ctx.stroke();
        }
    }

    /**
     * Render edge details
     */
    renderEdge(ctx, x, y, width, height, viewport) {
        if (this.properties.edgeType === 'beveled') {
            // Draw beveled edge effect
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
        } else if (this.properties.edgeType === 'polished') {
            // Draw polished edge shine
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
        }
    }

    /**
     * Render pattern/texture
     */
    renderPattern(ctx, x, y, width, height, viewport) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        switch (this.properties.pattern) {
            case 'rain':
                this.renderRainPattern(ctx, x, y, width, height);
                break;
            case 'frosted':
                this.renderFrostedPattern(ctx, x, y, width, height);
                break;
            case 'textured':
                this.renderTexturedPattern(ctx, x, y, width, height);
                break;
        }
        
        ctx.restore();
    }

    /**
     * Render rain glass pattern
     */
    renderRainPattern(ctx, x, y, width, height) {
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 20; i++) {
            const rx = x + Math.random() * width;
            const ry = y + Math.random() * height;
            const length = 10 + Math.random() * 20;
            
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx, ry + length);
            ctx.stroke();
        }
    }

    /**
     * Render frosted glass pattern
     */
    renderFrostedPattern(ctx, x, y, width, height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        
        for (let i = 0; i < 50; i++) {
            const rx = x + Math.random() * width;
            const ry = y + Math.random() * height;
            const size = 2 + Math.random() * 4;
            
            ctx.beginPath();
            ctx.arc(rx, ry, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Render textured glass pattern
     */
    renderTexturedPattern(ctx, x, y, width, height) {
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i < height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(x, y + i);
            ctx.lineTo(x + width, y + i);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i < width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i, y + height);
            ctx.stroke();
        }
    }

    /**
     * Render safety indicators (corner marks)
     */
    renderSafetyIndicators(ctx, x, y, width, height, viewport) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        const markSize = 15;
        
        // Corner marks
        const corners = [
            { x: x + 10, y: y + 10 },
            { x: x + width - 10 - markSize, y: y + 10 },
            { x: x + 10, y: y + height - 10 - markSize },
            { x: x + width - 10 - markSize, y: y + height - 10 - markSize }
        ];
        
        corners.forEach(corner => {
            ctx.fillRect(corner.x, corner.y, markSize, markSize);
        });
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
        
        // Add thickness indicator
        ctx.font = '10px Arial';
        ctx.fillText(`${this.properties.thickness}mm`, labelX, y + height + 15);
    }

    /**
     * Helper: Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 128, g: 128, b: 128 };
    }

    /**
     * Clone glass panel
     */
    clone() {
        const cloned = new Glass(this.x + 20, this.y + 20, this.width, this.height);
        cloned.rotation = this.rotation;
        cloned.layer = this.layer;
        cloned.properties = { ...this.properties };
        return cloned;
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const glass = new Glass(data.x, data.y, data.width, data.height);
        glass.id = data.id;
        glass.rotation = data.rotation || 0;
        glass.layer = data.layer || 'default';
        glass.properties = { ...glass.properties, ...data.properties };
        glass.createdAt = data.createdAt || Date.now();
        glass.modifiedAt = data.modifiedAt || Date.now();
        return glass;
    }
}

// Made with Bob
