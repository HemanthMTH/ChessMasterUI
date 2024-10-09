import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MoveData } from 'pgn-viewer';

@Component({
  selector: 'app-move-list',
  templateUrl: './move-list.component.html',
  styleUrls: ['./move-list.component.scss'],
})
export class MoveListComponent implements OnChanges {
  @Input() moves: Array<[MoveData, MoveData?]> = [];
  @Output() moveClicked = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Moves received:', this.moves);
  }

  onMoveClick(movePath: string) {
    if (movePath) {
      this.moveClicked.emit(movePath);
    }
  }
}
