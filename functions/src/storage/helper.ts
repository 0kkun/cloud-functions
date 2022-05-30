/* eslint-disable */
import { db } from '../lib/firebaseAdmin';
import { firestore } from 'firebase-admin';

export type Document<T> = {
  readonly id: string
  readonly ref: FirebaseFirestore.DocumentReference
  readonly exists: boolean
  data: () => T
}

export type Where = {
  fieldPath: string | FirebaseFirestore.FieldPath
  opStr: FirebaseFirestore.WhereFilterOp
  value: string | number | Date | undefined | null
}

const convertDocument = <T>(
  doc: FirebaseFirestore.DocumentSnapshot
): Document<T> => {
  return {
    id: doc.id,
    ref: doc.ref,
    exists: doc.exists,
    data: (): T => {
      if (!doc.exists) {
        throw Error('data not found.')
      }
      return ({ ...doc.data(), id: doc.id } as unknown) as T
    },
  }
}

export const findDoc = async <T>(path: string): Promise<Document<T>> => {
  return convertDocument<T>(await db.doc(path).get())
}

export const findCollection = async <T>(
  query: firestore.Query
): Promise<Document<T>[]> => {
  const snapshot = await query.get()
  return snapshot.docs.map((doc: any) => convertDocument<T>(doc))
}

export const findCollectionGroup = async <T>(
  name: string,
  wheres: Where[] = []
): Promise<Document<T>[]> => {
  const collectionGroup = await db.collectionGroup(name)
  if (wheres.length < 1) {
    const querySnapshot = await collectionGroup.get()
    return querySnapshot.docs.map((doc) => convertDocument<T>(doc))
  }

  const collectionQuery = wheres.reduce(
    (query: FirebaseFirestore.Query, where) => {
      return query.where(where.fieldPath, where.opStr, where.value)
    },
    collectionGroup
  )

  const snapshot = await collectionQuery.get()
  return snapshot.docs.map((doc) => convertDocument<T>(doc))
}
