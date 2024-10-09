import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChessGame } from '../../../models/chess-game';
import { ChessGameService } from '../../../services/chess-game.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss'],
})
export class GameListComponent implements OnInit {
  games: ChessGame[] = [];

  constructor(private chessGameService: ChessGameService, private router: Router) {}

  ngOnInit(): void {
    this.fetchGames();
  }

  fetchGames(): void {
    this.chessGameService.getAllGames().subscribe((data: ChessGame[]) => {
      this.games = data;
    });
  }

  viewGame(gameId: string): void {
    this.router.navigate([`/game/${gameId}`]);  // Navigate to the chessboard route using game ID
  }
}
