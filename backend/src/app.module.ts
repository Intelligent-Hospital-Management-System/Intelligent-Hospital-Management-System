import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { ItemsModule } from './items/items.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [FirebaseModule, ItemsModule, PatientsModule],
})
export class AppModule {}
