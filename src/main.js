import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import TodoListAbi from '../contract/todo.abi.json'
import erc20Abi from "../contract/erc20.abi.json"
import {TodoListContractAddress, cUSDContractAddress , ERC20_DECIMALS} from "./utils/constants";

let kit
let contract


const connectCeloWallet = async function() {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(TodoListAbi, TodoListContractAddress)

    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

const getBalance = async function() {
  notification("⌛ Loading...")
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
  notificationOff()
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

// document.querySelector("#connectAccount").addEventListener("click", async (e) => {
//   await connectCeloWallet()
//   await getBalance()
//   getTasks()
//   document.querySelector("#connectAccount").style.display = "none"
//   editAddress(kit.defaultAccount)
//   document.querySelector('#newItembtn').removeAttribute("disabled");
//   notificationOff()
// });

function editAddress(_address){
  let address = document.querySelector(".addr")
  let add = _address
  add = add+'.'
  let str1 = add.slice(0,6);
  let str2 = add.slice(-5, -1);
  address.textContent = str1+'...'+str2
  address.style.display = 'flex'
  document.getElementById("blockchainlink").href=`https://alfajores-blockscout.celo-testnet.org/address/${kit.defaultAccount}/transactions`
}

$(document).ready(createTaskList());

// Auto focus on input of add task modal //
$('#add-task-container').on('shown.bs.modal', function () {
  $('#new-task').trigger('focus');
});


// Get list of tasks
async function createTaskList() {

    const taskCount = await contract.methods.getTaskCount().call()

    for (let i = 0; i < taskCount; i++) {
      try {
        let task = await contract.methods.getTask(i).call();

        if (task[0] != '') {
          addTaskToList(i, task[0], task[1]);
        } 
        else {
          notification(`No task`)
        }

      } catch(error){
        notification(`⚠️ ${error}.`)
      }
      
    }

    updateTasksCount()
}


//Display tasks
function addTaskToList(id, name, status) {

  let list = document.getElementById('list');

  let item = document.createElement('li');
  item.classList.add('list-group-item', 'border-0', 'd-flex', 'justify-content-between', 'align-items-center');
  item.id = 'item-' + id;
  let task = document.createTextNode(name);

  var checkbox = document.createElement("INPUT");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("id", "item-" + id + "-checkbox");
  checkbox.checked = status;

  if (status) {
    item.classList.add("task-done");
  }
  list.appendChild(item);

  item.appendChild(task);
  item.appendChild(checkbox);
  checkbox.onclick = function () { changeTaskStatus(checkbox.id, id); };
}


//Toggle task status
async function changeTaskStatus(id, taskIndex) {
  let checkbox = document.getElementById(id);
  let textId = id.replace('-checkbox', '');
  let text = document.getElementById(textId);
  notification(`⌛ Changing task status `)
  try {
    await contract.methods.updateStatus(taskIndex).send({ from: kit.defaultAccount });
    if (checkbox.checked) {
      text.classList.add("task-done");
    } else {
      text.classList.remove("task-done");
    }
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 Status changed successfully`)

}


//Update the number of tasks
function updateTasksCount() {
  let list = document.getElementById('list');
  let taskCount = list.childElementCount;
  let count = document.getElementById('taskCount');
  count.innerText = taskCount + " Task";
}




//Creating task
document.querySelector("#addTaskBtn").addEventListener("click", async(e) => {
  let content = document.getElementById("new-task").value
  notification(`⌛ Adding `)

  try {
    await contract.methods.addTask(content).send({ from: kit.defaultAccount });
    // location.reload();

    await createTaskList()
  }
  catch (error) {
    notification(`⚠️ ${error}.`)
  }

  notification(`🎉 You successfully added a Task`)
})

window.addEventListener('load', async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  createTaskList()
  editAddress(kit.defaultAccount)
  notificationOff()
});
