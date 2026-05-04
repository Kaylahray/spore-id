# SporeID

Frontend for a small CKB identity flow: connect a wallet, claim a handle, store a profile, mint Spore images, share a public link. There is no server that owns your data; the app is a shell that speaks RPC on read and asks the wallet to sign on write.

**Live:** [spore-id on Vercel](https://spore-id.vercel.app/)

---

## Why it feels different from a normal web app

In CKB the unit of state is the **cell**: capacity (CKB locked), a **lock** (who can spend), optional **type** (extra rules for how the cell may change), and **data** (bytes). The chain does not run “your database”; it stores cells. Anything the UI shows as “my username” or “my profile” is ultimately “find the right cells and interpret their data.”

## How the app knows _which_ rules to use

On-chain logic lives in **Type scripts** attached to those cells. The browser does not ship the VM bytecode as part of React; it only needs enough **identifiers** to point the transaction at the same code the chain will run: code hash, hash type, args, and **cell deps** (including the transaction that published the script bytes, so nodes can load them).

Those values are **not invented in the frontend**. They come from a **deploy step**: you build bytecode, put it in a cell, and record what the network ended up with — typically things like code hash, type args, and the dep cell’s outpoint. We copy that bundle into `NEXT_PUBLIC_*` env vars so every user’s browser builds txs that match the live script.

When someone upgrades or redeploys script bytes, the **outpoint and often the args change**. If the env still points at an old dep, you get resolution or verification errors because the transaction references dead or wrong cells. So the env file is less “configuration” and more **pinning the app to a specific on-chain script release**.

Copy `.env.local.example` to `.env.local`, fill all `NEXT_PUBLIC_*` fields from your deploy output (same values on Vercel for production), then `npm install` and `npm run dev`. Restart after env edits.
