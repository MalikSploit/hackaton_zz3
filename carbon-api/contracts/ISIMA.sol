pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ISIMA is ERC20, Ownable {
    constructor() ERC20("ISIMA Token", "ISIMA") Ownable(msg.sender) {}
    function mint(uint256 amount) external { _mint(msg.sender, amount); }
    function ownerMint(address to, uint256 amount) external onlyOwner { _mint(to, amount); }
}