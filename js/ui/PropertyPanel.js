/**
 * PropertyPanel Class
 * Manages the property editing panel for selected objects
 */
export class PropertyPanel {
    constructor(panelElement) {
        this.panel = panelElement;
        this.selectedObjects = [];
        this.onPropertyChange = null; // Callback for property changes
    }

    /**
     * Update panel with selected objects
     */
    update(selectedObjects) {
        this.selectedObjects = selectedObjects;
        
        if (selectedObjects.length === 0) {
            this.showEmptyState();
        } else if (selectedObjects.length === 1) {
            this.showSingleObjectProperties(selectedObjects[0]);
        } else {
            this.showMultipleObjectsProperties(selectedObjects);
        }
    }

    /**
     * Show empty state (no selection)
     */
    showEmptyState() {
        this.panel.innerHTML = `
            <div class="property-empty">
                <p>No object selected</p>
                <p class="hint">Select an object to edit its properties</p>
            </div>
        `;
    }

    /**
     * Show properties for single object
     */
    showSingleObjectProperties(obj) {
        let html = `
            <div class="property-section">
                <h3>${this.getObjectTypeName(obj.type)}</h3>
                <div class="property-id">ID: ${obj.id.substring(0, 12)}...</div>
            </div>
        `;

        // Position and size
        html += this.createSection('Position & Size', [
            this.createNumberInput('X', obj.x, 'x', obj),
            this.createNumberInput('Y', obj.y, 'y', obj),
            this.createNumberInput('Width', obj.width, 'width', obj),
            this.createNumberInput('Height', obj.height, 'height', obj),
            this.createNumberInput('Rotation', obj.rotation, 'rotation', obj, '°')
        ]);

        // Type-specific properties
        if (obj.type === 'window') {
            html += this.createWindowProperties(obj);
        } else if (obj.type === 'door') {
            html += this.createDoorProperties(obj);
        } else if (obj.type === 'glass') {
            html += this.createGlassProperties(obj);
        }

        // Layer
        html += this.createSection('Layer', [
            this.createTextInput('Layer', obj.layer, 'layer', obj)
        ]);

        this.panel.innerHTML = html;
        this.attachEventListeners();
    }

    /**
     * Show properties for multiple objects
     */
    showMultipleObjectsProperties(objects) {
        this.panel.innerHTML = `
            <div class="property-section">
                <h3>Multiple Objects (${objects.length})</h3>
                <p class="hint">Select a single object to edit detailed properties</p>
            </div>
            <div class="property-section">
                <h4>Common Actions</h4>
                <button class="btn-delete" data-action="delete">Delete Selected</button>
                <button class="btn-duplicate" data-action="duplicate">Duplicate Selected</button>
            </div>
        `;
        this.attachEventListeners();
    }

    /**
     * Create window-specific properties
     */
    createWindowProperties(obj) {
        return this.createSection('Window Properties', [
            this.createSelect('Frame Type', obj.properties.frameType, 'frameType', obj, [
                { value: 'single', label: 'Single' },
                { value: 'double', label: 'Double' },
                { value: 'sliding', label: 'Sliding' }
            ]),
            this.createColorInput('Frame Color', obj.properties.frameColor, 'frameColor', obj),
            this.createNumberInput('Frame Width', obj.properties.frameWidth, 'frameWidth', obj, 'mm'),
            this.createSelect('Glass Type', obj.properties.glassType, 'glassType', obj, [
                { value: 'clear', label: 'Clear' },
                { value: 'frosted', label: 'Frosted' },
                { value: 'tinted', label: 'Tinted' }
            ]),
            this.createSelect('Opening Direction', obj.properties.openingDirection, 'openingDirection', obj, [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
                { value: 'none', label: 'None' }
            ]),
            this.createCheckbox('Mullions', obj.properties.mullions, 'mullions', obj),
            this.createCheckbox('Transoms', obj.properties.transoms, 'transoms', obj),
            this.createTextInput('Label', obj.properties.label, 'label', obj)
        ]);
    }

    /**
     * Create door-specific properties
     */
    createDoorProperties(obj) {
        return this.createSection('Door Properties', [
            this.createSelect('Door Type', obj.properties.doorType, 'doorType', obj, [
                { value: 'single', label: 'Single' },
                { value: 'double', label: 'Double' },
                { value: 'sliding', label: 'Sliding' },
                { value: 'folding', label: 'Folding' }
            ]),
            this.createColorInput('Frame Color', obj.properties.frameColor, 'frameColor', obj),
            this.createColorInput('Panel Color', obj.properties.panelColor, 'panelColor', obj),
            this.createNumberInput('Frame Width', obj.properties.frameWidth, 'frameWidth', obj, 'mm'),
            this.createSelect('Handle Side', obj.properties.handleSide, 'handleSide', obj, [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' }
            ]),
            this.createNumberInput('Opening Angle', obj.properties.openingAngle, 'openingAngle', obj, '°'),
            this.createSelect('Opening Direction', obj.properties.openingDirection, 'openingDirection', obj, [
                { value: 'inward', label: 'Inward' },
                { value: 'outward', label: 'Outward' }
            ]),
            this.createSelect('Panel Style', obj.properties.panelStyle, 'panelStyle', obj, [
                { value: 'solid', label: 'Solid' },
                { value: 'glass', label: 'Glass' },
                { value: 'paneled', label: 'Paneled' }
            ]),
            this.createCheckbox('Threshold', obj.properties.threshold, 'threshold', obj),
            this.createTextInput('Label', obj.properties.label, 'label', obj)
        ]);
    }

