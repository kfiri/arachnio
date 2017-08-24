class EvalBot extends Bot {
    get defaultCode() {
        return `// This is the code your bot follows!`
    }

    interpret(code) {
        throw Error("Bot interpreter not implemented")
    }
}