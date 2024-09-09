import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { StorageService } from '../services/storage.service';
import { addIcons } from 'ionicons';
import { peopleOutline, settingsOutline, search } from 'ionicons/icons';

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

  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  users: any[] = [{
    "username": "bbleas0"
  }, {
    "username": "codonohue1"
  }, {
    "username": "wjosovitz2"
  }, {
    "username": "aleipelt3"
  }, {
    "username": "rrentilll4"
  }, {
    "username": "gcowdroy5"
  }, {
    "username": "dkobke6"
  }, {
    "username": "kwhyberd7"
  }, {
    "username": "iwims8"
  }, {
    "username": "erheaume9"
  }];

  longitude: any;
  latitude: any;

  constructor(
    private storage: StorageService
  ) {
    addIcons({ peopleOutline, settingsOutline });
  }

  async ngOnInit() {
    this.username = await this.storage.get('username');
  }

  ngAfterViewInit(): void {
    // Adding a slight delay to ensure the DOM is fully loaded
    setTimeout(() => {
      this.initializeMap();
    }, 100); // Adjust this delay as needed
  }

  async initializeMap() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      this.longitude = coordinates.coords.longitude;
      this.latitude = coordinates.coords.latitude;

      this.map = L.map('map').setView([coordinates.coords.latitude, coordinates.coords.longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© Telcotec'
      }).addTo(this.map);

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
          const { latitude, longitude } = position.coords;
          this.updateMapPosition(latitude, longitude);
        }
      });
    } catch (error) {
      console.error('Error starting position tracking:', error);
    }
  }

  updateMapPosition(lat: number, lng: number) {
    this.map.setView([lat, lng], 13); // Update the map view
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
}
