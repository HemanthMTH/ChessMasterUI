import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { Chessground } from 'chessground';
import { Opts, Path, PgnViewer } from 'pgn-viewer';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements AfterViewInit {
  @Input() pgn!: string;

  @ViewChild('boardContainer', { static: false }) boardContainer!: ElementRef;
  viewer!: PgnViewer;
  renderedMoves: string = '';

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const opts: Opts = {
      pgn: this.pgn,
      orientation: 'white',
      showPlayers: true,
      showMoves: 'right',
      showClocks: false,
      showControls: true,
      initialPly: 1,
      scrollToMove: true,
      drawArrows: true,
      lichess: false,
      classes: 'my-custom-class',
      translate: (key: string) => {
        const translations: { [key: string]: string } = {
          first: 'First',
          prev: 'Previous',
          next: 'Next',
          last: 'Last',
        };
        return translations[key] || key;
      },
    };

    this.viewer = new PgnViewer(opts);

    // Initialize the viewer
    this.viewer.setGround(
      Chessground(this.boardContainer.nativeElement, {
        draggable: {
          enabled: true,
          showGhost: true,
        },
        movable: {
          free: false,
          color: 'both',
        },
        highlight: {
          lastMove: true,
          check: true,
        },
      })
    );

    this.viewer.goTo('first');

    // Render the moves and set up event listeners
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

    // Trigger change detection
    this.cdr.detectChanges();
  }

  addMoveClickListeners() {
    const moves = this.boardContainer.nativeElement.parentElement.querySelectorAll('.move');
    moves.forEach((moveElement: any) => {
      this.renderer.listen(moveElement, 'click', (event) => {
        const pathStr = moveElement.getAttribute('id').replace('move-', '');
        const path = new Path(pathStr);
        this.viewer.toPath(path);
        this.renderMoves(); // Refresh move highlights
      });
    });
  }

  goTo(position: 'first' | 'prev' | 'next' | 'last') {
    this.viewer.goTo(position);
    this.renderMoves(); // Refresh move highlights
  }
}
