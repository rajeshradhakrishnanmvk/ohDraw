/**
 * SelectTool Class
 * Handles object selection, multi-selection, and manipulation
 */
export class SelectTool {
    constructor(canvas, viewport, grid) {
        this.canvas = canvas;
        this.viewport = viewport;
        this.grid = grid;
        this.objects = []; // Reference to all objects in the scene
        this.selectedObjects = [];
        
        // Selection box
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        
        // Dragging
        this.isDragging = false;
        this.dragStart = null;
        this.dragOffset = [];
        
        // Resizing
        this.isResizing = false;
        this.resizeHandle = null;
        this.resizeStart = null;
        this.resizeOriginal = null;
    }

    /**
     * Set objects reference
     */
    setObjects(objects) {
        this.objects = objects;
    }

    /**
     * Handle mouse down event
     */
    onMouseDown(worldX, worldY, event) {
        const shiftKey = event.shiftKey;
        
        // Check if clicking on a resize handle
        const handleInfo = this.getHandleAtPosition(worldX, worldY);
        if (handleInfo) {
            this.startResize(handleInfo, worldX, worldY);
            return;
        }
        
        // Check if clicking on an object
        const clickedObject = this.getObjectAtPosition(worldX, worldY);
        
        if (clickedObject) {
            // Handle selection
            if (shiftKey) {
                // Multi-select: toggle selection
                this.toggleSelection(clickedObject);
            } else {
                // Single select
                if (!clickedObject.selected) {
                    this.clearSelection();
                    this.selectObject(clickedObject);
                }
            }
            
            // Start dragging
            this.startDrag(worldX, worldY);
        } else {
            // Start selection box
            if (!shiftKey) {
                this.clearSelection();
            }
            this.startSelectionBox(worldX, worldY);
        }
    }

    /**
     * Handle mouse move event
     */
    onMouseMove(worldX, worldY, event) {
        // Handle resizing
        if (this.isResizing) {
            this.updateResize(worldX, worldY);
            return;
        }
        
        // Handle dragging
        if (this.isDragging) {
            this.updateDrag(worldX, worldY);
            return;
        }
        
        // Handle selection box
        if (this.isSelecting) {
            this.updateSelectionBox(worldX, worldY);
            return;
        }
        
        // Update cursor based on hover
        this.updateCursor(worldX, worldY);
    }

    /**
     * Handle mouse up event
     */
    onMouseUp(worldX, worldY, event) {
        // Finish resizing
        if (this.isResizing) {
            this.finishResize();
            return;
        }
        
        // Finish dragging
        if (this.isDragging) {
            this.finishDrag();
            return;
        }
        
        // Finish selection box
        if (this.isSelecting) {
            this.finishSelectionBox();
            return;
        }
    }

    /**
     * Start selection box
     */
    startSelectionBox(worldX, worldY) {
        this.isSelecting = true;
        this.selectionStart = { x: worldX, y: worldY };
        this.selectionEnd = { x: worldX, y: worldY };
    }

    /**
     * Update selection box
     */
    updateSelectionBox(worldX, worldY) {
        this.selectionEnd = { x: worldX, y: worldY };
    }

    /**
     * Finish selection box
     */
    finishSelectionBox() {
        if (!this.selectionStart || !this.selectionEnd) {
            this.isSelecting = false;
            return;
        }
        
        // Calculate selection rectangle
        const rect = {
            left: Math.min(this.selectionStart.x, this.selectionEnd.x),
            top: Math.min(this.selectionStart.y, this.selectionEnd.y),
            right: Math.max(this.selectionStart.x, this.selectionEnd.x),
            bottom: Math.max(this.selectionStart.y, this.selectionEnd.y)
        };
        
        // Select all objects that intersect with the selection box
        this.objects.forEach(obj => {
            if (obj.intersectsRect(rect)) {
                this.selectObject(obj);
            }
        });
        
        // Reset selection box
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
    }

    /**
     * Start dragging selected objects
     */
    startDrag(worldX, worldY) {
        this.isDragging = true;
        this.dragStart = { x: worldX, y: worldY };
        
        // Store offset for each selected object
        this.dragOffset = this.selectedObjects.map(obj => ({
            obj: obj,
            offsetX: obj.x - worldX,
            offsetY: obj.y - worldY
        }));
    }

