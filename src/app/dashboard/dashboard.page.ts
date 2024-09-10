import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { StorageService } from '../services/storage.service';
import { addIcons } from 'ionicons';
import { peopleOutline, settingsOutline, search } from 'ionicons/icons';
import { FirebaseStorageService } from '../services/firebase-storage.service';
import { AlertController } from '@ionic/angular';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  username: any;
  map!: L.Map;
  userMarker!: L.Marker;
  watchId!: string;

  alertButtons = ['OK'];

  isAlertOpen = false;

  tunisiaCitiesgeoJsonData: any;
  tunisiaDelegationgeoJsonData: any;

  selectedview: any = "cities";

  currentLayer: L.GeoJSON | undefined;

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

 users: any[] = [];

 selectedUser!: any;

  longitude: any;
  latitude: any;

  datasets = {
    dataset1: '../../assets/data/Tun_adm1.json',
    dataset2: '../../assets/data/TUN_adm2.geojson'
  };

  constructor(
    private storage: StorageService,
    private firebaseCrud: FirebaseStorageService,
    private alertController: AlertController,
    http: HttpClient
  ) {
    addIcons({ peopleOutline, settingsOutline });

    //get cities data
    http.get('../../assets/data/TUN_adm1.geojson').subscribe((data: any) => {
      this.tunisiaCitiesgeoJsonData = data;
      console.log(this.tunisiaCitiesgeoJsonData);
    }, error => {
      console.error('Error loading GeoJSON data:', error);
    });

    //get delegations data
    http.get('../../assets/data/TUN_adm2.geojson').subscribe((data: any) => {
      this.tunisiaDelegationgeoJsonData = data;
      console.log(this.tunisiaDelegationgeoJsonData);
    }, error => {
      console.error('Error loading GeoJSON data:', error);
    });
  }

  async ngOnInit() {
    this.username = await this.storage.get('username');
    this.firebaseCrud.getItems().subscribe((data) => {
      this.users = data;
      console.warn(this.users);
    });

    //this.loadGeoJson();
    this.selectedview = "cities";
  }

  ngAfterViewInit(): void {
    // Adding a slight delay to ensure the DOM is fully loaded
    setTimeout(() => {
      this.initializeMap();
    }, 100); // Adjust this delay as needed

    // Check if the user is online and sync
    window.addEventListener('online', this.syncWithFirebase);
  }

  async initializeMap() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      this.longitude = coordinates.coords.longitude;
      this.latitude = coordinates.coords.latitude;

      // initialize user position
      const user = {
        "latitude": this.latitude,
        "longitude": this.longitude,
        "name": this.username,
        "timestamp": Date.now()
      };

      // save position coordinates
      //this.firebaseCrud.updateItem(this.username, user);

      this.map = L.map('map').setView([33.8869, 9.5375], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© Telcotec'
      }).addTo(this.map);

        this.loadGeoJSON(this.selectedview);
      const customIcon = L.icon({
        iconUrl: '../assets/icon/pos.png', // Path to your custom icon
        iconSize: [32, 32], // Size of the icon
        iconAnchor: [16, 32], // Anchor point of the icon
        popupAnchor: [0, -32] // Popup anchor point
      });

      this.userMarker = L.marker([coordinates.coords.latitude, coordinates.coords.longitude], { icon: customIcon })
        .addTo(this.map)
        //.bindPopup(this.username)
        .openPopup();

      // Start tracking after map initialization
      this.startTracking();
    } catch (error) {
      console.error('Could not get location', error);
    }
  }

  loadGeoJSON(dataset: any): void {
    if (this.currentLayer) {
      this.map?.removeLayer(this.currentLayer); // Remove current layer if exists
    }

    if(dataset == 'cities') {
      this.currentLayer = L.geoJSON(this.tunisiaCitiesgeoJsonData, {
        style: (feature) => ({
          color: '#48CFCB',
          weight: 2,
          fillOpacity: 0.2
        }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`<b>${feature.properties.NAME_1}</b>`);
        }
      }).addTo(this.map);

      // Fit the map to the new GeoJSON bounds
      const bounds = this.currentLayer.getBounds();
      this.map?.fitBounds(bounds);
    }
    else if(dataset == 'delegations') {
      this.currentLayer = L.geoJSON(this.tunisiaDelegationgeoJsonData, {
        style: (feature) => ({
          color: '#7FA1C3',
          weight: 2,
          fillOpacity: 0.2
        }),
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`<b>${feature.properties.NAME_2}</b>`);
        }
      }).addTo(this.map);

      // Fit the map to the new GeoJSON bounds
      const bounds = this.currentLayer.getBounds();
      this.map?.fitBounds(bounds);
    }
  }

  async startTracking() {
    try {
      // Watch for position changes
      this.watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000, // Time before timeout (10 seconds)
        maximumAge: 0, // Do not use cached position
      }, (position, error) => {
        if (error) {
          console.error('Geolocation watch error:', error);
          return;
        }
        if (position) {
          // Save position locally
          this.savePositionLocally(position);

          const { latitude, longitude } = position.coords;
          this.updateMapPosition(latitude, longitude);
          // initialize user position
      const user = {
        "latitude": latitude,
        "longitude": longitude,
        "name": this.username,
        "timestamp": Date.now()
      };

      // save position coordinates
      this.firebaseCrud.updateItem(this.username, user);

        }
      });
    } catch (error) {
      console.error('Error starting position tracking:', error);
    }
  }

  updateMapPosition(lat: number, lng: number) {
    this.map.setView([lat, lng], 7); // Update the map view
    this.userMarker.setLatLng([lat, lng]); // Update the marker position
  }

  stopTracking() {
    // Stop watching the position
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }

  ngOnDestroy() {
    // Clean up when the component is destroyed
    this.stopTracking();
  }

  // Call this method when the tab is activated
  ionViewDidEnter() {
    if (this.map) {
      this.map.invalidateSize(); // Ensure the map is resized properly
    }
  }

  async presentAlert(name:any) {
    let userPromise = this.firebaseCrud.getItem(name);
    userPromise.subscribe((data) => {
      console.warn(data);
      this.selectedUser = data;
    });
    console.warn(this.selectedUser);
    const alert = await this.alertController.create({
      header: name,
      subHeader: 'Details',
      message: `(${this.selectedUser.longitude},${this.selectedUser.latitude})`,
      buttons: ['OK']
    });

    await alert.present();
  }

  savePositionLocally(position: any) {
    const positions = JSON.parse(localStorage.getItem('offlinePositions') || '[]');
    positions.push({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp
    });
    localStorage.setItem('offlinePositions', JSON.stringify(positions));
  }

  syncWithFirebase() {
    const positions = JSON.parse(localStorage.getItem('offlinePositions') || '[]');
    if (positions.length > 0) {
      this.users.forEach(user => {
        console.warn('implement');
      });
      localStorage.removeItem('offlinePositions'); // Clear local storage after syncing
    }
  }

  // selection methods
  handleChange(e:any) {
    this.selectedview = e.detail.value;
    this.loadGeoJSON(this.selectedview);
    console.log('ionChange fired with value: ' + this.selectedview);
  }

  handleCancel() {
    console.log('ionCancel fired');
  }

  handleDismiss() {
    console.log('ionDismiss fired');
  }
}
