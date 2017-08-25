class Board {
    constructor(data) {
        let defaults = {
            width: 0,
            height: 0,
            isCyclic: null,
            squares: {},
            players: {}
        };
        if (Board.instance != null) {
            return utils.extractData(Board.instance, data, defaults);
        }
        utils.extractData(this, data, defaults);
    }

    getSquare(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return utils.getDefault(this.squares, [x, y],
            this.squares[x, y] = new Square({x, y}));
    }

    getPlayer(id) {
        return utils.getDefault(this.players, id, null);
    }

    addPlayer(id, data) {
        let newPlayer = new Player(data);
        this.players[id] = newPlayer;
        return newPlayer;
    }

    deletePlayer(id) {
        delete this.players[id];
    }
}

Board.instance = null;
