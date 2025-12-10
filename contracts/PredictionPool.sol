// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

contract PredictionPool is VRFConsumerBaseV2 {
    // --- Chainlink VRF config (Sepolia) ---
    // Coordinator & keyHash are fixed for Sepolia VRF v2
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    address public immutable owner;
    uint256 public immutable subscriptionId;

    bytes32 public immutable keyHash;
    uint32 public callbackGasLimit = 250000;
    uint16 public requestConfirmations = 3;
    uint32 public numRandomWords = 1;

    // --- Game config ---
    uint256 public entryFee = 0.01 ether;
    uint256 public platformFeePercent = 5; // 5%
    uint256 public maxPlayers = 20;

    // --- Rounds ---
    uint256 public currentRoundId;
    uint256 public lastCompletedRoundId;

    struct Round {
        address[] players;
        bool isOpen;
        bool fulfilled;
        uint256 pool;
        address winner;
        uint256 prize;
    }

    mapping(uint256 => Round) private rounds;
    mapping(uint256 => uint256) private requestIdToRoundId;

    // --- Events ---
    event RoundOpened(uint256 indexed roundId);
    event RoundEntered(uint256 indexed roundId, address indexed player);
    event RoundClosed(uint256 indexed roundId, uint256 requestId);
    event RoundWinner(uint256 indexed roundId, address indexed winner, uint256 prize);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(uint256 _subscriptionId)
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625) // Sepolia VRF v2 coordinator
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
        );
        keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
        subscriptionId = _subscriptionId;
        owner = msg.sender;

        currentRoundId = 1;
        rounds[currentRoundId].isOpen = true;
        emit RoundOpened(currentRoundId);
    }

    // --- Player API ---

    /// @notice Enter the current round by paying exactly entryFee.
    function enterRound() external payable {
        Round storage r = rounds[currentRoundId];
        require(r.isOpen, "Round closed");
        require(msg.value == entryFee, "Invalid entry fee");

        r.players.push(msg.sender);
        r.pool += msg.value;

        emit RoundEntered(currentRoundId, msg.sender);

        if (r.players.length >= maxPlayers) {
            _closeAndRequestWinner(currentRoundId);
        }
    }

    // --- Internal: close round & request randomness ---

    function _closeAndRequestWinner(uint256 roundId) internal {
        Round storage r = rounds[roundId];
        require(r.isOpen, "Already closed");
        require(r.players.length > 0, "No players");

        r.isOpen = false;

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            uint64(subscriptionId),
            requestConfirmations,
            callbackGasLimit,
            numRandomWords
        );

        requestIdToRoundId[requestId] = roundId;

        emit RoundClosed(roundId, requestId);
    }

    // --- VRF callback ---

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 roundId = requestIdToRoundId[requestId];
        Round storage r = rounds[roundId];

        require(!r.fulfilled, "Already fulfilled");
        require(!r.isOpen, "Round still open");
        require(r.players.length > 0, "No players");

        uint256 winnerIndex = randomWords[0] % r.players.length;
        address winner = r.players[winnerIndex];

        uint256 pool = r.pool;
        uint256 fee = (pool * platformFeePercent) / 100;
        uint256 prize = pool - fee;

        r.fulfilled = true;
        r.winner = winner;
        r.prize = prize;
        lastCompletedRoundId = roundId;

        // Effects already done, now interactions
        (bool feeOk, ) = owner.call{value: fee}("");
        require(feeOk, "Fee transfer failed");

        (bool prizeOk, ) = winner.call{value: prize}("");
        require(prizeOk, "Prize transfer failed");

        emit RoundWinner(roundId, winner, prize);

        // Start next round
        currentRoundId += 1;
        rounds[currentRoundId].isOpen = true;
        emit RoundOpened(currentRoundId);
    }

    // --- Admin config (owner only) ---

    function setEntryFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Fee > 0");
        entryFee = newFee;
    }

    function setMaxPlayers(uint256 newMax) external onlyOwner {
        require(newMax > 1, "Min 2 players");
        maxPlayers = newMax;
    }

    function setPlatformFeePercent(uint256 newPercent) external onlyOwner {
        require(newPercent <= 20, "Fee too high");
        platformFeePercent = newPercent;
    }

    function setCallbackGasLimit(uint32 newLimit) external onlyOwner {
        callbackGasLimit = newLimit;
    }

    function setRequestConfirmations(uint16 newConfirmations) external onlyOwner {
        requestConfirmations = newConfirmations;
    }

    // --- View helpers for frontend ---

    function getCurrentRoundInfo()
        external
        view
        returns (
            uint256 roundId,
            bool isOpen,
            uint256 playerCount,
            uint256 pool
        )
    {
        Round storage r = rounds[currentRoundId];
        return (currentRoundId, r.isOpen, r.players.length, r.pool);
    }

    function getRoundInfo(uint256 roundId)
        external
        view
        returns (
            bool isOpen,
            bool fulfilled,
            uint256 playerCount,
            uint256 pool,
            address winner,
            uint256 prize
        )
    {
        Round storage r = rounds[roundId];
        return (r.isOpen, r.fulfilled, r.players.length, r.pool, r.winner, r.prize);
    }

    // Rescue ETH accidentally sent directly to contract (not part of pools).
    function rescueEth(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient");
        (bool ok, ) = owner.call{value: amount}("");
        require(ok, "Rescue failed");
    }

    receive() external payable {
        // Allow receiving ETH (e.g., manual funding). Not part of any pool.
    }
}