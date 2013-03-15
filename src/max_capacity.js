(function(exports){

    var Capacity = function() {
        this.addRestrictions = new Array();
        this.restrictions = new Array();
    };

    Capacity.prototype.addRestriction = function(fromIncl, toIncl, cap) {
        var restriction = {
            "fromIncl" : fromIncl,
            "toIncl" : toIncl,
            "capacity" : cap
        };

        this.allRestrictions.push(restriction);

        // Only add one is more restrictive

    };

    Capacity.prototype.isMoreRestrictive = function(orgRestrict, newRestrict) {
        
    };

    Capacity.prototype.getMaxCapacity = function() {
        var max = 0;

        for(var i in this.restrictions) {
            if(this.restrictions.hasOwnProperty(i)) {
                max += this.restrictions[i].capacity;
            }
        }
        return max;
    };

    module.exports = Capacity;

})(typeof exports === 'undefined' ? this['module'] = {} : exports);