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
import { Key, MoveData, Opts, Path, PgnViewer, Player } from 'pgn-viewer';
import { debounceTime, fromEvent, of, switchMap } from 'rxjs';
import { AnalyzeRequest } from 'src/app/models/analyze-request';
import { ChessGame } from 'src/app/models/chess-game';
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
  result: string | null | undefined;
  gameFormat!: string;
  timeControlInitial!: number | undefined;
  timeControlIncrement!: number | undefined;
  timeControl!: string;
  termination!: string;
  chessground!: ReturnType<typeof Chessground>;
  bestMove!: string;
  game!: ChessGame;

  constructor(
    private route: ActivatedRoute,
    private chessGameService: ChessGameService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.route.params.subscribe((params) => {
      const gameId = params['id'];
      this.fetchGame(gameId);
    });

    this.addKeyboardListeners();
  }

  async fetchGame(gameId: string) {
    const game = await this.chessGameService.getGame(gameId).toPromise();
    if (game){
      this.game = game;
      this.pgn = game.pgn
    }
    else{
      console.error('Unable to get the game');
    }
    this.initializeChessBoard(); // Initialize the chessboard with the fetched PGN
    this.blackPlayer = this.viewer.game.players.black;
    this.whitePlayer = this.viewer.game.players.white;
    this.result = this.viewer.game.metadata.result;

    if (this.viewer.game.metadata.timeControl) {
      this.timeControlInitial = this.viewer.game.metadata.timeControl.initial
        ? this.viewer.game.metadata.timeControl.initial / 60
        : undefined;
      this.timeControlIncrement = this.viewer.game.metadata.timeControl.increment
        ? this.viewer.game.metadata.timeControl.increment
        : undefined;
    }
    this.timeControl = `${this.timeControlInitial || 'N/A'} + ${
      this.timeControlIncrement || '0'
    }`;

    // Fetch and display the best move
    const currentFen = this.getCurrentFEN(this.viewer);
    this.bestMove = await this.getBestMove(currentFen);
    this.drawBestMoveArrow(this.bestMove); // Draw the arrow for the best move
  }

  initializeChessBoard() {
    const opts: Opts = {
      pgn: this.pgn!,
    };

    this.viewer = new PgnViewer(opts);

    const legalDestinations = new Map<Key, Key[]>();

    this.chessground = Chessground(this.boardContainer.nativeElement, {
      viewOnly: false,
      draggable: { enabled: true, showGhost: true },
      movable: {
        color: 'both',
        free: false,
        showDests: true,
        dests: legalDestinations, // Define legal moves here
        rookCastle: true,
        events: {
          after: (orig: Key, dest: Key) => this.onMove(orig, dest),
        },
      },
      highlight: { lastMove: true, check: true },
      animation: { enabled: true, duration: 200 },
    });

    this.viewer.setGround(this.chessground);
    this.viewer.goTo('last');
    this.renderMoves();
    this.addMoveClickListeners();
  }

  async onMove(orig: Key, dest: Key) {
    const uci = `${orig}${dest}`;
    const move = this.viewer.game.mainline.find((m) => m.uci === uci);

    if (move) {
      // Move found in the PGN, update the board and viewer
      this.viewer.toPath(new Path(move.path.path)); // Update PGN viewer path
      this.viewer.ground?.move(orig, dest); // Update chessboard
      this.renderMoves(); // Refresh the move list

      // Get and display the best move after this move
      const currentFen = this.getCurrentFEN(this.viewer);
      this.bestMove = await this.getBestMove(currentFen);
      this.drawBestMoveArrow(this.bestMove); // Draw arrow for the new best move
    } else {
      console.error('Invalid move');
    }
  }

  // Method to draw arrows for the best move
  drawBestMoveArrow(bestMove: string) {
    if (bestMove) {
      const from = bestMove.slice(0, 2) as Key; // Starting square of best move
      const to = bestMove.slice(2, 4) as Key;   // Destination square of best move

      // Set an arrow on the board using Chessground's setShapes method
      this.chessground.setShapes([
        { orig: from, dest: to, brush: 'green' }, // Drawing a green arrow for the best move
      ]);
    }
  }

  // Handle move click and navigate the board to that move
  onMoveClicked(movePath: string) {
    if (movePath) {
      const path = new Path(movePath);
      this.getBestMove(this.getCurrentFEN(this.viewer)).then(bestMove => {
        this.bestMove = bestMove;
        this.drawBestMoveArrow(bestMove);
      });
      this.viewer.toPath(path); // Navigate the viewer to the clicked move's position
      this.selectedMovePath = movePath; // Highlight the selected move
      this.cdr.detectChanges(); // Update the view
    }
  }

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

    this.moves = moves;
    this.cdr.detectChanges();
  }

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

  // Keyboard navigation for next and previous moves
  addKeyboardListeners() {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        this.goTo('next'); // Navigate to the next move
      } else if (event.key === 'ArrowLeft') {
        this.goTo('prev'); // Navigate to the previous move
      }
    });
  }

  // Navigate through the game using controls (First, Previous, Next, Last)
  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    const fen = this.getCurrentFEN(this.viewer);
    this.getBestMove(fen).then(bestMove => {
      this.bestMove = bestMove;
      this.drawBestMoveArrow(bestMove);
    });
  }

  getCurrentFEN(view: PgnViewer): string {
    const currentData = view.curData();
    return currentData.fen;
  }

  async getBestMove(currentFen: string): Promise<string> {
    try {
      const analyzeRequest = new AnalyzeRequest(this.game.id, currentFen)
      const response = await this.chessGameService.analyzePosition(analyzeRequest).toPromise();
      console.log(response?.bestMove, response?.currentFen)
      return response?.bestMove || 'No Best Move Found';
    } catch (error) {
      console.error('Error fetching the best move:', error);
      return 'Error retrieving best move';
    }
  }
}
