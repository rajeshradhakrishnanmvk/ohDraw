/**
 * SnapManager.js - Professional Snap System
 * Handles advanced snapping: grid, endpoints, midpoints, intersections, perpendicular
 */

export class SnapManager {
    constructor(grid) {
        this.grid = grid;
        this.snapDistance = 10; // pixels in screen space
        this.enabled = true;
        
        // Snap modes
        this.snapToGrid = true;
        this.snapToEndpoints = true;
        this.snapToMidpoints = true;
        this.snapToIntersections = true;
        this.snapToPerpendicular = true;
        this.snapToParallel = true;
        this.snapToCenter = true;
    }

    /**
     * Find best snap point for given position
     */
    findSnapPoint(worldX, worldY, objects, viewport, excludeObject = null) {
        if (!this.enabled) {
            return { x: worldX, y: worldY, type: 'none' };
        }

        const screenPos = viewport.worldToScreen(worldX, worldY);
        const snapCandidates = [];

        // Grid snap
        if (this.snapToGrid && this.grid.snapEnabled) {
            const gridSnap = this.grid.snapToGrid(worldX, worldY);
            const screenGridPos = viewport.worldToScreen(gridSnap.x, gridSnap.y);
            const distance = this.distance(screenPos.x, screenPos.y, screenGridPos.x, screenGridPos.y);
            
            if (distance < this.snapDistance) {
                snapCandidates.push({
                    x: gridSnap.x,
                    y: gridSnap.y,
                    distance: distance,
                    type: 'grid',
                    priority: 1
                });
            }
        }

        // Object snaps
        objects.forEach(obj => {
            if (obj === excludeObject) return;

            // Endpoint snaps
            if (this.snapToEndpoints) {
                const endpoints = this.getObjectEndpoints(obj);
                endpoints.forEach(point => {
                    const screenPoint = viewport.worldToScreen(point.x, point.y);
                    const distance = this.distance(screenPos.x, screenPos.y, screenPoint.x, screenPoint.y);
                    
                    if (distance < this.snapDistance) {
                        snapCandidates.push({
                            x: point.x,
                            y: point.y,
                            distance: distance,
                            type: 'endpoint',
                            priority: 5,
                            object: obj
                        });
                    }
                });
            }

            // Midpoint snaps
            if (this.snapToMidpoints) {
                const midpoints = this.getObjectMidpoints(obj);
                midpoints.forEach(point => {
                    const screenPoint = viewport.worldToScreen(point.x, point.y);
                    const distance = this.distance(screenPos.x, screenPos.y, screenPoint.x, screenPoint.y);
                    
                    if (distance < this.snapDistance) {
                        snapCandidates.push({
                            x: point.x,
                            y: point.y,
                            distance: distance,
                            type: 'midpoint',
                            priority: 4,
                            object: obj
                        });
                    }
                });
            }

            // Center snaps
            if (this.snapToCenter) {
                const center = this.getObjectCenter(obj);
                if (center) {
                    const screenPoint = viewport.worldToScreen(center.x, center.y);
                    const distance = this.distance(screenPos.x, screenPos.y, screenPoint.x, screenPoint.y);
                    
                    if (distance < this.snapDistance) {
                        snapCandidates.push({
                            x: center.x,
                            y: center.y,
                            distance: distance,
                            type: 'center',
                            priority: 3,
                            object: obj
                        });
                    }
                }
            }

            // Edge snaps (nearest point on edge)
            const edgeSnap = this.getObjectEdgeSnap(obj, worldX, worldY);
            if (edgeSnap) {
                const screenPoint = viewport.worldToScreen(edgeSnap.x, edgeSnap.y);
                const distance = this.distance(screenPos.x, screenPos.y, screenPoint.x, screenPoint.y);
                
                if (distance < this.snapDistance) {
                    snapCandidates.push({
                        x: edgeSnap.x,
                        y: edgeSnap.y,
                        distance: distance,
                        type: 'edge',
                        priority: 2,
                        object: obj
                    });
                }
            }
        });

        // Intersection snaps
        if (this.snapToIntersections) {
            const intersections = this.findIntersections(objects, worldX, worldY, viewport);
            intersections.forEach(point => {
                const screenPoint = viewport.worldToScreen(point.x, point.y);
                const distance = this.distance(screenPos.x, screenPos.y, screenPoint.x, screenPoint.y);
                
                if (distance < this.snapDistance) {
                    snapCandidates.push({
                        x: point.x,
                        y: point.y,
                        distance: distance,
                        type: 'intersection',
                        priority: 6
                    });
                }
            });
        }

        // Find best snap (highest priority, then closest)
        if (snapCandidates.length > 0) {
            snapCandidates.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return b.priority - a.priority; // Higher priority first
                }
                return a.distance - b.distance; // Then closer distance
            });
            
            return snapCandidates[0];
        }

        return { x: worldX, y: worldY, type: 'none' };
    }

    /**
     * Get object endpoints
     */
    getObjectEndpoints(obj) {
        const points = [];
        
        if (obj.type === 'line') {
            points.push({ x: obj.startX, y: obj.startY });
            points.push({ x: obj.endX, y: obj.endY });
        } else {
            // Rectangle corners
            points.push({ x: obj.x, y: obj.y });
            points.push({ x: obj.x + obj.width, y: obj.y });
            points.push({ x: obj.x + obj.width, y: obj.y + obj.height });
            points.push({ x: obj.x, y: obj.y + obj.height });
        }
        
        return points;
    }

    /**
     * Get object midpoints
     */
    getObjectMidpoints(obj) {
        const points = [];
        
        if (obj.type === 'line') {
            points.push({
                x: (obj.startX + obj.endX) / 2,
                y: (obj.startY + obj.endY) / 2
            });
        } else {
            // Rectangle edge midpoints
            points.push({ x: obj.x + obj.width / 2, y: obj.y });
            points.push({ x: obj.x + obj.width, y: obj.y + obj.height / 2 });
            points.push({ x: obj.x + obj.width / 2, y: obj.y + obj.height });
            points.push({ x: obj.x, y: obj.y + obj.height / 2 });
        }
        
        return points;
    }

    /**
     * Get object center
     */
    getObjectCenter(obj) {
        if (obj.type === 'line') {
            return {
                x: (obj.startX + obj.endX) / 2,
                y: (obj.startY + obj.endY) / 2
            };
        } else {
            return {
                x: obj.x + obj.width / 2,
                y: obj.y + obj.height / 2
            };
        }
    }

    /**
     * Get nearest point on object edge
     */
    getObjectEdgeSnap(obj, worldX, worldY) {
        if (obj.type === 'line') {
            return this.nearestPointOnLine(
                worldX, worldY,
                obj.startX, obj.startY,
                obj.endX, obj.endY
            );
        } else {
            // Find nearest point on rectangle edges
            const edges = [
                { x1: obj.x, y1: obj.y, x2: obj.x + obj.width, y2: obj.y },
                { x1: obj.x + obj.width, y1: obj.y, x2: obj.x + obj.width, y2: obj.y + obj.height },
                { x1: obj.x + obj.width, y1: obj.y + obj.height, x2: obj.x, y2: obj.y + obj.height },
                { x1: obj.x, y1: obj.y + obj.height, x2: obj.x, y2: obj.y }
            ];
            
            let nearest = null;
            let minDist = Infinity;
            
            edges.forEach(edge => {
                const point = this.nearestPointOnLine(worldX, worldY, edge.x1, edge.y1, edge.x2, edge.y2);
                if (point) {
                    const dist = this.distance(worldX, worldY, point.x, point.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = point;
                    }
                }
            });
            
            return nearest;
        }
    }

    /**
     * Find nearest point on line segment
     */
    nearestPointOnLine(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        
        if (lengthSquared === 0) {
            return { x: x1, y: y1 };
        }
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
        
        return {
            x: x1 + t * dx,
            y: y1 + t * dy
        };
    }

    /**
     * Find intersections between objects near the cursor
     */
    findIntersections(objects, worldX, worldY, viewport) {
        const intersections = [];
        const searchRadius = this.snapDistance / viewport.scale;
        
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const points = this.getObjectIntersections(objects[i], objects[j]);
                points.forEach(point => {
                    const dist = this.distance(worldX, worldY, point.x, point.y);
                    if (dist < searchRadius) {
                        intersections.push(point);
                    }
                });
            }
        }
        
        return intersections;
    }

    /**
     * Get intersections between two objects
     */
    getObjectIntersections(obj1, obj2) {
        const intersections = [];
        
        // Get edges of both objects
        const edges1 = this.getObjectEdges(obj1);
        const edges2 = this.getObjectEdges(obj2);
        
        // Check all edge pairs for intersections
        edges1.forEach(edge1 => {
            edges2.forEach(edge2 => {
                const intersection = this.lineIntersection(
                    edge1.x1, edge1.y1, edge1.x2, edge1.y2,
                    edge2.x1, edge2.y1, edge2.x2, edge2.y2
                );
                if (intersection) {
                    intersections.push(intersection);
                }
            });
        });
        
        return intersections;
    }

    /**
     * Get edges of an object
     */
    getObjectEdges(obj) {
        if (obj.type === 'line') {
            return [{ x1: obj.startX, y1: obj.startY, x2: obj.endX, y2: obj.endY }];
        } else {
            return [
                { x1: obj.x, y1: obj.y, x2: obj.x + obj.width, y2: obj.y },
                { x1: obj.x + obj.width, y1: obj.y, x2: obj.x + obj.width, y2: obj.y + obj.height },
                { x1: obj.x + obj.width, y1: obj.y + obj.height, x2: obj.x, y2: obj.y + obj.height },
                { x1: obj.x, y1: obj.y + obj.height, x2: obj.x, y2: obj.y }
            ];
        }
    }

    /**
     * Calculate line-line intersection
     */
    lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        
        if (Math.abs(denom) < 0.0001) {
            return null; // Parallel lines
        }
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }
        
        return null;
    }

    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Render snap indicator
     */
    renderSnapIndicator(ctx, snapPoint, viewport) {
        if (!snapPoint || snapPoint.type === 'none') return;
        
        const screenPos = viewport.worldToScreen(snapPoint.x, snapPoint.y);
        
        ctx.save();
        ctx.strokeStyle = this.getSnapColor(snapPoint.type);
        ctx.fillStyle = this.getSnapColor(snapPoint.type);
        ctx.lineWidth = 2;
        
        const size = 8;
        
        switch (snapPoint.type) {
            case 'endpoint':
                // Square
                ctx.strokeRect(screenPos.x - size, screenPos.y - size, size * 2, size * 2);
                break;
            case 'midpoint':
                // Triangle
                ctx.beginPath();
                ctx.moveTo(screenPos.x, screenPos.y - size);
                ctx.lineTo(screenPos.x + size, screenPos.y + size);
                ctx.lineTo(screenPos.x - size, screenPos.y + size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'center':
                // Circle
                ctx.beginPath();
                ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'intersection':
                // X mark
                ctx.beginPath();
                ctx.moveTo(screenPos.x - size, screenPos.y - size);
                ctx.lineTo(screenPos.x + size, screenPos.y + size);
                ctx.moveTo(screenPos.x + size, screenPos.y - size);
                ctx.lineTo(screenPos.x - size, screenPos.y + size);
                ctx.stroke();
                break;
            case 'grid':
                // Small dot
                ctx.beginPath();
                ctx.arc(screenPos.x, screenPos.y, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'edge':
                // Diamond
                ctx.beginPath();
                ctx.moveTo(screenPos.x, screenPos.y - size);
                ctx.lineTo(screenPos.x + size, screenPos.y);
                ctx.lineTo(screenPos.x, screenPos.y + size);
                ctx.lineTo(screenPos.x - size, screenPos.y);
                ctx.closePath();
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }

    /**
     * Get color for snap type
     */
    getSnapColor(type) {
        const colors = {
            'endpoint': '#FF0000',
            'midpoint': '#00FF00',
            'center': '#0000FF',
            'intersection': '#FF00FF',
            'grid': '#888888',
            'edge': '#00FFFF'
        };
        return colors[type] || '#000000';
    }
}

// Made with Bob
