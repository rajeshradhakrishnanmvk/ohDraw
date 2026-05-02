/**
 * LayerManager.js - Professional Layer Management System
 * Handles layer organization, visibility, and Z-ordering
 */

export class Layer {
    constructor(id, name, color = '#000000') {
        this.id = id;
        this.name = name;
        this.color = color;
        this.visible = true;
        this.locked = false;
        this.opacity = 1.0;
        this.order = 0;
        this.objects = [];
    }

    /**
     * Add object to layer
     */
    addObject(object) {
        if (!this.objects.includes(object)) {
            this.objects.push(object);
            object.layer = this.id;
        }
    }

    /**
     * Remove object from layer
     */
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    /**
     * Get all objects in layer
     */
    getObjects() {
        return this.objects;
    }

    /**
     * Set layer visibility
     */
    setVisible(visible) {
        this.visible = visible;
    }

    /**
     * Set layer locked state
     */
    setLocked(locked) {
        this.locked = locked;
    }

    /**
     * Set layer opacity
     */
    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            visible: this.visible,
            locked: this.locked,
            opacity: this.opacity,
            order: this.order
        };
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const layer = new Layer(data.id, data.name, data.color);
        layer.visible = data.visible !== undefined ? data.visible : true;
        layer.locked = data.locked !== undefined ? data.locked : false;
        layer.opacity = data.opacity !== undefined ? data.opacity : 1.0;
        layer.order = data.order !== undefined ? data.order : 0;
        return layer;
    }
}

export class LayerManager {
    constructor() {
        this.layers = new Map();
        this.activeLayerId = null;
        this.nextLayerId = 1;
        
        // Create default layers
        this.createDefaultLayers();
    }

    /**
     * Create default architectural layers
     */
    createDefaultLayers() {
        this.createLayer('Background', '#CCCCCC', 0);
        this.createLayer('Walls', '#000000', 1);
        this.createLayer('Windows', '#0066FF', 2);
        this.createLayer('Doors', '#FF6600', 3);
        this.createLayer('Glass', '#00CCFF', 4);
        this.createLayer('Dimensions', '#FF0000', 5);
        this.createLayer('Annotations', '#00FF00', 6);
        
        // Set Windows layer as active
        const windowsLayer = this.getLayerByName('Windows');
        if (windowsLayer) {
            this.activeLayerId = windowsLayer.id;
        }
    }

    /**
     * Create a new layer
     */
    createLayer(name, color = '#000000', order = null) {
        const id = `layer-${this.nextLayerId++}`;
        const layer = new Layer(id, name, color);
        
        if (order !== null) {
            layer.order = order;
        } else {
            layer.order = this.layers.size;
        }
        
        this.layers.set(id, layer);
        
        if (!this.activeLayerId) {
            this.activeLayerId = id;
        }
        
        return layer;
    }

    /**
     * Delete a layer
     */
    deleteLayer(layerId) {
        if (this.layers.size <= 1) {
            throw new Error('Cannot delete the last layer');
        }
        
        const layer = this.layers.get(layerId);
        if (!layer) return false;
        
        // Move objects to another layer
        if (layer.objects.length > 0) {
            const targetLayer = this.getFirstAvailableLayer(layerId);
            if (targetLayer) {
                layer.objects.forEach(obj => {
                    targetLayer.addObject(obj);
                });
            }
        }
        
        this.layers.delete(layerId);
        
        // Update active layer if needed
        if (this.activeLayerId === layerId) {
            this.activeLayerId = this.layers.keys().next().value;
        }
        
        return true;
    }

    /**
     * Get first available layer (not the one being deleted)
     */
    getFirstAvailableLayer(excludeId) {
        for (const [id, layer] of this.layers) {
            if (id !== excludeId) {
                return layer;
            }
        }
        return null;
    }

    /**
     * Get layer by ID
     */
    getLayer(layerId) {
        return this.layers.get(layerId);
    }

    /**
     * Get layer by name
     */
    getLayerByName(name) {
        for (const layer of this.layers.values()) {
            if (layer.name === name) {
                return layer;
            }
        }
        return null;
    }

    /**
     * Get active layer
     */
    getActiveLayer() {
        return this.layers.get(this.activeLayerId);
    }

    /**
     * Set active layer
     */
    setActiveLayer(layerId) {
        if (this.layers.has(layerId)) {
            this.activeLayerId = layerId;
            return true;
        }
        return false;
    }

    /**
     * Get all layers sorted by order
     */
    getAllLayers() {
        return Array.from(this.layers.values()).sort((a, b) => a.order - b.order);
    }

    /**
     * Get visible layers
     */
    getVisibleLayers() {
        return this.getAllLayers().filter(layer => layer.visible);
    }

    /**
     * Move layer up in order
     */
    moveLayerUp(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return false;
        
        const layers = this.getAllLayers();
        const index = layers.indexOf(layer);
        
        if (index < layers.length - 1) {
            const temp = layer.order;
            layer.order = layers[index + 1].order;
            layers[index + 1].order = temp;
            return true;
        }
        
        return false;
    }

    /**
     * Move layer down in order
     */
    moveLayerDown(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return false;
        
        const layers = this.getAllLayers();
        const index = layers.indexOf(layer);
        
        if (index > 0) {
            const temp = layer.order;
            layer.order = layers[index - 1].order;
            layers[index - 1].order = temp;
            return true;
        }
        
        return false;
    }

    /**
     * Assign object to layer
     */
    assignObjectToLayer(object, layerId) {
        // Remove from current layer
        if (object.layer) {
            const currentLayer = this.layers.get(object.layer);
            if (currentLayer) {
                currentLayer.removeObject(object);
            }
        }
        
        // Add to new layer
        const newLayer = this.layers.get(layerId);
        if (newLayer) {
            newLayer.addObject(object);
            return true;
        }
        
        return false;
    }

    /**
     * Get all objects across all layers
     */
    getAllObjects() {
        const objects = [];
        const layers = this.getAllLayers();
        
        layers.forEach(layer => {
            if (layer.visible) {
                objects.push(...layer.objects);
            }
        });
        
        return objects;
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            layers: Array.from(this.layers.values()).map(layer => layer.toJSON()),
            activeLayerId: this.activeLayerId,
            nextLayerId: this.nextLayerId
        };
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(data) {
        const manager = new LayerManager();
        manager.layers.clear();
        manager.nextLayerId = data.nextLayerId || 1;
        
        data.layers.forEach(layerData => {
            const layer = Layer.fromJSON(layerData);
            manager.layers.set(layer.id, layer);
        });
        
        manager.activeLayerId = data.activeLayerId;
        
        return manager;
    }
}

// Made with Bob
