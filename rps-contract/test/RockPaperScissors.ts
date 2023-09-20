import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RockPaperScissors", function () {
  const unit = 500;
  const stakes = ethers.parseEther(unit + "");
  const bankerSalt = Math.round(Math.random() * 2 ** 20);
  const bankerThrowType = 0;
  const playerSalt = Math.round(Math.random() * 2 ** 20);
  const playerThrowType = 1;

  async function deployRockPaperScissorsFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, judge, banker, player] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy();

    const RockPaperScissors = await ethers.getContractFactory(
      "RockPaperScissors"
    );
    const rockPaperScissors = await RockPaperScissors.deploy(
      mockToken.target,
      judge.address
    );

    await mockToken.connect(banker).faucet();
    await mockToken.connect(player).faucet();

    // 1. banker setup the game
    await mockToken.connect(banker).approve(rockPaperScissors.target, stakes);
    const bankerHash = ethers.solidityPackedKeccak256(
      ["address", "uint8", "uint"],
      [banker.address, bankerThrowType, bankerSalt]
    );
    await rockPaperScissors.connect(banker).newGame(bankerHash, stakes);

    // 2. player match the game
    const id = await rockPaperScissors.allGames(0);
    await mockToken.connect(player).approve(rockPaperScissors.target, stakes);
    const playerHash = ethers.solidityPackedKeccak256(
      ["address", "uint8", "uint"],
      [player.address, playerThrowType, playerSalt]
    );
    await rockPaperScissors.connect(player).matchGame(playerHash, id);

    return {
      rockPaperScissors,
      mockToken,
      owner,
      judge,
      banker,
      player,
    };
  }

  describe("Deployment", function () {
    it("Should set the right judge", async function () {
      const { rockPaperScissors, mockToken, owner, judge } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.judge()).to.equal(judge.address);
    });

    it("Should set the right owner", async function () {
      const { rockPaperScissors, mockToken, owner, judge } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.owner()).to.equal(owner.address);
    });

    it("Should set the right token", async function () {
      const { rockPaperScissors, mockToken, owner, judge } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.token()).to.equal(mockToken.target);
    });

    it("Should set the right token amount", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker, player } =
        await loadFixture(deployRockPaperScissorsFixture);

      expect(await mockToken.balanceOf(rockPaperScissors)).to.equal(
        ethers.parseEther(unit * 2 + "")
      );
    });
  });

  describe("Game", function () {
    it("Should create the hash by contract", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker } =
        await loadFixture(deployRockPaperScissorsFixture);

      const salt = Math.round(Date.now() / 1000);
      const throwType = 0;

      const hash = await rockPaperScissors
        .connect(banker)
        .encodeThrowHash(throwType, salt);
      expect(
        await rockPaperScissors.verifyThrowHash(hash, banker, salt)
      ).to.equals(throwType);
    });

    it("Should create the hash by library", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker } =
        await loadFixture(deployRockPaperScissorsFixture);

      const salt = Math.round(Date.now() / 1000);
      const throwType = 0;

      const hash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [banker.address, throwType, salt]
      );
      expect(
        await rockPaperScissors.verifyThrowHash(hash, banker, salt)
      ).to.be.equal(throwType);
    });

    it("Rock should win scissor", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.duel(0, 2)).to.equal(0);
    });

    it("Rock should not win paper", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.duel(0, 1)).to.equal(1);
    });

    it("Scissor should win paper", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.duel(2, 1)).to.equal(0);
    });

    it("Scissor should not win rock", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.duel(2, 0)).to.equal(1);
    });

    it("Paper should win rock", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.duel(1, 0)).to.equal(0);
    });

    it("Paper should not win scissor", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );

      expect(await rockPaperScissors.duel(1, 2)).to.equal(1);
    });

    it("Should deuce", async function () {
      const { rockPaperScissors } = await loadFixture(
        deployRockPaperScissorsFixture
      );
      expect(await rockPaperScissors.duel(0, 0)).to.equal(2);
      expect(await rockPaperScissors.duel(1, 1)).to.equal(2);
      expect(await rockPaperScissors.duel(2, 2)).to.equal(2);
    });

    it("Should banker setup the game", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker, player } =
        await loadFixture(deployRockPaperScissorsFixture);

      const hash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [banker.address, bankerThrowType, bankerSalt]
      );

      const id = 1;
      const gameInfo = await rockPaperScissors.games(id);
      expect(gameInfo.banker).to.equal(banker.address);
      expect(gameInfo.bankerThrowHash).to.equal(hash);
      expect(gameInfo.stakes).to.equal(stakes);
    });

    it("Should player match the game", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker, player } =
        await loadFixture(deployRockPaperScissorsFixture);

      const playerHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [player.address, playerThrowType, playerSalt]
      );

      const id = 1;
      const gameInfo = await rockPaperScissors.games(id);
      expect(gameInfo.player).to.equal(player.address);
      expect(gameInfo.playerThrowHash).to.equal(playerHash);
    });

    it("Should judge showdown the result", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker, player } =
        await loadFixture(deployRockPaperScissorsFixture);

      const id = 1;
      await rockPaperScissors
        .connect(judge)
        .showdown(id, bankerSalt, playerSalt);
      const length = await rockPaperScissors.allGameLength();
      expect(length).to.equal(0);

      const originalSupply = await mockToken.ONE_UNIT();
      const fee = ethers.parseEther((unit * 3) / 1000 + "");

      const ownerBalance = await mockToken.balanceOf(owner);
      expect(ownerBalance, "owner balance").to.equal(originalSupply + fee);

      const bankerBalance = await mockToken.balanceOf(banker);
      expect(bankerBalance, "banker balance").to.equal(originalSupply - stakes);

      const playerBalance = await mockToken.balanceOf(player);
      expect(playerBalance, "player balance").to.equal(
        originalSupply + stakes - fee
      );
    });

    it("Should deuce", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker, player } =
        await loadFixture(deployRockPaperScissorsFixture);

      const bankerBalance = await mockToken.balanceOf(banker);
      const playerBalance = await mockToken.balanceOf(player);

      const throwType = 0;
      // 1. banker setup the game
      await mockToken.connect(banker).approve(rockPaperScissors.target, stakes);
      const bankerHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [banker.address, throwType, bankerSalt]
      );
      await rockPaperScissors.connect(banker).newGame(bankerHash, stakes);

      // 2. player match the game
      const id = 2;
      await mockToken.connect(player).approve(rockPaperScissors.target, stakes);
      const playerHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [player.address, throwType, playerSalt]
      );
      await rockPaperScissors.connect(player).matchGame(playerHash, id);

      // 3. judge showdown the result
      await rockPaperScissors
        .connect(judge)
        .showdown(id, bankerSalt, playerSalt);

      const originalSupply = await mockToken.ONE_UNIT();

      const ownerBalance = await mockToken.balanceOf(owner);
      expect(ownerBalance, "owner balance").to.equal(originalSupply);
      expect(await mockToken.balanceOf(banker), "banker balance").to.equal(
        bankerBalance
      );
      expect(await mockToken.balanceOf(player), "player balance").to.equal(
        playerBalance
      );
    });
  });

  describe("Event", function () {
    it("Should emit event", async function () {
      const { rockPaperScissors, mockToken, owner, judge, banker, player } =
        await loadFixture(deployRockPaperScissorsFixture);

      await mockToken.connect(banker).approve(rockPaperScissors.target, stakes);
      const bankerHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [banker.address, bankerThrowType, bankerSalt]
      );

      const id = 2;
      await expect(
        await rockPaperScissors.connect(banker).newGame(bankerHash, stakes),
        "GameSetup event"
      )
        .to.emit(rockPaperScissors, "GameSetup")
        .withArgs(banker.address, bankerHash, stakes, id);

      await mockToken.connect(player).approve(rockPaperScissors.target, stakes);
      const playerHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint"],
        [player.address, playerThrowType, playerSalt]
      );

      await expect(
        await rockPaperScissors.connect(player).matchGame(playerHash, id),
        "GameMatched event"
      )
        .to.emit(rockPaperScissors, "GameMatched")
        .withArgs(player.address, playerHash, id);

      await expect(
        await rockPaperScissors
          .connect(judge)
          .showdown(id, bankerSalt, playerSalt),
        "GameResult event"
      )
        .to.emit(rockPaperScissors, "GameResult")
        .withArgs(player.address, bankerSalt, playerSalt, id);
    });
  });
});
