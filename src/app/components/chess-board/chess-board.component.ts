import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chessground } from 'chessground';
import { Opts, Path, PgnViewer } from 'pgn-viewer';
import { ChessGameService } from '../../services/chess-game.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements AfterViewInit {
  @ViewChild('boardContainer', { static: false }) boardContainer!: ElementRef;
  viewer!: PgnViewer;
  pgn: string | null = null;  // Store PGN for the game
  moves: any[] = []; // Array to store the moves for rendering in move list
  blackPlayer: any = {};  // Player information for Black
  whitePlayer: any = {};  // Player information for White
  blackClock: string = ''; // Black's clock time
  whiteClock: string = ''; // White's clock time
  isBlackActive: boolean = false;  // Flag to indicate if Black's clock is active
  isWhiteActive: boolean = false;  // Flag to indicate if White's clock is active

  constructor(
    private route: ActivatedRoute,
    private chessGameService: ChessGameService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {
      const gameId = params['id'];
      this.fetchGame(gameId);  // Fetch PGN for the game using the ID
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
    this.renderMoves();  // Render moves in the move list
    this.addMoveClickListeners();
  }

  renderMoves() {
    const moves = [];
    let pair:any = [];
    this.viewer.game.mainline.forEach((move: any, index: number) => {
      if (index % 2 === 0) {
        pair = [move]; // First, add White's move
      } else {
        pair.push(move); // Then, add Black's move
        moves.push(pair);
      }
    });
  
    // Handle case for odd number of moves
    if (pair.length === 1) {
      moves.push(pair);
    }
  
    this.moves = moves;
    this.cdr.detectChanges(); // Update the DOM after changes
  }
  

  addMoveClickListeners() {
    const moveElements = this.boardContainer.nativeElement.parentElement.querySelectorAll('.move');
    moveElements.forEach((moveElement: any) => {
      this.renderer.listen(moveElement, 'click', () => {
        const pathStr = moveElement.getAttribute('id').replace('move-', '');
        const path = new Path(pathStr);
        this.viewer.toPath(path);
        this.renderMoves();  // Re-render the moves to update active move
      });
    });
  }

  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    this.renderMoves();  // Refresh move highlights
  }
}

