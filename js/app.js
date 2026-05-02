/**
 * app.js - Main Application Controller for CAD Drawing Engine
 * Initializes and coordinates all components
 */

import { Canvas } from './core/Canvas.js';
import { Viewport } from './core/Viewport.js';
import { Grid } from './core/Grid.js';
import { DrawTool, LineTool } from './tools/DrawTool.js';
import { SelectTool } from './tools/SelectTool.js';
import { PropertyPanel } from './ui/PropertyPanel.js';
import { Window } from './models/Window.js';
import { Door } from './models/Door.js';
import { Glass } from './models/Glass.js';

/**
 * Main Application Class
 */
class CADApp {
    constructor() {
        this.canvas = null;
        this.viewport = null;
        this.grid = null;
        this.canvasRenderer = null;
        
        // Phase 2: Tools and objects
        this.objects = []; // All drawable objects
        this.currentTool = null;
        this.selectTool = null;
        this.drawTool = null;
        this.lineTool = null;
        this.propertyPanel = null;
        this.activeTool = 'select'; // 'select', 'window', 'door', 'glass', 'line'
        
        // Application settings
        this.settings = {
            gridSize: 10,
            gridVisible: true,
            snapToGrid: true
        };
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing CAD Drawing Engine - Phase 2...');
        
        // Get canvas element
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        // Create core components
        this.viewport = new Viewport(this.canvas);
        this.grid = new Grid(this.settings.gridSize);
        this.grid.setVisibility(this.settings.gridVisible);
        this.grid.snapEnabled = this.settings.snapToGrid;
        this.canvasRenderer = new Canvas(this.canvas, this.viewport, this.grid);
        
        // Phase 2: Initialize tools
        this.selectTool = new SelectTool(this.canvas, this.viewport, this.grid);
        this.selectTool.setObjects(this.objects);
        this.drawTool = new DrawTool(this.canvas, this.viewport, this.grid);
        this.lineTool = new LineTool(this.canvas, this.viewport, this.grid);
        this.currentTool = this.selectTool;
        
        // Phase 2: Initialize property panel
        const propertyPanelElement = document.getElementById('properties-content');
        if (propertyPanelElement) {
            this.propertyPanel = new PropertyPanel(propertyPanelElement);
            this.propertyPanel.setOnPropertyChange((data) => this.handlePropertyChange(data));
        }
        
        // Setup UI event listeners
        this.setupUIControls();
        this.setupToolbar();
        
        // Setup window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup canvas mouse events
        this.setupCanvasMouseEvents();
        
        // Set custom render callback for Phase 2
        this.canvasRenderer.setCustomRender((ctx) => this.renderObjects(ctx));
        
        // Start rendering
        this.canvasRenderer.startRenderLoop();
        
        // Setup custom canvas events
        this.setupCanvasEvents();
        
        console.log('CAD Drawing Engine Phase 2 initialized successfully!');
        this.updateStatusBar();
    }

