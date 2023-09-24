import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MatchService } from '../match/match.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(
    private socket: Socket,
    private match: MatchService
  ) { }

  moveService = new Subject<any>();

  listenMoves() {
    this.moveService.subscribe(moved => {
      this.sendMove(moved);
    });
  }

  sendMove(playerMove: string) {
    const data = this.createHeader(playerMove)
    console.log(data);
    this.socket.emit('moveType', data);
  }
  getPlayer() {
    return this.socket.fromEvent<{ id: string, data: string }>('setPlayerRole')
      .pipe(filter(res => res.id == this.match.matchId));
  }


  shareGameOnBoard(game: { i: number, j: number, all: boolean, lastPlayer: string }) {
    const data = this.createHeader(game);
    this.socket.emit('setGameOnBoard', data);
  }
  getGameOnBoard() {
    return this.socket.fromEvent<{ id: string, data: { i: number, j: number, all: boolean, lastPlayer: string } }>('sendingGameOnBoard')
      .pipe(filter(res => res.id == this.match.matchId));
  }


  markMove(move: { i: number, j: number, mi: number, mj: number, player: string }) {
    const data = this.createHeader(move);
    this.socket.emit('playerMarkMove', data);
  }
  getMoveMarked() {
    return this.socket.fromEvent<{ id: string, data: { i: number, j: number, mi: number, mj: number, player: string } }>('sendingMarkedMove')
      .pipe(filter(res => res.id == this.match.matchId));
  }


  createHeader(data: any) {
    return { data, id: this.match.matchId }
  }

}
