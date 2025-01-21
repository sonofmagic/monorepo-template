import process from 'node:process'
import { } from '@uploadcare/rest-client'
import { generateSecureSignature } from '@uploadcare/signed-uploads'
import { UploadClient } from '@uploadcare/upload-client'
import { config } from 'dotenv'
import fs from 'fs-extra'
import path from 'pathe'

config({
  path: '.env.local',
})

const client = new UploadClient({ publicKey: process.env.UPLOADCARE_PUBLIC_KEY! })

console.log(process.env.UPLOADCARE_SECRET_KEY)

// const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
//   publicKey: process.env.UPLOADCARE_PUBLIC_KEY!,
//   secretKey: process.env.UPLOADCARE_SECRET_KEY!,
// })

// const result0 = await listOfFiles({

// }, { authSchema: uploadcareSimpleAuthSchema })

// console.log(result0)

// const result1 = await listOfGroups({

// }, { authSchema: uploadcareSimpleAuthSchema })

// console.log(result1)

const { secureSignature, secureExpire } = generateSecureSignature(process.env.UPLOADCARE_SECRET_KEY!, {
  expire: Date.now() + 60 * 30 * 1000, // expire in 30 minutes
})

const file = await fs.readFile(path.resolve(import.meta.dirname, 'Quiz Import Template.xlsx'))

const envs = ['dev', 'sit', 'prod']

const res = await Promise.all(envs.map((e) => {
  return client.uploadFile(
    file,
    {
      secureSignature,
      secureExpire,
      fileName: `Quiz Import Template ${e}.xlsx`,
    },
  )
}))

await fs.writeJSON(
  path.resolve(import.meta.dirname, 'Quiz Import Template.json'),
  res.map((x) => {
    return {
      uuid: x.uuid,
      cdnUrl: x.cdnUrl,
    }
  }).reduce<Record<string, any>>((acc, cur, idx) => {
    acc[envs[idx]] = cur
    return acc
  }, {}),
  {
    spaces: 2,
  },
)
