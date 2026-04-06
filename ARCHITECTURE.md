# TrustVault Architecture

## Overview

TrustVault computes trust scores by combining two data sources: the Intuition Protocol's attestation graph and real Base Sepolia on-chain activity. Scores are encrypted using Fully Homomorphic Encryption (FHE) via Inco Lightning before being stored on-chain. This means a wallet's trust score is verifiable -- it exists on-chain and can be compared against thresholds -- but the actual numeric value stays private.

The system runs as a Next.js application with a server-side API proxy that handles the MCP transport layer and hybrid scoring logic. The frontend handles wallet connection, client-side FHE encryption, and contract interaction.

## EigenTrust Algorithm

The Trust MCP server runs EigenTrust over the Intuition attestation graph stored in Neo4j Aura (16,445 addresses, 16,996 attestations). EigenTrust is an iterative algorithm originally designed for P2P networks (Kamvar et al., 2003). It starts with a set of pre-trusted peers and propagates trust through the graph until convergence. Each iteration updates every node's trust score based on the weighted trust scores of the nodes that have attested to it.

The key properties: it converges to a unique global trust vector regardless of initial conditions (given pre-trusted peers), and it naturally dampens the influence of sybil clusters because fake identities that only attest to each other can't accumulate trust from the honest part of the graph.

## AgentRank

AgentRank adapts PageRank for attestation networks. Instead of web pages and hyperlinks, it operates on addresses and attestations. Each attestation is a directed edge carrying weight. The algorithm applies a damping factor (typically 0.85) -- at each step, there's an 85% chance of following an attestation edge and a 15% chance of jumping to a random node. This prevents trust from pooling in dead-end clusters and gives every node a baseline score proportional to its position in the network.

The MCP server returns both raw and normalized AgentRank scores alongside the EigenTrust output.

## Hybrid Scoring (70/30)

The API proxy at `/api/trust-score` combines the two data sources with fixed weights:

- **70% Intuition graph** -- The composite score from the MCP server, which itself blends EigenTrust and AgentRank with transitive trust path analysis
- **30% Base Sepolia activity** -- On-chain signals queried directly from the Base Sepolia RPC: transaction count (up to 50 points based on thresholds at 1, 10, 50, and 100 transactions) and ETH balance presence (10 points)

When the Intuition graph has no data for an address but on-chain activity exists, the system falls back to activity-only scoring. When neither source has data, the score is 0 with a "High" sybil risk flag.

Sybil risk classification uses both the composite score and the address's EigenTrust rank percentile within the graph.

## MCP Transport

Communication with the Trust MCP server (`mcp-trust.intuition.box`) uses the Model Context Protocol over Server-Sent Events (SSE). The API proxy handles the full MCP lifecycle: opening an SSE stream, receiving the session endpoint, completing the `initialize` handshake, sending `notifications/initialized`, then calling `compute_composite_score` with the target address. The proxy parses the SSE stream manually, matching JSON-RPC response IDs to requests.

A 20-second timeout guards against the MCP server being unreachable. On failure, the frontend falls back to deterministic mock data derived from the address hash and shows a fallback banner.

## FHE Encryption Flow

Client-side encryption uses `@inco/js` (Inco Lightning SDK). When a user stores their trust score:

1. The frontend initializes a Lightning client configured for Base Sepolia with Inco's testnet deployment
2. The score is encrypted client-side using `lightning.encrypt()` with `handleType: 8` (euint256), bound to the user's address and the contract address
3. The encrypted bytes are sent to `storeEncryptedScore()` on the contract, along with the Inco FHE fee (queried on-chain from the Lightning executor)
4. The contract stores the encrypted handle and grants the caller decrypt permission via `score.allow(msg.sender)`

All FHE operations happen inside the Inco coprocessor -- the Base Sepolia contract never sees plaintext values.

## Contract Design

`ConfidentialTrustVault.sol` uses Inco Lightning's encrypted types (`euint256`, `ebool`) for all sensitive data. The contract stores one encrypted score per address and an encrypted access threshold (default: 50, set by the owner).

The `checkAccess()` function performs an encrypted comparison (`score >= threshold`) that produces an `ebool` result. Both operands stay encrypted during the comparison -- the contract never decrypts either value. The boolean result is stored publicly so the frontend can read access status without a decrypt call.

Access control is handled through Inco's permission system: `score.allow(msg.sender)` grants decrypt access, and `score.allowThis()` lets the contract itself operate on the ciphertext for threshold checks.

## Limitations and Future Work

- The `checkAccess()` boolean is currently written optimistically pending Inco's production decrypt callback mechanism
- The 70/30 weighting is fixed -- a future version could make it configurable per-vault or per-use-case
- Trust scores are point-in-time snapshots; there's no automatic refresh when the underlying graph changes
- The demo runs on Base Sepolia testnet; mainnet deployment would need gas optimization and a production Inco deployment
- The MCP server is operated by the Intuition team -- self-hosting the graph and scoring engine would remove the external dependency
