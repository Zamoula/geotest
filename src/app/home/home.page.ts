import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  username: string = '';

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    this.storageService.init();
  }

  async submit() {
    await this.storageService.set('username', this.username);
    this.router.navigate(['/dashboard']);
  }

}
