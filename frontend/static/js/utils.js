let utils = new (function () {
    this.getDefault = (obj, key, defaultValue) => {
        obj.hasOwnProperty(key) ? obj[key] : defaultValue;
    }
    this.extractData = (target, data, defaults) => {
        for (key in defaults) {
            target[key] = this.getDefault(data, key, defaults[key]);
        }
        return target;
    };
    this.mapObject = (obj, mapper) => {
        let mappedObj = {};
        for (key in obj) {
            mappedObj[this.getDefault(mapper, key, key)] = obj[key];
        }
        return mappedObj;
    };
})();
