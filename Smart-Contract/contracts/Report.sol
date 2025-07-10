// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ReportManager {
    struct ReportInfo {
        string ipfsHash;
        string reportId;
        uint256 timestamp;
    }

    address public owner;

    mapping(string => ReportInfo[]) private userReports;

    mapping(string => address[]) private allowedViewers;
    mapping(string => mapping(address => bool)) private isViewerAllowed;

    mapping(string => address) private userToWallet;

    event ReportStored(
        string reportId,
        string userId,
        string ipfsHash,
        uint256 timestamp
    );
    event AccessGranted(string userId, address viewer);

    constructor() {
        owner = msg.sender;
    }

    function storeReport(
        string memory _reportId,
        string memory _userId,
        string memory _ipfsHash
    ) external {
        require(bytes(_reportId).length > 0, "Invalid report ID");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");

        if (userToWallet[_userId] == address(0)) {
            userToWallet[_userId] = msg.sender;
        }

        require(
            userToWallet[_userId] == msg.sender,
            "Unauthorized uploader for this user"
        );

        ReportInfo memory report = ReportInfo({
            ipfsHash: _ipfsHash,
            reportId: _reportId,
            timestamp: block.timestamp
        });

        userReports[_userId].push(report);

        emit ReportStored(_reportId, _userId, _ipfsHash, block.timestamp);
    }

    function grantAccess(string memory _userId, address _viewer) external {
        require(
            userToWallet[_userId] == msg.sender,
            "Only uploader can grant access"
        );
        require(
            !isViewerAllowed[_userId][_viewer],
            "Viewer already has access"
        );

        allowedViewers[_userId].push(_viewer);
        isViewerAllowed[_userId][_viewer] = true;

        emit AccessGranted(_userId, _viewer);
    }

    function getReports(
        string memory _userId,
        uint256 durationInMonths
    ) external view returns (ReportInfo[] memory) {
        require(
            userToWallet[_userId] == msg.sender ||
                isViewerAllowed[_userId][msg.sender],
            "You are not allowed to view these reports"
        );

        ReportInfo[] memory allReports = userReports[_userId];
        uint256 count = 0;
        uint256 durationInSeconds = durationInMonths * 30 days;

        for (uint256 i = 0; i < allReports.length; i++) {
            if (
                durationInMonths == 0 ||
                block.timestamp - allReports[i].timestamp <= durationInSeconds
            ) {
                count++;
            }
        }

        if (count == 0) {
            return new ReportInfo[](0);
        }

        ReportInfo[] memory filteredReports = new ReportInfo[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allReports.length; i++) {
            if (
                durationInMonths == 0 ||
                block.timestamp - allReports[i].timestamp <= durationInSeconds
            ) {
                filteredReports[index] = allReports[i];
                index++;
            }
        }

        return filteredReports;
    }

    function getReportById(
        string memory _userId,
        string memory _reportId
    ) external view returns (ReportInfo memory) {
        require(
            userToWallet[_userId] == msg.sender ||
                isViewerAllowed[_userId][msg.sender],
            "You are not allowed to view this report"
        );

        ReportInfo[] memory reports = userReports[_userId];
        for (uint256 i = 0; i < reports.length; i++) {
            if (
                keccak256(bytes(reports[i].reportId)) ==
                keccak256(bytes(_reportId))
            ) {
                return reports[i];
            }
        }

        revert("Report not found");
    }

    function getAllowedViewers(
        string memory _userId
    ) external view returns (address[] memory) {
        return allowedViewers[_userId];
    }

    function getUserWallet(
        string memory _userId
    ) external view returns (address) {
        return userToWallet[_userId];
    }
}
