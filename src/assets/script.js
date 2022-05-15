let todaLaInfoQuery;

//Api call

const url = "http://localhost:3000/";

let sesionA = async (desde, hasta) => {

    let objetoFinal = {
        sesionesActivas: 0,
        diaAnalizado: [],
        detalle: [],
    };

    await axios.get(url + `${desde}-${hasta}`).then((data) => {
        console.log(data.data)

        let log = data.data


        //Variables para ordenar los datos

        let objetoDia = {
            sesionesActivas: 0,
            fecha: "",
            usuariosConPerfil: [],
            diaAnalizado: [],
            detalle: [],
        }

        let losFamosos15min = 15 * 60 * 1000;


        //A este le llamo el pesadillas
        for (let index = 0; index < log.length; index++) {

            const esteUserId = log[index].userid;

            let milisegundosDelDia = ((parseInt(log[index].fecha.slice(11, 13)) * 60 +
                parseInt(log[index].fecha.slice(14, 16))) * 60 +
                parseInt(log[index].fecha.slice(17, 19))) * 1000 +
                parseInt(log[index].fecha.slice(20, 23));

            //El primer if inicializa todo si es el primer dia
            if (objetoDia.fecha == "") {
                objetoFinal.sesionesActivas++;
                objetoDia.sesionesActivas++;
                //nuevo día
                objetoDia.fecha = log[index].fecha.slice(0, 10);
                objetoDia.detalle[esteUserId] = {
                    usuario: esteUserId,
                    tiempoEnMiliS: milisegundosDelDia,
                    numeroDeSesion: 1,
                    duracionSesionHoy: 0,
                    intervalosHoy: [],
                    company: log[index].companyid,
                    anio: log[index].fecha.slice(0, 4),
                    mes: log[index].fecha.slice(5, 7),
                    dia: log[index].fecha.slice(8, 10)
                };
                objetoDia.usuariosConPerfil.push(log[index].userid);
            };

            if (!objetoDia.detalle[esteUserId]) {
                objetoDia.sesionesActivas++
                objetoFinal.sesionesActivas++; //un nuevo usuari oes una nueva sesion

                objetoDia.detalle[esteUserId] = {
                    usuario: esteUserId,
                    tiempoEnMiliS: milisegundosDelDia,
                    numeroDeSesion: 1,
                    duracionSesionHoy: 0,
                    intervalosHoy: [],
                    company: log[index].companyid,
                    anio: log[index].fecha.slice(0, 4),
                    mes: log[index].fecha.slice(5, 7),
                    dia: log[index].fecha.slice(8, 10)
                };
                objetoDia.usuariosConPerfil.push(log[index].userid);
            };


            let diferencia = milisegundosDelDia - objetoDia.detalle[esteUserId].tiempoEnMiliS;

            //revision
            // console.log(`${index} tiene ${milisegundosDelDia} y se resta ${objetoDia.detalle[esteUserId].tiempoEnMiliS} con  diferencia ${diferencia}, luego se compara con ${losFamosos15min}`)

            //Este primer if revisa si se cambió de día y lo reinicia
            if (objetoDia.fecha != "" && objetoDia.fecha != log[index].fecha.slice(0, 10)) {

                objetoFinal.sesionesActivas++;
                objetoFinal.diaAnalizado.push(objetoDia.fecha);
                objetoFinal.detalle.push(objetoDia);

                //limpiar
                objetoDia = {
                    sesionesActivas: 1,
                    fecha: "",
                    usuariosConPerfil: [],
                    diaAnalizado: [],
                    detalle: [],
                };


                //nuevo día
                objetoDia.fecha = log[index].fecha.slice(0, 10);
                objetoDia.detalle[esteUserId] = {
                    usuario: esteUserId,
                    tiempoEnMiliS: milisegundosDelDia,
                    numeroDeSesion: 1,
                    duracionSesionHoy: 0,
                    intervalosHoy: [],
                    company: log[index].companyid,
                    anio: log[index].fecha.slice(0, 4),
                    mes: log[index].fecha.slice(5, 7),
                    dia: log[index].fecha.slice(8, 10)
                };
                objetoDia.usuariosConPerfil.push(log[index].userid);

            }


            // Si la diferencia es menor a 15 min contados en milisegundos y el contador no esta en 0, 
            // se modifican los comparadores y se registran, se busca la siguiente llamada
            if (diferencia <= losFamosos15min && !(diferencia < 0)) {


                objetoDia.detalle[esteUserId].duracionSesionHoy += diferencia;
                objetoDia.detalle[esteUserId].intervalosHoy.push(diferencia);
                objetoDia.detalle[esteUserId].tiempoEnMiliS = milisegundosDelDia;
            }

            // Si la diferencia es mayor a 15 mins se suma una sesión
            if (diferencia > losFamosos15min) {

                objetoDia.sesionesActivas++;
                objetoFinal.sesionesActivas++;

                objetoDia.detalle[esteUserId].duracionSesionHoy += diferencia;
                objetoDia.detalle[esteUserId].intervalosHoy.push(diferencia);
                objetoDia.detalle[esteUserId].tiempoEnMiliS = milisegundosDelDia;
                objetoDia.detalle[esteUserId].numeroDeSesion += 1;

                //limpiar
                objetoDia = {
                    sesionesActivas: 0,
                    fecha: "",
                    usuariosConPerfil: [],
                    diaAnalizado: [],
                    detalle: [],
                };

            };

            if (index == (log.length - 1)) {
                objetoFinal.detalle.push(objetoDia)

            };

        }; //Fin del ciclo for, porfin

        document.getElementById("burritoDeCarga").innerHTML = ``;
        console.log("sesion A")
        console.log(objetoFinal)

    })

    return objetoFinal
};



