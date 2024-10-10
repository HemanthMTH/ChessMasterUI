export interface ChessGame {
    id: string;
    playerNameWhite: string;     // White player name
    playerNameBlack: string;     // Black player name
    result?: string;             // Game result
    timeControl?: string;        // Time control
    whiteElo?: string;           // White player's Elo rating
    blackElo?: string;           // Black player's Elo rating
    termination?: string;        // Game termination reason
    eco?: string;                // Opening code (ECO)
    gameDate?: Date;             // Game date
    link?: string;               // Game link
    site?: string;               // Site where the game was played
    pgn: string;                 // PGN content
    userId: string;
}
