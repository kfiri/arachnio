let CONSTS = Object.freeze({
    INITIAL_SIZE:   10,
    INITIAL_SPEED:  3.0,  // Blocks per second.
    INITIAL_SCORE:  0,
    SCORE_SIZE:     1  // The size the player get from a single score point.
});

let DIRECTIONS = Object.freeze({
    IDLE: [0, 0],
    UP: [0, -1],
    DOWN: [0, 1],
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    UP_LEFT: [-1, -1],
    UP_RIGHT: [1, -1],
    DOWN_LEFT: [-1, 1],
    DOWN_RIGHT: [1, 1]
});
