import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  private basePath = '/users'; // Firebase node path

  constructor(private db: AngularFireDatabase) {}

  // Create: Adds a new item to Firebase
  createItem(item: any): Promise<void> {
    const key = this.db.createPushId(); // Generate unique key
    return this.db.object(`${this.basePath}/${key}`).set(item);
  }

  // Read: Get all items as an observable
  getItems(): Observable<any[]> {
    return this.db.list(this.basePath).valueChanges();
  }

  // Read: Get a single item by key
  getItem(key: string): Observable<any> {
    return this.db.object(`${this.basePath}/${key}`).valueChanges();
  }

  // Update: Update an item
  updateItem(key: string, item: any): Promise<void> {
    return this.db.object(`${this.basePath}/${key}`).update(item);
  }

  // Delete: Remove an item by key
  deleteItem(key: string): Promise<void> {
    return this.db.object(`${this.basePath}/${key}`).remove();
  }
}
