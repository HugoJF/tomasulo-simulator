function ReservationStationPool() {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.busAvailable = true;
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
        this.busAvailable = true;
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i].tick();
        }
    }

    this.cdb = function(name, result) {
        console.log(`CDB being called by ${name} with ${result}`);
        this.busAvailable = false;
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i].cdb(name, result);
        }
    }

    this.cdbAvailable = function () {
        return this.busAvailable;
    }
}
