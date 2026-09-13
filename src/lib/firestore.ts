import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
  type WhereFilterOp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirestoreFilter {
  field: string;
  op?: WhereFilterOp;
  value: unknown;
}
export interface FirestoreListOptions {
  filter?: FirestoreFilter;
  order?: { field: string; direction?: "asc" | "desc" };
  limit?: number;
}

function constraints(options: FirestoreListOptions = {}): QueryConstraint[] {
  const result: QueryConstraint[] = [];
  if (options.filter)
    result.push(
      where(
        options.filter.field,
        options.filter.op ?? "==",
        options.filter.value
      )
    );
  if (options.order)
    result.push(
      orderBy(options.order.field, options.order.direction ?? "desc")
    );
  if (options.limit) result.push(limit(options.limit));
  return result;
}

function normalizeFirestoreValue(value: unknown): unknown {
  if (value && typeof value === "object" && "toDate" in value) {
    const timestamp = value as { toDate: () => Date };
    return timestamp.toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeFirestoreValue(item),
      ])
    );
  }
  return value;
}

export async function listDocuments<T = Record<string, unknown>>(
  collectionName: string,
  options: FirestoreListOptions = {}
): Promise<Array<T & { id: string }>> {
  const snapshot = await getDocs(
    query(collection(db, collectionName), ...constraints(options))
  );
  return snapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...(normalizeFirestoreValue(item.data()) as Record<string, unknown>),
      }) as T & { id: string }
  );
}

export async function countDocuments(
  collectionName: string,
  filter?: FirestoreFilter
): Promise<number> {
  const ref = query(collection(db, collectionName), ...constraints({ filter }));
  return (await getCountFromServer(ref)).data().count;
}

export async function patchDocument(
  collectionName: string,
  id: string,
  patch: Record<string, unknown>
) {
  await updateDoc(doc(db, collectionName, id), patch);
}

export async function createDocument(
  collectionName: string,
  data: Record<string, unknown>
) {
  return addDoc(collection(db, collectionName), data);
}

export function subscribeToCollection(
  collectionName: string,
  callback: () => void
): Unsubscribe {
  return onSnapshot(collection(db, collectionName), callback);
}
