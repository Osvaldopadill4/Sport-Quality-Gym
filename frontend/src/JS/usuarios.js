// Call the dataTables JQuery plugin
$(document).ready(function() {
    $('#dataTable').DataTable();
});

async function cargarUsuarios(){
    const request = await fetch('api/usuarios', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const usuarios = await request.json();

    let listadoHtml = '';
    for(let usuario of usuarios){
        listadoHtml += `<tr>
                            <td>${usuario.id}</td>
                            <td>${usuario.name}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.password}</td>
                            td><a href="#" lass="btn btn-danger btn-circle btn-sm">Eliminar</td>
                        </tr>`;
    }
    document.querySelector('#usuarios tbody').outerHTML = listadoHtml;

    async function eliminarUsuario(id){
        const request = await fetch(`api/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        location.reload();
    }

    async function editarUsuario(id){
        const request = await fetch(`api/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        location.reload();
    }

    async function registrarUsuario() {
        const request = await fetch('api/usuarios', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.querySelector('#name').value,
                email: document.querySelector('#email').value,
                password: document.querySelector('#password').value
            })
        })
    }
}