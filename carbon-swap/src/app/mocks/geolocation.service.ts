import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private path = [
    { latitude: 48.8584, longitude: 2.2945 },
    { latitude: 48.8590, longitude: 2.2950 },
    { latitude: 48.8595, longitude: 2.2955 },
    { latitude: 48.8600, longitude: 2.2960 },
    { latitude: 48.8605, longitude: 2.2965 },
  ];

  watchPosition(): Observable<GeolocationPosition> {
    return interval(3000).pipe(
      take(this.path.length),
      map(i => {
        return {
          coords: {
            latitude: this.path[i].latitude,
            longitude: this.path[i].longitude,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: 1.5,
          },
          timestamp: Date.now()
        } as GeolocationPosition;
      })
    );
  }
}
