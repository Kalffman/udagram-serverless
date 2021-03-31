# Serverless - AWS Node.js Typescript

Este projeto foi gerado com o comando `aws-nodejs-typescript` do [Serverless Framework](https://www.serverless.com/)

## Instruções de Instalação/Implantação

Dependendo do seu gerenciador de pacotes, siga as instruções abaixo para levantar o projeto.

> **Requisitos**: NodeJS `12.x` ou superior. 
>
> Deve estar equivalente a versão do ambiente de execução da sua função Lambda da AWS.
>
> **Observações**
>
> Por padrão o projeto está configurado para a região `sa-east-1` **(São Paulo / BR)**

### Usando NPM
 - Execute `npm i` para instalar as dependências.
 - Execute `npx deploy -v --aws-profile <<serverless-profile>> --region <<regiao>>` para deployar a stack para a AWS.

### Usando yarn
 - Execute `yarn` para instalar as dependências.
 - Execute `yarn deploy -v --aws-profile <<serverless-profile>> --region <<regiao>>` para deployar a stack para a AWS.

> **Observações**:
> - A flag `-v` ou `--verbose` corresponde à saída do log da execução do comando ser mais detalhado/verboso
> - Pode usar a própria ferramenta cli `serverless` como alternativa para deploy. [Mais informações](https://www.serverless.com/framework/docs/getting-started/)
> - :warning: Após executado, o deploy da aplicação estará publicamente exposta.
## Testes

Copie e cole a `url` (encontrado ao final da execução de `deploy`) e execute no terminal com o comando `curl` ou usando o postman
ekif1ewtl4

```
curl 'https://<<api-getway-id>>.execute-api.<<aws-region>>.amazonaws.com/dev/groups'
```