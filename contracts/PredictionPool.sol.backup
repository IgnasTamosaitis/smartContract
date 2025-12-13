// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract PredictionPool is VRFConsumerBaseV2Plus {
    // --- Chainlink VRF config (Sepolia) ---
    // Coordinator & keyHash are fixed for Sepolia VRF v2.5
    IVRFCoordinatorV2Plus private immutable COORDINATOR;
    address public immutable contractOwner;
    uint256 public immutable subscriptionId;

    bytes32 public immutable keyHash;
    uint32 public callbackGasLimit = 40000; // Absolute minimum
    uint16 public requestConfirmations = 3;
    uint32 public numRandomWords = 1;

    // --- Game config ---
    uint256 public entryFee = 0.001 ether; // Reduced to 0.001 ETH for testing
    uint256 public platformFeePercent = 5; // 5%
    uint256 public maxPlayers = 2; // Changed to 2 for easy testing

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

    constructor(uint256 _subscriptionId)
        VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) // Sepolia VRF v2.5 coordinator
    {
        COORDINATOR = IVRFCoordinatorV2Plus(
            0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
        );
        keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae; // v2.5 key hash (500 gwei)
        subscriptionId = _subscriptionId;
        contractOwner = msg.sender;

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

        // Request randomness FIRST - if this fails, the whole transaction reverts
        // and round stays open
        uint256 requestId = COORDINATOR.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numRandomWords,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false})) // Back to LINK with minimal gas
            })
        );

        // Only close round if VRF request succeeded
        r.isOpen = false;
        requestIdToRoundId[requestId] = roundId;

        emit RoundClosed(roundId, requestId);
    }

    // --- VRF callback ---

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
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
        (bool feeOk, ) = contractOwner.call{value: fee}("");
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

    /// @notice Emergency function: Open a new round if current is stuck
    function openNewRound() external onlyOwner {
        currentRoundId += 1;
        rounds[currentRoundId].isOpen = true;
        emit RoundOpened(currentRoundId);
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
    function rescueFunds(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient");
        (bool ok, ) = contractOwner.call{value: amount}("");
        require(ok, "Rescue failed");
    }

    receive() external payable {
        // Allow receiving ETH (e.g., manual funding). Not part of any pool.
    }
}