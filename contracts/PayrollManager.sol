// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPayrollFactory {
    function markEmployee(address wallet) external;
    function unmarkEmployee(address wallet) external;
}

contract PayrollManager is AccessControl, ReentrancyGuard {
    address public factory;
    bytes32 public constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");
    bytes32 public constant EMPLOYEE_ROLE = keccak256("EMPLOYEE_ROLE");

    struct Employee {
        address wallet;
        string name;
        uint256 hourlyRateWei; // rate per hour in wei (1e18 = 1 A0GI)
        bool active;
        uint256 registeredAt;
        string storageKey; // 0G Storage key for attendance data
    }

    struct ClockEvent {
        address employee;
        uint256 timestamp;
        bool isClockIn;
        uint256 weekNumber;
    }

    struct PayrollRecord {
        address employee;
        uint256 weekNumber;
        uint256 hoursWorked; // in seconds
        uint256 amountPaid;
        uint256 paidAt;
        bool paid;
    }

    // State
    address[] public employeeList;
    mapping(address => Employee) public employees;
    mapping(address => bool) public isEmployee;
    mapping(address => bool) public everRegistered;   // prevents duplicate list entries on re-add
    mapping(address => uint256) private _employeeIndex; // 1-indexed position in employeeList

    // weekNumber => employee => payroll
    mapping(uint256 => mapping(address => PayrollRecord)) public payrollRecords;

    // weekNumber => employee => isClockedIn
    mapping(uint256 => mapping(address => bool)) public clockedIn;

    // weekNumber => employee => total seconds worked
    mapping(uint256 => mapping(address => uint256)) public weeklySeconds;

    // weekNumber => employee => last clock-in timestamp
    mapping(address => uint256) public lastClockIn;
    mapping(address => bool) public currentlyClockedIn;

    // Events
    event EmployeeRegistered(address indexed wallet, string name, uint256 timestamp);
    event EmployeeRemoved(address indexed wallet);
    event EmployeeDeactivated(address indexed wallet);
    event HourlyRateUpdated(address indexed wallet, uint256 newRateWei);
    event ClockIn(address indexed employee, uint256 timestamp, uint256 weekNumber);
    event ClockOut(address indexed employee, uint256 timestamp, uint256 secondsWorked, uint256 weekNumber);
    event PayrollExecuted(address indexed employee, uint256 weekNumber, uint256 amount, uint256 timestamp);
    event FundsDeposited(address indexed sender, uint256 amount);

    uint256 public constant MAX_HOURS_PER_DAY = 8;
    uint256 public constant WORK_START_HOUR = 9;  // 9 AM UTC
    uint256 public constant WORK_END_HOUR = 17;   // 5 PM UTC
    uint256 public constant SECONDS_PER_HOUR = 3600;

    constructor(address employer, address factory_) {
        _grantRole(DEFAULT_ADMIN_ROLE, employer);
        _grantRole(EMPLOYER_ROLE, employer);
        factory = factory_;
    }

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }

    // ─── Employer Functions ───────────────────────────────────────────────────

    function registerEmployee(
        address wallet,
        string calldata name,
        uint256 hourlyRateWei,
        string calldata storageKey
    ) external onlyRole(EMPLOYER_ROLE) {
        require(wallet != address(0), "Invalid address");
        require(!isEmployee[wallet], "Already registered");

        employees[wallet] = Employee({
            wallet: wallet,
            name: name,
            hourlyRateWei: hourlyRateWei,
            active: true,
            registeredAt: block.timestamp,
            storageKey: storageKey
        });
        isEmployee[wallet] = true;
        // Only push to array if this wallet was never registered (or was fully removed)
        if (!everRegistered[wallet]) {
            _employeeIndex[wallet] = employeeList.length + 1; // 1-indexed
            employeeList.push(wallet);
            everRegistered[wallet] = true;
        }

        _grantRole(EMPLOYEE_ROLE, wallet);
        if (factory != address(0)) {
            IPayrollFactory(factory).markEmployee(wallet);
        }
        emit EmployeeRegistered(wallet, name, block.timestamp);
    }

    function updateHourlyRate(address wallet, uint256 newRateWei) external onlyRole(EMPLOYER_ROLE) {
        require(isEmployee[wallet], "Not an employee");
        require(newRateWei > 0, "Rate must be > 0");
        employees[wallet].hourlyRateWei = newRateWei;
        emit HourlyRateUpdated(wallet, newRateWei);
    }

    function clockInEmployee(address wallet) external onlyRole(EMPLOYER_ROLE) {
        require(isEmployee[wallet], "Not an employee");
        require(employees[wallet].active, "Employee not active");
        require(!currentlyClockedIn[wallet], "Already clocked in");
        currentlyClockedIn[wallet] = true;
        lastClockIn[wallet] = block.timestamp;
        uint256 weekNum = getWeekNumber(block.timestamp);
        emit ClockIn(wallet, block.timestamp, weekNum);
    }

    function clockOutEmployee(address wallet) external onlyRole(EMPLOYER_ROLE) {
        require(currentlyClockedIn[wallet], "Not clocked in");
        uint256 clockInTime = lastClockIn[wallet];
        uint256 clockOutTime = block.timestamp;
        uint256 weekNum = getWeekNumber(clockInTime);
        uint256 effectiveSeconds = calculateEffectiveSeconds(clockInTime, clockOutTime);
        weeklySeconds[weekNum][wallet] += effectiveSeconds;
        currentlyClockedIn[wallet] = false;
        emit ClockOut(wallet, clockOutTime, effectiveSeconds, weekNum);
    }

    function deactivateEmployee(address wallet) external onlyRole(EMPLOYER_ROLE) {
        require(isEmployee[wallet], "Not an employee");
        employees[wallet].active = false;
        _revokeRole(EMPLOYEE_ROLE, wallet);
        if (factory != address(0)) {
            IPayrollFactory(factory).unmarkEmployee(wallet);
        }
        emit EmployeeDeactivated(wallet);
    }

    // Fully removes an employee: clears their record and removes from the list.
    // Re-adding them later will work cleanly with no duplicates.
    function removeEmployee(address wallet) external onlyRole(EMPLOYER_ROLE) {
        require(isEmployee[wallet], "Not an employee");

        // Swap-and-pop from employeeList to remove without leaving gaps
        uint256 idx = _employeeIndex[wallet] - 1; // convert to 0-indexed
        uint256 lastIdx = employeeList.length - 1;
        if (idx != lastIdx) {
            address moved = employeeList[lastIdx];
            employeeList[idx] = moved;
            _employeeIndex[moved] = idx + 1; // update moved element's index
        }
        employeeList.pop();

        // Clear clocked-in state if needed
        if (currentlyClockedIn[wallet]) {
            currentlyClockedIn[wallet] = false;
        }

        // Reset all employee tracking
        delete employees[wallet];
        isEmployee[wallet] = false;
        everRegistered[wallet] = false; // allows clean re-registration
        _employeeIndex[wallet] = 0;

        _revokeRole(EMPLOYEE_ROLE, wallet);
        if (factory != address(0)) {
            IPayrollFactory(factory).unmarkEmployee(wallet);
        }
        emit EmployeeRemoved(wallet);
    }

    function executePayroll(address[] calldata wallets, uint256 weekNumber)
        external
        nonReentrant
        onlyRole(EMPLOYER_ROLE)
    {
        for (uint256 i = 0; i < wallets.length; i++) {
            address emp = wallets[i];
            if (!isEmployee[emp] || !employees[emp].active) continue;

            PayrollRecord storage record = payrollRecords[weekNumber][emp];
            if (record.paid) continue;

            uint256 secondsWorked = weeklySeconds[weekNumber][emp];
            if (secondsWorked == 0) continue;

            uint256 hoursWorked = secondsWorked / SECONDS_PER_HOUR;
            uint256 amount = hoursWorked * employees[emp].hourlyRateWei;

            require(address(this).balance >= amount, "Insufficient contract balance");

            record.employee = emp;
            record.weekNumber = weekNumber;
            record.hoursWorked = secondsWorked;
            record.amountPaid = amount;
            record.paidAt = block.timestamp;
            record.paid = true;

            (bool success, ) = payable(emp).call{value: amount}("");
            require(success, "Payment failed");

            emit PayrollExecuted(emp, weekNumber, amount, block.timestamp);
        }
    }

    // ─── Employee Functions ───────────────────────────────────────────────────

    function clockIn() external onlyRole(EMPLOYEE_ROLE) {
        require(employees[msg.sender].active, "Employee not active");
        require(!currentlyClockedIn[msg.sender], "Already clocked in");

        currentlyClockedIn[msg.sender] = true;
        lastClockIn[msg.sender] = block.timestamp;

        uint256 weekNum = getWeekNumber(block.timestamp);
        emit ClockIn(msg.sender, block.timestamp, weekNum);
    }

    function clockOut() external onlyRole(EMPLOYEE_ROLE) {
        require(currentlyClockedIn[msg.sender], "Not clocked in");

        uint256 clockInTime = lastClockIn[msg.sender];
        uint256 clockOutTime = block.timestamp;
        uint256 weekNum = getWeekNumber(clockInTime);

        // Calculate effective seconds worked (capped at 8 hours, work window only)
        uint256 effectiveSeconds = calculateEffectiveSeconds(clockInTime, clockOutTime);

        weeklySeconds[weekNum][msg.sender] += effectiveSeconds;
        currentlyClockedIn[msg.sender] = false;

        emit ClockOut(msg.sender, clockOutTime, effectiveSeconds, weekNum);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getAllEmployees() external view returns (Employee[] memory) {
        Employee[] memory result = new Employee[](employeeList.length);
        for (uint256 i = 0; i < employeeList.length; i++) {
            result[i] = employees[employeeList[i]];
        }
        return result;
    }

    function getEmployeeCount() external view returns (uint256) {
        return employeeList.length;
    }

    function getWeeklyHours(address emp, uint256 weekNumber)
        external
        view
        returns (uint256 seconds_, uint256 hours_)
    {
        seconds_ = weeklySeconds[weekNumber][emp];
        hours_ = seconds_ / SECONDS_PER_HOUR;
    }

    function getPayrollRecord(address emp, uint256 weekNumber)
        external
        view
        returns (PayrollRecord memory)
    {
        return payrollRecords[weekNumber][emp];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function isClockedIn(address emp) external view returns (bool) {
        return currentlyClockedIn[emp];
    }

    // ─── Pure Helpers ─────────────────────────────────────────────────────────

    // ISO week number (week starts Monday)
    function getWeekNumber(uint256 timestamp) public pure returns (uint256) {
        // Days since Unix epoch (Jan 1, 1970 was a Thursday)
        uint256 daysSinceEpoch = timestamp / 86400;
        // Adjust so Monday = 0: epoch was Thursday = day 3, so subtract 3 (or add 4) mod 7
        uint256 weekday = (daysSinceEpoch + 3) % 7; // 0=Mon,1=Tue,...,6=Sun
        // Week number = (daysSinceEpoch - weekday) / 7
        return (daysSinceEpoch - weekday) / 7;
    }

    function calculateEffectiveSeconds(uint256 clockInTime, uint256 clockOutTime)
        public
        pure
        returns (uint256)
    {
        if (clockOutTime <= clockInTime) return 0;

        // Get day start (midnight UTC) of clock-in day
        uint256 dayStart = (clockInTime / 86400) * 86400;

        // Work window: 9 AM – 5 PM UTC
        uint256 workStart = dayStart + WORK_START_HOUR * SECONDS_PER_HOUR;
        uint256 workEnd = dayStart + WORK_END_HOUR * SECONDS_PER_HOUR;

        // Clamp effective in/out to work window
        uint256 effectiveIn = clockInTime < workStart ? workStart : clockInTime;
        uint256 effectiveOut = clockOutTime > workEnd ? workEnd : clockOutTime;

        if (effectiveOut <= effectiveIn) return 0;

        uint256 worked = effectiveOut - effectiveIn;
        uint256 maxSeconds = MAX_HOURS_PER_DAY * SECONDS_PER_HOUR;

        return worked > maxSeconds ? maxSeconds : worked;
    }
}
