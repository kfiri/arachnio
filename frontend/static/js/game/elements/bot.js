class Bot {
    constructor(data) {
        let code = data.code | this.defaultCode;
        this.loop = function() {
            return this.interpret(code);
        }
    }

    get defaultCode() {
        return "";
    }

    interpret(code) {
        throw Error("Bot interpreter not implemented")
    }
}