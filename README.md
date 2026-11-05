# Clima Alerta Brasil

Portal informativo de clima e prevenção, desenvolvido como site estático.

## Arquivos
- `index.html`: estrutura e conteúdo.
- `styles.css`: identidade visual e layout responsivo.
- `app.js`: consulta de previsão por cidade.

## Como testar
Abra `index.html` no navegador. A consulta meteorológica usa a API pública da Open-Meteo e precisa de conexão com a internet.

## Publicar no Cloudflare Pages
1. Envie estes arquivos para a raiz do repositório GitHub.
2. No Cloudflare, acesse Workers & Pages > Create > Pages > Connect to Git.
3. Selecione o repositório `clima-alerta-brasil`.
4. Framework preset: `None`.
5. Build command: deixe vazio.
6. Build output directory: `/` (ou `.` se a interface solicitar).
7. Clique em Save and Deploy.

## Fontes e limites
- Previsão: Open-Meteo (https://open-meteo.com/).
- Avisos oficiais: INMET (https://portal.inmet.gov.br/alertas) e Defesa Civil (https://www.gov.br/defesacivil/pt-br).
- Informações institucionais: CPTEC/INPE (https://www.cptec.inpe.br/).

Este site é informativo e não emite alertas oficiais nem substitui serviços de emergência. Os dados meteorológicos podem sofrer alterações. Em situações de risco, siga as orientações da Defesa Civil local.
