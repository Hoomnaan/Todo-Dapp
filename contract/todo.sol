// SPDX-License-Identifier: MIT  
pragma solidity >=0.7.0 <0.9.0;

// Creating a contract
contract Todo{
    uint public taskCount = 0;
    //structure to store a task
    struct Task {
        string task;
        bool isDone;
    }

    mapping (uint => Task) public tasks;
    
    //function to add a task
    function addTask(string memory _task) public {
        tasks[taskCount] = Task(_task, false);
        taskCount ++;
    }

    // function to get details of a task
    function getTask(uint _taskIndex) public view returns (
        string memory,
        bool
    ) {
        return (
            tasks[_taskIndex].task,
            tasks[_taskIndex].isDone
        );
    }

    // function to update status of a task
    function updateStatus(uint _taskIndex, bool _status) public {
        tasks[_taskIndex].isDone = _status;
    }


    // function to get task count.
    function getTaskCount() public view returns (uint) {
        return (taskCount);
    }
}

