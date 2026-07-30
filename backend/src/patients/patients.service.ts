import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Patient } from './patient.interface';

const COLLECTION_NAME = 'patients';

@Injectable()
export class PatientsService implements OnModuleInit {
  constructor(private readonly firebaseService: FirebaseService) {}

  async onModuleInit() {
    console.log('[PatientsService] Conectado a Firestore (colección: "patients").');
  }

  async findAll(): Promise<Patient[]> {
    return this.firebaseService.getCollection<Patient>(COLLECTION_NAME);
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.firebaseService.getDocument<Patient>(COLLECTION_NAME, id);
    if (!patient) {
      throw new NotFoundException(`Paciente con id "${id}" no encontrado`);
    }
    return patient;
  }

  async create(data: Partial<Patient>): Promise<Patient> {
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const patientData: Omit<Patient, 'id'> = {
      name: {
        first: data.name?.first || 'Sin nombre',
        last: data.name?.last || '',
      },
      email: data.email || '',
      phone: data.phone || '',
      picture: {
        thumbnail: data.picture?.thumbnail || '',
      },
    };
    return this.firebaseService.createDocument<Patient>(COLLECTION_NAME, newId, patientData);
  }

  async replace(id: string, data: Partial<Patient>): Promise<Patient> {
    await this.findOne(id);
    const patientData: Omit<Patient, 'id'> = {
      name: {
        first: data.name?.first || 'Sin nombre',
        last: data.name?.last || '',
      },
      email: data.email || '',
      phone: data.phone || '',
      picture: {
        thumbnail: data.picture?.thumbnail || '',
      },
    };
    return this.firebaseService.setDocument<Patient>(COLLECTION_NAME, id, patientData);
  }

  async update(id: string, partial: Partial<Patient>): Promise<Patient> {
    await this.findOne(id);
    return this.firebaseService.updateDocument<Patient>(COLLECTION_NAME, id, partial);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.firebaseService.deleteDocument(COLLECTION_NAME, id);
    return { message: `Paciente "${id}" eliminado correctamente` };
  }
}
