const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const geo = require('geofirex').init(admin);
const cors = require('cors')({origin: true});
const{ get } = require ('geofirex');


exports.CourseCreate = functions.firestore.document('/Course/{uid}').onCreate(async(snapshot, context)=>{

    const newCourse = snapshot.data();
    const conductrices = admin.firestore().collection('Conductrice');
    const center = geo.point(43.6295362, 7.130000999999993);
    const radius = 500;
    const field = 'location';
    const geoQuery = geo.query(conductrices);
    const stream = await geoQuery.within(center, radius, field);
    const hits =await get(stream);

    if(hits.length > 0){
        admin.firestore().collection('Course').doc(snapshot.id).update({
            conductrice:hits[0].id,
            status : 'pending-for-cliente-accept'
        });
    }
    else{
        admin.firestore().collection('Course').doc(snapshot.id).update({
           
            status : 'no-conductrice-available'
        });

    }


    
});
exports.CourseUpdate = functions.firestore.document('/Course/{uid}').onUpdate(async(snapshot, context)=>{
    const course = snapshot.after.data();
    
    if(course['status'] === 'cliente-accept'){
        admin.firestore().collection('Conductrice-request').doc(snapshot.id).update({
            request_id:snapshot.id,
            status : 'pending-for-accept'
        });
        admin.firestore().collection('Conductrice').doc(snapshot.id).update({
            status : 'pending-for-conductrice-accept'
        });
    }
    if(course['status'] === 'cliente-request'){

        const conductrices = admin.firestore().collection('Conductrice');
        const center = geo.point(43.6295362, 7.130000999999993);
        const radius = 500;
        const field = 'location';
        const geoQuery = geo.query(conductrices);
        const stream = await geoQuery.within(center, radius, field);
        const hits =await get(stream);
    
        if(hits.length > 0){
            admin.firestore().collection('Course').doc(snapshot.after.id).update({
                conductrice:hits[0].id,
                status : 'pending-for-cliente-accept'
            });
        }
        else{
            admin.firestore().collection('Course').doc(snapshot.after
                .id).update({
               
                status : 'no-conductrice-available'
            });
    
        }
    }
});


 