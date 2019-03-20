const express = require('express');
const app = express();
const bp = require('body-parser');
const bc = require('bcrypt');

const db = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'arjun',
        password: 'Kamalakshi1998',
        database: 'musicstore'
    }
});


app.get('/',(req,res)=>{
    res.json('Its Working!');
})



app.listen(process.env.PORT||3000,()=>{
    console.log(`app is running on port ${process.env.PORT}`);
});