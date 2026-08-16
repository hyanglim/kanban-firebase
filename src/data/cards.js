import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

const cardsCol = collection(db, 'cards')

export function subscribeCards({ listId }, callback) {
  const q = query(cardsCol, where('listId', '==', listId), orderBy('order'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function createCard({ listId, classId, ownerId, title, body, status, order }) {
  await addDoc(cardsCol, {
    listId,
    classId,
    ownerId,
    title,
    body: body ?? '',
    status: status ?? 'published',
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCard(cardId, patch) {
  await updateDoc(doc(cardsCol, cardId), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteCard(cardId) {
  await deleteDoc(doc(cardsCol, cardId))
}

// 드래그 재정렬 결과를 한 리스트에 대해 한 번에 반영한다.
export async function reorderCards(listId, cards) {
  const batch = writeBatch(db)
  cards.forEach((card, index) => {
    batch.update(doc(cardsCol, card.id), { listId, order: index })
  })
  await batch.commit()
}
