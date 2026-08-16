import { createContext, useContext, useMemo, useState } from 'react'

// 목업 사용자 픽스처. 실제 Firebase Auth 연동 시 이 배열과
// MockAuthProvider 내부 구현만 onAuthStateChanged 기반으로 교체하면 되고,
// useCurrentUser()를 호출하는 쪽 코드는 바뀌지 않는다.
const MOCK_USERS = [
  { uid: 'teacher-1', name: '김선생', role: 'teacher' },
  { uid: 'student-1', name: '학생 A', role: 'student' },
  { uid: 'student-2', name: '학생 B', role: 'student' },
]

const CurrentUserContext = createContext(null)

export function MockAuthProvider({ children }) {
  const [index, setIndex] = useState(0)

  const value = useMemo(
    () => ({
      user: MOCK_USERS[index],
      loading: false,
      users: MOCK_USERS,
      switchUser: (uid) => {
        const nextIndex = MOCK_USERS.findIndex((u) => u.uid === uid)
        if (nextIndex >= 0) setIndex(nextIndex)
      },
    }),
    [index],
  )

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  )
}

// 실제 Auth 연동 이후에도 유지할 고정 인터페이스.
export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) {
    throw new Error('useCurrentUser must be used within MockAuthProvider')
  }
  return { user: ctx.user, loading: ctx.loading }
}

// 개발용 역할 전환 위젯(RoleSwitcher) 전용 — 실제 Auth 연동 시 제거될 훅.
export function useMockAuthControls() {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) {
    throw new Error('useMockAuthControls must be used within MockAuthProvider')
  }
  return { users: ctx.users, current: ctx.user, switchUser: ctx.switchUser }
}
