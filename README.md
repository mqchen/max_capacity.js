# Calculate max capacity given multiple restrictions on ranges

## Example: School

If a school has the following restrictions:

- 1st to 7th grade: 100 students
- 8th to 9th grade: 50 students

Max capacity at that school is 150

Adding another restriction:

- 1st to 3rd grade: 20 students

Max capacity at that school is still 150

Add another restriction:

- 4th to 7th grade: 30 students

Max capacity at that school is now 20 + 30 + 50 = 100

# Usage

Example of the previous school example

    this.capacity.addRestriction(1, 7, 100); // Replaced by 3rd and 4th
    this.capacity.addRestriction(8, 9, 50);
    this.capacity.addRestriction(1, 3, 20);
    this.capacity.addRestriction(4, 7, 30);

    assert.equals(this.capacity.getMaxCapacity(), 100);

This script also supports restrictions with ranges that overlap more than one restriction, for example:

    this.capacity.addRestriction(5, 10, 100); // Should be split and resized
    this.capacity.addRestriction(3, 7, 50); // Keep, overlaps first
    this.capacity.addRestriction(11, 20, 100); // Keep

    assert.equals(this.capacity.getMaxCapacity(), 250);