    /**
     * Update drag position
     */
    updateDrag(worldX, worldY) {
        if (!this.isDragging || !this.dragStart) return;
        
        // Apply snap to grid if enabled
        let targetX = worldX;
        let targetY = worldY;
        
        if (this.grid.snapEnabled && this.dragOffset.length > 0) {
            // Snap the first object's position
            const firstObj = this.dragOffset[0];
            const newX = targetX + firstObj.offsetX;
            const newY = targetY + firstObj.offsetY;
            const snapped = this.grid.snapToGrid(newX, newY);
            
            // Calculate the snap delta
            const snapDeltaX = snapped.x - newX;
            const snapDeltaY = snapped.y - newY;
            
            // Apply snap delta to target position
            targetX += snapDeltaX;
            targetY += snapDeltaY;
        }
        
        // Update all selected objects
        this.dragOffset.forEach(item => {
            item.obj.setPosition(
                targetX + item.offsetX,
                targetY + item.offsetY
            );
        });
    }

    /**
     * Finish dragging
     */
    finishDrag() {
        this.isDragging = false;
        this.dragStart = null;
        this.dragOffset = [];
    }

    /**
     * Start resizing
     */
    startResize(handleInfo, worldX, worldY) {
        this.isResizing = true;
        this.resizeHandle = handleInfo.handle;
        this.resizeStart = { x: worldX, y: worldY };
        this.resizeOriginal = {
            x: handleInfo.object.x,
            y: handleInfo.object.y,
            width: handleInfo.object.width,
            height: handleInfo.object.height
        };
    }

    /**
     * Update resize
     */
    updateResize(worldX, worldY) {
        if (!this.isResizing || !this.resizeHandle || !this.resizeStart || !this.resizeOriginal) return;
        
        const dx = worldX - this.resizeStart.x;
        const dy = worldY - this.resizeStart.y;
        
        const obj = this.selectedObjects[0]; // Only resize single selection
        if (!obj) return;
        
        let newX = this.resizeOriginal.x;
        let newY = this.resizeOriginal.y;
        let newWidth = this.resizeOriginal.width;
        let newHeight = this.resizeOriginal.height;
        
        // Apply resize based on handle
        switch (this.resizeHandle) {
            case 'nw': // Top-left
                newX = this.resizeOriginal.x + dx;
                newY = this.resizeOriginal.y + dy;
                newWidth = this.resizeOriginal.width - dx;
                newHeight = this.resizeOriginal.height - dy;
                break;
            case 'n': // Top
                newY = this.resizeOriginal.y + dy;
                newHeight = this.resizeOriginal.height - dy;
                break;
            case 'ne': // Top-right
                newY = this.resizeOriginal.y + dy;
                newWidth = this.resizeOriginal.width + dx;
                newHeight = this.resizeOriginal.height - dy;
                break;
            case 'e': // Right
                newWidth = this.resizeOriginal.width + dx;
                break;
            case 'se': // Bottom-right
                newWidth = this.resizeOriginal.width + dx;
                newHeight = this.resizeOriginal.height + dy;
                break;
            case 's': // Bottom
                newHeight = this.resizeOriginal.height + dy;
                break;
            case 'sw': // Bottom-left
                newX = this.resizeOriginal.x + dx;
                newWidth = this.resizeOriginal.width - dx;
                newHeight = this.resizeOriginal.height + dy;
                break;
            case 'w': // Left
                newX = this.resizeOriginal.x + dx;
                newWidth = this.resizeOriginal.width - dx;
                break;
        }
        
        // Ensure minimum size
        if (newWidth < 10) {
            newWidth = 10;
            newX = this.resizeOriginal.x;
        }
        if (newHeight < 10) {
            newHeight = 10;
            newY = this.resizeOriginal.y;
        }
        
        // Apply snap to grid if enabled
        if (this.grid.snapEnabled) {
            const snappedPos = this.grid.snapToGrid(newX, newY);
            const snappedEnd = this.grid.snapToGrid(newX + newWidth, newY + newHeight);
            newX = snappedPos.x;
            newY = snappedPos.y;
            newWidth = snappedEnd.x - newX;
            newHeight = snappedEnd.y - newY;
        }
        
        // Update object
        obj.setPosition(newX, newY);
        obj.resize(newWidth, newHeight);
    }

    /**
     * Finish resizing
     */
    finishResize() {
        this.isResizing = false;
        this.resizeHandle = null;
        this.resizeStart = null;
        this.resizeOriginal = null;
    }

