(function(exports){

    var Capacity = function() {
        this.allRestrictions = new Array();
        this.restrictions = new Array();
    };

    Capacity.prototype.addRestriction = function(fromIncl, toIncl, cap) {
        var restriction = {
            "fromIncl" : fromIncl,
            "toIncl" : toIncl,
            "capacity" : cap
        };

        // Only add one is more restrictive
        if(this.restrictions.length == 0) this.restrictions.push(restriction);
        else {

            // Is it non-intersecting with all
            var superRangeIndex = -1;
            for(var i = 0; i < this.restrictions.length; i++) {
                // Not subrange, add it
                if(this.isSubRange(this.restrictions[i], restriction)) {
                    superRangeIndex = i;
                    break;
                }
                // Is subrange, and more restrictive, replace previous one
                // else if(this.isMoreRestrictive(this.restrictions[i], restriction)) {
                //         this.restrictions[i] = restriction;
                // }
            }
            if(superRangeIndex < 0) {
                this.restrictions.push(restriction);
            }
            else if(this.isMoreRestrictive(this.restrictions[superRangeIndex], restriction)) {
                // It is subrange, replace/resize/split the more lenient subrange if this is more restrictive
                var superRange = this.restrictions[superRangeIndex];

                // Remove superrange, and add subrange
                this.restrictions[superRangeIndex] = restriction;

                // Part of superrange before subrange
                var prefixRange = {
                    "fromIncl" : superRange.fromIncl,
                    "toIncl" : restriction.fromIncl
                }
                var suffixRange = {
                    "fromIncl" : restriction.toIncl,
                    "toIncl" : superRange.toIncl
                }
                // Calc capacity of prefix range

                // Both prefix and suffix are valid
                if(prefixRange.fromIncl < prefixRange.toIncl && suffixRange.fromIncl < suffixRange.toIncl) {
                    var capacity = (superRange.capacity - restriction.capacity) / 2;
                    prefixRange.capacity = capacity;
                    suffixRange.capacity = capacity;

                    this.restrictions.push(prefixRange);
                    this.restrictions.push(suffixRange);
                }
                // Only prefix range valid
                else if(prefixRange.fromIncl < prefixRange.toIncl) {
                    var capacity = superRange.capacity - restriction.capacity;
                    prefixRange.capacity = capacity;

                    this.restrictions.push(prefixRange);
                }
                // Only suffix range valid
                else if(suffixRange.fromIncl < suffixRange.toIncl) {
                    var capacity = superRange.capacity - restriction.capacity;
                    suffixRange.capacity = capacity;

                    this.restrictions.push(suffixRange);
                }
            }
        }

        // Add for reference
        this.allRestrictions.push(restriction);
    };

    Capacity.prototype.isSubRange = function(range, maybeSubRange) {
        return maybeSubRange.fromIncl >= range.fromIncl && maybeSubRange.toIncl <= range.toIncl;
    }

    Capacity.prototype.isMoreRestrictive = function(orgRestrict, newRestrict) {
        return this.isSubRange(orgRestrict, newRestrict) && newRestrict.capacity <= orgRestrict.capacity;
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