let game = new (function() {
    this.board = null;
    this.boardView = null;

    let user = new (function() {
        this.name = null;
        this.botType = EvalBot;
    })();

    let userPlayer = null;

    let getServerData = (data) => {
        this.board = new Board(utils.mapObject(data, {
            board_width: "width",
            board_height: "height",
            is_cyclic: "isCyclic"
        }));
        this.boardView = new BoardView(this.board.width, this.board.height);
    }

    let createPlayer = (data) => {
        userPlayer = this.board.addPlayer(data.id, data);
        this.boardView.addPlayer(userPlayer);
    }

    let updateBoard = (data) => {
        if (this.board == null || userPlayer == null) {
            console.warn("got update from the server before initialization:" +
                         "\nboard=" + this.board + "\nplayer=" + userPlayer);
            return;
        }
        this.updatePlayers(data);
    }

    let updatePlayers = (updatedPlayers) => {
        let allPlayers = Object.assign({}, this.board.players, updatedPlayers)
        for (playerID in allPlayers) {
            if (updatedPlayers.hasOwnProperty(playerID)) {
                let player = this.board.getPlayer(playerID)
                if (player == null) {
                    player = this.board.addPlayer(playerID, updatedPlayers[playerID]);
                    this.boardView.addPlayer(player);
                } else {
                    player.update(updatedPlayers[playerID])
                    this.boardView.updatePlayer(player);
                }
            } else {
                this.board.deletePlayer(playerID);
                this.boardView.deletePlayer(allPlayers[playerID]);
            }
        }
    }

    let openWebSocket = () => {
        let webSocket = new WebSocket("");
        webSocket.onmessage = message => {
            message = JSON.parse(message);
            let messageType = message.type;
            let messageData = message.data;
            switch(messageType) {
                case("welcome"):
                    getServerData(messageData);
                    webSocket.send(JSON.stringify({
                        type: "knock",
                        data: {name: user.name}
                    }));
                    break;
                case("knockack"):
                    createPlayer(messageData);
                    break;
                case("info"): updateBoard(messageData); break;
                default:
                    alert("The servers is PASTEN!\n(what is " + messageType + " message?)");
                    webSocket.close();
                    return;
            }
        }
        webSocket.onclose = () => {
            alert("Lost connection to the server!");
        }
    }

    this.start = () => {
        openWebSocket();
        console.log('Connecting...');
    }

    this.getBonusSquares = () => {
        return Object.entries(this.board.squares).map(([key, square]) => square).filter(square => square.points);
    }
})()

game.start();
