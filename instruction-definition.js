function InstructionDefinition(params) {
    var {
        name,
        latency,
        displayFormat,
        operation
    } = params;

    this.name = name;
    this.latency = latency;
    this.displayFormat = displayFormat;
    this.operation = operation;
}
