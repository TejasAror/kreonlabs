const express = require("express");
const dotenv = require('dotenv');

import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const app = express();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

app.use(express.json());

const LinkDB = [
    "https://x.com/jennifer_7575",
    "https://x.com/Abhinav_kodes",
    "https://x.com/Jake_832",
    "https://www.reddit.com/u/Electrical_Suit_3113",
    "https://www.reddit.com/u/abhinav_kodes"
]

let linkIndex = 0;

let jobDB: { [jobID: string] : string} = {};

app.get("/get-job", (req: any, res: any) => {
    
    //Do some capacity estimation.
    
    const jobID = uuidv4();

    linkIndex = (linkIndex + 1) % LinkDB.length;
    const link = LinkDB[linkIndex];

    jobDB[jobID] = link

    res.json({
        "jobID": jobID,
        "link": link,
    })

})

app.post("/submit-job", async (req: any, res: any) => {
    const jobID = req.body.jobID;
    const link = req.body.link;    
    const responses = req.body.responses;
    
    if(!jobID || !link) {
        return res.status(400).json({ error: "jobID and link are required" });
    }

    if(jobDB[jobID] !== link) {
        return res.status(400).json({ error: "Invalid jobID or link" });
    }
    
      const insertPromises = responses.map((element: any) =>
        supabase
        .from('complaints')
        .insert({
            assetID: element.assetID,
            complaintImage: element.complaintImage,
            similarityScore: element.similarityScore,
            walletID: element.walletID,
            link: element.link,
        })
        .then(({ error }) => {
            if (error) {
            console.error(`Insert error for assetID ${element.assetID}:`, error.message);
            } else {
            console.log(`Inserted complaint for assetID: ${element.assetID}`);
            }
        })
    );

    await Promise.all(insertPromises);

    delete jobDB[jobID]; 

    res.json({
        "status": "Job submitted successfully",
        "jobID": jobID,
        "link": link,
    });
})

app.get("/hash-search", async (req: any, res: any) => {

    const jobID = req.body.jobID;
    const hash = req.body.hash;

    if(!jobID || !hash) {
        return res.status(400).json({ error: "jobID and Hash are required" });
    }

    const { data, error } = await supabase
    .from('assets')
    .select('publicurl, assetid, phash, ipassetid, walletid')
    .eq('hash', hash);


    if(!error){
        res.json(data);
    }
    else{
        res.json(error);
    }


})

app.get("/similarity-search", async (req: any, res: any) => {

    const jobID = req.body.jobID;
    const pHash = req.body.pHash;

    if(!jobID || !pHash) {
        return res.status(400).json({ error: "jobID and pHash are required" });
    }

    const targetHashBinary = BigInt('0x' + pHash).toString(2).padStart(64, '0'); // binary string

    const { data, error } = await supabase.rpc('match_phash', {
        input_hash: targetHashBinary,
        max_results: 5
    });


    if(!error){
        res.json(data);
    }
    else{
        res.json(error);
    }

})

app.get("/", (req: any, res: any) => {
    res.send("Server is running!");
})

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`)
})