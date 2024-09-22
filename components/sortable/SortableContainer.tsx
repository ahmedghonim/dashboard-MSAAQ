import React, { FC } from "react";

import { UniqueIdentifier } from "@dnd-kit/core";
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Props {
  children: any;
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  handle: boolean;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export const SortableContainer: FC<Props> = ({ children, disabled, id, items, handle }: Props) => {
  const { active, attributes, setActivatorNodeRef, isDragging, listeners, over, setNodeRef, transition, transform } =
    useSortable({
      id,
      data: {
        type: "container",
        children: items
      },
      animateLayoutChanges
    });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") || items.includes(over.id)
    : false;

  return (
    <div
      ref={disabled ? undefined : setNodeRef}
      style={
        {
          transition,
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : undefined
        } as React.CSSProperties
      }
      {...(!handle ? listeners : undefined)}
    >
      {children({
        handleProps: handle ? { ref: setActivatorNodeRef, ...listeners, ...attributes } : undefined,
        hover: isOverContainer,
        handle: handle
      })}
    </div>
  );
};
