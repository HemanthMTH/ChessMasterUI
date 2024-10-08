import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { Chess } from 'chess.js';
import { Chessground } from 'chessground';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss']
})
export class ChessBoardComponent implements AfterViewInit {
  @Input() fen: string = '';

  @ViewChild('board', { static: false }) boardElement!: ElementRef;
  private chess = new Chess();
  private chessground: any;

  ngAfterViewInit(): void {
    this.chessground = Chessground(this.boardElement.nativeElement, {
      draggable: {
        enabled: true,
        showGhost: true,
      },
      movable: {
        free: false,
        color: 'both',
        events: {
          after: this.onMove.bind(this),
        },
      },
      highlight: {
        lastMove: true,
        check: true,
      },
      fen: this.fen,
    });
  }

  onMove(from: string, to: string): void {
    const move = this.chess.move({ from, to, promotion: 'q' });

    if (move === null) {
      // Invalid move, revert
      this.chessground.set({ fen: this.chess.fen() });
    } else {
      // Valid move, update the board
      this.chessground.set({ fen: this.chess.fen() });
      // Handle additional logic, such as AI move or game over checks
    }
  }
}
