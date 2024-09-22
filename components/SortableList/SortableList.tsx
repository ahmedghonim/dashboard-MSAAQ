import type { ReactNode } from "react";
import React, { useMemo } from "react";

import type { Active, UniqueIdentifier } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { DragHandle, SortableItem } from "./SortableItem";
import { SortableOverlay } from "./SortableOverlay";

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];

  onChange(item1: number, item2: number): void;

  renderItem(item: T, index: number, dragOverlay?: boolean): ReactNode;
}

export function SortableList<T extends BaseItem>({ items, onChange, renderItem }: Props<T>) {
  const [active, setActive] = React.useState<Active | null>(null);

  const activeItem: (T & { index: number }) | null = useMemo(() => {
    if (active) {
      const index = items.findIndex((item) => item.id === active.id);
      if (index !== -1) {
        return { ...items[index], index };
      }
    }
    return null;
  }, [active, items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange(activeIndex, overIndex);
        }
        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={items}>
        <ul
          className="flex flex-col gap-3"
          role="application"
        >
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <SortableList.Item id={item.id}>{renderItem(item, index)}</SortableList.Item>
            </React.Fragment>
          ))}
        </ul>
      </SortableContext>
      <SortableOverlay>{activeItem ? renderItem(activeItem, activeItem.index, true) : null}</SortableOverlay>
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
