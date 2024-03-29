import { ethers } from "hardhat";

async function main() {
  const [owner, judge] = await ethers.getSigners();
  console.log(`Contract owner: ${owner.address}`);
  console.log(`Game judge: ${judge.address}`);

  const mockToken = await ethers.deployContract("MockToken");
  await mockToken.waitForDeployment();

  const rockPaperScissors = await ethers.deployContract("RockPaperScissors", [
    mockToken.target,
    judge,
  ]);

  await rockPaperScissors.waitForDeployment();

  console.log(`RockPaperScissors contract address: ${rockPaperScissors.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
