# Code and Mechanism

### Structure
1. Adopt Record

Store adopt record contains adopter and pet uid
```
record adopt_record{
    owner: address, // adopter
    action: u8, // record type, 1u8 represent adopt 
    pet_uid: u16 // 1u16~80u16
}
```

2. Store Mapping on chain to bind adopter address and pet uid
```
//bind pet with adopter
mapping petbind: u16 => address;
```

3. Feed Record
```
record feed_record{
    owner: address, // feeder
    action: u8, 
    feed_id: field,
    pet_uid: u16
}
```

4. Pet info on chain
```
// pet has been adopted
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
```

### Function

1. Adopt

Deploy transition **adopt** to adopt the pet you choose.
```
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
```

2. Feed

Deploy transition **feed** to feed food or level for you pet.
```
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

```

## Mechanism

### Pet basic attributes
1. Series。
2. Color。
3. Sex。
4. Family。
5. Species。
6. Eye color。
7. Eye shape. Divided into almond eyes, round eyes, oval eyes
8. Birthday. Pets are born at the height of adoption.

### Pet growth attribute
* Level. Pets start at the LV0 level after adoption, and slowly level up as the chain height increases, and the feeding experience level can accelerate
* Age. Starting age is 0 years, pet per 3400 Aleo chain height, age+1.
* Health. Between 0 and 102, when the health value drops to 0, the pet will be recycled
* Hunger. Between 0 and 12, when the hunger value is reduced to 0, the health value will be -10 every 1700 Aleo chain height

### Adopt
* Users can adopt pets that are still in stock at the store
* At most one pet of the same type can be collected from the same address

### Feed
* Users can feed pets in My Pets
* When the pet is fed a favorite food, the hunger value increases by 2; Feeding others increases hunger by 1
* When pet hunger is 0, the pet's health will be reduced by 10 for every 1700 heights, for 17,000 consecutive heights, and the pet will be recovered (about 10 days).

### Pet recycling
* When the pet's health value drops to 0, the pet is recycled and re-hatched
* When an adopter causes pet recycling, the favorability rating of other pets owned by the adopter increases by -5