FROM mcr.microsoft.com/devcontainers/javascript-node:20
 
ENV PNPM_HOME="$HOME/.local/share/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN mkdir -p $PNPM_HOME && chown node:node $PNPM_HOME

