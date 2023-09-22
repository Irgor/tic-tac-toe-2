import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MovesControllService } from 'src/app/services/moves-controll.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  fieldMap = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]

  controllField = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]

  endedGames: any = [];

  endedGamesSub?: Subscription;
  moveSub?: Subscription;

  player = 'X';

  constructor(
    private moveControll: MovesControllService,
    private socket: SocketService
  ) {
    this.moveControll.endedGames.next([]);
    this.socket.listenMoves();
  }

  ngOnInit(): void {
    this.endedGamesSub = this.moveControll.endedGames.subscribe({
      next: games => {
        this.endedGames = games;
        for (let game of games) {
          this.controllField[game.i][game.j] = game.winner;
        }
        this.checkDraw();
        this.checkWin();
      }
    });

    this.moveSub = this.moveControll.gameToMove.subscribe({
      next: game => {
        this.socket.shareGameOnBoard({ i: game.i, j: game.j, all: game.all, lastPlayer: game.mover });
      }
    })

    this.socket.getPlayer().subscribe(player => {
      this.player = player
    })
  }

  checkDraw() {
    if (this.endedGames.length == 9) {
      this.endGame('DEU VELHA VELHA')
    }
  }

  checkWin() {
    for (let i of this.controllField) {
      this.getRow(i);
    }

    for (let i = 0; i < this.controllField.length; i++) {
      let line = [this.controllField[0][i], this.controllField[1][i], this.controllField[2][i]];
      this.getRow(line);
    }

    let leftDiag = [this.controllField[0][0], this.controllField[1][1], this.controllField[2][2]];
    this.getRow(leftDiag);

    let rightDiag = [this.controllField[2][0], this.controllField[1][1], this.controllField[0][2]];
    this.getRow(rightDiag);
  }


  getRow(row: string[]) {
    const line = row[0] + row[1] + row[2];
    let winner = Array.from(new Set(line.split('')));
    let win = winner.length == 1 && line.length == 3;

    if (win) {
      this.endGame('O VENCEDOR É ' + winner);
    }
  }

  endGame(message: string) {
    this.ngOnDestroy();
    alert(message)
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.endedGamesSub?.unsubscribe();
    this.moveSub?.unsubscribe();
  }

}