    /**
     * Setup UI controls
     */
    setupUIControls() {
        // Grid toggle
        const gridToggle = document.getElementById('grid-toggle');
        if (gridToggle) {
            gridToggle.checked = this.settings.gridVisible;
            gridToggle.addEventListener('change', (e) => {
                this.settings.gridVisible = e.target.checked;
                this.grid.setVisibility(this.settings.gridVisible);
                this.canvasRenderer.render();
            });
        }
        
        // Snap to grid toggle
        const snapToggle = document.getElementById('snap-toggle');
        if (snapToggle) {
            snapToggle.checked = this.settings.snapToGrid;
            snapToggle.addEventListener('change', (e) => {
                this.settings.snapToGrid = e.target.checked;
                this.grid.snapEnabled = e.target.checked;
            });
        }
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                const center = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2
                };
                this.viewport.zoomIn(center.x, center.y);
                this.canvasRenderer.render();
                this.updateStatusBar();
            });
        }
        
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                const center = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2
                };
                this.viewport.zoomOut(center.x, center.y);
                this.canvasRenderer.render();
                this.updateStatusBar();
            });
        }
        
        const zoomResetBtn = document.getElementById('zoom-reset');
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => {
                this.viewport.reset();
                this.canvasRenderer.render();
                this.updateStatusBar();
            });
        }
        
        // Grid size input
        const gridSizeInput = document.getElementById('grid-size');
        if (gridSizeInput) {
            gridSizeInput.value = this.settings.gridSize;
            gridSizeInput.addEventListener('change', (e) => {
                const size = parseInt(e.target.value);
                if (size > 0) {
                    this.settings.gridSize = size;
                    this.grid.setGridSize(size);
                    this.canvasRenderer.render();
                }
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Grid toggle (G key)
            if (e.key === 'g' || e.key === 'G') {
                this.settings.gridVisible = !this.settings.gridVisible;
                this.grid.setVisibility(this.settings.gridVisible);
                const gridToggle = document.getElementById('grid-toggle');
                if (gridToggle) gridToggle.checked = this.settings.gridVisible;
                this.canvasRenderer.render();
            }
            
            // Snap toggle (S key)
            if (e.key === 's' || e.key === 'S') {
                if (!e.ctrlKey) { // Don't interfere with Ctrl+S
                    this.settings.snapToGrid = !this.settings.snapToGrid;
                    const snapToggle = document.getElementById('snap-toggle');
                    if (snapToggle) snapToggle.checked = this.settings.snapToGrid;
                }
            }
            
            // Reset view (R key)
            if (e.key === 'r' || e.key === 'R') {
                this.viewport.reset();
                this.canvasRenderer.render();
                this.updateStatusBar();
            }
            
            // Zoom in (+/= key)
            if (e.key === '+' || e.key === '=') {
                const center = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2
                };
                this.viewport.zoomIn(center.x, center.y);
                this.canvasRenderer.render();
                this.updateStatusBar();
            }
            
            // Zoom out (- key)
            if (e.key === '-' || e.key === '_') {
                const center = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2
                };
                this.viewport.zoomOut(center.x, center.y);
                this.canvasRenderer.render();
                this.updateStatusBar();
            }
        });
    }

    /**
     * Setup custom canvas events
     */
    setupCanvasEvents() {
        // Update status bar on mouse move
        this.canvas.addEventListener('canvasMouseMove', (e) => {
            this.updateStatusBar(e.detail);
        });
        
        // Update status bar on zoom
        this.canvas.addEventListener('canvasZoom', (e) => {
            this.updateStatusBar();
        });
    }

    /**
     * Update status bar with current information
     * @param {Object} mouseInfo - Optional mouse position info
     */
    updateStatusBar(mouseInfo = null) {
        // Update zoom level
        const zoomDisplay = document.getElementById('zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${this.viewport.getZoomPercentage()}%`;
        }
        
        // Update cursor position
        if (mouseInfo) {
            const cursorDisplay = document.getElementById('cursor-position');
            if (cursorDisplay) {
                const x = Math.round(mouseInfo.worldX);
                const y = Math.round(mouseInfo.worldY);
                cursorDisplay.textContent = `X: ${x}, Y: ${y}`;
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.canvasRenderer) {
            this.canvasRenderer.resize();
        }
    }

    /**
     * Get snapped coordinates if snap-to-grid is enabled
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} Coordinates {x, y}
     */
    getSnappedCoordinates(x, y) {
        if (this.settings.snapToGrid) {
            return this.grid.snapToGrid(x, y);
        }
        return { x, y };
    }

    /**
     * Setup toolbar button handlers
     */
    setupToolbar() {
        // Tool buttons
        const toolButtons = {
            'tool-select': 'select',
            'tool-window': 'window',
            'tool-door': 'door',
            'tool-glass': 'glass',
            'tool-line': 'line'
        };
        
        Object.entries(toolButtons).forEach(([buttonId, toolName]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => this.setActiveTool(toolName));
            }
        });
    }

    /**
     * Setup canvas mouse events for tools
     */
    setupCanvasMouseEvents() {
        let isMouseDown = false;
        
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const worldPos = this.viewport.screenToWorld(screenX, screenY);
            
            isMouseDown = true;
            
            if (this.currentTool) {
                this.currentTool.onMouseDown(worldPos.x, worldPos.y, e);
                this.canvasRenderer.render();
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const worldPos = this.viewport.screenToWorld(screenX, screenY);
            
            if (this.currentTool) {
                this.currentTool.onMouseMove(worldPos.x, worldPos.y, e);
                this.canvasRenderer.render();
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;
            const worldPos = this.viewport.screenToWorld(screenX, screenY);
            
            isMouseDown = false;
            
            if (this.currentTool) {
                const result = this.currentTool.onMouseUp(worldPos.x, worldPos.y, e);
                
                // Handle result from drawing tools
                if (result && this.activeTool !== 'select') {
                    this.objects.push(result);
                    console.log(`Created ${result.type}:`, result);
                }
                
                // Update property panel
                if (this.propertyPanel && this.selectTool) {
                    this.propertyPanel.update(this.selectTool.getSelectedObjects());
                }
                
                this.canvasRenderer.render();
                this.updateStatusBar();
            }
        });
    }

    /**
     * Set active tool
     */
    setActiveTool(toolName) {
        this.activeTool = toolName;
        
        // Update tool buttons visual state
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.getElementById(`tool-${toolName}`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Switch tool
        switch (toolName) {
            case 'select':
                this.currentTool = this.selectTool;
                this.canvas.style.cursor = 'default';
                break;
            case 'window':
                this.drawTool.setShapeType('window');
                this.currentTool = this.drawTool;
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'door':
                this.drawTool.setShapeType('door');
                this.currentTool = this.drawTool;
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'glass':
                this.drawTool.setShapeType('glass');
                this.currentTool = this.drawTool;
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'line':
                this.currentTool = this.lineTool;
                this.canvas.style.cursor = 'crosshair';
                break;
        }
        
        console.log(`Active tool: ${toolName}`);
    }

    /**
     * Render all objects
     */
    renderObjects(ctx) {
        // Render all objects
        this.objects.forEach(obj => {
            obj.render(ctx, this.viewport);
        });
        
        // Render tool preview
        if (this.currentTool && this.currentTool.renderPreview) {
            this.currentTool.renderPreview(ctx);
        }
        
        // Render selection box
        if (this.selectTool && this.selectTool.renderSelectionBox) {
            this.selectTool.renderSelectionBox(ctx);
        }
    }

    /**
     * Handle property changes from property panel
     */
    handlePropertyChange(data) {
        if (data.action === 'delete') {
            this.selectTool.deleteSelected();
            this.propertyPanel.update([]);
            this.canvasRenderer.render();
        } else if (data.action === 'duplicate') {
            this.selectTool.duplicateSelected();
            this.propertyPanel.update(this.selectTool.getSelectedObjects());
            this.canvasRenderer.render();
        } else if (data.action === 'update') {
            // Property was updated, just re-render
            this.canvasRenderer.render();
        }
}

// Create and export global app instance
const app = new CADApp();
export default app;

// Made with Bob - Phase 2 Complete
    }
