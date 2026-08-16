import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from './Card'
import CardEditorModal from './CardEditorModal'

export default function List({ list, cards, currentUser }) {
  const [showNew, setShowNew] = useState(false)
  const visibleCards = list.filterDraft ? cards.filter((c) => c.status !== 'draft') : cards
  const { setNodeRef } = useDroppable({ id: list.id, disabled: !list.editable })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-700">{list.heading ?? list.title}</h2>
        <span className="text-xs text-slate-400">{visibleCards.length}</span>
      </div>

      <div ref={setNodeRef} className="min-h-[40px] flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        <SortableContext
          items={visibleCards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {visibleCards.map((card) => (
            <Card key={card.id} card={card} list={list} currentUser={currentUser} />
          ))}
        </SortableContext>
      </div>

      {list.editable && (
        <div className="p-3 pt-0">
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="w-full rounded-lg border border-dashed border-slate-300 py-1.5 text-xs text-slate-400 hover:border-slate-400 hover:text-slate-600"
          >
            + 카드 추가
          </button>
        </div>
      )}

      {showNew && (
        <CardEditorModal
          list={list}
          currentUser={currentUser}
          cardCount={cards.length}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  )
}
