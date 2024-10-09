import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-move-list',
  templateUrl: './move-list.component.html',
  styleUrls: ['./move-list.component.scss']
})
export class MoveListComponent {

  @Input() moves: any[] = [];

  goToMove(path: string) {
    // Navigate to the move in the game.
  }
}
