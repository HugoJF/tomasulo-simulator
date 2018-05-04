/**
 * STARTUP LOGIC
 */

var i = new Issuer();

var rb = new RegisterBank(10, 10);
var rsp = new ReservationStationPool();

var clockInterval = 1000;
var lastClock = Date.now() - clockInterval;
var clockInter = undefined;

var re = /([a-zA-Z.]+)\s+([rRfF]\d)[ ,]+([rRfF]?\d+)[,(\s+]+([rRfF]\d+)\)?(?:\s+=\s+(\d+))?/gm;

rsp.pool.push(new ReservationStation('LOAD0', ['L.D']));
rsp.pool.push(new ReservationStation('MULT0', ['MUL.D']));
rsp.pool.push(new ReservationStation('ADD0', ['ADD.D']));
rsp.pool.push(new ReservationStation('ADD1', ['ADD.D']));
rsp.pool.push(new ReservationStation('ADD2', ['ADD.D']));

i.definitions.push(new InstructionDefinition({
    'name': 'L.D',
    'latency': 2,
    'operation': function(a, b) {
        console.log('running L.D');
        // TODO - memory access at REG[b] + a
        return 10;
    }
}));
i.definitions.push(new InstructionDefinition({
    'name': 'MUL.D',
    'latency': 15,
    'operation': function(a, b) {
        console.log('running MUL.D');
        return a * b;
    }
}));
i.definitions.push(new InstructionDefinition({
    'name': 'ADD.D',
    'latency': 4,
    'operation': function(a, b) {
        console.log('running ADD.D');
        return a + b;
    }
}));



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
        i.pushInstruction({
            'name': inst[1],
            'latency': inst[5],
            'arg1': inst[2],
            'arg2': inst[3],
            'arg3': inst[4]
        });
    }

    $('#reservation_station > tr, #register_body > td, .instruction').mouseenter(function(e) {
        console.log($(this).attr('data-highlight'));
        var registers = $(this).attr('data-highlight');
        if (registers == undefined || registers == '') {
            return;
        }
        registers = registers.split(';');
        console.log(registers);
        for (var i = 0; i < registers.length; i++) {
            $(`${registers[i]}`).toggleClass('highlight');
        }
    });

    $('#reservation_station > tr, #register_body > td, .instruction').mouseleave(function(e) {
        console.log($(this).attr('data-highlight'));
        var registers = $(this).attr('data-highlight');
        if (registers == undefined || registers == '') {
            return;
        }
        registers = registers.split(';');
        console.log(registers);
        for (var i = 0; i < registers.length; i++) {
            $(`${registers[i]}`).toggleClass('highlight');
        }
    });
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
