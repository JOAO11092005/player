// Seleção de elementos HTML
const video = document.getElementById("videoPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const timeDisplay = document.getElementById("videoTime");
const seekBar = document.getElementById("videoSeek");
const muteIcon = document.getElementById("muteIcon");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.querySelector(".video-controls");
const loader = document.getElementById("loader");
const voltar = document.querySelector('.voltar');
const videoTimeRemaining = document.getElementById("videoTimeRemaining");
const fundopreto = document.querySelector('.fundopreto');

let mouseMoveTimeout;
let fundoTimeout;

// Função para alternar entre reproduzir e pausar o vídeo e atualizar o ícone
function togglePlayPause() {
    if (video.paused || video.ended) {
        video.play().catch(error => console.error("Erro ao iniciar o vídeo:", error));
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        video.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Função para avançar o vídeo em segundos
function forwardVideo(seconds) {
    video.currentTime = Math.min(video.duration || 0, video.currentTime + seconds);
}

// Função para retroceder o vídeo em segundos
function rewindVideo(seconds) {
    video.currentTime = Math.max(0, video.currentTime - seconds);
}

// Função para atualizar a barra de progresso, o display de tempo do vídeo e o tempo restante
function updateProgress() {
    if (!isNaN(video.duration)) {
        // Atualiza a barra de progresso
        seekBar.value = (video.currentTime / video.duration) * 100;

        // Tempo atual do vídeo em MM:SS
        const minutes = Math.floor(video.currentTime / 60);
        const seconds = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${minutes}:${seconds}`;

        // Tempo restante em HH:MM:SS
        const remainingTime = video.duration - video.currentTime;
        const hours = Math.floor(remainingTime / 3600);
        const remainingMinutes = Math.floor((remainingTime % 3600) / 60);
        const remainingSeconds = Math.floor(remainingTime % 60).toString().padStart(2, '0');
        videoTimeRemaining.textContent = `-${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds}`;
    }
}

// Função para buscar para um ponto específico do vídeo
function seekVideo() {
    if (!isNaN(video.duration)) {
        video.currentTime = (seekBar.value / 100) * video.duration;
    }
}

// Função para alternar entre mudo e som e atualizar o ícone de volume
function toggleMute() {
    video.muted = !video.muted;
    muteIcon.className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
}

// Função para alternar o modo de tela cheia
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => console.error(`Erro ao tentar ativar o fullscreen: ${err.message}`));
    } else {
        document.exitFullscreen();
    }
}

// Função para carregar o vídeo a partir do URL codificado
function loadVideo() {
    const params = new URLSearchParams(window.location.search);
    const videoUrlCodificada = params.get('videoUrl');

    if (videoUrlCodificada) {
        const videoUrl = atob(videoUrlCodificada);
        console.log("URL decodificada:", videoUrl);

        // Usar o link direto fornecido
        video.src = videoUrl;

        // Configurações do vídeo
        video.volume = 1.0;
        video.muted = false;
        video.load();

        video.addEventListener('canplay', () => {
            video.play().catch(error => console.error("Erro ao iniciar o vídeo:", error));
            loader.classList.add("hidden");
        });

        video.addEventListener('progress', updateLoadingProgress);
    } else {
        console.error("Nenhum link de vídeo encontrado.");
    }
}

// Função para exibir o link de vídeo no player para o usuário
function displayVideoLink() {
    const params = new URLSearchParams(window.location.search);
    const videoUrlCodificada = params.get('videoUrl');

    if (videoUrlCodificada) {
        const videoUrl = atob(videoUrlCodificada);
        const videoLinkElement = document.getElementById("videoLink");
        videoLinkElement.textContent = videoUrl; // Exibe o link para o usuário
        videoLinkElement.href = videoUrl; // Torna o link clicável para o usuário
    }
}

// Função para atualizar o progresso do carregamento do vídeo
function updateLoadingProgress() {
    let buffered = video.buffered;
    if (buffered.length > 0) {
        let loaded = (buffered.end(0) / video.duration) * 100;
        loader.style.display = loaded < 100 ? 'block' : 'none';
    }
}

// Mostra o indicador de carregamento quando o vídeo está em espera para carregar
video.addEventListener("waiting", () => {
    loader.classList.remove("hidden");
});

// Oculta o indicador de carregamento quando o vídeo começa a reproduzir
video.addEventListener("playing", () => {
    loader.classList.add("hidden");
});

// Atualiza o progresso do vídeo e tempo durante a reprodução
video.addEventListener("timeupdate", updateProgress);
seekBar.addEventListener("input", seekVideo);

// Função para ocultar os controles do vídeo e fundo preto
function hideControls() {
    videoControls.classList.add("hidden");
    voltar.classList.add("hidden");
    fundopreto.classList.add("hidden");
}

// Função para mostrar os controles do vídeo e fundo preto
function showControls() {
    videoControls.classList.remove("hidden");
    voltar.classList.remove("hidden");
    fundopreto.classList.remove("hidden");
}

// Atualiza o temporizador para ocultar os controles após inatividade do mouse
function resetMouseMoveTimeout() {
    showControls();
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(hideControls, 3000);
}

// Detecta movimento do mouse para resetar o timer de ocultação de controles
document.addEventListener("mousemove", resetMouseMoveTimeout);

// Função para ocultar o fundo preto e os controles após inatividade
function hideBackgroundAndControls() {
    fundopreto.classList.add('hidden'); // Oculta o fundo preto
    videoControls.classList.add("hidden"); // Oculta os controles
    voltar.classList.add("hidden"); // Oculta o botão de voltar
}

// Função para mostrar o fundo preto e os controles novamente
function showBackgroundAndControls() {
    fundopreto.classList.remove('hidden'); // Mostra o fundo preto
    videoControls.classList.remove("hidden"); // Mostra os controles
    voltar.classList.remove("hidden"); // Mostra o botão de voltar
    clearTimeout(fundoTimeout); // Limpa o timeout de ocultação
    fundoTimeout = setTimeout(hideBackgroundAndControls, 3000); // Oculta após 3 segundos de inatividade
}

// Detecta movimento do mouse e reinicia o contador de tempo
document.addEventListener('mousemove', () => {
    showBackgroundAndControls();
});

// Inicializa o vídeo ao carregar a página
window.onload = loadVideo;
resetMouseMoveTimeout();
