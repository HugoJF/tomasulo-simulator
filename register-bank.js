function RegisterBank(intRegisters, floatRegisters) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;

    console.log('Float register count: ' + floatRegisters);
    console.log('Int register count: ' + intRegisters);

    this.intRegisters = [];
    this.floatRegisters = [];

    for (var i = 0; i < intRegisters; i++) {
        this.intRegisters.push(new Register('R' + i));
    }
    for (var i = 0; i < floatRegisters; i++) {
        this.floatRegisters.push(new Register('F' + i));
    }

    this.getRegister = function(name) {
        var number = parseInt(name.substr(1));

        if (name[0] == 'R' || name[0] == 'r') {
            if (number >= this.intRegisters.length) {
                console.error('Invalid integer register index');
            }
            return this.intRegisters[number];
        } else if (name[0] == 'F' || name[0] == 'f') {
            if (number >= this.floatRegisters.length) {
                console.error('Invalid float register index');
            }
            return this.floatRegisters[number];
        } else {
            console.error('Invalid register prefix');
        }
    }

    this.isRegister = function(name) {
        var prefix = ['R', 'r', 'F', 'f'];

        return prefix.indexOf(name[0]) !== -1;
    }

}
