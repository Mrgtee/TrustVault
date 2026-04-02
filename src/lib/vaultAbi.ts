export const VAULT_ABI = [
  {
    name: "storeEncryptedScore",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "scoreInput", type: "bytes" }],
    outputs: [],
  },
  {
    name: "checkAccess",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "hasScore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "accessGranted",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "ScoreEncrypted",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "AccessChecked",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "granted", type: "bool", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
