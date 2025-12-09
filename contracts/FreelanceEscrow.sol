// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreelanceEscrow is ReentrancyGuard, Ownable {
    enum ProjectStatus { Created, Funded, InProgress, Disputed, Completed, Cancelled }

    struct Project {
        address client;
        address freelancer;
        uint256 amount;
        uint256 deadline;
        ProjectStatus status;
        string description;
        uint256 createdAt;
    }

    struct Dispute {
        string clientReason;
        string freelancerReason;
        bool clientVoted;
        bool freelancerVoted;
        bool resolved;
    }

    uint256 private _projectCounter;
    uint256 private _platformFeePercent;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) private clientProjects;
    mapping(address => uint256[]) private freelancerProjects;

    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 amount, uint256 deadline, string description);
    event ProjectFunded(uint256 indexed projectId, address indexed client, uint256 amount);
    event ProjectStarted(uint256 indexed projectId, address indexed freelancer);
    event ProjectCompleted(uint256 indexed projectId);
    event ProjectCancelled(uint256 indexed projectId);
    event FundsReleased(uint256 indexed projectId, address indexed freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed projectId, address indexed initiator, string reason);
    event DisputeResolved(uint256 indexed projectId, address indexed winner);
    event DeadlineExtended(uint256 indexed projectId, uint256 newDeadline);
    event PlatformFeeUpdated(uint256 newFeePercent);
    event AutoPaymentReleased(uint256 indexed projectId, address indexed freelancer, uint256 amount);

    constructor(uint256 feePercent) Ownable(msg.sender) {
        require(feePercent <= 10, "Fee too high");
        _platformFeePercent = feePercent;
    }

    function createProject(address freelancer, string calldata description, uint256 deadline) external returns (uint256) {
        require(freelancer != address(0), "Invalid freelancer address");
        require(freelancer != msg.sender, "Client cannot be freelancer");
        require(deadline > block.timestamp, "Deadline must be in the future");

        uint256 projectId = _projectCounter++;

        Project storage project = projects[projectId];
        project.client = msg.sender;
        project.freelancer = freelancer;
        project.deadline = deadline;
        project.status = ProjectStatus.Created;
        project.description = description;
        project.createdAt = block.timestamp;

        clientProjects[msg.sender].push(projectId);
        freelancerProjects[freelancer].push(projectId);

        emit ProjectCreated(projectId, msg.sender, freelancer, 0, deadline, description);

        return projectId;
    }

    function fundProject(uint256 projectId) external payable nonReentrant {
        Project storage project = projects[projectId];

        require(project.client == msg.sender, "Only client can fund");
        require(project.status == ProjectStatus.Created, "Invalid project status");
        require(msg.value > 0, "Amount must be greater than 0");

        project.amount = msg.value;
        project.status = ProjectStatus.Funded;

        emit ProjectFunded(projectId, msg.sender, msg.value);
    }

    function startProject(uint256 projectId) external {
        Project storage project = projects[projectId];

        require(project.freelancer == msg.sender, "Only freelancer can start");
        require(project.status == ProjectStatus.Funded, "Project not funded");

        project.status = ProjectStatus.InProgress;

        emit ProjectStarted(projectId, msg.sender);
    }

    function completeProject(uint256 projectId) external {
        Project storage project = projects[projectId];

        require(project.freelancer == msg.sender, "Only freelancer can complete");
        require(project.status == ProjectStatus.InProgress, "Project not in progress");

        project.status = ProjectStatus.Completed;

        emit ProjectCompleted(projectId);
    }

    function releasePayment(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];

        require(project.client == msg.sender, "Only client can release payment");
        require(project.status == ProjectStatus.Completed, "Project not completed");

        uint256 platformFee = (project.amount * _platformFeePercent) / 100;
        uint256 freelancerAmount = project.amount - platformFee;

        (bool success, ) = payable(project.freelancer).call{value: freelancerAmount}("");
        require(success, "Payment to freelancer failed");

        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }

        emit FundsReleased(projectId, project.freelancer, freelancerAmount);
    }

    function raiseDispute(uint256 projectId, string calldata reason) external {
        Project storage project = projects[projectId];

        require(msg.sender == project.client || msg.sender == project.freelancer, "Unauthorized");
        require(project.status == ProjectStatus.InProgress, "Project not in progress");

        project.status = ProjectStatus.Disputed;

        Dispute storage dispute = disputes[projectId];
        if (msg.sender == project.client) {
            dispute.clientReason = reason;
        } else {
            dispute.freelancerReason = reason;
        }

        emit DisputeRaised(projectId, msg.sender, reason);
    }

    function resolveDispute(uint256 projectId, bool favorClient) external onlyOwner {
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Disputed, "No active dispute");

        Dispute storage dispute = disputes[projectId];
        dispute.resolved = true;

        if (favorClient) {
            project.status = ProjectStatus.Cancelled;
            (bool success, ) = payable(project.client).call{value: project.amount}("");
            require(success, "Refund to client failed");
            emit DisputeResolved(projectId, project.client);
        } else {
            project.status = ProjectStatus.Completed;
            uint256 platformFee = (project.amount * _platformFeePercent) / 100;
            uint256 freelancerAmount = project.amount - platformFee;

            (bool success, ) = payable(project.freelancer).call{value: freelancerAmount}("");
            require(success, "Payment to freelancer failed");

            if (platformFee > 0) {
                (bool feeSuccess, ) = payable(owner()).call{value: platformFee}("");
                require(feeSuccess, "Platform fee transfer failed");
            }
            emit DisputeResolved(projectId, project.freelancer);
        }
    }

    function cancelProject(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];

        require(msg.sender == project.client, "Only client can cancel");
        require(project.status == ProjectStatus.Created || project.status == ProjectStatus.Funded, "Cannot cancel active project");

        project.status = ProjectStatus.Cancelled;

        if (project.amount > 0) {
            (bool success, ) = payable(project.client).call{value: project.amount}("");
            require(success, "Refund failed");
        }

        emit ProjectCancelled(projectId);
    }

    function extendDeadline(uint256 projectId, uint256 newDeadline) external {
        Project storage project = projects[projectId];

        require(msg.sender == project.client, "Only client can extend deadline");
        require(project.status == ProjectStatus.InProgress, "Project not in progress");
        require(newDeadline > project.deadline, "New deadline must be later");

        project.deadline = newDeadline;

        emit DeadlineExtended(projectId, newDeadline);
    }

    function getClientProjects(address client) external view returns (uint256[] memory) {
        return clientProjects[client];
    }

    function getFreelancerProjects(address freelancer) external view returns (uint256[] memory) {
        return freelancerProjects[freelancer];
    }

    function getProjectDetails(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }

    function getDisputeDetails(uint256 projectId) external view returns (Dispute memory) {
        return disputes[projectId];
    }

    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 10, "Fee too high");
        _platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    function getPlatformFee() external view returns (uint256) {
        return _platformFeePercent;
    }
    
    function autoReleaseExpiredPayment(uint256 projectId) external nonReentrant {
        Project storage project = projects[projectId];
        
        require(project.status == ProjectStatus.InProgress, "Project not in progress");
        require(block.timestamp > project.deadline, "Deadline not yet passed");
        
        project.status = ProjectStatus.Completed;
        
        uint256 platformFee = (project.amount * _platformFeePercent) / 100;
        uint256 freelancerAmount = project.amount - platformFee;
        
        (bool success, ) = payable(project.freelancer).call{value: freelancerAmount}("");
        require(success, "Payment to freelancer failed");
        
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        
        emit AutoPaymentReleased(projectId, project.freelancer, freelancerAmount);
    }
}