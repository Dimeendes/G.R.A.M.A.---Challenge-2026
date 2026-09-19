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
- [ ] Implementar diferenciação maior entre as páginas de funcionário e gestor

## Fluxo da solução 🔀

- **Cenário testado:** vaso de grama para simulação de captação de dados
- **Resultado esperado:** obter valor da altura de grama pelo menos 80% similar ao valor real
- **Resultado obtido:** O resultado obtido foi de 93% similar ao dado real
- **Status:** Passou

## INSTALANDO DEPENDENCIAS 📦

- `python -m pip install pandas`
- `python -m pip install Flask`
- `python -m pip install flask-cors`
- `python -m pip install pyserial`
- `python -m pip install requests`
- `npm install`
- Chave API da google de mapa e rota

## COMANDO PARA INICIALIZAR O PROJETO ▶️

`npm run dev`

## Telas do APP 📱

| Login | Home | Mapa |
|--|--|--|
| <img width="270" height="600" alt="login" src="https://github.com/user-attachments/assets/65416333-b268-458b-a5a7-00e26197e380" /> | <img width="270" height="600" alt="home" src="https://github.com/user-attachments/assets/b5c99d81-3eaa-44a5-b6ee-894092da735e" /> | <img width="270" height="600" alt="mapa" src="https://github.com/user-attachments/assets/9a11eaf2-d5c0-4cc2-bd7f-af5dd1f27c98" /> |
| Sensores | Ordens de Serviço |
| <img width="270" height="600" alt="sensores" src="https://github.com/user-attachments/assets/d4b4317e-a3e9-441e-9e18-76e104b03263" /> | <img width="270" height="600" alt="OS" src="https://github.com/user-attachments/assets/41fb160e-3110-4171-b7d3-ad65a9d8c318" /> |





