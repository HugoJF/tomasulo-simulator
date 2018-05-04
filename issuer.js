function Issuer() {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;

    this.definitions = []
    this.instructions = [];
    this.index = 0;
    this.uid = 0;

    this.findDefinition = function (name) {
        for (var i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i].name == name) {
                return this.definitions[i];
            }
        }

        return false;
    }

    this.pushInstruction = function (params) {
        var def = this.findDefinition(params.name);

        if (def === false) {
            console.error(`Could not find instruction with name: ${params.name}`);
            return false;
        }

        var inst = new Instruction({
            'uid': this.getUID(),
            'name': params.name,
            'latency': params.latency ? params.latency : def.latency,
            'arg1': params.arg1,
            'arg2': params.arg2,
            'arg3': params.arg3,
            'operation': def.operation,
            'displayFormat': def.displayFormat
        });

        this.instructions.push(inst);
    }

    this.issue = function(rsp) {
        if (this.index >= this.instructions.length) {
            console.error('There are no instruction to issue!');
            return;
        }
        var inst = this.instructions[this.index];
        var rs = rsp.findSuitableReservationStation(inst.name);
        if (rs !== false) {
            this.index++;
            rs.issue(inst);
        } else {
            console.error('Could not find a suitable reservation station available, stalling issues');
        }
    }

    this.getUID = function() {
        return ++this.uid;
    }
}
