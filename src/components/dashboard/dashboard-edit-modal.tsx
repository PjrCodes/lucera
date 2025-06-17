"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';
import { DndContext, pointerWithin, PointerSensor, useSensor, useSensors, DragEndEvent, useDraggable, DragOverlay, Active, useDroppable, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import DraggableItem from '@/components/dashboard/draggable-item';
import dashboardAcl from '@/appdata/acl/dashboard.json';
import defaultLayouts from '@/appdata/defaults.json';
import { DASHBOARD_ELEMENT_TO_NAME } from '@/constants/constants';
import { UserData } from '@/lib/schemas';

interface DashboardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
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
                    ? 'border-lucerared-4 bg-lucerared-1 text-lucerared-4 cursor-not-allowed shadow-lg'
                    : isOverlay
                    ? 'border-[color:var(--color-lucerabrown-4)] bg-[color:var(--color-lucerabrown-1)] text-[color:var(--color-lucerabrown-5)] shadow-lg cursor-grabbing'
                    : 'border-[color:var(--color-lucerabrown-3)] bg-[color:var(--color-lucerabrown-2)] text-[color:var(--color-lucerabrown-5)] shadow-sm hover:shadow-md hover:bg-[color:var(--color-lucerabrown-3)] cursor-grab'}`}
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
                      ? 'border-[color:var(--color-lucerared-4)] bg-[color:var(--color-lucerared-1)] text-[color:var(--color-lucerared-5)] cursor-not-allowed'
                      : 'border-[color:var(--color-lucerabrown-4)] bg-[color:var(--color-lucerabrown-1)] text-[color:var(--color-lucerabrown-5)] cursor-grabbing'}`}>
      {label}
    </div>
  );
};

// Droppable container component
const DroppableColumn = ({ id, children, isEmpty, activeColumn }: { id: string; children: React.ReactNode; isEmpty: boolean; activeColumn: 'left' | 'right' | null }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const isColumnActive = (id === 'left-column-container' && activeColumn === 'left') ||
                         (id === 'right-column-container' && activeColumn === 'right');

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-colors
                  ${isOver || isColumnActive ? 'border-[color:var(--color-lucerabrown-5)] bg-[color:var(--color-lucerabrown-2)]' : 'border-[color:var(--color-lucerabrown-3)] bg-[color:var(--color-lucerabrown-1)]'}`}
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
  const [activeColumn, setActiveColumn] = useState<'left' | 'right' | null>(null); // Track which column is active


  const userRole = userData?.role || 'student';

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

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
        if (type === "") {
          return null; // Skip empty types
        }
        const instanceId = `left-${globalCounter}`;
        const id = `${type}-${instanceId}`;
        globalCounter++;
        return { id, type, instanceId };
      });

      const rightItems = layout.rightColumn.map((type: string) => {
        if (type === "") {
          return null; // Skip empty types
        }
        const instanceId = `right-${globalCounter}`;
        const id = `${type}-${instanceId}`;
        globalCounter++;
        return { id, type, instanceId };
      });

      // remove null values from arrays
      const filteredLeftItems = leftItems.filter((item: null) => item !== null) as DashboardItem[];
      const filteredRightItems = rightItems.filter((item: null) => item !== null) as DashboardItem[];

      setLeftColumn(filteredLeftItems);
      setRightColumn(filteredRightItems);
      setNextUniqueCounter(globalCounter); // Set the next available counter
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    } finally {
      setLoading(false);
    }
  };  // Added function to reset to default layout
  const resetToDefault = () => {
    setLoading(true);
    try {
      // Use the imported defaults directly
      const defaultLayout = defaultLayouts.dashboardLayout;

      // Get default layout for user role
      const layout = defaultLayout[userRole as keyof typeof defaultLayouts.dashboardLayout] || {
        leftColumn: [],
        rightColumn: []
      };

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
      setNextUniqueCounter(globalCounter);
    } catch (error) {
      console.error('Failed to reset to default layout:', error);
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
      setActiveColumn(null);
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
      setActiveColumn(null);
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

    // Update the active column state
    setActiveColumn(targetColumnName);

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
    setActiveColumn(null);
    document.body.style.cursor = '';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragData(null);
    setIsDropCurrentlyAllowed(true);
    setActiveColumn(null);
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


  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl border-2 border-yellow-400 bg-yellow-100">
          <DialogHeader>
            <DialogTitle className="text-yellow-700">Loading Dashboard Layout</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <span className="inline-block w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col border-2 border-yellow-400 bg-yellow-100">
        <DialogHeader className="rounded-t-lg">
          <DialogTitle className="text-yellow-700">Customise your Dashboard</DialogTitle>
        </DialogHeader>

        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-2">
                <h3 className="font-semibold text-center text-[color:var(--color-lucerabrown-5)]">Left Column</h3>
                <DroppableColumn id="left-column-container" isEmpty={leftColumn.length === 0} activeColumn={activeColumn}>
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
                <h3 className="font-semibold text-center text-[color:var(--color-lucerabrown-5)]">Right Column</h3>
                <DroppableColumn id="right-column-container" isEmpty={rightColumn.length === 0} activeColumn={activeColumn}>
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
            <div>
              <h3 className="font-semibold text-center text-[color:var(--color-lucerabrown-5)] mb-4">Add Elements (Drag to a column)</h3>
              {roleAllowedElementTypes.length > 0 ? (
                <div className="flex flex-wrap gap-3 p-3 justify-center bg-[color:var(--color-lucerabrown-1)] border-2 border-[color:var(--color-lucerabrown-3)] rounded-lg shadow">
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

          {typeof window !== 'undefined' && createPortal(
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
            </DragOverlay>,
            document.body
          )}
        </DndContext>
          <DialogFooter className="mt-auto pt-6">
          <div className="flex items-center gap-2 w-full justify-between">
            <Button variant="outline" onClick={resetToDefault} disabled={loading || saving} type="button" className="border-lucerared-2 text-lucerared-4 hover:bg-lucerared-2 hover:text-lucerared-5 cursor-pointer">
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={saving} type="button" className="border-lucerabrown-4 text-lucerabrown-5 hover:bg-lucerabrown-2 cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} type="button" className="bg-[color:var(--color-lucerabrown-4)] text-white hover:bg-[color:var(--color-lucerabrown-5)] cursor-pointer">
                {saving ? 'Saving...' : 'Save Layout'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
