const express = require('express');
const app = express();
const saltRounds = 10;
const bp = require('body-parser');
const bc = require('bcrypt');
const cors = require('cors');

const db = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'arjun',
        password: 'Kamalakshi1998',
        database: 'musicstore'
    }
});

app.use(bp.json());
app.use(cors());


app.get('/',(req,res)=>{
    res.json('Its Working!');
});


app.post('/register',(req,res)=>{
    
    const body = req.body;
    const img = 'https://api.adorable.io/avatars/285/'+body.name;
    var hash = bc.hashSync(body.password,saltRounds);
    db('Users').insert({
        EMAIL: body.email,
        NAME: body.name,
        PASSWORD: hash,
        AVATAR: img
    }).then(result =>{
        res.json('success');
    })
    .catch(err =>{
        res.status(400).json(err.sqlMessage);
    })
});

app.post('/signin',(req,res)=>{
    const body = req.body;
    console.log(body);
    db.select('NAME','EMAIL','AVATAR','PASSWORD').from('Users').where('EMAIL','=',body.email)
    .then(user =>{
        console.log(user);
        if(bc.compareSync(body.password, user[0].PASSWORD)){
            res.json({
                status: 'success',
                name:user[0].NAME,
                email: user[0].EMAIL,
                avatar: user[0].AVATAR
            });
        }
        else{
            res.status(400).json({status: 'faile2'});
        }
    })
    .catch(err=>{
        res.status(400).json({status: 'failed1'});
    })
});

app.post('/purchase',(req,res)=>{
    const body = req.body;
    db('Purchased').insert({
        trackName: body.trackName,
        link: body.link,
        image: body.image,
        artistNames: body.artistNames,
        songid: body.id
    })
    .then(res=>{

    res.json('success'); 
    })
    .catch(err=>{
        res.json(err);
    })
})



app.listen(process.env.PORT||3000,()=>{
    console.log(`app is running on port ${process.env.PORT}`);
});





/*
--> Profile endpoint
--> signin
--> register
--> cart
--> bought songs
--> 


*/