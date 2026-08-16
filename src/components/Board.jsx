import { useEffect, useRef, useState } from 'react'
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { subscribeCards, reorderCards } from '../data/cards'
import List from './List'

export default function Board({ lists, currentUser }) {
  const [cardsByListId, setCardsByListId] = useState({})
  const dragSourceListId = useRef(null)

  useEffect(() => {
    const unsubs = lists.map((list) =>
      subscribeCards({ listId: list.id }, (cards) => {
        setCardsByListId((prev) => ({ ...prev, [list.id]: cards }))
      }),
    )
    return () => unsubs.forEach((unsub) => unsub())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists.map((l) => l.id).join(',')])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function findContainer(cardId) {
    return lists.find((l) => (cardsByListId[l.id] || []).some((c) => c.id === cardId))?.id
  }

  function handleDragStart(event) {
    dragSourceListId.current = findContainer(event.active.id)
  }

  function handleDragOver(event) {
    const { active, over } = event
    if (!over) return

    const fromListId = findContainer(active.id)
    const toListId = lists.some((l) => l.id === over.id) ? over.id : findContainer(over.id)
    if (!fromListId || !toListId || fromListId === toListId) return

    const fromList = lists.find((l) => l.id === fromListId)
    const toList = lists.find((l) => l.id === toListId)
    if (!fromList?.editable || !toList?.editable) return

    setCardsByListId((prev) => {
      const fromCards = [...(prev[fromListId] || [])]
      const toCards = [...(prev[toListId] || [])]
      const activeIndex = fromCards.findIndex((c) => c.id === active.id)
      if (activeIndex === -1) return prev
      const [moved] = fromCards.splice(activeIndex, 1)
      const overIndex = toCards.findIndex((c) => c.id === over.id)
      toCards.splice(overIndex >= 0 ? overIndex : toCards.length, 0, moved)
      return { ...prev, [fromListId]: fromCards, [toListId]: toCards }
    })
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    const sourceListId = dragSourceListId.current
    dragSourceListId.current = null
    if (!over) return

    const currentListId = findContainer(active.id)
    if (!currentListId) return
    const currentList = lists.find((l) => l.id === currentListId)
    if (!currentList?.editable) return

    let finalCards = cardsByListId[currentListId] || []
    if (active.id !== over.id) {
      const oldIndex = finalCards.findIndex((c) => c.id === active.id)
      const newIndex = finalCards.findIndex((c) => c.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        finalCards = [...finalCards]
        const [moved] = finalCards.splice(oldIndex, 1)
        finalCards.splice(newIndex, 0, moved)
        setCardsByListId((prev) => ({ ...prev, [currentListId]: finalCards }))
      }
    }

    await reorderCards(currentListId, finalCards)
    if (sourceListId && sourceListId !== currentListId) {
      await reorderCards(sourceListId, cardsByListId[sourceListId] || [])
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {lists.map((list) => (
          <List
            key={list.id}
            list={list}
            cards={cardsByListId[list.id] || []}
            currentUser={currentUser}
          />
        ))}
      </div>
    </DndContext>
  )
}
