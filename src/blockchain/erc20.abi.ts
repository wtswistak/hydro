// ERC20_ABI is a list of function signatures that define the interface
// for an ERC-20 token contract. These signatures are used by the blockchain
// to identify and call the functions in the contract - instructions for the blockchain

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint amount) returns (bool)',
  // Transfer event is emitted when a transfer of tokens occurs
  'event Transfer(address indexed from, address indexed to, uint amount)',
]; 
