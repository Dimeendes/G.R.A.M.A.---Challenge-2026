# G.R.A.M.A.---Challenge-2026

## INTEGRANTES 👥


| Nome  | RM |
| --- | --- |
| Diego Antonio Silva Mendes | 565509 |
| Thiago Sobral de Alvarenga | 562695 |
| Pedro Miranda Campos Riato | 562117 |
| Israel Karacsony de Camargo Nunes | 563435 |
| Giovanni de Lela Anjos Costa | 563066 |
| Gabriel Hiro Nakamura | 562221 |


## DESCRIÇÃO 📄

 A G.R.A.M.A. foi criada como uma solução para um problema enfrentado pela empresa Motiva: a imprecisão e dificuldade no controle do monitoramento da poda da vegetação presente nas margens das estradas.
  
  Como informado, a empresa atualmente está perdendo dinheiro com um processo considerado arcaico, onde funcionários são instruídos a irem realizar a poda em locais que ainda não estão prontos, ou demoram muito para serem alertados da necessidade do trabalho.  
 
  Visando isso, nós, alunos do segundo semestre de ciências da computação da FIAP, precisamos criar um processo automatizado que diminua os erros e perda de dinheiro, tornando a poda mais eficaz, o que aumenta a segurança nas estradas.
  
  Este projeto toma como base a utilização de sensores LiDAR instalados na beira da estrada. Os sensores fazem a medição autônoma da altura da grama uma vez por semana e envia esses dados para nosso APP que poderá ser acessado pelos responsáveis pelo corte da grama e seus gestores. 
  
  O app conta com as seguintes funcionalidades: 
  
    Página de monitoramento dos sensores, 
    Históricos de leituras, 
    Página de ordem de serviço que pode ser gerenciada pelos próprios gestores,
    Mapa em tempo real com estado da altura da grama em diferentes trechos

## ROADMAP 🗺️

- [x] Implementação dos sensores LiDAR
- [x] Exibição dos dados reais no FrontEnd
- [x] Mapa interativo dos sensores 
- [x] Algoritmo preditivo de poda
- [x] Criação e gestão de ordens de serviço 
- [x] Implementar diferenciação maior entre as páginas de funcionário e gestor

## Fluxo da solução 🔀

**Cenário 1:** vaso de grama para simulação de captação de dados
- **Resultado esperado:** obter valor da altura de grama pelo menos 80% similar ao valor real
- **Resultado obtido:** O resultado obtido foi de 93% similar ao dado real
- **Status:** Passou 

**Cenário 2:** envio das medições dos sensores para a API
- **Resultado esperado:** enviar os dados de identificação, rodovia, quilômetro e altura da grama para a API e receber confirmação de salvamento
- **Resultado obtido:** medições são enviadas com sucesso
- **Status:** Passou

**Cenário 3:** consulta das medições mais recentes na página de sensores
- **Resultado esperado:** exibir os sensores cadastrados com suas respectivas rodovias, quilômetros, alturas e estados de alerta
- **Resultado obtido:** consulta de medições mais recentes realizada com sucesso
- **Status:** Passou

**Cenário 4:** visualização dos sensores no mapa
- **Resultado esperado:** apresentar os sensores em suas localizações e indicar visualmente a condição da vegetação em cada trecho
- **Resultado obtido:** visualização realizada com sucesso
- **Status:** Passou

**Cenário 5:** criação e acompanhamento de uma ordem de serviço
- **Resultado esperado:** permitir que o gestor crie uma ordem para um trecho que precisa de poda e que a equipe consulte as informações da ordem
- **Resultado obtido:** criação e acompanhamento de OS realizadas com sucesso
- **Status:** Passou

## INSTALANDO DEPENDENCIAS do projeto para testes em emulador📦

- `python -m pip install pandas`
- `python -m pip install Flask`
- `python -m pip install flask-cors`
- `python -m pip install pyserial`
- `python -m pip install requests`
- `npm install`
- Chave API da google de mapa e rota no .env

## COMANDO PARA INICIALIZAR O PROJETO ▶️

`npm run dev`

## Telas do APP 📱

| Login | Home | Mapa |
|--|--|--|
| <img width="270" height="600" alt="login" src="https://github.com/user-attachments/assets/65416333-b268-458b-a5a7-00e26197e380" /> | <img width="270" height="600" alt="Screenshot_1792773784" src="https://github.com/user-attachments/assets/d511267c-2eae-4976-bf62-fa4bf32f6c08" /> | <img width="270" height="600" alt="mapa" src="https://github.com/user-attachments/assets/9a11eaf2-d5c0-4cc2-bd7f-af5dd1f27c98" /> |
| Sensores | Ordens de Serviço |
| <img width="270" height="600" alt="sensores" src="https://github.com/user-attachments/assets/d4b4317e-a3e9-441e-9e18-76e104b03263" /> | <img width="270" height="600" alt="OS" src="https://github.com/user-attachments/assets/41fb160e-3110-4171-b7d3-ad65a9d8c318" /> |

## Plano de negócio 💼

### Proposta de valor

