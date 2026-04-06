# TrustVault

> Confidential Trust Infrastructure for Web3 -- powered by Inco Lightning

**Live Demo:** https://trust-vault-steel.vercel.app
**Contract:** `0xaa3Ae25eBac250Ff67F4d9e3195C4C7610055067` on Base Sepolia
**Verified:** https://sepolia.basescan.org/address/0xaa3ae25ebac250ff67f4d9e3195c4c7610055067

---

## What is TrustVault?

TrustVault is a demo dApp that computes confidential trust scores for Ethereum wallets. It pulls attestation data from the Intuition Protocol's knowledge graph -- 16,445 addresses and 16,996 attestations stored in Neo4j Aura -- and runs EigenTrust and AgentRank algorithms against the graph to produce a composite trust score for any queried address.

The scoring engine uses a 70/30 hybrid model: 70% weight from the Intuition graph (EigenTrust propagation, AgentRank influence, transitive trust paths) and 30% from real Base Sepolia on-chain activity (transaction count, balance, wallet age). This gives a more complete picture than graph data alone.

The key differentiator is what happens after scoring. Instead of exposing the raw trust score on-chain, TrustVault encrypts it using Inco Lightning's FHE coprocessor and stores it as a `euint256` in the ConfidentialTrustVault contract. The score is verifiable but private -- only authorized wallets can decrypt it. This makes trust scores usable in access control, gating, and reputation systems without leaking the underlying data.

## Architecture

See the [Architecture page](https://trust-vault-steel.vercel.app/architecture) for the interactive visual breakdown, or read [ARCHITECTURE.md](./ARCHITECTURE.md) for the technical deep-dive.

The system has five layers:

1. **Data Sources** -- Intuition Protocol graph (Neo4j Aura, 16,445 addresses, 16,996 attestations) and Base Sepolia RPC for on-chain activity data
2. **Scoring Engine** -- EigenTrust iterative convergence + AgentRank (PageRank for attestations), combined as a 70/30 hybrid with on-chain activity scoring and sybil risk classification
3. **MCP Transport** -- Trust MCP server at `mcp-trust.intuition.box`, connected via SSE transport, proxied through `/api/trust-score` to handle CORS and add the hybrid scoring layer
4. **FHE Contract** -- `ConfidentialTrustVault.sol` deployed on Inco Lightning (Base Sepolia), encrypts trust scores as `euint256` using the Inco FHE coprocessor, with encrypted threshold comparisons for access control
5. **Frontend** -- Next.js 14 App Router with wagmi v2, @inco/js for client-side encryption, ConnectKit for wallet connection, and a demo mode with preloaded high-scoring addresses

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Wallet | wagmi v2, viem v2, ConnectKit |
| FHE | Inco Lightning (@inco/js) |
| Graph DB | Neo4j Aura |
| Trust Algorithms | EigenTrust, AgentRank |
| Attestations | Intuition Protocol |
| Transport | MCP (SSE) |
| Deployment | Vercel + Base Sepolia |

## Smart Contract

- **Name:** ConfidentialTrustVault
- **Address:** `0xaa3Ae25eBac250Ff67F4d9e3195C4C7610055067`
- **Network:** Base Sepolia (chainId 84532)
- **Encrypted type:** `euint256` via Inco Lightning FHE coprocessor

Key functions:

| Function | Description |
|----------|-------------|
| `storeEncryptedScore(bytes)` | Accepts FHE-encrypted score bytes, stores as `euint256`, grants caller decrypt access |
| `checkAccess()` | Compares caller's encrypted score against encrypted threshold (`score >= threshold`), stores boolean result |
| `updateThreshold(bytes)` | Owner-only: updates the encrypted access threshold |
| `getEncryptedScore(address)` | Returns the encrypted score handle for re-encryption via @inco/js |
| `allowScoreAccess(address)` | Caller grants themselves decrypt permission on their own score |

## Local Development

```bash
git clone https://github.com/rudazy/TrustVault.git
cd TrustVault
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it running.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID from cloud.walletconnect.com |

The contract address, chain ID, and MCP URL are hardcoded in `src/constants/index.ts` since they don't change between environments.

## How It Works

The query lifecycle, step by step:

1. **Enter Address** -- User inputs an Ethereum address (or picks one from the demo gallery of preloaded high-scoring addresses)
2. **Graph Lookup** -- The `/api/trust-score` proxy opens an SSE connection to the Trust MCP server at `mcp-trust.intuition.box`, performs the MCP handshake, and calls `compute_composite_score`. Simultaneously, it queries Base Sepolia RPC for the address's transaction count and ETH balance.
3. **Score Computed** -- EigenTrust propagates trust weights across the attestation graph. AgentRank scores network influence. The API combines these (70% graph, 30% on-chain activity) into a hybrid score with sybil risk classification.
4. **MCP Response** -- The proxy returns the composite score, individual algorithm scores, trust factor breakdown, confidence level, and sybil risk flag to the frontend.
5. **FHE Encryption** -- If the user connects their wallet, they can encrypt the trust score client-side using @inco/js and store it on-chain via `storeEncryptedScore()`. The score lives as a `euint256` in the contract, decryptable only by the wallet that stored it.

## Built By

- Ludarep -- [@rudazy](https://github.com/rudazy) / [@Ludarep](https://x.com/Ludarep)
- Nald -- [@0xnald](https://x.com/0xnald)
