import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core'
import { MovesControllService } from 'src/app/services/moves/moves-controll.service';
import { Subscription } from 'rxjs'
import { SocketService } from 'src/app/services/socket/socket.service';
@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent implements OnInit {

  @Input() i!: number;
  @Input() j!: number;
  @Input() player!: string;

  movesSub?: Subscription;
  endedsSub?: Subscription;
  endedGames: { i: number, j: number, winner: string }[] = [];

  constructor(
    private movesControll: MovesControllService,
    private socket: SocketService,
  ) { }

  fieldMap = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]

  playable = true;
  win = false;
  winner = '';
  marks = 0;

  ngOnInit(): void {
    this.endedsSub = this.movesControll.endedGames.subscribe({
      next: (games) => {
        this.endedGames = games;
      }
    })

    this.movesSub = this.movesControll.gameToMove.subscribe({
      next: move => {
        this.checkPlayable(move);
      }
    })

    this.socket.getGameOnBoard().subscribe(header => {
      const move = header.data;
      this.checkPlayable(move);
    });

    this.socket.getMoveMarked().subscribe(header => {
      const move = header.data;
      if (this.i == move.i && this.j == move.j) {
        this.fieldMap[move.mi][move.mj] = move.player;
      }
      this.checkWin();
      this.checkDraw();
    })
  }

  checkPlayable(move: any) {
    if (move.all && !this.win && move.mover != this.player) {
      console.log(move);
      this.playable = true;
      return;
    }

    if (move.lastPlayer == this.player || move.mover == this.player) {
      this.playable = false;
      return;
    }

    this.playable = this.i == move.i && this.j == move.j;
    this.checkDraw();
    this.checkWin();
  }

  mark(i: number, j: number) {
    if (this.win || this.playable == false) {
      return;
    }

    this.socket.moveService.next(this.player);
    this.socket.markMove({
      i: this.i,
      j: this.j,
      mi: i,
      mj: j,
      player: this.player
    });

    this.fieldMap[i][j] = this.player;
    this.checkWin();
    this.checkDraw();
    this.setNext(i, j);
  }


  setNext(i: number, j: number) {
    const isTargetEnded = !!this.endedGames.filter(game => game.i == i && game.j == j).length;

    if (isTargetEnded) {
      this.movesControll.gameToMove.next({ i: this.i, j: this.j, mover: this.player, all: this.win });
      return;
    }

    this.movesControll.gameToMove.next({ i, j, mover: this.player, all: false });
  }

  checkDraw() {
    const marks = this.fieldMap.flat().join('').trim().length;
    if (marks == 9 && this.win == false) {
      this.setWin('/');
    }
  }

  checkWin() {
    for (let i of this.fieldMap) {
      this.getRow(i);
    }

    for (let i = 0; i < this.fieldMap.length; i++) {
      let line = [this.fieldMap[0][i], this.fieldMap[1][i], this.fieldMap[2][i]];
      this.getRow(line);
    }

    let leftDiag = [this.fieldMap[0][0], this.fieldMap[1][1], this.fieldMap[2][2]];
    this.getRow(leftDiag);

    let rightDiag = [this.fieldMap[2][0], this.fieldMap[1][1], this.fieldMap[0][2]];
    this.getRow(rightDiag);
  }


  getRow(row: string[]) {
    const line = row[0] + row[1] + row[2];
    let winner = Array.from(new Set(line.split('')));
    let win = winner.length == 1 && line.length == 3;

    if (win) {
      this.setWin(line[0]);
    }
  }

  setWin(winner: string) {
    this.win = true;
    this.winner = winner;
    this.playable = false;

    this.endedGames.push({ i: this.i, j: this.j, winner: winner });
    this.movesControll.endedGames.next(this.endedGames);

    this.movesSub?.unsubscribe();
    this.endedsSub?.unsubscribe();
  }

}
