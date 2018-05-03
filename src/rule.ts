export class Rule {
    private readonly name: string
    private readonly values: any[]

    constructor(name: string, values: any[]) {
        this.name = name
        this.values = values
    }

    getName() {
        return this.name
    }

    getValues() {
        return this.values
    }
}

