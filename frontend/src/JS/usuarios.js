// Call the dataTables JQuery plugin
$(document).ready(function() {
    $('#dataTable').DataTable();
});

async function cargarUsuarios(){
    const request = await fetch('api/usuario', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const usuarios = await request.json();
    let listadoHtml = '';
    for(let usuario of usuarios){
        let botonEliminar = '<a href="#" onclick="eliminarUsuario(2333)" class="btn btn-danger btn-circle btn-sm"><i class="fas fa-trash"></i>Eliminar</a>';
        let usuarioHtml = `<tr>
                            <td>${usuario.id}</td>
                            <td>${usuario.name}</td>
                            <td>${usuario.apellido}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.password}</td>
                            <td>${usuario.telefono}</td>
                            td><a href="#" lass="btn btn-danger btn-circle btn-sm">Eliminar</td>
                        </tr>`;
    }
    document.querySelector('#usuarios tbody').outerHTML = listadoHtml;
}

async function eliminarUsuario(id){

    if (!confirm("Desea eliminar el usuario?")) {
        return;
    }

    const request = await fetch('api/usuario/' + id, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    location.reload();
    alert("Usuario Eliminado");
}

async function editarUsuario(id){
        const request = await fetch(`api/usuario/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        location.reload();
    }

    async function registrarUsuario() {
        const request = await fetch('api/usuario', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            //Convierte objetos de JS a JSON
            body: JSON.stringify({
                Rol: document.querySelector('#txtRol').value,
                Nombre: document.querySelector('#txtNombre').value,
                Apellido: document.querySelector('#txtApellido').value,
                Telefono: document.querySelector('#txtTelefono').value,
                Email: document.querySelector('#txtEmail').value,
                Contrasena: document.querySelector('#txtPassword').value,
                Estado: document.querySelector('#txtEstado').value
            })
        })   
    }