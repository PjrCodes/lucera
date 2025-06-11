"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDraggable, DragOverlay, Active, defaultDropAnimation, useDroppable, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import DraggableItem from './DraggableItem';
import dashboardAcl from '../../../data/acl/dashboard.json';
import { DASHBOARD_ELEMENT_TO_NAME } from '@/constants';

interface DashboardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    role: string;
    dashboardLayout: {
      leftColumn: string[];
      rightColumn: string[];
    }
  };
  userId: string;
}

interface DashboardItem {
  id: string; 
  type: string; 
  instanceId: string; 
}

// Helper component for items in the "Add Elements" panel
const SourceDraggableElement = ({ elementType, isOverlay, isDropAllowed }: { elementType: string, isOverlay?: boolean, isDropAllowed?: boolean }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `source-${elementType}`,
    data: {
      elementType: elementType,
      isSource: true,
    },
  });

  // Only apply opacity reduction to the original item when dragging, no transforms
  const style = !isOverlay && isDragging ? { opacity: 0.5 } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : listeners)} 
      {...(isOverlay ? {} : attributes)} 
      className={`px-4 py-2 border rounded-md text-sm font-medium whitespace-nowrap transition-all
                  ${isOverlay && !isDropAllowed 
                    ? 'border-red-500 bg-red-100 text-red-700 cursor-not-allowed shadow-lg' 
                    : isOverlay
                    ? 'border-gray-300 bg-white text-gray-700 shadow-lg cursor-grabbing'
                    : 'border-gray-300 bg-gray-100 text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-200 cursor-grab'}`}
    >
      {DASHBOARD_ELEMENT_TO_NAME[elementType as keyof typeof DASHBOARD_ELEMENT_TO_NAME]}
    </div>
  );
};

// Simple overlay component for existing items
const DraggedItemOverlay = ({ label, isDropAllowed }: { label: string, isDropAllowed: boolean }) => {
  return (
    <div className={`p-3 border rounded-lg text-sm font-medium shadow-lg transition-all
                    ${!isDropAllowed 
                      ? 'border-red-500 bg-red-100 text-red-700 cursor-not-allowed' 
                      : 'border-gray-300 bg-white text-gray-700 cursor-grabbing'}`}>
      {label}
    </div>
  );
};

// Droppable container component
const DroppableColumn = ({ id, children, isEmpty }: { id: string, children: React.ReactNode, isEmpty: boolean }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-colors
                  ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
    >
      {children}
      {isEmpty && (
        <p className="text-xs text-gray-400 text-center py-4">Drop elements here</p>
      )}
    </div>
  );
};

