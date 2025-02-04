

const startPageDisplay = (function (){
    const startGameBtn = document.querySelector("#start-game");
    const nameForm = document.querySelector("#name-form");
    const dialogStart = document.querySelector("#name-dialog");
    const confirmBtn = document.querySelector("#confirm-btn");

    startGameBtn.addEventListener("click", ()=>{
        dialogStart.showModal();
    });

    dialogStart.addEventListener("close", ()=> {
        nameForm.reset();
    });

    nameForm.addEventListener("submit", () => {
        dialogStart.close();
    });
})();