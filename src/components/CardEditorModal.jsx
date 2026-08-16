import { useState } from 'react'
import { createCard, deleteCard, updateCard } from '../data/cards'

export default function CardEditorModal({ card, list, currentUser, cardCount, onClose }) {
  const isNew = !card
  const editable = list.editable
  const [title, setTitle] = useState(card?.title ?? '')
  const [body, setBody] = useState(card?.body ?? '')
  const [status, setStatus] = useState(card?.status ?? 'draft')
  const [busy, setBusy] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    try {
      if (isNew) {
        await createCard({
          listId: list.id,
          classId: list.classId,
          ownerId: currentUser.uid,
          title: title.trim(),
          body: body.trim(),
          status: list.showStatusControls ? status : 'published',
          order: cardCount ?? 0,
        })
      } else {
        await updateCard(card.id, {
          title: title.trim(),
          body: body.trim(),
          ...(list.showStatusControls ? { status } : {}),
        })
      }
      onClose()
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteCard(card.id)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            disabled={!editable}
            autoFocus
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="내용"
            disabled={!editable}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
          />

          {list.showStatusControls && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">공개 상태</span>
              <button
                type="button"
                disabled={!editable}
                onClick={() => setStatus((s) => (s === 'draft' ? 'published' : 'draft'))}
                className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-60 ${
                  status === 'draft'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {status === 'draft' ? '초안 (학생에게 안 보임)' : '공개 (학생에게 보임)'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              {!isNew && editable && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
              >
                닫기
              </button>
              {editable && (
                <button
                  type="submit"
                  disabled={busy || !title.trim()}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  저장
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
