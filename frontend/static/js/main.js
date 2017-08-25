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
            console.error("got update from the server before initialization:" +
                          "\nboard=" + this.board + "\nplayer=" + userPlayer);
            return;
        }
        updatePlayers(data.players);
    }

    let updatePlayers = (updatedPlayers) => {
        let allPlayers = Object.assign({}, this.board.players, updatedPlayers);

        // Test for cases of two players on the same tile.
        let firstHalves = [];
        let secondHalves = [];
        let coordMapping = {};
        for (let playerID in allPlayers) {
            let coords = allPlayers[playerID].x + ',' + allPlayers[playerID].y;
            if (coordMapping[coords]) {
                firstHalves.push(coordMapping[coords]);
                secondHalves.push(playerID);
            } else {
                coordMapping[coords] = playerID;
            }
        }

        for (let playerID in allPlayers) {
            let playerIsFirstHalf = firstHalves.indexOf(playerID) > -1;
            let playerIsSecondHalf = secondHalves.indexOf(playerID) > -1;
            if (updatedPlayers.hasOwnProperty(playerID)) {
                let player = this.board.getPlayer(playerID)
                if (player == null) {
                    player = this.board.addPlayer(playerID, updatedPlayers[playerID]);
                    this.boardView.addPlayer(player);
                } else {
                    // Update only if the data has actually changed, to prevent animations from stopping and restarting
                    // all the time.
                    let old = {x: player.x, y: player.y, score: player.score};
                    player.update(updatedPlayers[playerID])
                    if (player.x !== old.x || player.y !== old.y || player.score !== old.score) {
                        this.boardView.updatePlayer(player, playerIsFirstHalf ? 1 : playerIsSecondHalf ? 2 : 0);
                    }
                }
            } else {
                this.board.deletePlayer(playerID);
                this.boardView.deletePlayer(allPlayers[playerID]);
            }
        }
    }

    let openWebSocket = () => {
        let webSocket = new WebSocket("ws://localhost:10946/ws");  //TODO: change from localhost.
        webSocket.onmessage = message => {
            message = JSON.parse(message.data);
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