const char1DataBuilder = async (objetoFinal) => {

    let data = {
        labels: [],
        datasets: [{
            label: 'Sesiones activas por día',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };

    for (let index = 0; index < objetoFinal.detalle.length; index++) {
        if (!data.labels.includes(objetoFinal.detalle[index].fecha)) {
            data.labels.push(objetoFinal.detalle[index].fecha)
            data.datasets[0].data.push(objetoFinal.detalle[index].sesionesActivas)
        }
    };

    return data

};


const char2DataBuilderCompany = async (objetoFinal, companyId) => {

    let data = {
        labels: [],
        datasets: [{
            label: `Sesiones activas por día de compañía ${companyId}`,
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };

    let filtroSesion = 0;

    for (let index = 0; index < objetoFinal.detalle.length; index++) {


        if (!data.labels.includes(objetoFinal.detalle[index].fecha)) {

            let e = objetoFinal.detalle[index].detalle;


            for (let i = 0; i < e.length; i++) {
                if (e[i] && e[i].company == companyId) {
                    filtroSesion++;
                }
            };

            data.labels.push(objetoFinal.detalle[index].fecha);
            data.datasets[0].data.push(filtroSesion);
            filtroSesion = 0;
        }

    };

    return data

};

const char3DataBuilderUser = async (objetoFinal, userId) => {

    let data = {
        labels: [],
        datasets: [{
            label: `Sesiones activas por día de usuario ${userId}`,
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };

    let filtroSesion = 0;

    for (let index = 0; index < objetoFinal.detalle.length; index++) {

        if (!data.labels.includes(objetoFinal.detalle[index].fecha)) {

            let e = objetoFinal.detalle[index].detalle;

            for (let index = 0; index < e.length; index++) {
                if (e[index] && e[index].usuario == userId) {
                    filtroSesion++;
                }
            };

            data.labels.push(objetoFinal.detalle[index].fecha);
            data.datasets[0].data.push(filtroSesion);
            filtroSesion = 0;
        }

    };

    return data

};

const char4DataBuilderIntervaloActivoXDia = async (objetoFinal) => {

    let data = {
        labels: [],
        datasets: [{
            label: `Tiempo de intervalos activos por día (en minutos)`,
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };


    let intervaloActivoDelDia = 0;

    for (let index = 0; index < objetoFinal.detalle.length; index++) {

        if (!data.labels.includes(objetoFinal.detalle[index].fecha)) {

            let e = objetoFinal.detalle[index].detalle;

            for (let index = 0; index < e.length; index++) {
                if (e[index]) { intervaloActivoDelDia += e[index].duracionSesionHoy; }
            };

            intervaloActivoDelDia = (intervaloActivoDelDia / 1000) / 60; //piden minutos!

            data.labels.push(objetoFinal.detalle[index].fecha);
            data.datasets[0].data.push(intervaloActivoDelDia);
            intervaloActivoDelDia = 0;
        }
    };

    return data

};


const crearTodosLosChartsALoLoco = async (objetoFinal) => {

    // Creacion de charts

    let datapro = await char1DataBuilder(objetoFinal)

    const ctx = document.getElementById('myChart').getContext('2d');
    const config = {
        type: 'line',
        data: datapro,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const myChart = new Chart(ctx, config);

    let datapro4 = await char4DataBuilderIntervaloActivoXDia(objetoFinal)

    const ctx4 = document.getElementById('myChartIntervaloActivoXDia').getContext('2d');
    const config4 = {
        type: 'bar',
        data: datapro4,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const myChart4 = new Chart(ctx4, config4);

};

const crearChart2 = async (id) => {

    let datapro2 = await char2DataBuilderCompany(todaLaInfoQuery, id)

    const ctx2 = document.getElementById('myChartCompanyFilter').getContext('2d');
    const config2 = {
        type: 'line',
        data: datapro2,
        options: {
            scales: {
                y: {
                    beginAtZero: true,

                }
            }
        }
    };

    const myChart2 = new Chart(ctx2, config2);

};

const crearChart3 = async (id) => {

    let datapro3 = await char3DataBuilderUser(todaLaInfoQuery, id)

    const ctx3 = document.getElementById('myChartUserFilter').getContext('2d');
    const config3 = {
        type: 'line',
        data: datapro3,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const myChart3 = new Chart(ctx3, config3);

};

const hideCharts = () => {
    document.getElementById("myChart").style.display = "none";
    document.getElementById("myChartCompanyFilter").style.display = "none";
    document.getElementById("myChartUserFilter").style.display = "none";
    document.getElementById("myChartIntervaloActivoXDia").style.display = "none";
};

window.analizar = async () => {
    let desde = document.getElementById("desde").value;
    let hasta = document.getElementById("hasta").value;

    if (desde && hasta) {
        document.getElementById("burritoDeCarga").innerHTML = `Nuestros monitos estan dibujando tu gráfico, por favor espera <3`;

        document.getElementById("saludo1").style.background = "none";
        document.getElementById("formFecha").style.display = "none";

        document.getElementById("saludo1").innerHTML = "";
        document.getElementById("saludo2").innerHTML = "";

        document.getElementById("submitanaLisis").style.display = "none";
        document.getElementById("otraBusqueda").style.display = "block";

        let objetoFinal = await sesionA(desde, hasta);

        crearTodosLosChartsALoLoco(objetoFinal);

        // sesionA(desde, hasta).then((obj) => { crearTodosLosChartsALoLoco(obj) });

        document.getElementById("informacionActual").innerHTML = `Estas viendo los registros desde el ${desde} hasta el ${hasta} 
                                                        <br> Puedes elegir desplegar otra información con nuestros hermosos botones.`
        document.getElementById("informacionActual").style.display = "block";
        document.getElementById("otrosBotones").style.display = "block";
        document.getElementById("chartDiv").style.display = "block";
        document.getElementById("myChart").style.display = "block";

        todaLaInfoQuery = objetoFinal;

    } else {
        document.getElementById("saludo1").style.background = "rgb(211, 8, 8)";
        document.getElementById("saludo1").innerHTML = "Recuerda ingresar un rango de tiempo";
    };

};


window.sesionesActivas = async () => {
    hideCharts();
    document.getElementById("myChart").style.display = "block";
};

window.filtroCompanias = async () => {
    hideCharts();
    let id = document.getElementById("companyId").value;
    crearChart2(id);
    document.getElementById("myChartCompanyFilter").style.display = "block";
    document.getElementById("companyId").style.display = "none";

};

window.filtroUsuarios = async () => {
    hideCharts();
    let id = document.getElementById("userId").value;
    crearChart3(id);
    document.getElementById("myChartUserFilter").style.display = "block";
    document.getElementById("userId").style.display = "none";
};

window.intervalosXDia = async () => {
    hideCharts();
    document.getElementById("myChartIntervaloActivoXDia").style.display = "block";
};



window.onload = (async () => {


})



