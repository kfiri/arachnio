let game = new (function() {
    this.board = null;

    let user = new (function() {
        this.name = null;
        this.botType = EvalBot;
    })();

    let userPlayer = null;

    let getServerData = (data) => {
        this.board = Board(utils.mapObject(data, {
            board_width: "width",
            board_height: "height",
            is_cycle: "isCyclic"
        }));
    }

    let createPlayer = (data) => {
        // Add player (TODO)
        userPlayer = this.board.addPlayer(playerID, data);
    }

    let updateBoard = (data) => {
        if (this.board == null || userPlayer == null) {
            console.warn("got update from the server before initialazation:" +
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
                    // Add player (TODO)
                    player = this.board.addPlayer(playerID, updatedPlayers[playerID]);
                } else {
                    // Update player (TODO)
                    player.update(updatedPlayers[playerID])
                }
            } else {
                // Delete player (TODO)
                this.board.deletePlayer(playerID);
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
                case("knock ack"):
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
        // ???
    }

    this.getBonusSquares = () => {
        return Object.entries(this.board.squares).map(([key, square]) => square).filter(square => square.points)
    }
})()

game.start();
