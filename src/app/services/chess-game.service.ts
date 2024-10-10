import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChessGame } from '../models/chess-game';

@Injectable({
  providedIn: 'root',
})
export class ChessGameService {
  private apiUrl = `${environment.apiUrl}/chessgame`;

  constructor(private http: HttpClient) {}

  uploadGame(game: ChessGame): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, game);
  }

  uploadGameFile(pgnFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('pgnFile', pgnFile);
    return this.http.post(`${this.apiUrl}/uploadfile`, formData);
  }

  getAllGames(): Observable<ChessGame[]> {
    return this.http.get<ChessGame[]>(`${this.apiUrl}`);
  }

  analyzeGame(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyze/${id}`);
  }

  getGame(gameId: string): Observable<ChessGame> {
    return this.http.get<ChessGame>(`${this.apiUrl}/${gameId}`);
  }

  analyzePosition(fen: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze-position`, { fen });
  }
}
