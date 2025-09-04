import React from "react";
import {
  DndContext,
  rectIntersection,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

/**
 * Generic sortable list with handle-only dragging.
 *
 * children: render-prop (item, { attributes, listeners }) => ReactNode
 * - attributes/listeners are intended to be applied to the drag handle only.
 */
interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (items: T[]) => void;
  children: (
    item: T,
    props: {
      attributes: React.HTMLAttributes<Element>;
      listeners: any;
    }
  ) => React.ReactNode;
}

export function SortableList<T>({
  items,
  getId,
  onReorder,
  children,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const oldIndex = items.findIndex((i) => getId(i) === activeId);
    const newIndex = items.findIndex((i) => getId(i) === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      // auto-update sequence if your item shape has it
      // if not desired, remove the mapping
      ...(typeof (item as any).sequence !== "undefined"
        ? { ...(item as any), sequence: idx + 1 }
        : { ...(item as any) }),
    }));

    onReorder(reordered);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection} // better non-adjacent target detection
      modifiers={[restrictToVerticalAxis]} // restrict dragging to vertical axis
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((item) => (
            <SortableItem key={getId(item)} id={getId(item)}>
              {(props) => children(item, props)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* SortableItem: attaches setNodeRef and style to a real wrapper div
   and forwards attributes/listeners (for the handle) to children.
*/
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (props: {
    attributes: React.HTMLAttributes<Element>;
    listeners: any;
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Attach setNodeRef & style to this wrapper so dnd-kit can properly compute target collisions.
  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}

export default SortableList;
