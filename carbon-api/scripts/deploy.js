const hre = require('hardhat');

async function main() {
    const ISIMA = await hre.ethers.getContractFactory('ISIMA');
    const token = await ISIMA.deploy();
    await token.deployed();
    console.log('ISIMA deployed to:', token.address);
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });