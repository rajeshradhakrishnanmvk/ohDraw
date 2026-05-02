/**
 * Canvas.js - Main Rendering Engine for CAD Drawing Engine
 * Handles canvas rendering, event handling, and render loop
 */

export class Canvas {
    constructor(canvasElement, viewport, grid) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.viewport = viewport;
        this.grid = grid;
        
        // Rendering state
        this.isRendering = false;
        this.animationFrameId = null;
        
        // Phase 2: Custom render callback
        this.customRenderCallback = null;
        
        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.isDragging = false;
        
        // Event handlers bound to this instance
        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);
        this.boundHandleWheel = this.handleWheel.bind(this);
        this.boundHandleContextMenu = this.handleContextMenu.bind(this);
        
        // Setup canvas
        this.setupCanvas();
        this.attachEventListeners();
    }

    /**
     * Setup canvas for high DPI displays
     */
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Ensure minimum canvas size to prevent distortion
        const minWidth = 800;
        const minHeight = 600;
        const width = Math.max(rect.width, minWidth);
        const height = Math.max(rect.height, minHeight);
        
        // Set actual size in memory (scaled for DPI)
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Set display size (CSS pixels)
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Scale context to match DPI
        this.ctx.scale(dpr, dpr);
        
        // Store logical dimensions
        this.logicalWidth = width;
        this.logicalHeight = height;
        
        console.log(`Canvas setup: ${width}x${height} (DPR: ${dpr}, Buffer: ${this.canvas.width}x${this.canvas.height})`);
    }

    /**
     * Attach event listeners to canvas
     */
    attachEventListeners() {
        this.canvas.addEventListener('mousedown', this.boundHandleMouseDown);
        this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
        this.canvas.addEventListener('mouseup', this.boundHandleMouseUp);
        this.canvas.addEventListener('wheel', this.boundHandleWheel, { passive: false });
        this.canvas.addEventListener('contextmenu', this.boundHandleContextMenu);
        
        // Handle mouse leaving canvas
        this.canvas.addEventListener('mouseleave', () => {
            if (this.viewport.isPanningActive()) {
                this.viewport.endPan();
            }
        });
    }

    /**
     * Remove event listeners
     */
    detachEventListeners() {
        this.canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
        this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
        this.canvas.removeEventListener('mouseup', this.boundHandleMouseUp);
        this.canvas.removeEventListener('wheel', this.boundHandleWheel);
        this.canvas.removeEventListener('contextmenu', this.boundHandleContextMenu);
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        this.isMouseDown = true;
        
        // Start panning (middle mouse button or space + left click)
        if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
            event.preventDefault();
            this.viewport.startPan(this.mouseX, this.mouseY);
        }
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        
        // Update panning if active
        if (this.viewport.isPanningActive()) {
            this.viewport.updatePan(this.mouseX, this.mouseY);
            this.render();
        }
        
        // Detect dragging
        if (this.isMouseDown && !this.isDragging) {
            this.isDragging = true;
        }
        
        // Dispatch custom event with world coordinates
        const worldCoords = this.viewport.screenToWorld(this.mouseX, this.mouseY);
        this.canvas.dispatchEvent(new CustomEvent('canvasMouseMove', {
            detail: {
                screenX: this.mouseX,
                screenY: this.mouseY,
                worldX: worldCoords.x,
                worldY: worldCoords.y
            }
        }));
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseUp(event) {
        this.isMouseDown = false;
        this.isDragging = false;
        
        if (this.viewport.isPanningActive()) {
            this.viewport.endPan();
        }
    }

    /**
     * Handle mouse wheel event for zooming
     * @param {WheelEvent} event - Wheel event
     */
    handleWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Zoom in or out based on wheel direction
        if (event.deltaY < 0) {
            this.viewport.zoomIn(mouseX, mouseY);
        } else {
            this.viewport.zoomOut(mouseX, mouseY);
        }
        
        this.render();
        
        // Dispatch zoom event
        this.canvas.dispatchEvent(new CustomEvent('canvasZoom', {
            detail: {
                zoom: this.viewport.getZoomLevel(),
                percentage: this.viewport.getZoomPercentage()
            }
        }));
    }

    /**
     * Handle context menu (right-click)
     * @param {MouseEvent} event - Mouse event
     */
    handleContextMenu(event) {
        event.preventDefault();
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.viewport.resetTransform(this.ctx);
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
    }

    /**
     * Render the canvas
     */
    render() {
        // Clear canvas
        this.clear();
        
        // Set background color
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
        
        // Draw grid
        this.grid.draw(this.ctx, this.viewport);
        
        // Phase 2: Call custom render callback for objects
        if (this.customRenderCallback) {
            this.customRenderCallback(this.ctx);
        }
        
        // Draw crosshair at origin (for debugging)
        this.drawOriginMarker();
    }

    /**
     * Set custom render callback (Phase 2)
     */
    setCustomRender(callback) {
        this.customRenderCallback = callback;
    }

    /**
     * Draw origin marker for debugging
     */
    drawOriginMarker() {
        const origin = this.viewport.worldToScreen(0, 0);
        const size = 10;
        
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        
        // Draw crosshair
        this.ctx.beginPath();
        this.ctx.moveTo(origin.x - size, origin.y);
        this.ctx.lineTo(origin.x + size, origin.y);
        this.ctx.moveTo(origin.x, origin.y - size);
        this.ctx.lineTo(origin.x, origin.y + size);
        this.ctx.stroke();
        
        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fill();
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        if (this.isRendering) return;
        
        this.isRendering = true;
        
        const renderFrame = () => {
            if (!this.isRendering) return;
            
            this.render();
            this.animationFrameId = requestAnimationFrame(renderFrame);
        };
        
        renderFrame();
    }

    /**
     * Stop the render loop
     */
    stopRenderLoop() {
        this.isRendering = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Get mouse position in world coordinates
     * @returns {Object} World coordinates {x, y}
     */
    getMouseWorldPosition() {
        return this.viewport.screenToWorld(this.mouseX, this.mouseY);
    }

    /**
     * Get mouse position in screen coordinates
     * @returns {Object} Screen coordinates {x, y}
     */
    getMouseScreenPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }

    /**
     * Resize canvas (call when window resizes)
     */
    resize() {
        this.setupCanvas();
        this.render();
    }

    /**
     * Cleanup and destroy canvas instance
     */
    destroy() {
        this.stopRenderLoop();
        this.detachEventListeners();
    }
}

// Made with Bob
