const express = require('express');
const app = express();
const saltRounds = 10;
const bp = require('body-parser');
const bc = require('bcrypt');
const cors = require('cors');

var db = require('knex')({
    client: 'pg',
    connection: {
       connectionString : process.env.DATABASE_URL,
      ssl: true
    }
  });

app.use(bp.json());
app.use(cors());


app.get('/',(req,res)=>{
 	db.select('*').from('users').then(users=>{res.json(users)});
});


app.post('/register',(req,res)=>{
    
    const body = req.body;
    var hash = bc.hashSync(body.password,saltRounds);
    db('users').insert({
        email: body.email,
        name: body.name,
        password: hash,
        avatar: body.avatar
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
    db('users').insert({
        email: body.email,
        name: body.name,
        password: hash,
        avatar: body.avatar
    }).then(result =>{
        db.select('id','name','email','avatar').from('users').where('email','=',body.email)
        .then(user=>{
            res.json({
                id: user[0].id,
                status: 'success',
                name:user[0].name,
                email: user[0].email,
                avatar: user[0].avatar
            });
        })
    })
    .catch(err =>{
        console.log(err);
        db.select('id','name','email','avatar').from('users').where('email','=',body.email)
        .then(user=>{
            res.json({
                id: user[0].id,
                status: 'success',
                name:user[0].name,
                email: user[0].email,
                avatar: user[0].avatar
            });
        })
    })
})

app.post('/signin',(req,res)=>{
    const body = req.body;
    console.log(body);
    db.select('id','name','email','avatar','password').from('users').where('email','=',body.email)
    .then(user =>{
        console.log(user);
        if(bc.compareSync(body.password, user[0].password)){
            res.json({
                id: user[0].id,
                status: 'success',
                name:user[0].name,
                email: user[0].email,
                avatar: user[0].avatar
            });
        }
        else{
            res.status(400).json({status: 'faile2'});
        }
    })
    .catch(err=>{
        res.status(400).json(err);
    })
});

app.post('/purchase',(req,res)=>{
    const body = req.body;
    console.log(body);
    db('songs').insert({
        sid: body.song.id,
        sname: body.song.trackName,
        link: body.song.link,
        image: body.song.image,
    })
    .then(resp1=>{

        db('buys').insert({
            uid: body.user.id,
            sid: body.song.id 
        })
        .then(resp2=>{
            name="";
            body.song.artistNames.forEach(artist=>{
                db('artists').insert({
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
        db('buys').insert({
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
    db('playlist').insert({
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
    db.from('buys').innerJoin('songs','buys.sid','songs.sid').innerJoin('artists','songs.sid','artists.sid').where('buys.uid','=',body.id)
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
    db('playlist').insert({
        uid: id,
        name: name
    })
    .then(resp=>{
        db.select('*').from('playlist').where('uid','=',id)
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
    db.select('*').from('playlist').where('uid','=',req.body.id)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/delete-playlist',(req,res)=>{
    db('playlist').where(req.body).del()
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
    db('madeof').insert(body)
    .then(resp=>{
        res.json('success');
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/get-songs',(req,res)=>{
    var body = req.body;
    db.select('*').from('playlist').innerJoin('madeof','playlist.pid','madeof.pid').innerJoin('songs','songs.sid','madeof.sid').innerJoin('artists','artists.sid','songs.sid').where('playlist.pid','=',body.pid,'AND','playlist.uid','=',body.uid)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/update-image',(req,res)=>{
    db('playlist').where('pid','=',req.body.pid,'AND','uid','=',req.body.uid).update({image:req.body.link})
    .then(resp=>{
        res.json('success');
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/delete-from-playlist',(req,res)=>{
    db('madeof').where(req.body).del()
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
    db.select('*').from('users').whereNot({
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
    db('follows').insert({
        uid:body.uid,
        fid:body.fid
    })
    .then(resp=>{
        db.select('fid').from('follows').where('uid','=',body.uid)
        .then(following=>{
            console.log(following);
            db.select('uid').from('follows').where({
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
    db('follows').where({
        uid:body.uid,
        fid:body.fid
    }).del()
    .then(resp=>{
        db.select('fid').from('follows').where('uid','=',body.uid)
        .then(following=>{
            console.log(following);
            db.select('uid').from('follows').where({
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
    db.select('fid').from('follows').where({uid:req.body.uid})
    .then(fingIds=>{
        db.select('uid').from('follows').where({fid:req.body.uid})
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
    db.select('NAME','ID','AVATAR').from('users').innerJoin('follows','ID','follows.fid').where({uid:req.body.uid})
    .then(data=>{
        res.json(data)
    })
    .catch(err=>{
        res.json(err);
    })
})


app.post('/get-follower-songs',(req,res)=>{
    console.log(req.body.uid);
    db.select('*').from('follows').where('follows.fid','=',req.body.fid,'AND','follows.uid','=',req.body.uid).innerJoin('playlist','follows.fid','playlist.uid').where('playlist.name','=','My Story').innerJoin('madeof','playlist.pid','madeof.pid').innerJoin('songs','madeof.sid','songs.sid').innerJoin('artists','songs.sid','artists.sid')
    .then(resp=>{
        res.json(resp);
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})


app.post('/feedback',(req,res)=>{
    db('feedback').insert(req.body)
    .then(resp=>{
        res.json('success');
    })
    .catch(err=>{
        res.status(400).json(err);
    })
})

app.post('/admin',(req,res)=>{
    const body = req.body;
    console.log(body);
    db.select('*').from('Admin').where('email','=',body.email)
    .then(user =>{
        console.log(user);
        if(body.password===user[0].password){
            res.json("success!");
        }
        else{
            res.status(400).json({status: 'faile2'});
        }
    })
    .catch(err=>{
        res.status(400).json({status: 'failed1'});
    })
})

app.get('/allsongs',(req,res)=>{
    db.select('*').from('songs')
    .then(songs=>{
        res.json(songs);
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
