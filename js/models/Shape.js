/**
 * Base Shape Class
 * Foundation for all drawable objects (Window, Door, Glass)
 */
export class Shape {
    constructor(type, x, y, width, height) {
        this.id = this.generateId();
        this.type = type; // 'window', 'door', 'glass', 'line'
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = 0; // in degrees
        this.layer = 'default';
        this.selected = false;
        this.properties = {};
        this.createdAt = Date.now();
        this.modifiedAt = Date.now();
    }

    /**
     * Generate unique ID for the shape
     */
    generateId() {
        return `${this.type || 'shape'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get bounding box in world coordinates
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }

    /**
     * Check if point is inside shape
     */
    containsPoint(x, y) {
        const bounds = this.getBounds();
        return x >= bounds.left && x <= bounds.right &&
               y >= bounds.top && y <= bounds.bottom;
    }

    /**
     * Check if shape intersects with rectangle
     */
    intersectsRect(rect) {
        const bounds = this.getBounds();
        return !(rect.right < bounds.left || 
                 rect.left > bounds.right || 
                 rect.bottom < bounds.top || 
                 rect.top > bounds.bottom);
    }

    /**
     * Move shape by delta
     */
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.modifiedAt = Date.now();
    }

    /**
     * Set position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.modifiedAt = Date.now();
    }

    /**
     * Resize shape
     */
    resize(width, height) {
        this.width = Math.max(1, width);
        this.height = Math.max(1, height);
        this.modifiedAt = Date.now();
    }

    /**
     * Rotate shape
     */
    rotate(angle) {
        this.rotation = angle % 360;
        this.modifiedAt = Date.now();
    }

    /**
     * Select/deselect shape
     */
    setSelected(selected) {
        this.selected = selected;
    }

    /**
     * Update property
     */
    setProperty(key, value) {
        this.properties[key] = value;
        this.modifiedAt = Date.now();
    }

    /**
     * Get property
     */
    getProperty(key, defaultValue = null) {
        return this.properties.hasOwnProperty(key) ? this.properties[key] : defaultValue;
    }

    /**
     * Clone shape
     */
    clone() {
        const cloned = new this.constructor(this.x + 20, this.y + 20, this.width, this.height);
        cloned.rotation = this.rotation;
        cloned.layer = this.layer;
        cloned.properties = { ...this.properties };
        return cloned;
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation,
            layer: this.layer,
            properties: this.properties,
            createdAt: this.createdAt,
            modifiedAt: this.modifiedAt
        };
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const shape = new Shape(data.type, data.x, data.y, data.width, data.height);
        shape.id = data.id;
        shape.rotation = data.rotation || 0;
        shape.layer = data.layer || 'default';
        shape.properties = data.properties || {};
        shape.createdAt = data.createdAt || Date.now();
        shape.modifiedAt = data.modifiedAt || Date.now();
        return shape;
    }

    /**
     * Render shape on canvas (to be overridden by subclasses)
     */
    render(ctx, viewport) {
        // Base implementation - draw a simple rectangle
        ctx.save();
        
        // Apply transformation
        const screenPos = viewport.worldToScreen(this.x, this.y);
        const screenWidth = this.width * viewport.zoom;
        const screenHeight = this.height * viewport.zoom;
        
        // Draw shape
        ctx.strokeStyle = this.selected ? '#0066ff' : '#333333';
        ctx.lineWidth = this.selected ? 2 : 1;
        ctx.strokeRect(screenPos.x, screenPos.y, screenWidth, screenHeight);
        
        // Draw selection handles if selected
        if (this.selected) {
            this.renderSelectionHandles(ctx, viewport);
        }
        
        ctx.restore();
    }

    /**
     * Render selection handles
     */
    renderSelectionHandles(ctx, viewport) {
        const screenPos = viewport.worldToScreen(this.x, this.y);
        const screenWidth = this.width * viewport.zoom;
        const screenHeight = this.height * viewport.zoom;
        
        const handleSize = 8;
        const handles = [
            { x: screenPos.x, y: screenPos.y }, // top-left
            { x: screenPos.x + screenWidth / 2, y: screenPos.y }, // top-center
            { x: screenPos.x + screenWidth, y: screenPos.y }, // top-right
            { x: screenPos.x + screenWidth, y: screenPos.y + screenHeight / 2 }, // right-center
            { x: screenPos.x + screenWidth, y: screenPos.y + screenHeight }, // bottom-right
            { x: screenPos.x + screenWidth / 2, y: screenPos.y + screenHeight }, // bottom-center
            { x: screenPos.x, y: screenPos.y + screenHeight }, // bottom-left
            { x: screenPos.x, y: screenPos.y + screenHeight / 2 } // left-center
        ];
        
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        
        handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
    }

    /**
     * Get handle at screen position (for resizing)
     */
    getHandleAt(screenX, screenY, viewport) {
        if (!this.selected) return null;
        
        const screenPos = viewport.worldToScreen(this.x, this.y);
        const screenWidth = this.width * viewport.zoom;
        const screenHeight = this.height * viewport.zoom;
        
        const handleSize = 8;
        const threshold = handleSize;
        
        const handles = [
            { name: 'nw', x: screenPos.x, y: screenPos.y },
            { name: 'n', x: screenPos.x + screenWidth / 2, y: screenPos.y },
            { name: 'ne', x: screenPos.x + screenWidth, y: screenPos.y },
            { name: 'e', x: screenPos.x + screenWidth, y: screenPos.y + screenHeight / 2 },
            { name: 'se', x: screenPos.x + screenWidth, y: screenPos.y + screenHeight },
            { name: 's', x: screenPos.x + screenWidth / 2, y: screenPos.y + screenHeight },
            { name: 'sw', x: screenPos.x, y: screenPos.y + screenHeight },
            { name: 'w', x: screenPos.x, y: screenPos.y + screenHeight / 2 }
        ];
        
        for (const handle of handles) {
            const dx = screenX - handle.x;
            const dy = screenY - handle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= threshold) {
                return handle.name;
            }
        }
        
        return null;
    }
}

// Made with Bob
