import React, { createElement, useCallback, useEffect, useRef, useState } from "react";

import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { SortableContainer } from "./SortableContainer";
import { SortableItem } from "./SortableItem";
import { coordinateGetter as multipleContainersCoordinateGetter } from "./multipleContainersKeyboardCoordinates";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5"
      }
    }
  })
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

interface Props {
  renderContainer?: any;
  renderContainerProps?: any;
  renderItem?: any;
  renderItemProps?: any;
  nestedItemsAccessor?: string;

  onSortChange(items: Items): void;

  items: {
    id: number | string;
    [key: string]: any;
  }[];
  handle?: boolean;
  disableMultipleContainers?: boolean;
}

function transformArray(
  originalArray: {
    id: number | string;
    [key: string]: any;
  }[],
  keyMapperFn: (id: number | string) => any,
  valueMapperFn: (id: number) => any,
  key?: string
): { [key: number]: any } {
  if (!originalArray) {
    return {};
  }
  return originalArray.reduce((accumulator: any, currentValue) => {
    if (key) {
      accumulator[keyMapperFn(currentValue.id)] = currentValue[key].map((el: { id: number; [key: string]: any }) =>
        valueMapperFn(el.id)
      );
    } else {
      accumulator[keyMapperFn(currentValue.id)] = [];
    }
    return accumulator;
  }, {});
}

function reorderObject(object: { [key: string]: any[] }, order: UniqueIdentifier[]): { [key: string]: any[] } {
  return Object.entries(object)
    .sort(([key1], [key2]) => {
      const index1 = order.indexOf(key1);
      const index2 = order.indexOf(key2);
      return index1 - index2;
    })
    .reduce((accumulator, [key, value]) => {
      accumulator[key] = value;
      return accumulator;
    }, {} as { [key: string]: any[] });
}

