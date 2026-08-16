import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CardEditorModal from './CardEditorModal'

export default function Card({ card, list, currentUser }) {
  const [open, setOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !list.editable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(list.editable ? attributes : {})}
        {...(list.editable ? listeners : {})}
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-300"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-slate-800">{card.title}</p>
          {list.showStatusControls && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                card.status === 'draft'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {card.status === 'draft' ? '초안' : '공개'}
            </span>
          )}
        </div>
        {card.body && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{card.body}</p>}
      </div>

      {open && (
        <CardEditorModal
          card={card}
          list={list}
          currentUser={currentUser}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