A G.R.A.M.A. transforma o monitoramento da vegetação às margens das rodovias em um processo orientado por dados. Sensores LiDAR coletam medições da altura da grama, e a plataforma organiza essas informações em um mapa, gerenciamento de leituras e ordens de serviço.

Com isso, a equipe pode identificar trechos que precisam de atenção e priorizar o trabalho com base nas condições observadas. A proposta é reduzir deslocamentos e podas desnecessárias, melhorar a identificação de trechos que exigem intervenção e contribuir para a segurança nas rodovias.

### Personas e público-alvo

- **Gestor de operações rodoviárias:** acompanha diferentes trechos, consulta indicadores e cria ordens de serviço para poda de locais necessáros.
- **Equipe de campo:** consulta as ordens recebidas e as informações do trecho que deve ser atendido.

O público-alvo inicial são concessionárias de rodovias e empresas responsáveis pela manutenção de vias, especialmente aquelas que precisam monitorar extensas áreas de vegetação com equipes distribuídas.

### Modelo de receita

O modelo sugerido combina **assinatura da plataforma** com opções de implantação e operação:

- **Assinatura SaaS:** cobrança mensal ou anual pelo acesso ao painel, mapa, histórico, alertas e gestão de ordens de serviço.
- **Cobrança por ponto monitorado:** valor recorrente definido de acordo com a quantidade de sensores ou trechos acompanhados.
- **Implantação e integração:** cobrança inicial por instalação, configuração, treinamento e integração com sistemas da contratante.
- **Serviço gerenciado:** operação, suporte e acompanhamento dos sensores e da plataforma, conforme o nível de serviço acordado.
- **Licenciamento corporativo:** alternativa para clientes que prefiram hospedar ou operar a solução em sua própria infraestrutura.

A precificação deve ser definida após avaliação da necessidade do interessado, considerando a quantidade de sensores, a extensão monitorada, a conectividade disponível, o suporte necessário e os custos de instalação.

### Estimativa de custos operacionais

**Preço de cada kit: R$ 410**
Cada kit possui:
- Sensor LiDAR TF-Luna
- Micro Servo Motor
- ESP32

Os valores não incluem instalação dos sensores. esses itens devem ser orçados separadamente antes da implantação comercial.

### Principais riscos e formas de mitigação

- **Falha ou imprecisão dos sensores:** realizar calibração periódica, testes em campo e acompanhamento da qualidade das leituras.
- **Condições ambientais e desgaste dos equipamentos:** proteger os dispositivos e estabelecer rotinas de inspeção e manutenção.
- **Baixa adesão dos usuários:** oferecer treinamento e manter interfaces e fluxos adequados às rotinas de gestores, supervisores e equipes de campo.
- **Custos de implantação maiores que o previsto:** validar fornecedores, infraestrutura e custos de manutenção antes de ampliar o número de pontos monitorados.

### Diferenciais da solução frente ao problema da Motiva

- **Monitoramento automatizado:** substitui decisões dependentes apenas de inspeções manuais por dados coletados nos trechos.
- **Priorização do trabalho:** ajuda a direcionar as equipes para locais que precisam de poda, evitando intervenções prematuras.
- **Informação centralizada:** reúne leituras recentes, predição de nível crítico e localização dos sensores em uma única plataforma.
- **Acompanhamento operacional:** permite criar e acompanhar ordens de serviço a partir das necessidades identificadas.
- **Potencial de planejamento preventivo:** O algoritmo preditivo podem apoiar a antecipação das próximas intervenções.
- **Validação prática:** nos testes descritos neste projeto, a medição simulada apresentou 93% de similaridade em relação ao valor real utilizado como referência.

## Stack tecnológica 🛠️

- **Aplicativo:** JavaScript, React Native e Expo, com navegação pelo Expo Router.
- **Mapas e localização:** Google Maps/Routes API.
- **Backend e API:** Python com Flask e Flask-CORS, disponibilizando dados e serviços para o aplicativo.
- **Banco de dados:** SQLite, para armazenamento das medições dos sensores.
- **Processamento e previsão:** Python e pandas, usados no tratamento do histórico e na estimativa do crescimento da vegetação.
- **Sensores e comunicação:** ESP32 com firmware em C++; comunicação entre dispositivos via ESP-NOW e leitura do sensor LiDAR TF-Luna.
- **Comunicação com o aplicativo:** requisições HTTP com respostas em JSON.
- **Ferramentas de desenvolvimento:** npm para gerenciamento das dependências JavaScript e pip para as dependências Python.

## Resumo das entregas por sprint 🏃

- Sprint 1: Explicação do projeto, protótipo navegável e requisitos
- Sprint 2: Desenvolvimento do app porém ainda com dados mockados
- Sprint 3: Protótipo funcional completo, testes manuais e planos de ajustes para a finalização do projeto
- Sprint 4: Versão final do projeto, APK instalável e plano de negócio

## Link para download do app 📱

https://drive.google.com/file/d/1MgSRTdaOpnfiXVJhCEMrjGfdQXtOPGu_/view?usp=sharing

## Apresentação do projeto 🎥

[Clique aqui para assistir um vídeo explicando o projeto](https://youtu.be/bOg8mi45DaQ)
