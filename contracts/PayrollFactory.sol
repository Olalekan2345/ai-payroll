// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PayrollManager.sol";

/**
 * @title PayrollFactory
 * @notice Deploys one PayrollManager per employer. Maintains a global
 *         employee registry so wallets cannot be both employer and employee.
 */
contract PayrollFactory {
    // employer wallet => their PayrollManager
    mapping(address => address) public employerContracts;

    // employee wallet => the PayrollManager they belong to
    mapping(address => address) public employeeToContract;

    // quick lookup: is this address a known PayrollManager?
    mapping(address => bool) public isRegisteredContract;

    address[] public allContracts;

    event PayrollCreated(address indexed employer, address indexed payrollContract);
    event EmployeeMarked(address indexed employee, address indexed payrollContract);
    event EmployeeUnmarked(address indexed employee);

    // ─── Employer: deploy a contract ──────────────────────────────────────────

    function createPayroll() external returns (address) {
        require(employerContracts[msg.sender] == address(0), "Already have a payroll contract");
        require(employeeToContract[msg.sender] == address(0), "You are registered as an employee");

        PayrollManager pm = new PayrollManager(msg.sender, address(this));
        address pmAddr = address(pm);

        employerContracts[msg.sender] = pmAddr;
        isRegisteredContract[pmAddr] = true;
        allContracts.push(pmAddr);

        emit PayrollCreated(msg.sender, pmAddr);
        return pmAddr;
    }

    // ─── Callbacks from PayrollManager instances ──────────────────────────────

    function markEmployee(address wallet) external {
        require(isRegisteredContract[msg.sender], "Caller is not a registered PayrollManager");
        require(employerContracts[wallet] == address(0), "Wallet is an employer");
        require(employeeToContract[wallet] == address(0), "Already registered as employee elsewhere");
        employeeToContract[wallet] = msg.sender;
        emit EmployeeMarked(wallet, msg.sender);
    }

    function unmarkEmployee(address wallet) external {
        require(isRegisteredContract[msg.sender], "Caller is not a registered PayrollManager");
        // only unmark if this contract owns the employee record
        if (employeeToContract[wallet] == msg.sender) {
            employeeToContract[wallet] = address(0);
            emit EmployeeUnmarked(wallet);
        }
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getContract(address employer) external view returns (address) {
        return employerContracts[employer];
    }

    function hasContract(address employer) external view returns (bool) {
        return employerContracts[employer] != address(0);
    }

    function isEmployee(address wallet) external view returns (bool) {
        return employeeToContract[wallet] != address(0);
    }

    function getContractCount() external view returns (uint256) {
        return allContracts.length;
    }
}
