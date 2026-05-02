# CAD Drawing Engine - Phase 2 Complete

A lightweight, browser-based CAD drawing engine for designing Windows, Doors, and Glass elements for interior spaces. Built with vanilla JavaScript, HTML5 Canvas, and CSS - no third-party dependencies.

## 🎉 Phase 1: Core Foundation - COMPLETE ✅

Phase 1 establishes the foundational infrastructure including:
- ✅ Project structure with organized directories
- ✅ Canvas rendering engine with high DPI support
- ✅ Viewport system with zoom and pan
- ✅ Grid system with snap-to-grid functionality
- ✅ Complete UI layout with toolbar, panels, and status bar
- ✅ Keyboard shortcuts and mouse controls

## 🚀 Phase 2: Drawing & Selection - COMPLETE ✅

Phase 2 adds interactive drawing and object manipulation:
- ✅ Object models (Window, Door, Glass) with rich properties
- ✅ Drawing tools for creating objects
- ✅ Selection system with click and drag selection
- ✅ Multi-selection support (Shift+click)
- ✅ Object manipulation (move, resize, rotate)
- ✅ Selection handles and bounding boxes
- ✅ Property panel with dynamic editing
- ✅ Real-time property updates
- ✅ Tool preview during drawing
- ✅ Line measurement tool

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server (for ES6 modules to work)

### Installation

1. Clone or download this repository
2. Navigate to the project directory

### Running the Application

**Option 1: Using VS Code Live Server Extension**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Option 2: Using Node.js http-server**
```bash
npx http-server -p 8080
```
Then open http://localhost:8080 in your browser

**Option 3: Using Python (if available)**
```bash
python -m http.server 8080
```
Then open http://localhost:8080 in your browser

**Option 4: Direct File Access (Limited)**
Some browsers allow opening the file directly, but ES6 modules may not work:
```
file:///path/to/ohDraw/index.html
```

## 🎮 Controls & Features

### Mouse Controls
- **Left Click**: Select object / Start drawing
- **Left Click + Drag**: Draw object / Move selected object / Pan (with Shift)
- **Shift + Left Click**: Add to selection (multi-select)
- **Middle Mouse + Drag**: Pan the viewport
- **Mouse Wheel**: Zoom in/out (centered on cursor)
- **Drag Selection Box**: Select multiple objects
- **Resize Handles**: Click and drag to resize selected object

### Keyboard Shortcuts
**View Controls:**
- **G**: Toggle grid visibility
- **S**: Toggle snap-to-grid
- **R**: Reset view to default
- **+/=**: Zoom in
- **-**: Zoom out

**Object Operations:**
- **Delete**: Delete selected objects
- **Ctrl+D**: Duplicate selected objects
- **Ctrl+A**: Select all objects
- **Escape**: Deselect all objects

### UI Controls
- **Grid Toggle**: Show/hide the grid overlay
- **Snap Toggle**: Enable/disable snap-to-grid
- **Grid Size**: Adjust grid spacing (5-100 pixels)
- **Zoom In/Out**: Zoom controls
- **Reset View**: Return to default zoom and position

### Visual Features
- **Grid System**: Configurable grid with major and minor lines
- **Origin Marker**: Red crosshair showing the coordinate origin (0,0)
- **Status Bar**: Displays zoom level and cursor position in real-time
- **High DPI Support**: Crisp rendering on retina displays

## 📁 Project Structure

```
ohDraw/
├── index.html              # Main application entry point
├── README.md              # This file
├── cad-engine-architecture.md  # Detailed architecture documentation
├── css/
│   ├── main.css           # Main styles and layout
│   ├── toolbar.css        # Toolbar styling
│   └── properties.css     # Property panel styling
└── js/
    ├── app.js             # Main application controller
    └── core/
        ├── Canvas.js      # Canvas rendering engine
        ├── Viewport.js    # Zoom, pan, coordinate transformation
        └── Grid.js        # Grid system and snap-to-grid
```

## 🧪 Testing Phase 1

### Test Checklist

1. **Grid Display**
   - [ ] Grid is visible on canvas load
   - [ ] Grid has major and minor lines
   - [ ] Grid can be toggled on/off with 'G' key
   - [ ] Grid can be toggled with checkbox

2. **Zoom Functionality**
   - [ ] Mouse wheel zooms in/out
   - [ ] Zoom is centered on cursor position
   - [ ] Zoom buttons work correctly
   - [ ] Zoom level displays in status bar
   - [ ] +/- keys zoom in/out
   - [ ] Grid scales correctly with zoom

3. **Pan Functionality**
   - [ ] Shift + Left drag pans the view
   - [ ] Middle mouse drag pans the view
   - [ ] Pan works in all directions
   - [ ] Origin marker moves correctly

4. **Coordinate System**
   - [ ] Origin marker visible at (0,0)
   - [ ] Cursor position updates in status bar
   - [ ] World coordinates are accurate
   - [ ] Screen to world transformation works

