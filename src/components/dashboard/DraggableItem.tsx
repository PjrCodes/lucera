import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DraggableItemProps {
  id: string;
  label: string;
  onRemove?: () => void;
}

export default function DraggableItem({ id, label, onRemove }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
    >
      <div
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {onRemove && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
