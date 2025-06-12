import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  faBicycle,
  faCoins,
  faMapMarkerAlt,
  faPlayCircle,
  faStopCircle,
  faWalking,
  faRedoAlt, faRoad,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as L from 'leaflet';
(window as any).L = L;
import 'leaflet-routing-machine';

export enum TransportMode {
  WALK = 'walk',
  BIKE = 'bike',
}

export const TRANSPORT_CONFIG: Record<
  TransportMode,
  { label: string; icon: IconDefinition; color: string; speedLimit: number }
> = {
  [TransportMode.WALK]: {
    label: 'À pied',
    icon: faWalking,
    color: 'green',
    speedLimit: 1.8,
  },
  [TransportMode.BIKE]: {
    label: 'À vélo',
    icon: faBicycle,
    color: 'blue',
    speedLimit: 10,
  },
};

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css'],
})
export class MapsComponent implements OnInit, OnDestroy {
  faMapMarker  = faMapMarkerAlt;
  faCoins      = faCoins;
  faPlayCircle = faPlayCircle;
  faStopCircle = faStopCircle;
  faRedo       = faRedoAlt;

  mode: TransportMode | null = null;
  transportModes: TransportMode[] = Object.values(TransportMode);
  TRANSPORT_CONFIG = TRANSPORT_CONFIG;
  TransportMode = TransportMode;

  map!: L.Map;
  routingControl: any;
  startPoint: [number, number] | null = null;
  destination: [number, number] | null = null;
  routeCoords: L.LatLng[] = [];

  estimatedDistance = 0;  // en mètres

  positionMarker: L.Marker | null = null;
  pathPolyline:  L.Polyline | null = null;
  pathLatLngs:   L.LatLng[] = [];

  speed = 4;               // km/h
  simInterval: any = null;
  private simIndex = 0;
  private segRemaining = 0;

  totalDistance = 0;       // mètres
  minedAmount   = 0;       // ISIMA

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopSimulation();
    this.routingControl && this.map.removeControl(this.routingControl);
    this.map.remove();
  }

  get currentConfig() {
    return this.mode
      ? this.TRANSPORT_CONFIG[this.mode]
      : this.TRANSPORT_CONFIG[TransportMode.WALK];
  }

  get isSimulating() {
    return this.simInterval != null;
  }

  selectMode(mode: TransportMode): void {
    this.mode = mode;
    setTimeout(() => this.initMap(), 0);
  }

  private initMap(): void {
    this.map = L.map('map').setView([46.6, 2.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (!this.startPoint) {
        this.setStart([lat, lng]);
      } else if (!this.destination) {
        this.setDestination([lat, lng]);
        this.drawRoute();
      } else {
        this.resetAll();
        this.setStart([lat, lng]);
      }
    });
  }

  private setStart(pt: [number, number]) {
    this.startPoint = pt;
    this.positionMarker && this.map.removeLayer(this.positionMarker);
    this.positionMarker = L.marker(pt, {
      icon: L.icon({
        iconUrl: 'assets/marker-start.png',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
      }),
    })
      .addTo(this.map)
      .bindPopup('Départ')
      .openPopup();
  }

  private setDestination(pt: [number, number]) {
    this.destination = pt;
    L.marker(pt, {
      icon: L.icon({
        iconUrl: 'assets/marker.png',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
      }),
    })
      .addTo(this.map)
      .bindPopup('Destination')
      .openPopup();
  }

  private drawRoute() {
    if (!this.startPoint || !this.destination) return;
    this.routingControl && this.map.removeControl(this.routingControl);

    this.routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(...this.startPoint),
        L.latLng(...this.destination),
      ],
      lineOptions: { styles: [{ color: '#6366f1', weight: 6, opacity: 0.8 }] },
      addWaypoints: false,
      show: false,
    })
      .addTo(this.map)
      .on('routesfound', (e: any) => {
        this.routeCoords = e.routes[0].coordinates;
        this.estimatedDistance = e.routes[0].summary.totalDistance;
      });
  }

  startSimulation(): void {
    if (!this.startPoint || !this.destination || this.routeCoords.length === 0) {
      alert('Posez d’abord un départ puis une destination.');
      return;
    }
    this.stopSimulation();

    this.totalDistance = 0;
    this.minedAmount   = 0;
    this.simIndex      = 0;
    this.segRemaining  = 0;

    this.pathLatLngs = [L.latLng(...this.startPoint)];
    this.pathPolyline && this.map.removeLayer(this.pathPolyline);
    this.pathPolyline = L.polyline(this.pathLatLngs, {
      color: this.currentConfig.color,
      weight: 5,
      opacity: 0.7,
    }).addTo(this.map);

    this.positionMarker!.setLatLng(this.startPoint);

    const tick = 1000;
    this.simInterval = setInterval(() => {
      const speedMs = this.speed / 3.6;
      if (speedMs > this.currentConfig.speedLimit) return;

      if (this.simIndex >= this.routeCoords.length - 1) {
        this.stopSimulation();
        return;
      }

      const cur = this.routeCoords[this.simIndex];
      const nxt = this.routeCoords[this.simIndex + 1];
      const segDist = this.computeDistance(
        [cur.lat, cur.lng],
        [nxt.lat, nxt.lng]
      );
      if (this.segRemaining === 0) this.segRemaining = segDist;

      const step = speedMs * (tick / 1000);
      const ratio = Math.min(step / this.segRemaining, 1);

      const newLat = cur.lat + (nxt.lat - cur.lat) * ratio;
      const newLng = cur.lng + (nxt.lng - cur.lng) * ratio;

      this.segRemaining -= step;
      if (this.segRemaining <= 0) {
        this.simIndex++;
        this.segRemaining = 0;
      }

      const newPos: [number, number] = [newLat, newLng];
      this.positionMarker!.setLatLng(newPos);
      this.updatePath(newPos);

      this.totalDistance += step;
      this.minedAmount   = this.calculateCrypto(this.totalDistance);
    }, tick);
  }

  stopSimulation(): void {
    this.simInterval && clearInterval(this.simInterval);
    this.simInterval = null;
  }

  newTrip(): void {
    this.resetAll();
  }

  private resetAll() {
    this.stopSimulation();
    this.startPoint      = null;
    this.destination     = null;
    this.routeCoords     = [];
    this.estimatedDistance = 0;
    this.totalDistance   = 0;
    this.minedAmount     = 0;

    this.positionMarker && this.map.removeLayer(this.positionMarker);
    this.pathPolyline   && this.map.removeLayer(this.pathPolyline);
    this.routingControl && this.map.removeControl(this.routingControl);

    this.positionMarker = null;
    this.pathPolyline   = null;
  }

  private updatePath(pos: [number, number]) {
    this.pathLatLngs.push(L.latLng(...pos));
    this.pathPolyline!.setLatLngs(this.pathLatLngs);
  }

  private computeDistance(p1: [number, number], p2: [number, number]): number {
    const R = 6371000;
    const dLat = this.toRad(p2[0] - p1[0]);
    const dLon = this.toRad(p2[1] - p1[1]);
    const lat1 = this.toRad(p1[0]);
    const lat2 = this.toRad(p2[0]);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private calculateCrypto(meters: number): number {
    return meters / 1000;
  }

  protected readonly faRoad = faRoad;
}
