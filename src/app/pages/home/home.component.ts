import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from 'src/app/services/match/match.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(
    private match: MatchService,
    private router: Router
  ) { }

  matchToJoin = '';

  joinMatch() {
    this.match.matchId = this.matchToJoin;
    this.router.navigate(['game/' + this.matchToJoin]);
  }


}
