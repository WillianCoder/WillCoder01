// Espera o documento ser carregado completamente antes de executar o código
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os links dentro de 'nav ul li a'
    const links = document.querySelectorAll('nav ul li a');

    // Adiciona um evento de clique para cada link
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            // Exibe um alerta com o texto do link clicado
            // Evitar comportamento padrão do link
            event.preventDefault();

            // Obter o ID da seção a ser exibida
            const targetId = link.getAttribute('href').substring(1);

            // Esconder todas as seções
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                    section.style.display = 'none';
            });

            // Mostrar a seção alvo
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            alert(`Você Clicou no link: ${event.target.textContent}`);
        });
    });
});

// Mostrar apenas a seção incial ao carregar a página
document.getElementById('home').style.display = 'block';
});