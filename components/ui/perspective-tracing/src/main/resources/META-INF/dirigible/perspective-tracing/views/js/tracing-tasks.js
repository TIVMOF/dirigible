/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors
 * SPDX-License-Identifier: EPL-2.0
 */
const ideTracingTasksView = angular.module('ide-tracing-tasks', ['platformView', 'blimpKit']);
ideTracingTasksView.constant('Notifications', new NotificationHub());
ideTracingTasksView.controller('IDETracingTasksViewController', ($scope, $http, $timeout, Notifications) => {
    $scope.selectAll = false;
    $scope.searchText = "";
    $scope.filterBy = "";
    $scope.displaySearch = false;
    $scope.tasksList = [];
    $scope.pageSize = 10;
    $scope.currentPage = 1;

    $scope.currentFetchDataTask = null;

    const fetchData = (args) => {
        if ($scope.currentFetchDataTask) {
            clearInterval($scope.currentFetchDataTask);
        }

        // $scope.currentFetchDatadTask = setInterval(() => {
        const pageNumber = (args && args.pageNumber) || $scope.currentPage;
        const pageSize = (args && args.pageSize) || $scope.pageSize;
        const limit = pageNumber * pageSize;
        const startIndex = (pageNumber - 1) * pageSize;
        if (startIndex >= $scope.totalRows) {
            return;
        }

        $http.get('/services/core/tracing', { params: { 'condition': $scope.filterBy, 'limit': limit } })
            .then((response) => {
                // if ($scope.tasksList.length < response.data.length) {
                //     Notifications.show({
                //         type: 'information',
                //         title: 'Tasks states',
                //         description: 'A new task state has been added.'
                //     });
                // }
                $scope.tasksList = response.data;
            });
        // }, 10000);
    }

    fetchData();

    $scope.reload = () => {
        fetchData();
    };

    $scope.toggleSearch = () => {
        $scope.displaySearch = !$scope.displaySearch;
    };

    $scope.selectAllChanged = () => {
        for (let task of $scope.tasksList) {
            task.selected = $scope.selectAll;
        }
    };

    $scope.selectionChanged = (task) => {
        $scope.selectAll = $scope.tasksList.every(x => x.selected = false);
        Notifications.postMessage({ topic: 'tracing.task', data: { task: task.id } });
        Notifications.postMessage({ topic: 'tracing.task.selected', data: { task: task.id } });
        task.selected = true;
    };

    $scope.clearSearch = () => {
        $scope.searchText = "";
        $scope.filterBy = "";
        fetchData();
    };

    $scope.getSelectedCount = () => {
        return $scope.tasksList.reduce((c, task) => {
            if (task.selected) c++;
            return c;
        }, 0);
    };

    $scope.hasSelected = () => $scope.tasksList.some(x => x.selected);

    $scope.applyFilter = () => {
        $scope.filterBy = $scope.searchText;
        fetchData();
    };

    $scope.getNoDataMessage = () => {
        return $scope.filterBy ? 'No tasks found.' : 'No tasks have been detected.';
    };

    $scope.inputSearchKeyUp = (e) => {
        if ($scope.lastSearchKeyUp) {
            $timeout.cancel($scope.lastSearchKeyUp);
            $scope.lastSearchKeyUp = null;
        }

        switch (e.key) {
            case 'Escape':
                $scope.searchText = $scope.filterBy || '';
                break;
            case 'Enter':
                $scope.applyFilter();
                break;
            default:
                if ($scope.filterBy !== $scope.searchText) {
                    $scope.lastSearchKeyUp = $timeout(() => {
                        $scope.lastSearchKeyUp = null;
                        $scope.applyFilter();
                    }, 250);
                }
                break;
        }
    };

    $scope.onPageChange = (pageNumber) => {
        fetchData({ pageNumber });
    };

    $scope.onItemsPerPageChange = (itemsPerPage) => {
        fetchData({ pageSize: itemsPerPage });
    };

    $scope.refresh = () => {
        fetchData();
    };

    $scope.deleteSelected = () => {
        $scope.tasksList.reduce((ret, task) => {
            if (task.selected)
                ret.push(task.id);
            return ret;
        }, []);
    };

    $scope.getStatusClasses = (status) => {
        let classes = 'sap-icon ';
        switch (status) {
            case 'STARTED':
                classes += 'sap-icon--play';
                break;
            case 'SUCCESSFUL':
                classes += 'sap-icon--status-positive sap-icon--color-positive';
                break;
            case 'FAILED':
                classes += 'sap-icon--status-error sap-icon--color-negative';
                break;
            default:
                classes += 'sap-icon--question-mark';
        }
        return classes;
    };

    $scope.getTypeClasses = (type) => {
        let classes = 'sap-icon ';
        switch (type) {
            case 'JOB':
                classes += 'sap-icon--history';
                break;
            case 'BPM':
                classes += 'sap-icon--process';
                break;
            case 'ETL':
                classes += 'sap-icon--combine';
                break;
            case 'MQ':
                classes += 'sap-icon--email';
                break;
            default:
                classes += 'sap-icon--question-mark';
        }
        return classes;
    };
});