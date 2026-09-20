# Sistema de Denúncias

Este projeto é um protótipo de Sistema Web de Denúncias Anônimas, desenvolvido com HTML5, CSS3 e JavaScript. O design é inspirado em uma estética de mistério "dark", remetendo aos becos e delegacias da cidade de Nova York no início do século XX (anos 1900).

## Estrutura do Projeto

* `index.html`: Arquivo principal contendo a estrutura semântica das páginas e as interfaces do sistema.
* `css/`: Diretório que contém os arquivos de folha de estilo (CSS) responsáveis pelo visual "dark 1900s", layout responsivo e tipografia.
* `js/`: Diretório que armazena os scripts JavaScript responsáveis pela lógica da aplicação, alternância de perfis e gerenciamento simulado das denúncias.
* `README.md`: Este arquivo com a documentação do projeto.

## Funcionalidades

O sistema possui dois perfis de acesso distintos: **Cidadão (Denunciante)** e **Delegacia (Administrador)**. A alternância entre os perfis é feita de forma dinâmica na própria interface.

### Perfil: Cidadão (Denunciante)

* **Formulário de Denúncia:** Permite o envio de denúncias anônimas de forma segura, com os seguintes campos:
  * Tipo de Crime (Assalto, Contrabando, Corrupção, Outros)
  * Localização do Ocorrido
  * Descrição detalhada do evento
  * *Evidências fotográficas (simulação de anexo)*
* **Acompanhamento (Simulado):** Permite inserir um código gerado (ex: DEN-1234) para consultar o status de uma denúncia registrada anteriormente.

### Perfil: Delegacia (Administrador)

* **Painel de Controle (Dashboard):** Visão geral rápida com estatísticas, como o total de denúncias recebidas e o número de casos pendentes de investigação.
* **Lista de Denúncias:** Exibe uma tabela gerencial com todas as denúncias registradas, incluindo:
  * Código de Rastreio
  * Tipo de Crime
  * Data e Hora do registro
  * Status atual (Pendente, Em Investigação, Arquivado)
  * Botão de ação "Detalhes"
* **Detalhes da Denúncia (Modal):** Ao clicar em "Detalhes", um modal (janela sobreposta) é aberto exibindo as informações completas reportadas e permitindo que a autoridade altere o status da investigação.

## Tecnologias Utilizadas

* **HTML5:** Para a marcação e estruturação da aplicação.
* **CSS3:** Para a estilização visual, garantindo a estética da época e a responsividade (adaptável para celulares e desktops).
* **JavaScript (Vanilla):** Responsável por toda a interatividade, manipulação do DOM e lógica de simulação de dados sem a necessidade de bibliotecas externas complexas.

## Limitações do Protótipo

* **Persistência de Dados:** Os dados das denúncias são armazenados temporariamente na memória do navegador. Ao recarregar a página, as informações criadas na sessão atual serão perdidas e os dados simulados originais serão restaurados.
* **Backend:** Não há conexão com banco de dados real. Este é um protótipo focado na experiência do usuário (Front-end).
* **Upload de Imagens:** O envio de evidências pelo formulário é apenas visualmente representativo.

## Design e Otimização

* A interface é totalmente responsiva.
* Uso de cores escuras (tons de carvão e sépia), fontes clássicas (com serifa para remeter a jornais/documentos antigos) e bordas sutis para criar a atmosfera de mistério.
* A separação de arquivos (HTML, CSS e JS) garante um código limpo, fácil manutenção e melhor performance de carregamento.
