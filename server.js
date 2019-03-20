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
    var hash = bc.hashSync(body.password,saltRounds);
    db('Users').insert({
        EMAIL: body.email,
        NAME: body.name,
        PASSWORD: hash
    }).then(result =>{
        res.json('success');
    })
    .catch(err =>{
        res.status(400).json(err.sqlMessage);
    })
});

app.post('/signin',(req,res)=>{
    body = req.body;
    db.select('*').from('Users').where('EMAIL','=',body.email)
    .then(user =>{
        if(bc.compareSync(body.password, user[0].PASSWORD)){
            res.status(400).json('success');
        }
        else{
            res.json('faile2')
        }
    })
    .catch(err=>{
        console.log(err);
        res.json(400).json('failed1');
    })
});



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