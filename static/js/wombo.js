const axios = require('axios');
const fs = require('fs');
var FormData = require('form-data');

async function sendToWombo() {
    const prompt = document.getElementById("promptField").value;
    if (prompt == '') {
        alert("escribe algo");
        return;
    }
    const url = "http://127.0.0.1:3004/wombo";
    var response;
    var data = {
        prompt: prompt
    };
    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => response.json()).then(data =>{
            var link = document.getElementById("downloadImg");
            link.style.display = "block";
            link.href = data.msg;
            alert("imagen generada")
        });
    } catch (err) {
        console.log(err.message);
        return;
    }
}

class Wombo{
    constructor(){
    }
    async send(style_id, prompt, target_img_path = null) {
        try {
            const BASE_URL = 'https://api.luan.tools/api/tasks/';
    
            //Autenticacion
            const headers = {
                headers: {
                    Authorization: `Bearer jNUDrDJMDC1nYirgxW4uvHOIj8CYGaBV`,
                    'Content-Type': 'application/json'
                }
            }
    
            // paso 1 hacer un post
            var post_payload = { "use_target_image": (target_img_path !== null) };
            var response = await axios.post(BASE_URL, post_payload, headers).catch(error => console.log(error.response));
            console.log(response.data);
            console.log("Paso 1 Completado!");
    
            //paso 2 para tener una imagen de referencia (Se ignora si no se selecciona)
            if (target_img_path !== null) {
                var target_image_url = response.data.target_image_url.url;
                console.log("POSTing to " + target_image_url + response.data.target_image_url.fields.key)
                var fields = response.data.target_image_url.fields;
                var form_data = new FormData();
                Object.entries(fields).forEach(([field, value]) => {
                    form_data.append(field, value);
                });
                form_data.append("file", fs.createReadStream(target_img_path));
                form_data.submit(target_image_url, (err, res) => {
                    console.log(err);
                    // console.log(res)
                });
                console.log("Paso 2 completado!");
            } else {
                console.log("Paso 2 saltado, no hay imagen");
            }
    
            //paso 3 hacer un put
            // where task id is provided in the response from the request in Step 1.
            const task_id = response.data.id
            const task_url = BASE_URL + task_id
            console.log("PUTting to " + task_url)
            const put_payload = {
                'input_spec': {
                    'style': style_id,
                    'prompt': prompt,
                    'target_image_weight': 0.1,
                    'width': 720,
                    'height': 720
                }
            }
            await axios.put(task_url, JSON.stringify(put_payload), headers).catch(error => console.log(error.response));
            console.log("Paso 3 Completado :D")
            var final_url;
            // paso 4 preguntar hasta que la imagen este generada
            while (true == true) {
                var get_response = await axios.get(task_url, headers).catch(error => console.log(error.response));
                var state = get_response.data.state;
                if (state == "generating") {
                    console.log("generating");
                } else if (state == "failed") {
                    console.log("failed!");
                    break;
                } else if (state == "completed") {
                    console.log(get_response.data);
                    final_url = get_response.data.result;
                    // await axios({
                    //     method: "get",
                    //     url: final_url,
                    //     responseType: "stream"
                    // }).then(function (response) {
                    //     response.data.pipe(fs.createWriteStream("img.jpg"));
                    //     console.log("Generated image downloaded to img.jpg! enjoy :)");
                    // });
                    break;
                }
                await new Promise(res => setTimeout(res, 4000));
            }
            return final_url;
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = Wombo;


