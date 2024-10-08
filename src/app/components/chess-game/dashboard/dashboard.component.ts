import { Component } from '@angular/core';
import { ChessGame } from 'src/app/models/chess-game';
import { ChessGameService } from '../../../services/chess-game.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  pgnFile: File | null = null;
  isLoading = false;
  fenForChessBoard: string | null = null;  // Store FEN for chessboard

  constructor(private chessGameService: ChessGameService) {}

  onFileSelected(event: any) {
    this.pgnFile = event.target.files[0];
  }

  uploadGameFile() {
    if (this.pgnFile) {
      this.isLoading = true;
      this.chessGameService.uploadGameFile(this.pgnFile).subscribe(
        (res: ChessGame) => {
          console.log('Game uploaded:', res);
          this.fenForChessBoard = res.fen; // Set PGN for child component
          this.isLoading = false;
        },
        (err) => {
          console.error('Upload failed:', err);
          this.isLoading = false;
        }
      );
    }
  }
}
