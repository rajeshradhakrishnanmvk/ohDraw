# Integration Guide - Professional CAD Features

## Quick Start: Integrating Professional Features

This guide shows how to integrate the new professional CAD features into the existing ohDraw application.

## 1. Update app.js Imports

Add these imports at the top of [`js/app.js`](js/app.js:1):

```javascript
import { Units } from './utils/Units.js';
import { CommandManager, AddObjectCommand, DeleteObjectCommand, MoveObjectCommand } from './utils/CommandManager.js';
import { LayerManager } from './utils/LayerManager.js';
import { FileManager } from './utils/FileManager.js';
import { SnapManager } from './utils/SnapManager.js';
import { DimensionManager } from './utils/DimensionManager.js';
```

## 2. Initialize Professional Systems

In the [`CADApp.constructor()`](js/app.js:20), add:

```javascript
constructor() {
    // Existing code...
    
    // Professional systems
    this.commandManager = new CommandManager(100);
    this.layerManager = new LayerManager();
    this.snapManager = new SnapManager(this.grid);
    this.dimensionManager = new DimensionManager();
    
    // Set default unit
    Units.setUnit('mm');
    Units.setPrecision(2);
    
    // Project metadata
    this.projectTitle = 'Untitled Project';
}
```

## 3. Replace Direct Object Manipulation with Commands

### Before (Direct Manipulation):
```javascript
// Old way - no undo/redo
this.objects.push(newWindow);
```

### After (Using Commands):
```javascript
// New way - with undo/redo
const cmd = new AddObjectCommand(this.objects, newWindow);
this.commandManager.execute(cmd);
```

### Update in [`onMouseUp()`](js/app.js:406):
```javascript
onMouseUp(worldX, worldY, event) {
    // ... existing code ...
    
    if (result && this.activeTool !== 'select') {
        // Use command instead of direct push
        const cmd = new AddObjectCommand(this.objects, result);
        this.commandManager.execute(cmd);
        console.log(`Created ${result.type}:`, result);
    }
    
    // ... rest of code ...
}
```

## 4. Add Undo/Redo Keyboard Shortcuts

Update [`setupKeyboardShortcuts()`](js/app.js:189):

```javascript
setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Existing shortcuts...
        
        // Undo (Ctrl+Z)
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (this.commandManager.undo()) {
                console.log('Undo:', this.commandManager.getLastCommandName());
                this.canvasRenderer.render();
                this.updateStatusBar();
            }
        }
        
        // Redo (Ctrl+Y or Ctrl+Shift+Z)
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            if (this.commandManager.redo()) {
                console.log('Redo');
                this.canvasRenderer.render();
                this.updateStatusBar();
            }
        }
        
        // Save (Ctrl+S)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            FileManager.saveToFile(this);
            console.log('Project saved');
        }
        
        // Open (Ctrl+O)
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            FileManager.loadFromFile((error, data) => {
                if (!error) {
                    this.loadProject(data);
                }
            });
        }
        
        // Export SVG (Ctrl+E)
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            FileManager.exportToSVG(this);
            console.log('Exported to SVG');
        }
    });
}
```

## 5. Integrate Advanced Snapping

Update [`DrawTool.onMouseDown()`](js/tools/DrawTool.js:31) and similar methods:

```javascript
onMouseDown(worldX, worldY, event) {
    // Use advanced snap instead of basic grid snap
    const snap = this.snapManager.findSnapPoint(
        worldX, worldY,
        this.objects || [],
        this.viewport
    );
    
    worldX = snap.x;
    worldY = snap.y;
    
    this.isDrawing = true;
    this.startPoint = { x: worldX, y: worldY };
    this.currentPoint = { x: worldX, y: worldY };
    this.currentSnap = snap; // Store for rendering
    
    this.createPreviewShape();
}
```

## 6. Render Snap Indicators

In [`renderObjects()`](js/app.js:474), add snap indicator rendering:

```javascript
renderObjects(ctx) {
    // Existing object rendering...
    
    // Render dimensions
    if (this.dimensionManager) {
        this.dimensionManager.renderAll(ctx, this.viewport);
    }
    
    // Render snap indicator
    if (this.currentTool && this.currentTool.currentSnap) {
        this.snapManager.renderSnapIndicator(
            ctx,
            this.currentTool.currentSnap,
            this.viewport
        );
    }
    
    // Existing tool preview and selection rendering...
}
```

## 7. Add Layer Support to Objects

When creating objects, assign them to the active layer:

```javascript
createFinalShape() {
    // ... existing shape creation ...
    
    if (shape) {
        // Assign to active layer
        const activeLayer = this.layerManager.getActiveLayer();
        if (activeLayer) {
            shape.layer = activeLayer.id;
            activeLayer.addObject(shape);
        }
    }
    
    return shape;
}
```

## 8. Add Menu Bar Functionality

Update the menu bar buttons in [`index.html`](index.html:18):

