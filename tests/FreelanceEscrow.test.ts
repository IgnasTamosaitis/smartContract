import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FreelanceEscrow", function () {
  let freelanceEscrow: Contract;
  let owner: SignerWithAddress;
  let client: SignerWithAddress;
  let freelancer: SignerWithAddress;
  let projectId: number;
  const platformFee = 5; // 5% platform fee

  beforeEach(async function () {
    [owner, client, freelancer] = await ethers.getSigners();

    const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
    freelanceEscrow = await FreelanceEscrow.deploy(platformFee);

    // Create a project
    const oneWeekFromNow = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const tx = await freelanceEscrow.connect(client).createProject(
      freelancer.address,
      "Build a website",
      oneWeekFromNow
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log: any) => log.fragment && log.fragment.name === "ProjectCreated"
    );
    projectId = parseInt(event.args[0]);
  });

  describe("Project Creation", function () {
    it("Should create a project correctly", async function () {
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.client).to.equal(client.address);
      expect(project.freelancer).to.equal(freelancer.address);
      expect(project.status).to.equal(0); // ProjectStatus.Created
      expect(project.description).to.equal("Build a website");
    });

    it("Should not allow creating a project with client as freelancer", async function () {
      const oneWeekFromNow = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      await expect(
        freelanceEscrow.connect(client).createProject(
          client.address,
          "Invalid project",
          oneWeekFromNow
        )
      ).to.be.revertedWith("Client cannot be freelancer");
    });

    it("Should not allow creating a project with past deadline", async function () {
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await expect(
        freelanceEscrow.connect(client).createProject(
          freelancer.address,
          "Invalid project",
          pastDeadline
        )
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("Project Funding", function () {
    it("Should fund a project correctly", async function () {
      const fundAmount = ethers.parseEther("1.0");
      await freelanceEscrow.connect(client).fundProject(projectId, { value: fundAmount });

      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.amount).to.equal(fundAmount);
      expect(project.status).to.equal(1); // ProjectStatus.Funded
    });

    it("Should not allow non-client to fund a project", async function () {
      await expect(
        freelanceEscrow.connect(freelancer).fundProject(projectId, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Only client can fund");
    });

    it("Should not allow funding with zero amount", async function () {
      await expect(
        freelanceEscrow.connect(client).fundProject(projectId, { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Project Workflow", function () {
    beforeEach(async function () {
      // Fund the project
      await freelanceEscrow.connect(client).fundProject(projectId, { value: ethers.parseEther("1.0") });
    });

    it("Should allow freelancer to start the project", async function () {
      await freelanceEscrow.connect(freelancer).startProject(projectId);
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(2); // ProjectStatus.InProgress
    });

    it("Should allow freelancer to complete the project", async function () {
      await freelanceEscrow.connect(freelancer).startProject(projectId);
      await freelanceEscrow.connect(freelancer).completeProject(projectId);
      
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(4); // ProjectStatus.Completed
    });

    it("Should allow client to release payment", async function () {
      await freelanceEscrow.connect(freelancer).startProject(projectId);
      await freelanceEscrow.connect(freelancer).completeProject(projectId);
      
      const initialFreelancerBalance = await ethers.provider.getBalance(freelancer.address);
      await freelanceEscrow.connect(client).releasePayment(projectId);
      
      const finalFreelancerBalance = await ethers.provider.getBalance(freelancer.address);
      
      // Calculate expected amount (95% of 1 ETH)
      const expectedAmount = ethers.parseEther("0.95");
      expect(finalFreelancerBalance - initialFreelancerBalance).to.equal(expectedAmount);
    });

    it("Should allow client to cancel a funded project and get refund", async function () {
      const initialClientBalance = await ethers.provider.getBalance(client.address);
      
      // Account for gas costs
      const tx = await freelanceEscrow.connect(client).cancelProject(projectId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalClientBalance = await ethers.provider.getBalance(client.address);
      
      // Client should get back 1 ETH minus gas costs
      expect(finalClientBalance + gasUsed - initialClientBalance).to.be.closeTo(
        ethers.parseEther("1.0"),
        ethers.parseEther("0.001") // Allow small margin for calculation differences
      );
      
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(5); // ProjectStatus.Cancelled
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      // Fund and start the project
      await freelanceEscrow.connect(client).fundProject(projectId, { value: ethers.parseEther("1.0") });
      await freelanceEscrow.connect(freelancer).startProject(projectId);
    });

    it("Should allow client to raise a dispute", async function () {
      await freelanceEscrow.connect(client).raiseDispute(projectId, "Work not meeting requirements");
      
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(3); // ProjectStatus.Disputed
      
      const dispute = await freelanceEscrow.getDisputeDetails(projectId);
      expect(dispute.clientReason).to.equal("Work not meeting requirements");
    });

    it("Should allow freelancer to raise a dispute", async function () {
      await freelanceEscrow.connect(freelancer).raiseDispute(projectId, "Client changed requirements");
      
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(3); // ProjectStatus.Disputed
      
      const dispute = await freelanceEscrow.getDisputeDetails(projectId);
      expect(dispute.freelancerReason).to.equal("Client changed requirements");
    });

    it("Should allow owner to resolve dispute in favor of client", async function () {
      await freelanceEscrow.connect(client).raiseDispute(projectId, "Work not meeting requirements");
      
      const initialClientBalance = await ethers.provider.getBalance(client.address);
      await freelanceEscrow.connect(owner).resolveDispute(projectId, true);
      const finalClientBalance = await ethers.provider.getBalance(client.address);
      
      expect(finalClientBalance - initialClientBalance).to.equal(ethers.parseEther("1.0"));
      
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(5); // ProjectStatus.Cancelled
      
      const dispute = await freelanceEscrow.getDisputeDetails(projectId);
      expect(dispute.resolved).to.be.true;
    });

    it("Should allow owner to resolve dispute in favor of freelancer", async function () {
      await freelanceEscrow.connect(client).raiseDispute(projectId, "Work not meeting requirements");
      
      const initialFreelancerBalance = await ethers.provider.getBalance(freelancer.address);
      await freelanceEscrow.connect(owner).resolveDispute(projectId, false);
      const finalFreelancerBalance = await ethers.provider.getBalance(freelancer.address);
      
      // Freelancer should get 95% of 1 ETH
      expect(finalFreelancerBalance - initialFreelancerBalance).to.equal(ethers.parseEther("0.95"));
      
      const project = await freelanceEscrow.getProjectDetails(projectId);
      expect(project.status).to.equal(4); // ProjectStatus.Completed
      
      const dispute = await freelanceEscrow.getDisputeDetails(projectId);
      expect(dispute.resolved).to.be.true;
    });
  });

  describe("Platform Fee", function () {
    it("Should allow owner to update platform fee", async function () {
      await freelanceEscrow.connect(owner).updatePlatformFee(7);
      expect(await freelanceEscrow.getPlatformFee()).to.equal(7);
    });

    it("Should not allow setting platform fee above 10%", async function () {
      await expect(
        freelanceEscrow.connect(owner).updatePlatformFee(11)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should not allow non-owner to update platform fee", async function () {
      await expect(
        freelanceEscrow.connect(client).updatePlatformFee(7)
      ).to.be.reverted;
    });
  });
});