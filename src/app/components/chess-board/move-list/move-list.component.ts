import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MoveData } from 'pgn-viewer';

@Component({
  selector: 'app-move-list',
  templateUrl: './move-list.component.html',
  styleUrls: ['./move-list.component.scss'],
})
export class MoveListComponent {
  @Input() moves: Array<[MoveData, MoveData?]> = [];
  @Input() selectedMovePath: string | null = null; // To track the highlighted move
  @Output() moveClicked: EventEmitter<string> = new EventEmitter<string>();

  onMoveClick(path: string | undefined) {
    if (path) {
      this.moveClicked.emit(path); // Emit the selected move's path to the parent
    }
  }
}
