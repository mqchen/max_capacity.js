'use strict';

var buster = require("buster");

var Capacity = require("../src/max_capacity.js");

buster.testCase("Max capacity test", {

    setUp : function() {
        this.capacity = new Capacity();
    },

    "getMaxCapacity" : {

        "should find max with one restriction" : function() {
            this.capacity.addRestriction(1, 10, 100);

            assert.equals(this.capacity.getMaxCapacity(), 100);
        },

        "should find max for 2 non-intersecting restrictions" : function() {
            this.capacity.addRestriction(1, 5, 100);
            this.capacity.addRestriction(6, 10, 100);

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 3 restrictions, 1 more restrictive subrange of another" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(1, 5, 100); // This should be considered

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 4 restrictions, 1 more restrictive subrange of another, and 1 more lenient subrange" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(1, 5, 100); // This should be considered
            this.capacity.addRestriction(8, 10, 200); // This should be ignored

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with many restrictions, all non-intersecting" : function() {
            var total = 0;
            for(var i = 1; i <= 10; i++) {
                total += 100;
                this.capacity.addRestriction(i, i, 100);
            }

            assert.equals(this.capacity.getMaxCapacity(), total);
        },
    }

});