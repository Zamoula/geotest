import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { IonicStorageModule } from '@ionic/storage-angular';
import { StorageService } from '../services/storage.service';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    IonicStorageModule.forRoot(),
  ],
  declarations: [DashboardPage],
  providers: [
    StorageService,
    provideHttpClient()
  ]
})
export class DashboardPageModule {}
