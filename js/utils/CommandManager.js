/**
 * CommandManager.js - Professional Undo/Redo System
 * Implements Command Pattern for all reversible operations
 */

export class Command {
    constructor(name) {
        this.name = name;
        this.timestamp = Date.now();
    }

    execute() {
        throw new Error('Command.execute() must be implemented');
    }

    undo() {
        throw new Error('Command.undo() must be implemented');
    }

    redo() {
        this.execute();
    }
}

export class AddObjectCommand extends Command {
    constructor(objects, object) {
        super('Add Object');
        this.objects = objects;
        this.object = object;
    }

    execute() {
        this.objects.push(this.object);
        return this.object;
    }

    undo() {
        const index = this.objects.indexOf(this.object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
}

export class DeleteObjectCommand extends Command {
    constructor(objects, objectsToDelete) {
        super('Delete Object');
        this.objects = objects;
        this.objectsToDelete = Array.isArray(objectsToDelete) ? objectsToDelete : [objectsToDelete];
        this.indices = [];
    }

    execute() {
        this.indices = [];
        this.objectsToDelete.forEach(obj => {
            const index = this.objects.indexOf(obj);
            if (index > -1) {
                this.indices.push({ index, object: obj });
                this.objects.splice(index, 1);
            }
        });
    }

    undo() {
        this.indices.forEach(({ index, object }) => {
            this.objects.splice(index, 0, object);
        });
    }
}

export class MoveObjectCommand extends Command {
    constructor(objects, dx, dy) {
        super('Move Object');
        this.objects = Array.isArray(objects) ? objects : [objects];
        this.dx = dx;
        this.dy = dy;
    }

    execute() {
        this.objects.forEach(obj => {
            obj.move(this.dx, this.dy);
        });
    }

    undo() {
        this.objects.forEach(obj => {
            obj.move(-this.dx, -this.dy);
        });
    }
}

export class ResizeObjectCommand extends Command {
    constructor(object, oldBounds, newBounds) {
        super('Resize Object');
        this.object = object;
        this.oldBounds = oldBounds;
        this.newBounds = newBounds;
    }

    execute() {
        this.object.setPosition(this.newBounds.x, this.newBounds.y);
        this.object.resize(this.newBounds.width, this.newBounds.height);
    }

    undo() {
        this.object.setPosition(this.oldBounds.x, this.oldBounds.y);
        this.object.resize(this.oldBounds.width, this.oldBounds.height);
    }
}

export class ModifyPropertyCommand extends Command {
    constructor(object, property, oldValue, newValue) {
        super('Modify Property');
        this.object = object;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    execute() {
        if (this.property.includes('.')) {
            const parts = this.property.split('.');
            this.object[parts[0]][parts[1]] = this.newValue;
        } else {
            this.object[this.property] = this.newValue;
        }
    }

    undo() {
        if (this.property.includes('.')) {
            const parts = this.property.split('.');
            this.object[parts[0]][parts[1]] = this.oldValue;
        } else {
            this.object[this.property] = this.oldValue;
        }
    }
}

export class CommandManager {
    constructor(maxHistorySize = 100) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = maxHistorySize;
        this.isExecuting = false;
    }

    /**
     * Execute a command and add it to history
     */
    execute(command) {
        if (this.isExecuting) return;
        
        this.isExecuting = true;
        try {
            command.execute();
            this.undoStack.push(command);
            this.redoStack = []; // Clear redo stack on new command
            
            // Limit history size
            if (this.undoStack.length > this.maxHistorySize) {
                this.undoStack.shift();
            }
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Undo last command
     */
    undo() {
        if (this.undoStack.length === 0) return false;
        
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
        return true;
    }

    /**
     * Redo last undone command
     */
    redo() {
        if (this.redoStack.length === 0) return false;
        
        const command = this.redoStack.pop();
        command.redo();
        this.undoStack.push(command);
        return true;
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Clear all history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Get undo stack size
     */
    getUndoCount() {
        return this.undoStack.length;
    }

    /**
     * Get redo stack size
     */
    getRedoCount() {
        return this.redoStack.length;
    }

    /**
     * Get last command name
     */
    getLastCommandName() {
        if (this.undoStack.length === 0) return null;
        return this.undoStack[this.undoStack.length - 1].name;
    }
}

// Made with Bob
