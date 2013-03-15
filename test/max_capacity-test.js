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

        "should find max capacity with 2 restrictions, where one is a more restrictive a sub-range" : function() {
            this.capacity.addRestriction(1, 10, 100);
            this.capacity.addRestriction(1, 5, 100);

            assert.equals(this.capacity.getMaxCapacity(), 100);
        }
    }

});