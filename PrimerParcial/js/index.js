var http= new XMLHttpRequest();
var idMateria;
var turno;
var trClick;
var cuatrimestre;
window.onload=function(){
    http.onreadystatechange=callback;
    http.open("GET", "http://localhost:3000/materias", true);
    http.send();
}

function callback(){
    if(http.readyState===4&&http.status===200)
    {
        armarGrilla(JSON.parse(http.response));
    }
}

function armarGrilla(objJson)
{
    var cuerpoTabla=document.getElementById("bodyMaterias");
    for(var i=0;i<objJson.length;i++){
        var tr = document.createElement("tr");
        
        var td4 = document.createElement("td");
        var nodoTexto4 = document.createTextNode(objJson[i].id);
        td4.appendChild(nodoTexto4);
        td4.hidden=true;
        tr.appendChild(td4);
        
        var td = document.createElement("td");
        var nodoTexto = document.createTextNode(objJson[i].nombre);
        td.appendChild(nodoTexto);
        tr.appendChild(td);
        
        var td1 = document.createElement("td");
        var nodoTexto1 = document.createTextNode(objJson[i].cuatrimestre);
        td1.appendChild(nodoTexto1);
        tr.appendChild(td1);

        var td2 = document.createElement("td");
        var nodoTexto2 = document.createTextNode(objJson[i].fechaFinal);
        td2.appendChild(nodoTexto2);
        tr.appendChild(td2);

        var td3 = document.createElement("td");
        var nodoTexto3 = document.createTextNode(objJson[i].turno);
        td3.appendChild(nodoTexto3);
        tr.appendChild(td3);
        tr.addEventListener("dblclick",dblclickGrilla);
        cuerpoTabla.appendChild(tr);
    }   
}

function dblclickGrilla(e){
    document.getElementById("divPopUp").hidden=false;
    trClick=e.target.parentElement;
    var trChild=trClick.childNodes;

    idMateria=trClick.childNodes[0].textContent;
    console.log(idMateria);
    document.getElementById("inpNombre").value=trClick.childNodes[1].textContent;
    var cuatrimestre=seleccionarCuatrimestre(trClick.childNodes[2].textContent);
    document.getElementById("inpCuatrimestre").selectedIndex=cuatrimestre;
    document.getElementById("inpCuatrimestre").disabled=true;
    document.getElementById("inpFechaFinal").value=cargarFecha(trClick.childNodes[3].textContent,"/","-");
    if(trClick.childNodes[4].textContent==="Mañana")
        document.getElementById("mañana").checked=true;
    else
        document.getElementById("noche").checked=true;
}

function seleccionarCuatrimestre(cuatrimestre)
{   
    if(cuatrimestre==="1")
        return 0;
    if(cuatrimestre==="2")
        return 1;
    if(cuatrimestre==="3")
        return 2;
    if(cuatrimestre==="4")
        return 3;
}

function modificarMateria(){
    var rsta=validarDatosIngresados();
    if(rsta===true){
        var inputCuatrimestre = document.getElementById("inpCuatrimestre");
        cuatrimestre = inputCuatrimestre.options[inputCuatrimestre.selectedIndex].value;
        spinner(false);
        //document.getElementById("divSpinner").hidden=false;
        if(document.getElementById("mañana").checked===true)
            turno="Mañana";
        else
            turno="Noche";
        http.onreadystatechange=callBackModificar;
        http.open("POST", "http://localhost:3000/editar", true);
        http.setRequestHeader("Content-Type","application/json")
        var json={"id":idMateria,"nombre":document.getElementById("inpNombre").value,"cuatrimestre":cuatrimestre,"fechaFinal":document.getElementById("inpFechaFinal").value,"turno":turno}
        http.send(JSON.stringify(json));
    }
    else 
        alert("Los datos ingresados son incorrectos, por favor reingrese");
}

function callBackModificar(){
    
    if(http.readyState==4&&http.status==200)
    {
        var rstaJson=JSON.parse(http.response);
        if(rstaJson.type==="ok")
        {
            console.log("respuesta ok");
            var rowsTabla=document.getElementById("bodyMaterias").childNodes;
            for(var i=0;i<rowsTabla.length;i++)
            {
                if(rowsTabla[i].nodeType===1)
                {
                    if(rowsTabla[i].childNodes[0].textContent==idMateria)
                    {
                        rowsTabla[i].childNodes[1].textContent=document.getElementById("inpNombre").value;
                        rowsTabla[i].childNodes[3].textContent=cargarFecha(document.getElementById("inpFechaFinal").value,"-","/");
                        rowsTabla[i].childNodes[4].textContent=turno;
                        document.getElementById("divPopUp").hidden=true;
                        document.getElementById("divSpinner").hidden=true;
                    }
                }
            }
        }
    }
}

function eliminarMateria(){
    spinner(false);
    document.getElementById("divSpinner").hidden=false;
    http.onreadystatechange=function(){
        if(http.readyState==4&&http.status==200)
        {
            spinner(true);
            
            location.reload();
            
        }
    }
    http.open("POST", "http://localhost:3000/eliminar", true);
    http.setRequestHeader("Content-Type","application/json")
    var json={"id":idMateria}
    http.send(JSON.stringify(json));
    document.getElementById("divPopUp").hidden=true;
}

function spinner(ocultar) {
    document.getElementById("divSpinner").hidden=ocultar;
}

function validarDatosIngresados(){
    var rsta=true;
    if(document.getElementById("inpNombre").value.length<6)
    {
        document.getElementById("inpNombre").className="conError";
        rsta=false;
    }
    else{document.getElementById("inpNombre").className="sinError";}
    if(document.getElementById("mañana").checked===false && document.getElementById("noche").checked===false)
    {
        document.getElementById("mañana").className="conError";
        document.getElementById("noche").className="conError";
        rsta=false;
    }
    else{document.getElementById("mañana").className="sinError";document.getElementById("noche").className="sinError";}
    if(!validarFecha())
    {
        document.getElementById("inpFechaFinal").className="conError";
        rsta=false;
    }
    return rsta;
}


function validarFecha(){
    
    var fecha= document.getElementById("inpFechaFinal").value;
    var fechaEnArray = fecha.split("-");
    let data= new Date(fechaEnArray[0],fechaEnArray[1],fechaEnArray[2]);
    var fechaHoy = new Date();
    if(data>fechaHoy)
        return false;
    else
        return true;
}


function cargarFecha(fecha, viejoCaracter, nuevoCaracter){
    var fechaEnArray = fecha.split(viejoCaracter);
    console.log(fechaEnArray);
    let data= new Date();
    var nuevaFecha=fechaEnArray[2]+nuevoCaracter+fechaEnArray[1]+nuevoCaracter+fechaEnArray[0];
    return nuevaFecha;
}

function cancelar()
{
    document.getElementById("divPopUp").hidden=true;
}
