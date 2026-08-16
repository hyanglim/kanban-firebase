import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../auth/CurrentUserContext'
import { createClass, joinClassByCode, subscribeMyClasses } from '../data/classes'

export default function HomePage() {
  const { user } = useCurrentUser()
  const [classes, setClasses] = useState([])
  const [className, setClassName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lastCreatedId, setLastCreatedId] = useState(null)

  useEffect(() => {
    setClasses([])
    return subscribeMyClasses({ uid: user.uid, role: user.role }, setClasses)
  }, [user.uid, user.role])

  async function handleCreate(e) {
    e.preventDefault()
    if (!className.trim()) return
    setBusy(true)
    setError('')
    try {
      const classId = await createClass({
        name: className.trim(),
        teacherId: user.uid,
        teacherName: user.name,
      })
      setClassName('')
      setLastCreatedId(classId)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setBusy(true)
    setError('')
    try {
      await joinClassByCode({ code: joinCode.trim(), studentId: user.uid, studentName: user.name })
      setJoinCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const createdClass = classes.find((c) => c.id === lastCreatedId)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        {user.role === 'teacher' ? '내 학급' : '내 학급 목록'}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{user.name}님으로 접속 중</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      {user.role === 'teacher' ? (
        <form onSubmit={handleCreate} className="mt-6 flex gap-2">
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="새 학급 이름"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            학급 만들기
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="mt-6 flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="가입 코드 입력"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            참여하기
          </button>
        </form>
      )}

      {createdClass && (
        <p className="mt-3 text-sm text-slate-600">
          가입 코드:{' '}
          <span className="font-mono font-semibold text-slate-900">{createdClass.joinCode}</span>{' '}
          — 학생에게 공유하세요.
        </p>
      )}

      <ul className="mt-8 space-y-2">
        {classes.map((c) => (
          <li key={c.id}>
            <Link
              to={`/class/${c.id}`}
              className="block rounded-lg border border-slate-200 px-4 py-3 text-sm hover:border-slate-400"
            >
              <span className="font-medium text-slate-900">{c.name}</span>
              {user.role === 'teacher' && (
                <span className="ml-2 font-mono text-xs text-slate-400">{c.joinCode}</span>
              )}
            </Link>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="text-sm text-slate-400">
            {user.role === 'teacher' ? '아직 만든 학급이 없습니다.' : '아직 참여한 학급이 없습니다.'}
          </li>
        )}
      </ul>
    </div>
  )
}
