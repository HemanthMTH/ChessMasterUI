import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChessBoardComponent } from './components/chess-board/chess-board.component';
import { DashboardComponent } from './components/chess-game/dashboard/dashboard.component';
import { GameListComponent } from './components/chess-game/game-list/game-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RedirectGuard } from './guards/redirect.guard';

const famousGameId = 'FAMOUS_GAME_ID';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'upload', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: GameListComponent, canActivate: [AuthGuard] },
  { path: 'game/:id', component: ChessBoardComponent, canActivate: [AuthGuard] }, 
  { path: '', redirectTo: 'redirect', pathMatch: 'full' },  // Temporary redirect to handle in the guard
  { path: 'redirect', canActivate: [RedirectGuard], component: ChessBoardComponent }, 
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