    /**
     * Create glass-specific properties
     */
    createGlassProperties(obj) {
        return this.createSection('Glass Properties', [
            this.createSelect('Glass Type', obj.properties.glassType, 'glassType', obj, [
                { value: 'clear', label: 'Clear' },
                { value: 'frosted', label: 'Frosted' },
                { value: 'tinted', label: 'Tinted' },
                { value: 'tempered', label: 'Tempered' },
                { value: 'laminated', label: 'Laminated' }
            ]),
            this.createNumberInput('Thickness', obj.properties.thickness, 'thickness', obj, 'mm'),
            this.createSelect('Frame Type', obj.properties.frameType, 'frameType', obj, [
                { value: 'frameless', label: 'Frameless' },
                { value: 'framed', label: 'Framed' },
                { value: 'semi-framed', label: 'Semi-Framed' }
            ]),
            this.createColorInput('Frame Color', obj.properties.frameColor, 'frameColor', obj),
            this.createSelect('Edge Type', obj.properties.edgeType, 'edgeType', obj, [
                { value: 'polished', label: 'Polished' },
                { value: 'beveled', label: 'Beveled' },
                { value: 'seamed', label: 'Seamed' }
            ]),
            this.createColorInput('Tint Color', obj.properties.tintColor, 'tintColor', obj),
            this.createSelect('Pattern', obj.properties.pattern, 'pattern', obj, [
                { value: 'none', label: 'None' },
                { value: 'rain', label: 'Rain' },
                { value: 'frosted', label: 'Frosted' },
                { value: 'textured', label: 'Textured' }
            ]),
            this.createCheckbox('Safety Film', obj.properties.safety, 'safety', obj),
            this.createTextInput('Label', obj.properties.label, 'label', obj)
        ]);
    }

    /**
     * Create a section
     */
    createSection(title, content) {
        return `
            <div class="property-section">
                <h4>${title}</h4>
                ${content.join('')}
            </div>
        `;
    }

    /**
     * Create number input
     */
    createNumberInput(label, value, property, obj, unit = '') {
        return `
            <div class="property-row">
                <label>${label}:</label>
                <div class="input-group">
                    <input type="number" 
                           value="${value}" 
                           data-property="${property}" 
                           data-object-id="${obj.id}"
                           step="${property === 'rotation' ? 1 : 10}">
                    ${unit ? `<span class="unit">${unit}</span>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Create text input
     */
    createTextInput(label, value, property, obj) {
        return `
            <div class="property-row">
                <label>${label}:</label>
                <input type="text" 
                       value="${value}" 
                       data-property="${property}" 
                       data-object-id="${obj.id}">
            </div>
        `;
    }

    /**
     * Create color input
     */
    createColorInput(label, value, property, obj) {
        return `
            <div class="property-row">
                <label>${label}:</label>
                <input type="color" 
                       value="${value}" 
                       data-property="${property}" 
                       data-object-id="${obj.id}">
            </div>
        `;
    }

    /**
     * Create select dropdown
     */
    createSelect(label, value, property, obj, options) {
        const optionsHtml = options.map(opt => 
            `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        
        return `
            <div class="property-row">
                <label>${label}:</label>
                <select data-property="${property}" data-object-id="${obj.id}">
                    ${optionsHtml}
                </select>
            </div>
        `;
    }

    /**
     * Create checkbox
     */
    createCheckbox(label, value, property, obj) {
        return `
            <div class="property-row">
                <label>
                    <input type="checkbox" 
                           ${value ? 'checked' : ''} 
                           data-property="${property}" 
                           data-object-id="${obj.id}">
                    ${label}
                </label>
            </div>
        `;
    }

    /**
     * Attach event listeners to inputs
     */
    attachEventListeners() {
        // Input change listeners
        const inputs = this.panel.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => this.handlePropertyChange(e));
            if (input.type === 'number' || input.type === 'text') {
                input.addEventListener('input', (e) => this.handlePropertyChange(e));
            }
        });

        // Button listeners
        const deleteBtn = this.panel.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.onPropertyChange) {
                    this.onPropertyChange({ action: 'delete' });
                }
            });
        }

        const duplicateBtn = this.panel.querySelector('[data-action="duplicate"]');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', () => {
                if (this.onPropertyChange) {
                    this.onPropertyChange({ action: 'duplicate' });
                }
            });
        }
    }

    /**
     * Handle property change
     */
    handlePropertyChange(event) {
        const input = event.target;
        const property = input.dataset.property;
        const objectId = input.dataset.objectId;
        
        if (!property || !objectId) return;
        
        // Get value based on input type
        let value;
        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'number') {
            value = parseFloat(input.value);
        } else {
            value = input.value;
        }
        
        // Find the object
        const obj = this.selectedObjects.find(o => o.id === objectId);
        if (!obj) return;
        
        // Update the property
        if (property === 'x' || property === 'y') {
            if (property === 'x') {
                obj.setPosition(value, obj.y);
            } else {
                obj.setPosition(obj.x, value);
            }
        } else if (property === 'width' || property === 'height') {
            if (property === 'width') {
                obj.resize(value, obj.height);
            } else {
                obj.resize(obj.width, value);
            }
        } else if (property === 'rotation') {
            obj.rotate(value);
        } else if (property === 'layer') {
            obj.layer = value;
        } else {
            // Type-specific property
            obj.setProperty(property, value);
        }
        
        // Trigger callback
        if (this.onPropertyChange) {
            this.onPropertyChange({
                action: 'update',
                object: obj,
                property: property,
                value: value
            });
        }
    }

    /**
     * Get object type display name
     */
    getObjectTypeName(type) {
        const names = {
            'window': 'Window',
            'door': 'Door',
            'glass': 'Glass Panel',
            'line': 'Line'
        };
        return names[type] || 'Object';
    }

    /**
     * Set property change callback
     */
    setOnPropertyChange(callback) {
        this.onPropertyChange = callback;
    }
}

// Made with Bob
