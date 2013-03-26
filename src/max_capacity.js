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

                // equal
                // bothoverlap
                if(intersectingType === "equal" || intersectingType === "bothoverlap") {
                    // replace if more restrictive
                    if(intersectingRestriction.capacity > restriction.capacity) {
                        this.restrictions[intersectingId] = restriction;
                    }
                }
                // rightsub
                else if(intersectingType === "rightsub") {
                    if(intersectingRestriction.capacity > restriction.capacity) {
                        this.restrictions.push(restriction);
                        intersectingRestriction.toIncl = restriction.fromIncl - 1;
                        intersectingRestriction.capacity -= restriction.capacity;
                    }
                }
                // leftsub
                else if(intersectingType === "leftsub") {
                    if(intersectingRestriction.capacity > restriction.capacity) {
                        this.restrictions.push(restriction);
                        intersectingRestriction.fromIncl = restriction.toIncl + 1;
                        intersectingRestriction.capacity -= restriction.capacity;
                    }
                }
                // middlesub
                else if(intersectingType === "middlesub") {
                    if(intersectingRestriction.capacity > restriction.capacity) {
                        this.restrictions.push(restriction);

                        // Original becomes prefix
                        var orgIntersectingToIncl = restriction.toIncl;
                        intersectingRestriction.toIncl = restriction.fromIncl - 1;
                        intersectingRestriction.capacity = (intersectingRestriction.capacity - restriction.capacity) / 2;

                        // New suffix
                        var suffix = this.createRestriction(restriction.toIncl + 1, orgIntersectingToIncl,
                            intersectingRestriction.capacity);
                        suffix.original = intersectingRestriction.original;
                        this.restrictions.push(suffix);
                    }
                }
                // rightoverlap
                else if(intersectingType === "rightoverlap") {
                    this.restrictions.push(restriction);
                    // Resize intersecting restriction
                    intersectingRestriction.toIncl = restriction.fromIncl - 1;
                }
                // leftoverlap
                else if(intersectingType === "leftoverlap") {
                    this.restrictions.push(restriction);
                    // Resize intersecting restriction
                    intersectingRestriction.fromIncl = restriction.toIncl + 1;
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

    Case: bothoverlap
            -------100--------
        ------------50------------

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
        if(restriction.fromIncl > intersecting.fromIncl && restriction.toIncl < intersecting.toIncl) {
            return "bothoverlap"
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


    Capacity.prototype.getMaxCapacity = function(fromIncl, toIncl) {
        fromIncl = (fromIncl === undefined) ? Number.MIN_VALUE : fromIncl;
        toIncl = (toIncl === undefined) ? Number.MAX_VALUE : toIncl;
        var queryRange = this.createRestriction(fromIncl, toIncl);

        var max = 0;

        for(var i = 0; i < this.restrictions.length; i++) {
            if(this.isIntersecting(this.restrictions[i], queryRange)) {
                max += this.restrictions[i].capacity;
            }
        }
        return max;
    };

    module.exports = Capacity;

})(typeof exports === 'undefined' ? this['module'] = {} : exports);