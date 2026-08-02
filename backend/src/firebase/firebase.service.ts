import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db!: Firestore;

  async onModuleInit() {
    if (getApps().length === 0) {
      const envJson = process.env['FIREBASE_SERVICE_ACCOUNT'];
      const keyPath = path.join(process.cwd(), 'firebase-service-account.json');

      if (envJson) {
        const serviceAccount = JSON.parse(envJson);
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('[FirebaseService] Conectado a Firestore mediante Service Account.');
      } else if (fs.existsSync(keyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('[FirebaseService] Conectado a Firestore mediante Service Account (firebase-admin).');
      } else {
        throw new Error(
          'No se encontraron credenciales de Firebase. '
        );
      }
    }
    this.db = getFirestore();
  }
  async verifyToken(token: string): Promise<DecodedIdToken> {
    return getAuth().verifyIdToken(token);
  }

  async getCollection<T = any>(collectionName: string): Promise<T[]> {
    try {
      const snapshot = await this.db.collection(collectionName).get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as T),
      }));
    } catch (error: any) {
      console.error(`[FirebaseService] Error al obtener colección "${collectionName}":`, error.message);
      return [];
    }
  }

  async getDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const doc = await this.db.collection(collectionName).doc(docId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...(doc.data() as T) };
    } catch (error: any) {
      console.error(`[FirebaseService] Error al obtener documento "${collectionName}/${docId}":`, error.message);
      return null;
    }
  }

  async createDocument<T = any>(collectionName: string, docId: string, data: any): Promise<T> {
    try {
      const { id, ...cleanData } = data;
      await this.db.collection(collectionName).doc(docId).set(cleanData);
      const savedDoc = await this.getDocument<T>(collectionName, docId);
      return savedDoc!;
    } catch (error: any) {
      console.error(`[FirebaseService] Error al crear documento "${collectionName}/${docId}":`, error.message);
      throw error;
    }
  }

  async setDocument<T = any>(collectionName: string, docId: string, data: any): Promise<T> {
    try {
      const { id, ...cleanData } = data;
      await this.db.collection(collectionName).doc(docId).set(cleanData);
      const savedDoc = await this.getDocument<T>(collectionName, docId);
      return savedDoc!;
    } catch (error: any) {
      console.error(`[FirebaseService] Error al reemplazar documento "${collectionName}/${docId}":`, error.message);
      throw error;
    }
  }

  async updateDocument<T = any>(collectionName: string, docId: string, data: Partial<any>): Promise<T> {
    try {
      const { id, ...cleanData } = data;
      await this.db.collection(collectionName).doc(docId).update(cleanData);
      const updatedDoc = await this.getDocument<T>(collectionName, docId);
      return updatedDoc!;
    } catch (error: any) {
      console.error(`[FirebaseService] Error al actualizar documento "${collectionName}/${docId}":`, error.message);
      throw error;
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    try {
      await this.db.collection(collectionName).doc(docId).delete();
      return true;
    } catch (error: any) {
      console.error(`[FirebaseService] Error al eliminar documento "${collectionName}/${docId}":`, error.message);
      return false;
    }
  }
}