```javascript
// In app.js init()
document.querySelector('.menu-btn:nth-child(1)').addEventListener('click', () => {
    // File menu
    const menu = document.createElement('div');
    menu.innerHTML = `
        <button onclick="app.newProject()">New</button>
        <button onclick="app.openProject()">Open</button>
        <button onclick="app.saveProject()">Save</button>
        <button onclick="app.exportSVG()">Export SVG</button>
        <button onclick="app.exportDXF()">Export DXF</button>
    `;
    // Show menu...
});
```

## 9. Add Auto-Save

In [`init()`](js/app.js:53), add auto-save:

```javascript
init() {
    // ... existing initialization ...
    
    // Setup auto-save every 30 seconds
    setInterval(() => {
        FileManager.autoSave(this);
        console.log('Auto-saved');
    }, 30000);
    
    // Check for auto-save on load
    const autoSave = FileManager.loadAutoSave();
    if (autoSave) {
        const timeSince = Date.now() - autoSave.timestamp;
        if (timeSince < 3600000) { // Less than 1 hour old
            if (confirm('Recover auto-saved work?')) {
                this.loadProject(JSON.stringify(autoSave.project));
            }
        }
    }
}
```

## 10. Add Dimension Tool

Create a new dimension tool button and handler:

```html
<!-- In index.html toolbar -->
<button id="tool-dimension" class="tool-btn" title="Dimension Tool">
    <span class="tool-icon">↔</span>
    <span class="tool-label">DIMENSION</span>
</button>
```

```javascript
// In setupToolbar()
case 'dimension':
    this.currentTool = this.dimensionTool;
    this.canvas.style.cursor = 'crosshair';
    break;
```

## 11. Update Status Bar with Units

Modify [`updateStatusBar()`](js/app.js:304):

```javascript
updateStatusBar(mouseInfo = null) {
    // Update zoom level
    const zoomDisplay = document.getElementById('zoom-level');
    if (zoomDisplay) {
        zoomDisplay.textContent = `${this.viewport.getZoomPercentage()}%`;
    }
    
    // Update cursor position with units
    if (mouseInfo) {
        const cursorDisplay = document.getElementById('cursor-position');
        if (cursorDisplay) {
            const x = Units.format(mouseInfo.worldX, false);
            const y = Units.format(mouseInfo.worldY, false);
            cursorDisplay.textContent = `X: ${x}, Y: ${y} ${Units.currentUnit}`;
        }
    }
    
    // Update undo/redo status
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = !this.commandManager.canUndo();
    if (redoBtn) redoBtn.disabled = !this.commandManager.canRedo();
}
```

## 12. Add Layer Panel UI

Create a layer panel component:

```javascript
class LayerPanel {
    constructor(panelElement, layerManager) {
        this.panel = panelElement;
        this.layerManager = layerManager;
        this.render();
    }
    
    render() {
        const layers = this.layerManager.getAllLayers();
        this.panel.innerHTML = layers.map(layer => `
            <div class="layer-item ${layer.id === this.layerManager.activeLayerId ? 'active' : ''}">
                <input type="checkbox" 
                       ${layer.visible ? 'checked' : ''} 
                       onchange="app.toggleLayerVisibility('${layer.id}')">
                <span style="color: ${layer.color}">${layer.name}</span>
                <button onclick="app.setActiveLayer('${layer.id}')">Select</button>
            </div>
        `).join('');
    }
}
```

## Testing the Integration

### Test Undo/Redo:
1. Draw a window
2. Press Ctrl+Z (should disappear)
3. Press Ctrl+Y (should reappear)

### Test Snapping:
1. Draw a window
2. Start drawing another window
3. Move cursor near the first window's corner
4. Should see snap indicator and snap to corner

### Test Save/Load:
1. Draw several objects
2. Press Ctrl+S to save
3. Refresh page
4. Press Ctrl+O to load
5. All objects should reappear

### Test Layers:
1. Create objects on different layers
2. Toggle layer visibility
3. Objects should show/hide accordingly

### Test Dimensions:
1. Select dimension tool
2. Click two points
3. Dimension line with measurement should appear

## Performance Tips

1. **Throttle Auto-Save**: Don't save on every change, use debouncing
2. **Limit Snap Checks**: Only check visible objects within viewport
3. **Cache Layer Sorting**: Sort layers once per render cycle
4. **Use RequestAnimationFrame**: For smooth rendering with new features

## Common Issues

### Issue: Undo/Redo not working
**Solution**: Ensure all object modifications use commands, not direct manipulation

### Issue: Snapping too aggressive
**Solution**: Adjust `snapManager.snapDistance` (default: 10 pixels)

### Issue: Auto-save causing lag
**Solution**: Increase auto-save interval or implement debouncing

### Issue: Layers not rendering correctly
**Solution**: Ensure objects are properly assigned to layers and layers are sorted by order

## Next Steps

1. ✅ Integrate all professional systems
2. ✅ Test each feature thoroughly
3. ⏳ Add UI controls for new features
4. ⏳ Create user documentation
5. ⏳ Implement remaining Phase 3 features

---

**Ready to transform your CAD engine!** 🚀

Follow this guide step-by-step to integrate all professional features into your existing application.