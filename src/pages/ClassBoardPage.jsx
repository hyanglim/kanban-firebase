import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCurrentUser } from '../auth/CurrentUserContext'
import { subscribeClass } from '../data/classes'
import { createList, subscribeLists } from '../data/lists'
import Board from '../components/Board'

export default function ClassBoardPage() {
  const { classId } = useParams()
  const { user } = useCurrentUser()
  const [classInfo, setClassInfo] = useState(null)
  const [lists, setLists] = useState([])
  const [newListTitle, setNewListTitle] = useState('')

  useEffect(() => {
    setClassInfo(null)
    return subscribeClass(classId, setClassInfo)
  }, [classId])

  useEffect(() => {
    setLists([])
    return subscribeLists({ classId }, setLists)
  }, [classId])

  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => {
      if (a.ownerType !== b.ownerType) return a.ownerType === 'teacher' ? -1 : 1
      if (a.ownerId !== b.ownerId) return a.ownerId.localeCompare(b.ownerId)
      return a.order - b.order
    })
  }, [lists])

  const boardLists = useMemo(() => {
    if (user.role === 'teacher') {
      return sortedLists.map((list) => ({
        ...list,
        editable: list.ownerType === 'teacher',
        heading: list.ownerType === 'teacher' ? list.title : `${list.ownerName} · ${list.title}`,
        showStatusControls: list.ownerType === 'teacher',
        filterDraft: false,
      }))
    }
    return sortedLists
      .filter((list) => list.ownerType === 'teacher' || list.ownerId === user.uid)
      .map((list) => {
        const editable = list.ownerId === user.uid
        return {
          ...list,
          editable,
          heading: list.title,
          showStatusControls: false,
          filterDraft: !editable,
        }
      })
  }, [sortedLists, user])

  const myEditableListCount = sortedLists.filter(
    (l) => l.ownerId === user.uid && l.ownerType === user.role,
  ).length

  async function handleAddList(e) {
    e.preventDefault()
    if (!newListTitle.trim()) return
    await createList({
      classId,
      ownerType: user.role,
      ownerId: user.uid,
      ownerName: user.name,
      title: newListTitle.trim(),
      order: myEditableListCount,
    })
    setNewListTitle('')
  }

  if (!classInfo) {
    return <div className="p-10 text-center text-sm text-slate-400">불러오는 중...</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <Link to="/" className="text-xs text-slate-400 hover:underline">
            ← 내 학급
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">{classInfo.name}</h1>
        </div>
        {user.role === 'teacher' && (
          <span className="font-mono text-xs text-slate-400">가입 코드 {classInfo.joinCode}</span>
        )}
      </header>

      <Board lists={boardLists} currentUser={user} />

      <form onSubmit={handleAddList} className="flex gap-2 border-t border-slate-200 p-4">
        <input
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder={user.role === 'teacher' ? '공지 보드에 리스트 추가' : '내 보드에 리스트 추가'}
          className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-slate-400"
        >
          추가
        </button>
      </form>
    </div>
  )
}
