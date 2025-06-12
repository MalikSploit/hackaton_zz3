import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  faBicycle,
  faCoins,
  faMapMarkerAlt,
  faPlayCircle,
  faStopCircle,
  faWalking
} from '@fortawesome/free-solid-svg-icons';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { EthersService } from '../wallet/ethers.service';

export enum TransportMode {
  WALK = 'walk',
  BIKE = 'bike',
}

export const TRANSPORT_CONFIG: Record<TransportMode, {
  label: string;
  icon: IconDefinition;
  color: string;
  speedLimit: number;
}> = {
  [TransportMode.WALK]: {
    label: 'À pied',
    icon: faWalking,
    color: 'green',
    speedLimit: 2.5,
  },
  [TransportMode.BIKE]: {
    label: 'À vélo',
    icon: faBicycle,
    color: 'blue',
    speedLimit: 8,
  },
};

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, OnDestroy {
  faMapMarker = faMapMarkerAlt;
  faCoins = faCoins;
  faPlayCircle = faPlayCircle;
  faStopCircle = faStopCircle;

  mode: TransportMode | null = null;
  transportModes = Object.values(TransportMode);
  TRANSPORT_CONFIG = TRANSPORT_CONFIG;
  TransportMode = TransportMode;

  map!: L.Map;
  currentPosition!: [number, number];
  destination!: [number, number];
  routingControl: any;

  tracking = false;
  totalDistance = 0;
  minedAmount = 0;
  watchId: number | null = null;

  estimatedDistance = 0;
  estimatedCrypto = 0;

  constructor(private ethersService: EthersService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    if (this.routingControl) this.map.removeControl(this.routingControl);
  }

  get currentConfig() {
    return this.mode ? this.TRANSPORT_CONFIG[this.mode] : this.TRANSPORT_CONFIG[TransportMode.WALK];
  }

  selectMode(mode: TransportMode): void {
    this.mode = mode;
    this.initMap();
  }

  initMap(): void {
    navigator.geolocation.getCurrentPosition((pos) => {
      this.currentPosition = [pos.coords.latitude, pos.coords.longitude];
      this.map = L.map('map').setView(this.currentPosition, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
      }).addTo(this.map);

      const startMarker = L.marker(this.currentPosition, {
        icon: L.icon({
          iconUrl: 'assets/marker.png',
          iconSize: [30, 40],
          iconAnchor: [15, 40],
        })
      }).addTo(this.map).bindPopup('<b>Point de départ</b>').openPopup();

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.destination = [e.latlng.lat, e.latlng.lng];
        this.drawRoute(this.currentPosition, this.destination);
      });
    });
  }

  drawRoute(from: [number, number], to: [number, number]) {
    if (this.routingControl) this.map.removeControl(this.routingControl);

    this.routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      lineOptions: {
        styles: [{ color: '#6366f1', weight: 6, opacity: 0.8 }],
      },
      autoRoute: true,
      showAlternatives: true,
      showDirections: true,
      routeWhileDragging: true,
      addWaypoints: true,
      show: true,
      createMarker: (i: number, wp: any) => {
        const iconUrl = 'assets/marker.png';
        const label = i === 0 ? 'Départ' : `Destination<br><small>${(this.estimatedDistance / 1000).toFixed(2)} km<br>${this.estimatedCrypto.toFixed(2)} ISIMA</small>`;
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
          })
        }).bindPopup(`<b>${label}</b>`);
      }
    }).addTo(this.map);

    this.estimatedDistance = this.computeDistance(from, to);
    this.estimatedCrypto = this.calculateCrypto(this.estimatedDistance);
  }

  async startTrip(): Promise<void> {
    this.tracking = true;
    this.totalDistance = 0;
    this.minedAmount = 0;
    let lastPosition = this.currentPosition;
    let lastTime = Date.now();

    this.watchId = navigator.geolocation.watchPosition(async (pos) => {
      const currentTime = Date.now();
      const current = [pos.coords.latitude, pos.coords.longitude] as [number, number];
      const dist = this.computeDistance(lastPosition, current);

      const timeElapsed = (currentTime - lastTime) / 1000; // secondes
      const speed = dist / timeElapsed; // m/s
      const speedLimit = this.currentConfig?.speedLimit ?? 100;

      if (speed > speedLimit) {
        console.warn(`Déplacement ignoré : vitesse ${speed.toFixed(2)} m/s > limite ${speedLimit} m/s`);
        return;
      }

      this.totalDistance += dist;
      const newMinedAmount = this.calculateCrypto(this.totalDistance);

      const minedDelta = newMinedAmount - this.minedAmount;
      if (minedDelta >= 0.01) {
        try {
          await this.ethersService.mintISIMA(BigInt(Math.floor(minedDelta * 1e18)));
          this.minedAmount = newMinedAmount;
        } catch (e: any) {
          console.error('Erreur lors du minage :', e.message);
        }
      }

      lastPosition = current;
      lastTime = currentTime;
    });
  }

  stopTrip(): void {
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    this.tracking = false;
    this.watchId = null;
  }

  computeDistance(p1: [number, number], p2: [number, number]): number {
    const R = 6371000;
    const dLat = this.toRad(p2[0] - p1[0]);
    const dLon = this.toRad(p2[1] - p1[1]);
    const lat1 = this.toRad(p1[0]);
    const lat2 = this.toRad(p2[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg: number): number {
    return deg * Math.PI / 180;
  }

  calculateCrypto(meters: number): number {
    return meters / 1000;
  }
}
