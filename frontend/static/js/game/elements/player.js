class Player {
    constructor(data) {
        utils.extractData(this, data, {
            id: null,
            name: "Player",
            points: CONSTS.INITIAL_POINTS,
            lastMove: new Date()
        });
        if (this.id != null) {
            Player.idToPlayer[this.id] = this;
        } else {
            console.error("new player '" + this.name + "' has no id!");
        }
    }

    /**
     * Get the size of the player, calculated by his points.
     */
    get size() {
        return CONSTS.INITIAL_SIZE + (this.points * CONSTS.POINT_SIZE);
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

    toJSON() {
        return {id: this.id, points: this.points, size: this.size}
    }
}

Player.idToPlayer = {};
