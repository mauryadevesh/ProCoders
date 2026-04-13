const Baseurl = "http://localhost:8000:";
export async function startQuiz(){
    const res = await fetch(`${Baseurl}/start`);
    return res.json();
}
export async function submitAnswer(data){
    const res = await fetch(`${Baseurl}/answer`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    });
    return res.json();
}

