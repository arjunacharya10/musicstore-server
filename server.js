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
    db.select('ID','NAME','EMAIL','AVATAR','PASSWORD').from('Users').where('EMAIL','=',body.email)
    .then(user =>{
        console.log(user);
        if(bc.compareSync(body.password, user[0].PASSWORD)){
            res.json({
                id: user[0].ID,
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
    console.log(body);
    db('Songs').insert({
        sid: body.song.id,
        sname: body.song.trackName,
        link: body.song.link,
        image: body.song.image,
    })
    .then(resp1=>{

        db('Buys').insert({
            uid: body.user.id,
            sid: body.song.id 
        })
        .then(resp2=>{
            name="";
            body.song.artistNames.forEach(artist=>{
                db('Artists').insert({
                    sid: body.song.id,
                    name: artist.name
                })
                .then(resp3=>{
                    res.json('success');
                })
                .catch(err=>{
                    console.log(err);
                })
            });
        })
        .catch(err=>{
            console.log('error is');
            console.log(err);
            res.json('Already purchased');
        })
    })
    .catch(err=>{
        console.log(err);
        db('Buys').insert({
            uid: body.user.id,
            sid: body.song.id 
        })
        .then(resp2=>{
            console.log("Success!!!");
            res.json('Success!!')
        })
        .catch(err=>{
            res.status(400).json('Already Bought..');
        })
    })
})

app.post('/playlist-create',(req,res)=>{
    body = req.body;
    db('Playlist').insert({
        uid: body.id,
        name: body.name,
        image: body.image
    })
    .then(result=>{
        res.json(result);
    })
    .catch(err=>{
        res.status(400).json(err);
    });
})

app.post('/send-purchased',(req,res)=>{
    body = req.body;
    db.from('Buys').innerJoin('Songs','Buys.sid','Songs.sid').innerJoin('Artists','Songs.sid','Artists.sid').where('Buys.uid','=',body.id)
    .then(resp=>{
        console.log(resp);
        res.json(resp);
    })
    .catch(err=>{
        res.json('failed')
    });
})

app.post('/create-playlist',(req,res)=>{
    var {name,id}=req.body;
    db('Playlist').insert({
        uid: id,
        name: name
    })
    .then(resp=>{
        db.select('*').from('Playlist').where('uid','=',id)
        .then(playlists=>{
            res.json(playlists);
        })
        .catch(err=>{
            res.status(400).json(err);
        })
    })
    .catch(err=>{
        res.status(400).json(err);
    });

})

app.post('/get-playlist',(req,res)=>{
    db.select('*').from('Playlist').where('uid','=',req.body.id)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/delete-playlist',(req,res)=>{
    db('Playlist').where(req.body).del()
    .then(resp=>{
        res.json('success');
    })
    .then(err=>{
        console.log("Here error!!!");
        res.status(400).json(err);
    })
})

app.post('/add-to-playlist',(req,res)=>{
    var body = req.body;
    db('MadeOf').insert(body)
    .then(resp=>{
        res.json('success');
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/get-songs',(req,res)=>{
    var body = req.body;
    db.select('*').from('Playlist').innerJoin('MadeOf','Playlist.pid','MadeOf.pid').innerJoin('Songs','Songs.sid','MadeOf.sid').innerJoin('Artists','Artists.sid','Songs.sid').where('Playlist.pid','=',body.pid,'AND','Playlist.uid','=',body.uid)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/update-image',(req,res)=>{
    db('Playlist').where('pid','=',req.body.pid,'AND','uid','=',req.body.uid).update({image:req.body.link})
    .then(resp=>{
        res.json('success');
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/delete-from-playlist',(req,res)=>{
    db('MadeOf').where(req.body).del()
    .then(resp=>{
        res.json(resp);
    })
    .catch(err=>{
        res.json(err);
    })
})



app.listen(process.env.PORT||3000,()=>{
    console.log(`app is running on port ${process.env.PORT}`);
})





/*
--> Profile endpoint
--> signin
--> register
--> cart
--> bought songs
--> 


*/