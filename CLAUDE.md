# TrustVault — Claude Code Context

## Project
Confidential Trust Infrastructure demo dApp built on Inco Lightning (Base Sepolia).

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- wagmi v2, viem v2, ConnectKit
- @inco/js (Inco Lightning JS SDK)
- shadcn/ui, lucide-react

## Location
C:\Users\RIKI\TrustVault

## Deployed Contract
- Name: ConfidentialTrustVault
- Address: 0xaa3Ae25eBac250Ff67F4d9e3195C4C7610055067
- Network: Base Sepolia (chainId 84532)
- RPC: https://sepolia.base.org

## Key URLs
- Trust MCP proxy: /api/trust-score (proxies to mcp-trust.intuition.box)
- WalletConnect Project ID: in .env.local

## Current Status (update after each step)
- Step 1 ✅ Project foundation
- Step 2 ✅ Navbar + Footer  
- Step 3 ✅ Hero landing page
- Step 4 ✅ Query results page
- Step 5 ✅ MCP proxy + mock fallback
- Step 6 ✅ Smart contract compiled
- Step 7 ✅ Contract deployed to Base Sepolia
- Step 8 ✅ Inco Lightning client initialization fixed

## Rules
- Never start fresh — always read existing files first
- No git commits — Ludarep pushes manually
- No AI attribution in code or comments
- Production grade code only, no placeholder logic
- Run npm run dev after every change to verify zero errors