import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class MovesControllService {

  constructor() { }

  gameToMove = new Subject<{ i: number, j: number, mover: string, all: boolean }>();
  endedGames = new Subject<{i: number, j: number, winner: string}[]>();
}
