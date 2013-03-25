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

        if(this.restrictions.length == 0) this.restrictions.push(restriction);
        else {
            // Is it non-intersecting with all other active restrictions?
            var superRangeIndex = this.isSubRangeOfAll(this.restrictions, restriction);
            // Not subrange
            if(superRangeIndex < 0) {
                var overlapsIds = this.getOverlappingRanges(this.restrictions, restriction);
                if(overlapsIds.length > 0) { // BUG
                    // Restriction is exclusive (does not affect others)
                    this.restrictions.push(restriction);
                }
            }
            // Is subrange, add it
            else if(this.isMoreRestrictive(this.restrictions[superRangeIndex], restriction)) {
                this._addSubRange(superRangeIndex, restriction);
            }
        }

        // Add for reference
        this.allRestrictions.push(restriction);
    };

    Capacity.prototype._addSubRange = function(superRangeIndex, subRange) {
        if(this.isMoreRestrictive(this.restrictions[superRangeIndex], subRange)) {
            // It is subrange, replace/resize/split the more lenient subrange if this is more restrictive
            var superRange = this.restrictions[superRangeIndex];

            // Remove superrange, and add subrange
            this.restrictions[superRangeIndex] = subRange;

            // Part of superrange before subrange
            var prefixRange = {
                "fromIncl" : superRange.fromIncl,
                "toIncl" : subRange.fromIncl
            }
            var suffixRange = {
                "fromIncl" : subRange.toIncl,
                "toIncl" : superRange.toIncl
            }
            // Calc capacity of prefix range

            // Both prefix and suffix are valid
            if(prefixRange.fromIncl < prefixRange.toIncl && suffixRange.fromIncl < suffixRange.toIncl) {
                var capacity = (superRange.capacity - subRange.capacity) / 2;
                prefixRange.capacity = capacity;
                suffixRange.capacity = capacity;

                this.restrictions.push(prefixRange);
                this.restrictions.push(suffixRange);
            }
            // Only prefix range valid
            else if(prefixRange.fromIncl < prefixRange.toIncl) {
                var capacity = superRange.capacity - subRange.capacity;
                prefixRange.capacity = capacity;

                this.restrictions.push(prefixRange);
            }
            // Only suffix range valid
            else if(suffixRange.fromIncl < suffixRange.toIncl) {
                var capacity = superRange.capacity - subRange.capacity;
                suffixRange.capacity = capacity;

                this.restrictions.push(suffixRange);
            }
        }
    };

    Capacity.prototype.getOverlappingRanges = function(restrictions, maybeOverlapping) {
        
        var overlapsIds = new Array();

        for(var i = 0; i < restrictions.length; i++) {
            if(this.isOverlappingRangeButNotSubRange(restrictions[i], maybeOverlapping)) {
                overlapsIds.push(i);
            }
        }

        return overlapsIds;
    };

    Capacity.prototype.isOverlappingRangeButNotSubRange = function(range, maybeOverlapping) {
        return !this.isSubRange(range, maybeOverlapping)
            && (range.fromIncl < maybeOverlapping.fromIncl && range.toIncl < maybeOverlapping.toIncl)
            || (maybeOverlapping.fromIncl < range.fromIncl && maybeOverlapping.toIncl < range.toIncl);
    };

    Capacity.prototype.isSubRangeOfAll = function(restrictions, maybeSubRange) {
        var superRangeIndex = -1;
        for(var i = 0; i < restrictions.length; i++) {
            if(this.isSubRange(restrictions[i], maybeSubRange)) {
                superRangeIndex = i;
                break;
            }
        }
        return superRangeIndex;
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