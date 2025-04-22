let inputTag = document.getElementById("input");
console.log(inputTag)

let addTaskBtn = document.getElementById("button");

let allTasksContainer = document.getElementById("allTasksContainer");


let AllTasks = JSON.parse(localStorage.getItem("myAllTasks"))||[];

addTaskBtn.addEventListener("click", ()=>{
    let taskinputvalue = inputTag.value.trim();
    if(taskinputvalue === ""){
        return alert("pls enter a task ")
    }
    else{
        // console.log("hello")
        console.log(taskinputvalue)
    }

AllTasks.push(taskinputvalue)


localStorage.setItem("myAllTasks",  JSON.stringify(AllTasks))

inputTag.value=""
showTasks(AllTasks)

})

function showTasks(AllTasks){

    allTasksContainer.innerHTML=""

    AllTasks.forEach((task, index)=>{

            //console.log(`${task} ${index} `)
        
        let taskdiv = document.createElement("div")
        taskdiv.innerHTML=`
         <span>${task}</span>
         <button id="edit">edit</button>
        <button id="delete">delete</button> <br><br>
        
        `
        // console.log(taskdiv)

        const editbtn = taskdiv.querySelector("#edit")
        editbtn.addEventListener("click", ()=>{
            editTask(index, AllTasks)
        })

        

    const dltbtn = taskdiv.querySelector("#delete")
        dltbtn.addEventListener("click", ()=>{
            deleteTask(index, AllTasks)
        })


        allTasksContainer.append(taskdiv)
        
        })


}

//////////////////////edit button//////////////

function editTask(index, data){
const currenttask = prompt("edit the task", data[index])

if(currenttask !==null && currenttask.trim()!==""){
    data[index]=currenttask
    localStorage.setItem("myAllTasks", JSON.stringify(data))
    showTasks(data)
}

}


// /////////////////////


function deleteTask(index, data){
    const alldatatasks =JSON.parse(localStorage.getItem("myAllTasks"))
    const dletconfirm =confirm("are you sure to delete !!!")
    if(dletconfirm){
        alldatatasks.splice(index, 1)
        // console.log(alldatatasks)
        localStorage.setItem("myAllTasks", JSON.stringify(alldatatasks))
        showTasks(alldatatasks)
    }

}


window.addEventListener("DOMContentLoaded", ()=>{

    showTasks(AllTasks)

})

//redis= cache memory

