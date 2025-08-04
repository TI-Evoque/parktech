import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { AcademyUnit } from '../types/academy';

// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class FirebaseService {
  // Salvar todas as unidades
  static async saveUnits(units: AcademyUnit[]): Promise<void> {
    try {
      const batch = units.map(async (unit) => {
        await setDoc(doc(db, 'units', unit.id), unit);
      });
      await Promise.all(batch);
      console.log('Unidades salvas com sucesso no Firebase');
    } catch (error) {
      console.error('Erro ao salvar unidades:', error);
      throw error;
    }
  }

  // Carregar todas as unidades
  static async loadUnits(): Promise<AcademyUnit[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'units'));
      const units: AcademyUnit[] = [];
      querySnapshot.forEach((doc) => {
        units.push(doc.data() as AcademyUnit);
      });
      console.log('Unidades carregadas do Firebase');
      return units;
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      throw error;
    }
  }

  // Atualizar uma unidade específica
  static async updateUnit(unit: AcademyUnit): Promise<void> {
    try {
      await updateDoc(doc(db, 'units', unit.id), unit as any);
      console.log('Unidade atualizada no Firebase');
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      throw error;
    }
  }

  // Deletar uma unidade
  static async deleteUnit(unitId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'units', unitId));
      console.log('Unidade deletada do Firebase');
    } catch (error) {
      console.error('Erro ao deletar unidade:', error);
      throw error;
    }
  }

  // Criar backup dos dados
  static async createBackup(): Promise<string> {
    try {
      const units = await this.loadUnits();
      const backup = {
        timestamp: new Date().toISOString(),
        data: units,
        version: '1.0'
      };
      
      // Salvar backup no Firestore
      const backupRef = await addDoc(collection(db, 'backups'), backup);
      console.log('Backup criado com ID:', backupRef.id);
      return backupRef.id;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }

  // Listar backups disponíveis
  static async listBackups(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'backups'));
      const backups: any[] = [];
      querySnapshot.forEach((doc) => {
        backups.push({ id: doc.id, ...doc.data() });
      });
      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  // Restaurar backup
  static async restoreBackup(backupId: string): Promise<AcademyUnit[]> {
    try {
      const backupDoc = await getDocs(collection(db, 'backups'));
      let backupData: any = null;
      
      backupDoc.forEach((doc) => {
        if (doc.id === backupId) {
          backupData = doc.data();
        }
      });

      if (!backupData) {
        throw new Error('Backup não encontrado');
      }

      // Restaurar dados
      await this.saveUnits(backupData.data);
      console.log('Backup restaurado com sucesso');
      return backupData.data;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    }
  }
}
