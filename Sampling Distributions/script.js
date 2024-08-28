// Definimos los parámetros de la distribución normal truncada
const media = 6.5;
const varianza = 9;
const desviacionEstandar = Math.sqrt(varianza);
const a = 0, b = 24;

// Generamos la distribución truncada
function truncNormalDist(x, mean, sd, min, max) {
    const normalPdf = (x, mean, sd) => (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
    const Z = normalPdf(min, mean, sd) - normalPdf(max, mean, sd);
    return x.map((xi) => normalPdf(xi, mean, sd) / Z);
}

// Generamos 1000 valores igualmente espaciados para graficar la PDF
const x = Array.from({ length: 1000 }, (_, i) => i * 19 / 999);
const pdf = truncNormalDist(x, media, desviacionEstandar, a, b);

// Inicializamos los gráficos
function plotInitialGraphs() {
    // Configuración del gráfico de distribución
    const distribucionTrace = {
        x: x,
        y: pdf,
        mode: 'lines',
        line: { color: 'blue' },
        name: `Dist. Truncada(${media}, ${varianza})`
    };

    // Agregamos la línea vertical para la media
    const mediaLine = {
        x: [media, media],
        y: [0, Math.max(...pdf)],
        mode: 'lines',
        line: {
            color: 'red',
            width: 2,
            dash: 'dashdot'
        },
        name: 'Media'
    };

    // Coloreamos el área a la derecha de la media
    const fillArea = {
        x: x.filter((xi) => xi >= media),
        y: pdf.filter((_, i) => x[i] >= media),
        type: 'scatter',
        mode: 'lines',
        line: { color: 'rgba(255, 0, 0, 0.5)' }, // Color suave
        fill: 'tozeroy',
        name: 'Área derecha de la media'
    };


    const layoutDistribucion = {
        title: 'Distribución Normal Truncada',
        xaxis: { title: 'Horas de descanso' },
        yaxis: { title: 'Densidad de probabilidad' },
        showlegend: true
    };

    Plotly.newPlot('grafico-distribucion', [distribucionTrace, mediaLine, fillArea], layoutDistribucion);

    // Configuración inicial del gráfico de muestra
    const layoutMuestra = {
        title: 'Distribución de la Muestra',
        xaxis: { title: 'Horas de descanso' },
        yaxis: { title: 'Frecuencia relativa' },
        showlegend: false
    };

    Plotly.newPlot('grafico-muestra', [], layoutMuestra);
}

function actualizarGraficos(tamanoMuestra, mediaMuestral) {
    // Genera la muestra aleatoria de la distribución truncada
    const muestra = Array.from({ length: tamanoMuestra }, () => {
        let sample;
        do {
            sample = media + desviacionEstandar * Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
        } while (sample < a || sample > b);
        return sample;
    });

    // Configuración del histograma de muestra
    const histData = {
        x: muestra,
        type: 'histogram',
        nbinsx: 40,
        marker: { color: 'green' },
        opacity: 0.7,
        histnorm: 'percent'
    };

    const layoutMuestra = {
        title: {
            text: `Distribución de la Muestra con Tamaño ${tamanoMuestra} y Media ${mediaMuestral}`,
            font: {
                size: 14 // Ajusta el tamaño del título aquí
            }
        },
        xaxis: { title: 'Horas de descanso' },
        yaxis: { title: 'Frecuencia relativa' },
        showlegend: false
    };
    

    // Calcula el puntaje z y la probabilidad
    const zScore = (mediaMuestral - media) / (desviacionEstandar / Math.sqrt(tamanoMuestra));
    const probabilidad = (1 - jStat.normal.cdf(zScore, 0, 1)) * 100;

    // Actualiza los textos de probabilidad y z-score
    document.getElementById('probabilidad-texto').innerText = `Probabilidad de media muestral mayor o igual a ${mediaMuestral}: ${probabilidad.toFixed(4)}%`;
    document.getElementById('z-score-texto').innerText = `Fórmula del puntaje z: (${mediaMuestral} - ${media}) / (${desviacionEstandar} / √${tamanoMuestra}) = ${zScore.toFixed(4)}`;

    // Dibuja el gráfico de la muestra actualizada
    Plotly.react('grafico-muestra', [histData], layoutMuestra);

    // Actualiza la línea de la media en el gráfico de distribución
    const mediaLine = {
        x: [mediaMuestral, mediaMuestral],
        y: [0, Math.max(...pdf)],
        mode: 'lines',
        line: {
            color: 'red',
            width: 2,
            dash: 'dashdot'
        },
        name: 'Media'
    };

    // Actualiza el área a la derecha de la media en el gráfico de distribución
    const fillArea = {
        x: x.filter((xi) => xi >= mediaMuestral),
        y: pdf.filter((_, i) => x[i] >= mediaMuestral),
        type: 'scatter',
        mode: 'lines',
        line: { color: 'rgba(255, 0, 0, 0.5)' }, // Color suave
        fill: 'tozeroy',
        name: 'Área derecha de la media'
    };

    // Trazado de la distribución truncada
    const distribucionTrace = {
        x: x,
        y: pdf,
        mode: 'lines',
        line: { color: 'blue' },
        name: `Dist. Truncada(${media}, ${varianza})`
    };

    // Configuración del gráfico de distribución
    const layoutDistribucion = {
        title: 'Distribución Normal Truncada',
        xaxis: { title: 'Horas de descanso' },
        yaxis: { title: 'Densidad de probabilidad' },
        showlegend: true
    };

    // Actualiza el gráfico de distribución con la nueva línea de media y área sombreada
    Plotly.react('grafico-distribucion', [distribucionTrace, mediaLine, fillArea], layoutDistribucion);
}

// Inicializa los sliders
function initializeSliders() {
    const sliderTamanoMuestra = document.getElementById('slider-tamano-muestra');
    const sliderMediaMuestral = document.getElementById('slider-media-muestral');

    noUiSlider.create(sliderTamanoMuestra, {
        start: 100,
        connect: [true, false],
        range: { min: 10, max: 1000 },
        step: 10,
        tooltips: true,
        format: {
            to: (value) => Math.round(value),
            from: (value) => Number(value)
        }
    });

    noUiSlider.create(sliderMediaMuestral, {
        start: 6,
        connect: [true, false],
        range: { min: 0, max: 24 },
        step: 0.5,
        tooltips: true
    });

    // Event listeners para actualizar gráficos
    sliderTamanoMuestra.noUiSlider.on('update', (values, handle) => {
        const tamanoMuestra = Number(values[0]);
        const mediaMuestral = sliderMediaMuestral.noUiSlider.get();
        actualizarGraficos(tamanoMuestra, Number(mediaMuestral));
    });

    sliderMediaMuestral.noUiSlider.on('update', (values, handle) => {
        const mediaMuestral = Number(values[0]);
        const tamanoMuestra = sliderTamanoMuestra.noUiSlider.get();
        actualizarGraficos(Number(tamanoMuestra), mediaMuestral);
    });
}

// Inicializa la página
document.addEventListener('DOMContentLoaded', () => {
    plotInitialGraphs();
    initializeSliders();
});
