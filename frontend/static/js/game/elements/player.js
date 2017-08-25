class Player {
    constructor(data) {
        this.update(data);
        if (this.id != null) {
            Player.idToPlayer[this.id] = this;
        } else {
            console.error("new player '" + this.name + "' has no id!");
        }
    }

    /**
     * Get the size of the player, calculated by his score.
     */
    get size() {
        return CONSTS.INITIAL_SIZE + (this.score * CONSTS.SCORE_SIZE);
    }

    /**
     * Get the speed of the player, calculated by his size.
     */
    get speed() {
        return CONSTS.INITIAL_SPEED / Math.log(this.size);
    }

    /**
     * Get the time in seconds until the player is allowed to do the next move.
     */
    secondsToNextMove() {
        let milisecondsSinceLastMove = (new Date()) - this.lastMove;
        return Math.max(0, (milisecondsSinceLastMove / 1000) - (1 / this.speed));
    }

    update(data) {
        utils.extractData(this, data, {
            id: null,
            name: "Player",
            score: CONSTS.INITIAL_SCORE,
            x: null,
            y: null,
            lastMove: new Date()
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            score: this.score
        };
    }
}

Player.idToPlayer = {};