export default function DashboardEditModal({ isOpen, onClose, userId, userData }: DashboardEditModalProps) {
  const [leftColumn, setLeftColumn] = useState<DashboardItem[]>([]);
  const [rightColumn, setRightColumn] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeDragData, setActiveDragData] = useState<Active | null>(null);
  const [isDropCurrentlyAllowed, setIsDropCurrentlyAllowed] = useState(true);
  const [nextUniqueCounter, setNextUniqueCounter] = useState(0); // Global counter for uniqueness


  const userRole = userData?.role || 'student';

  const sensors = useSensor(PointerSensor);

  const roleAllowedElementTypes = dashboardAcl.role_restrictions[userRole as keyof typeof dashboardAcl.role_restrictions] || [];
  const leftColumnAllowedTypes = dashboardAcl.column_restrictions.leftColumn;
  const rightColumnAllowedTypes = dashboardAcl.column_restrictions.rightColumn;

  useEffect(() => {
    if (isOpen && userId) {
      loadDashboardLayout();
    }
  }, [isOpen, userId]);

  const loadDashboardLayout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/layout');
      if (!response.ok) {
        throw new Error('Failed to fetch layout');
      }
      const layout = await response.json();
      
      let globalCounter = 0;
      
      const leftItems = layout.leftColumn.map((type: string) => {
        const instanceId = `left-${globalCounter}`;
        const id = `${type}-${instanceId}`;
        globalCounter++;
        return { id, type, instanceId };
      });

      const rightItems = layout.rightColumn.map((type: string) => {
        const instanceId = `right-${globalCounter}`;
        const id = `${type}-${instanceId}`;
        globalCounter++;
        return { id, type, instanceId };
      });
      
      setLeftColumn(leftItems);
      setRightColumn(rightItems);
      setNextUniqueCounter(globalCounter); // Set the next available counter
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueId = (column: 'left' | 'right') => {
    // Use a global counter to ensure absolute uniqueness across all items
    const instanceId = `${column}-${nextUniqueCounter}`;
    setNextUniqueCounter(prev => prev + 1);
    return instanceId;
  };


  const addElementToColumn = (elementType: string, column: 'left' | 'right', index?: number) => {
    const instanceId = generateUniqueId(column);
    const newItem: DashboardItem = {
      id: `${elementType}-${instanceId}`, // This ensures unique React keys
      type: elementType,
      instanceId: instanceId, 
    };

    const setColumn = column === 'left' ? setLeftColumn : setRightColumn;
    setColumn(prev => {
        const newArray = [...prev];
        newArray.splice(index !== undefined ? index : prev.length, 0, newItem);
        return newArray;
      });
  };

  const removeElement = (itemId: string) => {
    setLeftColumn(prev => prev.filter(item => item.id !== itemId));
    setRightColumn(prev => prev.filter(item => item.id !== itemId));
  };

  const findItemById = (id: string): { item: DashboardItem; column: 'left' | 'right'; index: number } | null => {
    const leftIndex = leftColumn.findIndex(item => item.id === id);
    if (leftIndex !== -1) {
      return { item: leftColumn[leftIndex], column: 'left', index: leftIndex };
    }
    
    const rightIndex = rightColumn.findIndex(item => item.id === id);
    if (rightIndex !== -1) {
      return { item: rightColumn[rightIndex], column: 'right', index: rightIndex };
    }
    
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData(event.active);
    setIsDropCurrentlyAllowed(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) {
      setIsDropCurrentlyAllowed(false);
      document.body.style.cursor = 'not-allowed';
      return;
    }

    const activeIsSource = active.data.current?.isSource === true;
    let elementType: string | undefined;
    let sourceColumn: 'left' | 'right' | null = null;

    if (activeIsSource) {
      elementType = active.data.current?.elementType;
    } else {
      const activeItem = findItemById(active.id as string);
      elementType = activeItem?.item.type;
      sourceColumn = activeItem?.column || null;
    }

    if (!elementType) {
      setIsDropCurrentlyAllowed(false);
      document.body.style.cursor = 'not-allowed';
      return;
    }

    let targetColumnName: 'left' | 'right' | null = null;
    const overData = over.data.current;

    // Determine target column more reliably
    if (over.id === 'left-column-container' || overData?.sortable?.containerId === 'left-column-sorter') {
      targetColumnName = 'left';
    } else if (over.id === 'right-column-container' || overData?.sortable?.containerId === 'right-column-sorter') {
      targetColumnName = 'right';
    } else {
      // Check if hovering over an item in a column
      const overItem = findItemById(over.id as string);
      if (overItem) {
        targetColumnName = overItem.column;
      }
    }

    let isAllowed = true;

    if (targetColumnName) {
      if (activeIsSource) {
        // For source items, check role and column restrictions
        const isAllowedByRole = roleAllowedElementTypes.includes(elementType);
        const isAllowedInTargetColumn = (targetColumnName === 'left' ? leftColumnAllowedTypes : rightColumnAllowedTypes).includes(elementType);
        isAllowed = isAllowedByRole && isAllowedInTargetColumn;
      } else {
        // For existing items
        if (sourceColumn === targetColumnName) {
          // Same column - always allowed for reordering
          isAllowed = true;
        } else {
          // Different column - check if element type is allowed in target column
          const isAllowedInTargetColumn = (targetColumnName === 'left' ? leftColumnAllowedTypes : rightColumnAllowedTypes).includes(elementType);
          isAllowed = isAllowedInTargetColumn;
        }
      }
    } else {
      // Not over a valid drop target
      isAllowed = false;
    }

    setIsDropCurrentlyAllowed(isAllowed);
    document.body.style.cursor = isAllowed ? 'grabbing' : 'not-allowed';
  };
  
  const handleDragCancel = () => {
    setActiveDragData(null);
    setIsDropCurrentlyAllowed(true);
    document.body.style.cursor = '';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    setIsDropCurrentlyAllowed(true);
    document.body.style.cursor = '';

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isSourceItem = active.data.current?.isSource === true;
    const elementTypeFromSource = active.data.current?.elementType as string;

    if (isSourceItem && elementTypeFromSource) {
      let targetColumnName: 'left' | 'right' | null = null;
      let targetIndex: number | undefined;
      const overData = over.data.current;

      if (overId === 'left-column-container' || overData?.sortable?.containerId === 'left-column-sorter') {
        targetColumnName = 'left';
        targetIndex = overData?.sortable?.index;
        if (overId === 'left-column-container' && targetIndex === undefined) {
          targetIndex = leftColumn.length; 
        }
      } else if (overId === 'right-column-container' || overData?.sortable?.containerId === 'right-column-sorter') {
        targetColumnName = 'right';
        targetIndex = overData?.sortable?.index;
        if (overId === 'right-column-container' && targetIndex === undefined) {
          targetIndex = rightColumn.length; 
        }
      }

      if (targetColumnName) {
        const isAllowedByRole = roleAllowedElementTypes.includes(elementTypeFromSource);
        const isAllowedInTargetColumn = (targetColumnName === 'left' ? leftColumnAllowedTypes : rightColumnAllowedTypes).includes(elementTypeFromSource);

        if (isAllowedByRole && isAllowedInTargetColumn) {
          addElementToColumn(elementTypeFromSource, targetColumnName, targetIndex);
        } else {
          console.warn(`Element ${elementTypeFromSource} cannot be added to ${targetColumnName}. Role allowed: ${isAllowedByRole}, Column allowed: ${isAllowedInTargetColumn}.`);
        }
      }
    } else {
      // Reordering or moving an existing item
      const activeLocation = findItemById(activeId);
      if (!activeLocation) return;

      let targetColumnName: 'left' | 'right' | null = null;
      let targetIndex: number | undefined;
      const overData = over.data.current;

      if (overId === 'left-column-container' || overData?.sortable?.containerId === 'left-column-sorter') {
        targetColumnName = 'left';
        targetIndex = overData?.sortable?.index;
        if (overId === 'left-column-container' && targetIndex === undefined) targetIndex = leftColumn.length;
      } else if (overId === 'right-column-container' || overData?.sortable?.containerId === 'right-column-sorter') {
        targetColumnName = 'right';
        targetIndex = overData?.sortable?.index;
        if (overId === 'right-column-container' && targetIndex === undefined) targetIndex = rightColumn.length;
      } else {
        const overLocation = findItemById(overId);
        if (overLocation) {
            targetColumnName = overLocation.column;
            targetIndex = overLocation.index;
        } else {
            return; 
        }
      }
      
      if (!targetColumnName) return;
      
      if (targetIndex === undefined) { 
        targetIndex = targetColumnName === 'left' ? leftColumn.length : rightColumn.length;
      }

      if (activeLocation.column === targetColumnName) {
        const setColumn = targetColumnName === 'left' ? setLeftColumn : setRightColumn;
        setColumn(items => arrayMove(items, activeLocation.index, targetIndex!));
      } else {
        // Moving between columns - generate new unique IDs
        const itemToMove = activeLocation.item;
        const isAllowedInNewColumn = (targetColumnName === 'left' ? leftColumnAllowedTypes : rightColumnAllowedTypes).includes(itemToMove.type);
        if (!isAllowedInNewColumn) {
          console.warn(`Element type ${itemToMove.type} not allowed in ${targetColumnName} column.`);
          return;
        }

        const sourceSetColumn = activeLocation.column === 'left' ? setLeftColumn : setRightColumn;
        sourceSetColumn(items => items.filter(item => item.id !== activeId));

        // Generate truly unique IDs for the moved item
        const newInstanceId = generateUniqueId(targetColumnName);
        const movedItem: DashboardItem = {
          ...itemToMove,
          id: `${itemToMove.type}-${newInstanceId}`, // New unique ID
          instanceId: newInstanceId,
        };
        
        const destSetColumn = targetColumnName === 'left' ? setLeftColumn : setRightColumn;
        destSetColumn(items => {
            const newArray = [...items];
            newArray.splice(targetIndex!, 0, movedItem);
            return newArray;
          });
      }
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      const layout = {
        leftColumn: leftColumn.map(item => item.type),
        rightColumn: rightColumn.map(item => item.type)
      };
      
      const response = await fetch('/api/dashboard/layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layout),
      });

      if (!response.ok) {
        throw new Error('Failed to save layout');
      }
      
      onClose();
      window.location.reload(); // Reload the page
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    } finally {
      setSaving(false);
    }
  };


  const handleDragMove = (event: DragMoveEvent) => {
    // move the currently dragged item towards the left by
    // screen width / 2 pixels
    const { active, delta } = event;
    if (active.data.current?.isSource) {
      // For source items, we don't need to adjust position
      return;
    }
    const item = findItemById(active.id as string);
    
    if (item) {
      const shiftAmount = window.innerWidth / 2;
      // Apply transform to shift the item left
      const element = document.querySelector(`[data-dnd-kit-drag-overlay-wrapper]`);
      if (element) {
        (element as HTMLElement).style.transform = `translate3d(${delta.x - shiftAmount}px, ${delta.y}px, 0)`;
      }
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Loading dashboard layout...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Dashboard Layout</DialogTitle>
        </DialogHeader>
        
        <DndContext
          sensors={[sensors]}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToWindowEdges]} 
        >
          <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-2">
                <h3 className="font-semibold text-center">Left Column</h3>
                <DroppableColumn id="left-column-container" isEmpty={leftColumn.length === 0}>
                  <SortableContext id="left-column-sorter" items={leftColumn.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    {leftColumn.map(item => (
                      <DraggableItem 
                        key={item.id} 
                        id={item.id} 
                        label={DASHBOARD_ELEMENT_TO_NAME[item.type as keyof typeof DASHBOARD_ELEMENT_TO_NAME]}
                        onRemove={() => removeElement(item.id)}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <h3 className="font-semibold text-center">Right Column</h3>
                <DroppableColumn id="right-column-container" isEmpty={rightColumn.length === 0}>
                  <SortableContext id="right-column-sorter" items={rightColumn.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    {rightColumn.map(item => (
                      <DraggableItem 
                        key={item.id} 
                        id={item.id} 
                        label={DASHBOARD_ELEMENT_TO_NAME[item.type as keyof typeof DASHBOARD_ELEMENT_TO_NAME]}
                        onRemove={() => removeElement(item.id)}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              </div>
            </div>

            {/* Add Elements Panel - Fully Visible Grid */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-center mb-4">Add Elements (Drag to a column)</h3>
              {roleAllowedElementTypes.length > 0 ? (
                <div className="flex flex-wrap gap-3 p-3 justify-center bg-gray-50 rounded-lg shadow">
                  {roleAllowedElementTypes.map(elementType => (
                    <SourceDraggableElement key={`source-${elementType}`} elementType={elementType} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center p-4">
                  No elements available to add based on your role.
                </p>
              )}
            </div>
          </div>
          
          <DragOverlay>
            {activeDragData ? (
              activeDragData.data.current?.isSource ? (
                <SourceDraggableElement
                  elementType={activeDragData.data.current.elementType}
                  isOverlay
                  isDropAllowed={isDropCurrentlyAllowed}
                />
              ) : (
                <DraggedItemOverlay
                  label={DASHBOARD_ELEMENT_TO_NAME[findItemById(activeDragData.id as string)?.item.type as keyof typeof DASHBOARD_ELEMENT_TO_NAME] || 'Unknown'}
                  isDropAllowed={isDropCurrentlyAllowed}
                />
              )
            ) : null}
          </DragOverlay>
        </DndContext>
        
        <DialogFooter className="mt-auto pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