5. **Grid Snap**
   - [ ] Snap toggle works
   - [ ] Grid size can be changed
   - [ ] Snap calculations are accurate

6. **UI & Responsiveness**
   - [ ] Layout is clean and organized
   - [ ] All panels are visible
   - [ ] Canvas resizes properly
   - [ ] No console errors
   - [ ] Smooth 60 FPS rendering

7. **Reset Functionality**
   - [ ] 'R' key resets view
   - [ ] Reset button works
   - [ ] View returns to default state

## 🎨 Current Features

### Implemented ✅
- Canvas rendering with double buffering
- Viewport transformation system
- Zoom in/out with mouse wheel
- Pan with mouse drag
- Configurable grid system
- Snap-to-grid calculations
- Real-time status updates
- Keyboard shortcuts
- High DPI display support
- Origin marker for debugging
- Responsive UI layout

### Phase 2 Features ✅
- **Drawing Tools**: Create Windows, Doors, Glass panels, and measurement lines
- **Object Models**: Rich object properties with visual rendering
- **Selection System**: Click, drag-select, and multi-select with Shift
- **Property Editing**: Dynamic property panel with real-time updates
- **Object Manipulation**: Move, resize, and rotate objects
- **Selection Handles**: Visual handles for precise resizing
- **Tool Preview**: Live preview while drawing
- **Snap to Grid**: Precise object placement

### Coming in Phase 3 🚧
- Undo/redo system
- Layer management
- Copy/paste functionality
- Object grouping
- Alignment tools

## 🐛 Known Issues

None currently - Phase 1 is complete and stable!

## 💡 Tips

1. **Best Performance**: Use Chrome or Edge for best performance
2. **Grid Visibility**: Adjust grid size based on zoom level for better visibility
3. **Smooth Pan**: Hold Shift while dragging for smooth panning
4. **Precise Zoom**: Zoom is always centered on your cursor position
5. **Quick Reset**: Press 'R' to quickly return to default view

## 📚 Documentation

For detailed architecture and design decisions, see:
- `cad-engine-architecture.md` - Complete architecture documentation

## 🔧 Technical Details

- **No Dependencies**: Pure vanilla JavaScript, HTML5, CSS
- **ES6 Modules**: Modern JavaScript module system
- **Canvas API**: HTML5 Canvas for rendering
- **Event-Driven**: Efficient event handling system
- **Performance**: 60 FPS rendering with requestAnimationFrame
- **Responsive**: Adapts to different screen sizes

## 📝 Development Notes

### Code Organization
- **Modular Design**: Each component is self-contained
- **Clear Separation**: Core rendering separate from UI logic
- **Extensible**: Easy to add new features in future phases
- **Well Documented**: Comprehensive inline documentation

### Performance Optimizations
- Double buffering for smooth rendering
- Efficient coordinate transformations
- Minimal DOM manipulation
- RequestAnimationFrame for rendering loop
- High DPI canvas scaling

## 🎯 What's New in Phase 2

### New Files Created
- `js/models/Shape.js` - Base shape class with common functionality
- `js/models/Window.js` - Window object with frame and glass properties
- `js/models/Door.js` - Door object with multiple door types
- `js/models/Glass.js` - Glass panel object with various glass types
- `js/tools/DrawTool.js` - Drawing tool for creating objects
- `js/tools/SelectTool.js` - Selection and manipulation tool
- `js/ui/PropertyPanel.js` - Dynamic property editing panel

### Enhanced Files
- `js/app.js` - Integrated tools, objects, and property panel
- `js/core/Canvas.js` - Added custom render callback support
- `css/properties.css` - Added Phase 2 specific styles

### How to Use Phase 2 Features

1. **Select a Tool**: Click on Window, Door, Glass, or Line tool in the toolbar
2. **Draw an Object**: Click and drag on the canvas to create an object
3. **Select Objects**: Click on an object to select it, or drag a selection box
4. **Multi-Select**: Hold Shift and click to add objects to selection
5. **Move Objects**: Click and drag selected objects to move them
6. **Resize Objects**: Drag the selection handles to resize
7. **Edit Properties**: Use the property panel on the right to edit object properties
8. **Delete Objects**: Select objects and press Delete key
9. **Duplicate Objects**: Select objects and press Ctrl+D

## 🎯 Next Steps - Phase 3

Phase 3 will add:
1. Undo/redo system with command pattern
2. Layer management with visibility and locking
3. Copy/paste functionality
4. Object grouping and alignment tools
5. Keyboard shortcuts for common operations

## 📄 License

This project is part of a learning exercise and is provided as-is.

## 👨‍💻 Author

Built with ❤️ using vanilla JavaScript, HTML5 Canvas, and CSS.

---

**Status**: Phase 2 Complete ✅ | **Version**: 2.0.0 | **Last Updated**: May 2026