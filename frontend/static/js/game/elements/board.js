let board = new (function() {
    let squareToPlayers = {};

    this.height = CONSTS.BOARD_HEIGHT;
    this.width = CONSTS.BOARD_WIDTH;

    this.getPlayersInSquare = function(square) {
        if (square.constructor === Square) {
            square = [square.x, square.y];
        }
        return squareToPlayers[square];
    };

    this.toJSON = function() {
        return {};
    };
})();
