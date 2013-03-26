(function(exports){

    var Capacity = function() {
        this.originalRestrictions = new Array();
        this.restrictions = new Array();
    };

    Capacity.prototype.createRestriction = function(fromIncl, toIncl, capacity) {
        return {
            "fromIncl" : fromIncl,
            "toIncl" : toIncl,
            "capacity" : capacity
        };
    };


    Capacity.prototype.addRestriction = function(fromIncl, toIncl, capacity) {
        var restriction = this.createRestriction(fromIncl, toIncl, capacity);
        
        // Preserve original restriction
        restriction.original = this.createRestriction(fromIncl, toIncl, capacity);
        this.originalRestrictions.push(restriction.original);

        // Get all intersecting restrictions
        var intersectingIds = this.getIntersectingRestrictions(this.restrictions, restriction);

        // Case 1, no intersecting
        if(intersectingIds.length === 0) {
            this.restrictions.push(restriction);
        }
        else {
            for(var i = 0; i < intersectingIds.length; i++) {
                var intersectingId = intersectingIds[i];
                var intersectingRestriction = this.restrictions[intersectingId];
                var intersectingType = this.getIntersectingType(intersectingRestriction, restriction);

                if(intersectingType === "equal") {
                    // replace if more restrictive
                    if(intersectingRestriction.capacity >= restriction.capacity) {
                        this.restrictions[intersectingId] = restriction;
                    }
                }
            }
        }
    };

    Capacity.prototype.getIntersectingRestrictions = function(restrictions, restriction) {
        var intersectingIds = new Array();
        for(var i = 0; i < restrictions.length; i++) {
            if(this.isIntersecting(restrictions[i], restriction)) {
                intersectingIds.push(i);
            }
        }
        return intersectingIds;
    };

    Capacity.prototype.isIntersecting = function(restriction, maybeIntersecting) {
        return !(maybeIntersecting.toIncl <= restriction.fromIncl) && !(maybeIntersecting.fromIncl >= restriction.toIncl);
    };

    /**

    100 = restriction
     50 = intersecting
    
    Case: equal
            -------100--------
            --------50--------

    Case: rightoverlap
            -------100--------
                      -----50-----

    Case: leftoverlap
            -------100--------
        ----50----

    Case: rightsub
            -------100--------
                    ----50----

    Case: leftsub
            -------100--------
            ----50----

    Case: middlesub
            -------100--------
                ---50---
     */
    Capacity.prototype.getIntersectingType = function(restriction, intersecting) {
        if(restriction.fromIncl === intersecting.fromIncl && restriction.toIncl === intersecting.toIncl) {
            return "equal";
        }
        if(restriction.fromIncl < intersecting.fromIncl && restriction.toIncl < intersecting.toIncl) {
            return "rightoverlap";
        }
        if(restriction.fromIncl > intersecting.fromIncl && restriction.toIncl > intersecting.toIncl) {
            return "leftoverlap";
        }
        if(restriction.fromIncl < intersecting.fromIncl && restriction.toIncl === intersecting.toIncl) {
            return "rightsub";
        }
        if(restriction.fromIncl === intersecting.fromIncl && restriction.toIncl > intersecting.toIncl) {
            return "leftsub";
        }
        if(restriction.fromIncl < intersecting.fromIncl && restriction.toIncl > intersecting.toIncl) {
            return "middlesub";
        }
        return "nonintersecting";
    };

/*
    Capacity.prototype.addRestriction = function(fromIncl, toIncl, cap) {
        var restriction = this.createRestriction(fromIncl, toIncl, cap);

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
/*
    Capacity.prototype._addSubRange = function(superRangeIndex, subRange) {
        if(this.isMoreRestrictive(this.restrictions[superRangeIndex], subRange)) {
            // It is subrange, replace/resize/split the more lenient subrange if this is more restrictive
            var superRange = this.restrictions[superRangeIndex];

            // Remove superrange, and add subrange
            this.restrictions[superRangeIndex] = subRange;

            // Part of superrange before subrange
            var prefixRange = this.createRestriction(superRange.fromIncl, subRange.fromIncl);
            var suffixRange = this.createRestriction(subRange.toIncl, superRange.toIncl);
            
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
*/
/*
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
*/
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