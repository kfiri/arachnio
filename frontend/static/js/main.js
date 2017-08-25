let game = new (function() {
    this.board = null;
    this.boardView = null;
    this.user = new (function() {
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
    };

    let createPlayer = (data) => {
        userPlayer = this.board.addPlayer(data.id, data);
        this.boardView.addPlayer(userPlayer);
    };

    let updateBoard = (data) => {
        if (this.board == null || userPlayer == null) {
            console.error("got update from the server before initialization:" +
                          "\nboard=" + this.board + "\nplayer=" + userPlayer);
            return;
        }
        updatePlayers(data.players);
    };

    let updatePlayers = (updatedPlayers) => {
        let allPlayers = Object.assign({}, this.board.players, updatedPlayers);

        // Test for cases of two or more players on the same tile.
        let coordMapping = {};
        for (let playerID in allPlayers) {
            let coords = allPlayers[playerID].x + ',' + allPlayers[playerID].y;
            if (coordMapping[coords]) {
                coordMapping[coords].push(playerID);
            } else {
                coordMapping[coords] = [playerID];
            }
        }

        for (let playerID in allPlayers) {
            if (updatedPlayers.hasOwnProperty(playerID)) {
                let player = this.board.getPlayer(playerID)
                if (player == null) {
                    player = this.board.addPlayer(playerID, updatedPlayers[playerID]);
                    this.boardView.addPlayer(player);
                } else {
                    // Update only if the data has actually changed, to prevent animations from stopping and restarting
                    // all the time.
                    let old = player.toJSON();
                    player.update(updatedPlayers[playerID])
                    let indexOnTile = coordMapping[player.x + ',' + player.y].indexOf(playerID);
                    let countOnTile = coordMapping[player.x + ',' + player.y].length;
                    if (old.x !== player.x || old.y !== player.y || old.score !== player.score) {
                        this.boardView.updatePlayer(player, countOnTile, indexOnTile);
                    }
                }
            } else {
                this.board.deletePlayer(playerID);
                this.boardView.deletePlayer(allPlayers[playerID]);
                if (playerID === userPlayer.id) {
                    userPlayer = null;
                    alert("You died!")
                }
            }
        }
    };

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
                        data: {name: this.user.name}
                    }));
                    break;
                case("knockack"):
                    createPlayer(messageData);
                    break;
                case("info"):
                    updateBoard(messageData);
                    break;
                default:
                    alert("The servers is PASTEN!\n(what is " + messageType + " message?)");
                    webSocket.close();
                    return;
            }
        }
        webSocket.onclose = () => {
            alert("Lost connection to the server!");
        }
        this.makeTurn = (args) => {
            webSocket.send(JSON.stringify({type: "update", data: args}));
        }
    };

    async function runBot(user) {
        let myCode = `// My first bot!
        console.log(this);
        nextMove.direction = [-1, -1]`
        function bot(code, nextMove) {
            eval("(() => {" + code + "})()");
            game.makeTurn(nextMove);
        }
        while (true) {
            if (userPlayer != null) {
                bot.call(Object.assign(userPlayer.toJSON(), {
                    size: userPlayer.size,
                    speed: userPlayer.speed
                }), myCode, {direction: [0, 0]});
            }
            await utils.sleep(250);
        }
    }

    this.start = () => {
        openWebSocket();
        console.log('Connecting...');
        runBot(this.user);
        console.log('Launching bot...');
    };

    this.getBonusSquares = () => {
        return Object.entries(this.board.squares).map(([key, square]) => square).filter(square => square.points);
    };
})();

game.start();
