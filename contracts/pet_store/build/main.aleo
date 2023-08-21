program cryptopet.aleo;

record adopt_record:
    owner as address.private;
    action as u8.private;
    pet_uid as u16.private;

record feed_record:
    owner as address.private;
    action as u8.private;
    feed_id as field.private;
    pet_uid as u16.private;

struct petdetail:
    adopter as address;
    age as u8;
    pet_type as u16;
    level as u8;
    health as u8;
    hungry as u8;


mapping petbind:
	key left as u16.public;
	value right as address.public;


mapping petinfo:
	key left as u16.public;
	value right as petdetail.public;

function adopt:
    input r0 as address.public;
    input r1 as u16.private;
    input r2 as u16.private;
    cast r0 1u8 r1 into r3 as adopt_record.record;
    output r3 as adopt_record.record;

    finalize r0 r1 r2;

finalize adopt:
    input r0 as address.public;
    input r1 as u16.public;
    input r2 as u16.public;
    cast r0 0u8 r2 0u8 80u8 6u8 into r3 as petdetail;
    set r0 into petbind[r1];
    set r3 into petinfo[r1];


function feed:
    input r0 as address.private;
    input r1 as u16.private;
    input r2 as u8.private;
    input r3 as u8.private;
    input r4 as u8.private;
    input r5 as field.private;
    cast r0 2u8 r5 r1 into r6 as feed_record.record;
    output r6 as feed_record.record;

    finalize r1 r2 r3 r4;

finalize feed:
    input r0 as u16.public;
    input r1 as u8.public;
    input r2 as u8.public;
    input r3 as u8.public;
    get petinfo[r0] into r4;
    add r4.level r3 into r5;
    add r4.health r2 into r6;
    add r4.hungry r1 into r7;
    gte r4.health 100u8 into r8;
    ternary r8 r4.health r6 into r9;
    gte r4.hungry 12u8 into r10;
    ternary r10 r4.hungry r7 into r11;
    cast r4.adopter r4.age r4.pet_type r5 r9 r11 into r12 as petdetail;
    set r12 into petinfo[r0];
