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
        PASSWORD: hash,
        AVATAR: body.avatar
    }).then(result =>{
        res.json('success');
    })
    .catch(err =>{
        res.status(400).json(err.sqlMessage);
    })
});


app.post('/google-register',(req,res)=>{
    const body = req.body;
    console.log(body);
    var hash = bc.hashSync(body.password,saltRounds);
    db('Users').insert({
        EMAIL: body.email,
        NAME: body.name,
        PASSWORD: hash,
        AVATAR: body.avatar
    }).then(result =>{
        db.select('ID','NAME','EMAIL','AVATAR').from('Users').where('EMAIL','=',body.email)
        .then(user=>{
            res.json({
                id: user[0].ID,
                status: 'success',
                name:user[0].NAME,
                email: user[0].EMAIL,
                avatar: user[0].AVATAR
            });
        })
    })
    .catch(err =>{
        console.log(err);
        db.select('ID','NAME','EMAIL','AVATAR').from('Users').where('EMAIL','=',body.email)
        .then(user=>{
            res.json({
                id: user[0].ID,
                status: 'success',
                name:user[0].NAME,
                email: user[0].EMAIL,
                avatar: user[0].AVATAR
            });
        })
    })
})

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

app.post('/users',(req,res)=>{
    const body = req.body;
    console.log(body);
    db.select('*').from('Users').whereNot({
        ID:body.id
    })
    .then(resp=>{
        res.json(resp);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})


app.post('/follow',(req,res)=>{
    const body = req.body;
    console.log(body);
    db('Follows').insert({
        uid:body.uid,
        fid:body.fid
    })
    .then(resp=>{
        db.select('fid').from('Follows').where('uid','=',body.uid)
        .then(following=>{
            console.log(following);
            db.select('uid').from('Follows').where({
                fid:body.uid
            })
            .then(followers=>{
                const finga = following.map(user=>{
                    return(user.fid);
                });
                const fersa = followers.map(user=>{
                    return(user.uid);
                });
                res.json({
                    fing:finga,
                    fers: fersa
                });
            })
            .catch(err=>{
                console.log(err);
            })
        })
        .catch(err=>{
            console.log(err);
        })
    })
    .catch(err=>{
        console.log(err);
    })
})


app.post('/un-follow',(req,res)=>{
    const body = req.body;
    console.log(body);
    db('Follows').where({
        uid:body.uid,
        fid:body.fid
    }).del()
    .then(resp=>{
        db.select('fid').from('Follows').where('uid','=',body.uid)
        .then(following=>{
            console.log(following);
            db.select('uid').from('Follows').where({
                fid:body.uid
            })
            .then(followers=>{
                const finga = following.map(user=>{
                    return(user.fid);
                });
                const fersa = followers.map(user=>{
                    return(user.uid);
                });
                res.json({
                    fing:finga,
                    fers: fersa
                });
            })
            .catch(err=>{
                console.log(err);
            })
        })
        .catch(err=>{
            console.log(err);
        })
    })
    .catch(err=>{
        console.log(err);
    })
})

app.post('/get-following',(req,res)=>{
    db.select('fid').from('Follows').where({uid:req.body.uid})
    .then(fingIds=>{
        db.select('uid').from('Follows').where({fid:req.body.uid})
        .then(fersId=>{
            const finga = fingIds.map(user=>{
                return(user.fid);
            });
            const fersa = fersId.map(user=>{
                return(user.uid);
            });
            res.json({
                fing: finga,
                fers : fersa
            })
        })
        .catch(err=>{
            console.log(err);
        })
    })
    .catch(err=>{
        res.status(err).json(err);
    })
})


app.post('/get-name',(req,res)=>{
    db.select('NAME','ID','AVATAR').from('Users').innerJoin('Follows','ID','Follows.fid').where({uid:req.body.uid})
    .then(data=>{
        res.json(data)
    })
    .catch(err=>{
        res.json(err);
    })
})


app.post('/get-follower-songs',(req,res)=>{
    console.log(req.body.uid);
    db.select('*').from('Follows').where('Follows.fid','=',req.body.fid,'AND','Follows.uid','=',req.body.uid).innerJoin('Playlist','Follows.fid','Playlist.uid').where('Playlist.name','=','My Story').innerJoin('MadeOf','Playlist.pid','MadeOf.pid').innerJoin('Songs','MadeOf.sid','Songs.sid').innerJoin('Artists','Songs.sid','Artists.sid')
    .then(resp=>{
        res.json(resp);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})


app.post('/feedback',(req,res)=>{
    db('Feedback').insert(req.body)
    .then(resp=>{
        res.json('success');
    })
    .catch(err=>{
        res.status(400).json(err);
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