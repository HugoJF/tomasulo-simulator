/**
 * DOM BINDING FUNCTIONS
 */

var watcher = function(propertyName, setter) {
    Object.defineProperty(this, propertyName, {
        get: () => this['_' + propertyName],
        set: x => {
            setter(x);
            this['_' + propertyName] = x
        }
    })
}

var bindValueToElement = function(propertyName, selector) {
    this.watcher(propertyName, function(x) {
        $(selector).html((x || "").toString());
    })
}

var bindValueToDataAttr = function(propertyName, element, dataAttrName) {
    this.watcher(propertyName, function(x) {
        $(element.getUniqueSelector()).attr(`data-${dataAttrName}`, (x || "").toString());
    })
}

/**
 * OBJECTS
 */

function Instruction(params) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;
    this.bindValueToDataAttr = bindValueToDataAttr;

    var {
        uid,
        name,
        latency,
        arg1,
        arg2,
        arg3,
        operation
    } = params;

    $('#instructions').append(
        `<tr class="instruction" id="instruction_${uid}">\
        <td class="name"><strong>${name} ${arg1}, ${arg2}, ${arg3}</strong> [${latency} cycles]</td>\
        <td class="issued"></td>\
        <td class="executed"></td>\
        <td class="result_written"></td>\
        </tr>`
    );

    this.uid = uid;
    this.name = name;
    this.latency = latency;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.arg3 = arg3;
    this.operation = operation;
    this.cycle = 0;

    this.getUniqueSelector = function() {
        return `#instruction_${uid}`;
    }

    this.bindValueToElement('issued', `${this.getUniqueSelector()}>.issued`);
    this.bindValueToElement('executed', `${this.getUniqueSelector()}>.executed`);
    this.bindValueToElement('result_written', `${this.getUniqueSelector()}>.result_written`);

    this.bindValueToDataAttr('highlighting', this, 'highlight');

    this.highlighting = 'a';

    this.watcher('class', function(x) {
        $(`#instruction_${uid}`).removeClass().addClass(x).addClass('instruction');
    })

    this.issued = false;
    this.executed = false;
    this.result_written = false;
    this.class = '';

    this.execute = function() {
        this.cycle++;
        this.executed = `${this.cycle} / ${this.latency}`;
    }
}


function Issuer() {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;

    this.instructions = [];
    this.index = 0;
    this.uid = 0;

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

function Register(name, value = 1) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;

    $('#register_header').append('<td><strong>' + name + '</strong></td>');
    $('#register_body').append('<td data-highlight="haha" id="' + name + '" >...</td>');

    this.watcher('class', function(x) {
        $(`#${name}`).removeClass().addClass(x);
    })

    this.bindValueToElement('status', `#${name}`);

    this.name = name;
    this.value = value;
    this.status = undefined;
    this.class = '';

}

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

function ReservationStation(name, instructionSet) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;

    $('#reservation_station').append('\
        <tr id="' + 'rs_' + name + '"> \
            <td class="rs_name"><strong>' + name +
        '</strong>\
        </td> \
            <td class="rs_busy"></td>\
            <td class="rs_op"></td>\
            <td class="rs_vj"></td>\
            <td class="rs_vk"></td>\
            <td class="rs_qj"></td>\
            <td class="rs_qk"></td>\
            <td class="rs_a"></td>\
            <td class="rs_result"></td>\
        </tr>'
    )

    this.bindValueToElement('busy', `#rs_${name}>.rs_busy`);
    this.bindValueToElement('op', `#rs_${name}>.rs_op`);
    this.bindValueToElement('vj', `#rs_${name}>.rs_vj`);
    this.bindValueToElement('vk', `#rs_${name}>.rs_vk`);
    this.bindValueToElement('qj', `#rs_${name}>.rs_qj`);
    this.bindValueToElement('qk', `#rs_${name}>.rs_qk`);
    this.bindValueToElement('a', `#rs_${name}>.rs_a`);
    this.bindValueToElement('result', `#rs_${name}>.rs_result`);

    this.watcher('class', function(x) {
        $(`#rs_${name}`).removeClass().addClass(x);
    })

    this.name = name;
    this.instructionSet = instructionSet;
    this.instruction = undefined;
    this.class = 'primary';

    this.busy = false;
    this.op = undefined;
    this.vj = undefined;
    this.vk = undefined;
    this.qj = undefined;
    this.qk = undefined;
    this.a = undefined;
    this.result = undefined;

    this.isSuitable = function(instructionName) {
        return this.instructionSet.indexOf(instructionName) !== -1;
    }

    this.tick = function() {
        if (this.instruction !== undefined) {
            if (this.instruction.cycle >= this.instruction.latency) {
                this.write_result();
            } else {
                this.execute();
            }
        }
    }

    this.write_result = function() {
        console.log('im done bitches');
        this.instruction.result_written = true;
        this.instruction.class = 'success';
        if (this.instruction.operation) {
            rb.getRegister(this.instruction.arg1).value = this.instruction.operation(this.vj, this.vk);
        }
        rb.getRegister(this.instruction.arg1).status = undefined;
        rb.getRegister(this.instruction.arg1).class = '';
        rsp.cdb(this.name, rb.getRegister(this.instruction.arg1).value);
        this.reset();
    }

    this.reset = function() {
        this.instruction = undefined;
        this.class = 'primary';

        this.class = '';
        this.busy = false;
        this.op = undefined;
        this.vj = undefined;
        this.vk = undefined;
        this.qj = undefined;
        this.qk = undefined;
        this.a = undefined;
        this.result = undefined;
    }

    this.execute = function() {
        if ((this.vj !== undefined || this.a !== undefined) && this.vk !== undefined) {
            this.instruction.execute();
            this.instruction.class = 'info'
            this.class = 'info';
        } else {
            this.instruction.class = 'danger';
            this.class = 'danger';
        }
    }

    this.cdb = function(name, result) {
        if (name == this.qj) {
            this.qj = undefined;
            this.vj = result;
        } else if (name == this.qk) {
            this.qk = undefined;
            this.vk = result;
        }
    }

    this.issue = function(instruction) {
        this.busy = true;
        this.op = instruction.name;
        this.instruction = instruction;
        this.class = 'info';
        instruction.issued = true;
        instruction.class = 'info';

        // Update register status
        rb.getRegister(instruction.arg1).status = this.name;
        rb.getRegister(instruction.arg1).class = 'danger';

        // Fill j parameter
        if (rb.isRegister(instruction.arg2)) {

            var r2 = rb.getRegister(instruction.arg2);
            if (r2.status === undefined) {
                // Register bank is updated
                this.vj = r2.value;
                this.qj = 0;
            } else {
                // Register bank is dirty, wait for RS
                this.qj = r2.status;

            }
        } else {
            this.a = instruction.arg2;
        }

        // Fill k parameter
        var r3 = rb.getRegister(instruction.arg3);

        if (r3.status === undefined) {
            // Register bank is updated
            this.vk = r3.value;
            this.qk = 0;
        } else {
            // Register bank is dirty, wait for RS
            console.log(r3);
            this.qk = r3.status;

        }
    }
}

