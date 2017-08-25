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
            //webSocket.send(JSON.stringify(args));
        }
    };

    async function runBot(user) {
        let myCode = `// My first bot!
        nextMove.direction = [-1, -1]`
        function bot(code, nextMove) {
            eval("(() => {" + code + "})()");
            game.makeTurn(nextMove);
        }
        while (userPlayer == null) {
            await utils.sleep(1000);
            while (userPlayer != null) {
                if (userPlayer.secondsToNextMove() == 0) {
                    bot.call(userPlayer.toJSON(), myCode, {direction: [0, 0]});
                }
                await utils.sleep(Math.max(250, userPlayer.secondsToNextMove() * 1000));
            }
        }
    }

    this.start = () => {
        openWebSocket();
        console.log('Connecting...');
        runBot(this.user);
        console.log('Lunching bot...');
    };

    this.getBonusSquares = () => {
        return Object.entries(this.board.squares).map(([key, square]) => square).filter(square => square.points);
    };
})();

game.start();
