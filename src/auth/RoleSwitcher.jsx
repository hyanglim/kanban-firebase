import { useMockAuthControls } from './CurrentUserContext'

// 로그인 없이 교사/학생 화면을 반복 확인하기 위한 개발 전용 위젯.
// 실제 Firebase Auth 연동 시 이 컴포넌트 자체를 제거한다.
export default function RoleSwitcher() {
  const { users, current, switchUser } = useMockAuthControls()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-1 rounded-full border border-slate-200 bg-white/95 p-1 text-sm shadow-lg backdrop-blur">
      {users.map((u) => (
        <button
          key={u.uid}
          type="button"
          onClick={() => switchUser(u.uid)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            current.uid === u.uid
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {u.name}
        </button>
      ))}
    </div>
  )
}
