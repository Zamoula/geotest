import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { FirebaseStorageService } from '../services/firebase-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  username: string = '';

  constructor(
    private router: Router,
    private storageService: StorageService,
    private firebaseCrud: FirebaseStorageService
  ) {}

  async ngOnInit() {
    this.storageService.init();

    let nameExist = await this.storageService.get('username');
    if(!nameExist) {
      this.router.navigate(['/dashboard']);
    }
  }

  addItem() {
    const user = {
      name: this.username,
      longitude: 0,
      latitude: 0,
      timestamp: Date.now()
    };
/*
    this.firebaseCrud.createItem(user).then(() => {
      console.log('user added successfully');
    });
    */
  }

  async submit() {
    await this.storageService.set('username', this.username);
    setTimeout(() => {
      this.addItem();
    },1000);
    this.router.navigate(['/dashboard']);
  }

}
