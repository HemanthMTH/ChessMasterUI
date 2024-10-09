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
  blackPlayer: Player = { isLichessUser: false }; 
  whitePlayer: Player = { isLichessUser: false }; 
  selectedMovePath: string | null = null; // Track selected move path for highlighting

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
      this.initializeChessBoard(); // Initialize the chessboard with the fetched PGN
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

    // Initialize Chessground for interactive moves
    this.viewer.setGround(
      Chessground(this.boardContainer.nativeElement, {
        draggable: { enabled: true, showGhost: true },
        movable: { free: true, color: 'both' },
        highlight: { lastMove: true, check: true },
      })
    );

    this.viewer.goTo('first');
    this.renderMoves(); // Render the list of moves after setting up the chessboard
    this.addMoveClickListeners();
  }

  // Handle move click and navigate the board to that move
  onMoveClicked(movePath: string) {
    if (movePath) {
      const path = new Path(movePath);
      this.viewer.toPath(path); // Navigate the viewer to the clicked move's position
      this.selectedMovePath = movePath; // Highlight the selected move
      this.cdr.detectChanges(); // Update the view
    }
  }
  

  // Render the list of moves and pair them as white and black moves
  renderMoves() {
    const moves: Array<[MoveData, MoveData?]> = [];
    let pair: [MoveData, MoveData?] | undefined = undefined;

    // Loop through the moves and group them as [whiteMove, blackMove]
    this.viewer.game.mainline.forEach((move: MoveData, index: number) => {
      if (index % 2 === 0) {
        pair = [move]; // White's move
      } else if (pair) {
        pair.push(move); // Black's move
        moves.push(pair); // Push the complete pair
        pair = undefined; // Reset for the next pair
      }
    });

    // Handle odd number of moves (if only White's move exists)
    if (pair) {
      moves.push([pair[0]]); // Only push the white move
    }

    // Assign moves to the component and trigger change detection
    this.moves = moves;
    this.cdr.detectChanges();
  }

  // Add click listeners to all move elements in the DOM
  addMoveClickListeners() {
    const moveElements =
      this.boardContainer.nativeElement.parentElement.querySelectorAll('.move');
    moveElements.forEach((moveElement: any) => {
      this.renderer.listen(moveElement, 'click', () => {
        const pathStr = moveElement.getAttribute('id').replace('move-', '');
        const path = new Path(pathStr);
        this.viewer.toPath(path);
        this.renderMoves(); // Re-render the moves and update the board position
      });
    });
  }

  // Navigate through the game using controls (First, Previous, Next, Last)
  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    this.renderMoves(); // Refresh move highlights and board position
  }
}
