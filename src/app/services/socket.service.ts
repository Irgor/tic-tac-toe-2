import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(private socket: Socket) { }

  moveService = new Subject<any>();

  listenMoves() {
    this.moveService.subscribe(moved => {
      this.sendMove(moved);
    });
  }

  sendMove(playerMove: string) {
    this.socket.emit('moveType', playerMove);
  }

  getMoves() {
    return this.socket.fromEvent('moved');
  }

  getPlayer() {
    return this.socket.fromEvent<string>('setPlayerRole');
  }

  shareGameOnBoard(game: { i: number, j: number, all: boolean, lastPlayer: string }) {
    this.socket.emit('setGameOnBoard', game);
  }

  getGameOnBoard() {
    return this.socket.fromEvent<{ i: number, j: number, all: boolean, lastPlayer: string }>('sendingGameOnBoard');
  }

  markMove(move: { i: number, j: number, mi: number, mj: number, player: string }) {
    this.socket.emit('playerMarkMove', move);
  }

  getMoveMarked() {
    return this.socket.fromEvent<{ i: number, j: number, mi: number, mj: number, player: string }>('sendingMarkedMove');
  }

}
