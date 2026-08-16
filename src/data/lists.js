import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

const listsCol = collection(db, 'lists')

const DEFAULT_TEACHER_LISTS = ['공지사항']
const DEFAULT_STUDENT_LISTS = ['나의 기록']

// 학급 생성/학생 참여 시 기본 리스트를 한 번만 시드한다.
export async function seedDefaultLists({ classId, ownerType, ownerId, ownerName }) {
  const existing = await getDocs(
    query(listsCol, where('classId', '==', classId), where('ownerId', '==', ownerId)),
  )
  if (!existing.empty) return

  const titles = ownerType === 'teacher' ? DEFAULT_TEACHER_LISTS : DEFAULT_STUDENT_LISTS
  const batch = writeBatch(db)
  titles.forEach((title, index) => {
    const ref = doc(listsCol)
    batch.set(ref, {
      classId,
      ownerType,
      ownerId,
      ownerName,
      title,
      order: index,
      createdAt: serverTimestamp(),
    })
  })
  await batch.commit()
}

export function subscribeLists({ classId }, callback) {
  const q = query(listsCol, where('classId', '==', classId), orderBy('order'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function createList({ classId, ownerType, ownerId, ownerName, title, order }) {
  await addDoc(listsCol, {
    classId,
    ownerType,
    ownerId,
    ownerName,
    title,
    order,
    createdAt: serverTimestamp(),
  })
}

export async function deleteList(listId) {
  await deleteDoc(doc(listsCol, listId))
}

export async function renameList(listId, title) {
  await updateDoc(doc(listsCol, listId), { title })
}
