import React from 'react';
import { Priority } from '../types';

interface PriorityListProps {
  priorities: Priority[];
  draggedItem: number | null;
  onAddPriority: () => void;
  onRemovePriority: (id: number) => void;
  onUpdatePriority: (id: number, field: keyof Priority, value: string | number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export const PriorityList: React.FC<PriorityListProps> = ({
  priorities,
  draggedItem,
  onAddPriority,
  onRemovePriority,
  onUpdatePriority,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Priorities</h2>
        <button
          onClick={onAddPriority}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Add Priority
        </button>
      </div>
      
      <div className="space-y-3">
        {priorities.map((priority, index) => (
          <div 
            key={priority.id} 
            className={`flex flex-col gap-3 p-3 sm:p-4 rounded-md transition-all ${
              draggedItem === index ? 'bg-blue-100 opacity-50 scale-95' : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={(e) => onDragOver(e, index)}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" 
                  title="Drag to reorder"
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragEnd={onDragEnd}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                  </svg>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold" title={priority.note || ''}>
                  {index + 1}
                </div>
              </div>
              <input
                type="text"
                value={priority.name}
                onChange={(e) => onUpdatePriority(priority.id, 'name', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Priority name"
              />
              <div className="relative w-full sm:w-40">
                <input
                  type="number"
                  value={priority.yearlyAmount === 0 ? '' : priority.yearlyAmount}
                  onChange={(e) => onUpdatePriority(priority.id, 'yearlyAmount', e.target.value)}
                  className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yearly amount"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              </div>
              <button
                onClick={() => onRemovePriority(priority.id)}
                className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Note:</span>
              <input
                type="text"
                value={priority.note || ''}
                onChange={(e) => onUpdatePriority(priority.id, 'note', e.target.value)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional note"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
