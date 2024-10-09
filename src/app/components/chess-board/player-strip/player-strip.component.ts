import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-player-strip',
  templateUrl: './player-strip.component.html',
  styleUrls: ['./player-strip.component.scss']
})
export class PlayerStripComponent {

  @Input() player: any;
  // @Input() clock: string;
  // @Input() isActive: boolean;
  @Input() isTop: boolean = false;

}
