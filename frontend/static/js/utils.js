utils = new (function () {
    this.clculateSize = function (points) {
        return CONSTS.INITIAL_SIZE + (points * CONSTS.POINT_SIZE);
    };
})();
