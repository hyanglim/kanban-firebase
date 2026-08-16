import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { seedDefaultLists } from './lists'

const classesCol = collection(db, 'classes')
const profilesCol = collection(db, 'profiles')

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 헷갈리는 0/O, 1/I 제외

function generateJoinCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

async function ensureProfile(uid, { name, role }) {
  const ref = doc(profilesCol, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { name, role })
  }
}

export async function createClass({ name, teacherId, teacherName }) {
  let joinCode = generateJoinCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await getDocs(query(classesCol, where('joinCode', '==', joinCode)))
    if (existing.empty) break
    joinCode = generateJoinCode()
  }

  await ensureProfile(teacherId, { name: teacherName, role: 'teacher' })

  const classRef = await addDoc(classesCol, {
    name,
    teacherId,
    joinCode,
    studentIds: [],
    schedule: [],
    createdAt: serverTimestamp(),
  })

  await seedDefaultLists({
    classId: classRef.id,
    ownerType: 'teacher',
    ownerId: teacherId,
    ownerName: teacherName,
  })

  return classRef.id
}

export async function joinClassByCode({ code, studentId, studentName }) {
  const normalized = code.trim().toUpperCase()
  const snap = await getDocs(query(classesCol, where('joinCode', '==', normalized)))
  if (snap.empty) {
    throw new Error('가입 코드를 찾을 수 없습니다. 코드를 다시 확인해 주세요.')
  }
  const classDoc = snap.docs[0]
  const classId = classDoc.id

  await ensureProfile(studentId, { name: studentName, role: 'student' })
  await updateDoc(doc(classesCol, classId), { studentIds: arrayUnion(studentId) })
  await seedDefaultLists({
    classId,
    ownerType: 'student',
    ownerId: studentId,
    ownerName: studentName,
  })

  return classId
}

export function subscribeMyClasses({ uid, role }, callback) {
  const q =
    role === 'teacher'
      ? query(classesCol, where('teacherId', '==', uid))
      : query(classesCol, where('studentIds', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeClass(classId, callback) {
  return onSnapshot(doc(classesCol, classId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function updateSchedule(classId, schedule) {
  await updateDoc(doc(classesCol, classId), { schedule })
}