function ReservationStationPool() {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;

    this.pool = [];

    this.findSuitableReservationStation = function(instruction) {
        for (var i = 0; i < this.pool.length; i++) {
            if (this.pool[i].isSuitable(instruction) && !this.pool[i].busy) {
                console.log('Found suitable reservation station at index: ', i);
                return this.pool[i];
            }
        }
        console.error('Could not find suitable reservation station for instruction: ', instruction);

        return false;
    }

    this.tick = function() {
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i].tick();
        }
    }

    this.cdb = function(name, result) {
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i].cdb(name, result);
        }
    }
}

/**
 * STARTUP LOGIC
 */

var i = new Issuer();

var rb = new RegisterBank(10, 10);
var rsp = new ReservationStationPool();

var clockInterval = 1000;
var lastClock = Date.now() - clockInterval;
var clockInter = undefined;

var re = /([a-zA-Z.]+)\s+([rRfF]\d)[ ,]+([rRfF]?\d+)[,(\s+]+([rRfF]\d+)\)?\s+=\s+(\d+)/gm;

rsp.pool.push(new ReservationStation('LOAD0', ['L.D']));
rsp.pool.push(new ReservationStation('MULT0', ['MUL.D']));
rsp.pool.push(new ReservationStation('ADD0', ['ADD.D']));
rsp.pool.push(new ReservationStation('ADD1', ['ADD.D']));
rsp.pool.push(new ReservationStation('ADD2', ['ADD.D']));

/*
L.D R3 44(R2) = 30
l.d r3 22(r1) = 2
mul.d r1, r2, r3 = 1
ADD.D R1, R2, R3 = 2
*/

function clock() {
    rsp.tick();
    i.issue(rsp);
    lastClock = Date.now();
}

function updateProgressBar() {
    var delta = Date.now() - lastClock;

    delta = delta / clockInterval;

    if (delta > 1) {
        delta = 1;
    }
    var percent = delta;
    $('#clock-timing>div').css('width', Math.round(percent * 100) + '%');
}

function load() {
    // Match whole lines without capturing groups
    var instructions = $('#code').val().match(re);

    for (var z = 0; z < instructions.length; z++) {
        re.lastIndex = 0;
        // Match using each capturing group
        var inst = re.exec(instructions[z].toUpperCase());
        i.instructions.push(new Instruction({
            'uid': i.getUID(),
            'name': inst[1],
            'latency': inst[5],
            'arg1': inst[2],
            'arg2': inst[3],
            'arg3': inst[4]
        }));
    }
}

setInterval("updateProgressBar()", 1000 / 144);

$('#clock').click(function() {
    clock();
});

$('#load').click(function() {
    load();
});

$('#start-auto-clock').click(function() {
    clockInter = setInterval("clock()", clockInterval);
});

$('#stop-auto-clock').click(function() {
    clearInterval(clockInter);
});
