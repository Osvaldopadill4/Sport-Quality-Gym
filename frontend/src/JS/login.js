$(document).ready(function () {
    // on ready
})

async function iniciarSesion(){
    let datos = {};
    datos.correo = document.getElementById('txtCorreo').value;
    datos.contrasena = document.getElementById('txtContrasena').value;

    const request = await fetch('api/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        //Convierte objetos de JS a JSON
        body: JSON.stringify(datos)
    });
    const respuesta = await request.json();
}