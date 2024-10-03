const formulario = document.querySelector('#agregar-gasto')
const gastoListado = document.querySelector('#gastos ul')

//Events
eventListener()
function eventListener() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto)

    formulario.addEventListener('submit', agregarGasto)
}

//Classes
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto)
        //Ya que el presupuesto y el restante en un principio son iguales es por eso que toma el mismo valor "restante"
        this.restante = Number( presupuesto )
        this.gastos = []
    }

    nuevoGasto(gasto) {
        //Toma una copia de this.gastos y lo agrega a gasto que es el parámetro que contiene los valores extraidos de la función
        this.gastos = [...this.gastos, gasto]
        // console.log(this.gastos)
        this.calcularRestante()
        // this.eliminarGasto()
    }

    calcularRestante() {
        //gasto dentro del reduce es cada valor dentro de this.gastos
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0)

        this.restante = this.presupuesto - gastado

    }

    eliminarGasto(id) {
        // console.log("desde la clase", id)
        this.gastos = this.gastos.filter(gasto => gasto.id !== id)
        // console.log(this.gastos)
        this.calcularRestante()
    }
} 

class Ui {
    insetarPresupuesto(cantidad) {
        //Extremos todos los valores
        const { presupuesto, restante } = cantidad
        
        //Agregamos al HTML
        document.querySelector('#total').textContent = presupuesto
        document.querySelector('#restante').textContent = restante
    }  
    
    imprimirAlerta(mensaje, tipo) {
        const divMensaje = document.createElement('div')
        divMensaje.classList.add('text-center', 'alert')
        
        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger')
        }else {
            divMensaje.classList.add('alert-success')
        }

        divMensaje.textContent = mensaje

        //Insertar en HTML, se escoge la clase primario que es donde se agregara el mensaje hasta arriba, de igual forma se agrega el insertBefore donde toma dos argumentos
        document.querySelector('.primario').insertBefore(divMensaje, formulario)

        setTimeout(() => {
            divMensaje.remove()
        }, 3000);
    }

    mostrarGastos(gastos) {

        //Para mandar a llamar el método es necesario usar this 
        this.limpiarHTML()
        //una vez extraido los valores de presupuesto podemos usar destructuring
        gastos.forEach(gasto => {

            const {nombre, cantidad, id } = gasto
            //Crear un LI
            const nuevoGasto = document.createElement('li')
            //className te reporta solo las clases que hay en el html
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center'
            // nuevoGasto.setAttribute('data-id', id)
            nuevoGasto.dataset.id = id

            //Agregar el HTML al gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>
            `
            //Agrear botón para borrar el gasto
            const btnBorrar = document.createElement('button')
            
            //classList te da un array con las clases que tiene el elemento HTML y te da métodos que sirve para agregar, eliminar o modificar mas clases 
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto')
            btnBorrar.textContent = 'Borrar X'

            btnBorrar.onclick = () => {
                eliminarGasto(id)
            }
            
            nuevoGasto.appendChild(btnBorrar)

            gastoListado.appendChild(nuevoGasto)
            // console.log(gasto)

        })
    }

    limpiarHTML(){
        while(gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild)
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante
        // console.log(restante)
    }

    calcularPorcentaje(presupuestoObj) {
        const {presupuesto, restante} = presupuestoObj
        const restanteDiv = document.querySelector('.restante') 

        if((presupuesto / 4) > restante) {

            restanteDiv.classList.remove('alert-success', 'alert-warning')
            restanteDiv.classList.add('alert-danger')

        }else if((presupuesto / 2) > restante) {

            restanteDiv.classList.remove('alert-success')
            restanteDiv.classList.add('alert-warning')
        
        }else {
            restanteDiv.classList.remove('alert-warning', 'alert-danger')
            restanteDiv.classList.add('alert-success')
        }

        if(restante <= 0) {
            ui.imprimirAlerta("El presupuesto se ha agotado", "error")
            document.querySelector('button[type="submit"]').disabled = true
        }

    }
}

//Instanciar 
const ui = new Ui()
let presupuesto

//Functions
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt("¿Cuál es tu presupuesto?")

    if(presupuestoUsuario === '' || presupuestoUsuario === null  || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ) {
        
        window.location.reload()
    }

    presupuesto = new Presupuesto(presupuestoUsuario)
    // console.log(presupuesto)
    //Como es global la instancia de la clase podemos mandar a llamar a los métodos de esa clase
    ui.insetarPresupuesto(presupuesto)
}

function agregarGasto(e) {
    e.preventDefault()

    const nombre = document.querySelector('#gasto').value
    const cantidad = Number( document.querySelector('#cantidad').value )
    // console.log(nombre)

    if(nombre === '' || cantidad === ''){
        
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error')
        return

    }else  if( cantidad <= 0 || isNaN(cantidad) ){
        
        ui.imprimirAlerta('Cantidad no válida', 'error')
        return
    }

    //Se podría decir que esto "une" los valores a gastos
    const gasto = {nombre, cantidad, id: Date.now()}

    //Toma los valores extraidos y los agrega al método de nuevoGasto
    presupuesto.nuevoGasto(gasto)

    ui.imprimirAlerta('Gasto agregado correctamente')

    //extraer los gastos de presupuesto
    const { gastos, restante } = presupuesto

    //imprimir los gastos 
    ui.mostrarGastos(gastos)
    ui.actualizarRestante(restante)
    ui.calcularPorcentaje(presupuesto)

    formulario.reset()
}

function eliminarGasto(id) {
    const {gastos, restante} = presupuesto
    //Elimina del objeto
    presupuesto.eliminarGasto(id)
    //Elimina en el HTML
    ui.mostrarGastos(gastos)
    ui.actualizarRestante(restante)
    ui.calcularPorcentaje(presupuesto)
}
