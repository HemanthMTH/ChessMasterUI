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
  renderedMoves: string = '';
  pgn: string | null = null;  // Store PGN for the game

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
      this.initializeChessBoard();  // Initialize the board once PGN is fetched
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
    this.renderMoves();
    this.addMoveClickListeners();
  }

  renderMoves() {
    const moveDom = (move: any) => {
      const isActive = move.path.path === this.viewer.path.path ? 'active' : '';
      return `<span data-ply="${move.ply}" id="move-${move.path.path}" class="move ${isActive}">${move.san}</span>`;
    };

    this.renderedMoves = this.viewer.game.mainline
      .map((move: any) => moveDom(move))
      .join(' ');

    this.cdr.detectChanges();  // Trigger change detection
  }

  addMoveClickListeners() {
    const moves = this.boardContainer.nativeElement.parentElement.querySelectorAll('.move');
    moves.forEach((moveElement: any) => {
      this.renderer.listen(moveElement, 'click', () => {
        const pathStr = moveElement.getAttribute('id').replace('move-', '');
        const path = new Path(pathStr);
        this.viewer.toPath(path);
        this.renderMoves();  // Refresh move highlights
      });
    });
  }

  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    this.renderMoves();  // Refresh move highlights
  }
}
