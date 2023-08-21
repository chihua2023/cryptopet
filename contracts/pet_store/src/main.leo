program cryptopet.aleo {
    // adopt record, private
    record adopt_record{
        owner: address, // adopter
        action: u8,
        pet_uid: u16 // 1u16~90u16
    }

    // bind with pet and adopter，public
    mapping petbind: u16 => address;

    // feed record, private
    record feed_record{
        owner: address, // feeder
        action: u8, //
        feed_id: field,
        pet_uid: u16
    }

    // pet who has been adopted，public
    struct petdetail {
        adopter: address,
        age: u8,       // 1u8~100u8
        pet_type: u16,  //1u16~16u16
        level: u8,     // no limit
        health: u8,    // 0u8~102u8
        hungry: u8,    // 0u8~12u8
    }
    // pet uid => pet detail
    mapping petinfo: u16 => petdetail;

    //create adopt record
    transition adopt(public adopter: address,pet_uid: u16, pet_type: u16) -> adopt_record {
        let adoptrecord: adopt_record = adopt_record {
            owner: adopter,
            action: 1u8,
            pet_uid: pet_uid
        };
        return adoptrecord then finalize(adopter, pet_uid, pet_type);
    }

    //create pet on chain
    finalize adopt(public adopter: address,pet_uid: u16,pet_type:u16) {
            let petd: petdetail = petdetail {
                adopter: adopter,
                age: 0u8,
                pet_type: pet_type,
                level: 0u8,
                health: 80u8,
                hungry: 6u8,
            };
            Mapping::set(petbind,pet_uid,adopter);
            // let uid: u16 = (pet_type-1u16)*(5u16-remaincount+1u16);
            Mapping::set(petinfo,pet_uid,petd);
    }

    //create feed record
    transition feed(feeder: address, pet_uid: u16, add_hungry: u8, add_health: u8,add_level: u8,feed_id:field) -> feed_record {
        let feedrecord: feed_record = feed_record {
            owner: feeder,
            action: 2u8,
            feed_id: feed_id,
            pet_uid: pet_uid
        };
        return feedrecord then finalize(pet_uid,add_hungry,add_health,add_level);
    }

    //save pet state on chain after feed
    finalize feed(pet_uid: u16, add_hungry: u8, add_health: u8,add_level: u8) {
        let petold: petdetail = Mapping::get(petinfo,pet_uid);
        //only adopter can feed
        let level: u8 = petold.level + add_level; //no limit

        let health: u8 = petold.health + add_health; //max: 102
        let hungry: u8 = petold.hungry + add_hungry; //max: 12

        if petold.health >= 100u8 {
            health = petold.health;
        }

        if petold.hungry >= 12u8 {
            hungry = petold.hungry;
        }

        let petnew: petdetail = petdetail {
            adopter: petold.adopter,
            age: petold.age,
            pet_type: petold.pet_type,
            level: level,
            health: health,
            hungry: hungry,
        };
        Mapping::set(petinfo,pet_uid,petnew);
    }
}

