import { createClient } from '@supabase/supabase-js';
import { createC2pa, createTestSigner, ManifestBuilder } from 'c2pa-node';
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const c2pa = createC2pa();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function urlToBuffer(url: string) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer;
}

function removeThumbnails(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;

  // Remove 'thumbnail' key if exists
  if ('thumbnail' in obj) {
    delete obj.thumbnail;
  }

  // Recursively check nested objects/arrays
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      obj[key] = removeThumbnails(obj[key]);
    }
  }

  return obj;
}

async function readC2PA(path: string, mimeType: string) {
  
  try{

    const buffer = await urlToBuffer(path);
    const result = await c2pa.read({ buffer, mimeType });
  
    if (result) {
      const { active_manifest, manifests, validation_status } = result;
      //console.log(active_manifest);
  
      if(active_manifest){
        
        return removeThumbnails(active_manifest);

      }
    } else {
      return({})
    }
  }
  catch(err: any){
    return(err)
  }
}

async function writeC2PA(path: string, mimeType: string, assetID: string, ext: string, hash: string, phash: string, walletID: string) {

    const signer = await createTestSigner();
    const c2pa = createC2pa({ signer });

    const manifest = new ManifestBuilder({
        claim_generator: 'kreon-labs/1.0.0',
        format: mimeType,
        title: `${assetID}.${ext}`,
        assertions: [
            {
                label: 'com.kreon-labs.story-registration',
                data: {
                    "wallet": walletID,
                    "assetID": assetID,
                    "hash": hash,
                    "pHash": phash
                },
            },
        ],
    });

    const buffer = await urlToBuffer(path);
    const asset = { buffer, mimeType };
    const { signedAsset, signedManifest } = await c2pa.sign({ asset, manifest });

      const { data, error } = await supabase.storage
      .from("uploads")
      .upload(`c2pa/${assetID}.${ext}`, signedAsset.buffer , {
        contentType: signedAsset.mimeType, 
        upsert: true,
      });

      const res = await supabase
            .storage
            .from('uploads')
            .getPublicUrl(`c2pa/${assetID}.${ext}`);

      const resultingManifest = await c2pa.read(signedAsset);


      console.log(resultingManifest)

    if (!error) {
      return ({
        publicURL: res.data.publicUrl,
        signedManifest: resultingManifest?.active_manifest
      })
    } 
    else{
      return({})
    }
}

export = {
    readC2PA,
    writeC2PA
}