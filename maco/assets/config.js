/* ===== MACO Rush config — fill these in when the chain + edge function are ready ===== */
window.CONFIG={
  CHAIN_ID:0,                 // EVM chain ID MACO lives on (0 = don't force a network switch)
  CHAIN_NAME:'',              // e.g. 'Robinhood Chain'  (only used if the wallet must add the network)
  RPC_URL:'',                 // public RPC for that chain
  EXPLORER:'',                // block explorer base URL, e.g. https://explorer.example.com
  MACO_ADDRESS:'0x6ffb075F8030C6eA7914c1BA90A8CF87c9A8686d',
  MACO_SYMBOL:'MACO',
  MACO_DECIMALS:null,         // null = read from the token contract
  TREASURY:'',                // wallet that receives MACO payments (empty = DEMO mode, nothing is sent)
  API_BASE:'',                // your edge function base URL (empty = DEMO mode, data stays in this browser)
  WC_PROJECT_ID:'0e4440427e13366503359ee54e3e2b0e',           // WalletConnect Project ID (free at dashboard.reown.com). Paste it here, or enter it once on connect.html
  FREE_SECONDS:300,           // free play time for every new wallet
  BUY_URL:'https://ponsfamily.com/launchpad/0x6ffb075f8030c6ea7914c1ba90a8cf87c9a8686d'
};
