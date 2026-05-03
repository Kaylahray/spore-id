# SporeID — On-chain builder identity on CKB

A decentralized "builder passport" frontend that talks directly to the
[CKB](https://www.nervos.org/) blockchain. It pairs:

- **Custom CKB cells** (mutable on-chain rows guarded by a Type script) for the
  things that need rules — usernames and profiles.
- **Spore Protocol DOBs** (digital objects) for content — avatars, badges,
  project proofs.

There is no backend service. The Next.js app reads from a CKB RPC node and
writes by asking your wallet (JoyID, MetaMask, OKX, …) to sign transactions.

---

## Table of contents

- [What lives where](#what-lives-where)
- [The two registry scripts](#the-two-registry-scripts)
  - [Username registry](#1-username-registry)
  - [Profile registry](#2-profile-registry)
- [How the scripts connect to the frontend](#how-the-scripts-connect-to-the-frontend)
- [Environment variables — every line explained](#environment-variables--every-line-explained)
- [Local development](#local-development)
- [Verifying everything on the testnet explorer](#verifying-everything-on-the-testnet-explorer)
- [Testing the script rules](#testing-the-script-rules)
- [Cell capacity (the "insufficient CKB" thing)](#cell-capacity-the-insufficient-ckb-thing)
- [Splitting the contracts into their own repos](#splitting-the-contracts-into-their-own-repos)
- [The full flow, end to end](#the-full-flow-end-to-end)
- [Configuration requirement](#configuration-requirement)
- [Known limits](#known-limits-and-roadmap)

---

## What lives where

```
spore/
├── username-registry-ts/      # CKB Type script: enforces username rules
├── profile-registry-ts/       # CKB Type script: enforces profile rules
└── spore-id/                  # Next.js frontend (this folder)
    ├── app/                   # Pages: /, /onboard, /me, /u/[username], /mint
    ├── components/profile/    # Wizard, forms, banners, public profile
    ├── context/               # AppProvider — wires CCC + hooks together
    ├── hooks/
    │   ├── use-wallet.ts          # Wallet state (CCC signer)
    │   ├── use-username.ts        # Claim / release / lookup my handle
    │   ├── use-profile.ts         # Create / update / burn my profile
    │   ├── use-public-profile.ts  # Resolve /u/<name> for any visitor
    │   └── use-spore.ts           # Original Spore minting flow
    └── lib/registry/          # All on-chain logic for username + profile
        ├── config.ts          # Reads env vars → script configs
        ├── client.ts          # CKB RPC client (testnet / devnet / mainnet)
        ├── scripts.ts         # Builds CCC Script + CellDep objects
        ├── encoding.ts        # Encode/decode + validate username & profile
        ├── capacity.ts        # Estimated + exact min cell capacity (CKB locked)
        ├── username.ts        # claimUsername, releaseUsername, lookups
        ├── profile.ts         # createProfile, updateProfile, burnProfile
        └── types.ts           # TypeScript types
```

---

## The two registry scripts

Both scripts are [`ckb-js-vm`](https://github.com/nervosnetwork/ckb-js-vm)
contracts written in TypeScript and compiled to JavaScript bytecode. They run
inside the CKB VM as **Type scripts**, which means they get executed every time
a cell carrying that Type script is consumed or created in a transaction. If
the script returns a non-zero exit code, the transaction is rejected by the
chain.

### 1. Username registry

Source: `username-registry-ts/src/index.ts`

This is the "LinkedIn @handle" guard. A username cell looks like this:

```
┌──────────── Username Cell ─────────────┐
│ capacity: auto (≥ min occupied bytes, 1 CKB = 1 byte) │
│ lock:     <user's JoyID lock script>    │  ← only the owner can spend it
│ type:     <username registry script>    │  ← rules enforced by ckb-js-vm
│ data:     "alice_dev"  (raw UTF-8)      │  ← the actual username
└─────────────────────────────────────────┘
```

The script enforces three operations and rejects everything else:

| Operation | Script behaviour |
|---|---|
| **Mint** (no input cell with this Type, one output cell with this Type) | The output's data must be valid: 3–32 chars, only `[a-zA-Z0-9_]`, ASCII only. |
| **Burn** (one input, no output) | Always allowed — anyone can release their own cell (subject to the lock script). |
| **Update** (one input + one output) | Lock hash must be unchanged (no transferring) **and** data must be unchanged (handle is immutable). |

Effective guarantees (per cell):

- A username cell is **non-transferable** (you can't change the lock).
- A username is **immutable** once minted (you can't rename — burn and re-claim instead).
- Only one cell of this Type can appear in any single tx group (cardinality check).

### 2. Profile registry

Source: `profile-registry-ts/src/index.ts`

The profile cell holds your bio, headline, skills, links and Spore IDs (avatar
/ badges / projects), all serialised as a UTF-8 JSON blob:

```
┌──────────── Profile Cell ──────────────┐
│ capacity: auto (≥ min occupied bytes, 1 CKB = 1 byte) │
│ lock:     <user's JoyID lock script>    │
│ type:     <profile registry script>     │
│ data:     {"name":"Alice", ...}  (JSON) │
└─────────────────────────────────────────┘
```

Operations the script accepts:

| Operation | Script behaviour |
|---|---|
| **Mint** | Output data must be valid JSON with a non-empty string `name` of length ≤ 64. |
| **Burn** | Always allowed. |
| **Update** | Lock hash must be unchanged (non-transferable) **and** new JSON must still be valid. |

Why JSON instead of Molecule? It's mutable, schema-flexible, and the cell is
yours — only validation rules need to be on chain. The frontend reads the JSON
and renders the UI.

---

## How the scripts connect to the frontend

The bridge is the **type script identity**. The `args` of every username cell
on testnet look identical:

```
0x0000  +  <bytecode codeHash>  +  01
└────┘    └──────────────────┘    └┘
 vm       hash of the bytecode    "type"
 flags    cell that holds our     hashType
          compiled contract       byte
```

Because all username cells share the same Type script, the indexer can find
them with a single query. That's exactly what we do:

```32:46:spore-id/lib/registry/username.ts
async function findUsernameCellByOwner(
  ownerLock: ccc.Script,
): Promise<{ cell: ccc.Cell; username: string } | null> {
  const client = getClient();
  const type = getUsernameTypeScript();
  for await (const cell of client.findCells(
    {
      script: type,
      scriptType: "type",
      scriptSearchMode: "exact",
      filter: { script: ownerLock },
    },
    "asc",
    20n,
  )) {
```

For each on-chain operation:

| Frontend hook → lib function | Builds | Sends to wallet |
|---|---|---|
| `useUsername().claim()` → `claimUsername()` | tx with **1 output** (lock=you, type=username, data=name) | JoyID modal → user signs → broadcast → wait |
| `useUsername().release()` → `releaseUsername()` | tx with **1 input** (the username cell), no Type output | JoyID modal → returns locked CKB to you (minus tiny fee) |
| `useProfile().create()` → `createProfile()` | tx with **1 output** (lock=you, type=profile, data=JSON) | JoyID modal → broadcast |
| `useProfile().update()` → `updateProfile()` | tx with **1 input + 1 output** of the profile cell, new JSON | JoyID modal → broadcast |
| `useProfile().burn()` → `burnProfile()` | tx with **1 input** of the profile cell | JoyID modal → returns locked CKB |
| `getUsernameByName()` / `getProfileByUsername()` | read-only `findCells` calls against the indexer | no signing |

Every tx goes through CCC's `Transaction.from(...)` → `completeInputsByCapacity`
→ `completeFeeBy` → `signer.sendTransaction` → `client.waitTransaction`.

---

## Environment variables — every line explained

Copy `.env.local.example` to `.env.local`. The active block in your file
should be the testnet one. The full list:

### Network selection

| Variable | Purpose | Used in |
|---|---|---|
| `NEXT_PUBLIC_CKB_NETWORK` | `devnet` / `testnet` / `mainnet`. Picks which RPC client class CCC instantiates and what address prefix wallets show. | `lib/registry/config.ts`, `context/app-provider.tsx`, `lib/registry/client.ts` |
| `NEXT_PUBLIC_CKB_RPC_URL` | The actual RPC endpoint we hit. Defaults to `https://testnet.ckb.dev` if unset, but you can swap to `https://testnet.ckbapp.dev` if it's slow. | `lib/registry/client.ts` (creates `ClientPublicTestnet({ url })`) |

### `ckb-js-vm` (the runtime that executes our TypeScript scripts)

`ckb-js-vm` is its own pre-deployed contract on every CKB network. Our two
contracts are just JS bytecode that gets loaded *by* `ckb-js-vm`. The vm
script's `code_hash` is what becomes the `code_hash` of every username and
profile cell — the args tell it *which* bytecode to run.

| Variable | Source | What it pins |
|---|---|---|
| `NEXT_PUBLIC_CKB_JS_VM_CODE_HASH` | `offckb system-scripts --network testnet` | Hash that identifies the ckb-js-vm Type script. Becomes the `code_hash` field of every username & profile cell. |
| `NEXT_PUBLIC_CKB_JS_VM_HASH_TYPE` | same | Always `type` |
| `NEXT_PUBLIC_CKB_JS_VM_TX_HASH` | same | Outpoint of the ckb-js-vm cell — added as a CellDep to every transaction so the chain can load the vm bytecode. |
| `NEXT_PUBLIC_CKB_JS_VM_INDEX` | same | Index of the cell within that tx. Testnet uses `0x0`, devnet uses `0xf`. |
| `NEXT_PUBLIC_CKB_JS_VM_DEP_TYPE` | same | `code` (a single cell) vs `depGroup` (a list). Both networks use `code`. |

### Username script

| Variable | Source | What it pins |
|---|---|---|
| `NEXT_PUBLIC_USERNAME_TYPE_CODE_HASH` | = `NEXT_PUBLIC_CKB_JS_VM_CODE_HASH` | Same hash — every js-vm script shares this code hash. The differentiation is in `args`. |
| `NEXT_PUBLIC_USERNAME_TYPE_HASH_TYPE` | always `type` | |
| `NEXT_PUBLIC_USERNAME_TYPE_ARGS` | computed: `0x0000` + bytecode codeHash + `01` | This is what makes a cell "a username cell". Bytecode codeHash comes from `username-registry-ts/deployment/scripts.json` after `offckb deploy --network testnet`. |
| `NEXT_PUBLIC_USERNAME_BYTECODE_TX_HASH` | `username-registry-ts/deployment/scripts.json → testnet.index.bc.cellDeps[0].cellDep.outPoint.txHash` | The tx that uploaded our compiled `index.bc` to chain. Added as a CellDep so the script can be loaded. |
| `NEXT_PUBLIC_USERNAME_BYTECODE_INDEX` | same json (`outPoint.index`) | `0x0` |
| `NEXT_PUBLIC_USERNAME_BYTECODE_DEP_TYPE` | same json (`depType`) | `code` |

### Profile script

Identical structure to the username block, just pointing at
`profile-registry-ts/deployment/scripts.json` instead. The args differ because
the bytecode codeHash differs.

### Where each var is read in code

- `process.env.NEXT_PUBLIC_*` is statically inlined by Next.js into the client
  bundle **only when accessed via direct property syntax**. We read them once
  in `lib/registry/config.ts`:

  ```ts
  pick(process.env.NEXT_PUBLIC_USERNAME_TYPE_ARGS)
  ```

  and re-export them as typed objects (`usernameType`, `profileType`,
  `ckbJsVm`). All other modules import these objects, never the raw env vars.

- `lib/registry/scripts.ts` turns those objects into `ccc.Script` and
  `ccc.CellDep` instances that are attached to every transaction.

- `lib/registry/client.ts` reads `network` + `rpcUrl` to instantiate the right
  CCC client (`ClientPublicTestnet` / `ClientPublicMainnet` / a custom devnet
  client).

- `context/app-provider.tsx` uses `getClient()` from `client.ts` so the CCC
  `<Provider defaultClient>` reads from the exact same RPC + indexer as the
  registry hooks.

## Local development

```bash
# from spore-id/
copy .env.local.example .env.local      # PowerShell
# (or `cp` on macOS/Linux)

npm install
npm run dev
```

Open http://localhost:3000/onboard. Identity operations require all registry
vars in `.env.local` filled (see `.env.local.example`). If anything is missing,
`assertRegistryConfigured()` throws with a reminder to copy the example env.

Restart the dev server after changing `.env.local` — Next.js only inlines env
into the bundle at startup.

## Verifying everything on the testnet explorer

The testnet explorer is at https://testnet.explorer.nervos.org/

### Verify our contracts are deployed

The bytecode-cell tx hashes from `.env.local`:

| Script | Tx URL |
|---|---|
| Username bytecode | https://testnet.explorer.nervos.org/transaction/0x9c0eabe769dfee0bbe5ab1a64add968adc9ee9c030472a7fc858ad55edee352e |
| Profile bytecode | https://testnet.explorer.nervos.org/transaction/0x7f02c225b40cde6a2b005627fddd4529c3296e5b8a9d87d2a09b26810db443cd |
| ckb-js-vm | https://testnet.explorer.nervos.org/transaction/0x756fdaf0d1ba1d2e03dc13c71c967b24021bc054893a766ccee6879c468892d2 |

Each one shows an output cell containing the binary code (look at the cell
data — it's huge for the bytecode cells). That's the live, on-chain copy of
our scripts.

### Verify your username cell

After you claim a handle:

1. Click the wallet pill in the top-right of the app → copy your `ckt1...` address
2. Paste it into the explorer search
3. The top transaction in your address history is the claim. Click it.
4. In **Outputs**, find your username cell output (capacity depends on username
    length plus lock/type overhead — roughly 130+N CKB minimum). Expand it.

5. **Type Script** section should show:
   - `Code Hash: 0x3e9b6bead927bef62fcb56f0c79f4fbd1b739f32dd222beac10d346f2918bed7` (ckb-js-vm on testnet)
   - `Hash Type: type`
   - `Args: 0x00001de16f41679b27664325993128e00f0b727390ff59bda5a7595080c5b650e09c01`
6. **Data** field decodes to your raw username string (e.g. `0x6b61796c` =
   `"kayl"`).

### Verify your profile cell

Same flow, except:

- `Args: 0x0000cd3c5e49b241f16cfa6001e0f88918549d76f6160c529292128f91422b102e6201`
- **Data** is your profile JSON, hex-encoded. Paste it into any hex-to-text
  decoder and you'll see `{"name":"...","headline":"...",...}`.

### Verify ownership rules from a third party

Anyone can query your profile by handle without your wallet:

```bash
# (requires ckb-cli or curl against the RPC; or just visit /u/<name> in any browser)
curl https://testnet.explorer.nervos.org/transaction/<your-claim-tx-hash>
```

The cell's lock script is bound to *your* JoyID address. Nobody else can spend
it — that's standard CKB ownership.

---

## Testing the script rules

The two scripts enforce a small but precise set of rules. Here's how to
exercise each one and what you should see when it works (or refuses).

### What each script enforces — at a glance

| Rule | Username script | Profile script |
|---|---|---|
| Mint requires valid data | 3–32 ASCII chars, `[a-zA-Z0-9_]` | JSON with non-empty `name` ≤ 64 chars |
| Update requires same lock (no transfers) | ✅ | ✅ |
| Update requires same data (handle is immutable) | ✅ | ❌ — profile is mutable |
| Burn requires consuming the cell (and only the owner's lock can sign for it) | ✅ | ✅ |
| Only one cell of this type per tx group | ✅ | ✅ |

So **logically**, the difference is:

- **Username** = "your handle, frozen forever, only burnable". Like an ENS name. Stored as raw bytes.
- **Profile** = "your editable card, replaceable in place". Stored as JSON, can be updated as many times as you want.

Both are **non-transferable** — you can't send them to another wallet.
That's enforced by the lock-hash check in the update path.

### Test 1 — Mint (should work)

1. `/onboard` → connect → pick username → claim
2. Submit a profile → save
3. Both txs land within ~10s. ✅

If you see `Username must be 3–32 chars …` toast, the off-chain validator
caught it before the tx was built. If you see `InvalidUsername` (exit code
43) or `InvalidProfileData` (exit code 43) come back from the chain, the
script rejected the data.

### Test 2 — Update profile (should work)

1. `/me` → click Edit → change bio / add skill → save
2. JoyID popup → sign → toast "Profile updated"
3. The cell at `/u/<your-handle>` reflects the change

The script's update path requires `inLockHash == outLockHash` and re-runs
`validateProfileData(...)`. As long as you keep the same lock and pass
valid JSON, it accepts.

### Test 3 — Update username (should FAIL by design)

The script doesn't actually expose a "rename" path — there's no UI button
for it because the script will reject it with `UsernameChanged` (exit 44).

You can prove it manually if you're curious:

```ts
// In a quick scratch script — DO NOT add to the prod app.
// Build a tx that consumes the existing username cell and outputs a new
// one with different data. Send it. The chain will reject with exit code
// 44. That's the immutability guarantee.
```

If you want to actually rename, **burn then re-claim** is the only path:
release the cell, then claim a new one.

### Test 4 — Burn (should work)

1. `/me` → "Burn Username" / "Burn Profile" buttons
2. Sign → cell goes away → locked CKB returns to your wallet (minus fees)
3. Refreshing the page shows the empty state

The script's burn path is `hasIn0 && !hasOut0` and unconditionally returns
Success. Anyone can release their own cell at any time.

### Test 5 — Transfer (should FAIL by design)

Try this from a scratch script if you want hard evidence:

1. Take your existing username (or profile) cell as input
2. Output a new cell with the **same Type script** but a **different lock**
   (e.g. a friend's address)
3. Send it

The script will reject with `OwnershipChanged` (exit code 42) because
`inLockHash != outLockHash`. That's how non-transferability is enforced —
you can't even put a username under a multisig or escrow lock.

The frontend doesn't expose this because we never want to do it, but the
guarantee comes from the script, not from the UI.

### Test 6 — Cardinality (should FAIL by design)

If you tried to put two username cells in one tx (or one input + one
output in the wrong combination plus a third), the script rejects with
`InvalidCardinality` (exit 41). Useful as a defence-in-depth: even a
malicious dapp can't bundle multiple identity ops through the same script
in one transaction.

### Where the rules live in code

| Rule | Username script | Profile script |
|---|---|---|
| Format check | `isValidUsername()` lines 69–73 | `validateProfileData()` lines 67–87 |
| Mint path | `!hasIn0 && hasOut0` block | `!hasIn0 && hasOut0` block |
| Update path | lock + data equality | lock equality + JSON re-validation |
| Burn path | `hasIn0 && !hasOut0` | `hasIn0 && !hasOut0` |
| Cardinality | `if (hasIn1 \|\| hasOut1)` | `if (hasIn1 \|\| hasOut1)` |

### Running the contract test suites

Each contract has its own Vitest test that boots `ckb-testtool` (a
simulated CKB VM) and runs the script through every code path:

```bash
cd username-registry-ts
npm test            # runs tests/username-registry.test.ts

cd ../profile-registry-ts
npm test            # runs tests/profile-registry.test.ts
```

These tests are the canonical way to verify rule changes — they don't
need a network and they cover failure paths (invalid data, ownership
change, cardinality) that you can't easily reach from the UI.

---

## Cell capacity (the "insufficient CKB" thing)

Every CKB cell must hold enough CKB to cover its own bytes:

```
minCapacityCkb = 8                   // capacity field
               + 33 + lock.args      // lock script
               + 33 + type.args      // type script (≈ 68 for ckb-js-vm)
               + outputData.length   // your JSON / string
```

For our profile cell that comes out at roughly:

```
8 + 54 (JoyID lock) + 68 (ckb-js-vm + 35-byte args) + N (JSON bytes)
= 130 + N CKB
```

A bare profile (`{"name":"Alice"}`) needs ~145 CKB. A profile with bio,
headline and a handful of skills can easily exceed 250 CKB.

The frontend used to hardcode 200 CKB as the cell capacity — that's why
adding skills used to fail with `Insufficient CKB`. Now the capacity is
auto-computed by `lib/registry/capacity.ts → computeMinCellCapacity()`,
which uses the actual lock script of the connected wallet plus the actual
serialized data length. The profile form also shows a live "On-chain
Cost" meter so you can see the number climb as you fill in fields.

The CKB you put into the cell is **not spent** — it's locked into the
cell. If you ever burn the profile (or the username), it returns to your
wallet minus the small fee.

---

## Splitting the contracts into their own repos

> "Can I move `username-registry-ts` and `profile-registry-ts` into
> separate repositories? Will the on-chain hashes survive? What happens
> if I redeploy?"

### What the env vars actually depend on

| Env var | Depends on | Survives a repo move? |
|---|---|---|
| `NEXT_PUBLIC_CKB_JS_VM_*` | The pre-deployed ckb-js-vm cell on the network. Nothing to do with your repos. | Yes, always. |
| `NEXT_PUBLIC_USERNAME_TYPE_CODE_HASH` | Always equal to ckb-js-vm's code hash (every js-vm script shares it). | Yes. |
| `NEXT_PUBLIC_USERNAME_TYPE_ARGS` | Hash of your **bytecode cell** on chain — which is created when you `offckb deploy`. | **Only if you don't redeploy.** |
| `NEXT_PUBLIC_USERNAME_BYTECODE_TX_HASH` / `_INDEX` | The tx that uploaded your bytecode. Created at deploy time. | Same — only if you don't redeploy. |

Same for profile.

### Source code in repo A vs deployment in repo B

The on-chain identity of your contract is **the bytecode bytes that you
upload**. The tx hash and code hash are determined at the moment you push
those bytes to a CKB transaction with `offckb deploy`. They have no
connection to the source code's git location.

So:

- ✅ Move `username-registry-ts/` to its own repo → no effect on chain.
- ✅ Build it from a different machine → no effect, as long as the
  resulting `dist/index.bc` is byte-identical.
- ⚠ Run `offckb deploy` again, even from the same source → **a new cell
  is created with a new tx hash, and the bytecode codeHash changes if
  the bytes changed at all** (e.g. a new whitespace, a new lib version,
  a recompile with different optimizer settings).

When the bytecode codeHash changes, your **type script `args` change**,
which means every cell minted under the *old* args is still on chain
under the old script — and your frontend (using the new env vars) won't
see them. They become orphans.

### What `deployment/scripts.json` is for

The `deployment/` folder under each contract is the **source of truth**
for "what's actually deployed". It's a JSON file like:

```json
{
  "testnet": {
    "index.bc": {
      "codeHash": "0x1de16f41...",
      "hashType": "type",
      "cellDeps": [
        {
          "cellDep": {
            "outPoint": {
              "txHash": "0x9c0eabe7...",
              "index": 0
            },
            "depType": "code"
          }
        }
      ]
    }
  }
}
```

If you split repos, **commit `deployment/scripts.json` in each contract
repo** so anyone (including future you) can wire up `.env.local` from a
single file. The frontend just needs the values inside, not the source.

### A safe split workflow

1. Do this **after** you have a stable testnet (or mainnet) deployment.
2. `git mv username-registry-ts ../username-registry` (or similar) →
   commit in the new repo.
3. **Keep `deployment/scripts.json` in the new repo.** This is the only
   file the frontend actually depends on.
4. In the frontend repo, your `.env.local` doesn't move — the values are
   already pinned to the deployed cell. The contract source can live
   anywhere.
5. If you ever need to update the script (bug fix, new rule), you have
   two options:

   - **Breaking redeploy** (cleanest): `offckb deploy` → new bytecode
     codeHash → new args → update env vars → users with old cells need
     to burn + re-claim. Best for v0.x.
   - **Type-ID upgrade** (no breakage): deploy the bytecode cell with a
     Type-ID Type script so the codeHash stays stable across versions.
     The args don't change and old cells keep working under the new
     code. Requires changing how `offckb deploy` is invoked. Best for
     production.

### TL;DR for your situation

- **Move the contracts to separate repos any time** — no chain effect.
- **Keep `deployment/scripts.json` in each contract repo.** That file is
  the bridge between contract source and frontend env.
- **Don't redeploy unless you mean to** — every `offckb deploy` creates
  a fresh on-chain cell. The args change, the env vars change, and old
  cells get orphaned. If you must redeploy, follow with a fresh
  `.env.local` and ideally a "migration" UI hint for users.
- **For production-grade upgrades**, use Type-ID for the bytecode cell
  so the codeHash is stable across deploys.

---

## The full flow, end to end

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  /onboard    │     │  /me         │     │  /u/<username>  │
│  3-step      │ ──► │  dashboard   │ ◄── │  public profile │
│  wizard      │     │  (edit/burn) │     │  (no wallet)    │
└──────────────┘     └──────────────┘     └─────────────────┘
       │                    │                       │
       │ uses               │ uses                  │ uses
       ▼                    ▼                       ▼
  useUsername          useProfile            usePublicProfile
  useProfile                                       │
       │                    │                       │
       └──────┬─────────────┴───────────────────────┘
              ▼
     lib/registry/{username,profile}.ts
              │
              ▼
   ┌──────────────────────────┐
   │  CCC                     │
   │  ┌─────────┐  ┌────────┐ │
   │  │ Signer  │  │ Client │ │
   │  └────┬────┘  └────┬───┘ │
   │       │            │     │
   └───────┼────────────┼─────┘
           │            │
           ▼            ▼
   JoyID popup     CKB testnet RPC
   (signs tx)      (reads cells)
           │            │
           └─────┬──────┘
                 ▼
            CKB testnet
            (where username + profile cells live)
```

---

## Configuration requirement

The app is **on-chain only**. All `NEXT_PUBLIC_USERNAME_*`,
`NEXT_PUBLIC_PROFILE_*`, and `NEXT_PUBLIC_CKB_JS_VM_*` values in `.env.local`
must be populated (see `.env.local.example` and your `deployment/scripts.json`
from `offckb deploy`).

`lib/registry/config.ts` exports `registryConfigured()` and
`assertRegistryConfigured()`. Both `getClient()` and the script builders call
`assertRegistryConfigured()` — if the env isn't complete, wallet + registry
actions throw with instructions to copy `.env.local.example`.

### localStorage in DevTools

Username and profile records are **never** written to browser storage by our
code. You may still see `localStorage` entries from **CCC** (wallet connector
session). That is expected and unrelated to your blockchain identity.

Old `spore-id:registry:*` keys from older builds can be cleared manually —
they're no longer read.

### Verifying reads are on-chain

1. Fresh incognito with no connector session → `/u/<handle>` loads from the indexer.
2. DevTools Network → RPC `POST`s (e.g. `get_cells`, `dry_run_transfer`, etc.)

---

### Username uniqueness is enforced *off-chain*

The Type script accepts a username mint as long as the data is well-formed
(3–32 chars, ASCII, alphanumeric+underscore). It does **not** prevent two
different users from minting cells with the same string — that would require
either a global registry cell or an aggregated UDT-style lookup, both heavier
designs.

What the app does instead: before sending the claim transaction we run
`findUsernameCellByName(name)` against the indexer. If any cell already exists
with that data and a different lock, we throw `@<name> is already taken.` and
the transaction is never built.

That's strong enough for a v1 demo (the indexer is the same source of truth a
malicious dapp would have to bypass), but for production you'd want one of:

- A "global names" cell using Type ID, where claims update an SMT root
- A UDT-style aggregated index updated by every claim
- A small backend that watches the chain and serves a canonical name → owner mapping

### Roadmap

- [ ] Avatar / badge / project Spore picker on `/me` (wires `avatarSporeId` etc.)
- [ ] Endorsements cell (others can attest to your skills)
- [ ] Handbook progress cells (8-week curriculum tracker)
- [ ] Devnet-only "claim with raw private key" testing helper
- [ ] On-chain global uniqueness (one of the three options above)
