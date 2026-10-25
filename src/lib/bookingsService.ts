import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface BookingRecord {
  ref: string;
  name: string;
  phone: string;
  email: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  specialRequest: string;
  createdAt: string;
  status: 'Confirmed' | 'Pending' | 'Checked In' | 'Completed' | 'Cancelled';
}

const BOOKINGS_COLLECTION = 'bookings';
const SETTINGS_COLLECTION = 'settings';

/**
 * Save booking into Cloud Firestore and synchronize local cache
 */
export async function saveBookingToCloud(record: BookingRecord): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${record.ref}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, record.ref);
    // Sanitize data according to blueprint schema
    const payload = {
      ref: record.ref,
      name: record.name.slice(0, 100),
      phone: record.phone.slice(0, 25),
      email: (record.email || '').slice(0, 100),
      roomType: record.roomType.slice(0, 100),
      checkIn: record.checkIn.slice(0, 30),
      checkOut: record.checkOut.slice(0, 30),
      nights: Number(record.nights) || 1,
      guests: Number(record.guests) || 1,
      totalAmount: Number(record.totalAmount) || 0,
      specialRequest: (record.specialRequest || '').slice(0, 500),
      createdAt: record.createdAt || new Date().toISOString(),
      status: record.status || 'Confirmed',
    };

    await setDoc(docRef, payload);

    // Also update local storage for offline resilience
    try {
      const stored = JSON.parse(localStorage.getItem('sheetal_bookings_log') || '[]');
      const filtered = stored.filter((b: BookingRecord) => b.ref !== record.ref);
      filtered.unshift(payload);
      localStorage.setItem('sheetal_bookings_log', JSON.stringify(filtered));
    } catch {}
  } catch (error) {
    // If permission or network error occurs, throw structured error as required
    console.error('Failed to save booking to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Listen in real time to all bookings from Cloud Firestore
 */
export function subscribeToBookings(
  onUpdate: (bookings: BookingRecord[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = BOOKINGS_COLLECTION;
  try {
    const q = query(collection(db, BOOKINGS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: BookingRecord[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as BookingRecord);
        });
        // Sort newest first
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(list);
        try {
          localStorage.setItem('sheetal_bookings_log', JSON.stringify(list));
        } catch {}
      },
      (error) => {
        console.error('Snapshot error on bookings collection:', error);
        if (onError) onError(error as Error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Update booking status in Cloud Firestore
 */
export async function updateBookingStatusInCloud(
  ref: string,
  newStatus: BookingRecord['status']
): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${ref}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, ref);
    await updateDoc(docRef, { status: newStatus });
    
    // Also update local cache
    try {
      const stored: BookingRecord[] = JSON.parse(localStorage.getItem('sheetal_bookings_log') || '[]');
      const updated = stored.map((b) => b.ref === ref ? { ...b, status: newStatus } : b);
      localStorage.setItem('sheetal_bookings_log', JSON.stringify(updated));
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete booking from Cloud Firestore
 */
export async function deleteBookingFromCloud(ref: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${ref}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, ref);
    await deleteDoc(docRef);

    // Also update local cache
    try {
      const stored: BookingRecord[] = JSON.parse(localStorage.getItem('sheetal_bookings_log') || '[]');
      const filtered = stored.filter((b) => b.ref !== ref);
      localStorage.setItem('sheetal_bookings_log', JSON.stringify(filtered));
    } catch {}
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save hotel WhatsApp desk contact number to Cloud Firestore
 */
export async function saveHotelWhatsappNumber(phone: string): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/general`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    await setDoc(docRef, {
      whatsappNumber: phone.slice(0, 25),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    localStorage.setItem('sheetal_hotel_whatsapp', phone);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to hotel general settings
 */
export function subscribeToHotelSettings(
  onPhoneUpdate: (phone: string) => void
): () => void {
  const path = `${SETTINGS_COLLECTION}/general`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.whatsappNumber) {
            onPhoneUpdate(data.whatsappNumber);
            localStorage.setItem('sheetal_hotel_whatsapp', data.whatsappNumber);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