export function SortableContainers({
  renderContainer,
  renderContainerProps,
  renderItemProps,
  disableMultipleContainers = false,
  renderItem,
  handle = false,
  nestedItemsAccessor,
  items: initialItems,
  onSortChange
}: Props) {
  const [items, setItems] = useState<Items>(
    transformArray(
      initialItems,
      (id) => `container-${id}`,
      (id) => `item-${id}`,
      nestedItemsAccessor
    )
  );
  const [afterMoveToNewContainerItems, setAfterMoveToNewContainerItems] = useState<Items | null>(null);
  const [containers, setContainers] = useState(Object.keys(items) as UniqueIdentifier[]);
  useEffect(() => {
    const newItems = transformArray(
      initialItems,
      (id) => `container-${id}`,
      (id) => `item-${id}`,
      nestedItemsAccessor
    );
    setItems(newItems);
    setContainers(Object.keys(newItems) as UniqueIdentifier[]);
  }, [initialItems]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const itemContainerChanged = useRef(false);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) => container.id in items)
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        //in case of moving from one container to another

        if (overId in items) {
          const containerItems = items[overId];
          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => container.id !== overId && containerItems.includes(container.id)
              )
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: multipleContainersCoordinateGetter
    })
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);
  const findDeepItem = (id: number) => {
    if (!nestedItemsAccessor) {
      return null;
    }
    for (const key in initialItems) {
      for (const item of initialItems[key][nestedItemsAccessor]) {
        if (item.id === id) {
          return item;
        }
      }
    }
    return null;
  };

  const getContainer = (containerId: UniqueIdentifier) => {
    const id = (containerId as string).split("-").slice(1).join("-");

    return initialItems.find((el) => el.id == id);
  };

  const getContainerItem = (containerId: UniqueIdentifier, itemId: UniqueIdentifier) => {
    if (!nestedItemsAccessor || !containerId || !itemId) {
      return { title: "", id: 0 };
    }
    const $itemId = (itemId as string).split("-")[1];
    const found = getContainer(containerId)?.[nestedItemsAccessor].find(
      (el: { id: number; [key: string]: any }) => el.id === parseInt($itemId)
    );
    if (!found) {
      return findDeepItem(parseInt($itemId));
    }

    return found;
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        }
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={({ active, over }) => {
        if (disableMultipleContainers) {
          return;
        }
        const overId = over?.id;

        if (overId == null || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);
        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          const activeItems = items[activeContainer];
          const overItems = items[overContainer];
          const overIndex = overItems.indexOf(overId);
          const activeIndex = activeItems.indexOf(active.id);
          let newIndex: number;

          if (overId in items) {
            newIndex = overItems.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          }

          recentlyMovedToNewContainer.current = true;
          itemContainerChanged.current = true;
          const newItems = {
            ...items,
            [activeContainer]: items[activeContainer].filter((item) => item !== active.id),
            [overContainer]: [
              ...items[overContainer].slice(0, newIndex),
              items[activeContainer][activeIndex],
              ...items[overContainer].slice(newIndex, items[overContainer].length)
            ]
          };
          setItems(newItems);
          setAfterMoveToNewContainerItems(newItems);
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in items && over?.id) {
          const activeIndex = containers.indexOf(active.id);
          const overIndex = containers.indexOf(over.id);
          if (activeIndex !== overIndex) {
            const newItems = reorderObject(items, arrayMove(containers, activeIndex, overIndex));
            const newContainers = arrayMove(containers, activeIndex, overIndex);
            setContainers(newContainers);
            setItems(newItems);
            onSortChange(newItems);
          }
        }
        const activeContainer = findContainer(active.id);
        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        const overContainer = findContainer(overId);
        if (disableMultipleContainers && overContainer !== activeContainer) {
          setActiveId(null);
          return;
        }
        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            const newItems = {
              ...items,
              [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex)
            };
            setItems(newItems);
            onSortChange(newItems);
          } else if (
            itemContainerChanged.current &&
            afterMoveToNewContainerItems &&
            Object.keys(afterMoveToNewContainerItems ?? []).length
          ) {
            onSortChange(afterMoveToNewContainerItems);
          }
        }
        itemContainerChanged.current = false;
        setAfterMoveToNewContainerItems(null);
        setActiveId(null);
      }}
      onDragCancel={onDragCancel}
    >
      <SortableContext
        items={[...containers]}
        strategy={verticalListSortingStrategy}
      >
        {containers.map((containerId) => (
          <SortableContainer
            key={containerId}
            id={containerId}
            items={items[containerId]}
            handle={handle}
          >
            {({ handleProps, hover }: any) => (
              <>
                {getContainer(containerId) &&
                  createElement(renderContainer as any, {
                    ...renderContainerProps,
                    handleProps,
                    hover,
                    handle,
                    data: getContainer(containerId),
                    itemsCount: items[containerId]?.length ?? 0,
                    children: (
                      <>
                        <SortableContext
                          items={items[containerId]}
                          strategy={verticalListSortingStrategy}
                        >
                          {items[containerId].map((value) => {
                            return (
                              <SortableItem
                                handle={handle}
                                id={value}
                                key={value}
                              >
                                {({ handle, handleProps, dragOverlay, isDragging, isSorting, transform }: any) => (
                                  <>
                                    {getContainerItem(containerId, value) &&
                                      createElement(renderItem as any, {
                                        ...renderItemProps,
                                        handle,
                                        handleProps,
                                        dragOverlay,
                                        isDragging,
                                        isSorting,
                                        transform,
                                        data: {
                                          ...getContainerItem(containerId, value),
                                          parent: getContainer(containerId)
                                        }
                                      })}
                                  </>
                                )}
                              </SortableItem>
                            );
                          })}
                        </SortableContext>
                      </>
                    )
                  })}
              </>
            )}
          </SortableContainer>
        ))}
      </SortableContext>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    const item = getContainerItem(findContainer(id) as string, id);
    return item
      ? createElement(renderItem as any, {
          ...renderItemProps,
          handle,
          dragOverlay: true,
          isDragging: false,
          isSorting: false,
          data: {
            ...item,
            parent: getContainer(findContainer(id) as string)
          }
        })
      : null;
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    const container = getContainer(containerId);
    return (
      <>
        {container
          ? createElement(renderContainer as any, {
              ...renderContainerProps,
              handle,
              data: container,
              itemsCount: items[containerId]?.length ?? 0,
              children: (
                <>
                  {items[containerId].map((item) =>
                    getContainerItem(containerId, item)
                      ? createElement(renderItem as any, {
                          ...renderItemProps,
                          key: item,
                          handle,
                          dragOverlay: false,
                          isDragging: false,
                          isSorting: false,
                          data: { ...getContainerItem(containerId, item), parent: container }
                        })
                      : null
                  )}
                </>
              )
            })
          : null}
      </>
    );
  }
}
