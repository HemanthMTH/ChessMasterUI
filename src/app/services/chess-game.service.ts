import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalyzeRequest } from '../models/analyze-request';
import { AnalyzeResponse } from '../models/analyze-response';
import { ChessGame } from '../models/chess-game';

@Injectable({
  providedIn: 'root',
})
export class ChessGameService {
  private apiUrl = `${environment.apiUrl}/chessgame`;

  constructor(private http: HttpClient) {}

  uploadGame(game: ChessGame): Observable<ChessGame> {
    return this.http.post<ChessGame>(`${this.apiUrl}/upload`, game);
  }

  uploadGameFile(pgnFile: File): Observable<ChessGame> {
    const formData = new FormData();
    formData.append('pgnFile', pgnFile);
    return this.http.post<ChessGame>(`${this.apiUrl}/uploadfile`, formData);
  }

  getAllGames(): Observable<ChessGame[]> {
    return this.http.get<ChessGame[]>(`${this.apiUrl}/games`);
  }

  getGame(gameId: string): Observable<ChessGame> {
    return this.http.get<ChessGame>(`${this.apiUrl}/${gameId}`);
  }

  analyzePosition(request: AnalyzeRequest): Observable<AnalyzeResponse> {
    return this.http.post<AnalyzeResponse>(`${this.apiUrl}/analyze-position`, request);
  }
}
