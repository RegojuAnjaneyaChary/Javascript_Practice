

function getdata(){

fetch("https://fakestoreapi.com/products")
.then(response => response.json() )
.then(data=>{
    let CardsContainer = document.getElementById("CardsContainer");
        CardsContainer.innerHTML=" "
    console.log("CardsContainer")

data.forEach(x=>{
    let cards = document.createElement("div")
    cards.className = "cardsdiv"

    cards.innerHTML=`
    <img src="${x.image}" width="50"/>
    <p>price ₹:${x.price}</p>
    <p> Id : ${x.id}</p>
    
    `
    CardsContainer.appendChild(cards)
})

})

}

///////////////////////////// dummy api///////////////////

function getdata1() {
    fetch('https://dummyjson.com/recipes')
    .then(res => res.json())
    .then(data => {
        console.log(data)

        let  CardsContainer = document.getElementById("CardsContainer");
        CardsContainer.innerHTML=""
        console.log(CardsContainer)

        data.recipes.forEach(x=>{
            let cards=document.createElement("div")

            cards.className = "cardsdiv"
            cards.innerHTML=`

            <img src="${x.image}" width="50"/>
             <p> ${x.name}</p>
        
            <p>price ₹:${x.userId}</p>

            `
            console.log(cards)
            CardsContainer.appendChild(cards);
        })


    })
    
}







