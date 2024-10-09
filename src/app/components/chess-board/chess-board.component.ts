import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chessground } from 'chessground';
import { MoveData, Opts, Path, PgnViewer, Player } from 'pgn-viewer';
import { ChessGameService } from '../../services/chess-game.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements AfterViewInit {
  @ViewChild('boardContainer', { static: false }) boardContainer!: ElementRef;
  viewer!: PgnViewer;
  pgn: string | null = null; // Store PGN for the game
  moves: Array<[MoveData, MoveData?]> = [];
  blackPlayer: Player = {
    isLichessUser: false
  }; 
  whitePlayer: Player = {
    isLichessUser: false
  }; 
  selectedMovePath: string | null = null; // Track selected mov

  constructor(
    private route: ActivatedRoute,
    private chessGameService: ChessGameService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.route.params.subscribe((params) => {
      const gameId = params['id'];
      this.fetchGame(gameId); // Fetch PGN for the game using the ID
    });
  }

  fetchGame(gameId: string) {
    this.chessGameService.getGame(gameId).subscribe((game) => {
      this.pgn = game.pgn;
      // Process the PGN to extract moves and initialize the board
      this.initializeChessBoard();

      this.blackPlayer = this.viewer.game.players.black;
      this.whitePlayer = this.viewer.game.players.white;
    });
  }

  initializeChessBoard() {
    const opts: Opts = {
      pgn: this.pgn!,
      orientation: 'white',
      showPlayers: true,
      showMoves: 'right',
      showClocks: true,
      showControls: true,
      initialPly: 1,
      scrollToMove: true,
      drawArrows: true,
      lichess: false,
      classes: 'my-custom-class',
    };

    this.viewer = new PgnViewer(opts);

    // Initialize the viewer with Chessground
    this.viewer.setGround(
      Chessground(this.boardContainer.nativeElement, {
        draggable: {
          enabled: true,
          showGhost: true,
        },
        movable: {
          free: true,
          color: 'both',
        },
        highlight: {
          lastMove: true,
          check: true,
        },
      })
    );

    this.viewer.goTo('first');
    this.renderMoves(); // Render moves in the move list
    this.addMoveClickListeners();
  }

  onMoveClicked(movePath: string) {
    if (movePath) {
      const path = new Path(movePath);
      this.viewer.toPath(path); // Navigate the viewer to the clicked move's position
    }
  }

  renderMoves() {
    const moves: Array<[MoveData, MoveData?]> = [];
    let pair: [MoveData, MoveData?] | undefined = undefined;

    this.viewer.game.mainline.forEach((move: MoveData, index: number) => {
      if (index % 2 === 0) {
        pair = [move]; // White's move
      } else if (pair) {
        pair.push(move); // Black's move
        moves.push(pair); // Push the complete pair
        pair = undefined;
      }
    });

    // Handle odd number of moves
    if (pair) {
      moves.push([pair[0]]); // Push the last white move if there's no black move
    }

    // Assign to this.moves
    this.moves = moves;
    this.cdr.detectChanges(); // Update the DOM after changes
  }

  addMoveClickListeners() {
    const moveElements =
      this.boardContainer.nativeElement.parentElement.querySelectorAll('.move');
    moveElements.forEach((moveElement: any) => {
      this.renderer.listen(moveElement, 'click', () => {
        const pathStr = moveElement.getAttribute('id').replace('move-', '');
        const path = new Path(pathStr);
        this.viewer.toPath(path);
        this.renderMoves(); // Re-render the moves to update active move
      });
    });
  }

  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    this.renderMoves(); // Refresh move highlights
  }
}
