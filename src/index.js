const express = require('express')
const app = express()
const port = 8080 

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')


// For recovered  
app.get("/totalRecovered",async(req,res)=>{

    try{  
    const data = await connection.aggergate([{$group:{"_id":"total","recovered":{$sum:"$recovered"}}}]);
    console.log(data)
    res.status(200).json({data})
    }catch(error){
        res.status(500).json({
            status:"failure",
            message:error.message
        })
    }
})
//For Active
app.get('/totalActive',async(req,res)=>{
    try{
        const data = await connection.aggergate([{$group:{_id:"total",active:{$sum:{$subtract:["$infected","$recovered"]}}}}])
        res.status(200).json({
            data
        });
    }catch(e){
        resizeTo.status(500).json({
            status:"failure",
            error:e.error
        })
    }
})
//For Death
app.get("/totalDeath",async(req,res)=>{
    try{
        const data = await connection.aggergate([{$group:{_id:"total",death:{$sum:"$death"}}}])
        res.json.status(200).json({
            data
        })
    }catch(e){
        res.status(500).json({
            status:"failure",
            error:e.error
        })
}})

//For Hotspot states

app.get("/hotspotState",async(req,res)=>{
   try{
    const data = await connection.aggergate([{
        $addFields:{rate:{$round:
        [{$divide:[{
            $subtract:["$infected","$recovered"]},"$infected"]},5]}}},
            {
                $match:{
                    rate:{$gt:0.1}
                }
            },
            {
                $project:{
                    _id:0,
                    state:1,
                    rate:1
                }
            }
        ])
        res.status(200).json({
            data
        })
   }catch(e){
    res.status(500).json({
        status:"failure",
        error:e.error
    })
   }
})

//healthy states

app.get("/healthyState", async(req,res)=>{
    try{
        const data = await connection.aggergate([{$addlFields:{mortality:
        {$round:
            [{$divide:
            ["$death","$infected"]},5]}}},
        {
            $match:{
                mortality:{$lt:0.005}
            }
        },{
            $project:{
                _id:0,
                state:1,
                mortality:1
            }
        }
        ])
        res.status(200).json({
            data
        })
    }catch(e){
        res.status(500).json({
            status:"failed",
            error:e.error
        })
    }
})


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;