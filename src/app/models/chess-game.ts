export interface ChessGame {
  id: string;
  playerNameWhite?: string;     // White player name
  playerNameBlack?: string;     // Black player name
  result?: string;              // Game result
  timeControl?: string;         // Time control
  whiteElo?: string;            // White player's Elo rating
  blackElo?: string;            // Black player's Elo rating
  termination?: string;         // Game termination reason
  eco?: string;                 // Opening code (ECO)
  gameDate?: Date;              // Game date
  link?: string;                // Game link
  site?: string;                // Site where the game was played
  pgn: string;                  // PGN content
  userId: string;
}

export class ChessGameParser {
  // Method to parse PGN metadata
  static parsePgnMetadata(pgnContent: string, userId: string): ChessGame {
    const chessGame: ChessGame = {
      id: userId,
      pgn: pgnContent,
      userId
    };

    // Split the PGN content into lines, trim whitespaces, and remove empty lines
    const lines = pgnContent.split(/\r?\n/).map(line => line.trim()).filter(line => line !== "");

    // Loop through each line and parse based on known PGN header fields
    lines.forEach((line) => {
      if (line.startsWith("[Site ")) {
        chessGame.site = this.extractValue(line);
      } else if (line.startsWith("[Date ")) {
        const dateStr = this.extractValue(line);
        const gameDate = new Date(dateStr);
        if (!isNaN(gameDate.getTime())) {
          chessGame.gameDate = gameDate;
        }
      } else if (line.startsWith("[White ")) {
        chessGame.playerNameWhite = this.extractValue(line);
      } else if (line.startsWith("[Black ")) {
        chessGame.playerNameBlack = this.extractValue(line);
      } else if (line.startsWith("[Result ")) {
        chessGame.result = this.extractValue(line);
      } else if (line.startsWith("[TimeControl ")) {
        chessGame.timeControl = this.extractValue(line);
      } else if (line.startsWith("[WhiteElo ")) {
        chessGame.whiteElo = this.extractValue(line);
      } else if (line.startsWith("[BlackElo ")) {
        chessGame.blackElo = this.extractValue(line);
      } else if (line.startsWith("[Termination ")) {
        chessGame.termination = this.extractValue(line);
      } else if (line.startsWith("[ECO ")) {
        chessGame.eco = this.extractValue(line);
      } else if (line.startsWith("[Link ")) {
        chessGame.link = this.extractValue(line);
      }
    });

    return chessGame;
  }

  // Helper method to extract the value between double quotes from a PGN line
  static extractValue(line: string): string {
    const match = line.match(/"(.*?)"/);
    return match ? match[1] : "";
  }
}
