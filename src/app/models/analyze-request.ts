export class AnalyzeRequest {
  gameId: string;
  fen: string;

  constructor(gameId: string, fen: string) {
    this.fen = fen;
    this.gameId = gameId;
  }
}
