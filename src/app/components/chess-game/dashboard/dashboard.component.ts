import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChessGame } from 'src/app/models/chess-game';
import { ChessGameService } from '../../../services/chess-game.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  pgnFile: File | null = null;
  isLoading = false;
   // Store FEN for chessboard

  constructor(private chessGameService: ChessGameService, private router: Router) {}

  onFileSelected(event: any) {
    this.pgnFile = event.target.files[0];
  }

  uploadGameFile() {
    if (this.pgnFile) {
      this.isLoading = true;
      this.chessGameService.uploadGameFile(this.pgnFile).subscribe(
        (res: ChessGame) => {
          console.log('Game uploaded:', res);
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        (err) => {
          console.error('Upload failed:', err);
          this.isLoading = false;
        }
      );
    }
  }
}
