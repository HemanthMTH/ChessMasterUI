import { Component } from '@angular/core';
import { ChessGame } from 'src/app/models/chess-game';
import { ChessGameService } from '../../../services/chess-game.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  pgnFile: File | null = null;
  analysisResult: string = '';
  games: ChessGame[] = [];

  constructor(private chessGameService: ChessGameService) {}

  onFileSelected(event: any) {
    this.pgnFile = event.target.files[0];
  }

  uploadGameFile() {
    if (this.pgnFile) {
      this.chessGameService.uploadGameFile(this.pgnFile).subscribe((res) => {
        console.log('Game uploaded:', res);
        this.getAllGames(); // Refresh the list of games
      });
    }
  }

  getAllGames() {
    this.chessGameService.getAllGames().subscribe((res: ChessGame[]) => {
      this.games = res;
    });
  }

  analyzeGame(gameId: string) {
    this.chessGameService.analyzeGame(gameId).subscribe((res: any) => {
      this.analysisResult = res.BestMove;
    });
  }

  ngOnInit() {
    this.getAllGames(); // Load the list of games when the component is initialized
  }
}
