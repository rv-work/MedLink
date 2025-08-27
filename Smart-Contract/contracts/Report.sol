// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ReportManager {
    struct FileInfo {
        string ipfsHash;
        string fileName;
        string fileType;
    }

    struct ReportInfo {
        string reportId;
        uint256 timestamp;
        FileInfo[] files;
        bool hasMultipleFiles;
        uint256 fileCount;
    }

    address public owner;

    mapping(string => ReportInfo[]) private userReports;
    mapping(string => address[]) private allowedViewers;
    mapping(string => mapping(address => bool)) private isViewerAllowed;
    mapping(string => address) private userToWallet;

    // New mapping for report sharing
    mapping(string => mapping(string => bool)) private sharedReports; // userId => reportId => isShared

    event ReportStored(
        string reportId,
        string userId,
        uint256 fileCount,
        uint256 timestamp
    );
    event AccessGranted(string userId, address viewer);
    event ReportShared(string userId, string reportId, bool isShared);

    constructor() {
        owner = msg.sender;
    }

    function storeReport(
        string memory _reportId,
        string memory _userId,
        string[] memory _ipfsHashes,
        string[] memory _fileNames,
        string[] memory _fileTypes
    ) external {
        require(bytes(_reportId).length > 0, "Invalid report ID");
        require(_ipfsHashes.length > 0, "At least one file required");
        require(
            _ipfsHashes.length == _fileNames.length,
            "Mismatched array lengths"
        );
        require(
            _ipfsHashes.length == _fileTypes.length,
            "Mismatched array lengths"
        );

        if (userToWallet[_userId] == address(0)) {
            userToWallet[_userId] = msg.sender;
        }

        require(
            userToWallet[_userId] == msg.sender,
            "Unauthorized uploader for this user"
        );

        ReportInfo storage report = userReports[_userId].push();
        report.reportId = _reportId;
        report.timestamp = block.timestamp;
        report.fileCount = _ipfsHashes.length;
        report.hasMultipleFiles = _ipfsHashes.length > 1;

        for (uint256 i = 0; i < _ipfsHashes.length; i++) {
            report.files.push(
                FileInfo({
                    ipfsHash: _ipfsHashes[i],
                    fileName: _fileNames[i],
                    fileType: _fileTypes[i]
                })
            );
        }

        emit ReportStored(
            _reportId,
            _userId,
            _ipfsHashes.length,
            block.timestamp
        );
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

    function revokeAccess(string memory _userId, address _viewer) external {
        require(
            userToWallet[_userId] == msg.sender,
            "Only uploader can revoke access"
        );
        require(
            isViewerAllowed[_userId][_viewer],
            "Viewer doesn't have access"
        );

        isViewerAllowed[_userId][_viewer] = false;

        // Remove from allowed viewers array
        address[] storage viewers = allowedViewers[_userId];
        for (uint256 i = 0; i < viewers.length; i++) {
            if (viewers[i] == _viewer) {
                viewers[i] = viewers[viewers.length - 1];
                viewers.pop();
                break;
            }
        }
    }

    function shareReport(
        string memory _userId,
        string memory _reportId,
        bool _isShared
    ) external {
        require(
            userToWallet[_userId] == msg.sender,
            "Only owner can share/unshare reports"
        );

        sharedReports[_userId][_reportId] = _isShared;
        emit ReportShared(_userId, _reportId, _isShared);
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
                isViewerAllowed[_userId][msg.sender] ||
                sharedReports[_userId][_reportId],
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

    function getReportFiles(
        string memory _userId,
        string memory _reportId
    ) external view returns (FileInfo[] memory) {
        require(
            userToWallet[_userId] == msg.sender ||
                isViewerAllowed[_userId][msg.sender] ||
                sharedReports[_userId][_reportId],
            "You are not allowed to view this report"
        );

        ReportInfo[] memory reports = userReports[_userId];
        for (uint256 i = 0; i < reports.length; i++) {
            if (
                keccak256(bytes(reports[i].reportId)) ==
                keccak256(bytes(_reportId))
            ) {
                return reports[i].files;
            }
        }

        revert("Report not found");
    }

    function isReportShared(
        string memory _userId,
        string memory _reportId
    ) external view returns (bool) {
        return sharedReports[_userId][_reportId];
    }

    function getAllowedViewers(
        string memory _userId
    ) external view returns (address[] memory) {
        require(
            userToWallet[_userId] == msg.sender,
            "Only owner can view allowed viewers"
        );
        return allowedViewers[_userId];
    }

    function getUserWallet(
        string memory _userId
    ) external view returns (address) {
        return userToWallet[_userId];
    }

    function getReportCount(
        string memory _userId
    ) external view returns (uint256) {
        require(
            userToWallet[_userId] == msg.sender ||
                isViewerAllowed[_userId][msg.sender],
            "You are not allowed to view this information"
        );
        return userReports[_userId].length;
    }

    function hasAccess(
        string memory _userId,
        address _viewer
    ) external view returns (bool) {
        return
            userToWallet[_userId] == _viewer ||
            isViewerAllowed[_userId][_viewer];
    }
}
