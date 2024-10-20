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
import { AnalyzeRequest } from 'src/app/models/analyze-request';
import { ChessGame, ChessGameParser } from 'src/app/models/chess-game';
import { AuthService } from 'src/app/services/auth.service';
import { ChessGameService } from '../../services/chess-game.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements AfterViewInit {
  @ViewChild('boardContainer', { static: false }) boardContainer!: ElementRef;
  viewer!: PgnViewer;
  pgn: string | null = null;
  famousGamePGN: string = `[Event "18th DSB Kongress"]
                          [Site "Breslau GER"]
                          [Date "1912.07.20"]
                          [EventDate "1912.07.15"]
                          [Round "6"]
                          [Result "0-1"]
                          [White "Stefan Levitsky"]
                          [Black "Frank James Marshall"]
                          [ECO "B23"]
                          [WhiteElo "?"]
                          [BlackElo "?"]
                          [PlyCount "46"]

                          1.d4 e6 2.e4 d5 3.Nc3 c5 4.Nf3 Nc6 5.exd5 exd5 6.Be2 Nf6 7.O-O
                          Be7 8.Bg5 O-O 9.dxc5 Be6 10.Nd4 Bxc5 11.Nxe6 fxe6 12.Bg4 Qd6
                          13.Bh3 Rae8 14.Qd2 Bb4 15.Bxf6 Rxf6 16.Rad1 Qc5 17.Qe2 Bxc3
                          18.bxc3 Qxc3 19.Rxd5 Nd4 20.Qh5 Ref8 21.Re5 Rh6 22.Qg5 Rxh3
                          23.Rc5 Qg3 0-1'`;
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
  gameDate!: Date;
  chessground!: ReturnType<typeof Chessground>;
  bestMove!: string;
  game!: ChessGame;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private chessGameService: ChessGameService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    this.route.params.subscribe((params) => {
      const gameId = params['id'];

      this.fetchGame(gameId).then(() => {
        this.cdr.detectChanges();
      });
    });

    this.checkAuthentication();

    this.addKeyboardListeners();
  }

  checkAuthentication(): void {
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.cdr.detectChanges();
    });
  }

  async fetchGame(gameId: string) {
    const storedPgn = localStorage.getItem('demoPGN');
    if (storedPgn) {
      this.pgn = storedPgn;
      this.game = ChessGameParser.parsePgnMetadata(storedPgn, 'GUEST');
      if (this.game.gameDate) {
        this.gameDate = this.game.gameDate;
      }
    } else {
      const game = await this.chessGameService.getGame(gameId).toPromise();
      if (game) {
        this.game = game;
        this.pgn = game.pgn;
      } else {
        console.error('Unable to get the game');
      }
    }

    this.initializeChessBoard();
    this.blackPlayer = this.viewer.game.players.black;
    this.whitePlayer = this.viewer.game.players.white;
    this.result = this.viewer.game.metadata.result;

    if (this.viewer.game.metadata.timeControl) {
      this.timeControlInitial = this.viewer.game.metadata.timeControl.initial
        ? this.viewer.game.metadata.timeControl.initial / 60
        : undefined;
      this.timeControlIncrement = this.viewer.game.metadata.timeControl
        .increment
        ? this.viewer.game.metadata.timeControl.increment
        : undefined;
    }
    this.timeControl = `${this.timeControlInitial || 'N/A'} + ${
      this.timeControlIncrement || '0'
    }`;

    // Fetch and display the best move
    const currentFen = this.getCurrentFEN(this.viewer);
    this.bestMove = await this.getBestMove(currentFen);
    this.drawBestMoveArrow(this.bestMove);
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
    this.checkAuthentication();
    if (this.isAuthenticated) {
      this.viewer.goTo('last');
    } else {
      this.viewer.goTo('first');
    }

    this.renderMoves();
    this.addMoveClickListeners();
  }

  async onMove(orig: Key, dest: Key) {
    const uci = `${orig}${dest}`;
    const move = this.viewer.game.mainline.find((m) => m.uci === uci);

    if (move) {
      // Move found in the PGN, update the board and viewer
      this.viewer.toPath(new Path(move.path.path));
      this.viewer.ground?.move(orig, dest);
      this.renderMoves();

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
      const to = bestMove.slice(2, 4) as Key; // Destination square of best move

      // Set an arrow on the board using Chessground's setShapes method
      this.chessground.setShapes([{ orig: from, dest: to, brush: 'green' }]);
    }
  }

  // Handle move click and navigate the board to that move
  onMoveClicked(movePath: string) {
    if (movePath) {
      const path = new Path(movePath);
      this.getBestMove(this.getCurrentFEN(this.viewer)).then((bestMove) => {
        this.bestMove = bestMove;
        this.drawBestMoveArrow(bestMove);
      });
      this.viewer.toPath(path); // Navigate the viewer to the clicked move's position
      this.selectedMovePath = movePath;
      this.cdr.detectChanges();
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
        this.goTo('next');
      } else if (event.key === 'ArrowLeft') {
        this.goTo('prev');
      }
    });
  }

  // Navigate through the game using controls (First, Previous, Next, Last)
  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    const fen = this.getCurrentFEN(this.viewer);

    this.getBestMove(fen).then((bestMove) => {
      this.bestMove = bestMove;
      this.drawBestMoveArrow(bestMove);
    });
  }

  getCurrentFEN(view: PgnViewer): string {
    const currentData = view.curData();
    return currentData.fen;
  }

  async getBestMove(currentFen: string): Promise<string> {
    if (this.isAuthenticated) {
      try {
        const analyzeRequest = new AnalyzeRequest(this.game.id, currentFen);
        const response = await this.chessGameService
          .analyzePosition(analyzeRequest)
          .toPromise();

        return response?.bestMove || 'No Best Move Found';
      } catch (error) {
        console.error('Error fetching the best move:', error);
        return 'Error retrieving best move';
      }
    }
    // Return a default message if not authenticated
    return 'Authentication required to get the best move';
  }
}
