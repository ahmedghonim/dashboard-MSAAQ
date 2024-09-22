import React, { FC, useEffect } from "react";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

import { classNames } from "@/utils";

import styles from "./Item.module.scss";

export interface Props {
  dragOverlay?: boolean;
  disabled?: boolean;
  handle?: boolean;
  id: UniqueIdentifier;
  children: any;

  onRemove?(): void;
}

export const SortableItem = React.memo<FC<Props>>(({ dragOverlay, disabled, handle, id, children }: Props) => {
  const { setNodeRef, setActivatorNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
    id
  });

  useEffect(() => {
    if (!dragOverlay) {
      return;
    }

    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = "";
    };
  }, [dragOverlay]);

  return (
    <div
      className={classNames(styles.Wrapper, isSorting && styles.sorting, dragOverlay && styles.dragOverlay)}
      style={
        {
          transition: [transition].filter(Boolean).join(", "),
          "--translate-x": transform ? `${Math.round(transform.x)}px` : undefined,
          "--translate-y": transform ? `${Math.round(transform.y)}px` : undefined,
          "--scale-x": transform?.scaleX ? `${transform.scaleX}` : undefined,
          "--scale-y": transform?.scaleY ? `${transform.scaleY}` : undefined
        } as React.CSSProperties
      }
      ref={disabled ? undefined : setNodeRef}
    >
      <div
        className={classNames(
          styles.Item,
          isDragging && styles.dragging,
          handle && styles.withHandle,
          dragOverlay && styles.dragOverlay,
          disabled && styles.disabled
        )}
        {...(!handle ? listeners : undefined)}
        tabIndex={!handle ? 0 : undefined}
      >
        {children({
          handle: handle,
          handleProps: handle ? { ref: setActivatorNodeRef, ...listeners } : undefined,
          dragOverlay: dragOverlay,
          isDragging: isDragging,
          isSorting: isSorting,
          transform
        })}
      </div>
    </div>
  );
});