    /**
     * Get object at position
     */
    getObjectAtPosition(worldX, worldY) {
        // Check in reverse order (top to bottom)
        for (let i = this.objects.length - 1; i >= 0; i--) {
            if (this.objects[i].containsPoint(worldX, worldY)) {
                return this.objects[i];
            }
        }
        return null;
    }

    /**
     * Get resize handle at position
     */
    getHandleAtPosition(worldX, worldY) {
        // Only check handles for single selected object
        if (this.selectedObjects.length !== 1) return null;
        
        const obj = this.selectedObjects[0];
        const screenX = this.viewport.worldToScreen(worldX, worldY).x;
        const screenY = this.viewport.worldToScreen(worldX, worldY).y;
        
        const handle = obj.getHandleAt(screenX, screenY, this.viewport);
        
        if (handle) {
            return { object: obj, handle: handle };
        }
        
        return null;
    }

    /**
     * Select object
     */
    selectObject(obj) {
        if (!this.selectedObjects.includes(obj)) {
            obj.setSelected(true);
            this.selectedObjects.push(obj);
        }
    }

    /**
     * Deselect object
     */
    deselectObject(obj) {
        const index = this.selectedObjects.indexOf(obj);
        if (index > -1) {
            obj.setSelected(false);
            this.selectedObjects.splice(index, 1);
        }
    }

    /**
     * Toggle selection
     */
    toggleSelection(obj) {
        if (obj.selected) {
            this.deselectObject(obj);
        } else {
            this.selectObject(obj);
        }
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedObjects.forEach(obj => obj.setSelected(false));
        this.selectedObjects = [];
    }

    /**
     * Select all objects
     */
    selectAll() {
        this.clearSelection();
        this.objects.forEach(obj => this.selectObject(obj));
    }

    /**
     * Delete selected objects
     */
    deleteSelected() {
        const toDelete = [...this.selectedObjects];
        toDelete.forEach(obj => {
            const index = this.objects.indexOf(obj);
            if (index > -1) {
                this.objects.splice(index, 1);
            }
        });
        this.clearSelection();
        return toDelete;
    }

    /**
     * Duplicate selected objects
     */
    duplicateSelected() {
        const duplicated = [];
        this.selectedObjects.forEach(obj => {
            const clone = obj.clone();
            this.objects.push(clone);
            duplicated.push(clone);
        });
        
        // Select the duplicated objects
        this.clearSelection();
        duplicated.forEach(obj => this.selectObject(obj));
        
        return duplicated;
    }

    /**
     * Update cursor based on hover
     */
    updateCursor(worldX, worldY) {
        const handleInfo = this.getHandleAtPosition(worldX, worldY);
        
        if (handleInfo) {
            // Set resize cursor based on handle
            const cursors = {
                'nw': 'nw-resize',
                'n': 'n-resize',
                'ne': 'ne-resize',
                'e': 'e-resize',
                'se': 'se-resize',
                's': 's-resize',
                'sw': 'sw-resize',
                'w': 'w-resize'
            };
            this.canvas.style.cursor = cursors[handleInfo.handle] || 'default';
        } else {
            const obj = this.getObjectAtPosition(worldX, worldY);
            this.canvas.style.cursor = obj ? 'move' : 'default';
        }
    }

    /**
     * Render selection box
     */
    renderSelectionBox(ctx) {
        if (!this.isSelecting || !this.selectionStart || !this.selectionEnd) return;
        
        const start = this.viewport.worldToScreen(this.selectionStart.x, this.selectionStart.y);
        const end = this.viewport.worldToScreen(this.selectionEnd.x, this.selectionEnd.y);
        
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        
        ctx.save();
        
        // Draw selection box fill
        ctx.fillStyle = 'rgba(0, 102, 255, 0.1)';
        ctx.fillRect(x, y, width, height);
        
        // Draw selection box border
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        ctx.restore();
    }

    /**
     * Get selected objects
     */
    getSelectedObjects() {
        return this.selectedObjects;
    }

    /**
     * Cancel current operation
     */
    cancel() {
        this.isSelecting = false;
        this.isDragging = false;
        this.isResizing = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.dragStart = null;
        this.dragOffset = [];
        this.resizeHandle = null;
        this.resizeStart = null;
        this.resizeOriginal = null;
    }

    /**
     * Get cursor style
     */
    getCursor() {
        return 'default';
    }
}

// Made with Bob
